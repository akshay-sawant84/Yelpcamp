const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const middleware = require("../middleware");

//all campgrounds
router.get('/', (req, res) => {
	// eval(require('locus'));
	if(req.query.search){
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Campground.find({ name : regex }, (err, allCampground) => {
		if (err) {
			console.log(err);
		} else {
			if(allCampground.length < 1){
				req.flash('error_msg','No campground match, please try again');
				res.redirect("/campgrounds");
			}else{
				res.render('campgrounds/index', {
				campgrounds: allCampground,
				currentUser: req.user
			});
			}
			
		}
	});
	} else {
		Campground.find({}, (err, allCampground) => {
		if (err) {
			console.log(err);
		} else {
			res.render('campgrounds/index', {
				campgrounds: allCampground,
				currentUser: req.user
			});
		}
	});	
	}
	//get all campgrounds from DB
	
});

//new campground form page
router.get('/new', middleware.isLoggedIn, (req, res) => {
	//get data from form add to campgrounds array
	let greet = "hello dude";
	res.render('campgrounds/new', {
		greet : greet
	});
});

//add campground to database
router.post('/', middleware.isLoggedIn, (req, res) => {
	const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	let errors = [];

	if (!req.body.name) {
		errors.push({ text: 'Name should not be empty' });
	}
	
	if (!req.body.price) {
		errors.push({ text: 'Title should not be empty' });
	}
	
	if (!req.body.image) {
		errors.push({ text: 'Details should not be empty' });
	}

	if (!req.body.description) {
		errors.push({ text: 'Details should not be empty' });
	}
	
	if(!req.body.address){
		errors.push({ text: 'Address should not be empty' });
	}
	if(!req.body.nlocation){
		errors.push({ text: 'Location should not be empty' });
	}
	if(!req.body.address){
		errors.push({ text: 'Address should not be empty' });
	}
	if(!req.body.amenities){
		errors.push({ text: 'Amenities should not be empty' });
	}
	if(!req.body.owindow){
		errors.push({ text: 'Opening window should not be empty' });
	}
	if (!req.body.email || !emailRegex.test(req.body.email)) {
    console.log("email is not valid");
    errors.push({ text: "email is not valid" });
  }
	if (errors.length > 0) {
		errors.forEach((errors) => {
			req.flash("error_msg",errors.text);	
		})
		res.redirect('campgrounds/new');
	} else {
		let name = req.body.name;
		let image = req.body.image;
		let price = req.body.price;
		let desc = req.sanitize(req.body.description);
		let address = req.body.address;
		let nlocation = req.body.nlocation;
		let email = req.body.email;
		let amenities = req.body.amenities;
		let owindow = req.body.owindow;
		let author = {
			id: req.user._id,
			username: req.user.username
		};
		let newCampground = { name: name, price : price, image: image, description: desc, author: author, address : address, nlocation : nlocation, email : email, amenities : amenities, owindow : owindow };
		// campgrounds.push(newCampground);
		//ceate a newCampground and save to DB
		Campground.create(newCampground, (err, newlyCreated) => {
			if (err) {
				console.log(err);
			} else {
				//redirect
				req.flash('success_msg','Campground added successfully');
				res.redirect('/campgrounds');
			}
		});
	}
});

//show info about campgrounds
router.get('/:id', (req, res) => {
	//find the campground with provided ID
	Campground.findById(req.params.id)
		.populate('comments')
		.exec((err, foundCampground) => {
			if (err) {
				console.log(err);
			} else {
				//render show template with that campground
				res.render('campgrounds/show', {
					campground: foundCampground
				});
			}
		});
});



// Edit Campground Route
router.get('/:id/edit', middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		res.render('campgrounds/edit', {
			campground: foundCampground
		});
	});
});

// Update campground route
router.put('/:id', middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findOne({ _id: req.params.id })
		.then(data => {
			data.name = req.body.name;
			data.price = req.body.price;
			data.image = req.body.image;
			data.description = req.sanitize(req.body.description);
			data
				.save()
				.then(data => {
				req.flash('success_msg','Campground updated successfully');
					res.redirect('/campgrounds/' + req.params.id);
				})
				.catch(err => res.redirect('/campgrounds'));
		})
		.catch(err => {
			console.log(err);
		});
});

//Destroy campground route
// router.delete("/:id", (req,res) => {
// 	 Campground.deleteOne({_id:req.params.id})
//             .then(() => {
//               res.redirect('/campgrounds');
//             })
//             .catch(err => {
//               res.redirect('/campgrounds');
//             })
// })

//for removing campgrounds as well as comments form db which were still remian in db after deleting the campground
router.delete('/:id', middleware.checkCampgroundOwnership, async (req, res) => {
	try {
		let foundCampground = await Campground.findById(req.params.id);
		await foundCampground.remove();
		req.flash('success_msg','Campground deleted successfully');
		res.redirect('/campgrounds');
	} catch (error) {
		console.log(error.message);
		res.redirect('/campgrounds');
	}
});


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;