var exports = module.exports = {}
const config = require('../config.js');
const crypto = require('crypto');
const { console } = require('inspector');
const nodemailer = require("nodemailer");
// const flash = require('connect-flash');
// const session = require('express-session');
// const { session } = require('passport');


exports.index = function (req, res) {
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
            if (req.session.user_id !== undefined) {
                config.con.query("SELECT * FROM user WHERE id=" + req.session.user_id, (err, result) => {
                    if (err) {
                        console.error("Error fetching user:", err);
                        return res.redirect('/logout');
                    }

                    if (result.length > 0) {
                        user = result[0];
                        return res.render('pages/index', {
                            APP_URL: config.APP_URL,
                            cities: cities,
                            hotels: hotels,
                            url: req.url,
                            user: user,
                            hid: 1, cowin: 1,successMessage: req.flash('success'),  // Pass success message
                            errorMessage: req.flash('error') 
                        });
                    } else {
                        return res.redirect('/logout');
                    }
                });
            } else {
                console.log(44);
                return res.render('pages/index', {
                    APP_URL: config.APP_URL,
                    cities: cities,
                    hotels: hotels,
                    url: req.url,
                    user: user,
                    hid: 1, cowin: 1, successMessage: req.flash('success'),  // Pass success message
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
                    } else {
                        res.redirect('/logout');
                    }
                }
                res.render('hotels', { APP_URL: config.APP_URL, hotels: hotels, url: req.url, user: user });
            });
        } else {
            res.render('pages/hotels', { APP_URL: config.APP_URL, hotels: hotels, url: req.url, user: user });
        }
    });
};

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
                res.render('resorts', { APP_URL: config.APP_URL, hotels: hotels, url: req.url, user: user });
            });
        } else {
            res.render('resorts', { APP_URL: config.APP_URL, hotels: hotels, url: req.url, user: user });
        }
    });
}
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
                res.render('meet_and_events', { APP_URL: config.APP_URL, url: req.url, user: user });
            });
        } else {
            let user = '';
            res.render('meet_and_events', { APP_URL: config.APP_URL, url: req.url, user: user });
        }
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
exports.ecouponbuy = function (req, res) {
    session = req.session;
    if (req.params.id == 1) {
        var amount = 3000;
    } else if (req.params.id == 2) {
        var amount = 4500;
    } else if (req.params.id == 3) {
        var amount = 10000;
    } else if (req.params.id == 4) {
        var amount = 20000;
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
    var valid_date = new Date(now.setFullYear(now.getFullYear() + 1));
    valid_date = date.format(valid_date, 'YYYY/MM/DD HH:mm:ss');
    config.con.query("INSERT INTO `ecoupon`(`coupon_code`, `amount`, `valid_date`) VALUES ('" + coupon + "','" + amount + "','" + valid_date + "')", (err, result) => {
        config.con.query("SELECT * FROM ecoupon WHERE id=" + result.insertId, (err, resulta) => {
            if (err) { res.redirect('/e-gift-coupon'); } else {
                if (resulta.length > 0) {
                    coupondata = resulta[0];
                } else {
                    res.redirect('/e-gift-coupon');
                }
            }
            res.render('egift_coupon', { APP_URL: config.APP_URL, url: req.url, coupondata: coupondata });
        });
    });
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
exports.hotelroomdetail = function (req, res) {
    session = req.session;
    const hotelSlug = req.params.hotel_slug; // Get the slug from the URL

    // Convert the slug back to the original hotel name (replace hyphens with spaces)
    const hotelName = hotelSlug.replace(/-/g, ' ');

    // Query to find the hotel by the name (converted from slug)
    const hotelQuery = "SELECT * FROM hotel WHERE hotel_name = ?";
    
    config.con.query(hotelQuery, [hotelName], (err, hotelResult) => {
        if (err || hotelResult.length === 0) {
            return res.status(404).send("Hotel not found.");
        }
        
        const hotelId = hotelResult[0].id; // Get the hotel ID for fetching the rooms
        
        // Query to get hotel rooms for the particular hotel
        const roomsQuery = "SELECT hotel_room.*, hotel.hotel_name, hotel.facilities, hotel.city, hotel.location FROM hotel_room INNER JOIN hotel ON hotel_room.hotel_id = hotel.id WHERE hotel.id = ?";
        
        config.con.query(roomsQuery, [hotelId], (err, roomsResult) => {
            if (err) {
                return res.status(500).send("Error fetching hotel rooms.");
            }

            let user = '';
            let reurl = req.url.replace("/hotelroomdetail?", "");
            const book = roomsResult.length > 0 ? 1 : 0; // Check if rooms exist
            
            if (session.user_id !== undefined) {
                // If user is logged in, fetch the user details
                config.con.query("SELECT * FROM user WHERE id=" + session.user_id, (err, result) => {
                    if (err) {
                        return res.redirect('/logout');
                    }
                    user = result.length > 0 ? result[0] : '';
                    res.render('hotel-room-detail', { APP_URL: config.APP_URL, hotels: roomsResult, url: reurl, user: user, book: book });
                });
            } else {
                // If no user is logged in
                res.render('hotel-room-detail', { APP_URL: config.APP_URL, hotels: roomsResult, url: reurl, user: user, book: book });
            }
        });
    });
};

// exports.hotelroomdetail = function (req, res) {
//     session = req.session;
//     const hotelSlug = req.params.hotel_slug; // Get the slug from the URL

//     // Convert the slug back to the original hotel name (replace hyphens with spaces)
//     const hotelName = hotelSlug.replace(/-/g, ' ');
//     let qu;
//     if ((req.query.destination !== undefined) && (req.query.hotel !== undefined)) {
//         var book = 1;
//         qu = "SELECT hotel_room.*,hotel.hotel_name,hotel.facilities,hotel.city,hotel.location FROM hotel_room INNER JOIN hotel ON hotel_room.hotel_id=hotel.id WHERE hotel.city='" + req.query.destination + "' AND hotel_room.hotel_id='" + req.query.hotel + "'";
//     } else if ((req.query.destination !== undefined)) {
//         var book = 1;
//         qu = "SELECT hotel_room.*,hotel.hotel_name,hotel.facilities,hotel.city,hotel.location FROM hotel_room INNER JOIN hotel ON hotel_room.hotel_id=hotel.id WHERE hotel.city='" + req.query.destination + "'";
//     } else if (req.query.hotel !== undefined) {
//         var book = 1;
//         qu = "SELECT hotel_room.*,hotel.hotel_name,hotel.facilities,hotel.city,hotel.location FROM hotel_room INNER JOIN hotel ON hotel_room.hotel_id=hotel.id WHERE hotel_room.hotel_id='" + req.query.hotel + "'"
//     } else {
//         var book = 0;
//         qu = "SELECT hotel_room.*,hotel.hotel_name,hotel.facilities,hotel.city,hotel.location FROM hotel_room INNER JOIN hotel ON hotel_room.hotel_id=hotel.id"
//     }
//     config.con.query(qu, (err, hotels) => {

//         let user = '';
//         let reurl = req.url.replace("/hotelroomdetail?", "");
//         if (session.user_id !== undefined) {
//             // return session.user_id;
//             config.con.query("SELECT * FROM user WHERE id=" + session.user_id, (err, result) => {
//                 if (err) { res.redirect('/logout'); } else {
//                     if (result.length > 0) {
//                         user = result[0];
//                     } else {
//                         res.redirect('/logout');
//                     }
//                 }
//                 console.log(result);
//                 res.render('hotel-room-detail', { APP_URL: config.APP_URL, hotels: hotels, url: reurl, user: user, book: book });
//             });
//         } else {
//             res.render('hotel-room-detail', { APP_URL: config.APP_URL, hotels: hotels, url: reurl, user: user, book: book });
//         }
//     });
// }
exports.detailhotel = function (req, res) {
    session = req.session;
    let user = '';
    var id = req.params.id ? req.params.id : 2
    config.con.query("SELECT hotel_room.*, hotel.city, hotel.hotel_name, hotel.hotel_images FROM `hotel_room` INNER JOIN hotel ON hotel_room.hotel_id=hotel.id WHERE hotel_room.id=" + id, (err, hotel_room) => {
        if (hotel_room.length > 0) {
            hotel_room = hotel_room[0];
        } else {
            res.redirect('/hotels');
        }
        if (session.user_id !== undefined) {
            config.con.query("SELECT * FROM user WHERE id=" + session.user_id, (err, result) => {
                if (err) { res.redirect('/logout'); } else {
                    if (result.length > 0) {
                        user = result[0];
                    } else {
                        res.redirect('/logout');
                    }
                }
                res.render('detailhotel', { APP_URL: config.APP_URL, url: req.url, user: user, hotel_room: hotel_room });
            });

        } else {
            res.render('detailhotel', { APP_URL: config.APP_URL, url: req.url, user: user, hotel_room: hotel_room });
        }
    });
}
exports.career = function (req, res) {
    session = req.session;
    let user = '';
    if (req.body.name !== undefined) {
        var cv;
        cv = [];
        req.files.forEach(uploads => {
            if (uploads.fieldname == 'cv') {
                cv.push(uploads.filename);
            }
        });
        // console.log(req.files);
        config.con.query("INSERT INTO `career`(`name`, `mobile`, `email`, `current_position`, `language`, `skill`, `current_salary`, `apply_for`, `expected_salary`, `cv`, `message`) VALUES ('" + req.body.name + "','" + req.body.cc + req.body.mobile + "','" + req.body.email + "','" + req.body.current_position + "','" + req.body.language + "','" + req.body.skill + "','" + req.body.current_salary + "','" + req.body.apply_for + "','" + req.body.expected_salary + "','" + req.body.cv + "','" + req.body.message + "')", (err, result) => {
            if (err) console.log(err);
            res.redirect('thankyou/We are in receipt of your application. One of our HR representative will connect with you with in 15 days if your profile is short listed. For more job updates kindly follow us on our social media job portals.');
            var mess = "name : " + req.body.email + "',Mobile : " + req.body.cc + req.body.mobile + "',email " + req.body.email + "',current_position " + req.body.current_position + "',language " + req.body.language + "',skill " + req.body.skill + "',current_salary " + req.body.current_salary + "',apply_for " + req.body.apply_for + "',expected_salary " + req.body.expected_salary + "',message " + req.body.message + "'";
            var request = require('request');
            var options = {
                'method': 'GET',
                'url': 'http://skydoorhotels.com/mail?to=chandrabir.singh@skydoorhotels.com&subject=Career&message=' + mess,
                'headers': {
                    'Cookie': 'connect.sid=s%3Ay5vOW7KatUr30uGv90Rbxkb3eN_XhoZf.yf28BCuSgR1ov7Eqt1LHyvPPqhd5LywcdPzMXwKD19k'
                }
            };
            request(options, function (error, response) {
                if (error) throw new Error(error);
                console.log(response.body);
            });

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
                res.render('career', { APP_URL: config.APP_URL, url: req.url, user: user });
            });
        } else {
            res.render('career', { APP_URL: config.APP_URL, url: req.url, user: user });
        }
    }
}
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
            res.render('food_delivery', { APP_URL: config.APP_URL, url: req.url, user: user });
        });
    } else {
        res.render('food_delivery', { APP_URL: config.APP_URL, url: req.url, user: user });
    }
}
exports.download_brochure = function (req, res) {
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
            res.render('download_brochure', { APP_URL: config.APP_URL, url: req.url, user: user });
        });
    } else {
        res.render('download_brochure', { APP_URL: config.APP_URL, url: req.url, user: user });
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
exports.booknow = function (req, res) {
    session = req.session;
    let user = '';
    if (req.body.body !== undefined) {
        // console.log(req.body);
        var myreq = req.body;
        config.con.query("INSERT INTO `booking`(`name`, `email`, `mobile`, `country`, `address`, `city`, `additional`, `destination`, `hotel_id`, `checkin`, `checkout`, `room`, `room_id`, `status`, `payment_status`,`payment_amount`) VALUES ('" + myreq.body.name + "','" + myreq.body.email + "','" + myreq.body.mobile + "','" + myreq.body.country + "','" + myreq.body.address + "','" + myreq.body.city + "','" + myreq.body.additional + "','" + myreq.query.destination + "','" + myreq.query.hotel + "','" + myreq.query.checkin + "','" + myreq.query.checkout + "','" + myreq.query.room + "','" + myreq.query.room_id + "','pending','paid','" + myreq.body.amount / 100 + "')", (err, result) => {
            if (err) console.log(err);
            res.send({ reurl: 'booked/' + result.insertId });
        });
    } else {
        const date = require('date-and-time');
        config.con.query("SELECT hotel_room.*,hotel.hotel_name,hotel.facilities,hotel.city,hotel.location FROM hotel_room INNER JOIN hotel ON hotel_room.hotel_id=hotel.id WHERE hotel_room.id='" + req.query.room_id + "'", (err, hotels) => {
            if (session.user_id !== undefined) {
                config.con.query("SELECT * FROM user WHERE id=" + session.user_id, (err, result) => {
                    if (err) { res.redirect('/logout'); } else {
                        if (result.length > 0) {
                            user = result[0];
                        } else {
                            res.redirect('/logout');
                        }
                    }

                    res.render('booknow', { APP_URL: config.APP_URL, url: req.url, user: user, date: date, rebo: req.query, hotels: hotels, crypto: crypto });
                });
            } else {
                const date1 = new Date(req.query.checkin);
                const date2 = new Date(req.query.checkout);
                const diffTime = Math.abs(date2 - date1);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                console.log(hotels);
                res.render('booknow', { APP_URL: config.APP_URL, url: req.url, user: user, date: date, rebo: req.query, hotels: hotels[0], crypto: crypto, diffDays: diffDays });
            }
        });
    }
}
exports.booking = function (req, res) {
    session = req.session;
    let user = '';
    if (req.body.name !== undefined) {
        config.con.query("INSERT INTO `booking`(`name`, `email`, `mobile`, `country`, `address`, `city`, `additional`, `destination`, `hotel_id`, `checkin`, `checkout`, `room`, `room_id`, `child`, `adults`, `status`) VALUES ('" + req.body.name + "','" + req.body.email + "','" + req.body.mobile + "','" + req.body.country + "','" + req.body.address + "','" + req.body.city + "','" + req.body.additional + "','" + req.body.destination + "','" + req.body.hotel_id + "','" + req.body.checkin + "','" + req.body.checkout + "','" + req.body.room + "','" + req.body.room_id + "','" + req.body.child + "','" + req.body.adults + "','pending')", (err, result) => {
            if (err) console.log(err);
            res.redirect('booked');
        });
    } else {
        res.redirect('hotels');
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
                if (err) { res.redirect(req.body.url); } else {
                    if (result.length > 0) {
                        session.user_id = result[0].id;
                        res.redirect(req.body.url);
                    } else {
                        res.redirect(req.body.url);
                    }
                }
            });
        }
    } else {
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
                        res.redirect(req.body.url);
                    } else {
                        res.redirect(req.body.url);
                    }
                }
            });
        }
    } else {
        res.redirect(req.body.url);
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