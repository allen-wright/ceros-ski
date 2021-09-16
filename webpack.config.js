const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

// Webpack Configuration
const config = {

    entry: ['./src/index.js'],

    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'bundle.js',
    },

    module: {
        rules : [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            }
        ]
    },

    plugins: [
        new htmlWebpackPlugin({
            title: 'Ceros Ski',
            template: 'src/index.html'
        }),
        new CopyPlugin({
            patterns: [
                {from: 'img/*', to: ''}
            ]
        })
    ],
};

module.exports = config;