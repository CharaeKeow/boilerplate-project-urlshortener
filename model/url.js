require('dotenv').config()
const mongoose = require('mongoose')
const shortid = require('shortid')

/** this project needs a db !! **/
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(res => {
    console.log('Connected to MongoDB')
  }).catch((err) => {
    console.log('Error connecting to MongoDB: ', err.message)
  })

//Schema
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: { 'type': String, 'default': shortid.generate }
})

//Export model to be used in server.js
module.exports = mongoose.model('Url', urlSchema) 