//Stuffs by Sambhav
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').load();

const app = express();
app.use(bodyParser.json());

/////Mongo////////
//Mongo Setup
const mongoose = require('mongoose');
const mongoURL = process.env.DB_URI;
mongoose.connect(mongoURL);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
// db error handling
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
//Mongo DB initialization
const imageSchema = new mongoose.Schema({
  awsKey: String,
  title: String,
  ownerId: String 
});
const userSchema = new mongoose.Schema({
  username: String
});
const imgColl = mongoose.model('ImageModel',imageSchema);
const userColl = mongoose.model('UserModel',userSchema);
/////////////////

// View Endpoints
app.set('views', './views');
app.set('view engine', 'pug');
app.use('/static', express.static('public'));

app.get('/', (req, res) => {
  let allpics = [];
  allpics.push({
    title: 'Cat',
    imgSrc: 'http://www.catster.com/wp-content/uploads/2017/08/A-fluffy-cat-looking-funny-surprised-or-concerned.jpg'
  });
  allpics.push({
    title: 'Dog',
    imgSrc: 'https://www.cesarsway.com/sites/newcesarsway/files/styles/large_article_preview/public/Common-dog-behaviors-explained.jpg?itok=FSzwbBoi'
  });
  res.render('index', {images: allpics});
});

// API Endpoints
app.post("/api/newuser",(req,res) => {
  let username = req.body.username;
  let newUser = new userColl({
    'username': username,
  });
  newUser.save();
  res.send('User ' + username + ' has been added.'); 
});

app.post("/api/newpic",(req,res,next)=>{
  let awsKey = req.body.awsKey;
  let title = req.body.title;
  let username = req.body.username;
  userColl.findOne({'username':username}).then(
    user => {
      let ownerId = user._id;
      console.log(ownerId);
      let newPic = new imgColl({
        'awsKey': awsKey,
        'title': title,
        'ownerId': ownerId
      });
      newPic.save();
      res.send("New picture, entitled '" + title + "' has been saved."); 
    },
    error => {console.log(error);}
  );
});

app.get("/api/allpics",(req,res) => {
  let username = req.query.username;
  userColl.findOne({'username':username}).then(
    user => {
      let userId = user._id;
      imgColl.find({'ownerId':userId}).then(
        images => { 
          let imageKeys = [];
          images.forEach(image => imageKeys.push(image.awsKey));
          res.send(imageKeys);
        }, error => {console.log(error)});
    },
    error => {console.log(error)});
});

app.listen(process.env.PORT);
console.log('Server running on port ' + process.env.PORT);
