/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/each",
	"sap/base/Log",
	"sap/ui/core/EventBus",
	"sap/ui/core/IconPool",
	"sap/ui/core/Lib",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/OverlayUtil",
	"sap/ui/fl/write/api/FieldExtensibility",
	"sap/ui/rta/plugin/additionalElements/ActionExtractor",
	"sap/ui/rta/plugin/additionalElements/AddElementsDialog",
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsAnalyzer",
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsUtils",
	"sap/ui/rta/plugin/additionalElements/CommandBuilder",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/Utils"
], function(
	each,
	Log,
	EventBus,
	IconPool,
	Lib,
	OverlayRegistry,
	OverlayUtil,
	FieldExtensibility,
	ActionExtractor,
	AddElementsDialog,
	AdditionalElementsAnalyzer,
	AdditionalElementsUtils,
	CommandBuilder,
	Plugin,
	Utils
) {
	"use strict";

	const SINGULAR = true;
	const PLURAL = false;

	function isThereAnAggregationActionForSameAggregation(mActions, mParents) {
		const sResponsibleElementsParentAggregation = mParents.responsibleElementOverlay.getParentAggregationOverlay().getAggregationName();
		return Object.keys(mActions).some(function(sAggregationName) {
			return sAggregationName === sResponsibleElementsParentAggregation;
		});
	}

	/**
	 * Utility function to check if the OData service is updated in the meantime
	 *
	 * @param {sap.ui.core.Control} oControl - Control to be checked
	 * @returns {Promise} Resolves if service is up to date, rejects otherwise
	 */
	async function isServiceUpToDate(oControl) {
		const oModel = oControl.getModel();
		if (oModel && oModel.sServiceUrl) {
			const bServiceOutdated = await FieldExtensibility.isServiceOutdated(oModel.sServiceUrl);
			if (bServiceOutdated) {
				FieldExtensibility.setServiceValid(oModel.sServiceUrl);
				// needs FLP to trigger UI restart popup
				EventBus.getInstance().publish("sap.ui.core.UnrecoverableClientStateCorruption", "RequestReload", {});
			}
		}
	}

	async function loadExtensibilityInfo(oControl) {
		await FieldExtensibility.onControlSelected(oControl);
		const bExtensibilityEnabled = await FieldExtensibility.isExtensibilityEnabled(oControl);

		if (bExtensibilityEnabled) {
			await isServiceUpToDate(oControl);
			const oExtensibilityInfo = await FieldExtensibility.getExtensionData(oControl);
			if (oExtensibilityInfo) {
				oExtensibilityInfo.UITexts = await FieldExtensibility.getTexts() || {};
			}
			return oExtensibilityInfo;
		}
		return undefined;
	}

	// Configure the dialog elements related to extensibility
	function configureExtensibility(bOverlayIsSibling) {
		const oExtensibilityInfo = this.getExtensibilityInfo(bOverlayIsSibling);
		if (!oExtensibilityInfo) {
			this.getDialog().setCustomFieldButtonVisible(false);
			return;
		}
		const aExtensibilityOptions = oExtensibilityInfo.UITexts?.options;
		if (!aExtensibilityOptions) {
			// Legacy implementation (CustomFieldButton) does not have "options" in the UI Texts
			const oTextResources = Lib.getResourceBundleFor("sap.ui.rta");
			oExtensibilityInfo.UITexts.options = [
				{
					actionKey: undefined,
					text: oTextResources.getText("BTN_ADDITIONAL_ELEMENTS_CREATE_CUSTOM_FIELDS"),
					tooltip: oExtensibilityInfo.UITexts.tooltip
				}
			];
		}

		this.getDialog().setExtensibilityOptions(oExtensibilityInfo);
		this.getDialog().detachEvent("triggerExtensibilityAction", this._onTriggerExtensibilityAction, this);
		this.getDialog().attachEvent("triggerExtensibilityAction", bOverlayIsSibling, this._onTriggerExtensibilityAction, this);
		this.getDialog().addExtensibilityInfo(oExtensibilityInfo);
	}

	/**
	 * Constructor for a new Additional Elements Plugin.
	 *
	 * The AdditionalElementsPlugin should handle the orchestration
	 * of the AdditionalElementsAnalyzer, the dialog and the command creation
	 *
	 * @param {string} [sId] - Id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] - Initial settings for the new object
	 * @class The plugin allows to add additional elements that exist either hidden in the UI or in the OData service
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.44
	 * @alias sap.ui.rta.plugin.additionalElements.AdditionalElementsPlugin
	 */
	const AdditionalElementsPlugin = Plugin.extend("sap.ui.rta.plugin.additionalElements.AdditionalElementsPlugin", {
		// eslint-disable-next-line object-shorthand
		constructor: function(...aArgs) {
			this._getMenuItemsPromise = Promise.resolve();
			const [oPropertyBag] = aArgs;
			oPropertyBag.dialog = new AddElementsDialog();
			Plugin.apply(this, aArgs);
		},
		metadata: {
			// ---- object ----

			// ---- control specific ----
			library: "sap.ui.rta",
			properties: {
				commandFactory: "object"
			},
			aggregations: {
				dialog: { type: "sap.ui.rta.plugin.additionalElements.AddElementsDialog", multiple: false }
			},
			associations: {},
			events: {}
		},

		// For add elements plugin, include other aggregations which are potentially valid targets for hidden elements
		_getRelevantOverlays(oOverlay) {
			const aRelevantOverlays = OverlayUtil.findAllOverlaysInContainer(oOverlay, /* bIncludeOtherAggregations= */true);

			oOverlay.setRelevantOverlays(aRelevantOverlays);
			return aRelevantOverlays;
		},

		getContextMenuText(bOverlayIsSibling, oOverlay, sAggregationName, bHasSubMenu) {
			let oTextResources;

			function getGenericText() {
				oTextResources = Lib.getResourceBundleFor("sap.ui.rta");
				return oTextResources.getText("CTX_ADD_ELEMENTS", [oTextResources.getText("MULTIPLE_CONTROL_NAME")]);
			}

			// When adding custom fields to a parent we don't know which control type will be added,
			// nor to which aggregation, so we just show a generic entry "Add: Content"
			if (sAggregationName === "$$OnlyChildCustomField$$") {
				return getGenericText();
			}

			// When a submenu is present, the text is always the same
			if (bHasSubMenu) {
				oTextResources = Lib.getResourceBundleFor("sap.ui.rta");
				return oTextResources.getText("CTX_ADD_ELEMENTS_WITH_SUBMENU");
			}
			const mParents = AdditionalElementsUtils.getParents(bOverlayIsSibling, oOverlay, this);
			const mAllActions = ActionExtractor.getActionsOrUndef(bOverlayIsSibling, oOverlay);
			sAggregationName ||= Object.keys(mAllActions)[0];
			const mActions = mAllActions[sAggregationName];

			// Safeguarding
			if (!mActions) {
				return getGenericText();
			}
			mActions.aggregation = sAggregationName;
			return AdditionalElementsUtils.getText("CTX_ADD_ELEMENTS", mActions, mParents.parent, SINGULAR);
		},

		isAvailable(aElementOverlays, bOverlayIsSibling) {
			return aElementOverlays.every(function(oElementOverlay) {
				return this._isEditableByPlugin(oElementOverlay, bOverlayIsSibling);
			}, this);
		},

		isEnabled(aElementOverlays, bOverlayIsSibling, sAggregationName) {
			if (aElementOverlays.length > 1) {
				return false;
			}

			if (this.getExtensibilityInfo(bOverlayIsSibling)) {
				return true;
			}

			const oOverlay = this.getResponsibleElementOverlay(aElementOverlays[0]);
			let oParentOverlay;
			let bIsEnabled = false;
			if (bOverlayIsSibling) {
				oParentOverlay = oOverlay.getParentElementOverlay();
				if (oParentOverlay) {
					bIsEnabled = true;
				}
			} else {
				const mAllActions = ActionExtractor.getActionsOrUndef(bOverlayIsSibling, oOverlay);
				const mActions = mAllActions[sAggregationName];
				if (
					mActions &&
					((mActions.reveal && mActions.reveal.elements.length > 0)
					|| mActions.addViaDelegate)
				) {
					bIsEnabled = true;
				}
			}

			const oCachedElements = this.getCachedElements(bOverlayIsSibling);
			const bElementsAvailable = !!(oCachedElements && oCachedElements.length > 0);
			bIsEnabled &&= bElementsAvailable;
			return bIsEnabled;
		},

		/**
		 * Register an overlay
		 * If the MetaModel was not loaded yet when evaluating addViaDelegate, the
		 * plugin returns editable = false. Therefore we must make an extra check after
		 * the MetaModel is loaded.
		 * @param {sap.ui.dt.Overlay} oOverlay - Overlay object
		 * @override
		 */
		async registerElementOverlay(...aArgs) {
			const [oOverlay] = aArgs;
			const oModel = oOverlay.getElement().getModel();
			if (oModel) {
				const oMetaModel = oModel.getMetaModel();
				if (oMetaModel && oMetaModel.loaded) {
					await oMetaModel.loaded();
					this.evaluateEditable([oOverlay], {onRegistration: true});
				}
			}
			Plugin.prototype.registerElementOverlay.apply(this, aArgs);
		},

		_checkIfCreateFunctionIsAvailable(mChangeHandlerSettings) {
			return !mChangeHandlerSettings ||
				(
					mChangeHandlerSettings &&
					mChangeHandlerSettings.content &&
					mChangeHandlerSettings.content.createFunction
				);
		},

		/**
		 * Opens a dialog containing all the elements that can be added for a control and aggregation
		 * @param {boolean} bOverlayIsSibling - Indicates if the elements should be added as sibling (true) or child (false) to the overlay
		 * @param {string} sAggregationName - The name of the aggregation to where the elements can be added
		 * @param {Array<sap.ui.dt.ElementOverlay>} aResponsibleElementOverlays - Array containing the overlay of the control
		 * @param {number} [iIndex] - The position where the element will be added
		 * @param {string} [sControlName] - The name of the control
		 * @param {sDisplayText} [sDisplayText] - The display text of the control for the dialog
		 *
		 * @returns {Promise} Resolves when the dialog closes
		 */
		async showAvailableElements(bOverlayIsSibling, sAggregationName, aResponsibleElementOverlays, iIndex, sControlName, sDisplayText) {
			const oResponsibleElementOverlay = aResponsibleElementOverlays[0];
			const mParents = AdditionalElementsUtils.getParents(bOverlayIsSibling, oResponsibleElementOverlay, this);
			const vSiblingElement = bOverlayIsSibling && oResponsibleElementOverlay.getElement();

			const mRetrievedActions = await ActionExtractor.getActions(bOverlayIsSibling, oResponsibleElementOverlay, this, undefined, this.getDesignTime());
			let aCollectedElements = [];
			const mActions = mRetrievedActions[sAggregationName];
			if (sAggregationName !== "$$OnlyChildCustomField$$") {
				try {
					aCollectedElements = await this.getAllElements(bOverlayIsSibling, [mParents.responsibleElementOverlay], sControlName, sDisplayText);
				} catch (oError) {
					if (oError instanceof Error) {
						throw oError;
					} else {
						Log.info("Service not up to date, skipping add dialog", "sap.ui.rta");
						return;
					}
				}
			}

			configureExtensibility.call(this, bOverlayIsSibling);
			const oAggregationWithElements = aCollectedElements.filter(function(mElementsPerAggregation) {
				return mElementsPerAggregation.aggregation === sAggregationName;
			})[0];
			const aElementsPerAggregation = oAggregationWithElements ? oAggregationWithElements.elements : [];

			this.getDialog().setElements(aElementsPerAggregation);
			if (sDisplayText) {
				// Aggregation is part of title
				const oTextResources = Lib.getResourceBundleFor("sap.ui.rta");
				const sDialogTitle = oTextResources.getText("HEADER_ADDITIONAL_ELEMENTS_WITH_AGGREGATION", [sDisplayText]);
				this.getDialog().setTitle(sDialogTitle);
			} else if (sAggregationName || sControlName) {
				// Only one aggregation, no aggregation in title
				this._setDialogTitle(mActions || {}, mParents.parent, sControlName);
			}

			try {
				await this.getDialog().open();

				const aSelectedElements = this.getDialog().getSelectedElements();
				await CommandBuilder.createCommands(mParents,
					vSiblingElement,
					mActions,
					iIndex,
					aSelectedElements,
					sAggregationName,
					this
				);

				const oOverlayToFocus = OverlayRegistry.getOverlay(vSiblingElement) || oResponsibleElementOverlay;
				oOverlayToFocus.focus();
			} catch (oError) {
				// no error means canceled dialog
				if (oError instanceof Error) {
					throw oError;
				}
			}
		},

		_setDialogTitle(mActions, oParentElement, sControlName) {
			const sDialogTitle = AdditionalElementsUtils.getText(
				"HEADER_ADDITIONAL_ELEMENTS",
				mActions,
				oParentElement,
				PLURAL,
				sControlName
			);
			this.getDialog().setTitle(sDialogTitle);
		},

		// Function called when custom field button was pressed
		_onTriggerExtensibilityAction(oEvent, bOverlayIsSibling) {
			const sRtaStyleClassName = Utils.getRtaStyleClassName();
			const sActionKey = oEvent.getParameters().actionKey;
			return FieldExtensibility.onTriggerCreateExtensionData(
				this.getExtensibilityInfo(bOverlayIsSibling),
				sRtaStyleClassName,
				sActionKey
			);
		},

		/**
		 * This function gets called on startup. It checks if the Overlay is editable by this plugin.
		 * @param {sap.ui.dt.Overlay} oOverlay - Overlay to be checked
		 * @param {object} mPropertyBag - Additional data for the check
		 * @returns {object} Returns object with editable boolean values for "asChild" and "asSibling"
		 * @override
		 */
		async _isEditable(oOverlay, mPropertyBag) {
			try {
				const [bAsSibling, bAsChild] = await Promise.all([
					this._isEditableCheck(mPropertyBag.sourceElementOverlay, true),
					this._isEditableCheck(mPropertyBag.sourceElementOverlay, false)
				]);
				return {
					asSibling: bAsSibling,
					asChild: bAsChild
				};
			} catch (oError) {
				Log.error(oError);
			}
		},

		async _isEditableCheck(oOverlay, bOverlayIsSibling) {
			const mParents = AdditionalElementsUtils.getParents(bOverlayIsSibling, oOverlay, this);

			if (!mParents.relevantContainerOverlay) {
				return false;
			}

			const mActions = await ActionExtractor.getActions(bOverlayIsSibling, oOverlay, this, true, this.getDesignTime());
			// Prevents clear cached elements during the getMenuItems promise is pending
			await this._getMenuItemsPromise;
			this.clearCachedElements();
			return Utils.doIfAllControlsAreAvailable([oOverlay, mParents.parentOverlay], function() {
				let bEditable = false;
				// For the sibling case, check if anything is available for the same aggregation
				if (bOverlayIsSibling) {
					bEditable = isThereAnAggregationActionForSameAggregation(mActions, mParents);
				} else {
					bEditable = Object.keys(mActions).some(function(sAggregationName) {
						if (mActions[sAggregationName].addViaDelegate) {
							bEditable = this.checkAggregationsOnSelf(mParents.parentOverlay, "add", undefined, "delegate");
						}
						if (!bEditable && mActions[sAggregationName].reveal) {
							return true;
						}
						return bEditable;
					}.bind(this));
				}

				bEditable &&= this.hasStableId(oOverlay) && this.hasStableId(mParents.parentOverlay);
				return bEditable;
			}.bind(this));
		},

		/**
		 * Returns all the elements that can be added to a control
	 	 * @param {boolean} bOverlayIsSibling - Indicates if the elements would be added as sibling (instead of child)
		 * @param {Array<sap.ui.dt.ElementOverlay>} aElementOverlays - Array containing the overlay of the control
		 * @returns {Array} An array with all elements
		 * @protected
		 */
		async getAllElements(bOverlayIsSibling, aElementOverlays) {
			const oElementOverlay = aElementOverlays[0];
			const mParents = AdditionalElementsUtils.getParents(bOverlayIsSibling, oElementOverlay, this);
			let mActions;
			const aPromises = [];
			let bCheckExtensibility = false;
			const aCachedElements = this.getCachedElements(bOverlayIsSibling);

			if (aCachedElements) {
				return aCachedElements;
			}

			this.clearExtensibilityInfo(bOverlayIsSibling);

			const mAllActions = await ActionExtractor.getActions(bOverlayIsSibling, oElementOverlay, this, undefined, this.getDesignTime());
			each(mAllActions, function(sAggregationName) {
				mActions = mAllActions[sAggregationName];
				mActions.aggregation = sAggregationName;
				if (mActions.addViaDelegate) {
					bCheckExtensibility = true;
				}
				aPromises.push({
					aggregation: sAggregationName,
					elementPromises: [
						mActions.reveal
							? AdditionalElementsAnalyzer.enhanceInvisibleElements(mParents.parent, mActions)
							: Promise.resolve([]),
						mActions.addViaDelegate
							? AdditionalElementsAnalyzer.getUnrepresentedDelegateProperties(mParents.parent, mActions.addViaDelegate)
							: Promise.resolve([])
					]
				});
			});
			const oExtensibilityInfo = bCheckExtensibility && await loadExtensibilityInfo(mParents.parent);

			this.setExtensibilityInfo(bOverlayIsSibling, oExtensibilityInfo);
			const aAllElements = await this._combineAnalyzerResults(aPromises);

			this.setCachedElements(aAllElements, bOverlayIsSibling);
			return aAllElements;
		},

		/**
		 * Retrieves the context menu item for the actions
		 * Two items are returned here: one for when the overlay is sibling and one for when it is child. In case of multiple
		 * aggregations for child elements, a submenu is built containing all aggregations and the sibling.
		 * @param {sap.ui.dt.ElementOverlay} aElementOverlays - List of overlays for which the context menu was opened
		 * @returns {object[]} Array containing the items with required data
		 */
		getMenuItems(aElementOverlays) {
			const aMenuItems = [];
			let oMenuItem;
			this.clearCachedElements();
			// Prevents clearing of cached elements before menu items are build. This happens when evaluate editable is running in parallel
			this._getMenuItemsPromise =
			// getAllElements() is called to set cached elements for the overlay -> which will result in menu item being enabled
			Promise.all([
				this.getAllElements(false, aElementOverlays),
				this.getAllElements(true, aElementOverlays)
			])
			.then(function(aElementsWithAggregations) {
				const bHasChildren = aElementsWithAggregations[0].length > 0;
				const bHasMultipleAggregations = aElementsWithAggregations[0].length > 1;
				const bHasSiblings = aElementsWithAggregations[1].length > 0;
				const bIsAvailableForChildren = this.isAvailable(aElementOverlays, false);
				const bIsAvailableForSibling = this.isAvailable(aElementOverlays, true);
				if (
					bIsAvailableForSibling
					&& (!bIsAvailableForChildren || !bHasChildren)
				) {
					// Case 1: Only siblings -> No submenu required
					oMenuItem = this._buildMenuItem(
						"CTX_ADD_ELEMENTS_AS_SIBLING",
						true,
						aElementOverlays,
						aElementsWithAggregations,
						false
					);
				} else if (
					bIsAvailableForChildren
					&& (!bIsAvailableForSibling || !bHasSiblings)
					&& !bHasMultipleAggregations
				) {
					// Case 2: Only children, one aggregation -> No submenu required
					oMenuItem = this._buildMenuItem(
						"CTX_ADD_ELEMENTS_AS_CHILD",
						false,
						aElementOverlays,
						aElementsWithAggregations,
						false
					);
				} else if (
					bIsAvailableForChildren
					&& (!bIsAvailableForSibling || !bHasSiblings)
					&& bHasMultipleAggregations
				) {
					// Case 3: Only children, multiple aggregations -> Submenu required
					oMenuItem = this._buildMenuItem(
						"CTX_ADD_ELEMENTS_AS_CHILD",
						false,
						aElementOverlays,
						aElementsWithAggregations,
						true
					);
				} else if (
					bIsAvailableForChildren
					&& bIsAvailableForSibling
					&& bHasChildren
					&& bHasSiblings
				) {
					// Case 4: Children and siblings -> Submenu required
					oMenuItem = this._buildMenuItem(
						"CTX_ADD_ELEMENTS_CHILD_AND_SIBLING",
						false,
						aElementOverlays,
						aElementsWithAggregations,
						true
					);
				}
				if (oMenuItem) {
					aMenuItems.push(this.enhanceItemWithResponsibleElement(
						oMenuItem,
						aElementOverlays,
						["addViaDelegate", "reveal", "custom"]
					));
				}
				return aMenuItems;
			}.bind(this));
			return this._getMenuItemsPromise;
		},

		_buildMenuItem(sPluginId, bOverlayIsSibling, aElementOverlays, aElementsWithAggregations, bHasSubMenu) {
			let aSubMenuItems;
			let vHandler;
			let sAggregationName;
			const oSelectedOverlay = aElementOverlays[0];

			if (bOverlayIsSibling) {
				const mParents = AdditionalElementsUtils.getParents(bOverlayIsSibling, oSelectedOverlay, this);
				sAggregationName = mParents.responsibleElementOverlay.getParentAggregationOverlay().getAggregationName();
			} else {
				// If there are no elements available but the action is still available, the dialog will open just to allow
				// adding custom fields. When clicking on the parent, the aggregation name is irrelevant for the dialog
				// since the field will be added to the underlying data model.
				const bOnlyCustomField = aElementsWithAggregations[0].length === 0 && aElementsWithAggregations[1].length === 0;
				sAggregationName = bOnlyCustomField ? "$$OnlyChildCustomField$$" :
					// If only one child aggregation has invisible elements, get its aggregation name
					aElementsWithAggregations[0] && aElementsWithAggregations[0][0] && aElementsWithAggregations[0][0].aggregation;
			}
			if (bHasSubMenu) {
				// The children are displayed before the sibling
				aSubMenuItems = this._buildSubmenuItems(false, aElementOverlays, aElementsWithAggregations[0]);
				if (sPluginId === "CTX_ADD_ELEMENTS_CHILD_AND_SIBLING") {
					aSubMenuItems = aSubMenuItems.concat(this._buildSubmenuItems(true, aElementOverlays, aElementsWithAggregations[1]));
				}
			} else {
				vHandler = function(bOverlayIsSibling, aElementOverlays) {
					return this.showAvailableElements(bOverlayIsSibling, sAggregationName, aElementOverlays);
				}.bind(this, bOverlayIsSibling);
			}
			const oMenuItem = {
				id: sPluginId,
				text: this.getContextMenuText.bind(this, bOverlayIsSibling, oSelectedOverlay, sAggregationName, bHasSubMenu),
				enabled: bHasSubMenu || function(bOverlayIsSibling, aElementOverlays) {
					return this.isEnabled(aElementOverlays, bOverlayIsSibling, sAggregationName);
				}.bind(this, bOverlayIsSibling),
				rank: this.getRank(sPluginId),
				icon: "sap-icon://add",
				handler: vHandler
			};
			if (bHasSubMenu) {
				oMenuItem.submenu = aSubMenuItems;
			}
			return oMenuItem;
		},

		_buildSubmenuItems(bOverlayIsSibling, aElementOverlays, aElementsWithAggregation) {
			const aSubMenuItems = [];
			const sPluginId = bOverlayIsSibling ? "CTX_ADD_ELEMENTS_AS_SIBLING" : "CTX_ADD_ELEMENTS_AS_CHILD";
			let iPosition = 0;

			// register BusinessSuite icon font
			IconPool.registerFont({
				collectionName: "BusinessSuiteInAppSymbols",
				fontFamily: "BusinessSuiteInAppSymbols",
				fontURI: sap.ui.require.toUrl("sap/ushell/themes/base/fonts/"),
				lazy: true
			});

			function getMenuItemText(bOverlayIsSibling, sAggregationName, oElementOverlay) {
				oElementOverlay = bOverlayIsSibling ? oElementOverlay.getParentElementOverlay() : oElementOverlay;
				const oElementOverlayMetadata = oElementOverlay.getDesignTimeMetadata();
				const mNames = oElementOverlayMetadata.getAggregationDisplayName(sAggregationName, oElementOverlay.getElement());
				return mNames ? mNames.plural : sAggregationName;
			}
			aElementsWithAggregation.forEach(function(mElementsWithAggregation) {
				const sAggregationName = mElementsWithAggregation.aggregation;
				const oResponsibleElementOverlay = this.getResponsibleElementOverlay(aElementOverlays[0]);
				const sDisplayText = getMenuItemText(bOverlayIsSibling, sAggregationName, oResponsibleElementOverlay);
				const oItem = {
					id: `${sPluginId}_${iPosition}`,
					text: sDisplayText,
					enabled: function(aElementOverlays) {
						return this.isEnabled(aElementOverlays, bOverlayIsSibling, sAggregationName);
					}.bind(this),
					handler: function(bOverlayIsSibling, aElementOverlays) {
						// showAvailableElements has optional parameters
						return this.showAvailableElements(
							bOverlayIsSibling,
							sAggregationName,
							aElementOverlays,
							undefined,
							undefined,
							sDisplayText
						);
					}.bind(this, bOverlayIsSibling),
					icon: bOverlayIsSibling ? "sap-icon://BusinessSuiteInAppSymbols/icon-add-outside" : "sap-icon://add"
				};
				aSubMenuItems.push(this.enhanceItemWithResponsibleElement(oItem, aElementOverlays, ["addViaDelegate", "reveal", "custom"]));
				iPosition++;
			}.bind(this));
			return aSubMenuItems;
		},

		// aAllPromises:
		// [
		// 	{
		// 		aggregation: "aggregation1",
		// 		elementPromises: [
		// 			revealPromise,
		// 			addViaDelegatePromise
		// 		]
		// 	},
		// 	{
		// 		aggregation: "aggregation2",
		// 		elementPromises: [
		// 			revealPromise,
		// 			addViaDelegatePromise
		// 		]
		// 	}
		// 	...
		// ]
		//
		// Return:
		// [
		// 	{
		// 		aggregation: "aggregation1",
		// 		elements: [...]
		// 	},
		// 	{
		// 		aggregation: "aggregation2",
		// 		elements: [...]
		// 	}
		// ]
		async _combineAnalyzerResults(aAllPromises) {
			const aCollectedPromises = [];

			aAllPromises.forEach(function(aPromisesByAggregation) {
				aCollectedPromises.push(
					Promise.all(aPromisesByAggregation.elementPromises).then(function(aAnalyzerValues) {
						const aRevealElements = aAnalyzerValues[0];
						const aAddViaDelegateElements = aAnalyzerValues[1];
						const aAllElements = aRevealElements.concat(aAddViaDelegateElements);
						return {
							aggregation: aPromisesByAggregation.aggregation,
							elements: aAllElements
						};
					})
				);
			});

			const aElementsPerAggregation = await Promise.all(aCollectedPromises);
			// Filter out results without elements
			return aElementsPerAggregation.filter(function(oElementsPerAggregation) {
				const aElements = oElementsPerAggregation && oElementsPerAggregation.elements;
				return aElements.length > 0;
			});
		},

		clearCachedElements() {
			this._oCachedElements = undefined;
		},

		setCachedElements(aElements, bOverlayIsSibling) {
			this._oCachedElements ||= {};
			this._oCachedElements[bOverlayIsSibling ? "asSibling" : "asChild"] = aElements;
		},

		getCachedElements(bOverlayIsSibling) {
			if (this._oCachedElements) {
				return this._oCachedElements[bOverlayIsSibling ? "asSibling" : "asChild"];
			}
			return undefined;
		},

		clearExtensibilityInfo(bOverlayIsSibling) {
			if (this._oExtensibilityInfo) {
				this._oExtensibilityInfo[bOverlayIsSibling ? "asSibling" : "asChild"] = undefined;
			}
		},

		setExtensibilityInfo(bOverlayIsSibling, oExtensibilityInfo) {
			this._oExtensibilityInfo ||= {};
			this._oExtensibilityInfo[bOverlayIsSibling ? "asSibling" : "asChild"] = oExtensibilityInfo;
		},

		getExtensibilityInfo(bOverlayIsSibling) {
			if (this._oExtensibilityInfo) {
				return this._oExtensibilityInfo[bOverlayIsSibling ? "asSibling" : "asChild"];
			}
			return undefined;
		},

		exit(...aArgs) {
			this.getDialog().destroy();
			if (Plugin.prototype.exit) {
				Plugin.prototype.exit.apply(this, aArgs);
			}
		}

	});

	return AdditionalElementsPlugin;
});
