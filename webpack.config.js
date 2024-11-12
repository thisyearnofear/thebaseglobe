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
      filename: isProduction ? "[name].[contenthash].js" : "bundle.js",
      path: path.resolve(__dirname, "dist"),
      publicPath: "/",
    },

    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction,
            },
          },
        }),
      ],
      splitChunks: {
        chunks: "all",
      },
    },

    devServer: {
      static: {
        directory: path.join(__dirname, "./"),
      },
      hot: false, // Disable Hot Module Replacement
      liveReload: false, // Disable Live Reloading
      open: true,
      port: 8080,
      watchFiles: {
        paths: [
          "**/*.html", // Add any other file types you want to watch
          "**/*.js",
          "**/*.css",
        ],
        options: {
          ignored: [
            "**/node_modules/**",
            "**/dist/**",
            "**/src/components/WalletConnect.js",
            "**/src/components/web3Utils.js",
            "**/src/ethereum/**",
          ],
        },
      },
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
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
              plugins: [],
            },
          },
        },
      ],
    },

    resolve: {
      extensions: [".js"],
      fallback: {
        stream: require.resolve("stream-browserify"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        crypto: require.resolve("crypto-browserify"),
      },
    },

    devtool: "source-map",

    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: "./index.html",
        minify: isProduction
          ? {
              removeComments: true,
              collapseWhitespace: true,
              removeAttributeQuotes: true,
            }
          : false,
      }),
      ...(isProduction
        ? [
            new CompressionPlugin({
              test: /\.(js|css|html|svg)$/,
              algorithm: "gzip",
            }),
          ]
        : []),
    ],
  };
};
