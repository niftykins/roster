Template.item_selections.helpers({
	getSelections: function() {
		return selections;
	}
});

selectionsList = ['none', 'side', 'any', 'mythic', 'bis', 'the dream'];

Template.item_selections.events({
	'click .selection': function(e) {
		var $t = $(e.target);

		// if shift click, go down
		var direction = e.shiftKey ? -1 : 1;

		var itemID = parseInt($t.siblings('.item').attr('name'));
		var playerName = Session.get('lootsheetUser');

		var current = $t.attr('name');
		var i = selectionsList.indexOf(current);
		i += direction;
		if (i < 0) i = selectionsList.length-1;
		if (i >= selectionsList.length) i = 0;

		var next = selectionsList[i];
		if ( ! next) return;

		Meteor.call('makeSelection', next, itemID, playerName, function(error) {
			if(error) return console.log(error);
		});

		return false;
	}
});

Template.item_other.events({
	'click .player': function(e) {
		var $t = $(e.target);

		Session.set('lootsheetUser', $t.attr('name'));
	}
});

Template.boss_coin.events({
	'click .coin': function(e) {
		var $t = $(e.target).closest('.coin');

		var value = $t.hasClass('coining') ? false : true;

		var playerName = Session.get('lootsheetUser');
		var boss = this.bossID;

		Meteor.call('makeCoin', value, boss, playerName, function(error) {
			if(error) return console.log(error);
		});
	}
});


// FILTER BOX

Template.loot_player_filter.rendered = function() {
	Meteor.typeahead(this.find('input'));
};

Template.loot_player_filter.helpers({
	'names': function() {
		return Players.findFaster().fetch().map(function(e) { return e.name; });
	},

	'getUpdated': function() {
		return (Players.findOneFaster({name: Session.get('lootsheetUser')})||{}).lastUpdated;
	}
});

var setFilter = function(value) {
	Session.set('lootsheetUser', value);
};

Template.loot_player_filter.events({
	'blur .filter input': function(e) {
		setFilter($(e.target).val().toLowerCase());
	},

	'keypress .filter input': function(e) {
		if(e.which === 13) {
			setFilter($(e.target).val().toLowerCase());
		}
	},

	'click .close': function(e) {
		Session.set('lootsheetUser', null);
	}
});
