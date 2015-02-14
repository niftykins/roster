var crypto = Npm.require('crypto');

var FancySupportSignatureGenerator = function(cid) {
	var secret = Meteor.settings && Meteor.settings.fancysupport && Meteor.settings.fancysupport.secret;
	if (secret) return crypto.createHash('sha1').update(cid + secret).digest('hex');
};

Meteor.publish('fancysupport', function() {
	if (this.userId) {
		var signature = FancySupportSignatureGenerator(this.userId);
		if (signature) this.added('users', this.userId, {fancy_support_signature: signature});
	}

	this.ready();
});
