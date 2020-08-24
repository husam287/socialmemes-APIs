const _DB_URL = "mongodb+srv://husam287:2871998@cluster0.r7yjj.gcp.mongodb.net/socialmemes"

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');


const app = express();

const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const memesRoutes = require('./routes/memes');



app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'images')));


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,PUT,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type', 'Authorization');
  next();

})


app.use('/users', authRoutes);

app.use('/posts',postsRoutes);

// app.use('memes',memesRoutes);



//################# ERROR HANDELER #################
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const errorData = error.data;
  res.status(status).json({ message: message, errorData: errorData });
});



//################# Db connect #################

mongoose
  .connect(
    _DB_URL
  )
  .then(result => {
    app.listen(8080);
  })
  .catch(err => console.log(err));