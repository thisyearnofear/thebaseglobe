const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");

// Determine if we're in production mode
const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  mode: isProduction ? "production" : "development",
  entry: "./game.js",
  output: {
    filename: isProduction ? "[name].[contenthash].js" : "main.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "",
    clean: true,
  },
  module: {
    rules: [
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
            plugins: ["@babel/plugin-transform-runtime"],
          },
        },
      },
      {
        test: /\.(mp3|wav)$/i,
        type: "asset/resource",
        generator: {
          filename: "audio/[name][ext]",
        },
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: "asset/resource",
        generator: {
          filename: "images/[name][ext]",
        },
      },
      {
        test: /\.(obj|mtl|gltf|glb)$/i,
        type: "asset/resource",
        generator: {
          filename: "models/[name][ext]",
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "./index.html",
      filename: "index.html",
      inject: "body",
      minify: isProduction
        ? {
            removeComments: true,
            collapseWhitespace: true,
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
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "public",
          to: "",
          noErrorOnMissing: true,
        },
        {
          from: "audio",
          to: "audio",
          noErrorOnMissing: true,
        },
        {
          from: "models",
          to: "models",
          noErrorOnMissing: true,
        },
        {
          from: "*.css",
          to: "[name][ext]",
        },
        {
          from: "*.png",
          to: "[name][ext]",
        },
      ],
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
  resolve: {
    extensions: [".js"],
    alias: {
      "@": path.resolve(__dirname, "src/"),
      components: path.resolve(__dirname, "src/components/"),
      utils: path.resolve(__dirname, "src/utils/"),
      managers: path.resolve(__dirname, "src/managers/"),
    },
  },
  optimization: {
    minimize: isProduction,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: isProduction,
            drop_debugger: isProduction,
          },
        },
      }),
    ],
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
    moduleIds: "deterministic",
  },
  performance: {
    hints: isProduction ? "warning" : false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  devtool: isProduction ? "source-map" : "eval-source-map",
};
