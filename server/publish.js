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
	Bosses.insert(makeBoss('Immerseus'));
	Bosses.insert(makeBoss('The Fallen Protectors'));
	Bosses.insert(makeBoss('Norushen'));
	Bosses.insert(makeBoss('Sha of Pride'));
	Bosses.insert(makeBoss('Galakras'));
	Bosses.insert(makeBoss('Iron Juggernaut'));
	Bosses.insert(makeBoss('Kor\'kron Dark Shaman'));
	Bosses.insert(makeBoss('General Nazgrim'));
	Bosses.insert(makeBoss('Malkorok'));
	Bosses.insert(makeBoss('Spoils of Pandaria'));
	Bosses.insert(makeBoss('Thok the Nocthirsty'));
	Bosses.insert(makeBoss('Siegecrafter Blackfuse'));
	Bosses.insert(makeBoss('Paragons of the Klaxxi'));
	Bosses.insert(makeBoss('Garrosh Hellscream'));
}

