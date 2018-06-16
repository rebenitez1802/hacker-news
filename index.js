const express = require('express')
const app = express()
const mongoose = require('mongoose');
const axios = require('axios');
const url = require('url');
const schedule = require('node-schedule');
require('./models/article')

mongoose.connect('mongodb://localhost/test_database');

app.set('views', './views')
app.set('view engine', 'pug')
app.use('/static', express.static('static'));
app.locals.moment = require('moment');

app.get('/', function (req, res) {
  const params = url.parse(req.url, true);
  mongoose.model('Article').find({deleted:false}).sort('-date').exec((err, data)=>{
  	if(err)
  		res.send({err:err})
  	console.log(data.length)
  	res.render('index', { news: data, message: params.query.message, message_type: params.query.message_type});	
  })
  
});

app.get('/delete/:articleId', function(req, res){
	
	mongoose.model('Article').findOneAndUpdate({api_id:req.params.articleId},{deleted:true},(err,doc)=>{
		if(err){
			console.log(err)
			res.redirect('/?message='+err+'&message_type=error')
		}else{
			res.redirect('/?message=Article Deleted&message_type=success')
		}
	})
});

app.get('/load/',function(req,res){
	loadData().then((data)=>{
		res.send(data)
	},(err)=>{
		res.send(err)
	});
});


const loadData = ()=>{
	return new Promise((resolve,reject)=>{
		axios.get('https://hn.algolia.com/api/v1/search_by_date?query=nodejs').then((res)=>{
			
			var data = []
			const Article = mongoose.model('Article')
			
			
			var promises = []

			for (var i in res.data.hits) {
				console.log('trying to save '+res.data.hits[i].story_id)
				var obj = new Article()
				
				obj.api_id = res.data.hits[i].story_id
				obj.author = res.data.hits[i].author
				obj.title = res.data.hits[i].story_title !== null? res.data.hits[i].story_title:res.data.hits[i].title
				obj.url = res.data.hits[i].story_url !== null? res.data.hits[i].story_url:res.data.hits[i].url
				obj.date = new Date(res.data.hits[i].created_at)
				//console.log(id)
				data.push(obj)
				promises.push(Article.create(obj).catch((err)=>{
					return err
				}))
			}
			//resolve(data)
			Promise.all(promises).then((objList)=>{
				
				resolve(objList)	
			},(err)=>{
				console.log(err)
				reject(err)
			})
			
			
		})
	})
	
	

}

app.listen(3333, function () {
	console.log('The app is listening on port 3333!')
	var j = schedule.scheduleJob('0 * * * *', function(){
		console.log('Trying to update the Database')
	  loadData().then((data)=>{
			console.log(data)
		},(err)=>{
			console.log(err)
		});
	});
})