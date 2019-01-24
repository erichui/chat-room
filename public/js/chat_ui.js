const divEscapedContentElemetn = message => {
  return $('<div></div>').text(message)
}
const divSystemContentElemetn = message => {
  return $('<div></div>').html(`<i>${message}</i>`)
}
const processUserInput = (chatApp, socket) => {
  const message = $('#send-message').val()
  if(message.startsWith('/')) {
    const ret = chatApp.processCommand(message)
    if(ret) {
      $('#messages').append(divSystemContentElemetn(ret))
    }
  } else {
    chatApp.sendMessage($('#room-name').text(), message)
    $('#message').append(divEscapedContentElemetn(message))
    $('#message').scrollTop($('#message').prop('scrollHeight'))
  }
  $('#send-message').val('')
}

const socket = io.connect()
$(document).ready(() => {
  const chatApp = new Chat(socket)
  socket.on('nameResult', res => {
    const {
      success,
      message,
      name
    } = res
    const txt = success
      ? `you are now known as ${name}`
      : message

    $('#message').append(divSystemContentElemetn(txt))
  })

  socket.on('joinResult', ({ room }) => {
    console.log(room)
    $('#room-name').text(room)
    $('#message').append(divSystemContentElemetn('room changed'))
  })

  socket.on('message', message => {
    $('#message').append($('<div></div>').text(message.text))
  })

  socket.on('rooms', rooms => {
    $('#room-list').empty()
    rooms.filter(room => room.substring(1))
      .forEach(room => {
        $('#room-list').append(divEscapedContentElemetn(room))
      })
    $('#room-list div').click(function() {
      chatApp.processCommand(`/join${$(this).text()}`)
      $('#send-message').focus()
    })
  })
  setInterval(() => {
    socket.emit('rooms')
  }, 1000)
  $('#send-message').focus()
  $('#send-form').submit(() => {
    processUserInput(chatApp, socket)
    return false
  })
})
