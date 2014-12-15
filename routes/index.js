var express = require('express');
var router = express.Router();
var http = require('http');
var parseXml = require('libxmljs').parseXml;

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

function get_xml(url, res, callback) {
	http.get(
		url,
		function (http_res) {
			var chunks = [];

			http_res
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
						res.json('XML Parsing Error: ' + err.message);
					}
				}
			);
		}
	)
	.on(
		'error',
		function (err) {
			res.json('HTTP Error: ' + err.message);
		}
	);
}

router.get(
	'/tournaments',
	function (req, res, next) {
		get_xml(
			'http://www.tabroom.com/api/current_tournaments.mhtml',
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
							start: tourn.get('STARTDATE').text(),
							end: tourn.get('ENDDATE').text(),
						}
					);
				}

				res.json(tournaments);
			}
		);
	}
);