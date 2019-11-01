const request = require('request-promise');
const WUConfig = require('../configs/WUConfig');
const WeatherUndergroundBaseUrl = 'https://api.weather.com/v2/pws/observations/';

function getRequestURL() {
	return (
		WeatherUndergroundBaseUrl +
		`current?stationId=${WUConfig.stationId}&format=json&units=m&apiKey=${WUConfig.apiKey}&numericPrecision=decimal`
	);
}

async function getRawData() {
	const WeatherUndergroundUrl = getRequestURL();
	const currentConditions = await request(WeatherUndergroundUrl);
	return JSON.parse(currentConditions);
}

function formatData(rawData) {
	return {
		id: 'urn:ngsi-ld:WeatherStation:001',
		type: 'WeatherStation',
		location: {
			type: 'geo:json',
			value: {
				type: 'Point',
				coordinates: [rawData.lon, rawData.lat]
			}
		},
		source: {
			type: 'Text',
			value: 'WU-Handler'
		},
		name: {
			type: 'Text',
			value: rawData.stationID
		},
		dewPoint: {
			type: 'Number',
			value: rawData.metric.dewpt
		},
		temperature: {
			type: 'Number',
			value: rawData.metric.temp
		},
		relativeHumidity: {
			type: 'Number',
			value: rawData.humidity
		},
		precipitation: {
			type: 'Number',
			value: rawData.metric.precipRate
		},
		windDirection: {
			type: 'Number',
			value: rawData.winddir
		},
		windSpeed: {
			type: 'Number',
			value: rawData.metric.windSpeed
		},
		atmosphericPressure: {
			type: 'Number',
			value: rawData.metric.pressure
		},
		solarRadiation: {
			type: 'Number',
			value: rawData.solarRadiation
		}
		// refFarm: {
		// 	type: 'Relationship',
		// 	value: ''
		// },
		// refFarmer: {
		// 	type: 'Relationship',
		// 	value: ''
		// },
		// refWaterEstimate: {
		// 	type: 'Relationship',
		// 	value: ''
		// }
	};
}

async function getData() {
	const rawData = await getRawData();
	const formattedData = formatData(rawData.observations[0]);
	return JSON.stringify(formattedData);
}

async function findWeatherStation() {
	const orionReadUri = 'http://10.1.1.144:1026/v2/entities?type=WeatherStation';

	let weatherStation = await request(orionReadUri, {
		method: 'GET'
	});

	return JSON.parse(weatherStation).length;
}

exports.updateFiware = async () => {
	// IP do Orion 10.1.1.144
	let body = await getData();
	const orionUpdateUri = 'http://10.1.1.144:1026/v2/entities/urn:ngsi-ld:WeatherStation:001/attrs';
	const orionCreateUri = 'http://10.1.1.144:1026/v2/entities';

	const weatherStationFound = await findWeatherStation();

	if (weatherStationFound) {
		body = JSON.parse(body);
		delete body.id;
		delete body.type;
		body = JSON.stringify(body);
	}

	await request({
		uri: weatherStationFound ? orionUpdateUri : orionCreateUri,
		method: weatherStationFound ? 'PATCH' : 'POST',
		body,
		headers: {
			'Content-Type': 'application/json'
		}
	});

	return JSON.parse(body);
};
