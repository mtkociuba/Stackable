const externals = require( './externals' )
const rules = require( './rules' )
const plugins = require( './plugins' )
const path = require( 'path' )
const fs = require( 'fs' )

// console.log(env.block)

const blocks = fs.readdirSync( './src/block', { withFileTypes: true } )
	.filter(item => item.isDirectory())
	.map(item => item.name)

console.log(blocks)

module.exports = [ {

    mode: 'development',

    devtool: 'cheap-module-source-map',

	entry: {
        'editor_blocks_accordion': path.resolve( __dirname, '../src/block-accordion.js' ),
    },

	output: {
		filename: '[name].js',
	    library: '[name]',  // it assigns this module to the global (window) object
    },

    // Permit importing @wordpress/* packages.
    externals,

    optimization: {
        splitChunks: {
			cacheGroups: {
				vendor: {
					test: /node_modules/,
					chunks: "initial",
					name: "editor_vendor",
					priority: 10,
					enforce: true
				}
			}
        },
    },

    resolve: {
        alias: {
            '~stackable': path.resolve( __dirname, '../src/' )
        }
    },

    // Clean up build output
	stats: {
		all: false,
		assets: true,
		colors: true,
		errors: true,
		performance: true,
		timings: true,
		warnings: true,
    },

	module: {
        strictExportPresence: true,
        rules,
	},

	plugins,
// },
// {
//     mode: 'development',

//     devtool: 'cheap-module-source-map',

// 	entry: {
// 		'frontend_blocks': path.resolve( __dirname, '../src/block-frontend.js' ),
// 		'admin_welcome': path.resolve( __dirname, '../src/welcome/admin.js' ),
//     },

// 	output: {
// 		filename: '[name].js',
// 	    library: '[name]',  // it assigns this module to the global (window) object
//     },

//     // Permit importing @wordpress/* packages.
//     externals,

//     resolve: {
//         alias: {
//             '~stackable': path.resolve( __dirname, '../src/' )
//         }
//     },

//     // Clean up build output
// 	stats: {
// 		all: false,
// 		assets: true,
// 		colors: true,
// 		errors: true,
// 		performance: true,
// 		timings: true,
// 		warnings: true,
//     },

// 	module: {
//         strictExportPresence: true,
//         rules,
// 	},

// 	plugins,
} ]
