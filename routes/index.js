var models  = require('../models');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

function set_headers(res) {
	res.set(
		{
			'Content-Type': 'application/vnd.tabroom+json; version=2',
			'Accept': 'application/vnd.tabroom+json; version=2'
		}
	);
}

router.get(
	'/tournaments',
	function (req, res, next) {
		set_headers(res);
		models.Tournament.findAll().then(
			function (tournament) {
				res.status(200);
				res.json(
					{
						'tournaments': tournament
					}
				);
			}
		);
	}
);