/**
 * This is the file that Webpack is compiling into editor_blocks.js
 */

/**
 * Internal dependencies
 */
import './format-types'
import './plugins'
import './help'
import './compatibility'
import { SVGStackableCategoryIcon } from './icons'

/**
 * External dependencies
 */
import registerBlock from '~stackable/register-block'
import { i18n } from 'stackable'

/**
 * WordPress dependencies
 */
import {
	registerBlockCollection,
} from '@wordpress/blocks'
import { __ } from '@wordpress/i18n'

// Register our block collection.
registerBlockCollection( 'ugb', {
	title: __( 'Stackable', i18n ),
	icon: SVGStackableCategoryIcon,
} )

// Import all index.js and register all the blocks found (if name & settings are exported by the script)
const importAllAndRegister = r => {
	r.keys().forEach( key => {
		const { name, settings } = r( key )
		try {
			return name && settings && registerBlock( name, settings )
		} catch ( error ) {
			console.error( `Could not register ${ name } block` ) // eslint-disable-line
		}
	} )
}

importAllAndRegister( require.context( './block', true, /index\.js$/ ) )
