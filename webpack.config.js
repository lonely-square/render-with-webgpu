const path = require("path");
const bundleOutputDir = "./dist";
const CopyPlugin = require("copy-webpack-plugin");
const {VueLoaderPlugin} = require("vue-loader")

module.exports = {
    entry: {
        main: "./src/index"  
    },
    output: {
        filename: "[name].bundle.js",
        path: path.join(__dirname, bundleOutputDir),
        publicPath: 'public/dist/'
    },
    devtool: "inline-source-map", //开发环境中使用
    resolve: {
        extensions: ['.js', '.ts' ]
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: ['/node_modules/']
            },            
            { 
                test: /\.tsx?$/,
                loader: "ts-loader" ,
                options:{
                    appendTsSuffixTo: [/\.vue$/],
                }   
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.wgsl$/,
                use: [
                  {
                    loader: 'ts-shader-loader',
                  },
                ],
            },
            {
                test: /\.vue$/i,
                use:[{ loader: 'vue-loader'}]
            },
            {
                test: /\.obj$/i,
                use:[{ loader: 'file-loader'}]
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
                use: [{ loader: 'file-loader'}]
            }
        ]
    },
    plugins: [
        new CopyPlugin({
          patterns: [
            { from:  'src/model',
              to: 'model'
            },
          ],
        }),
        new VueLoaderPlugin()
    ],
};

