
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
                res.render('pages/MeetAndEvent', { APP_URL: config.APP_URL, url: req.url, user: user });
            });
        } else {
            let user = '';
            res.render('pages/MeetAndEvent', { APP_URL: config.APP_URL, url: req.url, user: user });
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