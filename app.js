const express = require("express");
const app = express();
const mongoose= require('mongoose');
const item = require("./models/item.js");
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const {itemSchema , reviewSchema } = require('./schema.js');
const Review = require("./models/review.js");
const multer = require('multer');


main()
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/items');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/'); // where images will be saved
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // unique file name
    }
});

const upload = multer({ storage: storage });
// Route to handle form submission with image upload
app.post('/items', upload.single('item[image]'), async (req, res) => {
    const newItem = new item(req.body.item);
    if (req.file) {
        newItem.image = '/uploads/' + req.file.filename; // save path to DB
    }
    await newItem.save();
    res.redirect('/items');
});

app.get("/",(req,res)=>{
    res.render("items/login");
});

//index route
app.get("/items",async(req,res)=>{
    const allItems = await item.find({});
    res.render("items/index",{allItems});  
});

//SEARCH ROUTE
app.get("/items/title", wrapAsync(async(req,res)=>{
  const {title} = req.query;
  const regex = new RegExp(title, 'i'); // 'i' for case-insensitive
  const allItems = await item.find({ title: regex });
  res.render("items/index",{allItems});
}));

//new route
app.get("/items/new",(req,res)=>{
    res.render("items/new")
});

//create route
app.post("/items",wrapAsync(async(req,res)=>{

    // itemSchema.validate(req.body);
    const newitem = new item(req.body.item);
    await newitem.save();
    res.redirect("/items");
}));

//show route
app.get("/items/:id",wrapAsync(async(req,res)=>{
  const {id} = req.params;
  const fnditem = await item.findById(id).populate("comments");
  res.render("items/show",{fnditem});
}));

//edit route
app.get("/items/:id/edit",wrapAsync(async(req,res)=>{
  const {id} = req.params;
  const fnditem = await item.findById(id);
  res.render("items/edit",{fnditem});
}));

//update route
app.put("/items/:id",wrapAsync(async(req,res)=> {
  const {id} = req.params;
  await item.findByIdAndUpdate(id,{...req.body.item});
  res.redirect(`/items/${id}`);
}));

//delete route
app.delete("/items/:id",wrapAsync(async(req,res)=> {
  const {id} = req.params;
  await item.findByIdAndDelete(id);
  res.redirect("/items");
}));

//REVIEWS
app.post("/items/:id/reviews",wrapAsync(async(req,res)=>{
  let Item = await item.findById(req.params.id);
  const newReview = new Review(req.body.review);
  Item.comments.push(newReview);
  await newReview.save();
  await Item.save();
  res.redirect(`/items/${Item._id}`,);

}));

//delete review
app.delete("/items/:id/reviews/:reviewId", wrapAsync(async (req, res)=>{
  let {id, reviewId} = req.params;
  await item.findByIdAndUpdate(id, {$pull: {comments: reviewId}});
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/items/${id}`);

}));



//error handling middleware
app.use((req, res, next) => {
  next(new ExpressError(404,'Page Not Found'));
});

//generic error handler
app.use((err, req, res, next) => {
  let {statusCode=500, message="Something went wrong"} = err;
  res.status(statusCode).render("items/error",{message});
  // res.status(statusCode).send(message);
});


app.listen(5000,()=>{
    console.log("Server is running on port 5000");
});
