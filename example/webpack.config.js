/**
 * Webpack configuration for the react-native-web build of the example app.
 * https://necolas.github.io/react-native-web/docs/setup/
 */

const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const appDirectory = __dirname;

// Only the app's own sources need Babel: react-native-web ships compiled
// CJS/ESM and the library resolves to its tsc output.
const babelLoaderConfiguration = {
  test: /\.[jt]sx?$/,
  include: appDirectory,
  exclude: /node_modules/,
  use: {
    loader: "babel-loader",
    options: {
      cacheDirectory: true,
      presets: ["module:@react-native/babel-preset"],
    },
  },
};

const imageLoaderConfiguration = {
  test: /\.(gif|jpe?g|png|svg|ttf|otf|woff2?)$/,
  type: "asset/resource",
};

module.exports = (_env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    entry: path.resolve(appDirectory, "index.web.js"),

    output: {
      path: path.resolve(appDirectory, "dist-web"),
      filename: isProduction
        ? "[name].[contenthash].bundle.js"
        : "[name].bundle.js",
      publicPath: "/",
      clean: true,
    },

    module: {
      rules: [babelLoaderConfiguration, imageLoaderConfiguration],
    },

    resolve: {
      alias: {
        "react-native$": "react-native-web",
      },
      // Platform extensions: `.web.*` wins over the shared implementation.
      extensions: [
        ".web.tsx",
        ".web.ts",
        ".web.jsx",
        ".web.js",
        ".tsx",
        ".ts",
        ".jsx",
        ".js",
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(appDirectory, "public/index.html"),
      }),
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(!isProduction),
        "process.env.NODE_ENV": JSON.stringify(argv.mode ?? "development"),
      }),
    ],

    devServer: {
      static: path.resolve(appDirectory, "public"),
      historyApiFallback: true,
      hot: true,
      port: 3000,
    },

    devtool: isProduction ? "source-map" : "eval-source-map",
  };
};
