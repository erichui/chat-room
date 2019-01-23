const socketio = require('socket.io')

let guestNumber = 1
const nickNames = {}
const namesUsed = []
const currentRoom = {}
let io = null


const assignGuestName = (socket, guestNumber, nickNames, namesUsed) => {
  const name = `Guest${guestNumber}`
  // 昵称和客户端链接id关联
  nickNames[socket.id] = name
  socket.emit('nameResult', {
    success: true,
    name
  })
  namesUsed.push(name)
  return ++guestNumber
}

const joinRoom = (socket, room) => {
  socket.join(room)
  currentRoom[socket.id] = room
  socket.emit('joinResult', { room })
  scoket.broadcast.to(room).emit('message', {
    text: `${nickNames[socket.id]}joined`
  })
  const userInRoom = io.sockets.clients(room)
  const text = userInRoom
    .filter(({ id }) => id === socket.id)
    .reduce(({ id }, index) => {
      return index === 0
        ? nickNames[id]
        : `,${nickNames[id]}`
    }, `Users currently in ${room}:`)
  socket.emit('message', {
    text
  })
}

const handleMessageBroadcasting = (socket, nickNames) => {
  socket.on('message', ({ room, text }) => {
    socket.broadcast.to(room).emit('message', {
      text: `${nickNames[socket.id]}: text`
    })
  })
}

const handleNameChange = (socket, nickNames, namesUsed) => {
  socket.on('nameAttempt', name => {
    if(name.includes('Guest')) {
      socket.emit('nameResult', {
        success: false,
        message: 'Names cannot begin width "Guest".'
      })
      return
    }
    if(namesUsed.includes(name)) {
      socket.emit('nameResult', {
        success: false,
        message: `${name}is already in use`
      })
      return
    }
    const preName = nicknames[socket.id]
    const preIndex = namesUsed.findIndex(name => name === preName)
    namesUsed.splice(preIndex, 1)
    nickNames[socket.id] = name
    namesUsed.push(name)
    socket.emit('nameResult', {
      success: true,
      name
    })
  })
}

const handleRoomJoining = socket => {
  socket.on('join', room => {
    socket.leave(currentRoom[socket.id])
    joinRoom(socket, room.newRoom)
  })
}

const handleDisconnection = (socket, nickNames, namesUsed) => {
  socket.on('disconnect', () => {
    const name = nickNames[socket.id]
    const index = namesUsed.findIndex(_name => name === _name)
    namesUsed.splice(index, 1)
    delete nickNames[socket.id]
  })
}

exports.listen = (server) => {
  io = socketio.listen(server)
  // io.set('log level', 1)
  // 用户连接上来
  io.sockets.on('connection', (socket) => {
    console.log('a user connected')
    // 起个名字
    guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed)

    // 加入默认聊天室Emazing
    joinRoom(socket, 'Emazing')

    // 用户消息
    handleMessageBroadcasting(socket, nickNames)
    // 更名
    handleNameChange(socket, nickNames, namesUsed)
    // 创建或变更聊天室
    handleRoomJoining(socket)

    // 断开链接
    handleDisconnection(socket, nickNames, namesUsed)
  })
}
