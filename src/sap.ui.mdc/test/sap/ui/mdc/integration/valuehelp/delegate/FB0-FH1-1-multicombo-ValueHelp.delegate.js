/*!
 * ${copyright}
 */

sap.ui.define([
	"./ValueHelp.delegate",
	"sap/ui/mdc/valuehelp/content/MTable",
	"sap/m/library",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Text",
	"sap/ui/model/odata/type/String"
], function(
	ODataV4ValueHelpDelegate,
	MTable,
	mLibrary,
	Table,
	Column,
	ColumnListItem,
	Text,
	StringType
) {
	"use strict";

	const ValueHelpDelegate = Object.assign({}, ODataV4ValueHelpDelegate);
//	var counter = 0;

	ValueHelpDelegate.retrieveContent = function (oValueHelp, oContainer) {
		// var oValueHelp = oContainer && oContainer.getParent();

		const oParams = new URLSearchParams(window.location.search);
		const oParamSuspended = oParams.get("suspended");
		const bSuspended = oParamSuspended ? oParamSuspended === "true" : false;

		const aCurrentContent = oContainer && oContainer.getContent();
		let oCurrentContent = aCurrentContent && aCurrentContent[0];

		// var bMultiSelect = oValueHelp.getMaxConditions() === -1;

		if (oContainer.isA("sap.ui.mdc.valuehelp.Popover")) {

			if (!oCurrentContent) {
				oCurrentContent = new MTable({keyPath: "ID", descriptionPath: "name", useAsValueHelp: true});
				oContainer.addContent(oCurrentContent);
			}

			if (!oCurrentContent.getTable()) {
				oCurrentContent.setTable(new Table("mTable1-1", {
					width: "20rem",
					growing: true,
					growingScrollToLoad: true,
					mode: mLibrary.ListMode.SingleSelectMaster,
					columns: [
						new Column({header: new Text({text : "ID"})}),
						new Column({header: new Text({text : "Name"})})
					],
					items: {
						path : "/Authors",
						suspended: bSuspended,
						template : new ColumnListItem({
							type: "Active",
							cells: [
								new Text({text: {path: 'ID', type: new StringType()}}),
								new Text({text: {path: 'name', type: new StringType()}})
							]
						})
					}
				}));
			}
		}

		return Promise.resolve();
	};

	return ValueHelpDelegate;
});
