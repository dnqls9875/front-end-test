
// 프로젝트 전역 Babel 설정
// node_modules 내에 있는 패키지에도 플러그인 등을 적용하고 자 할때 사용
// https://babeljs.io/docs/en/config-files#project-wide-configuration
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
        corejs: '3.20'
      },
    ],
  ],
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: 3,
      },
    ],
  ],
};