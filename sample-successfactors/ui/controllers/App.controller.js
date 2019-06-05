sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/IconPool"
], function (Controller, IconPool) {
	"use strict";

	return Controller.extend("sample.timeschedule.ui.controllers.App", {
		onInit : function() {
			IconPool.addIcon("fa-sun", "fa-collection", "FontAwesome", "f185", true);
			IconPool.addIcon("fa-moon", "fa-collection", "FontAwesome", "f186", true);
		}
	});

});
