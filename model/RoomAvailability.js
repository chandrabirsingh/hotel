const {DataTypes} = require('sequelize');
const sequelize = require('../sequelize');
const RoomAvailability = sequelize.define('RoomAvailability', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    room_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'HotelRooms',
            key: 'id'
        }
    },
    available_rooms: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    booked_rooms: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    tableName: 'room_availability',
    timestamps: false,  
});
module.exports = RoomAvailability;