Template.item_selections.helpers({
	getSelections: function() {
		return selections;
	}
});

Template.boss_loot.helpers({
	hideLoot: function() {
		if ( ! localStorage) return false;
		Session.get('hide.' + this.bossID);

		// "true" if hidden , "" if shown
		return !!localStorage.getItem('hide.' + this.bossID);
	}
});

Template.boss_loot.events({
	'click [name="toggle"]': function() {
		var old = !!localStorage.getItem('hide.' + this.bossID);
		var v = old ? '' : 'true';
		localStorage.setItem('hide.' + this.bossID, v);
		Session.set('hide.' + this.bossID, Date.now());
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

		var token = localStorage.getItem('token');
		var player = Players.findOneFaster({name: playerName});
		if (SHA256(token) !== player.secret) return;

		Meteor.call('makeSelection', next, itemID, playerName, token, function(error) {
			if(error) return console.log(error);
		});

		return false;
	}
});

Template.item_other.events({
	'click .player': function(e) {
		var $t = $(e.target);

		setFilter($t.attr('name'));
	}
});

Template.boss_coin.events({
	'click .coin': function(e) {
		var $t = $(e.target).closest('.coin');

		var value = $t.hasClass('coining') ? false : true;

		var playerName = Session.get('lootsheetUser');
		var boss = this.bossID;

		var token = localStorage.getItem('token');
		var player = Players.findOneFaster({name: playerName});
		if (SHA256(token) !== player.secret) return;

		Meteor.call('makeCoin', value, boss, playerName, token, function(error) {
			if (error) return console.log(error);
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
		if (e.which === 13) {
			setFilter($(e.target).val().toLowerCase());
		}
	},

	'click .close': function(e) {
		setFilter(null);
	},

	'click .update': function(e) {
		var $t = $(e.target).closest('.update');

		var playerName = Session.get('lootsheetUser');

		Meteor.call('updateLastUpdated', playerName, function(error) {
			if (error) return console.log(error);
		});
	}
});
