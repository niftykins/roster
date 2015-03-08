Template.player.events({
	'click .player': function(e) {
		var $t = $(e.target);

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
		} else {
			Session.set('filter', $t.attr('name'));
		}
	}
});
