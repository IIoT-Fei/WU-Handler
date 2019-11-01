const WUApplication = require('../application/WUApplication');

module.exports = {
	async updateFiware(req, res) {
		const data = await WUApplication.updateFiware();
		return res.json(data);
	}
};
