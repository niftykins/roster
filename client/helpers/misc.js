UI.registerHelper('user', function() {
	return Meteor.user() && Meteor.user().username;
});

UI.registerHelper('isAdmin', function() {
	return Meteor.user() && Meteor.user().admin;
});

UI.registerHelper('getFilter', function() {
	return Session.get('filter');
});

UI.registerHelper('gridView', function() {
	return Session.get('view');
});

UI.registerHelper('pluralize', function(n, thing) {
	if(n === 1) return '1 ' + thing;
	else return n + ' ' + thing + 'es';
});

UI.registerHelper('add', function(value, addition) {
	value = parseFloat(value);
	addition = parseFloat(addition);
	return value + addition;
});

UI.registerHelper('debug', function() {
	console.log("vvv=================vvv");
	console.log(this);
	console.log("^^^=================^^^");
});

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
