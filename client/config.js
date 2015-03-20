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

	window.wowhead_tooltips = {hide: {sellprice: true, dropchance: true}};

	var initted = false;
	Tracker.autorun(function() {
		if ( ! Session.get('FancySupportLoaded')) return;

		if (Meteor.user()) {
			Meteor.call('fancysupport_data', function(err, data) {
				if (err) return console.error(err);

				if ( ! initted) {
					FancySupport.init(data);
					initted = true;
				}
			});
		}
		else {
			FancySupport.clear();
		}
	});

	Tracker.autorun(function() {
		Session.get('token'); // triggers rerun on change

		var player = Players.findOneFaster({name: Session.get('lootsheetUser')});
		var token = localStorage.getItem('token');

		var match = player && player.secret && SHA256(token) === player.secret;

		Session.set('tokenMatch', match);
	});
});
