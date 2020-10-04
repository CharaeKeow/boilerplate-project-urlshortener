'use strict'

require('dotenv').config()
const express = require('express')
const mongo = require('mongodb')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const dns = require('dns')
//const url = require('url')
const options = {
  family: 6,
  hints: dns.ADDRCONFIG | dns.V4MAPPED
}

const cors = require('cors')

const app = express()

// Basic Configuration 
const port = process.env.PORT || 3000

/** this project needs a db !! **/
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
  console.log('DB connected!')
})

//Schema
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
})

app.use(cors())

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: false }))

app.post('/api/shorturl/new', (req, res) => {
  let url;
  let error = false
  try {
    url = new URL(req.body.url) //use url.hostname to only look for the hostname part of url
  } catch (err) {
    res.json({ error: 'invalid URL' })
    error = true
  } finally {
    if (!error) {
      dns.lookup(url.hostname, options, (err, address, family) => {
        if (err) {
          res.json({ error: 'invalid URL' })
        } else {
          console.log('address: %j family: IPv%s', address, family)
          res.json({ original_url: url })
        }
      })
    }
  }
})

app.use('/public', express.static(process.cwd() + '/public'))

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html')
})


// your first API endpoint... 
app.get("/api/hello", (req, res) => {
  res.json({ greeting: 'hello API' })
});


app.listen(port, () => {
  console.log(`Node.js listening on https://localhost:${port}`)
});