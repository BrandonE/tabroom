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

function get_filters(model, query) {
	// Specify what fields to filter on using the values provided in the query.
	var filters = {};

	for (var attribute in query) {
		if (attribute in model.tableAttributes) {
			filters[attribute] = query[attribute];
		}
	}

	return filters;
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

router.param(
	'tournament',
	function (req, res, next, ids) {
		var ids = ids.split(',');

		if (ids.length == 1) {
			models.Tournament.find(
				{
					attributes: get_attributes(models.Tournament, req.query.fields),
					where: { id: ids[0] }
				}
			).then(
				function (tournament) {
					req.tournaments = tournament;
					return next();
				}
			);
		}
		else {
			models.Tournament.findAll(
				{
					attributes: get_attributes(models.Tournament, req.query.fields),
					where: { id: ids }
				}
			).then(
				function (tournaments) {
					req.tournaments = tournaments;
					return next();
				}
			);
		}
	}
);

router.get(
	'/tournaments',
	function (req, res, next) {
		set_headers(res);

		models.Tournament.findAll(
			{
				attributes: get_attributes(models.Tournament, req.query.fields),
				where: get_filters(models.Tournament, req.query),
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

router.get(
	'/tournaments/:tournament',
	function (req, res, next) {
		set_headers(res);

		if (req.tournaments !== null) {
			res.status(200);
			res.json(
				{
					links: {
						posts: base_path + 'tournaments/{tournaments.id}'
					},
					tournaments: req.tournaments
				}
			);
		}
		else {
			res.status(404);
			res.json(
				{
					errors: {
						status: '404',
						code: 'not_found',
						title: 'Not Found',
						detail: 'The requested URL was not found on this server.'
					}
				}
			);
		}
	}
);