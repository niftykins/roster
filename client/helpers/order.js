Template.order_boss.helpers({
	first: function() {
		return this.number === 0;
	},

	last: function() {
		var instance = Session.get('instance');
		var instanceFilter = instance ? {instance: instance} : {};
		return this.number === Bosses.find(instanceFilter).fetch().length-1;
	}
});

Template.order_boss.events({
	'click .spot > i': function(e) {
		var $t = $(e.target);

		var value = $t.hasClass('up') ? -1 : 1;
		var boss = parseInt($t.parent().parent().attr('name'), 10);
		var instance = Session.get('instance');

		Meteor.call('changeOrder', value, boss, instance, function(error) {
			if (error) return console.log(error);

			FancySupport.event({
				name: 'change_order',
				data: {
					value: value,
					boss: boss,
					instance: instance
				}
			});
		});
	}
});
