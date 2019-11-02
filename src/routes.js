const express = require('express');
const routes = express.Router();

const HomeController = require('./controllers/HomeController');
const WUController = require('./controllers/WUController');

routes.get('/', HomeController.checkHealth);
routes.post('/update-weather', WUController.updateFiware);

module.exports = routes;
