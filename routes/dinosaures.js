var express = require('express');
var router = express.Router();
const dinosaure = require("../api/dinosaure");
const authCheck = require("../middleware/check-auth");
var multer = require('multer')
var upload = multer({ dest: 'uploads/' })
router.post("/register", upload.single('file'), dinosaure.register);
router.post("/login", dinosaure.login);
router.get("/", authCheck, dinosaure.getAllDinosaures);
router.get("/getFriends", authCheck, dinosaure.getFriends);
router.put("/update", [upload.single('file'), authCheck], dinosaure.updateProfile);
router.post("/verifyUser", authCheck, dinosaure.verifyUser);
router.post("/newUser", upload.single('file'), dinosaure.newUser);
router.post("/searchUser", authCheck, dinosaure.searchUser);

module.exports = router;
