Template.search.rendered = function() {
	Meteor.typeahead(this.find('input'));
};

Template.search.helpers({
	'countBosses': function() {
		return filterBosses.length;
	},

	'names': function() {
		return Players.find().fetch().map(function(e) { return e.name; });
	}
});

var setFilter = function(value) {
	Session.set('filter', value);

	if (value === '')
		Session.set('view', false);
};
Template.search.events({
	'blur .filter input': function(e) {
		setFilter($(e.target).val().toLowerCase());
	},

	'keypress .filter input': function(e) {
		if (e.which === 13) {
			setFilter($(e.target).val().toLowerCase());
		}
	},

	'click .close': function(e) {
		Session.set('filter', null);
		Session.set('view', false);
	},

	'click .view i': function(e) {
		if ($(e.target).hasClass('block'))
			Session.set('view', true);
		else
			Session.set('view', false);
	}
});
