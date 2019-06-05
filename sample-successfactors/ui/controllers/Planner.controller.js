sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"

], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sample.timeschedule.ui.controllers.Planner", {

		onInit : function() {
			var schedulePlanningCalendar = this.byId("schedulePlanningCalendar");
			if (schedulePlanningCalendar) {
				schedulePlanningCalendar.setBuiltInViews(["Week", "One Month"]);
			}

			var view = this.getView();
			view.setBusy(true);
			jQuery.ajax({
				type: "GET",
				url : "/services/v3/js/sample-successfactors/api/EmployeeTime.js",
				context: this
			})
			.done(function (data) {
				var managedEmployees = new JSONModel();
				view.setModel(managedEmployees, "managedEmployees");
				schedulePlanningCalendar.setStartDate(new Date(data[0].appointments[0].start));
				managedEmployees.setData({
					employees: data.map(function (user) {
						user.appointments = user.appointments.map(function (e) {
							e.start = new Date(e.start);
							e.end = new Date(e.end);
							return e;
						});
						return user;
					})
				});
				view.setBusy(false);
			});
		},
		
	});
});
