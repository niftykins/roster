Meteor.startup(function() {
	Accounts.ui.config({
		passwordSignupFields: "USERNAME_ONLY",
	});

	Meteor.Spinner.options = {
		lines: 7,
		length: 0,
		width: 30,
		radius: 48,
		corners: 0.4,
		rotate: 0,
		direction: 1,
		color: '#8A8A8A',
		speed: 1,
		trail: 67
	};
});
