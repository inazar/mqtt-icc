var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://192.168.1.200', {username: 'icc', password: 'raspberry'});

var d_in_topic = 'domoticz/in';
var d_out_topic = 'domoticz/out';

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

var thermostat = [29, 40, 39, 41];

client.on('message', function (topic, message) {
	if (topic === d_out_topic) {
		message = JSON.parse.message;
		if (thermostat.indexOf(message.idx) >=0) {
			client.publish(d_out_topic, JSON.stringify({
				idx: message.idx,
				nvalue: 0,
				svalue1: message.svalue1
			}));
		}
	} else {
		var t = topic.split('/'), base = t[0], val, cfg;
		if (t.length = 3 && base === "Heating" && t[2] === "state" && heater[t[1]]) {
			message = JSON.parse(message);
			client.publish(d_in_topic, JSON.stringify({
				idx: heater[t[1]],
				nvalue: message.onoff
			}));
		} else {
			val = t[1];
			cfg = config[base];
			if (cfg && cfg[val]) {
				client.publish(d_in_topic, JSON.stringify({
					idx: cfg[val],
					nvalue: 0,
					svalue: message.toString()
				}));
			} else if (val === "InverterMode") {
				client.publish(d_in_topic, JSON.stringify({
					idx: modeIdx,
					nvalue: /\(Grid\)/.test(message) ? 1 : 0,
				}));
			}
		}
	}
});
