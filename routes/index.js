var models  = require('../models');
var express = require('express');
var JaySchema = require('jayschema');
var router = express.Router();
var validate = false;
var base_path = 'https://tabroom-node.herokuapp.com/';

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

function process_data(items) {
	var processed = [];

	for (i in items) {
		var item = items[i].dataValues;
		item.id = item.id.toString();
		processed.push(item);
	}

	return processed;
}

function schema_validate(instance) {
	if (!validate) {
		return;
	}

	var js = new JaySchema();
	var schema = {
		"id": "http://jsonapi.org/schema#", 
		"$schema": "http://json-schema.org/draft-04/schema#", 
		"title": "JSON API Schema", 
		"description": "This is a schema for responses in the JSON API format. For more, see http://jsonapi.org", 
		"type": "object", 
		"resources": {
			"type": "array", 
			"items": {
				"type": "object", 
				"properties": {
					"id": {
						"type": [
							"string"
						]
					}, 
					"href": {
						"type": "string"
					}, 
					"links": {
						"type": "object"
					}
				}, 
				"required": [
					"id"
				]
			}
		}, 
		"patternProperties": {
			"^(?!href$)(?!links$)(?!id$)(?!meta)(?!linked)": {
				"$ref": "#/resources"
			}
		}, 
		"properties": {
			"meta": {
				"type": "object"
			}, 
			"links": {
				"type": "object"
			}, 
			"linked": {
				"type": "object", 
				"patternProperties": {
					".*": {
						"$ref": "#/resources"
					}
				}
			}
		}
	};

	console.log(js.validate(instance, schema));
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
	'tournaments',
	function (req, res, next, ids) {
		var ids = ids.split(',');

		models.Tournament.findAll(
			{
				attributes: get_attributes(models.Tournament, req.query.fields),
				where: { id: ids }
			}
		).then(
			function (tournaments) {
				req.tournaments = process_data(tournaments);
				return next();
			}
		);
	}
);

router.get(
	'/',
	function (req, res) {
		res.render('index');
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
				var output = {
					links: {
						tournaments: base_path + 'tournaments/{tournaments.id}'
					},
					tournaments: process_data(tournaments)
				};

				res.status(200);
				res.json(output);
				schema_validate(output);
			}
		);
	}
);

router.get(
	'/tournaments/:tournaments',
	function (req, res, next) {
		var output;
		set_headers(res);

		if (req.tournaments !== null) {
			output = {
				links: {
					tournaments: base_path + 'tournaments/{tournaments.id}'
				},
				tournaments: req.tournaments
			};

			res.status(200);
		}
		else {
			output = {
				errors: {
					status: '404',
					code: 'not_found',
					title: 'Not Found',
					detail: 'The requested URL was not found on this server.'
				}
			};

			res.status(404);
		}

		res.json(output);
		schema_validate(output);
	}
);