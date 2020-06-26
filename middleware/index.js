const Campground = require("../models/campground");
const Comment = require("../models/comment");

//all the middleware


let middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
	//is user logged in?
	if (req.isAuthenticated()) {
		Campground.findById(req.params.id, (err, foundCampground) => {
			if (err) {
				res.redirect('back');
			} else {
				//does user own the campground
				if (foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
					next();
				} else {
					req.flash('error_msg','You dont have permission to do that')
					res.redirect('back');
				}
			}
		});
	} else {
		req.flash('error_msg','You need to be logged in to do that');
		res.redirect('back');
	}
};




middlewareObj.checkCommentOwnership = function(req, res, next) {
	//is user logged in?
	if (req.isAuthenticated()) {
		Comment.findById(req.params.comment_id, (err, foundComment) => {
			if (err) {
				res.redirect('back');
			} else {
				//does user own the comment
				if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
					next();
				} else {
					req.flash('error_msg','You dont have permission to do that')
					res.redirect('back');
				}
			}
		});
	} else {
		req.flash('error_msg','You need to be logged in to do that');
		res.redirect('back');
	}
}  



middlewareObj.isLoggedIn = function(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash("error_msg", "You need to be logged in to do that");
	res.redirect('/login');
}

module.exports = middlewareObj;