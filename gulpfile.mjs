import gulp from 'gulp';
import plumberNotifier from 'gulp-plumber-notifier';
import newer from 'gulp-newer';
import gulpif from 'gulp-if'
import inlineSource from 'gulp-inline-source-html';
import fileinclude from 'gulp-file-include';
import autoprefixer from 'autoprefixer';
import once from 'gulp-once';
import less from 'gulp-less';
// import gulpStylelint from '@ronilaukkarinen/gulp-stylelint';
import postcss from 'gulp-postcss';
import BrowserSync from 'browser-sync';
import path from 'path';
import {deleteAsync} from 'del';
import postcssClean from 'postcss-clean';

// rollup
import { rollup } from 'rollup';
import { terser } from 'rollup-plugin-terser'; // minify plugin
import { babel } from '@rollup/plugin-babel'; // babel plugin
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
// import stylelint from 'stylelint';

const { series, src, parallel, dest, watch } = gulp;

const env = process.env;
const isProduction = env.NODE_ENV === 'production';
const isDeep = env.WORK_MODE === 'deep';

// browserSync server
const bs = BrowserSync.create();

const DIR = {
  clean:{
    dist: 'dist/'
  },
  markup: {
    base: './src/',
    src: ['src/**/*.html', '!**/_*/**/*'],
    dist: 'dist/'
  },
  script:{
    src:['src/assets/js/**/*','src/assets/js/*', '!src/assets/js/_*'],
    dist: 'dist/assets/js/planCommon.v2.js',
  },
  scripts:[
    {
      name: 'planCommon',
      src:'src/assets/js/planCommon.v2.js',
      dist: 'dist/assets/js/planCommon.v2.js',
    }
  ],
  style:{
    src:['src/**/*.less', '!**/_*/**/*', '!**/_*'],
    watch: ['src/**/*.less'],
    dist: 'dist/',
  },
  copyFiles: {
    src: ['src/**/*.css', 'src/**/lf_files/*.js', 'src/**/*.{png,jpg,jpeg,gif}', '!**/_*/**/*'],
    dist: 'dist/'
  },
  server:{
    baseDir: 'dist/'
  },
}


/**
 * html 처리
 */
const markup = () => {
  return src(DIR.markup.src)
    .pipe(plumberNotifier())
    .pipe(
      gulpif(
        isDeep,
        inlineSource({
          compress: false,
          rootpath: path.resolve('dist/'),
        })
      )
    )
    .pipe(
      fileinclude({
        prefix: '@@',
        basepath: DIR.markup.base,
        indent: true
      })
    )
    .pipe(newer(DIR.markup.dist))
    .pipe(dest(DIR.markup.dist))
    .pipe( gulpif(bs.active, bs.stream()) );
}


/**
 * less 처리
 */
const style = () =>{
  return src(DIR.style.src)
    .pipe(once())
    .pipe(plumberNotifier())
    .pipe(less())
    // .pipe(gulpStylelint({
    //   failAfterError: false
    // }))
    // .pipe(csslint('.csslintrc'))
    // .pipe(csslint.formatter())
    // .pipe(csslint.formatter('fail'))
    .pipe(postcss([autoprefixer()]))
    .pipe(
      postcss([
        postcssClean({
          aggressiveMerging: false,
          restructuring: false,
          format: 'keep-breaks'
        })
      ])
    )
    .pipe(dest(DIR.style.dist));
};


/**
 * javascript 처리
 */
const rollupDefault = [
  nodeResolve(),
  commonjs(),
  babel({
    babelHelpers: 'runtime',
    exclude: [/node_modules/],
    include: [
      "./src/**/*.js",
      /node_modules\/intersection\-observer/,
      /node_modules\/swiper/,
      /node_modules\/dom7/,
    ],
    babelrc: false
  }),
]
const rollupDev = [
  ...rollupDefault,
];
const rollupProduct = [
  ...rollupDefault,
  terser()
];
async function script(){
  const plugins = isProduction ? rollupProduct : rollupDev;
  const bundles = DIR.scripts.map(async ({ name, src, dist }) => {
    const bundle = await rollup({
      input: src,
      // external: [/@babel\/runtime-corejs/],
      plugins
    });
    return bundle.write({
      name,
      file: dist,
      sourcemap: true,
      format: 'umd'
    }).then(() => {
      console.log(`${src} => ${dist}`);
    });
  });

  return Promise.allSettled(bundles).then(() => {
    bs.reload();
  });
};

/**
 * copy files
 */
function copyFiles(){
  return gulp
    .src(DIR.copyFiles.src)
    .pipe(plumberNotifier())
    .pipe(newer(DIR.copyFiles.dist))
    .pipe(gulp.dest(DIR.copyFiles.dist));
};

/**
 * server ( browserSync)
 */
const defalutFiles = [
  DIR.markup.dist + '**/*.html'
];
const deepFiles = [
  DIR.style.dist + '**/*.css',
  'dist/**/*.js',
]
const files = isDeep ? [...defalutFiles, ...deepFiles] : defalutFiles;
const server = () => {
  bs.init({
    server: {
      baseDir: DIR.server.baseDir,
      directory: true
    },
    cors: true,
    startPath: '/',
    files,
    ghostMode: false,
    notify: false
  });
}


/**
 * dist 디렉토리 삭제
 */
const clean = () => deleteAsync([ DIR.clean.dist, './.checksums' ]);

/**
 * watch
 * normal : html 만 watch
 * deep : html, less, js 파일 watch
 */
const _watch = ()=> {
  watch(DIR.markup.src, series([markup]));
  if( isDeep ) {
    watch(DIR.style.src, series([style, markup]));
    watch(DIR.script.src, script);
  }
}
// parallel(server, _watch)
// markup
const baseTask = [clean, copyFiles ];
const deepTask = [series(style, markup), script];
let task = [];
if( !isProduction ){
  if( isDeep ){
    task = [...baseTask, ...deepTask, parallel(server, _watch)];
  } else {
    task = [...baseTask, markup, parallel(server, _watch)];
  }
} else {
  task = [...baseTask, ...deepTask]
}

/**
 * gulp task set
 */

export {clean, markup, style, script, server};
export default series([...task]);