var express = require('express');
const Dinosaure = require('../models/dinosaure');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validateLoginInput = require("../validators/login");
const cloudinary = require('cloudinary');
require('../handler/cloudinary');
var newDinosaure = null;

exports.searchUser = async (req, res, next) => {
    Dinosaure.findOne({ age: req.body.age, login: req.body.login, famille: req.body.famille, race: req.body.race, nourriture: req.body.nourriture })
        .then(dinosaure => {
            return res.json({ status: "success", message: "user found", data: dinosaure });
        })
};

exports.register = async (req, res, next) => {

    newData = JSON.parse(req.body.data)
    let params = new Dinosaure({
        login: newData.login,
        password: newData.password,
        famille: newData.famille,
        age: newData.age,
        race: newData.race,
        nourriture: newData.nourriture,
        friends: newData.friends,
        profileImage: newData.profileImage
    });
    if (req.file != undefined) {
        const result = await cloudinary.v2.uploader.upload(req.file.path);
        params.profileImage = result.secure_url;
    }
    bcrypt.hash(newData.password, 10).then(hash => {
        params.password = hash
        return params
    }).then(params => {
        params.save().then(result => {
            const token = jwt.sign(
                {
                    id: params._id
                },
                "secret_this_should_be_longer",
                { expiresIn: '1h' }
            );
            res.status(200).json({
                success: true,
                token: "Bearer " + token,
                user: params
            });

        })
    });

};





exports.newUser = async (req, res, next) => {
    newData = JSON.parse(req.body.data)

    let params = new Dinosaure({
        login: newData.login,
        password: newData.password,
        famille: newData.famille,
        age: newData.age,
        race: newData.race,
        nourriture: newData.nourriture,
        friends: newData.friends,
        profileImage: newData.profileImage
    });
    if (req.file != undefined) {
        const result = await cloudinary.v2.uploader.upload(req.file.path);
        params.profileImage = result.secure_url;
    }
    bcrypt.hash(newData.password, 10).then(hash => {
        params.password = hash
        return params
    }).then(params => {
        params.save().then(result => {
            res.status(200).json({
                success: true,
                dinosaure: params
            });

        })
    });

};


exports.updateProfile = async (req, res, next) => {
    newData = JSON.parse(req.body.data)
    let params = {
        login: newData.login,
        password: newData.password,
        famille: newData.famille,
        age: newData.age,
        race: newData.race,
        nourriture: newData.nourriture,
        friends: newData.friends,
        profileImage: newData.profileImage
    };
    if (req.file != undefined) {
        console.log("new profile image");
        const result = await cloudinary.v2.uploader.upload(req.file.path);
        params.profileImage = result.secure_url;
    }

    bcrypt.hash(newData.password, 10).then(hash => {
        if (newData.password[0] !== "$") {
            params.password = hash
        }
        return params
    }).then(params => {

        for (let prop in params) if (!params[prop]) delete params[prop];

        Dinosaure.findOneAndUpdate({ _id: req.userData.id }, params, { new: true }).then(data => {
            return res.status(200).json({
                data
            });
        });
    });

};
exports.getFriends = async (req, res, next) => {
    let fetchedDinosaure;
    Dinosaure.findById({ _id: req.userData.id })
        .then(dinosaure => {
            if (!dinosaure) {
                return res.status(401).json({
                    message: "undifined user"
                });
            }
            fetchedDinosaure = dinosaure;

        })
        .then(() => {
            Dinosaure.find({ '_id': { $in: fetchedDinosaure.friends } }).then(re => {

                res.status(200).json(re)
            })
        })
        .catch(err => {
            console.log(err);
        });
};
exports.getAllDinosaures = async (req, res, next) => {

    let fetchedDinosaure;
    Dinosaure.findById({ _id: req.userData.id })
        .then(dinosaure => {
            if (!dinosaure) {
                return res.status(401).json({
                    message: "undifined user"
                });
            }
            fetchedDinosaure = dinosaure;
        })
        .then(() => {
            Dinosaure.find({ '_id': { $nin: fetchedDinosaure.friends } }).then(re => {
                res.status(200).json(re)
            })
        })
        .catch(err => {
            console.log(err);
        });

};
exports.login = (req, res, next) => {
    const { errors, isValid } = validateLoginInput(req.body);
    // Check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }
    let fetchedDinosaure;
    Dinosaure.findOne({ login: req.body.login })
        .then(dinosaure => {
            if (!dinosaure) {
                return res.status(401).json({
                    message: "Auth failed"
                });
            }
            fetchedDinosaure = dinosaure;
            return bcrypt.compare(req.body.password, dinosaure.password);
        })
        .then(result => {
            if (!result) {
                return res.status(401).json({
                    message: "Auth failed"
                });
            }
            const token = jwt.sign(
                {
                    id: fetchedDinosaure._id
                },
                "secret_this_should_be_longer",
                { expiresIn: '1h' }
            );
            res.status(200).json({
                success: true,
                token: "Bearer " + token,
                user: fetchedDinosaure
            });
        })
        .catch(err => {
            console.log(err);
            return res.status(401).json({
                message: "Invalid authentication credentials!",
                error: err
            });
        });
};

exports.verifyUser = (req, res, next) => {
    Dinosaure.findOne({ _id: req.userData.id }).then(user => {
        return res.status(200).json({
            user
        });
    }).catch(err => {
        return res.status(401).json({
            message: "Invalid authentication credentials!",
            error: err
        });
    });
};