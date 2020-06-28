const mongoose = require('mongoose');
const Comment = require('./comment');
//SCHEMA setup
const Schema = mongoose.Schema;
var campgroundSchema = new Schema({
	name: String,
	price : String,
	image: String,
	date:{
        type:Date,
        default: Date.now
    },	
	description: String,
	nlocation : String,
	address : String,
	email : String,
	activities : String,
	amenities : String,
	owindow : String,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		username: String
	},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Comment'
		}
	]
});

//for removing comments form db which were still remian in db after deleting the campground
campgroundSchema.pre('remove', async function() {
	await Comment.remove({
		_id: {
			$in: this.comments
		}
	});
});

module.exports = mongoose.model('Campground', campgroundSchema);