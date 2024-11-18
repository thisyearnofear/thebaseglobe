// webpack.config.js

const path = require("path");

module.exports = {
  mode: "development",
  entry: "./game.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/dist/",
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "./"),
    },
    hot: false,
    liveReload: false, // Disable live reloading
    open: true,
    port: 8080,
    watchFiles: {
      // Configure which files to watch
      paths: ["src/**/*.js", "game.js"],
      options: {
        ignored: ["**/node_modules/**", "**/WalletConnect.js"],
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
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".js"],
  },
  devtool: "source-map",
};
