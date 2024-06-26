sap.ui.define([
	"sap/ui/core/Messaging",
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/message/Message',
	'sap/ui/core/message/MessageType'
], function(
	Messaging,
	Controller,
	Message,
	MessageType
) {
		"use strict";

		return Controller.extend("sap.m.sample.MessageViewMessageManager.controller.MessageViewMessageManager", {
			onInit: function () {
				this.oView = this.getView();

				// connect Message Manager
				this._MessageManager = Messaging;
				this._MessageManager.registerObject(this.oView.byId("messageHandlingPage"), true);
				this.oView.setModel(this._MessageManager.getMessageModel(), "message");

				this._addMockMessages();
			},

			_addMockMessages: function () {
				if (this._MessageManager && !this._MessageManager.getMessageModel().oData.length) {
					var that = this;
					this._MessageManager.addMessages(
						[
							new Message({
								message: "Error message",
								type: MessageType.Error,
								additionalText: "Example of additionalText",
								description: "Example of description",
								target: "message",
								processor: that.getView().getModel()
							}),
							new Message({
								message: "Information message",
								type: MessageType.Information,
								additionalText: "Example of additionalText",
								description: "Example of description",
								target: "message",
								processor: that.getView().getModel()
							}),
							new Message({
								message: "Success message",
								type: MessageType.Success,
								additionalText: "Example of additionalText",
								description: "Example of description",
								target: "message",
								processor: that.getView().getModel()
							}),
							new Message({
								message: "Warning message",
								type: MessageType.Warning,
								additionalText: "Example of additionalText",
								description: "Example of description",
								target: "message",
								processor: that.getView().getModel()
							})
						]
					);
				}
			}
		});
	});
