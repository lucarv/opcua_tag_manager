'use strict';
const jf = require('jsonfile');

const express = require('express');
const router = express.Router();

var newEndpoint = {};
var newTags = [];
var servers;
var focusServer = -1;

var file = process.env.PNFILE || '/appdata/pn.json';

const getFileAsynch = () => {
  try {
    servers = jf.readFileSync(file);
  } catch (e) {
    jf.writeFileSync(file, []);
    res.render('error', {
      title: 'OPCUA Tag Manager',
      messge: 'empty pn.json, created new',
    });
  }
};

getFileAsynch();

/* GET home page. */

router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'OPCUA Tag Manager',
  });
});

router.get('/browse', function (req, res, next) {
  try {
    servers = jf.readFileSync(file);
    let endpoints = [];

    for (var i = 0; i < servers.length; i++) {
      endpoints.push({
        id: i,
        url: servers[i].EndpointUrl
      });
    }

    res.render('servers', {
      title: 'OPCUA Tag Manager',
      endpoints,
    });
  } catch (e) {
    jf.writeFileSync(file, []);
    res.render('error', {
      title: 'OPCUA Tag Manager',
      messge: 'empty pn.json, created new',
    });
  }
});

router.post('/list', function (req, res, next) {
  if (req.body.id == null) {
    res.render('error', {
      title: 'OPCUA Tag Manager',
      message: 'No Server Selected',
    });
  } else {
    focusServer = req.body.id;
    let endpoint = servers[focusServer];
    let tags = endpoint.OpcNodes;
    let url = endpoint.EndpointUrl;
    res.render('tags', {
      title: 'OPCUA Tag Manager',
      tags,
      url,
    });
  }
});

router.get('/addep', function (req, res, next) {
  res.render('addep', {
    title: 'OPCUA Tag Manager',
  });
});

router.get('/addfile', function (req, res, next) {
  res.render('addfile', {
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

router.post('/newtag', function (req, res, next) {
  if (focusServer == -1) {
    res.render('index', {
      title: 'OPCUA Tag Manager',
      message: 'Can\'t add tag to unknown server. Select server first from browse tab'
    });
  } else {
    servers[focusServer].OpcNodes.push(req.body); 
    focusServer = -1; jf.writeFile(file, servers, function (err) {
      if (err) {
        res.render('error', {
          title: 'OPCUA Tag Manager',
          messge: 'error writing to disk',
        });
      } else {
        res.render('index', {
          title: 'OPCUA Tag Manager',
          message: 'successfully added tag to endpoint'
        });
      }
    });
  }
});

router.post('/committ', function (req, res, next) {
  newEndpoint['OpcNodes'] = newTags;
  servers.push(newEndpoint);

  // clear buffers
  newTags = [];

  jf.writeFile(file, servers, function (err) {
    if (err) {
      res.render('error', {
        title: 'OPCUA Tag Manager',
        messge: 'error writing to disk',
      });
    } else {
      res.render('index', {
        title: 'OPCUA Tag Manager',
        message: 'successfully added new server'
      });
    }
  });
});

router.post('/replace', function (req, res, next) {
  jf.writeFile(file, JSON.parse(req.body.file), function (err) {
    if (err) {
      res.render('error', {
        title: 'OPCUA Tag Manager',
        messge: 'error deleting endpoint',
      });
    } else {
      res.render('index', {
        title: 'OPCUA Tag Manager',
        message: 'successfully replaced pn.json'
      });
    }
  });
});

router.post('/append', function (req, res, next) {
  let newServers = servers.concat(JSON.parse(req.body.file));
  jf.writeFile(file, newServers, function (err) {
    if (err) {
      res.render('error', {
        title: 'OPCUA Tag Manager',
        messge: 'error deleting endpoint',
      });
    } else {
      res.render('index', {
        title: 'OPCUA Tag Manager',
        message: 'successfully appended new endpoints'
      });
    }
  });

});

router.post('/delete', function (req, res, next) {
  servers.splice(req.body.id, 1);
  jf.writeFile(file, servers, function (err) {
    if (err) {
      res.render('error', {
        title: 'OPCUA Tag Manager',
        messge: 'error deleting endpoint',
      });
    } else {
      res.render('index', {
        title: 'OPCUA Tag Manager',
        message: 'successfully delete server'
      });
    }
  });
});

router.post('/purge', function (req, res, next) {
  jf.writeFile(file, [], function (err) {
    if (err) {
      res.render('error', {
        title: 'OPCUA Tag Manager',
        messge: 'error deleting endpoint',
      });
    } else {
      res.render('index', {
        title: 'OPCUA Tag Manager',
        message: 'successfully purged all servers'
      });
    }
  });
});

module.exports = router;