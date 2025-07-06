const config = require('../config.js');
const Admin = require('../model/Admin.js'); // Sequelize models
const Hotel = require('../model/Hotel.js'); // Sequelize models
const jwt = require('jsonwebtoken');
const RoomType = require('../model/RoomType.js');
const MealPlans = require('../model/MealPlans.js');
const HotelRooms = require('../model/HotelRooms.js');
const RoomAvailability = require('../model/RoomAvailability.js');

const SECRET_KEY = 'kasnfwsfna32420u';
 //new change
exports.login = async function (req, res) {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(401).send("Invalid email or password");
    }
    if (password !== admin.password) {
      return res.status(401).send("Invalid email or password");
    }
    const token = jwt.sign(
      { id: admin.id, name: admin.name, email: admin.email },
      SECRET_KEY, // Secret key for encoding the token
      { expiresIn: '1h' } // Expiration time for the token (e.g., 1 hour)
    );
    res.json({
      message: "Login successful",
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
      token: token, // Send token in the response
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Server error");
  }
};
exports.Basicdata = async function (req, res) {
  const hotels = await Hotel.findAll({ attributes: ['id', 'name'] });
  const roomType = await RoomType.findAll({ attributes: ['id', 'room_name'] });
  const mealPlans = await MealPlans.findAll({ attributes: ['id', 'plan_name'] });
  res.json({
    hotels, roomType, mealPlans

  });

}
exports.HotelRoomCreate = async function (req, res) {
  try {
    const { hotel_id, room_type_id, room_size, images, main_image, bed_type, accommodation, description, meal_plan_pricing } = req.body
    console.log(req.body.meal_plan_pricing);
    // NEED TO ADD DATA IN TABLS
    // HOTELS,HOTEL_ROOMS,PRICING,ROOMAVIALABILITY,extraPersonPricing(left this only)
    const hotel = await Hotel.findByPk(hotel_id);
    const hotelRoomImages = images.join(',')
    const hotelRooms = await HotelRooms.Create({
      hotel_id: hotel.id,
      room_type_id: room_type_id,
      room_size: room_size,
      images: hotelRoomImages,
      main_image: main_image,
      accommodation: accommodation,
      description: description
    });
    // create pricing for the room
    const room_id = hotelRooms.id;
    for (const mealPlan of meal_plan_pricing) {
      const plan_id = mealPlan.plan.id;
      // const num_persons
      mealPlan.meal_prices.foreach(async (price, index) => {
        const num_persons = index + 1;
        const base_price = price.base_Price;
        const tax_percentage = 12;
        await roomPricing.Create({
          plan_id, room_id, num_persons, base_price, tax_percentage
        })
      })
    }
    // this need to be change one room can have two bed types
    await RoomAvailability.Create({
      room_id,hotel_id,bed_type,available_rooms
    });
    res.status(200).send(req.body.meal_plan_pricing);
  } catch (e) {
    res.status(500).send("Error creating hotel or room");
  }
}