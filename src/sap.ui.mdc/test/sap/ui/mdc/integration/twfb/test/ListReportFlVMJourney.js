/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
    "sap/ui/test/actions/Press",
	"test-resources/sap/ui/rta/integration/pages/Adaptation",
	"test-resources/sap/ui/fl/testutils/opa/TestLibrary"
], function(
	Opa5,
	opaTest,
	Press,
	Adaptation,
	TestLibrary
) {
	"use strict";

	Opa5.extendConfig({

		// TODO: increase the timeout timer from 15 (default) to 50 seconds
		// to see whether it influences the success rate of the first test on
		// the build infrastructure.
		// As currently, the underlying service takes some time for the
		// creation and initialization of tenants.
		// You might want to remove this timeout timer after the underlying
		// service has been optimized or if the timeout timer increase does
		// not have any effect on the success rate of the tests.
		timeout: 50,
		autoWait: true,
		appParams: {
			"sap-ui-rta-skip-flex-validation": true
		},

		arrangements: {
			iClearTheSessionLRep: function () {
				window.sessionStorage.removeItem("sap.ui.rta.restart.CUSTOMER");
				window.sessionStorage.removeItem("sap.ui.rta.restart.USER");
				localStorage.clear();
			}
		},
		actions: new Opa5({
			iPressTheAdaptUiButton: function () {
				return this.waitFor({
					id: "__button0",
					controlType: "sap.m.Button",
					actions: new Press()
				});
			}
		})
	});

	const sFLVM_ID = "container-v4demo---books--IDVariantManagementOfTable";


	QUnit.module("ListReport Fl VM - Books Page Table");

	opaTest("1. start the app in RTA", function(Given, When, Then) {
		// Arrange
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/internal/TableWithFilterBar/index.html");
		Given.iClearTheSessionLRep();

		// Act
		When.iPressTheAdaptUiButton();

		Then.onPageWithRTA.iShouldSeeTheToolbar();
		Then.onPageWithRTA.iShouldSeeTheElement(sFLVM_ID);
	});

	// opaTest("2. check the context menue for Standard variant", function(Given, When, Then) {
	//
	// 	When.onPageWithRTA.iRightClickOnAnElementOverlay(sFLVM_ID);
	// 	Then.onPageWithRTA.iShouldSeetheContextMenu();
	// 	Then.onPageWithRTA.iShouldSeetheContextMenuEntriesWithKeys(["CTX_VARIANT_SET_TITLE", "CTX_VARIANT_SAVE", "CTX_VARIANT_SAVEAS", "CTX_VARIANT_MANAGE", "CTX_VARIANT_SWITCH_SUBMENU"]);
	// });
	//
	// opaTest("3. create new variant and check context menu", function(Given, When, Then) {
	// 	When.onPageWithRTA.iRightClickOnAnElementOverlay(sFLVM_ID);
	// 	When.onPageWithRTA.iClickOnAContextMenuEntryWithKey("CTX_VARIANT_SAVEAS");
	// 	Then.onFlVariantManagement.theOpenSaveViewDialog(sFLVM_ID);
	//
	// 	// Act
	// 	When.onFlVariantManagement.iCreateNewVariant(sFLVM_ID, "KUVariant1", true, true);
	// 	Then.onFlVariantManagement.theVariantShouldBeDisplayed(sFLVM_ID, "KUVariant1");
	//
	// 	When.onPageWithRTA.iRightClickOnAnElementOverlay(sFLVM_ID);
	// 	Then.onPageWithRTA.iShouldSeetheContextMenu();
	// 	Then.onPageWithRTA.iShouldSeetheContextMenuEntriesWithKeys(["CTX_VARIANT_SET_TITLE", "CTX_VARIANT_SAVE", "CTX_VARIANT_SAVEAS", "CTX_VARIANT_MANAGE", "CTX_VARIANT_SWITCH_SUBMENU"]);
	// });
	//
	// opaTest("4. open Manage views and check content", function(Given, When, Then) {
	// 	When.onPageWithRTA.iRightClickOnAnElementOverlay(sFLVM_ID);
	//
	// 	When.onPageWithRTA.iClickOnAContextMenuEntryWithKey("CTX_VARIANT_MANAGE");
	//
	// 	Then.onFlVariantManagement.theOpenManageViewsDialog(sFLVM_ID);
	// 	Then.onFlVariantManagement.theOpenManageViewsDialogDefaultShouldBe("KUVariant1");
	// 	Then.onFlVariantManagement.theOpenManageViewsDialogTitleShouldContain(["Standard", "KUVariant1"]);
	// 	Then.onFlVariantManagement.theOpenManageViewsDialogFavoritesShouldContain([true, true]);
	// 	Then.onFlVariantManagement.theOpenManageViewsDialogApplyAutomaticallyShouldContain([false, true]);
	// });
	//
	// opaTest("5. unfavoure the KUVariant1, rename KUVariant1 variant, change apply auto and save changes", function(Given, When, Then) {
	// 	When.onFlVariantManagement.iSetFavoriteVariant("KUVariant1", false);
	// 	When.onFlVariantManagement.iRenameVariant("KUVariant1", "KURenameVariant1");
	// 	When.onFlVariantManagement.iApplyAutomaticallyVariant("KURenameVariant1", false);
	//
	// 	// Assertion
	// 	Then.onFlVariantManagement.theOpenManageViewsDialogTitleShouldContain(["Standard", "KURenameVariant1"]);
	// 	Then.onFlVariantManagement.theOpenManageViewsDialogDefaultShouldBe("KURenameVariant1");
	//
	// 	Then.onFlVariantManagement.theOpenManageViewsDialogFavoritesShouldContain([true, true]);
	// 	Then.onFlVariantManagement.theOpenManageViewsDialogApplyAutomaticallyShouldContain([false, false]);
	//
	//
	// 	When.onFlVariantManagement.iPressTheManageViewsSave(sFLVM_ID);
	//
	// 	Then.onFlVariantManagement.theVariantShouldBeDisplayed(sFLVM_ID, "KURenameVariant1");
	//
	// 	When.onPageWithRTA.iExitRtaMode();
	// });


//------------------------------------------------------------------------------

	// QUnit.module("Fl Variants end user perso");
	//
	// opaTest("1. start the app and check the initial 'My View' content", function(Given, When, Then) {
	// 	// Arrange
	// 	Given.iClearTheSessionLRep();
	// 	//Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/internal/TableWithFilterBar/index.html");
	//
	// 	Then.onFlVariantManagement.theVariantShouldBeDisplayed(sFLVM_ID, "KURenameVariant1");
	//
	// 	// Act
	// 	When.onFlVariantManagement.iOpenMyView(sFLVM_ID);
	//
	// 	// Assertion
	// 	Then.onFlVariantManagement.theMyViewShouldContain(sFLVM_ID, ["Standard", "KURenameVariant1"]);
	// });
	//
	// opaTest("2. create a new variant and check the 'My View' Content", function(Given, When, Then) {
	// 	// Act
	// 	When.onFlVariantManagement.iOpenSaveView(sFLVM_ID);
	//
	// 	// Assertion
	// 	Then.onFlVariantManagement.theOpenSaveViewDialog(sFLVM_ID);
	//
	// 	// Act
	// 	When.onFlVariantManagement.iCreateNewVariant(sFLVM_ID, "OpaVariant1", true, true);
	// 	Then.onFlVariantManagement.theVariantShouldBeDisplayed(sFLVM_ID, "OpaVariant1");
	//
	// 	When.onFlVariantManagement.iOpenMyView(sFLVM_ID);
	//
	// 	// Assertion
	// 	Then.onFlVariantManagement.theMyViewShouldContain(sFLVM_ID, ["Standard", "KURenameVariant1", "OpaVariant1"]);
	//
	// 	When.onFlVariantManagement.iOpenMyView(sFLVM_ID); // closes
	// });
	//
	// opaTest("3. open the 'Manage View' and check content", function(Given, When, Then) {
	//
	// 	// Act
	// 	When.onFlVariantManagement.iOpenMyView(sFLVM_ID);
	// 	When.onFlVariantManagement.iOpenManageViews(sFLVM_ID);
	//
	// 	// Assertion
	// 	Then.onFlVariantManagement.theOpenManageViewsDialog(sFLVM_ID);
	// 	Then.onFlVariantManagement.theOpenManageViewsDialogTitleShouldContain(["Standard", "KURenameVariant1", "OpaVariant1"]);
	// 	Then.onFlVariantManagement.theOpenManageViewsDialogFavoritesShouldContain([true, true,  true]);
	// 	Then.onFlVariantManagement.theOpenManageViewsDialogApplyAutomaticallyShouldContain([false, false, true]);
	// 	Then.onFlVariantManagement.theOpenManageViewsDialogDefaultShouldBe("OpaVariant1");
	// });
	//
	// opaTest("4. unfavoure the KURenameVariant1, rename OpaVariant1 variant, change apply auto and save changes", function(Given, When, Then) {
	// 	// Act
	// 	When.onFlVariantManagement.iSetFavoriteVariant("KURenameVariant1", false);
	// 	When.onFlVariantManagement.iRenameVariant("OpaVariant1", "AOpaRenameVariant1");
	// 	When.onFlVariantManagement.iApplyAutomaticallyVariant("AOpaRenameVariant1", false);
	//
	// 	// Assertion
	// 	Then.onFlVariantManagement.theOpenManageViewsDialogTitleShouldContain(["Standard", "KURenameVariant1", "AOpaRenameVariant1"]);
	//
	// 	Then.onFlVariantManagement.theOpenManageViewsDialogFavoritesShouldContain([true, false, true]);
	// 	Then.onFlVariantManagement.theOpenManageViewsDialogApplyAutomaticallyShouldContain([false, false, false]);
	//
	// 	When.onFlVariantManagement.iPressTheManageViewsSave(sFLVM_ID);
	//
	// 	Then.onFlVariantManagement.theVariantShouldBeDisplayed(sFLVM_ID, "AOpaRenameVariant1");
	// });
	//
	// opaTest("5. check the 'My Views'", function(Given, When, Then) {
	//
	// 	// Act
	// 	When.onFlVariantManagement.iOpenMyView(sFLVM_ID);
	//
	// 	// Assertion
	// 	Then.onFlVariantManagement.theMyViewShouldContain(sFLVM_ID, ["Standard", "AOpaRenameVariant1"]);
	//
	// 	When.onFlVariantManagement.iOpenMyView(sFLVM_ID); // closes
	// });
	//
	// opaTest("6. reopen the 'Manage View' and check content", function(Given, When, Then) {
	//
	// 	// Act
	// 	When.onFlVariantManagement.iOpenMyView(sFLVM_ID);
	// 	When.onFlVariantManagement.iOpenManageViews(sFLVM_ID);
	//
	// 	// Assertion
	// 	Then.onFlVariantManagement.theOpenManageViewsDialog(sFLVM_ID);
	// 	Then.onFlVariantManagement.theOpenManageViewsDialogTitleShouldContain(["Standard", "AOpaRenameVariant1", "KURenameVariant1"]);
	// 	Then.onFlVariantManagement.theOpenManageViewsDialogFavoritesShouldContain([true, true, false]);
	// 	Then.onFlVariantManagement.theOpenManageViewsDialogApplyAutomaticallyShouldContain([false, false, false]);
	// 	Then.onFlVariantManagement.theOpenManageViewsDialogDefaultShouldBe("AOpaRenameVariant1");
	// });
	//
	// opaTest("7. remove AOpaRenameVariant1 variant and save change", function(Given, When, Then) {
	//
	// 	// Act
	// 	When.onFlVariantManagement.iRemoveVariant("AOpaRenameVariant1");
	//
	// 	// Assertion
	// 	Then.onFlVariantManagement.theOpenManageViewsDialogTitleShouldContain(["Standard", "KURenameVariant1"]);
	// 	Then.onFlVariantManagement.theOpenManageViewsDialogFavoritesShouldContain([true, false]);
	// 	Then.onFlVariantManagement.theOpenManageViewsDialogDefaultShouldBe("Standard");
	//
	// 	When.onFlVariantManagement.iPressTheManageViewsSave(sFLVM_ID);
	// 	Then.onFlVariantManagement.theVariantShouldBeDisplayed(sFLVM_ID, "Standard");
	// });
	//
	// opaTest("8. check the 'My Views'", function(Given, When, Then) {
	//
	// 	// Act
	// 	When.onFlVariantManagement.iOpenMyView(sFLVM_ID);
	//
	// 	// Assertion
	// 	Then.onFlVariantManagement.theMyViewShouldContain(sFLVM_ID, ["Standard"]);
	//
	// 	When.onFlVariantManagement.iOpenMyView(sFLVM_ID); // closes
	//
	// 	Given.iClearTheSessionLRep();
	// });

});