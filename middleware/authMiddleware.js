const jwt = require('jsonwebtoken');
require('dotenv').config();
const secretKey = process.env.SECRET_KEY;
module.exports = function(req,res,next){
    const authHeader = req.headers['authorization'];

    // Check if Authorization header exists
    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    // Split the 'Bearer <token>'
    const token = authHeader.split(' ')[1]; // or use destructuring
    console.log("Token:", token);
    if (!token) {
        return res.status(401).json({ message: "Token not provided" });
    }
    try{
        const decoded = jwt.verify(token,secretKey);
        next();
    } catch(err){
        res.status(400).send("Invalid token.")
    }
}