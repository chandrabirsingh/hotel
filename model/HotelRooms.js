const {DataTypes} = require('sequelize');
const sequelize = require('../sequelize');
const HotelRooms = sequelize.define('HotelRooms', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    hotel_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model:'Hotel',
            key:'id'
        }
    },
    room_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'RoomType', 
            key: 'id'
        }
    },
    room_size:{
        type:DataTypes.STRING,
        allowNull: false,
    },description:{
        type:DataTypes.STRING,
        allowNull: true,
    },
    price:{
        type:DataTypes.DECIMAL(10, 2),
        allowNull: false,
    }
}, {
    tableName: 'hotel_rooms',
    timestamps: false,  
});
module.exports = HotelRooms;