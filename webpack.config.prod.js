const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "production",
  entry: {
    main: "./game.js",
    MusicPlayer: "./src/components/MusicPlayer.js",
  },
  output: {
    filename: "js/[name].[contenthash].js",
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
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "audio", to: "audio" },
        { from: "models", to: "models" },
        { from: "public", to: "assets" },
        { from: "game.css", to: "game.css" },
        {
          from: "index.html",
          to: "index.html",
          transform(content) {
            return content
              .toString()
              .replace(
                'type="module">\n      import MusicPlayer from "./src/components/MusicPlayer.js"',
                'type="module" src="/js/MusicPlayer.[contenthash].js"'
              );
          },
        },
      ],
    }),
  ],
  optimization: {
    moduleIds: "deterministic",
    runtimeChunk: "single",
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};
