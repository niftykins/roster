Meteor.subscribe('userData');

UI.registerHelper('user', function() {
	return Meteor.user() && Meteor.user().username;
});

UI.registerHelper('isAdmin', function() {
	return Meteor.user() && Meteor.user().admin;
});

UI.registerHelper('getFilter', function() {
	return Session.get('filter');
});

UI.registerHelper('gridView', function() {
	return Session.get('view');
});

UI.registerHelper('pluralize', function(n, thing) {
	if(n === 1) return '1 ' + thing;
	else return n + ' ' + thing + 'es';
});

UI.registerHelper('debug', function() {
	console.log("vvv=================vvv");
	console.log(this);
	console.log("^^^=================^^^");
});

var FormErrors = {
	show: function(parent, type, message, style) {
		var header;
		var $message = $(parent).children('.message');

		$message.removeClass('error info');
		style = style || 'error';
		$message.addClass(style);

		switch(type) {
			case 302: header = "Already Exists"; break;
			case 400:
				header = "Naughty";
				message = "Your values don't match the expected types.";
				break;
			case 401: header = "Action Forbidden"; break;
			case 403: header = "Action Forbidden"; break;
			case 404: header = "Not Found"; break;
			case 422: header = "Bad Data"; break;
			default: header = type; break;
		}

		$message.children('.header').text(header);
		$message.children('.message').text(message);

		$message.addClass('show');
	},
	hide: function(parent) {
		$(parent).find('.ui.message').removeClass('show');
	}
};

Template.layout.events({
	'click .message > .close': function(e) {
		$(e.target).parent().removeClass('show');
	}
});

Template.login.events({
	'submit form': function(e) {
		e.preventDefault();
		FormErrors.hide(e.target);
		var $t = $(e.target);

		var username = $t.find('[name=username]').val();
		var password = $t.find('[name=password]').val();

		if(!username) {
			FormErrors.show(e.target, 422, "How do you expect to login without a username?");
			return;
		}

		if(!password) {
			FormErrors.show(e.target, 422, "Forgot passowrd you noob.");
			return;
		}

		Meteor.loginWithPassword(username, password, function(error) {
			if(error)
				FormErrors.show(e.target, error.error, error.reason);
			else
				Router.go('roster');
		});

		return false;
	}
});

Template.instance_menu.rendered = function(e) {
	var instance = Instances.findOne({}, {sort: {number: -1}});
	if (instance) Session.setDefault('instance', instance.name);
};

Template.instance_menu.helpers({
	'instances': function() {
		return Instances.find({}, {sort: {number: -1}}).fetch();
	},

	'lastBoss': function() {
		var boss = Bosses.findOne({instance: this.name}, {sort: {number: -1}});
		if (boss) return boss.name;
	},

	'isActive': function() {
		return Session.get('instance') === this.name ? 'active' : '';
	}
});

Template.instance_menu.events({
	'click .instance': function(e) {
		e.stopPropagation();
		Session.set('instance', this.name);
	}
});

Template.search.rendered = function() {
	Meteor.typeahead(this.find('input'));
};

Template.search.helpers({
	'countBosses': function() {
		return filterBosses.length;
	},

	'names': function() {
		return Players.find().fetch().map(function(e) { return e.name; });
	}
});

var setFilter = function(value) {
	Session.set('filter', value);

	if (value === '')
		Session.set('view', false);
};
Template.search.events({
	'blur .filter input': function(e) {
		setFilter($(e.target).val().toLowerCase());
	},

	'keypress .filter input': function(e) {
		if(e.which === 13) {
			setFilter($(e.target).val().toLowerCase());
		}
	},

	'click .close': function(e) {
		Session.set('filter', null);
		Session.set('view', false);
	},

	'click .view i': function(e) {
		if ($(e.target).hasClass('block'))
			Session.set('view', true);
		else
			Session.set('view', false);
	}
});

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
		var previousBoss = Bosses.findOne({number: this.number-1});
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

Template.player.events({
	'click .player': function(e) {
		var $t = $(e.target);

		if(isAdmin()) {
			var call = $t.hasClass('out') ? 'addToBoss' : 'removeFromBoss';

			var player = $t.attr('name');
			var boss = $t.parents('.boss').attr('name');

			Meteor.call(call, boss, player, function(error) {
				if(error) return console.log(error);

				FancySupport.event({
					name: call.toLowerCase(),
					data: {
						player: player,
						boss: boss
					}
				});
			});
		} else {
			Session.set('filter', $t.attr('name'));
		}
	}
});

Template.add.events({
	'click .class': function(e) {
		var $t = $(e.target);

		$('.class.active').removeClass('active');
		$t.addClass('active');

		$('input[name=class]').val($t.attr('value'));
	},

	'click .role': function(e) {
		var $t = $(e.currentTarget);

		$('.role.active').removeClass('active');
		$t.addClass('active');

		$('input[name=role]').val($t.attr('value'));
	},

	'submit form': function(e) {
		e.preventDefault();
		FormErrors.hide(e.target);
		var $t = $(e.target);

		var name = $t.find('[name=name]').val().toLowerCase();
		var role = $t.find('[name=role]').val();
		var type = $t.find('[name=class]').val();

		if(!name) {
			FormErrors.show(e.target, 422, "Enter a name, noob.");
			return;
		}

		if(!role) {
			FormErrors.show(e.target, 422, "Worst. Click on a role.");
			return;
		}

		if(!type) {
			FormErrors.show(e.target, 422, "Click on a class colour you bad.");
			return;
		}

		var player = {
			name: name,
			role: role,
			class: type
		};

		Meteor.call('addPlayer', player, function(error) {
			if(error) return FormErrors.show(e.target, error.error, error.reason);

			FancySupport.event({
				name: 'create_player',
				data: {
					name: player.name,
					role: player.role,
					class: player.class
				}
			});

			Router.go('roster');
		});
	}
});

Template.remove.rendered = function() {
	Meteor.typeahead(this.find('input'));
};

Template.remove.helpers({
	'names': function() {
		return Players.find().fetch().map(function(e) { return e.name; });
	}
});

Template.remove.events({
	'submit form': function(e) {
		e.preventDefault();
		FormErrors.hide(e.target);
		var $t = $(e.target);

		var name = $t.find('[name=name]').val().toLowerCase();

		if(!name) {
			FormErrors.show(e.target, 422, "Enter a name, noob.");
			return;
		}

		Meteor.call('removePlayer', name, function(error) {
			if(error) return FormErrors.show(e.target, error.error, error.reason);

			FancySupport.event({
				name: 'delete_player',
				data: {
					name: name,
				}
			});

			Router.go('roster');
		});
	}
});
