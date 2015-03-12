Template.edit.events({
	'click .class': function(e) {
		var $t = $(e.target);

		$('.class.active').removeClass('active');
		$t.addClass('active');

		$('input[name=class]').val($t.attr('value'));
	},

	'click .role': function(e) {
		var $t = $(e.currentTarget);

		$('.role.active').removeClass('active');
		$t.addClass('active');

		$('input[name=role]').val($t.attr('value'));
	},

	'submit form': function(e) {
		e.preventDefault();
		FormErrors.hide(e.target);
		var $t = $(e.target);

		var name = $t.find('[name=name]').val().toLowerCase();
		var rename = $t.find('[name=rename]').val().toLowerCase();
		var role = $t.find('[name=role]').val();
		var type = $t.find('[name=class]').val();

		if(!name) {
			FormErrors.show(e.target, 422, "Enter a name, noob.");
			return;
		}

		if(!role) {
			FormErrors.show(e.target, 422, "Worst. Click on a role.");
			return;
		}

		if(!type) {
			FormErrors.show(e.target, 422, "Click on a class colour you bad.");
			return;
		}

		var player = {
			name: name,
			rename: rename,
			role: role,
			class: type
		};

		Meteor.call('editPlayer', player, function(error) {
			if(error) return FormErrors.show(e.target, error.error, error.reason);

			FancySupport.event({
				name: 'edit_player',
				data: {
					name: player.name,
					rename: player.rename,
					role: player.role,
					class: player.class
				}
			});

			Router.go('roster');
		});
	}
});

Template.edit.rendered = function() {
	Meteor.typeahead(this.find('input[name="name"]'));
};

Template.edit.helpers({
	'names': function() {
		return Players.findFaster().fetch().map(function(e) { return e.name; });
	}
});
