mongoose = require('mongoose')

const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

const Article = new Schema({
 id:ObjectId,
 api_id: {type: Number, unique:true},
 author: String,
 title: String,
 url: String,
 date: Date,
 deleted: {type:Boolean, default:false}
});

mongoose.model('Article', Article)