var express = require('express');
const Dinosaure = require('../models/dinosaure');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validateLoginInput = require("../validators/login");
const cloudinary = require('cloudinary');
require('../handler/cloudinary');
var newDinosaure = null;


exports.register = async (req, res, next) => {

    bcrypt.hash(req.body.password, 10).then(hash => {
        const dinosaure = new Dinosaure({
            login: req.body.login,
            password: hash,
            famille: req.body.famille,
            age: req.body.age,
            race: req.body.race,
            nourriture: req.body.nourriture,
            profileImage: "",
            friends: []
        });
        newDinosaure = dinosaure
        module.exports.newDinosaure = newDinosaure;
        return res.json({ status: "success", message: "dinosaure object created" });
    })

};


exports.uploadProfileImage = async (req, res, next) => {

    if (req.file != undefined) {
        const result = await cloudinary.v2.uploader.upload(req.file.path);
        newDinosaure.profileImage = result.secure_url;
    }

    newDinosaure.save().then(result => {
        const token = jwt.sign(
            {
                id: newDinosaure._id
            },
            "secret_this_should_be_longer",
            { expiresIn: '1h' }
        );
        res.status(200).json({
            success: true,
            token: "Bearer " + token,
            user: newDinosaure
        });

    })

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
        const result = await cloudinary.v2.uploader.upload(req.file.path);
        params.profileImage = result.secure_url;

    }

    bcrypt.hash(newData.password, 10).then(hash => {

        params.password = hash
        return params
    }).then(params => {

        for (let prop in params) if (!params[prop]) delete params[prop];

        Dinosaure.findOneAndUpdate({ _id: req.userData.id }, params, { new: true }).then(data => {
            return res.status(200).json({
                data
            });
        });
    });

    for (let prop in params) if (!params[prop]) delete params[prop];

    /*Dinosaure.findOneAndUpdate({ _id: req.userData.id }, params, { new: true }).then(data => {
        return res.status(200).json({
            data
        });
    });*/
    /* bcrypt.hash(newData.password, 10).then(hash => {
         const dinosaure = new Dinosaure({
             login: newData.login,
             password: hash,
             famille: newData.famille,
             age: newData.age,
             race: newData.race,
             nourriture: newData.nourriture,
             friends: newData.friends,
             profileImage: newData.profileImage
         });
 
         newDinosaure = dinosaure
 
     });*/



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