const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    mode: isProduction ? "production" : "development",
    entry: "./game.js",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: isProduction ? "js/[name].[contenthash:8].js" : "bundle.js",
      publicPath: isProduction ? "/" : "/dist/",
      clean: true,
    },

    devServer: {
      static: {
        directory: path.join(__dirname, "/"),
      },
      compress: true,
      port: 8080,
      hot: false,
      liveReload: false,
    },

    externals: {
      three: "THREE",
      gsap: "gsap",
      web3: "Web3",
    },

    module: {
      rules: [
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: "asset/resource",
          generator: {
            filename: "assets/[name].[hash:8][ext]",
          },
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    useBuiltIns: "usage",
                    corejs: 3,
                    targets: "> 0.25%, not dead",
                  },
                ],
              ],
              plugins: [],
              cacheDirectory: true,
            },
          },
        },
      ],
    },

    resolve: {
      extensions: [".js"],
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
      fallback: {
        stream: require.resolve("stream-browserify"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        crypto: require.resolve("crypto-browserify"),
      },
    },

    devtool: isProduction ? false : "source-map",

    performance: {
      hints: isProduction ? "warning" : false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },

    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: "./index.html",
        minify: isProduction
          ? {
              removeComments: true,
              collapseWhitespace: true,
              removeAttributeQuotes: true,
              removeRedundantAttributes: true,
              useShortDoctype: true,
              removeEmptyAttributes: true,
              removeStyleLinkTypeAttributes: true,
              keepClosingSlash: true,
              minifyJS: true,
              minifyCSS: true,
              minifyURLs: true,
            }
          : false,
        filename: "index.html",
        inject: true,
      }),
      ...(isProduction
        ? [
            new CompressionPlugin({
              test: /\.(js|css|html|svg)$/,
              algorithm: "gzip",
              threshold: 10240,
              minRatio: 0.8,
              deleteOriginalAssets: false,
            }),
          ]
        : []),
    ],

    stats: {
      colors: true,
      hash: true,
      timings: true,
      assets: true,
      chunks: true,
      chunkModules: false,
      modules: false,
      children: false,
    },
  };
};
