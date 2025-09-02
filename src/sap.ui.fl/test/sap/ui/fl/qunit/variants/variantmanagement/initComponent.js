sap.ui.require([
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Core"
], function(Component, ComponentContainer, Core) {
	"use strict";

	Core.ready().then(async () => {
		const oComponent = await Component.create({
			name: "sap.ui.fl.sample.variantmanagement",
			url: "./",
			id: "Comp1"
		});
		const oCompCont = new ComponentContainer("CompCont1", {
			component: oComponent
		});
		oCompCont.placeAt("target1");
	});
});