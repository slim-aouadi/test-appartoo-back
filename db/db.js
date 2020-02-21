const mongoose = require("mongoose");
mongoose.connect('mongodb://localhost/AppartooDB')
mongoose.set('useFindAndModify', false);
mongoose.connection.on('connected', () => {
    console.log('connected to database: ');
});
mongoose.connection.on('error', (err) => {
    console.log('Connection Error: ' + err);
});
