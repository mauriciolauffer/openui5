/*global QUnit */

sap.ui.define([
	"sap/m/Page",
	"sap/m/ObjectHeader",
	"sap/m/ObjectMarker",
	"sap/m/ObjectStatus",
	"sap/m/ObjectNumber",
	"sap/m/HeaderContainer",
	"test-resources/sap/ui/support/TestHelper"
], function (Page, ObjectHeader, ObjectMarker, ObjectStatus, ObjectNumber, HeaderContainer, testRule)  {
	"use strict";
	/**
	 * @deprecated as of version 1.16,<code>markFlagged</code> has been replaced by <code>markers</code> aggregation
	 */
	QUnit.module("ObjectHeader markers aggregation with markFlagged: true", {
		beforeEach: function () {
			this.page = new Page("objectHeaderContext", {
				content: new ObjectHeader({
					markers: new ObjectMarker(),
					markFlagged: true
				})
			});
			this.page.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.page.destroy();
		}
	});

	/**
	 * @deprecated as of version 1.16,<code>markFlagged</code> has been replaced by <code>markers</code> aggregation
	 */
	testRule({
		executionScopeType: "subtree",
		executionScopeSelectors: "objectHeaderContext",
		libName: "sap.m",
		ruleId: "objectHeaderMarkers",
		expectedNumberOfIssues: 1
	});

	/**
	 * @deprecated as of version 1.16,<code>markFavorite</code> has been replaced by <code>markers</code> aggregation
	 */
	QUnit.module("ObjectHeader markers aggregation with markFavorite: true", {
		beforeEach: function () {
			this.page = new Page("objectHeaderContext", {
				content: new ObjectHeader({
					markers: new ObjectMarker(),
					markFavorite: true
				})
			});
			this.page.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.page.destroy();
		}
	});

	/**
	 * @deprecated as of version 1.16,<code>markFavorite</code> has been replaced by <code>markers</code> aggregation
	 */
	testRule({
		executionScopeType: "subtree",
		executionScopeSelectors: "objectHeaderContext",
		libName: "sap.m",
		ruleId: "objectHeaderMarkers",
		expectedNumberOfIssues: 1
	});

	/**
	 * @deprecated as of version 1.16,<code>firstStatus</code> has been replaced by <code>markers</code> aggregation
	 */
	QUnit.module("ObjectHeader statuses with set firstStatus", {
		beforeEach: function () {
			this.page = new Page("objectHeaderContext", {
				content: new ObjectHeader({
					statuses: new ObjectStatus(),
					firstStatus: new ObjectStatus()
				})
			});
			this.page.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.page.destroy();
		}
	});

	/**
	 * @deprecated as of version 1.16,<code>firstStatus</code> has been replaced by <code>markers</code> aggregation
	 */
	testRule({
		executionScopeType: "subtree",
		executionScopeSelectors: "objectHeaderContext",
		libName: "sap.m",
		ruleId: "objectHeaderStatuses",
		expectedNumberOfIssues: 1
	});

	/**
	 * @deprecated as of version 1.16,<code>secondStatus</code> has been replaced by <code>markers</code> aggregation
	 */
	QUnit.module("ObjectHeader statuses with set secondStatus", {
		beforeEach: function () {
			this.page = new Page("objectHeaderContext", {
				content: new ObjectHeader({
					statuses: new ObjectStatus(),
					secondStatus: new ObjectStatus()
				})
			});
			this.page.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.page.destroy();
		}
	});

	/**
	 * @deprecated as of version 1.16,<code>secondStatus</code> has been replaced by <code>markers</code> aggregation
	 */
	testRule({
		executionScopeType: "subtree",
		executionScopeSelectors: "objectHeaderContext",
		libName: "sap.m",
		ruleId: "objectHeaderStatuses",
		expectedNumberOfIssues: 1
	});

	QUnit.module("ObjectHeader condensed set to true with responsive - true", {
		beforeEach: function () {
			this.page = new Page("objectHeaderContext", {
				content: new ObjectHeader({
					condensed: true,
					responsive: true
				})
			});
			this.page.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.page.destroy();
		}
	});

	testRule({
		executionScopeType: "subtree",
		executionScopeSelectors: "objectHeaderContext",
		libName: "sap.m",
		ruleId: "objectHeaderCondensed",
		expectedNumberOfIssues: 1
	});

	QUnit.module("ObjectHeader fullScreenOptimized set to true with responsive - false", {
		beforeEach: function () {
			this.page = new Page("objectHeaderContext", {
				content: new ObjectHeader({
					fullScreenOptimized: true,
					responsive: false
				})
			});
			this.page.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.page.destroy();
		}
	});

	testRule({
		executionScopeType: "subtree",
		executionScopeSelectors: "objectHeaderContext",
		libName: "sap.m",
		ruleId: "objectHeaderFullScreenOptimized",
		expectedNumberOfIssues: 1
	});

	QUnit.module("ObjectHeader additionalNumbers aggregation used with responsive - true", {
		beforeEach: function () {
			this.page = new Page("objectHeaderContext", {
				content: new ObjectHeader({
					additionalNumbers: new ObjectNumber(),
					responsive: true
				})
			});
			this.page.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.page.destroy();
		}
	});

	testRule({
		executionScopeType: "subtree",
		executionScopeSelectors: "objectHeaderContext",
		libName: "sap.m",
		ruleId: "objectHeaderAdditionalNumbers",
		expectedNumberOfIssues: 1
	});

	QUnit.module("ObjectHeader headerContainer aggregation used with responsive - false", {
		beforeEach: function () {
			this.page = new Page("objectHeaderContext", {
				content: new ObjectHeader({
					headerContainer: new HeaderContainer(),
					responsive: false
				})
			});
			this.page.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.page.destroy();
		}
	});

	testRule({
		executionScopeType: "subtree",
		executionScopeSelectors: "objectHeaderContext",
		libName: "sap.m",
		ruleId: "objectHeaderHeaderContainer",
		expectedNumberOfIssues: 1
	});
});
