import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { deleteAsync } from "del";
import autoprefixer from "autoprefixer";

// 다음 이슈 해결 전까지 postcss-clean v1.2.0 유지
// https://github.com/leodido/postcss-clean/issues/63
import postcssClean from "postcss-clean";

import BrowserSync from "browser-sync";
import { rollup } from "rollup";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { babel as rollupBabel } from "@rollup/plugin-babel";
import stylelint from "stylelint";
import through2 from "through2";
import gulp from "gulp";
import gulpLoadPlugins from "gulp-load-plugins";
import eslint from "gulp-eslint-new";
import { minify } from "terser";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, "dist");
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const { src, dest, series, parallel } = gulp;
const plugins = gulpLoadPlugins({
  // Node v14 이상에서 필요한 옵션. https://github.com/jackfranklin/gulp-load-plugins/releases/tag/v2.0.8
  config: process.env.npm_package_json,
});
const {
  plumberNotifier,
  newer,
  replace,
  inlineSourceHtml: inlineSource,
  fileInclude,
  sourcemaps,
  less,
  postcss,
  terser,
} = plugins;
const bs = BrowserSync.create();

const paths = {
  clean: {
    dist: "dist/",
  },
  markup: {
    base: "./src/",
    src: ["src/**/*.html", "!**/_*/**/*"],
    dist: "dist/",
  },
  image: {
    src: ["src/**/*.{png,jpg,jpeg,gif,mp4}", "!**/_*/**/*"],
    dist: "dist/",
  },
  server: {
    baseDir: "dist/",
  },
  script: {
    src: ["src/**/*.js", "!**/_*/**/*", "!**/_*/*"],
    dist: "dist/",
  },
  style: {
    src: ["src/**/*.less", "!**/_*/**/*", "!**/_*"],
    watch: ["src/**/*.less"],
    dist: "dist/",
  },
};

export const clean = () => deleteAsync([paths.clean.dist]);

export function markup() {
  const REGEX_IMAGE_PATH = /(IMAGE_URL\:.*\@\@)|(\.\.\/images\/)/g;
  const REGEX_IMAGE_URL = /IMAGE_URL:(.*\/)@@/g;
  const REGEX_INDEX = /\/markup\/.*\/(PC|pc|Mobile|mobile)\/index\./g;
  const imagePathCache = {};

  /**
   * HTML 파일 내 IMAGE_URL 주석이 있으면 상대 경로로 참조된 이미지 경로들을 해당 내용으로 치환
   *
   * @param {string} match
   * @returns {string}
   * @example
   * before:
   * ```html
   * <!-- IMAGE_URL:https://images3.kolonmall.com/upload/content/35b559fd-d122-49d2-a849-de9666a774a1/@@ -->
   * <img src="../images/picture.jpg" alt="" />
   * ```
   *
   * after:
   * ```html
   * <img src="https://images3.kolonmall.com/upload/content/35b559fd-d122-49d2-a849-de9666a774a1/picture.jpg" alt="" />
   * ```
   */
  function getImagePath(match) {
    const filePath = this.file.relative;

    if (!imagePathCache[filePath]) {
      imagePathCache[filePath] = match;
    }

    if (REGEX_IMAGE_URL.test(match)) {
      imagePathCache[filePath] = match.replace(REGEX_IMAGE_URL, "$1");
    }

    return imagePathCache[filePath];
  }

  return src(paths.markup.src)
    .pipe(plumberNotifier())
    .pipe(
      plugins.if(
        IS_PRODUCTION,
        inlineSource({
          compress: false,
          rootpath: DIST,
        })
      )
    )
    .pipe(plugins.if(IS_PRODUCTION, replace(REGEX_IMAGE_PATH, getImagePath)))
    .pipe(
      fileInclude({
        prefix: "@@",
        basepath: paths.markup.base,
        indent: true,
      })
    )
    .pipe(
      plugins.if(
        IS_PRODUCTION,
        replace('<script src="../../../assets/js/map.js"></script>', "")
      )
    )
    .pipe(plugins.if(IS_PRODUCTION, replace(REGEX_INDEX, "./index.")))
    .pipe(newer(paths.markup.dist))
    .pipe(dest(paths.markup.dist))
    .pipe(plugins.if(bs.active, bs.stream()));
}

export const scripts = () =>
  src(paths.script.src)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(
      through2.obj(async function (file, _, cb) {
        if (file.isBuffer()) {
          const filePath = file.path;
          const bundle = await rollup({
            input: filePath,
            plugins: [
              nodeResolve({
                browser: true,
              }),
              commonjs(),
              rollupBabel({
                exclude: "node_modules/core-js/**",
                babelHelpers: "bundled",
              }),
            ],
          });
          const { output } = await bundle.generate({
            format: "umd",
          });
          const bundledCode = output[0].code;
          file.contents = Buffer.from(bundledCode);

          cb(null, file);
          return;
        }
        cb();
      })
    )
    .pipe(newer(paths.script.dist))
    .pipe(
      plugins.if(
        IS_PRODUCTION,
        terser(
          {
            mangle: false,
          },
          minify
        )
      )
    )
    .pipe(dest(paths.script.dist));

export const style = function () {
  const postcssPlugins = [
    stylelint(),

    /**
     * IE grid 지원을 위한 `{ grid: "autoplace" }` 옵션은 아래와 같이 필요한 파일에만
     * 제어 주석으로 활성화할 것
     * `\/*! autoprefixer grid: autoplace *\/` (`\` 없이 사용할 것)
     */
    autoprefixer(),
  ];

  if (IS_PRODUCTION) {
    postcssPlugins.push(
      postcssClean({
        aggressiveMerging: false,
        restructuring: false,
        format: "keep-breaks",
      })
    );
  }

  return src(paths.style.src)
    .pipe(plumberNotifier())
    .pipe(newer(paths.style.dist))
    .pipe(plugins.if(!IS_PRODUCTION, sourcemaps.init()))
    .pipe(less())
    .pipe(postcss(postcssPlugins))
    .pipe(plugins.if(!IS_PRODUCTION, sourcemaps.write(".")))
    .pipe(dest(paths.style.dist));
};

export const image = () =>
  src(paths.image.src)
    .pipe(plumberNotifier())
    .pipe(newer(paths.image.dist))
    .pipe(dest(paths.image.dist));

const server = () => {
  bs.init({
    server: {
      baseDir: paths.server.baseDir,
      directory: true,
    },
    startPath: "/",
    files: [
      paths.markup.dist + "**/*.html",
      paths.style.dist + "**/*.css",
      paths.script.dist + "**/*.js",
      paths.image.dist + "**/*.{png,jpg,jpeg,gif}",
    ],
    ghostMode: false,
    notify: false,
  });
};

const watch = () => {
  gulp.watch(paths.style.src, series(style, markup));
  gulp.watch(paths.script.src, series(scripts, markup));
  gulp.watch(paths.image.src, image);
  gulp.watch(paths.markup.src, markup);
};

const tasks = [clean, parallel(style, scripts, image), markup];

if (!IS_PRODUCTION) {
  tasks.push(parallel(server, watch));
}

export default series(...tasks);
