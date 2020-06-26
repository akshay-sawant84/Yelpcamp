const express = require('express');
const router = express.Router({ mergeParams: true });
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const middleware = require("../middleware");
//======================
//comments routes

router.get('/new', middleware.isLoggedIn, (req, res) => {
	Campground.findById(req.params.id, (err, campground) => {
		if (err) {
			console.log(err);
		} else {
			res.render('comments/new', {
				campground
			});
		}
	});
});

router.post('/', middleware.isLoggedIn, (req, res) => {
	//lookup campground using ID
	Campground.findById(req.params.id, (err, campground) => {
		if (err) {
			console.log(err);
			res.redirect('/campgrounds');
		} else {
			let text = req.body.text;
			let rating_value = req.body.rating_value;
			let comment = { text: text, rating_value : rating_value };
			Comment.create(comment, (err, comment) => {
				if (err) {
					console.log(err);
				} else {
					//add username and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					//save comment
					comment.save();

					campground.comments.push(comment);
					campground.save();
					req.flash('success_msg','Successfully added comment');
					res.redirect('/campgrounds/' + campground._id);
				}
			});
		}
	});
	//create a comments
	//connect new commentsto campground
	//redirect
});

//comment edit
router.get('/:comment_id/edit', middleware.checkCommentOwnership ,(req, res) => {
	Comment.findById(req.params.comment_id, (err, foundComment) => {
		if (err) {
			console.log(err);
			res.redirect('back');
		} else {
			res.render('comments/edit', {
				campground_id: req.params.id,
				comment: foundComment
			});
		}
	});
});

//comment update
router.put('/:comment_id', middleware.checkCommentOwnership, (req, res) => {
	Comment.findOne({ _id: req.params.comment_id })
		.then(data => {
			data.text = req.body.text;
			data.rating_value = req.body.rating_value;
			data
				.save()
				.then(data => {
				req.flash('success_msg','Comment updated successfully');
					res.redirect('/campgrounds/' + req.params.id);
				})
				.catch(err => console.log(err));
		})
		.catch(err => {
			res.redirect('/campgrounds');
		});
});

//delete comment
router.delete('/:comment_id', middleware.checkCommentOwnership, (req, res) => {
	Comment.deleteOne({ _id: req.params.comment_id })
		.then(() => {
			req.flash('success_msg','Comment deleted');
			res.redirect('/campgrounds/' + req.params.id);
		})
		.catch(err => {
			res.redirect('back');
		});
});



module.exports = router;