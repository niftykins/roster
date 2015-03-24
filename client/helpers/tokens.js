Template.token_person.events({
	'click .refresh': function() {
		var name = this.name;

		Meteor.call('regenToken', name, function(error) {
			if (error) return console.log(error);

			FancySupport.event({
				name: 'regen_token',
				data: {
					name: name
				}
			});
		});
	}
});
