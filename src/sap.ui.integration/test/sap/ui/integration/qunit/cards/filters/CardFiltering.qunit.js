/* global QUnit sinon */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/util/RequestDataProvider",
	"sap/ui/integration/Host",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/core/date/UI5Date",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent"
], function(
	Library,
	Card,
	RequestDataProvider,
	Host,
	KeyCodes,
	QUnitUtils,
	UI5Date,
	nextUIUpdate,
	nextCardReadyEvent
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Filters in Card", {
		beforeEach: function () {
			this.oCard = new Card();
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Filter items by category", async function (assert) {
		// Arrange
		var done = assert.async(),
			sCategory = "notebooks",
			sStatus = "2 of 3";

		// Act
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/filtering_static_filter.json");
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oHeader = this.oCard.getAggregation("_header"),
			oContentList = this.oCard.getCardContent().getInnerList(),
			oListItems = oContentList.getItems();

		// Assert
		assert.strictEqual(oHeader.getSubtitle(), "Category " + sCategory, "The initial value of 'category' is correct.");
		assert.strictEqual(oHeader.getStatusText(), sStatus, "The number of list items is as expected.");
		assert.strictEqual(oListItems[0].getDescription(), sCategory, "The list items have correct category.");

		// Act - change the category to flat_screens
		var sNewCategory = "flat_screens";
		var sNewStatus = "2 of 4";

		this.oCard.getModel("filters").setProperty("/category/value", sNewCategory);

		await nextUIUpdate();

		setTimeout(function () {
			assert.strictEqual(oHeader.getSubtitle(), "Category " + sNewCategory, "The initial value of 'category' is correct.");
			assert.strictEqual(oHeader.getStatusText(), sNewStatus, "The number of list items is as expected.");
			assert.strictEqual(oListItems[0].getDescription(), sNewCategory, "The list items have correct category.");
			done();
		}, 500);
	});

	QUnit.test("Filter using card method", async function (assert) {
		var done = assert.async();

		// Act
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/filtering_static_filter.json");
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var sOldValue = "notebooks",
			oHeader = this.oCard.getCardHeader();

		assert.strictEqual(oHeader.getSubtitle(), "Category " + sOldValue, "The initial value of 'category' is correct.");

		var sNewValue = "flat_screens";
		// act
		this.oCard.setFilterValue("category", sNewValue);

		// assert
		await nextUIUpdate();

		setTimeout(function () {
			assert.strictEqual(oHeader.getSubtitle(), "Category " + sNewValue, "The new value of 'category' is correct.");
			done();
		}, 200);
	});

	QUnit.test("Show 'No Data' message and show valid data after that", async function (assert) {
		// Arrange
		var done = assert.async();

		// Act
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/testResources/cardFilteringNoDataForFilter/manifest.json");
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		// Act
		this.oCard.getModel("filters").setProperty("/shipper/value", "43");

		await nextUIUpdate();

		setTimeout(async function () {
			assert.ok(this.oCard.getCardContent().getAggregation("_blockingMessage").getDomRef(), "an empty list is displayed");

			// Act
			this.oCard.getModel("filters").setProperty("/shipper/value", "3");
			await nextUIUpdate();

			setTimeout(function () {
				assert.ok(this.oCard.getCardContent().getAggregation("_content").getDomRef(), "list content is displayed");
				done();
			}.bind(this), 500);
		}.bind(this), 500);

	});

	QUnit.test("Show 'No Data' message and show valid data after that - data on content level", async function (assert) {
		// Arrange
		var done = assert.async();

		// Act
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/testResources/cardFilteringNoDataForFilter/manifest_content_data.json");
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		// Act
		this.oCard.getModel("filters").setProperty("/shipper/value", "43");
		await nextUIUpdate();

		setTimeout(async function () {
			assert.ok(this.oCard.getCardContent().getAggregation("_blockingMessage").getDomRef(), "an empty list is displayed");

			// Act
			this.oCard.getModel("filters").setProperty("/shipper/value", "3");
			await nextUIUpdate();

			setTimeout(function () {
				assert.ok(this.oCard.getCardContent().getAggregation("_content").getDomRef(), "list content is displayed");
				done();
			}.bind(this), 500);
		}.bind(this), 500);
	});

	QUnit.test("Are filters properly cleaned up", async function (assert) {
		// Arrange
		var sCity = "sofia";

		// Act
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/filtering_static_filter.json");
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		// Assert
		assert.ok(this.oCard.getModel("filters").getData().category, "Category field is correct");
		assert.strictEqual(this.oCard.getModel("filters").getData().city.value, sCity, "City value is correct");

		// Act - change the manifest
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/filtering_static_filter_changed.json");

		await nextCardReadyEvent(this.oCard);

		sCity = "vienna";

		// Assert
		assert.notOk(this.oCard.getModel("filters").getData().category, "Category field is not the old one");
		assert.ok(this.oCard.getModel("filters").getData().category2, "Category field is correct");
		assert.strictEqual(this.oCard.getModel("filters").getData().city.value, sCity, "City value is correct");
	});

	QUnit.test("configurationChange event is fired", async function (assert) {
		// Arrange
		var oHost = new Host(),
			oFireConfigurationChangeSpy = sinon.spy(this.oCard, "fireConfigurationChange"),
			oFireCardConfigurationChangeHostSpy = sinon.spy(oHost, "fireCardConfigurationChange");

			// Act
		this.oCard.setHost(oHost);
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/filtering_static_filter.json");
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		// Act
		var oFilterBar = this.oCard.getAggregation("_filterBar"),
			oSelect = oFilterBar._getFilters()[0]._getSelect(),
			oSearchField = oFilterBar._getFilters()[2]._getSearchField(),
			oDdr = oFilterBar._getFilters()[3]._getDdr(),
			mArguments;

		// select filter
		oSelect.onSelectionChange({
			getParameter: function () {
				return oSelect.getItems()[0];
			}
		});

		await nextUIUpdate();

		assert.ok(oFireConfigurationChangeSpy.called, "configurationChange event is fired");
		assert.ok(oFireCardConfigurationChangeHostSpy.called, "cardConfigurationChange event of the Host is fired");

		mArguments = oFireConfigurationChangeSpy.args[0][0];
		assert.strictEqual(mArguments.changes["/sap.card/configuration/filters/category/value"], "flat_screens", "arguments are correct");

		mArguments = oFireCardConfigurationChangeHostSpy.args[0][0];
		assert.strictEqual(mArguments.changes["/sap.card/configuration/filters/category/value"], "flat_screens", "arguments are correct");
		assert.strictEqual(mArguments.card, this.oCard, "card parameter is correct");

		// search filter
		oSearchField.getInputElement().value = "A";
		oSearchField.onSearch();

		await nextUIUpdate();

		assert.strictEqual(oFireConfigurationChangeSpy.callCount, 2, "configurationChange event is fired");
		assert.strictEqual(oFireCardConfigurationChangeHostSpy.callCount, 2, "cardConfigurationChange event of the Host is fired");

		mArguments = oFireConfigurationChangeSpy.args[1][0];
		assert.strictEqual(mArguments.changes["/sap.card/configuration/filters/country/value"], "A", "arguments are correct");

		mArguments = oFireCardConfigurationChangeHostSpy.args[1][0];
		assert.strictEqual(mArguments.changes["/sap.card/configuration/filters/country/value"], "A", "arguments are correct");
		assert.strictEqual(mArguments.card, this.oCard, "card parameter is correct");

		// Dynamic Date Range filter
		oDdr._handleInputChange({
			getParameter: function () {
				return "Oct 4, 2021 - Oct 5, 2021";
			}
		});

		await nextUIUpdate();

		var oExpectedResult = {
			"option": "dateRange",
			"values": [
				UI5Date.getInstance("Oct 4, 2021"),
				UI5Date.getInstance("Oct 5, 2021")
			]
		};

		assert.strictEqual(oFireConfigurationChangeSpy.callCount, 3, "configurationChange event is fired");
		assert.strictEqual(oFireCardConfigurationChangeHostSpy.callCount, 3, "cardConfigurationChange event of the Host is fired");

		mArguments = oFireConfigurationChangeSpy.args[2][0];
		assert.deepEqual(mArguments.changes["/sap.card/configuration/filters/period/value"], oExpectedResult, "arguments are correct");

		mArguments = oFireCardConfigurationChangeHostSpy.args[2][0];
		assert.deepEqual(mArguments.changes["/sap.card/configuration/filters/period/value"], oExpectedResult, "arguments are correct");
		assert.strictEqual(mArguments.card, this.oCard, "card parameter is correct");

		// destory
		oFireConfigurationChangeSpy.reset();
		oFireCardConfigurationChangeHostSpy.reset();
		oHost.destroy();
	});

	QUnit.test("stateChange event is fired for select filter", async function (assert) {
		// Arrange
		var done = assert.async(),
			oHost = new Host();

		assert.expect(8);

		this.oCard.setHost(oHost);

		// Act
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/filtering_static_filter.json");
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var oFilterBar = this.oCard.getAggregation("_filterBar"),
			oSelect = oFilterBar._getFilters()[0]._getSelect(),
			oList = this.oCard.getCardContent().getAggregation("_content");

		this.oCard.attachEventOnce("stateChanged", () => {
			assert.ok(true, "stateChanged is initially fired");
		});

		oHost.attachEventOnce("cardStateChanged", () => {
			assert.ok(true, "cardStateChanged for host is initially fired");

			let iHostEventCount = 0;

			this.oCard.attachEvent("stateChanged", () => {
				assert.ok(true, "stateChanged is called after select filter change");
			});

			oHost.attachEvent("cardStateChanged", () => {
				assert.ok(true, "cardStateChanged for host is called after select filter change");
				iHostEventCount++;

				switch (iHostEventCount) {
					case 1:
						assert.strictEqual(oList.getItems()[0].getTitle(), "Notebook Basic 15", "content data is not yet filtered");
						break;
					default:
						assert.strictEqual(oList.getItems()[0].getTitle(), "Flat XXL", "content data is filtered");
						oHost.destroy();
						done();
						break;
				}
			});

			// Act - select filter
			oSelect.onSelectionChange({
				getParameter: function () {
					return oSelect.getItems()[0];
				}
			});
		});
	});

	QUnit.test("stateChange event is fired for search field", async function (assert) {
		// Arrange
		var done = assert.async(),
			oHost = new Host();

		assert.expect(4);

		// Act
		this.oCard.setHost(oHost);
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/filtering_static_filter.json");
		this.oCard.placeAt(DOM_RENDER_LOCATION);
		await nextCardReadyEvent(this.oCard);

		var oFilterBar = this.oCard.getAggregation("_filterBar"),
			oSearchField = oFilterBar._getFilters()[2]._getSearchField();

		this.oCard.attachEventOnce("stateChanged", () => {
			assert.ok(true, "stateChanged is initially fired");
		});

		oHost.attachEventOnce("cardStateChanged", () => {
			assert.ok(true, "cardStateChanged for host is initially fired");

			this.oCard.attachEventOnce("stateChanged", () => {
				assert.ok(true, "stateChanged is called after search filter change");
			});

			oHost.attachEventOnce("cardStateChanged", () => {
				assert.ok(true, "cardStateChanged for host is called after search filter change");

				oHost.destroy();
				done();
			});

			// Act - search filter
			oSearchField.getInputElement().value = "A";
			oSearchField.onSearch();
		});
	});

	QUnit.test("stateChange event is fired for date range filter", async function (assert) {
		// Arrange
		var done = assert.async(),
			oHost = new Host();

		assert.expect(4);

		// Act
		this.oCard.setHost(oHost);
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/filtering_static_filter.json");
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var oFilterBar = this.oCard.getAggregation("_filterBar"),
			oDdr = oFilterBar._getFilters()[3]._getDdr();

		this.oCard.attachEventOnce("stateChanged", () => {
			assert.ok(true, "stateChanged is initially fired");
		});

		oHost.attachEventOnce("cardStateChanged", () => {
			assert.ok(true, "cardStateChanged for host is initially fired");

			this.oCard.attachEventOnce("stateChanged", () => {
				assert.ok(true, "stateChanged is called after date range filter change");
			});

			oHost.attachEventOnce("cardStateChanged", () => {
				assert.ok(true, "cardStateChanged for host is called after date range filter change");

				oHost.destroy();
				done();
			});

			// Act - Dynamic Date Range filter
			oDdr._handleInputChange({
				getParameter: function () {
					return "Oct 4, 2021 - Oct 5, 2021";
				}
			});
		});
	});

	QUnit.test("stateChange event is fired for ComboBox filter", async function (assert) {
		// Arrange
		var done = assert.async(),
			oHost = new Host();

		assert.expect(4);

		// Act
		this.oCard.setHost(oHost);
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/combo_box_filter.json");
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var oFilterBar = this.oCard.getAggregation("_filterBar"),
			oComboBox = oFilterBar._getFilters()[0]._getComboBox();

		this.oCard.attachEventOnce("stateChanged", () => {
			assert.ok(true, "stateChanged is initially fired");
		});

		oHost.attachEventOnce("cardStateChanged", () => {
			assert.ok(true, "cardStateChanged for host is initially fired");

			this.oCard.attachEventOnce("stateChanged", () => {
				assert.ok(true, "stateChanged is called after ComboBox filter change");
			});

			oHost.attachEventOnce("cardStateChanged", () => {
				assert.ok(true, "cardStateChanged for host is called after ComboBox filter change");

				oHost.destroy();
				done();
			});

			// Act - select filter
			oComboBox.updateDomValue("Graphic Cards");
			oComboBox.onSelectionChange({
				getParameter: function () {
					return oComboBox.getItems()[1];
				}
			});
		});
	});

	QUnit.module("Visibility of filters", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Changing visibility of filters hides the Filter Bar", async function (assert) {
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/filtering_static_filter.json");
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var oFilterBar = this.oCard.getAggregation("_filterBar");

		assert.ok(oFilterBar.getDomRef(), "FilterBar is rendered in the card");

		oFilterBar._getFilters().forEach(function (oFilter) {
			oFilter.setVisible(false);
		});

		await nextUIUpdate();

		assert.notOk(oFilterBar.getDomRef(), "FilterBar is not rendered in the card when filters are not visible");

		oFilterBar._getFilters()[0].setVisible(true);

		await nextUIUpdate();

		assert.ok(oFilterBar.getDomRef(), "FilterBar is rendered again in the card");
	});

	QUnit.test("Setting visibility using parameter", async function (assert) {
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/filtering_static_filter.json");
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var oFilterBar = this.oCard.getAggregation("_filterBar"),
			aFilters = oFilterBar._getFilters(),
			oInvisibleFilter = aFilters.find(function (oFilter) { return oFilter.getKey() === "hiddenFilter"; });

		assert.strictEqual(oInvisibleFilter.getVisible(), false, "filter is not visible");
	});

	QUnit.module("Dynamic filters", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/manifests/"
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Loading a filter using a data request", async function (assert) {
		// Act
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/filtering_dynamic_filter.json");

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oFilterBar = this.oCard.getAggregation("_filterBar");
		var oFilter = oFilterBar._getFilters()[0];

		// Assert
		assert.strictEqual(oFilterBar._getFilters().length, 1, "The filter bar has 2 filters");
		assert.strictEqual(oFilter._getSelect().getSelectedKey(), "available", "property binding works");
		assert.strictEqual(oFilter._getSelect().getItems()[1].getKey(), "out_of_stock", "option has the expected key");
	});

	QUnit.test("Unable to load the filter", async function (assert) {
		// Arrange
		this.stub(RequestDataProvider.prototype, "getData").rejects("Fake data load error");

		// Act
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.filters.errorMessage",
				"type": "card"
			},
			"sap.card": {
				"configuration": {
					"filters": {
						"searchFilter": {
							"type": "Search",
							"data": {
								"request": {
									"url": "/some/url"
								}
							},
							"item": {
								"template": {
									"title": "{OptionName}",
									"key": "{OptionKey}"
								}
							}
						}
					}
				},
				"type": "Object",
				"content": {
					"groups": []
				}
			}
		});

		await nextCardReadyEvent(this.oCard);

		var oFilterBar = this.oCard.getAggregation("_filterBar");
		var sErrorText = oFilterBar._getFilters()[0].getAggregation("_error").getItems()[1].getText();
		var sExpectedErrorText = Library.getResourceBundleFor("sap.ui.integration").getText("CARD_FILTER_DATA_LOAD_ERROR");

		// Assert
		assert.strictEqual(sErrorText, sExpectedErrorText, "Error message is correct");
	});

	QUnit.module("Filter values - edge cases", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Double quotes in the SearchFilter", async function (assert) {
		// Arrange
		var done = assert.async();
		this.stub(RequestDataProvider.prototype, "getData")
			.onFirstCall().resolves()
			.onSecondCall().callsFake(function () {
				// Assert
				assert.ok(true, "Exception is NOT thrown when double quotes are part of the value");
				done();
				return Promise.resolve();
			});

		// Act
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.filters.search",
				"type": "card"
			},
			"sap.card": {
				"data": {
					"request": {
						"url": "{filters>/searchFilter/value}/some/url"
					}
				},
				"configuration": {
					"filters": {
						"searchFilter": {
							"type": "Search"
						}
					}
				},
				"type": "Object",
				"content": {
					"groups": []
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Arrange
		var oFilterBar = this.oCard.getAggregation("_filterBar");
		var oFilter = oFilterBar._getFilters()[0];

		// Act
		oFilter.getField().$("I").trigger("focus").val("\"city\"").trigger("input");
		QUnitUtils.triggerKeydown(oFilter.getField().getDomRef("I"), KeyCodes.ENTER);
	});

});