/**
 * BLOCK: Subtitle Block.
 */
/**
 * External dependencies
 */
import { SubtitleIcon } from '~stackable/icons'

/**
 * Internal dependencies
 */
import edit from './edit'
import save from './save'
import schema from './schema'
import metadata from './block.json'

export const settings = {
	...metadata,
	icon: SubtitleIcon,
	attributes: schema,
	supports: {
		anchor: true,
	},

	edit,
	save,
}
