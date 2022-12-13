const path = require("path");
// Polyfill all the node stuff
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const packageJson = require("./package.json");

const analyseBundle = process.env.ANALYSE === 'true';
const bundleName = `main-${packageJson.version}`;

if (!bundleName) {
  throw new Error('Bundle name/version is not set');
}

module.exports = {
  devtool: "source-map",
  mode: "production",
  entry: {
    Jupiter: "./src/index.tsx",
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
        filename: `${bundleName}.css`,
        chunkFilename: '[name].css',
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
    path: path.resolve(__dirname, "public"),
    publicPath: "/public/",
    filename: `${bundleName}.js`, // filename are decided by splitChunks default group
  },
  optimization: {
    minimizer: [
      '...', // Include existing minimizer.
      new CssMinimizerPlugin(),
    ],
    minimize: true,
    splitChunks: {
      cacheGroups: {
        // The default bundle of our code
        default: {
          name: 'default',
          filename: `${bundleName}.js`,
          reuseExistingChunk: true,
        },
        // node modules
        vendors: {
          name: 'vendors',
          filename: `${bundleName}.[name].js`,
          chunks: 'all',
          test: /[\\/]node_modules[\\/].*\.js$/,
          reuseExistingChunk: true,
        },
        // Merge and prevent chunking CSS
        styles: {
          name: 'styles',
          test: /\.s?css$/,
          reuseExistingChunk: true,
        },
      }
    },
  }
};
