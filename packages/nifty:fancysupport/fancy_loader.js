Meteor.startup(function() {
	delete Session.keys['FancySupportLoaded'];

	var s = document.createElement('script');
	s.type = 'text/javascript';
	s.async = true;
	s.src = '//cdn.fancy.support/client.min.js';
	document.getElementsByTagName('head')[0].appendChild(s);

	var loaded = function() {
		Meteor.startup(function() {
			Session.set('FancySupportLoaded', true);
		});
	};

	if (s.attachEvent){
			s.attachEvent('onload', loaded);
	} else {
		s.addEventListener('load', loaded, false);
	}
});
