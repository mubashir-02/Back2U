const mongoose= require('mongoose');
const initdata = require("./data.js");
const item = require("../models/item.js");



main()
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/items');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const initDB = async()=>{
    await item.deleteMany({});
    await item.insertMany(initdata.data);
}

initDB();