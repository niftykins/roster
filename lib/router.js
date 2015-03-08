Date.now=Date.now||function(){return new Date().getTime();};
var sort = function(a,b) {
	if(a.class !== b.class) return (a.class > b.class) ? -1 : 1;
	return (a.name < b.name) ? -1 : 1;
};

function getPlayer(id) {
	return Players.findOneFaster(id);
}

Router.configure({
	layoutTemplate: 'layout',
	loadingTemplate: 'loading',
	waitOn: function() {
		return [Meteor.subscribe('players'), Meteor.subscribe('bosses'), Meteor.subscribe('instances')];
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

			bosses.forEach(function(boss) {
				var found = false;
				boss.playerCount = 0;

				['melees', 'casters', 'healers', 'tanks'].forEach(function(role) {
					var players;
					if(isAdmin()) {
						players = Players.findFaster({role:role.slice(0,-1)}).fetch();

						players.forEach(function(player) {
							if(_.contains(boss[role], player._id)) {
								player.out = false;
								boss.playerCount++;

								if(player.name === filter)
									found = true;
							} else
								player.out = true;
						});

						players.sort(sort);
						boss[role] = players;
					} else {
						players = [];
						boss[role].forEach(function(playerID) {
							var player = getPlayer(playerID);

							if(player && player.name === filter)
								found = true;

							boss.playerCount++;
							players.push(player);
						});

						players.sort(sort);
						boss[role] = players;
					}

				});

				if(found === true)
					foundBosses.push(boss);
			});

			if(filter) {
				filterBosses = foundBosses;
				return foundBosses;
			}
			else {
				filterBosses = [];
				return bosses;
			}
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
	if (! Meteor.loggingIn() && ! Meteor.user()) {
		this.render('login');
	}
	else this.next();
}, {only: ['add', 'remove']});

Router.onBeforeAction(function() {
	if (! Meteor.user() || ! Meteor.user().admin) {
		this.render('roster');
	}
	else this.next();
}, {only: ['add', 'remove']});
