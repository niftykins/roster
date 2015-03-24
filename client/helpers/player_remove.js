Template.remove.rendered = function() {
	Meteor.typeahead(this.find('input'));
};

Template.remove.helpers({
	'names': function() {
		return Players.find().fetch().map(function(e) { return e.name; });
	}
});

Template.remove.events({
	'submit form': function(e) {
		e.preventDefault();
		FormErrors.hide(e.target);
		var $t = $(e.target);

		var name = $t.find('[name=name]').val().toLowerCase();

		if ( ! name) {
			FormErrors.show(e.target, 422, "Enter a name, noob.");
			return;
		}

		Meteor.call('removePlayer', name, function(error) {
			if (error) return FormErrors.show(e.target, error.error, error.reason);

			FancySupport.event({
				name: 'delete_player',
				data: {
					name: name,
				}
			});

			Router.go('roster');
		});
	}
});
