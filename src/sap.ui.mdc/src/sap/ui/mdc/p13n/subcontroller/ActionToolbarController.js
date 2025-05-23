/*!
 * ${copyright}
 */

sap.ui.define([
	"./SelectionController",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/mdc/p13n/panels/ActionToolbarPanel",
	"sap/m/Column",
	"sap/ui/mdc/p13n/P13nBuilder"
], (BaseController, Element, Library, ActionToolbarPanel, Column, P13nBuilder) => {
	"use strict";

	const oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");
	const ActionToolbarController = BaseController.extend("saps.ui.mdc.p13n.subcontroller.ActionToolbarController");


	ActionToolbarController.prototype.initAdaptationUI = function(oPropertyHelper) {

		const oSelectionPanel = new ActionToolbarPanel({
			title: oResourceBundle.getText("actiontoolbar.RTA_TITLE"),
			showHeader: true
		});
		//oSelectionPanel.setEnableReorder(false);
		oSelectionPanel.setFieldColumn(oResourceBundle.getText("actiontoolbar.RTA_COLUMN_HEADER"));

		const oAdaptationData = this.mixInfoAndState(oPropertyHelper);
		oSelectionPanel.setP13nData(oAdaptationData.items);
		this._oPanel = oSelectionPanel;
		return Promise.resolve(oSelectionPanel);
	};

	ActionToolbarController.prototype.getDelta = function(mPropertyBag) {
		const aChanges = BaseController.prototype.getDelta.apply(this, arguments);
		aChanges.forEach((oChange) => {
			const sChangeType = oChange.changeSpecificData.changeType;
			if (sChangeType === "hideControl" || sChangeType === "unhideControl") {
				oChange.selectorElement = Element.getElementById(oChange.changeSpecificData.content.name);
				delete oChange.changeSpecificData.content;
			}
		});
		return aChanges;
	};

	/**
	 * Initialized the inner model for the Personalization.
	 *
	 * @param {sap.ui.mdc.util.PropertyHelper} oPropertyHelper The propertyhelper that should be utilized for property determination.
	 */
	ActionToolbarController.prototype.mixInfoAndState = function(oPropertyHelper) {
		const aItemState = this.getCurrentState();
		const mItemState = this.arrayToMap(aItemState);

		const oP13nData = this.prepareAdaptationData(oPropertyHelper, (mItem, oProperty) => {
			const oExisting = mItemState[oProperty.name];
			mItem.visible = !!oExisting;
			mItem.position = oExisting ? oExisting.position : -1;
			mItem.alignment = oProperty.alignment;
			mItem.enabled = typeof oProperty.enabled === "string" ? oProperty.enabled : !!oProperty.enabled;
			return oProperty.visible;
		});

		this.sortP13nData({
			visible: "visible",
			position: "position"
		}, oP13nData.items);

		oP13nData.items.forEach((oItem) => { delete oItem.position; });
		return oP13nData;
	};

	ActionToolbarController.prototype.getChangeOperations = function() {
		return {
			add: "unhideControl",
			remove: "hideControl",
			move: "moveAction"
		};
	};

	return ActionToolbarController;

});