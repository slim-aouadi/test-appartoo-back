var express = require('express');
var router = express.Router();
const dinosaure = require("../api/dinosaure");
const authCheck = require("../middleware/check-auth");
var multer = require('multer')
var upload = multer({ dest: 'uploads/' })
router.post("/register", dinosaure.register);
router.post("/login", dinosaure.login);
router.get("/", authCheck, dinosaure.getAllDinosaures);
router.get("/getFriends", authCheck, dinosaure.getFriends);
router.put("/update", [upload.single('file'), authCheck], dinosaure.updateProfile);
router.post("/uploadProfileImage", upload.single('file'), dinosaure.uploadProfileImage);
router.post("/verifyUser", authCheck, dinosaure.verifyUser);

module.exports = router;
