const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize'); 

const MealPlans = sequelize.define('MealPlans',{

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    plan_name: DataTypes.STRING,
    description: DataTypes.STRING,
}, {
    tableName: 'meal_plans',
    timestamps: true,
});

module.exports = MealPlans;