Meteor.publish('bosses', function() {
	return Bosses.find();
});

Meteor.publish('players', function() {
	return Players.find();
});

Meteor.publish('userData', function() {
	return Meteor.users.find({
		_id: this.userId
	}, {
		fields: { admin: 1 }
	});
});

Meteor.users.update({ username: 'nifty' }, {$set: { admin: true } });
Meteor.users.update({ username: 'officer' }, {$set: { admin: true } });

var count = 0;
function makeBoss(name) {
	count++;
	return {
		name: name,
		casters: [],
		melees: [],
		healers: [],
		tanks: [],
		number: count,
		spots: {
			melee: 0,
			casters: 0,
			healers: 0,
			tanks: 0
		}
	};
}

/*
Bosses.find().fetch().forEach(function(boss) {
	['melees', 'casters', 'healers', 'tanks'].forEach(function(role) {
		boss[role].forEach(function(playerID) {
			var player = Players.findOneFaster(playerID);

			if(!player) {
				var update = {};
				update[role] = playerID;
				Bosses.update(boss._id, {$pull:update});
			}
		});
	});
}); */

if(Bosses.find().count() === 0) {
	Bosses.insert(makeBoss('Kargath Bladefist'));
	Bosses.insert(makeBoss('The Butcher'));
	Bosses.insert(makeBoss('Tectus'));
	Bosses.insert(makeBoss('Brackenspore'));
	Bosses.insert(makeBoss('Twin Ogron'));
	Bosses.insert(makeBoss('Ko\'ragh'));
	Bosses.insert(makeBoss('Imperator Mar\'gok'));

	Bosses.insert(makeBoss('Beastlord Darmac'));
	Bosses.insert(makeBoss('Flamebender Ka\'graz'));
	Bosses.insert(makeBoss('Gruul the Subjugated'));
	Bosses.insert(makeBoss('The Blast Furnace'));
	Bosses.insert(makeBoss('Hans\'gar and Franzok'));
	Bosses.insert(makeBoss('Iron Maidens'));
	Bosses.insert(makeBoss('Kromog'));
	Bosses.insert(makeBoss('Operator Thogar'));
	Bosses.insert(makeBoss('Oregorger'));
	Bosses.insert(makeBoss('Warlord Blackhand'));
}
