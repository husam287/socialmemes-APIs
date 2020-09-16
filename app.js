const _DB_URL = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.r7yjj.gcp.mongodb.net/${process.env.MONGO_DB}`

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const fs=require('fs');

const helmet = require('helmet');

const morgan = require('morgan');
const logStreamFile=fs.createWriteStream(
  path.join(__dirname,'access.log'),
  {flags:'a'}
);

const compression=require('compression');

const app = express();

const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const memesRoutes = require('./routes/memes');

app.use(helmet());
app.use(morgan('combined',{stream:logStreamFile}) );
app.use(compression());

app.use(bodyParser.json());
app.use('/images',express.static(path.join(__dirname, 'images')));


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,PUT,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
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
    app.listen(process.env.PORT || 8080);
  })
  .catch(err => console.log(err));