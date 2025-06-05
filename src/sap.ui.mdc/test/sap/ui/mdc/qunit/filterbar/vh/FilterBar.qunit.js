/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/filterbar/vh/FilterBar",
	"sap/ui/mdc/valuehelp/FilterBar"
], function (
	VHFilterBar, ValueHelpFilterBar
) {
	"use strict";

	QUnit.module("FilterBar", {
		beforeEach: function () {
			this.oFilterBar = new VHFilterBar({
				//delegate: { name: "delegates/GenericVhFilterBarDelegate", payload: {} }
			});

		},
		afterEach: function () {
			this.oFilterBar.destroy();
			this.oFilterBar = undefined;
		}
	});

	QUnit.test("derived from valuehelp/FilterBar", function (assert) {
		assert.ok(this.oFilterBar.isA("sap.ui.mdc.valuehelp.FilterBar"));
	});

	QUnit.test("renderer from valuehelp/FilterBar", function (assert) {
		assert.equal(this.oFilterBar.getMetadata().getRenderer(), ValueHelpFilterBar.getMetadata().getRenderer());
	});

});
