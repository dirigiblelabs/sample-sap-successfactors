var response = require("http/v4/response");
var configurations = require("core/v4/configurations");
var EmployeeTime = require("sap-successfactors-ec/TimeOff/EmployeeTime");
var User = require("sap-successfactors-platform/UserManagement/User");
var Photo = require("sap-successfactors-platform/ExternalUser/Photo");
var DateUtils = require("sample-successfactors/api/DateUtils");

var authConfiguration = {
	host: "https://sandbox.api.sap.com/successfactors",
	headers: [{
		name: "apikey",
		value: configurations.get("API_KEY")
	}]
};

var employeeTimeClient = EmployeeTime.getClient(authConfiguration);
var count = employeeTimeClient.count(EmployeeTime.queryBuilder()
	.filter(
			EmployeeTime.START_TIME.ne(null)
			.and(EmployeeTime.START_DATE.ge(new Date(2016, 0, 1)))
			.and(EmployeeTime.TIME_TYPE.eq("WORK"))
		)
	.build()
);

response.println("Count: " + count);