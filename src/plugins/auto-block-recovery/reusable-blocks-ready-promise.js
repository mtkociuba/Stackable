import { select } from '@wordpress/data'

let reusableBlockInterval

/**
 * Gutenberg takes a bit of time to load the reusable block data, this returns a
 * Promise that gets fulfilled after the given reusable blocks are loaded.
 *
 * @param {Array} reusableBlocks A list of reusable blocks to wait for
 */
const reusableBlocksReadyPromise = reusableBlocks => new Promise( ( resolve, reject ) => {
	const {
		__experimentalIsFetchingReusableBlock: isFetchingReusableBlock,
	} = select( 'core/editor' )

	// If API is not available.
	if ( ! isFetchingReusableBlock ) {
		reject( false )
	}

	let numCalls = 0

	// Wait for the reusable blocks to become fetched by Gutenberg.
	reusableBlockInterval = setInterval( () => {
		const done = reusableBlocks.every( ( { ref } ) => {
			if ( isFetchingReusableBlock( ref ) ) {
				return false
			}
			return true
		} )

		// Done fetching all the reusable blocks, resolve the promise.
		if ( done ) {
			clearInterval( reusableBlockInterval )
			resolve( true )
			return
		}

		// Failsafe, taking too long, reject.
		if ( numCalls++ > 20 ) {
			reject( false )
		}
	}, 300 )
} )

export default reusableBlocksReadyPromise
