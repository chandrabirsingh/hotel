const {DataTypes} = require('sequelize');
const sequelize = require('../sequelize');

const RoomType = sequelize.define('RoomType', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      room_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
},{
    tableName: 'room_types',
    timestamps: false,  
});
module.exports = RoomType;