Template.player.events({
	'click .player': function(e) {
		var $t = $(e.target);

		Session.set('filter', $t.attr('name'));
	}
});

Template.player_admin.events({
	'click .player': function(e) {
		var $t = $(e.target).closest('.player');

		if(isAdmin()) {
			var call = $t.hasClass('out') ? 'addToBoss' : 'removeFromBoss';

			var player = $t.attr('name');
			var boss = $t.parents('.boss').attr('name');

			Meteor.call(call, boss, player, function(error) {
				if(error) return console.log(error);

				FancySupport.event({
					name: call.toLowerCase(),
					data: {
						player: player,
						boss: boss
					}
				});
			});
		}
	}
});

Template.player_admin.helpers({
	getTitle: function() {
		var items = (this.items||[]).map(function(item) {
			return item.slot + ': ' + this.wants[item.itemID];
		}, this).join('\n');

		var coining =  this.isCoining ? 'coining' : '';

		var t = [];
		if (coining) t.push(coining);
		if (items) t.push(items);
		return t.join('\n\n');
	}
});