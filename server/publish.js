Meteor.publish('bosses', function() {
	return Bosses.find();
});

Meteor.publish('instances', function() {
	return Instances.find();
});

Meteor.publish('players', function() {
	return Players.find();
});

Meteor.publish('items', function() {
	return Items.find();
});

Meteor.publish('lootsheet', function() {
	return Lootsheet.find();
});

Meteor.publish('userData', function() {
	var user = Meteor.users.find({
		_id: this.userId
	}, {
		fields: { admin: 1 }
	});

	return user;
});

Meteor.users.update({ username: 'nifty' }, {$set: { admin: true } });
Meteor.users.update({ username: 'officer' }, {$set: { admin: true } });


var crypto = Npm.require('crypto');
var FancySupportSignatureGenerator = function(cid) {
	var secret = Meteor.settings && Meteor.settings.fancysupport && Meteor.settings.fancysupport.secret;
	if (secret) return crypto.createHash('sha1').update(cid + secret).digest('hex');
};

Meteor.methods({
	fancysupport_data: function() {
		var user = Meteor.user();

		if ( ! user) throw new Meteor.Error(401, 'You need to be logged in.');

		var opts = {
			log_errors: true,

			signature: FancySupportSignatureGenerator(user._id),
			app_key: Meteor.settings.fancysupport.app_key,

			customer_id: user._id,
			name: user.username,
			custom_data: {
				admin: user.admin
			}
		};

		return opts;
	},

	addItemsToDB: function(items) {
		check(items, Object);

		checkUser();

		console.log(items);

		var cb = function(sourceID, error, result) {
			if (error || ! result.data) return;

			var d = result.data;

			var item = {
				sourceID: sourceID,
				itemID: parseInt(d.id, 10),
				name: d.name,
				icon: d.icon,
				bonusStats: d.bonusStats,
				itemSpells: d.itemSpells,
				itemClass: d.itemClass,
				itemSubClass: d.itemSubClass,
				quality: d.quality,
				inventoryType: d.inventoryType
			};

			item.rarity = WOW.quality[item.quality];
			item.type = WOW.itemClass[item.itemClass].name;
			item.subType = WOW.itemClass[item.itemClass].itemSubClass[item.itemSubClass];
			item.slot = WOW.inventoryType[item.inventoryType];

			console.log("%d: %s, %s %s %s, from %d", item.itemID, item.name, item.rarity, item.type, item.slot, item.sourceID);

			Items.upsert({itemID: item.itemID}, item);
		};

		Object.keys(items).forEach(function(boss) {
			items[boss].forEach(function(itemID) {
				HTTP.get('https://us.battle.net/api/wow/item/' + itemID + '/raid-heroic', cb.bind(null, boss));
			});
		});
	}
});


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
