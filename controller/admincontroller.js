var exports = module.exports = {};
const config = require('../config.js');

exports.index = function (req, res) {
    const session = req.session; // Explicit session initialization
    if (session.admin_id !== undefined) {
        res.render('super_admin/index', { APP_URL: config.APP_URL });
    } else {
        res.redirect('/admin/login');
    }
};

exports.login = function (req, res) {
    const session = req.session; // Explicit session initialization
    if (!session.admin_id) {
        if (req.body.email && req.body.password) {
            config.con.query(
                "SELECT * FROM admin WHERE email = ? AND password = ?",
                [req.body.email, req.body.password],
                (err, result) => {
                    if (err) {
                        console.error('Database error:', err);
                        res.redirect('/admin/login');
                    } else {
                        if (result.length > 0) {
                            session.admin_id = result[0].id;
                            res.redirect('/admin');
                        } else {
                            res.redirect('/admin/login');
                        }
                    }
                }
            );
        } else {
            res.render('super_admin/login', { APP_URL: config.APP_URL });
        }
    } else {
        res.redirect('/admin');
    }
};

exports.add_hotel = function (req, res) {
    session = req.session;
    if (session.admin_id !== undefined) {
        if (req.body.hotel_name !== undefined) {
            var hotel_images, hotel_background_video;
            hotel_images = [];
            hotel_background_video = [];
            req.files.forEach(uploads => {
                if (uploads.fieldname == 'hotel_image') {
                    hotel_images.push(uploads.filename);
                }
                if (uploads.fieldname == 'hotel_background_video') {
                    hotel_background_video.push(uploads.filename);
                }
            });
            config.con.query("INSERT INTO `hotel`(`hotel_name`, `hotel_images`, `hotel_background_video`, `description`, `rooms`, `location`, `facilities`, `city`, `country`, `cancellation_fee`, `stars`, `stay`, `fb`, `insta`, `twitter`) VALUES ('" + req.body.hotel_name + "','" + hotel_images + "','" + hotel_background_video + "','" + req.body.description + "','" + req.body.rooms + "','" + req.body.location + "','" + req.body.facilities + "', '" + req.body.city + "',  '" + req.body.country + "',  '" + req.body.cancellation_fee + "',  '" + req.body.stars + "', '" + req.body.stay + "',   '" + req.body.fb + "',   '" + req.body.insta + "',   '" + req.body.twitter + "')", (err, result) => {
                if (err) console.log(err);
                res.redirect('/admin/add_hotel');
            });
        } else {
            res.render('super_admin/add_hotel', { APP_URL: config.APP_URL });
        }
    } else {
        res.redirect('/admin/login');
    }
}
exports.add_rooms = function (req, res) {
    const session = req.session;

    if (!session.admin_id) {
        return res.redirect('/admin/login');
    }

    if (req.method === "POST") {
        const uploadedFiles = req.files;

        // Access form fields via req.body
        const hotel_id = req.body.hotel_id;
        const room_type_id = req.body.room_type_id;
        const room_size = req.body.room_size;
        const accommodation = req.body.accommodation;
        const description = req.body.description;
        const price = req.body.price;

        // Handle the uploaded images
        const main_image = uploadedFiles.find(file => file.fieldname === 'main_image');
        const images = uploadedFiles.filter(file => file.fieldname === 'images');

        // Ensure file paths use forward slashes
        const main_image_path = main_image ? main_image.path.replace(/\\/g, '/').replace(/^public\//,'') : null;
        const images_paths = images.map(file => file.path.replace(/\\/g, '/').replace(/^public\//,''));

        // Prepare the SQL query for inserting the data into the database
        const roomData = {
            hotel_id: hotel_id,
            main_image: main_image_path, // Save the formatted main image path
            images: JSON.stringify(images_paths), // Save the formatted images paths as JSON (for multiple images)
            room_type_id: room_type_id,
            room_size: room_size,
            accommodation: accommodation,
            description: description,
            price: price
        };

        // Assuming you're using a MySQL connection, here’s how you insert the room data
        const query = `INSERT INTO hotel_rooms (hotel_id, main_image, images, room_type_id, room_size, accommodation, description, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        config.con.query(query, [
            roomData.hotel_id,
            roomData.main_image,
            roomData.images,
            roomData.room_type_id,
            roomData.room_size,
            roomData.accommodation,
            roomData.description,
            roomData.price
        ], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error saving room data.");
            }
            res.redirect('/admin/add_rooms'); // Redirect after saving
        });
    } else {
        config.con.query("SELECT * FROM hotels", (err, result) => {
            res.render('super_admin/add_rooms', { APP_URL: config.APP_URL, hotels: result });
        });
    }
};



// exports.edit_hotel = function (req, res) {
//     session = req.session;
//     if (session.admin_id !== undefined) {
//         res.render('super_admin/edit_hotel', { APP_URL: config.APP_URL });
//     } else {
//         res.redirect('/admin/login');
//     }
// }
// exports.manage_hotels = function (req, res) {
//     session = req.session;
//     if (session.admin_id !== undefined) {
//         config.con.query("SELECT * FROM hotel", function (err, result) {
//             if (err) throw err;
//             res.render('super_admin/manage_hotels', { APP_URL: config.APP_URL, hotels: result });
//         });
//     } else {
//         res.redirect('/admin/login');
//     }
// }
// exports.add_rooms = function (req, res) {
//     session = req.session;
//     if (session.admin_id !== undefined) {
//         if (req.body.hotel_id !== undefined) {
//             var room_images, washroom_images, balcony_images, overview_images, background_image;
//             room_images = [];
//             washroom_images = [];
//             balcony_images = [];
//             overview_images = [];
//             background_image = [];
//             req.files.forEach(uploads => {
//                 if (uploads.fieldname == 'room_images') {
//                     room_images.push(uploads.filename);
//                 }
//                 if (uploads.fieldname == 'washroom_images') {
//                     washroom_images.push(uploads.filename);
//                 }
//                 if (uploads.fieldname == 'balcony_images') {
//                     balcony_images.push(uploads.filename);
//                 }
//                 if (uploads.fieldname == 'overview_images') {
//                     overview_images.push(uploads.filename);
//                 }
//                 if (uploads.fieldname == 'background_image') {
//                     background_image.push(uploads.filename);
//                 }
//             });
//             config.con.query("INSERT INTO `hotel_room`(`hotel_id`, `room_name`, `room_images`, `washroom_images`, `balcony_images`, `overview_images`, `background_image`, `room_type`, `beds`, `room_size`, `room_facilities`, `description`) VALUES ('" + req.body.hotel_id + "','" + req.body.room_name + "','" + room_images + "','" + washroom_images + "','" + balcony_images + "','" + overview_images + "','" + background_image + "','" + req.body.room_type + "','" + req.body.beds + "','" + req.body.room_size + "','" + req.body.room_facilities + "','" + req.body.description + "')", (err, result) => {
//                 if (err) console.log(err);
//                 res.redirect('/admin/add_rooms');
//             });
//         } else {
//             config.con.query("SELECT * FROM hotel", (err, result) => {
//                 res.render('super_admin/add_rooms', { APP_URL: config.APP_URL, hotels: result });
//             });
//         }
//     } else {
//         res.redirect('/admin/login');
//     }
// }
// exports.manage_rooms = function (req, res) {
//     session = req.session;
//     if (session.admin_id !== undefined) {
//         config.con.query("SELECT * FROM hotel_room WHERE hotel_id=" + req.params.id, function (err, result) {
//             if (err) throw err;
//             res.render('super_admin/manage_rooms', { APP_URL: config.APP_URL, rooms: result });
//         });
//     } else {
//         res.redirect('/admin/login');
//     }
// }
// exports.users = function (req, res) {
//     session = req.session;
//     if (session.admin_id !== undefined) {
//         config.con.query("SELECT * FROM user", function (err, result) {
//             if (err) throw err;
//             res.render('super_admin/users', { APP_URL: config.APP_URL, users: result });
//         });
//     } else {
//         res.redirect('/admin/login');
//     }
// }
// exports.booking = function (req, res) {
//     session = req.session;
//     if (session.admin_id !== undefined) {
//         config.con.query("SELECT * FROM booking WHERE status='" + req.params.id + "'", function (err, result) {
//             if (err) throw err;
//             res.render('super_admin/booking', { APP_URL: config.APP_URL, users: result });
//         });
//     } else {
//         res.redirect('/admin/login');
//     }
// }