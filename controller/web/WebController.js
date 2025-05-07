var exports = module.exports = {}
const config = require('../../config.js');
const Hotel = require('../../model/Hotel.js');
const User = require('../../model/User.js');

exports.index = async function (req, res) {
    const session = req.session;
  
    try {
      // Fetch hotels from the database
      const hotels = await Hotel.findAll({
        where: { type: 'hotel' }
      });
  
      // Group hotels by city
      const groupedHotels = hotels.reduce((acc, hotel) => {
        const city = hotel.city || 'Other'; // Default to 'Other' if no city is available
        if (!acc[city]) {
          acc[city] = [];
        }
        acc[city].push(hotel);
        return acc;
      }, {});
  
      // Prepare the user data if logged in
      let user = '';
      if (session.user_id !== undefined) {
        const result = await User.findOne({
          where: { id: session.user_id }
        });
  
        if (!result) return res.redirect('/logout');
        user = result;
      }
  
      res.render('pages/index', {
        APP_URL: config.APP_URL,
        groupedHotels, 
        url: req.url,
        user
      });
    } catch (err) {
      console.error("Error fetching hotels or user:", err);
      res.status(500).send("Error occurred");
    }
  };
  
