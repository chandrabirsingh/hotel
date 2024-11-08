var exports = module.exports = {}
const config = require('../config.js');
const crypto = require('crypto');
// const { console } = require('inspector');
const nodemailer = require("nodemailer");
// const flash = require('connect-flash');
// const session = require('express-session');
// const { session } = require('passport');


exports.index = function (req, res) {
    PSession = req.session || {}
    config.con.query("SELECT hotels.city, MAX(hotels.status) AS status FROM hotels GROUP BY hotels.city", (err, cities) => {
        if (err) {
            console.error("Error fetching cities:", err);
            return res.status(500).send("Error fetching cities ");
        }

        config.con.query("SELECT * FROM hotels", (err, hotels) => {
            if (err) {
                console.error("Error fetching hotels:", err);
                return res.status(500).send("Error fetching hotels");
            }
            console.log(hotels)
            let user = '';
            if (PSession.user_id !== undefined) {

                config.con.query("SELECT * FROM user WHERE id=" + PSession.user_id, (err, result) => {
                    if (err) {
                        console.error("Error fetching user :", err);
                        return res.redirect('/logout');
                    }

                    if (result.length > 0) {
                        user = result[0];
                        console.log('user' + user);
                        return res.render('pages/index', {
                            APP_URL: config.APP_URL,
                            cities: cities,
                            hotels: hotels,
                            url: req.url,
                            user: user,
                            hid: 1, cowin: 1,
                            successMessage: req.flash('success'),  // Pass success message
                            errorMessage: req.flash('error')
                        });
                    } else {
                        return res.redirect('/logout');
                    }
                });
            } else {
                // console.log(JSON.stringify(req.session) +user + 'h');
                return res.render('pages/index', {
                    APP_URL: config.APP_URL,
                    cities: cities,
                    hotels: hotels,
                    url: req.url,
                    user: user,
                    hid: 1, cowin: 1,
                    successMessage: req.flash('success'),
                    errorMessage: req.flash('error')
                });
            }
        });
    });
}

exports.hotels = function (req, res) {
    session = req.session;
    console.log(session);

    config.con.query("SELECT * FROM hotels", (err, hotels) => {
        if (err) {
            console.error("Error fetching hotels:", err);
            return res.status(500).send("Error fetching hotels");
        }

        // return res.send(hotels);

        let user = '';
        if (session.user_id !== undefined) {
            config.con.query("SELECT * FROM user WHERE id=" + session.user_id, (err, result) => {
                if (err) {
                    res.redirect('/logout');
                } else {
                    if (result.length > 0) {
                        user = result[0];
                        console.log('user' + JSON.stringify(user));
                    } else {
                        res.redirect('/logout');
                    }
                    // return res.send(user);
                }
                res.render('pages/hotels', { APP_URL: config.APP_URL, hotels: hotels, url: req.url, user: user });
            });
        } else {
            res.render('pages/hotels', { APP_URL: config.APP_URL, hotels: hotels, url: req.url, user: user });
        }
    });
};

exports.hotelroomdetail = function (req, res) {
    session = req.session;
    const hotelSlug = req.params.hotel_slug; // Get the slug from the URL

    const hotelName = hotelSlug.replace(/-/g, ' ');
    const hotelQuery = "SELECT * FROM hotels WHERE name = ?";

    config.con.query(hotelQuery, [hotelName], (err, hotelResult) => {
        if (err || hotelResult.length === 0) {
            return res.status(404).send("Hotel not found.");
        }

        const hotelId = hotelResult[0].id;

        // Query to get rooms with room type for the specific hotel
        const roomsQuery = `
            SELECT hotel_rooms.*, room_types.room_name, hotels.name, hotels.city, hotels.map_link, hotels.full_address 
            FROM hotel_rooms
            INNER JOIN hotels ON hotel_rooms.hotel_id = hotels.id
            INNER JOIN room_types ON hotel_rooms.room_type_id = room_types.id
            WHERE hotels.id = ?
        `;

        // Query to get nearby places for the hotel
        const nearbyPlacesQuery = "SELECT * FROM nearby_places WHERE hotel_id = ? AND status = 'active'";

        // Execute both queries
        config.con.query(roomsQuery, [hotelId], (err, roomsResult) => {
            if (err) {
                return res.status(500).send("Error fetching hotel rooms.");
            }

            config.con.query(nearbyPlacesQuery, [hotelId], (err, nearbyPlacesResult) => {
                if (err) {
                    return res.status(500).send("Error fetching nearby places.");
                }

                let user = '';
                let reurl = `${hotelSlug}`;
                const book = roomsResult.length > 0 ? 1 : 0;

                // Check if user is logged in
                if (session.user_id !== undefined) {
                    config.con.query("SELECT * FROM user WHERE id = ?", [session.user_id], (err, result) => {
                        if (err) {
                            return res.redirect('/logout');
                        }
                        user = result.length > 0 ? result[0] : '';

                        // Render the page with hotel, rooms, nearby places, and user details
                        res.render('pages/hotelrooms', {
                            APP_URL: config.APP_URL,
                            rooms: roomsResult,
                            nearbyPlaces: nearbyPlacesResult,
                            url: reurl,
                            user: user,
                            book: book,
                            hotel: hotelResult[0]
                        });
                    });
                } else {
                    // Render without user details if not logged in
                    console.log(roomsResult, nearbyPlacesResult, hotelResult)
                    res.render('pages/hotelrooms', {
                        APP_URL: config.APP_URL,
                        rooms: roomsResult,
                        nearbyPlaces: nearbyPlacesResult,
                        url: reurl,
                        user: user,
                        book: book,
                        hotel: hotelResult[0]
                    });
                }
            });
        });
    });
};
exports.getRoomDetail = function (req, res) {
    const roomId = req.params.roomId; // Get the room ID from the URL
    const roomsQuery = `
            SELECT hotel_rooms.*, room_types.room_name
            FROM hotel_rooms
            INNER JOIN room_types ON hotel_rooms.room_type_id = room_types.id
            WHERE hotel_rooms.id = ?
        `;
    // Query to get room details based on roomId
    config.con.query(roomsQuery, [roomId], (err, result) => {
        if (err) {
            console.error('Error fetching room details:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        // Check if room exists
        if (result.length === 0) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Assuming result[0] contains the room details
        const room = result[0];
        room.images = room.images ? room.images.split(',').map(image => image.trim()) : [];
        // Prepare response object
        res.json(room);
    });
};

exports.detailhotel = function (req, res) {
    session = req.session;
    let user = '';
    var id = req.params.id ? req.params.id : 2
    config.con.query("SELECT hotel_room.*, hotel.city, hotel.hotel_name, hotel.hotel_images FROM `hotel_room` INNER JOIN hotel ON hotel_room.hotel_id=hotel.id WHERE hotel_room.id=" + id, (err, hotel_room) => {
        if (err) {
            console.error('SQL error:', err);  // Add error logging
            return res.status(500).send("An error occurred");
        }
        if (hotel_room.length > 0) {
            hotel_room = hotel_room[0];
        } else {
            return res.redirect('/hotels');
        }

        if (session.user_id !== undefined) {
            config.con.query("SELECT * FROM user WHERE id=" + session.user_id, (err, result) => {
                if (err) {
                    console.error('SQL error:', err);  // Add error logging
                    return res.redirect('/logout');
                } else {
                    if (result.length > 0) {
                        user = result[0];
                    } else {
                        return res.redirect('/logout');
                    }
                }
                res.render('detailhotel', { APP_URL: config.APP_URL, url: req.url, user: user, hotel_room: hotel_room });
            });
        } else {
            res.render('detailhotel', { APP_URL: config.APP_URL, url: req.url, user: user, hotel_room: hotel_room });
        }
    });

}

exports.booked = function (req, res) {
    session = req.session;
    let user = '';
    if (req.params.id) {
        var bookingId = req.params.id;
        config.con.query("SELECT * FROM booking WHERE id=" + bookingId, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send("An error occurred while querying the database.");
            }

            if (result && result.length > 0) {
                var bookdetail = result[0];
                res.render('modify', { APP_URL: config.APP_URL, url: req.url, user: user, bookdetail: bookdetail });
            } else {
                res.send('No Booking Found');
            }
        });
    }
}
// exports.booked = function (req, res) {
//     session = req.session;
//     let user = '';
//     if (session.user_id !== undefined) {
//         config.con.query("SELECT * FROM user WHERE id=" + session.user_id, (err, result) => {
//             if (err) { res.redirect('/logout'); } else {
//                 if (result.length > 0) {
//                     user = result[0];
//                 } else {
//                     res.redirect('/logout');
//                 }
//             }
//             config.con.query("SELECT * FROM user WHERE id=" + session.user_id, (err, book) => {
//                 res.render('booked', { APP_URL: config.APP_URL, url: req.url, user: user, id: req.params.id, book: book[0] });
//             });
//         });
//     } else {
//         config.con.query("SELECT * FROM booking WHERE id=" + req.params.id, (err, book) => {
//             res.render('booked', { APP_URL: config.APP_URL, url: req.url, user: user, id: req.params.id, book: book[0] });
//         });
//     }
// }
exports.booknow = function (req, res) {
    session = req.session;
    let user = '';
    let queryData = req.query;

    try {
        if (req.method === 'POST') {
            // Handle booking
            const myreq = req.body;

            // Calculate the discounted price based on active discount
            config.con.query("SELECT discount_percentage FROM discounts WHERE is_active = 1 LIMIT 1", (discountErr, discountResult) => {
                if (discountErr) {
                    console.error('Error fetching discount:', discountErr);
                    return res.status(500).send('Internal Server Error');
                }
                const discount = discountResult.length > 0 ? discountResult[0].discount_percentage : 0;
                const discountedAmount = myreq.amount * (1 - discount / 100) || null;

                // Insert booking data with discounted amount
                config.con.query(
                    "INSERT INTO `booking`(`name`, `email`, `mobile`, `country`, `address`, `city`, `additional`, `destination`, `hotel_id`, `checkin`, `checkout`, `room`, `room_id`, `status`, `payment_status`, `payment_amount`, `discount_applied`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'paid', ?, ?)",
                    [
                        'hello',
                        myreq.email || null,
                        myreq.mobile || null,
                        myreq.country || null,
                        myreq.address || null,
                        myreq.city || null,
                        myreq.additional || null,
                        req.query.destination || null,
                        req.query.hotel || null,
                        req.query.checkin || null,
                        req.query.checkout || null,
                        req.query.room || null,
                        req.query.room_id || null,
                        discountedAmount,
                        discount  // Store applied discount for reference
                    ],
                    (err, result) => {
                        if (err) {
                            console.error('Error during booking:', err);
                            return res.status(500).send('Internal Server Error');
                        }
                        res.send({ reurl: 'booked/' + result.insertId });
                    }
                );
            });

        } else {
            // Get hotel and room details
            const date = require('date-and-time');
            const hotelRoomsQuery = `
                SELECT hotel_rooms.*, hotels.name, hotels.city,room_types.room_name,hotels.full_address,hotels.main_image AS hotels_image
                FROM hotels 
                INNER JOIN hotel_rooms ON hotels.id = hotel_rooms.hotel_id 
                INNER JOIN room_types ON hotel_rooms.room_type_id = room_types.id
                WHERE hotels.id = ?`;

            config.con.query(hotelRoomsQuery, [req.query.hotel_id], (err, result) => {
                if (err) {
                    console.error('Error fetching hotel data:', err);
                    return res.status(500).send('Internal Server Error');
                }

                const hotel = result.length > 0 ? result[0] : {};
                const hotelRooms = result;
                const hotelName = hotel.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                const hotelURL = `https://www.skydoor.com/hotels/${hotelName}`;

                // Fetch active discount
                config.con.query("SELECT discount_percentage FROM discounts WHERE is_active = 1 LIMIT 1", (discountErr, discountResult) => {
                    if (discountErr) {
                        console.error('Error fetching discount:', discountErr);
                        return res.status(500).send('Internal Server Error');
                    }

                    const discount = discountResult.length > 0 ? discountResult[0].discount_percentage : 0;

                    // Calculate discounted price for each room
                    hotelRooms.forEach(room => {
                        room.original_price = room.price; // Assuming price is the original price from DB
                        room.discounted_price = room.price - (room.price * (discount / 100));
                    });

                    if (session.user_id !== undefined) {
                        config.con.query("SELECT * FROM user WHERE id=" + session.user_id, (err, result) => {
                            if (err) {
                                console.error('Error fetching user:', err);
                                return res.status(500).send('Internal Server Error');
                            }
                            if (result.length > 0) {
                                user = result[0];
                            } else {
                                return res.redirect('/logout');
                            }

                            res.render('pages/booking', { APP_URL: config.APP_URL, url: req.url, user, date, queryData: req.query, hotel, hotelRooms, hotelURL, discount, crypto });
                        });
                    } else {
                        const date1 = new Date(queryData.check_in);
                        const date2 = new Date(queryData.check_out);
                        const diffTime = Math.abs(date2 - date1);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        console.log(hotel)
                        res.render('pages/booking', { APP_URL: config.APP_URL, url: req.url, user, date, queryData: req.query, hotel, hotelRooms, hotelURL, discount, crypto, diffDays: diffDays });
                    }
                });
            });
        }
    } catch (error) {
        console.error('Unexpected Error:', error);
        res.status(500).send('Something went wrong');
    }
};
exports.createBooking = function (req, res) {
    const { user_id, hotel_id, total_price, rooms } = req.body;
    // Insert booking details into the Booking table
    const bookingQuery = `
    INSERT INTO Booking (user_id, hotel_id, total_price)
    VALUES (?, ?, ?)
    `;
    
    config.con.query(bookingQuery, [user_id, hotel_id, total_price], (error, results) => {
        if (error) {
            console.error("Error creating booking:", error);
            return res.status(500).json({ success: false, message: "Failed to create booking" });
        }
        
        const bookingId = results.insertId; // Get the ID of the newly created booking
        
        // Prepare to insert room details into the booking_room_detail table
        const roomDetailsQuery = `
        INSERT INTO booking_room_detail (booking_id, room_id, bed_type, food_preferences, check_in, check_out, adults,children, created_at, updated_at)
        VALUES ?
        `;
        
        const roomValues = rooms.map(room => [
            bookingId,
            room.room_id,
            room.bed_type,
            room.food_preferences.join(','), // Convert array to string if necessary
            room.check_in,
            room.check_out,
            room.adults,
            room.adults,
            new Date(),
            new Date()
        ]);
        
        config.con.query(roomDetailsQuery, [roomValues], (error) => {
            if (error) {
                console.error("Error inserting room details:", error);
                return res.status(500).json({ success: false, message: "Failed to save room details" });
            }
            console.log(bookingId);

            // Successfully created booking and saved room details
            res.status(201).json({ success: true, message: "Booking created successfully", bookingId });
        });
    });
};

exports.getRoomDetailsById = (req, res) => {
    const roomId = req.query.room_id;

    // SQL query to fetch room details
    const query = `
       SELECT hotel_rooms.*, 
       room_types.room_name, 
       (hotel_rooms.price * (1 - IFNULL(discounts.discount_percentage, 0) / 100)) AS discounted_price,
       (CASE 
            WHEN discounts.discount_percentage IS NULL THEN hotel_rooms.price * 0.12  -- Tax on original price if no discount
            ELSE (hotel_rooms.price * (1 - discounts.discount_percentage / 100)) * 0.12  -- Tax on discounted price if discount exists
        END) AS tax
        FROM hotel_rooms 
        INNER JOIN room_types ON hotel_rooms.room_type_id = room_types.id
        LEFT JOIN discounts ON discounts.is_active = 1
    WHERE hotel_rooms.id = ?;

    `;

    // Execute the query
    config.con.query(query, [roomId], (err, result) => {
        if (err) {
            console.error('Error fetching room details:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }

        if (result.length > 0) {
            const room = result[0];
            // Send room data in JSON format
            res.json({ success: true, room });
        } else {
            res.status(404).json({ success: false, message: 'Room not found' });
        }
    });
};
exports.booking = function (req, res) {
    session = req.session;
    let user = '';
    // return res.send(req.body.name);
    if (req.body.name !== undefined) {
        const query = "INSERT INTO `booking`(`name`, `email`, `mobile`, `country`, `address`, `city`, `additional`, `destination`, `hotel_id`, `checkin`, `checkout`, `room`, `room_id`, `child`, `adults`, `status`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')";

        const values = [
            req.body.name,
            req.body.email,
            req.body.mobile,
            req.body.country,
            req.body.address,
            req.body.city,
            req.body.additional || '',   // If additional info is optional, use empty string as default
            req.body.destination || '',  // Handle null/undefined values gracefully
            req.body.hotel_id || null,   // If hotel_id can be null, handle accordingly
            req.body.checkin || null,
            req.body.checkout || null,
            req.body.room || '',
            req.body.room_id || null,
            req.body.child || 0,         // Set default values if optional fields
            req.body.adults || 0
        ];

        config.con.query(query, values, (err, result) => {
            if (err) {
                console.log(err);
                return res.send(err);
            }

            // Redirect to the 'booked' page and pass the inserted booking ID as a query parameter
            const bookingId = result.insertId;
            res.redirect('booked/id=' + bookingId);
        });
    } else {
        res.redirect('hotels');
    }
}
exports.bookingDetail = function (req, res) {
    const bookingId = req.params.id;

    // Check if booking ID is provided
    if (!bookingId) {
        return res.status(400).json({ success: false, message: "Booking ID is required" });
    }

    // Query to join Booking and booking_room_detail tables based on booking_id
    const query = `
        SELECT 
            b.booking_id ,
            b.user_id,
            b.hotel_id,
            b.total_price,
            b.created_at,
            b.updated_at,
            brd.room_id,
            brd.bed_type,
            brd.food_preferences,
            brd.check_in,
            brd.check_out,
            brd.adults
        FROM 
            Booking b
        JOIN 
            booking_room_detail brd ON b.booking_id = brd.booking_id
        WHERE 
            b.booking_id = ?
    `;

    config.con.query(query, [bookingId], (error, results) => {
        if (error) {
            console.error("Error fetching booking details:", error);
            return res.status(500).json({ success: false, message: "Failed to fetch booking details" });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // Extract main booking details from the first result row
        const bookingDetail = {
            booking_id: results[0].booking_id,
            user_id: results[0].user_id,
            hotel_id: results[0].hotel_id,
            total_price: results[0].total_price,
            created_at: results[0].created_at,
            updated_at: results[0].updated_at,
            rooms: results.map(row => ({
                room_id: row.room_id,
                bed_type: row.bed_type,
                food_preferences: row.food_preferences ? row.food_preferences.split(',') : [],
                check_in: row.check_in,
                check_out: row.check_out,
                adults: row.adults
            }))
        };

        res.status(200).json({
            success: true,
            booking: bookingDetail
        });
    });
};

// function
exports.meet_and_events = function (req, res) {
    session = req.session;
    // console.log(req.body);
    if (req.body.booking_date !== undefined) {
        config.con.query("INSERT INTO `meeet_and_event`(`booking_date`, `booking_time`, `no_of_guest`, `name`, `email`, `phone`, `comment`) VALUES ('" + req.body.booking_date + "','" + req.body.booking_time + "','" + req.body.no_of_guest + "','" + req.body.name + "','" + req.body.email + "','" + req.body.phone + "','" + req.body.comment + "')", (err, result) => {
            if (err) console.log(err);
            res.redirect('meet-and-events');
        });
    } else {
        if (session.user_id !== undefined) {
            config.con.query("SELECT * FROM user WHERE id=" + session.user_id, (err, result) => {
                if (err) { res.redirect('/logout'); } else {
                    if (result.length > 0) {
                        user = result[0];
                    } else {
                        res.redirect('/logout');
                    }
                }
                res.render('pages/MeetAndEvent', { APP_URL: config.APP_URL, url: req.url, user: user });
            });
        } else {
            let user = '';
            res.render('pages/MeetAndEvent', { APP_URL: config.APP_URL, url: req.url, user: user });
        }
    }
}
// resorts
exports.resorts = function (req, res) {
    session = req.session;
    config.con.query("SELECT * FROM hotel WHERE hotel_type = 'Resort'", (err, hotels) => {
        let user = '';
        if (session.user_id !== undefined) {
            config.con.query("SELECT * FROM user WHERE id=" + session.user_id, (err, result) => {
                if (err) { res.redirect('/logout'); } else {
                    if (result.length > 0) {
                        user = result[0];
                    } else {
                        res.redirect('/logout');
                    }
                }
                res.render('pages/resorts', { APP_URL: config.APP_URL, hotels: hotels, url: req.url, user: user });
            });
        } else {
            res.render('pages/resorts', { APP_URL: config.APP_URL, hotels: hotels, url: req.url, user: user });
            // res.render('resorts', { APP_URL: config.APP_URL, hotels: hotels, url: req.url, user: user });
        }
    });
}
// Luxary Residency
exports.private_luxary_residency = function (req, res) {
    session = req.session;
    config.con.query("SELECT * FROM hotel WHERE hotel_type = 'Luxary Residency'", (err, hotels) => {
        let user = '';
        if (session.user_id !== undefined) {
            config.con.query("SELECT * FROM user WHERE id=" + session.user_id, (err, result) => {
                if (err) { res.redirect('/logout'); } else {
                    if (result.length > 0) {
                        user = result[0];
                    } else {
                        res.redirect('/logout');
                    }
                }
                res.render('private_luxary_residency', { APP_URL: config.APP_URL, hotels: hotels, url: req.url, user: user });
            });
        } else {
            res.render('private_luxary_residency', { APP_URL: config.APP_URL, hotels: hotels, url: req.url, user: user });
        }
    });
}
//service apartment

exports.service_apartments = function (req, res) {
    session = req.session;
    config.con.query("SELECT * FROM hotel WHERE hotel_type = 'Service Apartment'", (err, hotels) => {
        let user = '';
        if (session.user_id !== undefined) {
            config.con.query("SELECT * FROM user WHERE id=" + session.user_id, (err, result) => {
                if (err) { res.redirect('/logout'); } else {
                    if (result.length > 0) {
                        user = result[0];
                    } else {
                        res.redirect('/logout');
                    }
                }
                res.render('service_apartments', { APP_URL: config.APP_URL, hotels: hotels, url: req.url, user: user });
            });
        } else {
            res.render('service_apartments', { APP_URL: config.APP_URL, hotels: hotels, url: req.url, user: user });
        }
    });
}

exports.e_gift_coupon = function (req, res) {
    session = req.session;
    config.con.query("SELECT * FROM hotel", (err, hotels) => {
        let user = '';
        if (session.user_id !== undefined) {
            config.con.query("SELECT * FROM user WHERE id=" + session.user_id, (err, result) => {
                if (err) { res.redirect('/logout'); } else {
                    if (result.length > 0) {
                        user = result[0];
                    } else {
                        res.redirect('/logout');
                    }
                }
                res.render('e_gift_coupon', { APP_URL: config.APP_URL, hotels: hotels, url: req.url, user: user });
            });
        } else {
            res.render('e_gift_coupon', { APP_URL: config.APP_URL, hotels: hotels, url: req.url, user: user });
        }
    });
}

exports.feedback = function (req, res) {
    session = req.session;
    let user = '';
    res.render('feedback', { APP_URL: config.APP_URL, url: req.url, user: user });
}
exports.thankyou = function (req, res) {
    session = req.session;
    let user = '';
    if (session.user_id !== undefined) {
        config.con.query("SELECT * FROM user WHERE id=" + session.user_id, (err, result) => {
            if (err) { res.redirect('/logout'); } else {
                if (result.length > 0) {
                    user = result[0];
                } else {
                    res.redirect('/logout');
                }
            }
            res.render('thankyou', { APP_URL: config.APP_URL, url: req.url, user: user, message: req.params.message });
        });
    } else {
        res.render('thankyou', { APP_URL: config.APP_URL, url: req.url, user: user, message: req.params.message });
    }
}
exports.modify_can = function (req, res) {
    session = req.session;
    let user = '';
    if (req.body.booking_id !== undefined) {
        if (req.body.name !== undefined) {
            config.con.query("UPDATE `booking` SET `name`='" + req.body.name + "',`email`='" + req.body.email + "',`mobile`='" + req.body.mobile + "',`country`='" + req.body.country + "',`address`='" + req.body.address + "',`city`='" + req.body.city + "',`additional`='" + req.body.additional + "' WHERE id='" + req.body.booking_id + "'", (err, result) => {
                if (err) console.log(err);
                res.redirect('/modify-cancel');
            });
        } else {
            var bookingId = req.body.booking_id;
            bookingId = bookingId.replace("SKYDOOR000", "");
            //    console.log(bookingId);
            config.con.query("SELECT * FROM `booking` WHERE id='" + bookingId + "'", (err, result) => {
                if (err) console.log(err);
                if (result.length > 0) {
                    var bookdetail = result[0];
                } else {
                    res.return('No Booking Found');
                }
                res.render('modify', { APP_URL: config.APP_URL, url: req.url, user: user, bookdetail: bookdetail });
            });
        }
    } else {
        res.render('alert', { ALERT: 'Booking Updated Successfully' });
    }
}
exports.cancel = function (req, res) {
    session = req.session;
    let user = '';
    if (req.params.id) {
        var bookingId = req.params.id;
        config.con.query("UPDATE `booking` SET `status`='cancel' WHERE id='" + bookingId + "'", (err, result) => {
            if (err) console.log(err);
            if (result.length > 0) {
                var bookdetail = result[0];
            } else {
                res.send('No Booking Found');
            }
            res.render('modify', { APP_URL: config.APP_URL, url: req.url, user: user, bookdetail: bookdetail });
        });
    }
}
exports.contact = function (req, res) {
    session = req.session;
    let user = '';

    const redirectPage = req.body.redirectTo || 'contact'; // Default to contact if not specified

    if (req.body.name !== undefined) {
        const sqlQuery = "INSERT INTO `contact`(`name`, `mobile`, `email`, `message`) VALUES (?, ?, ?, ?)";
        const values = [req.body.name, req.body.mobile, req.body.email, req.body.message];

        config.con.query(sqlQuery, values, (err, result) => {
            if (err) {
                console.log(err);
                req.flash('error', 'There was an error saving your message.');
                return res.redirect(redirectPage === 'index' ? '/' : `/${redirectPage}`);
            }

            req.flash('success', 'Your message has been sent successfully!');
            return res.redirect(redirectPage === 'index' ? '/' : `/${redirectPage}`);
        });
    } else {
        res.render('contact', {
            APP_URL: config.APP_URL,
            url: req.url,
            user: user,
            successMessage: req.flash('success'),
            errorMessage: req.flash('error')
        });
    }
};

exports.login = function (req, res) {
    session = req.session;
    if (session.user_id == undefined) {
        if ((req.body.email !== undefined) && (req.body.password !== undefined)) {
            config.con.query("SELECT * FROM user WHERE email='" + req.body.email + "' AND password='" + req.body.password + "'", (err, result) => {
                if (err) {
                    res.redirect(req.body.url);
                } else {
                    if (result.length > 0) {
                        session.user_id = result[0].id;
                        res.redirect(req.body.url); // Use absolute URL
                    } else {
                        res.redirect(req.body.url); // Use absolute URL
                    }
                }
            });
        }
    } else {
        res.redirect(req.body.url); // Use absolute URL
    }
}

exports.register = function (req, res) {
    session = req.session;
    if (session.user_id == undefined) {
        if ((req.body.email !== undefined) && (req.body.password !== undefined)) {
            config.con.query("INSERT INTO `user`(`name`, `email`, `phone`, `password`) VALUES ('" + req.body.name + "','" + req.body.email + "','" + req.body.phone + "','" + req.body.password + "')", (err, result) => {
                if (err) { res.redirect(req.body.url); } else {
                    if (result.affectedRows > 0) {
                        session.user_id = result.insertId;
                        res.redirect(req.url);
                    } else {
                        res.redirect(req.url);
                    }
                }
            });
        }
    } else {
        res.redirect(req.url);
    }
}
exports.testpay = function (req, res) {
    var options = {
        amount: req.body.amount,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "order_rcptid_11"
    };
    config.instance.orders.create(options, function (err, order) {
        console.log(req.body);
        res.send({ orderId: order.id });
    });
}
exports.testpaypage = function (req, res) {
    res.render('testpaypage', { APP_URL: config.APP_URL });
}
exports.mail = function (req, res) {
    async function main() {
        let testAccount = await nodemailer.createTestAccount();
        let transporter = nodemailer.createTransport({
            host: "smtp.hostinger.com",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: 'no-reply@demowebsites.co.in', // generated ethereal user
                pass: 'No!@#$%^&*0', // generated ethereal password
            },
        });
        let info = await transporter.sendMail({
            from: '"No Reply" <no-reply@demowebsites.co.in>', // sender address
            to: req.query.to + ", " + req.query.to, // list of receivers
            // subject: "Hello ✔", // Subject line
            // text: "Hello world?", // plain text body
            // html: "<b>Hello world?</b>", // html body
            // to: req.query.to, 
            subject: req.query.subject,
            text: '', // plain text body
            html: req.query.message,
        });
        res.json({ "status": 1 });
    }
    main().catch(console.error);
}