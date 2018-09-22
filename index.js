var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://192.168.1.200', {username: 'icc', password: 'raspberry'});

var d_topic = 'domoticz/in';

client.on('connect', function () {
  client.subscribe('Inverter/#', function (err) {
    if (err) {
      console.log('Failed to subscribe Inverter/#: ' + err.message);
    }
  });
  client.subscribe('BMV/#', function (err) {
    if (err) {
      console.log('Failed to subscribe BMV/#: ' + err.message);
    }
  });
});

var config = {
	'BMV': {
		'SOC': 32,
		'Voltage': 33,
		'Amps': 34,
		'Midpoint': 35
	}
};

client.on('message', function (topic, message) {
	var t = topic.split('/'), base = t[0], val = t[1], cfg = config[base];
	if (cfg && cfg[val]) {
		client.publish(d_topic, JSON.stringify({
			idx: cfg[val],
			nvalue: 0,
			svalue: message.toString()
		}));
	}
});
