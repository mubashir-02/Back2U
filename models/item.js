const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: String,
  number: Number,
  title:{
    type: String,
    required: true,
  },
  description: String,
  image: String, 
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review',

    },
  ],
  users : [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],

});

const item= mongoose.model('item', ItemSchema);
module.exports = item;
