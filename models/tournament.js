"use strict";

module.exports = function(sequelize, DataTypes) {
	var Tournament = sequelize.define(
		'Tournament',
		{
			name: {
				type: DataTypes.STRING(63),
				allowNull: false
			},
			start: DataTypes.DATE,
			end: DataTypes.DATE,
			reg_start: DataTypes.DATE,
			reg_end: DataTypes.DATE,
			timestamp: {
				type: DataTypes.DATE,
				allowNull: false
			},
			hidden: DataTypes.BOOLEAN,
			approved: DataTypes.DATE,
			webname: DataTypes.STRING(63),
			tz: DataTypes.STRING(31),
			state: DataTypes.STRING(7),
			country: DataTypes.STRING(7),
			foreign_site: DataTypes.INTEGER,
			foreign_id: DataTypes.INTEGER,
			created_by: DataTypes.INTEGER,
		},
		{
			timestamps: false,
			underscored: true,
			freezeTableName: true,
			tableName: 'tourn',
			classMethods: {
				associate: function(models) {
					//Tournament.hasMany(models.X)
					//Tournament.belongsTo(models.Y);
				}
			}
		}
	);

	return Tournament;
};