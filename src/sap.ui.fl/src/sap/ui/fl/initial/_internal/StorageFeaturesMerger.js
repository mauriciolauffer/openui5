/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/Layer",
	"sap/base/Log"
], function(
	merge,
	Layer,
	Log
) {
	"use strict";

	/**
	 * ConnectorFeaturesMerger class for Connector implementations (initial).
	 *
	 * @namespace sap.ui.fl.intial._internal.StorageFeaturesMerger
	 * @since 1.70
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.initial._internal.Storage
	 */

	function _getVersioningFromResponse(oResponse) {
		var oVersioning = {};
		var bVersioningEnabled = !!oResponse.features.isVersioningEnabled;

		if (oResponse?.layers && (oResponse.layers.includes(Layer.CUSTOMER) || oResponse.layers.includes("ALL"))) {
			oVersioning[Layer.CUSTOMER] = bVersioningEnabled;
		}

		return oVersioning;
	}

	return {
		/**
		 * Merges the results from all involved connectors otherwise take default value;
		 * The information if a draft is enabled for a given layer on write is determined by
		 * each connector individually; since getConnectorsForLayer allows no more than 1 connector
		 * for any given layer a merging is not necessary.
		 *
		 * @param {object[]} aResponses - All responses provided by the different connectors
		 * @returns {object} Merged result
		 */
		mergeResults(aResponses) {
			var oResult = {};

			aResponses.forEach(function(oResponse) {
				Object.keys(oResponse.features).forEach(function(sKey) {
					// only allow the connector in charge of the customer layer to determine the key user property
					if
					(
						sKey === "isKeyUser" &&
						oResponse.features.isKeyUser !== undefined &&
						![Layer.CUSTOMER, "ALL"].some((sLayer) => oResponse.layers.includes(sLayer))
					) {
						Log.warning("removed a layer specific setting from a connector not configure for the specific layer");
						return;
					}

					if (sKey !== "isVersioningEnabled") {
						oResult[sKey] = oResponse.features[sKey];
					}
				});
				oResult.versioning = merge((oResult.versioning || {}), _getVersioningFromResponse(oResponse));
				if (oResponse.isContextSharingEnabled !== undefined) {
					oResult.isContextSharingEnabled = oResponse.isContextSharingEnabled;
				}
			});
			return oResult;
		}
	};
});
