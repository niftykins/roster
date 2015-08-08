Meteor.publish('bosses', function() {
	return Bosses.find();
});

Meteor.publish('instances', function() {
	return Instances.find();
});

Meteor.publish('players', function() {
	var fields = {token: 0};

	var user = Meteor.users.findOne(this.userId);
	if (user && user.admin) fields = {};

	return Players.find({}, {fields: fields});
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

var crypto = Npm.require('crypto');
var FancySupportSignatureGenerator = function(cid) {
	var secret = Meteor.settings && Meteor.settings.fancysupport && Meteor.settings.fancysupport.secret;
	if (secret) return crypto.createHash('sha1').update(cid + secret).digest('hex');
};


var Roles = function() {
	this.wipe();
	return this;
};

Roles.prototype.wipe = function() {
	this.tank = [];
	this.healer = [];
	this.caster = [];
	this.melee = [];
	return this;
};

Roles.prototype.pushClasses = function(r, c) {
	c.forEach(function(i) {
		this[r].push(i);
	}, this);
};

Roles.prototype.agility = function() {
	this.pushClasses('melee', ['shaman', 'rogue', 'monk', 'druid']);
	this.pushClasses('tank', ['monk', 'druid']);
	this.pushClasses('caster', ['hunter']);
	return this;
};

Roles.prototype.intellect = function() {
	this.pushClasses('healer', ['shaman', 'priest', 'paladin', 'monk', 'druid']);
	this.pushClasses('caster', ['druid', 'shaman', 'warlock', 'priest', 'mage']);
	return this;
};

Roles.prototype.strength = function() {
	this.pushClasses('tank', ['warrior', 'paladin', 'dk']);
	this.pushClasses('melee', ['warrior', 'paladin', 'dk']);
	return this;
};

Roles.prototype.tanks = function() {
	this.pushClasses('tank', ['warrior', 'paladin', 'dk', 'monk', 'druid']);
	return this;
};

Roles.prototype.healers = function() {
	this.pushClasses('healer', ['shaman', 'priest', 'paladin', 'monk', 'druid']);
	return this;
};

var itemDecider = function(item) {
	// tier token
	if ( ! item.equippable) {
		item.allowedClasses = item._allowableClasses.map(function(n) {
			return WOW.classes[n];
		});

		item.allowed = {
			tank: item.allowedClasses,
			healer: item.allowedClasses,
			melee: item.allowedClasses,
			caster: item.allowedClasses
		};

		var t;
		switch (item.name.split(' ')[0]) {
			case 'Leggings': t = 7; break;
			case 'Chest': t = 5; break;
			case 'Shoulders': t = 3; break;
			case 'Gauntlets': t = 10; break;
			case 'Helm': t = 1; break;
			case 'Essence': t = 0; break;
			case 'Badge': t = 12; break;
		}
		item.inventoryType = t;
	}

	item.rarity = WOW.quality[item.quality];
	item.type = WOW.itemClass[item.itemClass].name;
	item.subType = WOW.itemClass[item.itemClass].itemSubClass[item.itemSubClass];
	item.slot = WOW.inventoryType[item.inventoryType];

	if (item.equippable) {
		// classes
		var able = [];
		if (item._allowableClasses) {
			able = item._allowableClasses.map(function(n) {
				return WOW.classes[n];
			});
		}
		else {
			WOW.allClasses.forEach(function(cl) {
				if (_.contains(WOW.classCanUse[cl], item.subType) || item.slot === 'cloak')
					able.push(cl);
			});
		}
		item.allowedClasses = _.unique(able);

		// filtering based on stats
		able = new Roles();
		item.bonusStats.some(function(s) {
			// tanks only want stam trinkets
			if (s.stat === 7 && item.slot === 'trinket') {
				able.wipe().tanks();
				return true;
			}

			if (item.slot === 'shield') {
				able.wipe();
				able.tank = ['paladin', 'warrior'];
				able.healer = ['shaman', 'paladin'];
				able.caster = ['shaman'];
				return true;
			}

			// healers only want spirit loot
			if (s.stat === 6) {
				able.wipe().healers();
				return true;
			}

			// only tanks want BA
			if (s.stat === 50) {
				able.wipe().tanks();
				return true;
			}

			switch (s.stat) {
				case 3: able.agility(); break;
				case 4: able.strength(); break;
				case 5: able.intellect(); break;
				case 72: able.agility().strength(); break;
				case 73: able.agility().intellect(); break;
				case 74: able.intellect().strength(); break;
			}
		});

		// check for some trinket edge cases
		if (item.itemSpells && item.itemSpells.length) {
			item.itemSpells.some(function(s) {
				var desc = s.spell.description.toLowerCase();

				if (/\d+ armor/.test(desc)) {
					able.wipe().tanks();
					return true;
				}

				if (/\d+ spirit/.test(desc)) {
					able.wipe().healers();
					return true;
				}

				if (/\d+ strength/.test(desc)) {
					able.wipe().strength();
					return true;
				}

				if (/\d+ agility/.test(desc)) {
					able.wipe().agility();
					return true;
				}

				if (/\d+ intellect/.test(desc)) {
					able.wipe().intellect();
					return true;
				}

				// super edge cases
				if (/(reducing all damage taken)/.test(desc)) {
					able.wipe().tanks();
					return true;
				}
			});
		}

		_.each(able, function(r, i) {
			able[i] = _.unique(r);
		});

		item.allowed = able;
	}

	return item;
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
					inventoryType: d.inventoryType,
					equippable: d.equippable,
					_allowableClasses: d.allowableClasses
				};

				item = itemDecider(item);

				// console.log('%d: %s, %s %s %s, from %d', item.itemID, item.name, item.rarity, item.type, item.slot, item.sourceID, item.allowed);

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
	},

	fixItems: function(list) {
		check(list, Match.Optional([Match.Integer]));

		checkUser();

		var filter = {};
		if (list) filter = {itemID: {$in: list}};

		var items = Items.findFaster(filter).fetch();

		items.forEach(function(item) {
			item = itemDecider(item);
			Items.update(item._id, item);
		});
	},

	regenToken: function(playerName) {
		check(playerName, String);

		checkUser();

		var token = Random.id(8);
		var secret = SHA256(token);

		Players.update({name: playerName}, {$set: {
			token: token,
			secret: secret
		}});
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
		lastUpdated: {},
		spots: {
			melee: 0,
			casters: 0,
			healers: 0,
			tanks: 0
		}
	};
}

var instanceCount = 0;
function setupInstance(name, id, bosses) {
	Instances.upsert({name: name}, {$set: {
		name: name,
		instanceID: id,
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

setupInstance('highmaul', 6996, [
	['Kargath Bladefist', 78714],
	['The Butcher', 77404],
	['Tectus', 78948],
	['Brackenspore', 78491],
	['Twin Ogron', 78238],
	['Ko\'ragh', 79015],
	['Imperator Mar\'gok', 77428]
]);

setupInstance('blackrock foundry', 6967, [
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

setupInstance('hellfire citadel', 7545, [
	['Hellfire Assault', 95068],
	['Iron Reaver', 90284],
	['Kormrok', 90776],
	['Kilrogg Deadeye', 90378],
	['Hellfire High Council', 92146],
	['Gorefiend', 91809],
	['Shadow-Lord Iskar', 95067],
	['Socrethar the Eternal', 90296],
	['Tyrant Velhari', 93439],
	['Fel Lord Zakuun', 89890],
	['Xhul\'horac', 93068],
	['Mannoroth', 91349],
	['Archimonde', 91331]
]);
