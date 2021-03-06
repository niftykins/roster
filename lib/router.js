Date.now=Date.now||function(){return new Date().getTime();};
var sort = function(a,b) {
	if (a.class !== b.class) return (a.class > b.class) ? -1 : 1;
	return (a.name < b.name) ? -1 : 1;
};
var selectionSort = function(a, b) {
	var as = selectionsList.indexOf(a.selection);
	var bs = selectionsList.indexOf(b.selection);
	if (as !== bs) return (as > bs) ? -1 : 1;
	if (a.class !== b.class) return (a.class > b.class) ? -1 : 1;
	return (a.name < b.name) ? -1 : 1;
};

function getPlayer(id) {
	return Players.findOneFaster(id);
}

var assignedCounts = {};
function cacheAssignedCounts() {
	Players.find().forEach(function(player) {
		var query = {};
		query[player.role + 's'] = player._id;

		assignedCounts[player._id] = Bosses.find(query).count();
	});
}

Router.configure({
	layoutTemplate: 'layout',
	loadingTemplate: 'loading',
	waitOn: function() {
		return [Meteor.subscribe('players'),
			Meteor.subscribe('bosses'),
			Meteor.subscribe('instances'),
			Meteor.subscribe('lootsheet'),
			Meteor.subscribe('items')
		];
	}
});

Router.map(function() {
	this.route('roster', {
		path: '/',
		fastRender: true,
		data: function() {
			var filter = Session.get('filter');
			var instance = Session.get('instance');

			var instanceFilter = instance ? {instance: instance} : {};

			var bosses = Bosses.find(instanceFilter, {sort: {number: 1}}).fetch();
			var foundBosses = [];

			cacheAssignedCounts();

			bosses.forEach(function(boss) {
				var found = false;
				boss.playerCount = 0;

				var bossItems = Items.findFaster({sourceID: boss.bossID}).fetch();

				['melees', 'casters', 'healers', 'tanks'].forEach(function(role) {
					var players;
					if (isAdmin()) {
						players = Players.findFaster({role:role.slice(0,-1)}).fetch();

						players.forEach(function(player) {
							if (_.contains(boss[role], player._id)) {
								player.out = false;
								boss.playerCount++;

								if (player.name === filter) found = true;
							} else {
								player.out = true;
							}

							player.isCoining = player.coining[boss.bossID];
							player.outdated = (Date.now() - player.lastUpdated) > 3.456e8;
							player.assignedCount = assignedCounts[player._id];

							player.items = [];
							bossItems.forEach(function(i) {
								var w = player.wants[i.itemID];
								if (w && w !== 'none') {
									player.items.push(i);
								}
							});
						});

						players.sort(sort);
						boss[role] = players;
					} else {
						players = [];
						boss[role].forEach(function(playerID) {
							var player = getPlayer(playerID);

							if (player && player.name === filter) found = true;

							boss.playerCount++;
							players.push(player);
						});

						players.sort(sort);
						boss[role] = players;
					}
				});

				if (found === true) foundBosses.push(boss);
			});

			if (filter) {
				filterBosses = foundBosses;
				return foundBosses;
			}
			else {
				filterBosses = [];
				return bosses;
			}
		}
	});

	this.route('edit', {
		path: '/edit',
		waitOn: function() {
			return [Meteor.subscribe('players')];
		}
	});

	this.route('add', {
		path: '/add',
		waitOn: function() {
			return [Meteor.subscribe('players')];
		}
	});

	this.route('remove', {
		path: '/remove',
		waitOn: function() {
			return [Meteor.subscribe('players')];
		}
	});

	this.route('order', {
		path: '/order',
		data: function() {
			var instance = Session.get('instance');
			var instanceFilter = instance ? {instance: instance} : {};
			return Bosses.findFaster(instanceFilter, {sort: {number: 1}}).fetch();
		}
	});

	this.route('lootsheet', {
		path: '/loot',
		data: function() {
			var instance = Session.get('instance');
			var instanceFilter = instance ? {instance: instance} : {};
			var bosses = Bosses.findFaster(instanceFilter, {sort: {number: 1}}).fetch();

			// hack to add in trash drops
			if (instance) {
				var i = Instances.findOneFaster({name: instance});
				i.bossID = i.instanceID;
				i.name = 'Trash';
				i.uncoinable = true;
				bosses.push(i);
			}

			var myName = Session.get('lootsheetUser');

			var players = Players.find({
				name: {$ne: myName}
			}).fetch().sort(sort);

			var me = Players.findOneFaster({name: myName});

			// get the loot table for each boss,
			// for each item, check each player to see if/how they want it
			// add all the info together to be shipped to the UI
			bosses.forEach(function(boss) {
				var itemFilter = {
					sourceID: boss.bossID
				};
				// filter out items this class and role cannot use
				if (me) {
					itemFilter.allowedClasses = {$in: [me.class]};
					itemFilter['allowed.'+me.role] = {$in: [me.class]};

					boss.coining = me.coining[boss.bossID];
				}
				boss.loot = Items.findFaster(itemFilter).fetch();

				boss.loot.forEach(function(item) {
					if (me) item.selection = me.wants[item.itemID] || 'none';

					item.others = [];
					players.forEach(function(player) {
						var wants = player.wants[item.itemID];
						// if they have selected an option, other than none
						// send it to the UI
						if (wants && wants !== 'none') {
							item.others.push({
								name: player.name,
								class: player.class,
								selection: wants
							});
						}
					});

					item.others.sort(selectionSort);
				});
			});

			return {data: bosses, slotView: false};
		}
	});

	this.route('lootsheet_slot', {
		template: 'lootsheet',
		path: '/loot/slot',
		data: function() {
			var instance = Session.get('instance');
			var instanceFilter = instance ? {instance: instance} : {};
			var bosses = Bosses.findFaster(instanceFilter, {sort: {number: 1}}).fetch();

			// hack to add in trash drops
			if (instance) {
				var i = Instances.findOneFaster({name: instance});
				i.bossID = i.instanceID;
				bosses.push(i);
			}

			var myName = Session.get('lootsheetUser');

			var players = Players.find({
				name: {$ne: myName}
			}).fetch().sort(sort);

			var me = Players.findOneFaster({name: myName});

			var loot = [];
			var slots = {};

			// find the applicable items that each boss drops,
			// record everyones selections,
			// group the items based on slot,
			// sort and ship back to UI
			bosses.forEach(function(boss) {
				var itemFilter = {
					sourceID: boss.bossID
				};
				// filter out items this class and role cannot use
				if (me) {
					itemFilter.allowedClasses = {$in: [me.class]};
					itemFilter['allowed.'+me.role] = {$in: [me.class]};
				}

				Items.findFaster(itemFilter).forEach(function(item) {
					if (me) item.selection = me.wants[item.itemID] || 'none';

					item.others = [];
					players.forEach(function(player) {
						var wants = player.wants[item.itemID];
						// if they have selected an option, other than none
						// send it to the UI
						if (wants && wants !== 'none') {
							item.others.push({
								name: player.name,
								class: player.class,
								selection: wants
							});
						}
					});

					item.others.sort(selectionSort);

					if ( ! slots[item.slot]) slots[item.slot] = [];
					slots[item.slot].push(item);
				});
			});

			slots = Object.keys(slots).map(function(k) {
				var i = slots[k].sort(function(a, b) {
					if (a.itemSubClass !== b.itemSubClass) return a.itemSubClass > b.itemSubClass ? 1 : -1;
					return a.name > b.name ? 1 : -1;
				});

				return {slot: k, items: i};
			});

			return {data: slots, slotView: true};
		}
	});

	this.route('lootsheet_help', {
		path: '/loot/help',
		template: 'lootsheet_help'
	});

	this.route('tokens', {
		path: '/tokens',
		data: function() {
			return Players.findFaster({}, {fields: {
				name: 1,
				class: 1,
				token: 1
			}}).fetch().sort(sort);
		}
	});

	this.route('token', {
		path: '/token'
	});

	this.route('login', {
		path: '/login'
	});

	this.route('batman', {
		path: '/batman'
	});

	this.route('logout', {
		path: '/logout',
		onBeforeAction: function() {
			Meteor.logout();
			Router.go('roster');
			this.next();
		}
	});
});


Router.onBeforeAction(function() {
	if ( ! Meteor.loggingIn() && ! Meteor.user()) {
		this.render('login');
	}
	else this.next();
}, {only: ['add', 'remove', 'edit', 'order', 'tokens']});

Router.onBeforeAction(function() {
	if ( ! Meteor.user() || ! Meteor.user().admin) {
		this.render('roster');
	}
	else this.next();
}, {only: ['add', 'remove', 'edit', 'order', 'tokens']});
