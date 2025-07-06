var exports = module.exports = {}
const config = require('../config.js');
const crypto = require('crypto');
// const { console } = require('inspector');
const nodemailer = require("nodemailer");
const date = require('date-and-time');
const sendEmail = require('../helper/emailHelper');
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
                        // console.log('user' + user);
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

    config.con.query("SELECT * FROM hotels WHERE type = 'hotel'", (err, hotels) => {
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
                        // console.log('user' + JSON.stringify(user));
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
    console.log(req.params);
    let slug;

    if (req.params.resorts_slug) {
        // Handle /resorts/:resorts_slug
        slug = req.params.resorts_slug;
    } else if (req.params.hotel_slug) {
        // Handle /hotel/:hotel_slug
        slug = req.params.hotel_slug;
    } else {
        return res.status(400).send('Invalid route or missing slug.');
    } // Get the slug from the URL
    const hotelName = slug.replace(/-/g, ' ');
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
                let reurl = `${slug}`;
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
                    // console.log(roomsResult, nearbyPlacesResult, hotelResult)
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
    let userId = session.user_id;
    var bookingId = req.params.id;
    console.log(session.user_id, ':user exist');
    if (bookingId) {
        config.con.query(
            "SELECT * FROM booking WHERE booking_id = ? AND user_id = ?",
            [bookingId, userId], // Use parameterized queries to prevent SQL injection
            (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send("An error occurred while querying the database.");
                }
                var bookdetail = '';
                if (result && result.length > 0) {
                    var bookdetail = result[0];
                }
                config.con.query(
                    "SELECT * FROM user WHERE id=" + session.user_id, (err, result) => {

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

                        res.render('modify', {
                            APP_URL: config.APP_URL,
                            url: req.url,
                            user: user, // Pass user details to the template
                            bookdetail: bookdetail,
                        });
                    }
                )
            }
        );
    } else {
        return res.redirect('/');
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
const validateBooking = (rooms, adults, children, childrenAges) => {
    console.log(adults, children);
    const numRooms = parseInt(rooms, 10);
    const numAdults = parseInt(adults, 10);
    const numChildren = parseInt(children, 10);
    const totalPeople = numAdults + numChildren;

    const maxPeoplePerRoom = 4; // Maximum capacity per room
    const maxChildrenAge = 11; // Children are aged 2 to 11

    // Validate children ages
    if (numChildren > 0) {
        const invalidAges = childrenAges.some(age => age < 2 || age > maxChildrenAge);
        if (invalidAges) {
            return {
                valid: false,
                message: `Some children ages are invalid. Ages must be between 2 and ${maxChildrenAge}.`
            };
        }
    }

    // Minimum one adult per room
    if (numAdults < numRooms) {
        return {
            valid: false,
            message: "You must have at least one adult per room."
        };
    }

    // Total people capacity validation
    if (totalPeople > numRooms * maxPeoplePerRoom) {
        return {
            valid: false,
            message: "We apologize for the inconvenience. There are no rooms available to accommodate the number of guests in your request. Please consider booking multiple rooms."
        };
    }

    // If all validations pass
    return {
        valid: true,
        message: "Booking is valid."
    };
};
// check room avvilability
const checkHotelRoomAvailability = (hotel_id, check_in, check_out, requestedRooms, callback) => {
    // Step 1: Fetch all room IDs for the given hotel
    const roomsQuery = `
        SELECT room_id, available_rooms
        FROM roomavailability
        WHERE hotel_id = ?;
    `;

    config.con.query(roomsQuery, [hotel_id], (err, rooms) => {
        if (err) {
            return callback(err); // Handle error from query
        }

        if (!rooms.length) {
            return callback(null, { valid: false, reason: 'not_found' });
        }

        let totalAvailableRooms = 0;
        let roomsChecked = 0;
        let availabilityCheckPassed = true;

        // Step 2: Check availability for each room
        rooms.forEach(room => {
            const room_id = room.room_id;
            const availableRooms = room.available_rooms;

            // Fetch existing bookings for this room and date range
            const bookingsQuery = `
                SELECT SUM(booked_rooms) AS total_booked 
                FROM room_bookings 
                WHERE room_id = ? 
                AND (
                    (release_date > ? AND booking_date < ?) OR
                    (release_date = ? AND booking_date = ?)
                );
            `;

            config.con.query(bookingsQuery, [room_id, check_in, check_out, check_out, check_in], (err, bookings) => {
                if (err) {
                    return callback(err); // Handle error from query
                }

                const totalBooked = bookings[0].total_booked || 0;
                const availableRoomForThisRoom = availableRooms - totalBooked;

                totalAvailableRooms += availableRoomForThisRoom;
                roomsChecked++;

                // Step 3: Once all rooms have been checked, compare total available rooms with requested rooms
                if (roomsChecked === rooms.length) {
                    if (requestedRooms > totalAvailableRooms) {
                        return callback(null, { valid: false, availableRooms: totalAvailableRooms });
                    } else {
                        // console.log(rooms.length);
                        return callback(null, { valid: true, availableRooms: totalAvailableRooms });
                    }
                }
            });
        });
    });
};
// distribute room among the persons
function distributePersonsIntoRoomsOld(adults, children, rooms) {
    const totalPersons = adults + children;
    const personsPerRoom = Math.ceil(totalPersons / rooms);
    const distribution = Array.from({ length: rooms }, () => ({
        adults: 0,
        children: 0
    }));

    let remainingAdults = adults;
    let remainingChildren = children;

    for (let i = 0; i < rooms; i++) {
        if (remainingAdults > 0) {
            const adultsToAssign = Math.min(personsPerRoom, remainingAdults);
            distribution[i].adults = adultsToAssign;
            remainingAdults -= adultsToAssign;
        }
        if (remainingChildren > 0) {
            const childrenToAssign = Math.min(
                personsPerRoom - distribution[i].adults,
                remainingChildren
            );
            distribution[i].children = childrenToAssign;
            remainingChildren -= childrenToAssign;
        }
    }
    return distribution;
}
function distributePersonsIntoRooms(adults, children, rooms) {
    // 1. Initialize a distribution array for all requested rooms.
    const distribution = Array.from({ length: rooms }, () => ({
        adults: 0,
        children: 0,
    }));

    // Edge Case: If there are no adults, children can be distributed freely.
    if (adults === 0) {
        let remainingChildren = children;
        for (let i = 0; i < rooms && remainingChildren > 0; i++) {
            // This simple distribution is not perfect but handles the edge case.
            // A more complex logic could be used if even distribution is critical here.
            const childrenToAssign = Math.ceil(remainingChildren / (rooms - i));
            distribution[i].children = childrenToAssign;
            remainingChildren -= childrenToAssign;
        }
        return distribution;
    }

    // 2. Determine the number of rooms we can actually use. To ensure children are
    //    always with an adult, we can't use more rooms than there are adults.
    const effectiveRooms = Math.min(rooms, adults);

    // 3. Distribute adults as evenly as possible across the effective rooms.
    //    First, give each room a base number of adults.
    const baseAdultsPerRoom = Math.floor(adults / effectiveRooms);
    let remainingAdults = adults % effectiveRooms; // Adults left over

    for (let i = 0; i < effectiveRooms; i++) {
        distribution[i].adults = baseAdultsPerRoom;
        // Distribute the remaining adults one by one
        if (remainingAdults > 0) {
            distribution[i].adults++;
            remainingAdults--;
        }
    }

    // 4. Distribute all children as evenly as possible across the same effective rooms
    //    using a round-robin approach.
    let remainingChildren = children;
    let roomIndex = 0;
    while (remainingChildren > 0) {
        distribution[roomIndex].children++;
        remainingChildren--;
        // Move to the next room, wrapping around to the beginning if necessary
        roomIndex = (roomIndex + 1) % effectiveRooms;
    }

    // 5. Return the final distribution. Any rooms beyond `effectiveRooms` will be empty.
    return distribution;
}
exports.booknow = async function (req, res) {
    session = req.session;
    let user = '';
    let queryData = req.query;

    try {
        // Extract query parameters for validation
        const { rooms, adults, children, children_age, hotel_id, room_id, check_in, check_out } = req.query;
        const childrenAges = children_age ? children_age.split(',').map(Number) : [];
        // Perform validation


        // Step 1: Check room availability
        const requestedRooms = parseInt(rooms, 10);
        const checkInDate = new Date(check_in);
        const checkOutDate = new Date(check_out);
        const adultCount = parseInt(adults, 10);
        const childCount = parseInt(children, 10);
        const roomDistribution = distributePersonsIntoRooms(adultCount, childCount, requestedRooms);
        console.log(roomDistribution, 'room dis');


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
                        myreq.name || null,
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
            const hotelDetailQuery = `
                    SELECT hotels.id, hotels.name, hotels.city, hotels.full_address, hotels.main_image ,hotels.status
                    FROM hotels 
                    WHERE hotels.id = ?;
            `
            config.con.query(hotelDetailQuery, [queryData.hotel_id], (err, hotelResult) => {
                if (err) {
                    console.error('Error fetching hotel details:', err);
                    return res.status(500).send('Internal Server Error');
                }

                const hotel = hotelResult.length > 0 ? hotelResult[0] : null;

                if (!hotel) {
                    return res.status(404).send('Hotel not found');
                }
                checkHotelRoomAvailability(hotel_id, checkInDate, checkOutDate, requestedRooms, (err, result) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ message: err });
                    }

                    const { valid, availableRooms } = result;
                    console.log(result);

                    // Get hotel and room details

                    const hotelRoomsQuery = `
                    SELECT hotel_rooms.*, 
                        roomavailability.bed_type, 
                        roomavailability.available_rooms, 
                        room_types.room_name
                    FROM roomavailability
                    INNER JOIN hotel_rooms ON hotel_rooms.id = roomavailability.room_id
                    INNER JOIN room_types ON room_types.id = hotel_rooms.room_type_id
                    WHERE hotel_rooms.hotel_id = ? AND roomavailability.available_rooms > 0;
                    `;

                    const mealPlansQuery = `
                    SELECT 
                        mp.plan_name, 
                        mp.description,
                        mpp.room_id,
                        mpp.base_price,
                        mpp.plan_id
                    FROM 
                        meal_plans mp
                    JOIN 
                        pricing mpp ON mpp.plan_id = mp.id
                    WHERE 
                        mpp.room_id = ?  
                        AND mpp.num_persons = 1 ORDER BY 
                        mpp.plan_id;
                    `;

                    config.con.query(hotelRoomsQuery, [req.query.hotel_id], (err, result) => {
                        if (err) {
                            console.error('Error fetching hotel data:', err);
                            return res.status(500).send('Internal Server Error');
                        }

                        const hotelRooms = result;
                        console.log(hotel);
                        const hotelName = (hotel.name || 'unknown-hotel').toLowerCase()
                            .replace(/\s+/g, '-')
                            .replace(/[^a-z0-9-]/g, '');
                        const hotelURL = `${config.APP_URL}hotels/${hotelName}`;
                        const validationResult = validateBooking(rooms, adults, children, childrenAges);

                        const paramsToRender = {
                            APP_URL: config.APP_URL,
                            url: req.url,
                            user, // Make sure 'user' is always available, otherwise set to null or default
                            date, // Same for date
                            queryData: req.query,
                            hotel: hotel || null, // If hotel is undefined, pass null
                            hotelRooms: hotelRooms || [], // Default to an empty array if hotelRooms is undefined
                            hotelURL: hotelURL || "", // Default to an empty string
                            discount: 0, // Default to 0
                            crypto: crypto || {}, // Default to an empty object
                            diffDays: 0, // Default to 0
                            hotelName: hotelName || "", // Default to an empty string
                            mealPlans: [], // Default to an empty array
                            errorMessage: validationResult.message, // Pass the validation message here
                            roomDistribution
                        };
                        if (!valid) {
                            return res.render('pages/booking', {
                                ...paramsToRender,
                                errorMessage: `Not enough rooms available. Only ${availableRooms} room(s) available for the selected dates.`,
                            });
                        }
                        if (!validationResult.valid) {
                            return res.render('pages/booking', paramsToRender);
                        }
                        // res.send({ queryData: req.query});
                        // Loop through each room and fetch its respective meal plans
                        hotelRooms.forEach(room => {
                            // Fetch meal plans for each room individually
                            config.con.query(mealPlansQuery, [room.id], (err, mealPlans) => {
                                if (err) {
                                    console.error('Error fetching meal plans:', err);
                                    return res.status(500).send('Internal Server Error');
                                }

                                // Associate meal plans with the current room
                                room.mealPlans = mealPlans;
                                // console.log(room);
                                // Once all meal plans are added to rooms, we proceed with further processing
                                if (hotelRooms.every(r => r.mealPlans)) {  // Check if all rooms have meal plans
                                    // Fetch active discount
                                    config.con.query("SELECT discount_percentage FROM discounts WHERE is_active = 1 LIMIT 1", (discountErr, discountResult) => {
                                        if (discountErr) {
                                            console.error('Error fetching discount:', discountErr);
                                            return res.status(500).send('Internal Server Error');
                                        }

                                        const discount = discountResult.length > 0 ? discountResult[0].discount_percentage : 0;

                                        // Calculate discounted price for each room
                                        // hotelRooms.forEach(room => {
                                        //     room.original_price = room.price; // Assuming price is the original price from DB
                                        //     room.discounted_price = room.price - (room.price * (discount / 100));
                                        // });

                                        const date1 = new Date(req.query.check_in);
                                        const date2 = new Date(req.query.check_out);
                                        const diffTime = Math.abs(date2 - date1);
                                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                        let user = {};
                                        if (session.user_id !== undefined) {
                                            config.con.query("SELECT * FROM user WHERE id=" + session.user_id, (userErr, userResult) => {
                                                if (userErr) {
                                                    console.error('Error fetching user:', userErr);
                                                    return res.status(500).send('Internal Server Error');
                                                }
                                                if (userResult.length > 0) {
                                                    user = userResult[0];
                                                } else {
                                                    return res.redirect('/logout');
                                                }
                                                
                                                // Render the page with data
                                                res.render('pages/booking', {
                                                    APP_URL: config.APP_URL,
                                                    url: req.url,
                                                    user,
                                                    date,
                                                    queryData: req.query,
                                                    hotel,
                                                    hotelRooms,
                                                    hotelURL,
                                                    discount,
                                                    crypto,
                                                    diffDays,
                                                    hotelName,
                                                    mealPlans,
                                                    errorMessage: null,
                                                    roomDistribution
                                                });
                                            });
                                        } else {
                                            // Render the page with data (no user)
                                            res.render('pages/booking', {
                                                APP_URL: config.APP_URL,
                                                url: req.url,
                                                user,
                                                date,
                                                queryData: req.query,
                                                hotel,
                                                hotelRooms,
                                                hotelURL,
                                                discount,
                                                crypto,
                                                diffDays,
                                                hotelName,
                                                mealPlans,
                                                errorMessage: null,
                                                roomDistribution
                                            });
                                        }
                                    });
                                }
                            });
                        });
                    });

                });
            })
        }
    } catch (error) {
        console.error('Unexpected Error:', error);
        res.status(500).send('Something went wrong');
    }
};

exports.checkAvailability = function(req,res){
    const { rooms, adults, children, children_age, hotel_id, room_id, check_in, check_out } = req.query;
    const requestedRooms = parseInt(rooms, 10);
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const adultCount = parseInt(adults, 10);
    const childCount = parseInt(children, 10);
    checkHotelRoomAvailability(hotel_id, checkInDate, checkOutDate, requestedRooms, (err, result) => {
        if (err) { 
            console.log(err);
            return res.status(500).json({ message: "Server error" });
        }

        if (result.reason === 'not_found') {
            return res.status(400).json({ message: "Hotel rooms not found" });
        }

        if (!result.valid) {
            return res.status(400).json({ message: `Not enough rooms available. Only ${result.availableRooms} room(s) available.` });
        }

        return res.status(200).json({ message: "Rooms are available", availableRooms: result.availableRooms });
    })
}
exports.createBooking = function (req, res) {
    const { user_id, hotel_id, total_price, rooms } = req.body;
    // Insert booking details into the Booking table
    const bookingQuery = `
    INSERT INTO booking (user_id, hotel_id, total_price)
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
        INSERT INTO booking_room_detail (booking_id, room_id, bed_type, check_in, check_out, adults,children, created_at, updated_at)
        VALUES ?
        `;

        const roomValues = rooms.map(room => [
            bookingId,
            room.room_id,
            room.bed_type,
            // Convert array to string if necessary
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
// old function
exports.getRoomDetailsByIdd = (req, res) => {
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
// new function
exports.getRoomDetailsById = (req, res) => {
    const roomId = req.query.room_id;
    const mealPlanId = req.query.meal_id;
    let adultsCount = parseInt(req.query.adult, 10);
    let childrenCount = parseInt(req.query.child, 10);
    const totalPersons = adultsCount + childrenCount;
    const nights = req.query.nights;
    // Queries
    const roomQuery = `
        SELECT 
            hotel_rooms.*, 
            room_types.room_name,
            pricing.num_persons,
            pricing.base_price,
            pricing.tax_percentage,
            discounts.discount_percentage
        FROM hotel_rooms
        INNER JOIN room_types ON hotel_rooms.room_type_id = room_types.id
        INNER JOIN pricing ON hotel_rooms.id = pricing.room_id AND pricing.plan_id = ?
        LEFT JOIN discounts ON discounts.is_active = 1
        WHERE hotel_rooms.id = ?;
    `;

    const extraPricingQuery = `
        SELECT age_group, extra_person_price
        FROM extra_person_pricing
        WHERE room_id = ? AND plan_id = ?
    `;

    config.con.query(roomQuery, [mealPlanId, roomId], (err, roomDetails) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }

        if (roomDetails.length === 0) {
            return res.status(404).json({ success: false, message: 'Room not found.' });
        }

        // Find the row with the maximum number of persons less than or equal to totalPersons
        let baseRow = roomDetails.find(row => row.num_persons === Math.min(totalPersons, 2));

        if (!baseRow) {
            return res.status(404).json({ success: false, message: 'No valid pricing found for the specified persons.' });
        }

        const basePrice = baseRow.base_price;
        const discountPercentage = baseRow.discount_percentage || 0;

        // If totalPersons <= 2, calculate and return base price
        // need to make it dynamic it can not be 2 always some raw can be contain more than 2 persons
        // For example, if baseRow.num_persons = 3, then we need to check for 3 persons
        // and if totalPersons <= 3, we can use the baseRow for calculation
        if (totalPersons <= 2) {
            const finalPrice = calculateBasePrice(adultsCount, childrenCount, baseRow, discountPercentage, nights);
            return res.json({ success: true, data: finalPrice });
        }

        // Fetch extra person pricing for persons beyond the base (e.g., 3rd person onward)
        config.con.query(extraPricingQuery, [roomId, mealPlanId], (err, extraPricing) => {
            if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }

            // Calculate price for extra persons
            const extraPersons = totalPersons - 2;
            let extraAdultPrice = 0;
            let extraChildPrice = 0;

            extraPricing.forEach(row => {
                if (row.age_group === 'Adult' && adultsCount > 2) {
                    extraAdultPrice += row.extra_person_price * (adultsCount - 2);
                }
                if (row.age_group === 'Child' && childrenCount > 0) {
                    extraChildPrice += row.extra_person_price * childrenCount;
                }
            });

            // Calculate final price including extras and discounts
            const discountedPrice = basePrice * (1 - discountPercentage / 100);
            const totalExtraPrice = extraAdultPrice + extraChildPrice;
            const totalPriceBeforeGST = nights * (discountedPrice + totalExtraPrice);
            const gstRate = totalPriceBeforeGST >= 7500 ? 18 : 12;
            const gstAmount = (totalPriceBeforeGST * gstRate) / 100;
            const totalPriceWithGST = totalPriceBeforeGST + gstAmount;

            const sgst = gstAmount / 2;
            const cgst = gstAmount / 2;

            // Prepare response
            const finalPrice = {
                room_name: baseRow.room_name,
                id: baseRow.id,
                adultsCount: adultsCount,
                childrenCount: childrenCount,
                base_price: basePrice,
                nights: nights,
                discounted_price: discountedPrice,
                extra_adult_price: extraAdultPrice,
                extra_child_price: extraChildPrice,
                total_extra_price: totalExtraPrice,
                sgst: sgst,
                cgst: cgst,
                gst_amount: gstAmount,
                amount: totalPriceBeforeGST,
                total_price: totalPriceWithGST
            };

            res.json({ success: true, data: finalPrice });
        });
    });

};

// helper function to calulate price
function calculateBasePrice(adultsCount, childrenCount, baseRow, discountPercentage, nights) {
    const basePrice = baseRow.base_price * nights;

    // Apply discount to the base price
    const discountedPrice = basePrice * (1 - discountPercentage / 100);

    // Calculate GST
    const gstRate = basePrice >= 7500 ? 18 : 12;  // GST rate in percentage
    const gstAmount = (discountedPrice * gstRate) / 100;
    const sgst = gstAmount / 2;
    const cgst = gstAmount / 2;

    // Total price including GST
    const totalPriceWithGST = discountedPrice + gstAmount;

    // Return all necessary details
    return {
        room_name: baseRow.room_name,
        id: baseRow.id,
        adultsCount: adultsCount,
        childrenCount: childrenCount,
        base_price: basePrice,
        nights: nights,
        discounted_price: discountedPrice,
        extra_adult_price: 0, // No extra charges for <=2 persons
        extra_child_price: 0, // No extra charges for <=2 persons
        total_extra_price: 0, // No extra charges for <=2 persons
        sgst: sgst,
        cgst: cgst,
        gst_amount: gstAmount,
        amount: discountedPrice,
        total_price: totalPriceWithGST
    };
}








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
            b.booking_id,
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
            brd.adults,
            brd.children,
            rt.room_name
        FROM 
            booking b
        JOIN 
            booking_room_detail brd ON b.booking_id = brd.booking_id
        JOIN
            hotel_rooms hr on brd.room_id = hr.id
        JOIN
            room_types rt on hr.room_type_id = rt.id 
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
            rooms: results.map(row => {
                // Calculate the difference between check_in and check_out
                const checkInDate = new Date(row.check_in);
                const checkOutDate = new Date(row.check_out);

                // Calculate nights (if check_in and check_out are the same, nights = 1)
                let nights = 1;
                if (checkInDate && checkOutDate) {
                    const timeDifference = checkOutDate - checkInDate;
                    nights = Math.ceil(timeDifference / (1000 * 3600 * 24));
                }

                return {
                    room_id: row.room_id,
                    room_name: row.room_name,
                    bed_type: row.bed_type,
                    food_preferences: row.food_preferences ? row.food_preferences.split(',') : [],
                    check_in: row.check_in,
                    check_out: row.check_out,
                    adults: row.adults,children: row.children || 0,
                    nights: nights
                };
            })
        };

        res.status(200).json({
            success: true,
            booking: bookingDetail
        });
    });
};
exports.confirmBooking = function (req, res) {
    const bookingId = req.params.id;
    const { name, email, mobile, country, address, city, additional } = req.body;
    const session = req.session;
    const userId = session.user_id
    // Validate required fields
    if (!name || !email || !mobile || !country || !address || !city) {
        return res.status(400).json({ success: false, message: "Missing required booking details." });
    }

    // Update basic details in the Booking table
    const query = `
    UPDATE booking 
    SET name = ?, email = ?, mobile = ?, country = ?, address = ?, city = ?,additional=?,user_id = ?, updated_at = NOW() 
    WHERE booking_id = ?
    `;

    config.con.query(query, [name, email, mobile, country, address, city, additional, userId, bookingId], (error, result) => {
        if (error) {
            console.error("Error updating booking:", error);
            return res.status(500).json({ success: false, message: "Failed to update booking." });
        }
        console.log(userId, result)

        // Check if any row was updated
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Booking not found." });
        }

        // Success response
        res.status(200).json({ success: true, message: "Booking updated successfully." });
    });
};

// function
exports.meet_and_events = function (req, res) {
    session = req.session;
    // console.log(req.body);
    if (req.body.date !== undefined) {
        config.con.query(
            "INSERT INTO `meeet_and_event`(`booking_date`, `booking_time`, `no_of_guest`, `name`, `email`, `phone`, `comment`) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                req.body.date,
                '00:00:04',
                // req.body.booking_time,
                req.body.guest,
                req.body.name,
                req.body.email,
                req.body.mobile,
                req.body.message,
            ],
            async (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Server error');
                }
                const subject = 'This is test mail for New Reservation Request';
                const text = `${req.body.name} requested a reservation on ${req.body.date} for ${req.body.guest} guest(s).
                Contact Number: ${req.body.mobile}
                Email: ${req.body.email}
                Comment: ${req.body.message || 'No additional comments.'}`;

                // Send email to gutamh142@gmail.com
                const emailSent = await sendEmail('gutamh142@gmail.com', subject, text);
                if (!emailSent) console.error('Failed to send reservation email.');
                // Redirect back to the referring page
                const referer = req.get('Referer') || `${config.APP_URL}/meet-and-events`;
                // console.log(req.get('Referer'));

                res.redirect(referer);
            }
        );
    }
    else {
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
    let queryData = req.query;
    console.log(JSON.stringify(req.url).split('/')[1]);
    config.con.query("SELECT * FROM hotels WHERE type = 'Resort'", (err, hotels) => {
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
                res.render('pages/hotels', { APP_URL: config.APP_URL, hotels: hotels, url: req.url, user: user });
            });
        } else {
            res.render('pages/hotels', { APP_URL: config.APP_URL, hotels: hotels, url: req.url, user: user, queryData });
            // res.render('resorts', { APP_URL: config.APP_URL, hotels: hotels, url: req.url, user: user });
        }
    });
}
// Luxary Residency
exports.private_luxuary_residency = function (req, res) {
    session = req.session;
    config.con.query("SELECT * FROM hotels WHERE type = 'plr'", (err, hotels) => {
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
    config.con.query("SELECT * FROM hotels WHERE type = 'sa'", (err, hotels) => {
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
    const redirectPage = req.body.redirectTo || 'contact';
    console.log(req.body);
    if (req.method === 'POST') {
        if (req.body.name) {

            const sqlQuery = "INSERT INTO `contact`(`name`, `mobile`, `email`, `message`) VALUES (?, ?, ?, ?)";
            const values = [req.body.name, req.body.mobile, req.body.email, req.body.message];

            config.con.query(sqlQuery, values, async (err, result) => {
                if (err) {
                    console.log(err);
                    return res.json({ success: false, error: 'There was an error saving your message.' });
                }
                try {
                    const subject = 'New Query Received from a User';
                    const text = `
                Hello,

                A user has submitted a new query through the contact form. Below are the details:

                Name: ${req.body.name}
                Mobile: ${req.body.mobile}
                Email: ${req.body.email}
                Message: ${req.body.message || 'No message provided'}

                Thank you,
                Your Website Team
                `;

                    // Send email to owner
                    const emailSent = await sendEmail('gutamh142@gmail.com', subject, text);

                    if (!emailSent) {
                        console.error('Failed to send reservation email.');
                    }

                    return res.json({ success: true, message: 'Your message has been sent successfully!' });
                } catch (error) {
                    console.error(error);
                    return res.status(500).send('Error sending email');
                }

            });
        }else{
            return res.json({ success: false, error: 'Name is required.' });
        }
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
                        if (typeof req.body.url === 'string') {
                            req.body.url = req.body.url.split(','); // Split by comma if it's a string
                        }
                        if (req.body.url && req.body.url.length > 0) {
                            const targetUrl = req.body.url[1];  // Redirect to the second URL
                            res.redirect(targetUrl);
                            console.log(req.body.url[0]);  // Log the first URL if needed
                        }
                        console.log(req.body.url);
                    } else {
                        console.log(req.body.url);
                        res.redirect(req.body.url);

                    }
                }
            });
        }
    } else {
        console.log(req.body.url);
        res.redirect(req.body.url);
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
// normal links 
exports.aboutus = function (req, res) {
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
            res.render('aboutus', { APP_URL: config.APP_URL, url: req.url, user: user });
        });
    } else {
        res.render('aboutus', { APP_URL: config.APP_URL, url: req.url, user: user });
    }
}
exports.leadership = function (req, res) {
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
            res.render('leadership', { APP_URL: config.APP_URL, url: req.url, user: user });
        });
    } else {
        res.render('leadership', { APP_URL: config.APP_URL, url: req.url, user: user });
    }
}
exports.career = function (req, res) {
    session = req.session;
    let user = '';
    if (req.body.name !== undefined) {
        let cv = [];
        req.files.forEach((uploads) => {
            if (uploads.fieldname === 'cv') {
                // const filePath = path.join(__dirname, 'public', 'uploads', upload.filename);
                cv.push(uploads.filename);
            }
        });
    
        const query = `
            INSERT INTO career 
            (name, mobile, email, current_position, language, skill, current_salary, apply_for, expected_salary, cv, message) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            req.body.name,
            `${req.body.cc}${req.body.mobile}`,
            req.body.email,
            req.body.current_position,
            req.body.language,
            req.body.skill,
            req.body.current_salary,
            req.body.apply_for,
            req.body.expected_salary,
            cv.join(','), // Join CV filenames into a single string
            req.body.message
        ];
    
        config.con.query(query, values, async (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send('Error saving career application.');
                return;
            }
    
            // Redirect to thank you page
            res.redirect('thankyou/We are in receipt of your application. One of our HR representatives will connect with you within 15 days if your profile is shortlisted. For more job updates kindly follow us on our social media job portals.');
    
            // Prepare email content
            const subject = 'Career Application Received';
            const text = `
                Dear ${req.body.name},
                Thank you for applying for the position of ${req.body.apply_for}. We have received your application with the following details:
                
                Name: ${req.body.name}
                Mobile: ${req.body.cc}${req.body.mobile}
                Email: ${req.body.email}
                Current Position: ${req.body.current_position}
                Language(s): ${req.body.language}
                Skill(s): ${req.body.skill}
                Current Salary: ${req.body.current_salary}
                Expected Salary: ${req.body.expected_salary}
                Additional Message: ${req.body.message || 'No additional comments.'}
                
                Our HR team will review your application, and if shortlisted, we will get in touch with you within 15 days.
    
                Best regards,
                HR Team
            `;
    
            // Send confirmation email to the applicant
            const emailSent = await sendEmail(req.body.email, subject, text);
            if (!emailSent) {
                console.error('Failed to send confirmation email to the applicant.');
            }
    
            // Optionally, send notification email to HR
            const hrEmail = 'gutamh142@gmail.com';
            const hrSubject = `New Career Application Received for ${req.body.name}`;
            const cvLinks = cv.map(filePath => `${config.APP_URL}uploads/${filePath}`).join('<br>');
            const hrText = `
                A new career application has been submitted with the following details:
                
                Name: ${req.body.name}
                Mobile: ${req.body.cc}${req.body.mobile}
                Email: ${req.body.email}
                Current Position: ${req.body.current_position}
                Language(s): ${req.body.language}
                Skill(s): ${req.body.skill}
                Current Salary: ${req.body.current_salary}
                Expected Salary: ${req.body.expected_salary}
                CVs:${cvLinks},
                Additional Message: ${req.body.message || 'No additional comments.'}
            `;
            const hrEmailSent = await sendEmail(hrEmail, hrSubject, hrText);
            if (!hrEmailSent) {
                console.error('Failed to send notification email to HR.');
            }
        });
    }
     else {
        if (session.user_id !== undefined) {
            config.con.query("SELECT * FROM user WHERE id=" + session.user_id, (err, result) => {
                if (err) { res.redirect('/logout'); } else {
                    if (result.length > 0) {
                        user = result[0];
                    } else {
                        res.redirect('/logout');
                    }
                }
                res.render('career', { APP_URL: config.APP_URL, url: req.url, user: user });
            });
        } else {
            res.render('career', { APP_URL: config.APP_URL, url: req.url, user: user });
        }
    }
}
exports.media_centre = function (req, res) {
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
            res.render('media_centre', { APP_URL: config.APP_URL, url: req.url, user: user });
        });
    } else {
        res.render('media_centre', { APP_URL: config.APP_URL, url: req.url, user: user });
    }
}
exports.terms_conditions = function (req, res) {
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
            res.render('terms_conditions', { APP_URL: config.APP_URL, url: req.url, user: user });
        });
    } else {
        res.render('privacy_policy', { APP_URL: config.APP_URL, url: req.url, user: user });
    }
}
exports.cancellation_policy = function (req, res) {
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
            res.render('cancellation_policy', { APP_URL: config.APP_URL, url: req.url, user: user });
        });
    } else {
        res.render('cancellation_policy', { APP_URL: config.APP_URL, url: req.url, user: user });
    }
}
exports.plant_tree = function (req, res) {
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
            res.render('plant_tree', { APP_URL: config.APP_URL, url: req.url, user: user });
        });
    } else {
        res.render('plant_tree', { APP_URL: config.APP_URL, url: req.url, user: user });
    }
}
exports.privacy_policy = function (req, res) {
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
            res.render('privacy_policy', { APP_URL: config.APP_URL, url: req.url, user: user });
        });
    } else {
        res.render('privacy_policy', { APP_URL: config.APP_URL, url: req.url, user: user });
    }
}
exports.loyalty_program = function (req, res) {
    session = req.session;
    // console.log(req.body);
    if (session.user_id !== undefined) {
        config.con.query("SELECT * FROM user WHERE id=" + session.user_id, (err, result) => {
            if (err) { res.redirect('/logout'); } else {
                if (result.length > 0) {
                    user = result[0];
                } else {
                    res.redirect('/logout');
                }
            }
            res.render('loyalty_program', { APP_URL: config.APP_URL, url: req.url, user: user });
        });
    } else {
        let user = '';
        res.render('loyalty_program', { APP_URL: config.APP_URL, url: req.url, user: user });
    }
}
exports.loyalty_program_buy = function (req, res) {
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
                res.render('loyalty_program_buy', { APP_URL: config.APP_URL, hotels: hotels, url: req.url, user: user, id: req.params.id });
            });
        } else {
            res.render('loyalty_program_buy', { APP_URL: config.APP_URL, hotels: hotels, url: req.url, user: user, id: req.params.id });
        }
    });
}
exports.loyalty_program_view = function (req, res) {
    session = req.session;
    if (req.params.id == 1) {
        var amount = 20000;
    } else if (req.params.id == 2) {
        var amount = 8000;
    }
    var things = ['A', 'E', 'B', 'F', 'C', 'G', 'D', 'H', 'T', 'Z'];
    var one = things[Math.floor(Math.random() * things.length)];
    var tow = things[Math.floor(Math.random() * things.length)];
    var three = things[Math.floor(Math.random() * things.length)];
    var four = things[Math.floor(Math.random() * things.length)];
    var five = things[Math.floor(Math.random() * things.length)];
    var coupon = one + tow + three + four + five + Date.now();
    const date = require('date-and-time');
    const now = new Date();
    var date_of_purchase = date.format(now, 'YYYY/MM/DD HH:mm:ss');
    var photo_id_card;
    photo_id_card = [];
    req.files.forEach(uploads => {
        if (uploads.fieldname == 'photo_id_card') {
            photo_id_card.push(uploads.filename);
        }
    });
    config.con.query("INSERT INTO `loyalty_program`(`name`, `mobile`, `email`, `date_of_purchase`, `occupation`, `no_of_person_in_family`, `photo_id_card`, `hotel_id`, `full_communication_address`, `coupon_no`, `member_type`) VALUES ('" + req.body.name + "','" + req.body.mobile + "','" + req.body.email + "','" + date_of_purchase + "','" + req.body.occupation + "','" + req.body.no_of_person_in_family + "','" + photo_id_card + "','" + req.body.hotel_id + "','" + req.body.full_communication_address + "','" + coupon + "','" + req.params.id + "')", (err, result) => {
        config.con.query("SELECT * FROM loyalty_program WHERE id=" + result.insertId, (err, resulta) => {
            if (err) { res.redirect('/loyalty-program'); } else {
                if (resulta.length > 0) {
                    coupondata = resulta[0];
                } else {
                    res.redirect('/loyalty-program');
                }
            }
            res.render('loyalty_program_view', { APP_URL: config.APP_URL, url: req.url, coupondata: coupondata });
        });
    });
}
exports.membership = function (req, res) {
    session = req.session;
    // console.log(req.body);
    if (session.user_id !== undefined) {
        config.con.query("SELECT * FROM user WHERE id=" + session.user_id, (err, result) => {
            if (err) { res.redirect('/logout'); } else {
                if (result.length > 0) {
                    user = result[0];
                } else {
                    res.redirect('/logout');
                }
            }
            res.render('pages/membership', { APP_URL: config.APP_URL, url: req.url, user: user });
        });
    } else {
        let user = '';
        res.render('pages/membership', { APP_URL: config.APP_URL, url: req.url, user: user });
    }
}
exports.covidupdate = function (req, res) {
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
            res.render('covidupdate', { APP_URL: config.APP_URL, url: req.url, user: user });
        });
    } else {
        res.render('covidupdate', { APP_URL: config.APP_URL, url: req.url, user: user });
    }
}
exports.best_rate_guaranteed = function (req, res) {
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
            res.render('best_rate_guaranteed', { APP_URL: config.APP_URL, url: req.url, user: user });
        });
    } else {
        res.render('best_rate_guaranteed', { APP_URL: config.APP_URL, url: req.url, user: user });
    }
}
exports.flexible_cancellation = function (req, res) {
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
            res.render('flexible_cancellation', { APP_URL: config.APP_URL, url: req.url, user: user });
        });
    } else {
        res.render('flexible_cancellation', { APP_URL: config.APP_URL, url: req.url, user: user });
    }
}
exports.ecocommitment_go_green = function (req, res) {
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
            res.render('ecocommitment_go_green', { APP_URL: config.APP_URL, url: req.url, user: user });
        });
    } else {
        res.render('ecocommitment_go_green', { APP_URL: config.APP_URL, url: req.url, user: user });
    }
}
exports.food_delivery = function (req, res) {
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
            res.render('pages/foodDelivery', { APP_URL: config.APP_URL, url: req.url, user: user });
        });
    } else {
        res.render('pages/foodDelivery', { APP_URL: config.APP_URL, url: req.url, user: user });
    }
}
exports.partner_with_as = function (req, res) {
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
            res.render('partner_with_as', { APP_URL: config.APP_URL, url: req.url, user: user });
        });
    } else {
        res.render('partner_with_as', { APP_URL: config.APP_URL, url: req.url, user: user });
    }
}

// show all bookings
exports.showAllUserBookings = async (req, res) => {
    // 1. Get the user ID from the session.
    const { session } = req;
    const userId = session.user_id;

    // 2. If no user is logged in, redirect them to the login page.
    if (!userId) {
        console.log('No user ID in session, redirecting to login.');
        return res.redirect('/login'); // Or '/' or wherever your login page is
    }

    // Helper function to promisify the database query
    const queryDB = (sql, params) => {
        return new Promise((resolve, reject) => {
            config.con.query(sql, params, (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    };

    try {
        // 3. Define the SQL queries using parameterized placeholders (?)
        const bookingsQuery = "SELECT * FROM booking WHERE user_id = ?";
        const userQuery = "SELECT * FROM user WHERE id = ?";

        // 4. Execute both queries in parallel for efficiency.
        const [bookings, userResult] = await Promise.all([
            queryDB(bookingsQuery, [userId]), // Fetches all bookings for the user
            queryDB(userQuery, [userId])      // Fetches user details
        ]);

        // 5. Check if the user exists. If not, the session might be invalid.
        if (!userResult || userResult.length === 0) {
            console.log(`User with ID ${userId} not found in database.`);
            return res.redirect('/logout'); // Log out to clear the invalid session
        }

        const user = userResult[0];
const highlightId = req.query.highlight;
        // 6. Render a view and pass the user details and the array of bookings.
        // You will need a view file (e.g., 'userBookings.ejs') to display the list.
        console.log(user,bookings);
        res.render('pages/userBookings', {
            APP_URL: config.APP_URL,
            url: req.url,
            user: user,
            bookings: bookings, // This is now an array of all booking objects
            highlightId: highlightId
        });

    } catch (err) {
        // 7. Handle any database or server errors.
        console.error("Error fetching user bookings:", err);
        res.status(500).send("An error occurred while retrieving your bookings.");
    }
};