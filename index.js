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
  client.subscribe('Heating/#', function (err) {
    if (err) {
      console.log('Failed to subscribe Heating/#: ' + err.message);
    }
  });
});

var config = {
	'BMV': {
		'SOC': 32,
		'Voltage': 33,
		'Amps': 34,
		'Midpoint': 35
	},
	'Inverter': {
		 'GridVoltage': 58
	}
};

var modeIdx = 65;

var heater = {
	"Hall": 59,
	"Galya": 60,
	"Dasha": 61,
	"Nastya": 62
};

client.on('message', function (topic, message) {
	var t = topic.split('/'), base = t[0], val, cfg;
	if (base === "Heating" && t[2] === "state" && t[3] === "get" && heater[t[1]]) {
		message = JSON.parse(message);
		client.publish(d_topic, JSON.stringify({
			idx: heater[t[1]],
			nvalue: message.onoff
		}));
	} else {
		val = t[1];
		cfg = config[base];
		if (cfg && cfg[val]) {
			client.publish(d_topic, JSON.stringify({
				idx: cfg[val],
				nvalue: 0,
				svalue: message.toString()
			}));
		} else if (val === "InverterMode") {
			client.publish(d_topic, JSON.stringify({
				idx: modeIdx,
				nvalue: /\(Grid\)/.test(message) ? 1 : 0,
			}));
		}
	}
});
