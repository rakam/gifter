const convertButton = document.getElementById('convertButton')
const loadingGif = document.getElementById('loadingGif')
const errorMsg = document.getElementById('errorMsg')
const focusMsg = document.getElementById('focusMsg')
const animatedImage = document.getElementById('resultGif')
const downloadButton = document.getElementById('downloadButton')
const urlInput = document.getElementById('url')

const urlRegex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/

let tweetId

convertButton.onclick = function () {
  let tweetUrl = urlInput.value.trim()
  if (urlRegex.test(tweetUrl)) {
    let lastSlashIdx = tweetUrl.lastIndexOf('/')
    tweetId = tweetUrl.substr(lastSlashIdx + 1)

    let request = new window.XMLHttpRequest()
    request.open('GET', 'http://localhost:3000/mp4url/' + tweetId, true)
    // request.open('GET', 'http://gifter.rakam.eu/mp4url/' + tweetId, true)

    request.onload = function () {
      if (request.status === 200) {
        let data = JSON.parse(request.responseText)
        getVideoInfos(
          data.mp4url,
          function (w, h, duration) {
            convertToGif(data.mp4url, w, h, duration)
          }
        )
      } else {
        loadingGif.style.display = 'none'
        let data = JSON.parse(request.responseText)
        errorMsg.innerText = data.message
        errorMsg.style.display = 'initial'
      }
    }

    request.onerror = function () {
      errorMsg.innerText = 'Error'
      errorMsg.style.display = 'initial'
      loadingGif.style.display = 'none'
    }

    loadingGif.style.display = 'initial'
    focusMsg.style.display = 'initial'
    animatedImage.style.display = 'none'
    downloadButton.style.display = 'none'
    errorMsg.style.display = 'none'
    request.send()
  }
}

function getVideoInfos (url, cb) {
  let video = document.createElement('video')
  video.className += ' mp4'
  video.autoplay = true
  video.oncanplay = function () {
    cb(this.offsetWidth, this.offsetHeight, this.duration)
    this.src = 'about:blank'
    document.body.removeChild(video)
  }
  document.body.appendChild(video)
  video.src = url
}

function convertToGif (mp4url, w, h, duration) {
  let fps = 12
  let numFrames = Math.floor(duration * fps)
  // The amount of time (10 = 1s) to stay on each frame
  let frameDuration = duration / numFrames
  // The amount of time (in seconds) to wait between each frame capture
  let interval = 1 / (fps + 1)
  console.log('duration: ' + duration)
  console.log('numFrames: ' + numFrames)
  console.log('interval: ' + interval)
  console.log('frameDuration: ' + frameDuration)
  console.log('gifDuration: ' + (numFrames * frameDuration))
  window.gifshot.createGIF({
    gifWidth: w,
    gifHeight: h,
    frameDuration: frameDuration,
    numFrames: numFrames,
    interval: interval,
    video: [mp4url]
  }, function (obj) {
    loadingGif.style.display = 'none'
    focusMsg.style.display = 'none'
    if (!obj.error) {
      animatedImage.src = obj.image
      downloadButton.onclick = function () {
        window.download(obj.image, tweetId + '.gif')
      }
      animatedImage.style.display = 'initial'
      downloadButton.style.display = 'initial'
    } else {
      console.log('conversion error', obj.error)
    }
  })
}
