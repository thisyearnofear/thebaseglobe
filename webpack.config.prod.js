const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "production",
  entry: "./game.js",
  output: {
    filename: "bundle.[contenthash].js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
    clean: true,
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
          filename: "assets/[name][ext]",
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
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "audio",
          to: "audio",
        },
        {
          from: "models",
          to: "models",
        },
        {
          from: "public",
          to: "assets",
        },
        {
          from: "game.css",
          to: "game.css",
        },
        {
          from: "index.html",
          to: "index.html",
        },
      ],
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};
