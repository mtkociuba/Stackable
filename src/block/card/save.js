/**
 * WordPress dependencies
 */
import { InnerBlocks } from '@wordpress/block-editor'
import classnames from 'classnames'
import { Image } from '~stackable/components'

export default props => {
	const {
		hasContainer,
		hasBackground,
	} = props.attributes

	const blockClassNames = classnames( [
		'stk-card',
		'stk-block',
		'stk-column',
		`stk-${ props.attributes.uniqueId }`,
	], {
		'stk-is-first': props.attributes.isFirstBlock,
		'stk-is-last': props.attributes.isLastBlock,
		'stk-block-background': hasBackground,
	} )

	const contentClassNames = classnames( [
		'stk-block-content',
		'stk-column-wrapper',
	], {
		'stk-container--no-padding': hasContainer,
	} )

	const innerClassNames = classnames( [
		'stk-inner-blocks',
		'stk-card__content',
	], {
		'stk-container-padding': hasContainer,
	} )

	return (
		<div className={ blockClassNames } data-id={ props.attributes.uniqueId }>
			<style>
				{ props.attributes.columnWidth ? `.stk-${ props.attributes.uniqueId } {
					flex: 1 1 ${ props.attributes.columnWidth }% !important;
					max-width: ${ props.attributes.columnWidth }% !important;
				}` : null }
			</style>
			<div className={ contentClassNames }>
				{ props.attributes.imageUrl &&
					<div className="stk-card__image">
						<Image
							className="stk-image--fit"
							imageId={ props.attributes.imageId }
							src={ props.attributes.imageUrl }
							alt={ props.attributes.imageAlt }
							title={ props.attributes.imageTitle }
							// width={ imageWidth }
							// shadow={ imageShadow }
							// shape={ attributes[ `image${ i }Shape` ] || imageShape }
							// shapeStretch={ attributes[ `image${ i }ShapeStretch` ] || imageShapeStretch }
						/>
					</div>
				}
				<div className={ innerClassNames }>
					<InnerBlocks.Content />
				</div>
			</div>
		</div>
	)
}
