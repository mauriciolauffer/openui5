/*global QUnit*/
sap.ui.define([
	"sap/ui/model/odata/ODataMetadata",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/core/util/MockServer"
], function(ODataMetadata, V1ODataModel, MockServer) {
	"use strict";

	const sServiceUri = "/MockSrv/";
	const sServiceUri3 = "/DOESNOTEXIST/";

	const sDataRootPath = "test-resources/sap/ui/core/qunit/model/";
	let oServer;
	let oModel;

	function initServer(sUrl, sMetaPath, sDataRoot) {
		const oMockServer = new MockServer({
			rootUri: sServiceUri
		});
		oMockServer.simulate("test-resources/sap/ui/core/qunit/" + sMetaPath, sDataRoot);
		oMockServer.start();
		return oMockServer;
	}

	/**
	 * Initialize OData V1 Model
	 * @param {string} sUri - Service URI
	 * @returns {sap.ui.model.odata.ODataModel} The initialized model
	 */
	function initModel(sUri) {
		oModel = new V1ODataModel(sUri, true);

		// Catch metadata promise to prevent unhandled rejections in QUnit 2.18+
		try {
			if (oModel.oMetadata && typeof oModel.oMetadata.loaded === 'function') {
				oModel.oMetadata.loaded().catch(() => {
					// Silently catch metadata loading errors
				});
			}
		} catch (e) {
			// Ignore if metadata.loaded() fails
		}

		return oModel;
	}

	QUnit.module("ODataMetadata: ODataModel Annotation path - Legacy QUnit Tests");

	QUnit.test("init MockServer Flight", function(assert) {
		oServer = initServer(sServiceUri, "model/metadata1.xml", sDataRootPath);
		assert.ok(oServer,"Server initialized");
	});

	QUnit.test("init Model", function(assert) {
		const oModel = initModel(sServiceUri);
		assert.ok(oModel,"Model initialized");
		assert.ok(oModel.getServiceMetadata(), "Metadata loaded");
	});

	// Note: This test can not be migrated to QUnit 2.18+ without major refactoring due to unhandled promise rejection.
	// 2.18+ reports expected failures from the non-existent service URI as "global failures", this cannot be fixed in
	// the test itself, but only by handling the promise rejections properly in productive code.
	QUnit.test("metadata failed handling", function(assert) {
		const done = assert.async();
		const oModel = initModel(sServiceUri3);
		let oModel2 = {};
		const handleFailed1 = function(){
			assert.ok(!oModel2.getServiceMetadata(), "Metadata on second model failed correctly");
			oModel2.detachMetadataFailed(handleFailed1);
			done();
		};
		const handleFailed2 = function(){
			assert.ok(!oModel.getServiceMetadata(), "Metadata failed correctly");
			assert.ok(oModel.oMetadata.isFailed(), "Failed on metadata object has been set correctly");
			oModel2 = initModel(sServiceUri3);
			oModel2.attachMetadataFailed(handleFailed1);
			oModel.detachMetadataFailed(handleFailed2);
		};
		oModel.attachMetadataFailed(handleFailed2);
	});
});

