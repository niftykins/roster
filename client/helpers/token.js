Template.token.events({
	'submit form': function(e) {
		e.preventDefault();
		FormErrors.hide(e.target);
		var $t = $(e.target);

		var token = $t.find('[name="token"]').val();

		if ( ! token) {
			FormErrors.show(e.target, 422, "Enter a token, noob.");
			return;
		}

		localStorage.setItem('token', token);
		Session.set('token', token);

		Router.go('lootsheet');
	}
});

Template.token.helpers({
	getToken: function() {
		return localStorage.getItem('token');
	}
});
