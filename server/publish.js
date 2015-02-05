Meteor.publish('bosses', function() {
	return Bosses.find();
});

Meteor.publish('instances', function() {
	return Instances.find();
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

function makeBoss(name, instance, number) {
	return {
		name: name,
		instance: instance,
		casters: [],
		melees: [],
		healers: [],
		tanks: [],
		number: number,
		spots: {
			melee: 0,
			casters: 0,
			healers: 0,
			tanks: 0
		}
	};
}

var instanceCount = 0;
function setupInstance(name, bosses) {
	Instances.upsert({name: name}, {$set: {
		name: name,
		number: instanceCount
	}});
	instanceCount++;

	if (Bosses.find({instance: name}).count() !== bosses.length) {
		Bosses.remove({instance: name});

		bosses.forEach(function(boss, i) {
			console.log('Adding %s to %s', boss, name);
			Bosses.insert(makeBoss(boss, name, i));
		});
	}
}

setupInstance('highmaul', [
	'Kargath Bladefist',
	'The Butcher',
	'Tectus',
	'Brackenspore',
	'Twin Ogron',
	'Ko\'ragh',
	'Imperator Mar\'gok'
]);

setupInstance('blackrock foundry', [
	'Beastlord Darmac',
	'Flamebender Ka\'graz',
	'Gruul the Subjugated',
	'The Blast Furnace',
	'Hans\'gar and Franzok',
	'Iron Maidens',
	'Kromog',
	'Operator Thogar',
	'Oregorger',
	'Warlord Blackhand'
]);
