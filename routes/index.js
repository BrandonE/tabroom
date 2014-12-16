var express = require('express');
var router = express.Router();
var https = require('https');
var parseXml = require('libxmljs').parseXml;

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

function get_xml(url, res, callback) {
	https.get(
		url,
		function (https_res) {
			var chunks = [];

			https_res
			.on(
				'data',
				function (chunk) {
					chunks.push(chunk);
				}
			)
			.on(
				'end',
				function () {
					var xml = Buffer.concat(chunks);

					try {
						var xmlDoc = parseXml(xml);
						callback(xmlDoc);
					}
					catch (err) {
						res.status(500);
						res.json('XML Parsing Error: ' + err.message);
					}
				}
			);
		}
	)
	.on(
		'error',
		function (err) {
			res.status(500);
			res.json('HTTPS Error: ' + err.message);
		}
	);
}

function set_headers(res) {
	res.set(
		{
			'Accept': 'application/vnd.tabroom+json; version=2'
		}
	);
}

router.get(
	'/tournaments',
	function (req, res, next) {
		get_xml(
			'https://www.tabroom.com/api/current_tournaments.mhtml',
			res,
			function (xmlDoc) {
				var tournaments = [];
				var tourns = xmlDoc.find('//TOURNLIST/TOURN');

				for (i in tourns) {
					var tourn = tourns[i];

					tournaments.push(
						{
							id: tourn.get('ID').text(),
							name: tourn.get('TOURNNAME').text(),
							start_date: tourn.get('STARTDATE').text(),
							end_date: tourn.get('ENDDATE').text(),
							download_site: tourn.get('DOWNLOADSITE').text(),
						}
					);
				}

				res.status(200);
				res.json(tournaments);
			}
		);
	}
);