const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {

        jwt.verify(req.headers.authorization.split(" ")[2], "secret_this_should_be_longer", function (err, decodedToken) {
            if (err) throw new Error(err);
            req.userData = {
                id: decodedToken.id,
            };
            next();
        });
    } catch (error) {
        res.status(401).json({ message: "You are not authenticated!", error: error });
    }
};
