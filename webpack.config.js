const path = require("path");
// Polyfill all the node stuff
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  mode: "production",
  entry: {
    Jupiter: "./src/widget/index.tsx",
  },
  cache: {
    type: "filesystem",
  },
  module: {
    rules: [
      // Tailwind support
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              // To compile for client
              compilerOptions: {
                "jsx": "react-jsx",
              },
            }
          }
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.svg$/,
        loader: "svg-inline-loader",
      },
      // Some libs are module based
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  plugins: [
    new NodePolyfillPlugin(),
    new MiniCssExtractPlugin({
      filename: "main.css",
    }),
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      fs: false,
    },
    alias: {
      src: path.resolve(__dirname, "src"),
      public: path.resolve(__dirname, "public"),
    },
  },
  target: "web",
  output: {
    library: "Jupiter",
    libraryTarget: "window",
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/dist/",
  },
};
