const config = require('../config.js');

const fetchCitiesAndHotel = (req, res, next) =>{
    const getCitiesQuery = "SELECT DISTINCT city FROM hotels WHERE type = 'hotel'";
    const getHotelQuery = `
        SELECT * 
        FROM hotels 
        WHERE id IN (
            SELECT MIN(id) 
            FROM hotels 
            WHERE type = 'hotel' 
            GROUP BY city
        )
    `; // Fetch only one hotel
    
    config.con.query(getCitiesQuery, (err, cities) => {
        if (err) {
            console.error("Error fetching cities:", err);
            return next(err);
        }
        
        config.con.query(getHotelQuery, (error, hotelData) => {
            if (error) {
                console.error("Error fetching hotel data:", error);
                return next(error);
            }

            // Assuming only one hotel is returned and taking the first one
           

            // Create the slug from the hotel name
            const hotelsWithSlug = hotelData.map(hotel => ({
                ...hotel,
                slug: hotel.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            }));

            // Add hotel data and slug to res.locals to make them available in views
            res.locals.singleHotel = hotelsWithSlug;
            // console.log(hotelsWithSlug );
            res.locals.cities = cities;
            next();
        });
    });
};

module.exports = fetchCitiesAndHotel;

