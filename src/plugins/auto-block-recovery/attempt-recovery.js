import {
	select, dispatch,
} from '@wordpress/data'
import {
	parse, createBlock, isReusableBlock,
} from '@wordpress/blocks'
import { isInvalid } from './is-invalid'
import reusableBlocksReadyPromise from './reusable-blocks-ready-promise'

// Add some styles to hide the flash of errored blocks.
const disableBlockWarnings = () => {
	const warningStyle = document.createElement( 'style' )
	warningStyle.setAttribute( 'id', 'ugb-disable-block-warnings' )
	warningStyle.innerHTML = '.has-warning[data-type^="ugb/"] { opacity: 0 !important; }'
	document.body.appendChild( warningStyle )
}

// Remove the styles that hides the flash of errored blocks.
const enableBlockWarnings = () => {
	const warningStyle = document.querySelector( '#ugb-disable-block-warnings' )
	if ( warningStyle ) {
		document.body.removeChild( warningStyle )
	}
}

// Runs an auto-attempt recovery on all the blocks.
export const autoAttemptRecovery = () => {
	// Since we're doing this inside a timeout, there will be a flash of errored
	// blocks momentarily, let's hide these until the recovery is done.
	disableBlockWarnings()

	// We need to do this inside a timeout since when calling this, the Block
	// Editor might not be ready yet with the contents or might not have
	// initialized yet.
	setTimeout( () => {
		// Recover all the blocks that we can find.
		const mainBlocks = recoverBlocks( select( 'core/editor' ).getEditorBlocks() )

		recoverReusableBlocks()

		// Replace the recovered blocks with the new ones.
		mainBlocks.forEach( block => {
			if ( block.recovered && block.replacedClientId ) {
				dispatch( 'core/block-editor' ).replaceBlock( block.replacedClientId, block )
			}
		} )

		enableBlockWarnings()
	}, 0 )
}

// Recursive fixing of all blocks. This doesn't actually fix any blocks in the
// editor, but instead creates a new set of fixed blocks based on the given
// blocks. The replaced blocks will have a `recovered` that's `true` and a
// `replacedClientId` that contains the block it replaced.
//
// It's not the responsibility of this function to manipulate the editor.
export const recoverBlocks = blocks => {
	return blocks.map( block => {
		if ( block.innerBlocks && block.innerBlocks.length ) {
			const newInnerBlocks = recoverBlocks( block.innerBlocks )
			if ( newInnerBlocks.some( block => block.recovered ) ) {
				block.innerBlocks = newInnerBlocks
				block.replacedClientId = block.clientId
				block.recovered = true
			}
		}

		if ( isReusableBlock( block ) ) {
			addAutoRecoverReusableBlock( block )
		}

		if ( isInvalid( block ) ) {
			const newBlock = recoverBlock( block )
			newBlock.replacedClientId = block.clientId
			newBlock.recovered = true
			console.log( 'Stackable notice: block ' + block.name + ' (' + block.clientId + ') was auto-recovered, you should not see this after saving your page.' ) // eslint-disable-line no-console
			return newBlock
		}

		return block
	} )
}

// Recovers one block.
export const recoverBlock = ( {
	name, attributes, innerBlocks,
} ) => {
	return createBlock( name, attributes, innerBlocks )
}

const reusableBlocksToCheck = []

const addAutoRecoverReusableBlock = block => {
	if ( block.attributes.ref ) {
		reusableBlocksToCheck.push( {
			clientId: block.clientId,
			ref: block.attributes.ref,
		} )
	}
}

// TODO: doesn't work when the reusable block is inside a block that errored.

/**
 * Recover all the reusable blocks.
 */
const recoverReusableBlocks = () => {
	const { replaceBlocks } = dispatch( 'core/block-editor' )

	reusableBlocksReadyPromise( reusableBlocksToCheck )
		.then( () => {
			reusableBlocksToCheck.forEach( ( { clientId, ref } ) => {
				// Recover the reusable block.
				const wasRecovered = recoverReusableBlock( ref )

				// After the reusable block was recovered, we still need to
				// update the block to see the fixes.
				if ( wasRecovered ) {
					replaceBlocks(
						clientId,
						createBlock( 'core/block', { ref } )
					)
					console.log( 'Stackable notice: reusable block (' + ref + ' ' + clientId + ') was auto-recovered, you should not see this after refreshing your page.' ) // eslint-disable-line no-console
				}
			} )
		} )
}

/**
 * Recovers the saved reusable block. This updates the saved block.
 *
 * @param {number} ref Reusable block ref Id.
 */
export const recoverReusableBlock = ref => {
	const {
		__experimentalGetReusableBlock: getReusableBlock,
		__experimentalUpdateReusableBlock: updateReusableBlock,
		__experimentalSaveReusableBlock: saveReusableBlock,
	} = dispatch( 'core/editor' )

	// If our functions are not available, don't do anything.
	if ( ! getReusableBlock || ! updateReusableBlock || ! saveReusableBlock ) {
		return
	}

	// Get the raw reusable block.
	const reusableBlockContent = getReusableBlock( ref )

	// Parse the blocks. This might throw an error but we won't know about it.
	const blocks = parse( reusableBlockContent.content )

	// Try and recover the blocks.
	const newBlocks = recoverBlocks( blocks )

	// Check whether there was a block that was recovered.
	// We can catch it here.
	const wasRecovered = newBlocks.some( block => {
		return block.recovered && block.replacedClientId
	} )

	// Save the updated block.
	if ( wasRecovered ) {
		// Update the reusable block.
		updateReusableBlock( ref,
			{
				content: wp.blocks.serialize( newBlocks ),
			}
		)

		// Save the changes of the block.
		saveReusableBlock( ref )
	}

	return wasRecovered
}
