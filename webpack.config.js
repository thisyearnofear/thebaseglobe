const path = require("path");

module.exports = {
  mode: "development",
  entry: {
    main: "./game.js",
    player: "./src/components/MusicPlayer.js", // Add MusicPlayer entry point
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/", // Changed to match prod
    library: {
      type: "window", // Makes bundles available on window object
    },
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "./"),
    },
    hot: false,
    liveReload: false,
    open: true,
    port: 8080,
    historyApiFallback: true, // Added to handle client-side routing
    headers: {
      // Added to match prod MIME types
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/javascript; charset=utf-8",
    },
    allowedHosts: "all",
    client: {
      webSocketURL: "auto://0.0.0.0:0/ws",
    },
    watchFiles: {
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
        test: /\.(png|svg|jpg|jpeg|gif|mp3)$/i, // Added mp3
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
