/**
 * A Control for selecting designs.
 */
/**
 * External dependencies
 */
import { DesignPanelItem } from '~stackable/components'
import { omit } from 'lodash'
import classnames from 'classnames'

/**
 * WordPress dependencies
 */
import { RadioControl } from '@wordpress/components'

function DesignControl( props ) {
	// Convert the options.
	const fixedOptions = props.options.map( option => {
		return {
			...option,
			label: <DesignPanelItem imageFile={ option.image } imageHoverFile={ option.hoverImage } imageWidth={ option.imageWidth } imageHeight={ option.imageHeight } isPro={ option.isPro } label={ option.label } />,
			title: option.label,
			value: option.value,
		}
	} )

	const classNames = classnames( [
		props.className,
		'ugb-design-control-wrapper components-base-control',
	], {
		'ugb-design-control__disabled': props.disabled,
	} )

	return (
		<div className={ classNames }>
			<div className="components-base-control__label">{ props.label }</div>
			<RadioControl
				{ ...omit( props, [ 'label' ] ) }
				className="ugb-design-control"
				selected={ props.selected }
				options={ fixedOptions }
				onChange={ props.onChange }
			/>
		</div>
	)
}

DesignControl.defaultProps = {
	className: '',
	selected: '',
	options: [],
	onChange: () => {},
	disabled: false,
}

export default DesignControl
