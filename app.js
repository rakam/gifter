const express = require('express')
const app = express()
const Twitter = require('twitter')
const config = require('./config')

app.disable('x-powered-by')

const client = new Twitter({
  consumer_key: config.twitter.consumer_key,
  consumer_secret: config.twitter.consumer_secret,
  access_token_key: config.twitter.access_token_key,
  access_token_secret: config.twitter.access_token_secret
})

const params = {
  'include_entities': true,
  'tweet_mode': 'extended'
}

app.get('/mp4url/:tweetId', function (req, res) {
  if (req.params.tweetId) {
    client.get('statuses/show/' + req.params.tweetId, params, function (error, tweet, response) {
      if (!error &&
        tweet &&
        tweet.extended_entities &&
        tweet.extended_entities.media &&
        tweet.extended_entities.media.length > 0) {
        for (let media of tweet.extended_entities.media) {
          if (media.video_info &&
            media.video_info.variants &&
            media.video_info.variants.length > 0) {
            for (var variant of media.video_info.variants) {
              if (variant.content_type === 'video/mp4') {
                var mp4url = variant.url
                res.status(200).json({
                  mp4url: mp4url
                })
                console.log('mp4: ' + mp4url)
                return
              }
            }
          }
        }
        res.status(500).json({
          message: 'The tweet doesnt contain a video'
        })
      } else {
        res.status(500).json({
          message: 'Unkown error'
        })
      }
    })
  }
})

app.use(express.static('public'))

app.listen(config.port, function () {
  console.log('gifter-server listening on port ' + config.port)
})
