const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const output_path = path.resolve(__dirname, "dist");
module.exports = {
    entry: {
        timeline: "./src/js/index.js",
        "timeline.react": "./src/js/index.react.js",
    },
    optimization: {
        usedExports: true
    },
    output: {
        filename: "[name].js",
        path: path.join(output_path, 'js'),
        library: "TL" // https://webpack.js.org/configuration/output/#outputlibrary
    },
    plugins: [
        new CopyPlugin({
            patterns: [{
                    from: "./src/js/language/locale/*.json",
                    to: path.join(output_path, "js/locale/[name][ext]")
                },
                {
                    from: './src/embed/*',
                    to: path.join(output_path, "embed/[name][ext]")
                },
                {
                    // Landing page lives at dist root so its relative paths
                    // (./view.html, ./examples/) resolve against the deployed root.
                    from: './src/template/landing.html',
                    to: path.join(output_path, "index.html")
                },
                {
                    // Full-page viewer (alternative to the iframe embed).
                    from: './src/template/view.html',
                    to: path.join(output_path, "view.html")
                },
                {
                    from: './examples/sample.json',
                    to: path.join(output_path, "examples/sample.json")
                },
                {
                    // Required by MPL-2.0 §3.3 — keep attribution alongside dist.
                    // .txt variant has an explicit MIME so static servers
                    // (some serve extension-less files via 30x redirect).
                    from: './NOTICE',
                    to: path.join(output_path, "NOTICE.txt")
                }
            ]
        }),
        new CleanWebpackPlugin({
            cleanStaleWebpackAssets: true
        }),
    ],
    resolve: {
        extensions: ['.js', '.jsx'],
    },
    module: {
        rules: [{
                test: /\.jsx$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.less$/,
                use: [{
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                            url: true,
                        }
                    },
                    {
                        loader: 'less-loader',
                        options: {
                            sourceMap: true,
                        }
                    },
                ],
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                type: 'asset/resource',
                generator: {
                    filename: '../css/icons/[name][ext]'
                }
            }
        ]
    }
};