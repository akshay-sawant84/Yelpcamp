const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Campground = require('../models/campground');

router.get('/', (req, res) => {
	res.render('landing');
});

//===============
// Auth Routes
//==============

//show register form
router.get('/register', (req, res) => {
	res.render('register');
});

//handling sign up logic
router.post('/register', (req, res) => {
	const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	var passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/;
	let errors = [];

	if (!req.body.username) {
		errors.push({ text: 'Username should not be empty' });
	}

	if (!req.body.email || !emailRegex.test(req.body.email)) {
		console.log('email is not valid');
		errors.push({ text: 'email is not valid' });
	}

	if (!req.body.password || !passwordRegex.test(req.body.password)) {
		console.log('email is not valid');
		errors.push({ text: 'Password is not valid' });
	}

	if (req.body.password != req.body.password2) {
		errors.push({ text: 'password not matched' });
	}

	if (!req.body.firstName) {
		errors.push({ text: 'First name should not be empty' });
	}

	if (!req.body.lastName) {
		errors.push({ text: 'Last name should not be empty' });
	}

	if (!req.body.avatar) {
		errors.push({ text: 'Profile picture should not be empty' });
	}

	if (!req.body.city) {
		errors.push({ text: 'City should not be empty' });
	}

	if (!req.body.bday) {
		errors.push({ text: 'Birth date should not be empty' });
	}

	if (errors.length > 0) {
		errors.forEach(errors => {
			console.log(errors.text);
			req.flash('error_msg', errors.text);
		});
		res.redirect('/register');
	} else {
		let username = req.body.username;
		let password = req.body.password;
		let firstName = req.body.firstName;
		let lastName = req.body.lastName;
		let email = req.body.email;
		let avatar = req.body.avatar;
		let city = req.body.city;
		let bday = req.body.bday;
		let newUser = new User({
			username: username,
			firstName: firstName,
			lastName: lastName,
			email: email,
			avatar: avatar,
			city: city,
			bday: bday
		});
		if (req.body.adminCode === 'secretcode123') {
			newUser.isAdmin = true;
		}
		User.register(newUser, password, (err, user) => {
			if (err) {
				req.flash('success_msg', err.message);
				res.redirect('/register');
			} else {
				passport.authenticate('local')(req, res, () => {
					req.flash(
						'success_msg',
						`Welcome to YelpCamp ${user.username}, nice to meet you..!!`
					);
					res.redirect('/campgrounds');
				});
			}
		});
	}
});

router.get("/login/1",function(req,res)
{
    req.flash("success_msg","Welcome To Yelpcamp!");
    res.redirect("/campgrounds");
});

router.get("/login/2",function(req,res)
{
    req.flash("error_msg","Wrong Username/Password!");
    res.redirect("/login");
});


//show login form
router.get('/login', (req, res) => {
	res.render('login');
});


//handling login logic
router.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: "/login/1",
		failureRedirect: "/login/2"
	}),
	(req, res) => {}
);

router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success_msg', 'LoggedOut Successfully, see you later..!!');
	res.redirect('/campgrounds');
});

// function isLoggedIn(req,res, next){
// 	if(req.isAuthenticated()){
// 		return next();
// 	}
// 	res.redirect("/login");
// }

//user profile
router.get('/users/:id', (req, res) => {
	User.findById(req.params.id, (err, foundUser) => {
		if (err) {
			req.flash('error_msg', 'Something went wrong');
			res.redirect('/');
		}
		Campground.find()
			.where('author.id')
			.equals(foundUser.id)
			.exec((err, campgrounds) => {
				if (err) {
					req.flash('error_msg', 'Something went wrong');
					res.redirect('/');
				}
				res.render('users/show', {
					user: foundUser,
					campgrounds: campgrounds
				});
			});
	});
});

router.get("/about", (req,res) => {
	res.render("about");
})

module.exports = router;