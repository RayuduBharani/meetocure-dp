//seperate file for generating JWT tokens for no error

const jwt = require("jsonwebtoken");

const generateToken = (id, role) =>
{
    return jwt.sign({id, role}, process.env.JWT_SECRET,
    {
        expiresIn: "7d", //new token every after 7 day cycle
    });

};

module.exports = generateToken;