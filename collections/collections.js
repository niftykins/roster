Players = new Meteor.Collection('players');
Bosses = new Meteor.Collection('bosses');
Instances = new Meteor.Collection('instances');
Items = new Meteor.Collection('items');
Lootsheet = new Meteor.Collection('lootsheet');

isAdmin = function(user) {
	user = user || Meteor.user();
	if(user)
		return user.admin;
	else
		return false;
};

checkUser = function(user) {
	user = user || Meteor.user();

	if(!user) // not logged in
		throw new Meteor.Error(401, "You need to login to do that.");

	if(!isAdmin(user)) // if they aren't someone with permission
		throw new Meteor.Error(403, "You don't have permission to do that.");

	return true;
};

Meteor.methods({
	addPlayer: function(data) {
		check(data, {
			name: String,
			role: String,
			class: String
		});

		checkUser();

		if(!data.name || data.name === ' ') {
			throw new Meteor.Error(422, "Enter a name, noob.");
		}

		if(!data.role || !_.contains(['caster', 'melee', 'healer', 'tank'], data.role)) {
			throw new Meteor.Error(422, "Worst. Click on a role.");
		}

		var classes = ['rogue', 'warrior', 'druid', 'dk', 'paladin', 'priest', 'warlock', 'shaman', 'mage', 'monk', 'hunter'];
		if(!data.class ||!_.contains(classes, data.class)) {
			throw new Meteor.Error(422, "Click on a class colour you bad.");
		}

		var player = {
			name: data.name,
			role: data.role,
			class: data.class
		};

		var existing = Players.findOne({name: player.name});

		if (!!existing) {
			throw new Meteor.Error(302, 'Player already exists.');
		}

		Players.insert(player);
		console.log("New Player: ", player);
	},

	removePlayer: function(name) {
		check(name, String);

		checkUser();

		if(!name || name === ' ') {
			throw new Meteor.Error(422, "Enter a name, noob.");
		}

		var player = Players.findOne({name:name});

		if (!player) return;

		Players.remove(player._id);

		var update = {};
		update[player.role+'s'] = player._id;

		Bosses.update({}, {$pull:update}, {multi:true});

		console.log("Remove Player: ", player);
	},

	addToBoss: function(bossName, name) {
		check(bossName, String);
		check(name, String);

		checkUser();

		var player = Players.findOne({name:name});
		var role = player.role;

		var boss = Bosses.findOne({name:bossName});

		// hack around spots.melee vs spots.plural
		if (boss.spots[(role==='melee'?role:role+'s')] <= boss[role+'s'].length)
			return;

		var update = {};
		update[player.role+'s'] = player._id;

		Bosses.update({name:bossName}, {$addToSet:update});
	},

	removeFromBoss: function(boss, name) {
		check(boss, String);
		check(name, String);

		checkUser();

		var player = Players.findOne({name:name});

		var update = {};
		update[player.role+'s'] = player._id;

		Bosses.update({name:boss}, {$pull:update});
	},

	changeSpot: function(value, spot, boss) {
		check(value, Match.Integer);
		check(spot, String);
		check(boss, String);

		checkUser();

		var update = {};
		update['spots.'+spot] = value;

		Bosses.update({name:boss}, {$inc:update});
	},

	changeOrder: function(value, boss, instance) {
		check(value, Match.Integer);
		check(boss, Match.Integer);
		check(instance, String);

		checkUser();

		var a = Bosses.findOne({
			number: boss,
			instance: instance
		});

		var b = Bosses.findOne({
			number: boss+value,
			instance: instance
		});

		Bosses.update(a._id, {$inc: {number: value}});
		Bosses.update(b._id, {$inc: {number: -value}});
	}
});
