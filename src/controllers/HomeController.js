module.exports = {
	checkHealth(req, res) {
		res.json({
			application: 'WU-Handler',
			description: 'Weather Underground Handler for FIWARE',
			version: '1.0.0'
		});
	}
};
