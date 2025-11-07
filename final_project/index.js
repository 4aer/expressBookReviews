const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
// Load env variables early so other modules can use them
require('dotenv').config();

// Use secrets from environment with sensible fallbacks for development
const SESSION_SECRET = process.env.SESSION_SECRET || "fingerprint_customer";
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_for_development";
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({ secret: SESSION_SECRET, resave: true, saveUninitialized: true }))

// Basic authentication middleware for /customer/auth/* routes.
// Verifies the JWT stored in the session using the same secret as `auth_users.js`.
app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session && req.session.authorization) {
        const token = req.session.authorization['accessToken'];
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (!err) {
                req.user = decoded;
                return next();
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
