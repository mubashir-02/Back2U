const express = require("express");
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const item = require("../models/item.js");
const multer = require('multer');


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