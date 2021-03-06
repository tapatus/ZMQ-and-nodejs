module.exports = {

     makeSender: function(reqsock) {
        var Promise = require('bluebird');
        var promises = [];
        reqsock.on('message', function(reply) {
            promises.shift().resolve(reply);

        });
        reqsock.on('error', function(reason) {
            promises.shift().reject(reason);

        });
        return function(message) {
            return new Promise(function(resolve, reject) {
                promises.push({
                    resolve: resolve,
                    reject: reject
                });
                reqsock.send(message);

            })

        };

    },

    // *** getLoad function
    getLoad: function() {
            var fs = require('fs')
               , data = fs.readFileSync("/proc/loadavg") // version sincrona
               , tokens = data.toString().split(' ')
               , min1 = parseFloat(tokens[0]) + 0.01
               , min5 = parseFloat(tokens[1]) + 0.01
               , min15 = parseFloat(tokens[2]) + 0.01
               , m = min1 * 10 + min5 * 2 + min15;
            return m;

        },

     
    randNumber: function(upper, extra) {
	    var num = Math.abs(Math.round(Math.random() * upper));
	    return num + (extra || 0);

	},

	// *** randTime function
	randTime: function(n) {
	    return Math.abs(Math.round(Math.random() * n)) + 1;

	},

	// *** showArguments function
	showArguments: function(a) {
	    for (var k in a)
		console.log('\tPart ', k, ': ', a[k].toString());

	}

}
