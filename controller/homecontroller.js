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
    config.con.query("SELECT city FROM hotel GROUP BY city", (err, cities) => {
        if (err) {
            console.error("Error fetching cities:", err);
            return res.status(500).send("Error fetching cities");
        }

        config.con.query("SELECT * FROM hotel", (err, hotels) => {
            if (err) {
                console.error("Error fetching hotels:", err);
                return res.status(500).send("Error fetching hotels");
            }

            let user = '';
            if (PSession.user_id !== undefined) {

                config.con.query("SELECT * FROM user WHERE id=" + PSession.user_id, (err, result) => {
                    if (err) {
                        console.error("Error fetching user:", err);
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

    config.con.query("SELECT * FROM hotel", (err, hotels) => {
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
    // console.log(session)
    const hotelQuery = "SELECT * FROM hotel WHERE hotel_name = ?";
    // return res.send(req.url)
    config.con.query(hotelQuery, [hotelName], (err, hotelResult) => {
        if (err || hotelResult.length === 0) {
            return res.status(404).send("Hotel not found.");
        }

        const hotelId = hotelResult[0].id;

        const roomsQuery = "SELECT hotel_room.*, hotel.hotel_name, hotel.facilities, hotel.city, hotel.location FROM hotel_room INNER JOIN hotel ON hotel_room.hotel_id = hotel.id WHERE hotel.id = ?";
        config.con.query(roomsQuery, [hotelId], (err, roomsResult) => {
            if (err) {
                return res.status(500).send("Error fetching hotel rooms.");
            }

            let user = '';
            let reurl = `${hotelSlug}`;
            // return res.send(reurl);
            const book = roomsResult.length > 0 ? 1 : 0;
            if (session.user_id !== undefined) {
                config.con.query("SELECT * FROM user WHERE id=" + session.user_id, (err, result) => {
                    if (err) {
                        return res.redirect('/logout');
                    }
                    user = result.length > 0 ? result[0] : '';
                    // return res.send(user)
                    console.log('user' + user);
                    res.render('pages/hotelrooms', { APP_URL: config.APP_URL, hotels: roomsResult, url: reurl, user: user, book: book, hotelName: hotelResult[0].hotel_name });
                });
            } else {
                // return res.send(roomsResult);
                // console.log(user + 'hello')
                res.render('pages/hotelrooms', { APP_URL: config.APP_URL, hotels: roomsResult, url: reurl, user: user, book: book, hotelName: hotelResult[0].hotel_name });
            }
        });
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
    console.log(22);

    try {
        if (req.body.body !== undefined) {
            // Handle booking
            var myreq = req.body;
            config.con.query("INSERT INTO `booking`(`name`, `email`, `mobile`, `country`, `address`, `city`, `additional`, `destination`, `hotel_id`, `checkin`, `checkout`, `room`, `room_id`, `status`, `payment_status`,`payment_amount`) VALUES ('" + myreq.body.name + "','" + myreq.body.email + "','" + myreq.body.mobile + "','" + myreq.body.country + "','" + myreq.body.address + "','" + myreq.body.city + "','" + myreq.body.additional + "','" + myreq.query.destination + "','" + myreq.query.hotel + "','" + myreq.query.checkin + "','" + myreq.query.checkout + "','" + myreq.query.room + "','" + myreq.query.room_id + "','pending','paid','" + myreq.body.amount / 100 + "')", (err, result) => {
                if (err) {
                    console.error('Error during booking:', err);
                    return res.status(500).send('Internal Server Error');
                }
                res.send({ reurl: 'booked/' + result.insertId });
            });
        } else {
            const date = require('date-and-time');
            config.con.query("SELECT hotel_room.*,hotel.hotel_name,hotel.facilities,hotel.city,hotel.location FROM hotel_room INNER JOIN hotel ON hotel_room.hotel_id=hotel.id WHERE hotel_room.id='" + req.query.room_id + "'", (err, hotels) => {
                if (err) {
                    console.error('Error fetching hotel data:', err);
                    return res.status(500).send('Internal Server Error');
                }

                if (session.user_id !== undefined) {
                    config.con.query("SELECT * FROM user WHERE id=" + session.user_id, (err, result) => {
                        if (err) {
                            console.error('Error fetching user:', err);
                            return res.status(500).send('Internal Server Error');
                        }

                        if (result.length > 0) {
                            user = result[0];
                            console.log('User:', JSON.stringify(user));
                        } else {
                            return res.redirect('/logout');
                        }

                        res.render('booknow', { APP_URL: config.APP_URL, url: req.url, user: user, date: date, rebo: req.query, hotels: hotels, crypto: crypto });
                    });
                } else {
                    const date1 = new Date(req.query.checkin);
                    const date2 = new Date(req.query.checkout);
                    const diffTime = Math.abs(date2 - date1);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    console.log(user + 'hello')
                    res.render('booknow', { APP_URL: config.APP_URL, url: req.url, user: user, date: date, rebo: req.query, hotels: hotels[0], crypto: crypto, diffDays: diffDays });
                }
            });
        }
    } catch (error) {
        console.error('Unexpected Error:', error);
        res.status(500).send('Something went wrong');
    }
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