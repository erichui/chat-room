const http = require('http')
const fs = require('fs')
const path = require('path')
const mime = require('mime')
const chatServer = require('./lib/chat_server.js')
const cache = {}
const send404 = (res) => {
  res.writeHead(404, {
    'Content-Type': 'text/plain'
  })
  console.log('error')
  res.write('Error 404: resource not found')
  res.end()
}

const sendFile = (res, filePath, contents) => {
  res.writeHead(200, {
    'Content-Type': mime.getType(path.basename(filePath))
  })
  res.end(contents)
}

const serveStatic = (res, absPath) => {
  const cacheContent = cache[absPath]
  if(cacheContent) {
    sendFile(res, absPath, cacheContent)
  } else {
    fs.exists(absPath, exists => {
      if(exists) {
        fs.readFile(absPath, (err, data) => {
          if(err) {
            send404(res)
          } else {
            cache[absPath] = data
            sendFile(res, absPath, data)
          }
        })
      } else {
        send404(res)
      }
    })
  }
}

const server = http.createServer((req, res) => {
  const { url } = req
  console.log(req.url)
  const filePath = url === '/'
    ? 'public/index.html'
    : `public${url}`
  const absPath = `./${filePath}`
  serveStatic(res, absPath)
})
server.listen(8080, () => {
  console.log('server listening on port 8080')
})

// 启动socket.io服务器
// 并提供一个定义好的http服务器，这样他们就能共享同一个tcp/ip端口
chatServer.listen(server)
