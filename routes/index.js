var models  = require('../models');
var express = require('express');
var router = express.Router();
var base_path = 'https://tabroom-node.herokuapp.com/';

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

function get_attributes(model, attributes_string) {
	// Specify what fields to get from items of this model using this string.
	var attributes = [];
	var attributes_parts;

	if (typeof attributes_string === 'string') {
		attributes_parts = attributes_string.split(',');

		for (var i in attributes_parts) {
			var attribute = attributes_parts[i];

			if (attribute in model.tableAttributes) {
				attributes.push(attribute);
			}
		}
	}

	if (attributes.length == 0) {
		return null;
	}

	return attributes;
}

function get_order(model, order_string) {
	// Specify how to sort items of this model using this string.
	var order = [];
	var order_parts;

	if (typeof order_string === 'string') {
		order_parts = order_string.split(',');

		for (var i in order_parts) {
			var order_part = order_parts[i];
			var attribute;
			var direction = 'ASC';

			if (order_part.length == 0) {
				continue;
			}
			else if (order_part.charAt(0) == '-') {
				attribute = order_part.substring(1);
				direction = 'DESC';
			}
			else {
				attribute = order_part;
			}

			if (attribute in model.tableAttributes) {
				order.push([attribute, direction]);
			}
		}
	}

	return order;
}

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

		models.Tournament.findAll(
			{
				attributes: get_attributes(models.Tournament, req.query.fields),
				order: get_order(models.Tournament, req.query.sort)
			}
		).then(
			function (tournaments) {
				res.status(200);
				res.json(
					{
						links: {
							posts: base_path + 'tournaments/{tournaments.id}'
						},
						tournaments: tournaments
					}
				);
			}
		);
	}
);