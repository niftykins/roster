Template.login.events({
	'submit form': function(e) {
		e.preventDefault();
		FormErrors.hide(e.target);
		var $t = $(e.target);

		var username = $t.find('[name=username]').val();
		var password = $t.find('[name=password]').val();

		if(!username) {
			FormErrors.show(e.target, 422, "How do you expect to login without a username?");
			return;
		}

		if(!password) {
			FormErrors.show(e.target, 422, "Forgot passowrd you noob.");
			return;
		}

		Meteor.loginWithPassword(username, password, function(error) {
			if(error)
				FormErrors.show(e.target, error.error, error.reason);
			else
				Router.go('roster');
		});

		return false;
	}
});
