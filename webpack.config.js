const path = require("path");
// Polyfill all the node stuff
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const analyseBundle = process.env.ANALYSE === 'true';

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
  plugins: (() => {
    const plugins = [
      new NodePolyfillPlugin(),
      new MiniCssExtractPlugin({
        filename: "main.css",
      }),
    ];

    if (analyseBundle) {
      plugins.push(new BundleAnalyzerPlugin())
    }

    return plugins;
  })(),
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      fs: false,
    },
    alias: {
      src: path.resolve(__dirname, "src"),
      public: path.resolve(__dirname, "public"),
      './../tokens/solana.tokenlist.json': false
    },
  },
  target: "web",
  output: {
    library: "Jupiter",
    libraryTarget: "window",
    filename: "main.js",
    path: path.resolve(__dirname, "public"),
    publicPath: "/public/",
  },
  optimization: {
    minimizer: [
      '...', // Include existing minimizer.
      new CssMinimizerPlugin(),
    ],
    minimize: true,
  }
};
