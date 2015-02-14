Meteor.subscribe('fancysupport');

Meteor.startup(function() {
	// check if there's an api key
	if (Meteor.settings &&
		Meteor.settings.public &&
		Meteor.settings.public.fancysupport &&
		Meteor.settings.public.fancysupport.app_key) {

		Tracker.autorun(function() {
			var user = Meteor.user();

			// check that the script has actually finished loading
			if ( ! Session.get('FancySupportLoaded')) return;

			// can either be by logging out or just no user
			// so call clear just to be safe
			if ( ! user) {
				console.log('NO USER');
				return FancySupport.clear();
			}

			// check if there's a signature
			var signature = user.fancy_support_signature;
			if ( ! signature) return;

			var opts = {
				activator: '#fancy-activator',
				unread_counter: '#fancy-unread',
				log_errors: true,

				signature: signature,
				app_key: Meteor.settings.public.fancysupport.app_key,

				customer_id: user._id,
			};

			if (user.username) opts.name = user.username;
			if (user.email) opts.email = user.email;
			if (user.admin) opts.custom_data = {admin: user.admin};


			console.log($(opts.activator));

			console.log('initting', opts);
			FancySupport.init(opts);
			console.log('initted');
		});
	}
});
