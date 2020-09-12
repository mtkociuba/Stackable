import {
	select, dispatch,
} from '@wordpress/data'
import { createBlock, isReusableBlock } from '@wordpress/blocks'
import { isInvalid } from './is-invalid'

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
		console.log( 'isready', wp.data.select( 'core/editor' ).__unstableIsEditorReady() )
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
let reusableBlockInterval
const addAutoRecoverReusableBlock = block => {
	if ( block.attributes.ref ) {
		reusableBlocksToCheck.push( {
			clientId: block.clientId,
			ref: block.attributes.ref,
		} )
	}
}

const recoverReusableBlocks = () => {
	reusableBlockInterval = setInterval( () => {
		const done = reusableBlocksToCheck.every( ( { ref } ) => {
			const { __experimentalIsFetchingReusableBlock: isFetchingReusableBlock } = wp.data.select( 'core/editor' )
			if ( isFetchingReusableBlock( ref ) ) {
				return false
			}
			return true
		} )
		if ( ! done ) {
			return
		}

		reusableBlocksToCheck.forEach( ( { clientId, ref } ) => {
			const wasRecovered = recoverReusableBlock( ref )
			if ( wasRecovered ) {
				wp.data.dispatch( 'core/block-editor' ).replaceBlocks(
					clientId,
					wp.blocks.createBlock( 'core/block', { ref } )
				)
				console.log( 'Stackable notice: reusable block (' + ref + ' ' + clientId + ') was auto-recovered, you should not see this after refreshing your page.' ) // eslint-disable-line no-console
			}
		} )

		clearInterval( reusableBlockInterval )
	}, 300 )
}

export const recoverReusableBlock = ref => {
	const { __experimentalGetReusableBlock: getReusableBlock } = wp.data.select( 'core/editor' )
	// const { __experimentalGetReusableBlocks: getReusableBlocks } = wp.data.select( 'core/editor' )
	// const { __experimentalIsFetchingReusableBlock: isFetchingReusableBlock } = wp.data.select( 'core/editor' )
	// const ref = block.attributes.ref
	const b = getReusableBlock( ref )
	// console.log( 'all', isFetchingReusableBlock( ref ) )
	const blocks = wp.blocks.parse( b.content ) // this will result in an error

	const newBlocks = recoverBlocks( blocks )

	// Replace the recovered blocks with the new ones.
	const wasRecovered = newBlocks.some( block => {
		return block.recovered && block.replacedClientId
	} )

	if ( wasRecovered ) {
		// Update the reusable block
		const { __experimentalUpdateReusableBlock: updateReusableBlock } = wp.data.dispatch( 'core/editor' )
		updateReusableBlock(
			ref,
			{
				content: wp.blocks.serialize( newBlocks ),
			}
		)

		// Save the changes.
		const { __experimentalSaveReusableBlock: saveReusableBlock } = wp.data.dispatch( 'core/editor' )
		saveReusableBlock( ref )
	}

	return wasRecovered
}
