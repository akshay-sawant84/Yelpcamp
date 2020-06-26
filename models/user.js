const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

let UserSchema = new mongoose.Schema({
	username : String,
	password : String,
	avatar : String,
	firstName : String,
	lastName : String,
	email : String,
	city : String,
	bday : String,
	isAdmin : { type : Boolean, default : false },
	date:{
        type:Date,
        default: Date.now
    }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);