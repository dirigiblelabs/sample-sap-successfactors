sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel"
], function(Device, UIComponent, JSONModel) {
	"use strict";

	return UIComponent.extend("sample.timeschedule.Component", {

		metadata : {
			manifest : "json"
		},

		init : function() {
			UIComponent.prototype.init.apply(this, arguments);

			this.setModel(new JSONModel({ isPhone : Device.system.phone }), "device");
			
			this.getRouter().initialize();
		},

	});

});
