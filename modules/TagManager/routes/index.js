'use strict';
const jf = require('jsonfile');

const express = require('express');
const router = express.Router();

var servers = [];
var newEndpoint = {};
var newTags = [];
var servers = [];

var file = process.env.PNFILE || '/appdata/pn.json'
jf.readFile(file, function (err, obj) {
	if (err) {
		console.error(err);
		jf.writeFile(file, servers, function (err) {
			if (err) console.error(err);
			
		});
	} else {
		servers = obj;
	}
});

/*
const Transport = require('azure-iot-device-mqtt').Mqtt;
const Client = require('azure-iot-device').ModuleClient;
const Message = require('azure-iot-device').Message;

Client.fromEnvironment(Transport, function (err, client) {
	if (err) {
		throw err;
	} else {
		client.on('error', function (err) {
			throw err;
		});

		// connect to the Edge instance
		client.open(function (err) {
			if (err) {
				throw err;
			} else {
				('IoT Hub module client initialized');

				// Act on input messages to the module.
				client.on('inputMessage', function (inputName, msg) {
					pipeMessage(client, inputName, msg);
				});
			}
		});
	}
});
*/

/* GET home page. */
router.get('/', function (req, res, next) {
	let endpoints = [];

	for (var i = 0; i < servers.length; i++) {
		endpoints.push({ id: i, url: servers[i].EndpointUrl });
	}

	res.render('servers', {
		title: 'OPCUA Tag Manager',
    endpoints
	});
});

router.post('/list', function (req, res, next) {
	if (req.body.id == null) {
		res.render('error', {
			title: 'OPCUA Tag Manager',
			message: 'No Server Selected',
		});
	} else {
    let endpoint = servers[req.body.id];
    let tags = endpoint.OpcNodes;
    let url = endpoint.EndpointUrl
		res.render('tags', {
			title: 'OPCUA Tag Manager',
      tags,
      url
		});
	}
});

router.get('/addep', function (req, res, next) {
	res.render('addep', {
		title: 'OPCUA Tag Manager',
	});
});

router.post('/addendp', function (req, res, next) {
	let sec = req.body.UserSecurity;

	newEndpoint['EndpointUrl'] = req.body.EndPointUrl;
	if (sec === 'true') {
		newEndpoint['UseSecurity'] = true;
		newEndpoint['OpcAuthenticationMode'] = 'UsernamePassword';
		newEndpoint['OpcAuthenticationUsername'] = req.body.OpcAuthenticationUsername;
		newEndpoint['OpcAuthenticationPassword'] = req.body.OpcAuthenticationPassword;
	} else {
		newEndpoint['UseSecurity'] = false;
	}
	res.render('addtag', {
		title: 'OPCUA Tag Manager',
	});
});

router.post('/addtag', function (req, res, next) {
	newTags.push(req.body);
	res.render('addtag', {
		title: 'OPCUA Tag Manager',
	});
});

router.post('/committ', function (req, res, next) {
	newEndpoint['OpcNodes'] = newTags;
	servers.push(newEndpoint);
	let endpoints = [];

	for (var i = 0; i < servers.length; i++) {
		endpoints.push({ id: i, url: servers[i].EndpointUrl });
	}

	jf.writeFile(file, servers, function (err) {
		if (err) console.error(err);
		else {
			res.render('servers', {
				title: 'OPCUA Tag Manager',
        endpoints
			});
		}
	});
});

router.post('/delete', function (req, res, next) {
	servers.splice(req.body.id, 1);

  jf.writeFile(file, servers, function (err) {
    if (err) console.error(err);
    
  });

	res.render('servers', {
		title: 'OPCUA Tag Manager',
		endpoints,
	});
});

module.exports = router;
