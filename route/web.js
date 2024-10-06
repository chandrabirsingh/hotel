module.exports = function(app,upload){
var homecontroller = require('../controller/homecontroller.js');
var admincontroller = require('../controller/admincontroller.js');
const config = require('../config.js');

// web croutes
// console.log(homecontroller.detailhotel);
app.get('/', homecontroller.index);
app.post('/', homecontroller.index);
app.post('/login', homecontroller.login);
app.post('/register', homecontroller.register);
app.get('/hotels', homecontroller.hotels);
app.get('/hotel/:hotel_slug', homecontroller.hotelroomdetail);
app.get('/detailhotel', homecontroller.detailhotel);
app.get('/detailhotel/:id', homecontroller.detailhotel);
app.get('/resorts', homecontroller.resorts);
app.get('/private-luxary-residency', homecontroller.private_luxary_residency);
app.get('/service-apartments', homecontroller.service_apartments);
app.get('/meet-and-events', homecontroller.meet_and_events);
app.post('/meet-and-events', homecontroller.meet_and_events);
app.get('/e-gift-coupon', homecontroller.e_gift_coupon);
// // app.get('/ecouponbuy/:id', homecontroller.ecouponbuy);

// app.get('/career', homecontroller.career);
// app.post('/career',upload.any(), homecontroller.career);
// app.get('/aboutus', homecontroller.aboutus);
// app.get('/covid-update', homecontroller.covidupdate);
// app.get('/best-rate-guaranteed', homecontroller.best_rate_guaranteed);
// app.get('/leadership', homecontroller.leadership);
// app.get('/privacy-policy', homecontroller.privacy_policy);
// app.get('/partner-with-us', homecontroller.partner_with_as);
// app.get('/cancellation-policy', homecontroller.cancellation_policy);
// app.get('/plant-tree', homecontroller.plant_tree);
// app.get('/flexible-cancellation', homecontroller.flexible_cancellation);
// app.get('/ecocommitment-go-green', homecontroller.ecocommitment_go_green);
// app.get('/food-delivery', homecontroller.food_delivery);
// app.get('/download-brochure', homecontroller.download_brochure);
// app.get('/media-centre', homecontroller.media_centre);
// app.get('/contact', homecontroller.contact);
// app.get('/terms-conditions', homecontroller.terms_conditions);
app.get('/book-now', homecontroller.booknow);
app.post('/book-now', homecontroller.booknow);
app.post('/feedback', homecontroller.feedback);
app.post('/booking', homecontroller.booking);
app.post('/contact', homecontroller.contact);
app.get('/booked', homecontroller.booked);
app.get('/booked/:id', homecontroller.booked);
app.get('/thankyou/:message', homecontroller.thankyou);
// app.get('/loyalty-program', homecontroller.loyalty_program);
// app.get('/loyalty-program-buy/:id', homecontroller.loyalty_program_buy);
// app.post('/loyalty_program_view/:id',upload.any(), homecontroller.loyalty_program_view);
app.get('/modify-cancel', homecontroller.modify_can);
app.post('/modify-cancel', homecontroller.modify_can);
app.get('/cancel/:id', homecontroller.cancel);
app.post('/cancel/:id', homecontroller.cancel);
app.post('/testpay', homecontroller.testpay);
app.get('/testpaypage', homecontroller.testpaypage);
app.get('/mail', homecontroller.mail);
// app.get('/h', homecontroller.helloFunction);
// app.get('/h',(req,res)=>{
//     console.log('hello');
//     res.send('Hello World!');
// })


app.get('/logout',(req,res) => {
    req.session.destroy();
    console.log('hello')
    res.redirect('/');
});
// admin routes

// app.get('/admin',admincontroller.index);
// app.get('/admin/login',admincontroller.login);
// app.post('/admin/login',admincontroller.login);
// app.get('/admin/add_hotel',admincontroller.add_hotel);
// app.post('/admin/add_hotel',upload.any(),admincontroller.add_hotel);
// app.get('/admin/edit_hotel/:id',admincontroller.edit_hotel);
// app.get('/admin/manage_hotels',admincontroller.manage_hotels);
// app.get('/admin/add_rooms',admincontroller.add_rooms);
// app.post('/admin/add_rooms',upload.any(),admincontroller.add_rooms);
// app.get('/admin/users',admincontroller.users);
// app.get('/admin/manage_rooms/:id',admincontroller.manage_rooms);
// app.get('/admin/booking/:id',admincontroller.booking);




app.get('/admin/logout',(req,res) => {
    // req.session.destroy();
    res.redirect('admin/login');
});
app.get('/fhotel/:id',(req,res) => {
    config.con.query("SELECT * FROM hotel WHERE city='"+req.params.id+"'",(err,hotels) => {
        var a= '<option style="background: #3b72b0;">Choose Hotel</option>';
        hotels.forEach((city,index) => {
        a += '<option style="background: #3b72b0;" value="'+city.id+'">'+city.hotel_name+'</option>';
        });
        res.send(a);
    });
});
}