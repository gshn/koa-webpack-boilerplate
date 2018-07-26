# 최신 ECMAScript 이용한 koa server & webpack client boilerplate

## babel과 eslint, nodemon, sass, webpack을 활용한 koa 프로젝트 세팅법을 소개 합니다.

> **babel**을 통해서 최신의 **ECMAScript**로 프로젝트를 진행하면 생산성도 높고 코드 가독성(콜백 지옥 탈출!)이 매우 높습니다.<br>
> **eslint**를 활용하면 코드 품질을 향상시키고, 코드를 모두와 함께 공유하기 좋은 상태를 유지 할 수 있습니다.<br>
> **nodemon**이 포함되면 소스코드 수정시 프로세스 중지 재시작 없이 자동으로 가능합니다.<br>
> **css-loader**, **node-sass**를 이용한 **css** 전처리 작업을 포함하면 프론트엔드 작업 생산성을 극대화 할 수 있습니다.<br>
> 위의 과정을 한 번에 정리해주는 **webpack**을 적용합니다. **webpack**에는 스크립트와 **css**를 **optimize**하는 작업과 압축하는 과정이 포함됩니다.<br>
> 최신 **ECMAScript**와 가장 잘 어울리는 프레임워크인 **koa**를 서버로 두고, **ejs**를 프론트엔드에 적용 합니다.

## 1. app 디렉터리 생성 및 npm init 및 koa 설치

> package.json을 생성하고, koa 기본 모듈 및 서버와 클라이언트 단에서 사용할 패키지 설치<br>
> 만약 존재 한다면 이 단계는 생략 가능

```bash
$ mkdir koa-webpack-boilerplate
$ cd koa-webpack-boilerplate && npm init -y

// server단 source와 client단 source 분리
$ mkdir -p src/server
$ mkdir -p src/client

// koa와 관련 모듈 설치
$ npm i koa koa-body koa-logger koa-router koa-session koa-views

// DB 접속이 필요하다면
$ npm i mysql2

// 클라이언트에서 자주 쓰는 라이브러리 모음
$ npm i axios bootstrap ejs jquery moment popper.js

```

```bash
// 기존 프로젝트가 있었다면
$ git clone https://github.com/gshn/koa-webpack-boilerplate
$ cd koa-webpack-boilerplate && npm install
```

## 2. babel

### babel 패키지 설치

> babel을 이용해서 client단의 스크립트는 트랜스컴파일을 수행하고, server단 스크립트는 최신 ECMAScript를 활용할 수 있도록 세팅을 합니다.

```bash
$ npm i -D babel-loader babel-plugin-syntax-async-functions babel-plugin-transform-async-to-generator babel-preset-es2015-node5 babel-preset-stage-0 babel-register
```

### .babelrc 파일 생성

> .babelrc 파일을 생성해서 아래와 같이 입력후 저장합니다.

```json
{
  "presets": ["es2015-node5"],
  "plugins": [
    "transform-async-to-generator",
    "syntax-async-functions"
  ]
}
```

## 3. koa 예제코드 실행 (server source 관리)

### nodemon 패키지 설치

> nodemon을 이용해서 development 환경에서 소스 수정시 자동으로 리로드가 되도록 구성을 합니다.<br>
> babel을 통해서 **import** 이용한 문법을 활용하는 방식을 적용합니다.

```bash
$ npm i -D nodemon
```

### package.json 수정

> npm run dev 명령시 수행할 스크립트 입니다.

```json
{
  // ...
  "scripts": {
    "dev": "SET NODE_ENV=development && SET PORT=8080 && nodemon app.js"
  },
  // ...
}
```

### app.js 파일 생성

> server app의 진입점이 되는 파일입니다.

```js
require('babel-core/register')
const app = require('./src/server')
```

### src/server/index.ejs 파일 생성

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>wallet.rdlab.club</title>
  <link href="/dist/main.css?<%=global.cache%>" rel="stylesheet">
  <link href="/dist/fontawesome/css/fontawesome-all.min.css" rel="stylesheet">
</head>
<body class="bg-light">
  <h1><%=title%></h1>
  <script src="/dist/build.js?<%=global.cache%>"></script>
</body>
</html>
```

### src/server/index.js 파일 생성

> koa를 기본적으로 구동하는 소스 입니다.

```js
import path from 'path'

import Koa from 'koa'
import logger from 'koa-logger'
import koaBody from 'koa-body'
import session from 'koa-session'
import Router from 'koa-router'
import views from 'koa-views'

const app = new Koa()

// Real ip get
app.proxy = true

// koa-session config
app.keys = ['secretSessionKey']
app.use(session({
  key: 'koa:sess',
  maxAge: 1200000,
  overwrite: true,
  httpOnly: true,
  signed: true,
  rolling: false,
  renew: false,
}, app))

app.use(logger())
app.use(koaBody())

// views
const render = views(path.join(__dirname), {
  extension: 'ejs',
})
app.use(render)

// router
const router = new Router()
router.get('/', async (ctx) => {
  await ctx.render('index', { title: 'hello koa!' })
})
app.use(router.routes())

app.listen(process.env.port || 8080, () => console.log(`server started http://localhost:${process.env.port || 8080}`))

export default app

// 프로그램 실행 환경 변수 설정
process.env.NODE_ENV = process.env.NODE_ENV && (process.env.NODE_ENV).trim().toLowerCase() === 'development' ? 'development' : 'production'

// 프로세스 실행 시간 기준으로 cache 갱신
global.cache = (new Date()).valueOf().toString()

```

### npm run dev 실행

> 아래와 같이 나온다면 서버 구동에 성공!<br>
> 이제 **import**, **async** 와 같은 키워드를 이용해서 코딩을 할 수 있습니다!

```bash
$ npm run dev

> webpack-app@1.0.0 dev D:\git\webpack-app
> SET NODE_ENV=development && SET PORT=8080 && nodemon app.js

[nodemon] 1.18.3
[nodemon] to restart at any time, enter `rs`
[nodemon] watching: *.*
[nodemon] starting `node app.js`
server started http://localhost:8080

```

## 4. webpack

### webpack 관련 패키지 설치

> **webpack** 을 이용해서 ES6로 코딩된 javascript 와 scss를 트랜스컴파일 과정을 거치고 최적화도 수행하는 설정입니다.

```bash
$ npm i -D css-loader mini-css-extract-plugin node-sass optimize-css-assets-webpack-plugin sass-loader style-loader webpack webpack-cli
```

### webpack.config.js 파일 생성

> webpack.config.js 파일을 생성해서 아래와 같이 입력후 저장합니다.

```javascript
const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = {
  entry: './src/client/',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: 'build.js'
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader"
        ]
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve('src')
    },
    extensions: ['*', '.js', '.json', '.scss']
  },
  devServer: {
    historyApiFallback: {
      index: '/dist/'
    },
    noInfo: true,
    overlay: true
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map',
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
  ]
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new OptimizeCSSAssetsPlugin({}),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}
```

## 5. webpack을 이용한 client assets 예제코드 실행 (client source 관리)

### cilent/modules/example.js 예제 

> 예제로 사용할 모듈을 작성해서 export 해줍니다.

```javascript
/**
 * 예제  모듈
 *
 * @module src/client/modules/example
 */
import axios from 'axios'

const example = async () => {
  let res
  try {
    res = await axios({
      method: 'get',
      url: '/',
    })
  } catch (err) {
    console.log(err)
    return false
  }

  return res.data
}

export default example

```

### client/scss/app.scss 예제 생성

```scss
@import 'node_modules/bootstrap/scss/bootstrap';

$maxiConsoleHeight: calc(100vh - 6.5rem);

html {
  height: $maxiConsoleHeight;
}

```

### client/index.js 파일 생성

> client javascript 의 start point를 생성합니다.<br>
> **import** 와 같은 ES 지시어를 사용해서 코딩이 가능합니다.

```javascript
/**
 * client javascript 및 scss 소스 파일
 * webpack을 통해서 dist/ 에 번들링 수행
 */
import './scss/app.scss'
import example from './modules/example'

example()
```

### package.json 수정

> **npm run watch** 명령어를 통해서 webpack을 실행합니다.

```json
{
  // ...
  "scripts": {
    "build": "SET NODE_ENV=development && webpack --config webpack.config.js",
    "watch": "npm run build -- --watch",
  },
  // ...
}
```

### npm run watch 실행

```bash
$ npm run watch

> webpack-app@1.0.0 watch D:\git\webpack-app
> npm run build -- --watch


> webpack-app@1.0.0 build D:\git\webpack-app
> webpack --config webpack.config.js "--watch"


webpack is watching the files…

Hash: 98a0ce14d9ef782cfe18
Version: webpack 4.16.2
Time: 1648ms
Built at: 2018-07-25 18:25:42
   Asset     Size  Chunks             Chunk Names
main.css  155 KiB       0  [emitted]  main
build.js  130 KiB       0  [emitted]  main
Entrypoint main [big] = main.css build.js
 [7] ./src/client/index.js 339 bytes {0} [built]
 [8] ./src/client/scss/app.scss 39 bytes {0} [built]
[10] ./src/client/modules/example.js 2.96 KiB {0} [built]
    + 28 hidden modules

WARNING in configuration
The 'mode' option has not been set, webpack will fallback to 'production' for this value. Set 'mode' option to 'development' or 'production' to enable defaults for each environment.
You can also set it to 'none' to disable any default behavior. Learn more: https://webpack.js.org/concepts/mode/
Child mini-css-extract-plugin node_modules/css-loader/index.js!node_modules/sass-loader/lib/loader.js!src/client/scss/app.scss:
    Entrypoint mini-css-extract-plugin = *
    [0] ./node_modules/css-loader!./node_modules/sass-loader/lib/loader.js!./src/client/scss/app.scss 161 KiB {0} [built]
        + 1 hidden module

```

> 위와 같은 결과가 나오고 **dist/** 디렉터리에 빌드가 된 파일이 생성된다면 정상!

## 6. eslint 적용

> vscode에서 eslint 확장팩을 설치하고 재시작하면 eslint를 수행할 수 있습니다.

### eslint 패키지 설치

```bash
$ npm i -D eslint eslint-config-airbnb eslint-config-airbnb-base eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react
```

### .eslintrc 파일 생성

```json
{
  "extends": "airbnb",
  "rules": {
    "semi": [
      "error",
      "never"
    ],
    "linebreak-style": 0,
    "no-await-in-loop": 0
  }
}
```

## 7. 그 후..

> nginx로 /dist 디렉터리 파일들을 서비스 해야 합니다.<br>
> production으로 가면 새로운 npm run production 스크립트를 생성해서 대응합니다.<br>
> 그 외에는 프로젝트에 따라서 분리해서 구현하면 됩니다. 끗! :)
