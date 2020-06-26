const mongoose = require('mongoose');
var moment = require('moment'); // require
moment().format(); 

let commentSchema = new mongoose.Schema({
	text : String,
	rating_value : Number,
	author : {
		id : {
			type : mongoose.Schema.Types.ObjectId,
			ref : "User"
		},
		username : String
	},
	date:{
        type:Date,
        default: Date.now
    }	
})

module.exports = mongoose.model("Comment", commentSchema);