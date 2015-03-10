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

		var cb = function(sourceID, error, result) {
			if (error || ! result.data) return;

			var d = result.data;

			try {
				var item = {
					sourceID: parseInt(sourceID, 10),
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

				// tier token
				if ( ! d.equippable) {
					item.allowedClasses = d.allowableClasses.map(function(n) {
						return WOW.classes[n];
					});

					item.allowedRoles = ['caster', 'melee', 'tank', 'healer'];

					var t;
					switch (item.name.split(' ')[0]) {
						case 'Leggings': t = 7; break;
						case 'Chest': t = 5; break;
						case 'Shoulders': t = 3; break;
						case 'Gauntlets': t = 10; break;
						case 'Helm': t = 1; break;
						case 'Essence': t = 0; break;
					}
					item.inventoryType = t;
				}

				item.rarity = WOW.quality[item.quality];
				item.type = WOW.itemClass[item.itemClass].name;
				item.subType = WOW.itemClass[item.itemClass].itemSubClass[item.itemSubClass];
				item.slot = WOW.inventoryType[item.inventoryType];

				if (d.equippable) {
					// classes
					var able = [];

					WOW.allClasses.forEach(function(cl) {
						if (_.contains(WOW.classCanUse[cl], item.subType)) able.push(cl);
					});

					item.allowedClasses = _.unique(able);

					// roles
					able = [];

					item.bonusStats.forEach(function(s) {
						WOW.allRoles.forEach(function(r) {
							if (_.contains(WOW.roleCanUse[r], s.stat)) able.push(r);
						});

						// add tanks to stam trinkets
						if (item.slot === 'trinket' && s.stat === 7)
							able.push('tank');
					});

					item.allowedRoles = _.unique(able);
				}

				console.log('%d: %s, %s %s %s, from %d', item.itemID, item.name, item.rarity, item.type, item.slot, item.sourceID, item.allowedRoles);

				Items.upsert({itemID: item.itemID}, item);
			}
			catch(e) {
				console.log('BROKED', e, d);
			}
		};

		Object.keys(items).forEach(function(boss) {
			items[boss].forEach(function(itemID) {
				HTTP.get('https://us.battle.net/api/wow/item/' + itemID + '/raid-heroic', cb.bind(null, boss));
			});
		});
	}
});


function makeBoss(name, id, instance, number) {
	return {
		name: name,
		bossID: id,
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
			console.log('Adding %s:%d to %s', boss[0], boss[1], name);
			Bosses.insert(makeBoss(boss[0], boss[1], name, i));
		});
	}
}

setupInstance('highmaul', [
	['Kargath Bladefist', 78714],
	['The Butcher', 77404],
	['Tectus', 78948],
	['Brackenspore', 78491],
	['Twin Ogron', 78238],
	['Ko\'ragh', 79015],
	['Imperator Mar\'gok', 77428]
]);

setupInstance('blackrock foundry', [
	['Beastlord Darmac', 76865],
	['Flamebender Ka\'graz', 76814],
	['Gruul the Subjugated', 76877],
	['The Blast Furnace', 76806],
	['Hans\'gar and Franzok', 76973],
	['Iron Maidens', 77557],
	['Kromog', 77692],
	['Operator Thogar', 76906],
	['Oregorger', 77182],
	['Warlord Blackhand', 77325]
]);
