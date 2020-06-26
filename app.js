const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport 	= require("passport");
const LocalStrategy = require('passport-local');
const methodOverride = require('method-override');
const session = require('express-session');
const Campground = require('./models/campground');
const Comment = require('./models/comment');
const User 	= require("./models/user");
const seedDB = require('./seeds');
const moment = require('moment-timezone');
const flash = require('express-flash');
const dotenv = require('dotenv').config(); 

const commentRoutes = require("./routes/comments");
const campgroundRoutes = require("./routes/campgrounds");
const authRoutes = require("./routes/index");

// const uri = 'mongodb://localhost/yelp_camp';
// const uri = 'mongodb+srv://akshaysawant:akshays84@yelpcamp-cae0y.mongodb.net/YelpCamp?retryWrites=true&w=majority';
mongoose.connect(process.env.DATABASEURL, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
	console.log("mongodb connected");
})

app.set('view engine', 'ejs');


//css file addition
app.use(express.static(__dirname + "/public"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'));

//seeding database
// seedDB();



//passport configuration
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}))

app.use(flash());


//golabal variable 
app.use((req,res,next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  next()
})


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//user on all page means global decalration of user not on all routes
app.use((req,res, next) => {
	res.locals.currentUser = req.user;
	next();
})

console.log(moment(Comment.date).tz("Asia/Kolkata").format('MMMM Do YYYY, h:mm:ss a'));

app.use((req,res,next) => {
	app.locals.moment = require('moment-timezone');
	next();
})

//requiring routes
app.use("/", authRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);


app.get("*", (req,res) => {
	res.render("404");
})

app.listen(process.env.PORT, process.env.IP);

