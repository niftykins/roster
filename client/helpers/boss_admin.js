Template.boss_admin.events({
	'click .spot > i': function(e) {
		var $t = $(e.target);

		var value = $t.hasClass('up') ? 1 : -1;
		var spot = $t.parent().attr('name');
		var boss = $t.parent().parent().attr('name');

		Meteor.call('changeSpot', value, spot, boss, function(error) {
			if(error) return console.log(error);

			FancySupport.event({
				name: 'change_spot',
				data: {
					value: value,
					role: spot,
					boss: boss
				}
			});
		});
	}
});

Template.boss_admin.helpers({
	'subs': function(role) {
		var sort = function(a,b) {
			if(a.change !== b.change) return (a.change < b.change) ? -1 : 1;
			if(a.class !== b.class) return (a.class > b.class) ? -1 : 1;
			return (a.name < b.name) ? -1 : 1;
		};

		var current = this[role];
		var previousBoss = Bosses.findOne({number: this.number-1, instance: this.instance});
		var previous = previousBoss ? previousBoss[role] : [];

		var changes = [];

		current.forEach(function(c) {
			// if they're out for this, but they were in last time >> remove
			if ( c.out && _.contains(previous, c._id)) {
				c.change = 'remove';
				changes.push(c);
			}

			// if they're in for this, but weren't in for last time >> add
			else if ( ! c.out && ! _.contains(previous, c._id)) {
				c.change = 'add';
				changes.push(c);
			}

			// if they're still in from last time >> no change
			// if they're still out from last time >> no change
		});

		changes.sort(sort);

		return changes;
	}
});
