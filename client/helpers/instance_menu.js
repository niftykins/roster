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
