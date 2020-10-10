'use strict'

require('dotenv').config()
const Url = require('./model/url.js')
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const dns = require('dns')
//const url = require('url')
const options = {
  family: 6,
  hints: dns.ADDRCONFIG | dns.V4MAPPED
}

// Basic Configuration 
const port = process.env.PORT || 3000

app.use(cors())

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: false }))

app.post('/api/shorturl/new', (req, res) => {
  let input;
  let error = false
  try {
    input = new URL(req.body.url) //use url.hostname to only look for the hostname part of url
  } catch (err) {
    res.json({ error: 'invalid URL' })
    error = true
  } finally {
    if (!error) {
      dns.lookup(input.hostname, options, (err, address, family) => {
        if (err) {
          res.json({ error: 'invalid URL' })
        } else {
          console.log('address: %j family: IPv%s', address, family)

          //search db first to check if already exist
          let exist = false
          Url.exists({ original_url: input }, (err, result) => {
            if (err) {
              console.log(err)
            }

            if (result) {
              Url.findOne({ original_url: input }).exec((err, data) => {
                if (err) console.log(err)
                console.log('Exist')
                res.json({ original_url: data.original_url, short_url: data.short_url })
              })
            } else {
              Url.create({ original_url: input }, (err, data) => {
                if (err) console.log(err)
                console.log('Not exist')
                res.json({ original_url: data.original_url, short_url: data.short_url })
              })
            }
          })

          /*
          if (!exist) {
            Url.create({ original_url: input }, (err, data) => {
              if (err) console.log(err)
              console.log('Not exist')
              res.json({ original_url: data.original_url, short_url: data.short_url })
            })
          } else {
            Url.findOne({ original_url: input }).exec((err, data) => {
              if (err) console.log(err)
              console.log('Exist')
              res.json({ original_url: data.original_url, short_url: data.short_url })
            })
          } */
        }
      })
    }
  }
})


app.get('/api/shorturl/:short_url', (req, res) => {
  Url.findOne({ short_url: req.params.short_url }).then((err, res) => {
    if (err) console.log(err)
    console.log(res.length)
    //res.redirect(res)
  })
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