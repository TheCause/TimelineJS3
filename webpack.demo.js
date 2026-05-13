// Webpack config dedicated to the React skin demo. Kept separate so it
// doesn't perturb the main library build (dist/js/timeline.js).
const path = require('path');

module.exports = {
    mode: 'production',
    entry: './examples/react-archive.entry.jsx',
    output: {
        filename: 'react-archive.bundle.js',
        path: path.resolve(__dirname, 'examples/dist'),
    },
    resolve: {
        extensions: ['.js', '.jsx'],
    },
    module: {
        rules: [{
            test: /\.jsx$/,
            exclude: /node_modules/,
            use: { loader: 'babel-loader' },
        }],
    },
    performance: {
        // Bundle embeds React; size warnings would just be noise for a demo.
        hints: false,
    },
};
