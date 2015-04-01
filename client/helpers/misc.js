UI.registerHelper('user', function() {
	return Meteor.user() && Meteor.user().username;
});

UI.registerHelper('isAdmin', function() {
	return Meteor.user() && Meteor.user().admin;
});

UI.registerHelper('getFilter', function() {
	return Session.get('filter');
});

UI.registerHelper('getLootsheetUser', function() {
	return Session.get('lootsheetUser');
});

UI.registerHelper('tokenMatch', function() {
	return Session.get('tokenMatch');
});

UI.registerHelper('gridView', function() {
	return Session.get('view');
});

UI.registerHelper('pluralize', function(n, thing) {
	if (n === 1) return '1 ' + thing;
	else return n + ' ' + thing + 'es';
});

UI.registerHelper('capitalise', function(thing) {
	return thing.charAt(0).toUpperCase() + thing.substring(1);
});

UI.registerHelper('add', function(value, addition) {
	value = parseFloat(value);
	addition = parseFloat(addition);
	return value + addition;
});

UI.registerHelper('timeago', function(time) {
	return Timeago(time);
});


UI.registerHelper('debug', function() {
	console.log("vvv=================vvv");
	console.log(this);
	console.log("^^^=================^^^");
});

Timeago = function(time) {
	var
		local  = new Date().getTime(),
		offset = Math.abs(Math.floor((local - time)/1000)),
		span   = [],
		MINUTE = 60,
		HOUR   = 3600,
		DAY    = 86400,
		WEEK   = 604800,
		YEAR   = 31556926,
		DECADE = 315569260;

	if (offset <= MINUTE)              span = [ '', 'moments' ];
	else if (offset < (MINUTE * 60))   span = [ Math.round(Math.abs(offset / MINUTE)), 'min' ];
	else if (offset < (HOUR * 24))     span = [ Math.round(Math.abs(offset / HOUR)), 'hour' ];
	else if (offset < (DAY * 7))       span = [ Math.round(Math.abs(offset / DAY)), 'day' ];
	else if (offset < (WEEK * 52))     span = [ Math.round(Math.abs(offset / WEEK)), 'week' ];
	else if (offset < (YEAR * 10))     span = [ Math.round(Math.abs(offset / YEAR)), 'year' ];
	else if (offset < (DECADE * 100))  span = [ Math.round(Math.abs(offset / DECADE)), 'decade' ];
	else                               span = [ '', 'a long time' ];

	span[1] += (span[0] === 0 || span[0] > 1) ? 's' : '';
	span = span.join(' ');

	return span + ' ago';
};

FormErrors = {
	show: function(parent, type, message, style) {
		var header;
		var $message = $(parent).children('.message');

		$message.removeClass('error info');
		style = style || 'error';
		$message.addClass(style);

		switch(type) {
			case 302: header = "Already Exists"; break;
			case 400:
				header = "Naughty";
				message = "Your values don't match the expected types.";
				break;
			case 401: header = "Action Forbidden"; break;
			case 403: header = "Action Forbidden"; break;
			case 404: header = "Not Found"; break;
			case 422: header = "Bad Data"; break;
			default: header = type; break;
		}

		$message.children('.header').text(header);
		$message.children('.message').text(message);

		$message.addClass('show');
	},
	hide: function(parent) {
		$(parent).find('.ui.message').removeClass('show');
	}
};

Template.layout.events({
	'click .message > .close': function(e) {
		$(e.target).parent().removeClass('show');
	}
});
