/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.mdc.enums.FilterBarValidationStatus
sap.ui.define(() => {
	"use strict";

	/**
	 * Enumeration of the possible validation types.
	 *
	 * @enum {int}
	 * @public
	 * @since 1.115
	 * @alias sap.ui.mdc.enums.FilterBarValidationStatus
	 */
	const FilterBarValidationStatus = {

		/**
		 * No errors detected.
		 * @public
		 */
		NoError: -1,

		/**
		 * Required filter field without a value.
		 * @public
		 */
		RequiredHasNoValue: 0,

		/**
		 * Filter field in error state.
		 * @public
		 */
		FieldInErrorState: 1,

		/**
		 * Ongoing asynchronous validation.
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		AsyncValidation: 2,

		/**
		 * Change is being applied.
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		OngoingChangeAppliance: 3
	};

	return FilterBarValidationStatus;

}, /* bExport= */ true);