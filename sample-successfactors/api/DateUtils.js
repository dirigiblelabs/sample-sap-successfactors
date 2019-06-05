exports.parseODataDate = function(oDataDate) {
	return new Date(parseInt(oDataDate.substring(oDataDate.indexOf("(") + 1, oDataDate.indexOf(")")), 0));
};

exports.parseODataTime = function(oDataTime) {
	var formattedTime = oDataTime.replace("PT", "").replace("H", ":").replace("M", "");
	if (formattedTime.charAt(formattedTime.length - 1) === ":") {
		formattedTime += "00";
	}
	var timeTokens = formattedTime.split(":");
	var time = new Date(0);
	time.setHours(timeTokens[0], timeTokens[1], 0, 0);
	return time;
};