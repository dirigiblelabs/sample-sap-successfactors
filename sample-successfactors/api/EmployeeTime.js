var response = require("http/v4/response");
var configurations = require("core/v4/configurations");
var EmployeeTime = require("sap-successfactors-ec/TimeOff/EmployeeTime");
var User = require("sap-successfactors-platform/UserManagement/User");
var Photo = require("sap-successfactors-platform/ExternalUser/Photo");
var DateUtils = require("sample-successfactors/api/DateUtils");

var host = configurations.get("SFSF_HOST");
var authHeader = host ? "Authorization" : "apikey";
host = host ? host : "https://sandbox.api.sap.com/successfactors";
var authToken = configurations.get("SFSF_AUTH_TOKEN");

var headers = []
var authConfiguration = {
	host: host,
	headers: [{
		name: authHeader,
		value: authToken
	}]
};

var employeeTimes = getEmployeeTimes(authConfiguration);
var users = getUsers(authConfiguration, employeeTimes);
addPhotos(authConfiguration, users);

var data = formatData(users);

response.setContentType("application/json");
response.println(JSON.stringify(data));

function getEmployeeTimes(authConfiguration) {
	var employeeTimeClient = EmployeeTime.getClient(authConfiguration);
	var data = employeeTimeClient.list(EmployeeTime.queryBuilder()
		.select(
			EmployeeTime.USER_ID,
			EmployeeTime.TIME_TYPE,
			EmployeeTime.START_DATE,
			EmployeeTime.START_TIME,
			EmployeeTime.END_DATE,
			EmployeeTime.END_TIME,
			EmployeeTime.QUANTITY_IN_HOURS
		)
		.filter(
			EmployeeTime.START_TIME.ne(null)
			.and(EmployeeTime.START_DATE.ge(new Date(2019, 0, 1)))
		)
		.build()
	);

	return data.d.results;
}

function getUsers(authConfiguration, employeeTimes) {
	var userClient = User.getClient(authConfiguration);
	var users = {};
	for (var i = 0; i < employeeTimes.length; i ++) {
		users[employeeTimes[i][EmployeeTime.USER_ID]] = {};
	}
	
	var usersFilter = null;
	for (var userId in users) {
		var filter = User.USER_ID.eq(userId);
		if (!usersFilter) {
			usersFilter = filter;
			continue;
		}
		usersFilter = usersFilter.or(filter);
	}

	var usersData = userClient.list(User.queryBuilder()
		.select(
			User.FIRST_NAME,
			User.LAST_NAME,
			User.USERNAME,
			User.USER_ID
		)
		.filter(usersFilter)
		.build()
	).d.results;

	for (var i = 0; i < usersData.length; i ++) {
		var userData = usersData[i];
		users[userData[User.USER_ID]] = {
			firstName: userData[User.FIRST_NAME],
			lastName: userData[User.LAST_NAME],
			appointments: []
		};
	}

	return users;
}

function formatData(users) {
	var data = [];

	for (var i = 0; i < employeeTimes.length; i ++) {
		var employeeTime = employeeTimes[i];
	
		var userId = employeeTime[EmployeeTime.USER_ID];
		var startDate = DateUtils.parseODataDate(employeeTime[EmployeeTime.START_DATE]);
		var startTime = DateUtils.parseODataTime(employeeTime[EmployeeTime.START_TIME]);
		var endDate = DateUtils.parseODataDate(employeeTime[EmployeeTime.END_DATE]);
		var endTime = DateUtils.parseODataTime(employeeTime[EmployeeTime.END_TIME]);
		var timeType = employeeTime[EmployeeTime.TIME_TYPE];
		var quantityInHours = employeeTime[EmployeeTime.QUANTITY_IN_HOURS];
	
		var formattedStartTime = startTime.getHours() + ":" + (startTime.getMinutes() > 10 ? startTime.getMinutes() : "0" + startTime.getMinutes());
		var formattedEndTime = endTime.getHours() + ":" + (endTime.getMinutes() > 10 ? endTime.getMinutes() : "0" + endTime.getMinutes());
	
		if (!users[userId].appointments) {
			users[userId].appointments = [];
		}
		users[userId].appointments.push({
			start: startDate.setHours(0, 0, 0, 0),
			end: endDate.setHours(23, 59, 59, 59),
			title: timeType,
			text: formattedStartTime + " - " + formattedEndTime + " (" + quantityInHours + " hrs.)"
		});
	}

	for (var user in users) {
		data.push(users[user]);
	}

	return data;
}

function addPhotos(authConfiguration, users) {
	var photoClient = Photo.getClient(authConfiguration);
	var response =  photoClient.list(Photo.queryBuilder()
		.select(Photo.USER_ID, Photo.PHOTO)
		.filter(getPhotoFilter(users))
		.build()
	);
	var photos = response.d.results;
	for (var i = 0; i < photos.length; i ++) {
		users[photos[i][Photo.USER_ID]].photo = "data:image/png;base64," + photos[i][Photo.PHOTO];
	}
}


function getPhotoFilter(users) {
	var photoFilter = "";
	for (var user in users) {
		var filter = Photo.USER_ID.eq(user).and(Photo.PHOTO_TYPE.eq(1));
		if (photoFilter.length === 0) {
			photoFilter = filter;
			continue;
		}
		photoFilter = photoFilter.or(filter);
	}
	return photoFilter;
}
