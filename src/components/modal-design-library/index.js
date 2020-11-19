/**
 * Internal deprendencies
 */
import BlockDesigns from './block-designs'
import UIKits from './ui-kits'

/**
 * External deprendencies
 */
import { i18n } from 'stackable'

/**
 * WordPress deprendencies
 */
import { __ } from '@wordpress/i18n'
import DesignLibraryModal from './design-library-modal'
import { ButtonGroup, Button } from '@wordpress/components'
import { useState } from '@wordpress/element'

const ModalDesignLibrary = props => {
	const [ activeTab, setActiveTab ] = useState( 'block-designs' )

	return (
		<DesignLibraryModal
			className="ugb-modal-design-library"
			overlayClassName="ugb-modal-design-library__modal"
			title={ __( 'Stackable Design Library', i18n ) }
			onRequestClose={ props.onClose }
			headerContent={
				<ButtonGroup className="ugb-modal-design-library__header-buttons">

					<Button
						className={ activeTab === 'block-designs' ? 'is-active' : undefined }
						onClick={ () => setActiveTab( 'block-designs' ) }
					>
						{ __( 'Block Designs', i18n ) }
					</Button>

					<Button
						className={ activeTab === 'ui-kits' ? 'is-active' : undefined }
						onClick={ () => setActiveTab( 'ui-kits' ) }
					>
						{ __( 'UI Kits', i18n ) }<span className="tag">{ __( 'NEW', i18n ) }</span>
					</Button>

				</ButtonGroup>
			}
		>

			<div className="ugb-modal-design-library__wrapper">
				{ activeTab === 'block-designs' && <BlockDesigns { ...props } /> }
				{ activeTab === 'ui-kits' && <UIKits { ...props } /> }
			</div>

		</DesignLibraryModal>
	)
}

ModalDesignLibrary.defaultProps = {
	onClose: () => {},
}

export default ModalDesignLibrary
