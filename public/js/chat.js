class Chat {
  constructor(socket) {
    this.socket = socket
  }
  sendMessage(room, text) {
    this.socket.emit('chatMessage', {
      room,
      text
    })
  }
  changeRoom(newRoom) {
    this.socket.emit('join', {
      newRoom
    })
  }
  processCommand(str) {
    const reg = /^\/(\w+)\s(.+)/
    const retArr = str.match(reg)
    const command = retArr[1]
    const info = retArr[2]
    let message = false
    switch(command) {
      case 'nick':
        console.log('nick')
        this.socket.emit('nameAttempt', info)
        break
      case 'join':
        this.changeRoom(info)
        break
      default:
        message = 'unrecognized command'
        break
    }
    return message
  }
}
