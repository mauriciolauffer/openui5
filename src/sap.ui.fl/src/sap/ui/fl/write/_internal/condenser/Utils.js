/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Element"
], function(
	JsControlTreeModifier,
	Element
) {
	"use strict";

	const Utils = {};

	Utils.TARGET_UI = "targetUI";
	Utils.INITIAL_UI = "initialUI";
	Utils.PLACEHOLDER = "X";
	Utils.INDEX_RELEVANT = "indexRelevant";
	Utils.NOT_INDEX_RELEVANT = "notIndexRelevant";

	/**
	 * Retrieves the length of the array.
	 *
	 * @param {int} iSourceIndex - Source index of the element
	 * @param {int} iTargetIndex - Target index of the element
	 * @returns {int} Highest Index or 0
	 */
	function getNeededLengthOfNewArray(iSourceIndex, iTargetIndex) {
		return (Math.max(iSourceIndex, iTargetIndex) || 0) + 1;
	}

	/**
	 * Retrieves the initial UI reconstruction of the corresponding container.
	 *
	 * @param {Map} mUIReconstructions - Map of UI reconstructions that holds key-value pairs. A key is a selector ID of the container. A value is a nested map which contains initial and target UI reconstructions
	 * @param {string} sContainerKey - Selector ID of the container
	 * @param {string} sAggregationName - Name of the aggregation
	 * @param {string[]} aContainerElements - Array of the container element IDs
	 * @returns {string[]} Array of container element IDs of initial UI reconstruction
	 */
	Utils.getInitialUIContainerElementIds = function(mUIReconstructions, sContainerKey, sAggregationName, aContainerElements) {
		mUIReconstructions[sContainerKey] ||= {};
		const mUIStates = mUIReconstructions[sContainerKey];
		mUIStates[sAggregationName] ||= {};
		const mUIAggregationState = mUIStates[sAggregationName];
		mUIAggregationState[Utils.TARGET_UI] ||= aContainerElements;
		mUIAggregationState[Utils.INITIAL_UI] ||= aContainerElements.slice(0);
		return mUIAggregationState[Utils.INITIAL_UI];
	};

	/**
	 * Retrieves the aggregation from the container instance and returns all the Ids of the controls
	 *
	 * @param {string} sContainerId - Container Id
	 * @param {string} sAggregationName - Name of the aggregation
	 * @param {object} [aCustomAggregation] - Custom Aggregation
	 * @param {string} [sAffectedControlIdProperty] - Property name of the ID used for the container element
	 * @returns {Promise<string[]>} Array of Ids wrapped in Promise
	 */
	Utils.getContainerElementIds = async function(sContainerId, sAggregationName, aCustomAggregation, sAffectedControlIdProperty) {
		const oContainer = Element.getElementById(sContainerId);

		const aContainerElements = aCustomAggregation || await JsControlTreeModifier.getAggregation(oContainer, sAggregationName);
		return aContainerElements.map((oElement) => {
			return sAffectedControlIdProperty ? oElement[sAffectedControlIdProperty] : oElement.getId();
		});
	};

	/**
	 * Initializes array of elements.
	 *
	 * @param {int} iTargetIndex - Target index of the element
	 * @param {int} [iSourceIndex] - Source index of the element
	 * @returns {string} Array of Placeholders
	 */
	Utils.initializeArrayWithPlaceholders = function(iTargetIndex, iSourceIndex) {
		const iLength = getNeededLengthOfNewArray(iSourceIndex, iTargetIndex);
		return Array(iLength).fill(Utils.PLACEHOLDER).map((sPlaceholder, iIterator) => {
			return sPlaceholder + iIterator;
		});
	};

	Utils.extendArrayWithPlaceholders = function(aElements, iSourceIndex, iTargetIndex) {
		const iLength = getNeededLengthOfNewArray(iSourceIndex, iTargetIndex);
		if (aElements.length < iLength) {
			let sUnknown;
			for (let i = aElements.length; i <= iLength; i++) {
				sUnknown = Utils.PLACEHOLDER + (aElements.length);
				aElements.splice(aElements.length, 0, sUnknown);
			}
		}
	};

	/**
	 * Extends the existing array of elements with a new element.
	 *
	 * @param {string[]} aElements - Array of elements
	 * @param {int} iSourceIndex - Source index of the element
	 * @param {int} iTargetIndex - Target index of the element
	 * @param {string} sAffectedControlId - Affected control ID
	 */
	Utils.extendElementsArray = function(aElements, iSourceIndex, iTargetIndex, sAffectedControlId) {
		Utils.extendArrayWithPlaceholders(aElements, iSourceIndex, iTargetIndex);

		const iCurrentIndex = aElements.indexOf(sAffectedControlId);
		const iUnknownIndex = aElements.indexOf(Utils.PLACEHOLDER + iSourceIndex);
		if (
			iCurrentIndex !== iSourceIndex
			&& iSourceIndex !== undefined
		) {
			if (iCurrentIndex >= 0) {
				Utils.shiftElement(aElements, iCurrentIndex, iSourceIndex);
			} else if (iUnknownIndex > -1) {
				aElements[iUnknownIndex] = sAffectedControlId;
			} else if (Utils.isUnknown(aElements[iSourceIndex])) {
				aElements[iSourceIndex] = sAffectedControlId;
			}
		}
	};

	/**
	 * Shifts an element from an old index to a new one within the array of elements.
	 *
	 * @param {string[]} aElements - Array of elements
	 * @param {int} iOldIndex - Old index of the element
	 * @param {int} iNewIndex - New index of the element
	 */
	Utils.shiftElement = function(aElements, iOldIndex, iNewIndex) {
		aElements.splice(iNewIndex, 0, aElements.splice(iOldIndex, 1)[0]);
	};

	/**
	 * Verifies whether the element is unknown.
	 *
	 * @param {string} sValue - Element value
	 * @returns {boolean} <code>true</code> if the element is unknown
	 */
	Utils.isUnknown = function(sValue) {
		if (
			sValue !== undefined
			&& sValue.indexOf(Utils.PLACEHOLDER) === 0
		) {
			const sResult = sValue.slice(1, sValue.length);
			const iParsedIndex = parseInt(sResult);
			if (isNaN(iParsedIndex)) {
				return false;
			}
			return true;
		}
		return false;
	};

	return Utils;
});