var app = require('express')()
// var server = require('http').Server(app)
// var io = require('socket.io')(server)
var https = require("https");
var fs = require("fs");

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "geniusandcourage.com");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var server = https
    .createServer(
        {
            key: fs.readFileSync("SSL KEY"),
            cert: fs.readFileSync("SSL CRT"),
        },
        app
    ).listen(3713)

var io = require('socket.io')(server)

app.get('/rooms', function (req, res) {
    var roomList = Object.keys(rooms).map(function (key) {
        return rooms[key]
    })
    res.send(roomList)
})

var rooms = {}

io.on('connection', function (socket) {

    socket.on('create_room', function (room) {
        if (!room.key) {
            return
        }
        console.log('create room:', room)
        var roomKey = room.key
        rooms[roomKey] = room
        socket.roomKey = roomKey
        socket.join(roomKey)
    })

    socket.on('close_room', function (roomKey) {
        console.log('close room:', roomKey)
        delete rooms[roomKey]
    })

    socket.on('disconnect', function () {
        console.log('disconnect:', socket.roomKey)
        if (socket.roomKey) {
            delete rooms[socket.roomKey]
        }
    })

    socket.on('join_room', function (roomKey) {
        console.log('join room:', roomKey)
        socket.join(roomKey)
    })

    socket.on('upvote', function (roomKey) {
        console.log('upvote:', roomKey)
        io.to(roomKey).emit('upvote')
    })

    socket.on('gift', function (data) {
        console.log('gift:', data)
        io.to(data.roomKey).emit('gift', data)
    })

    socket.on('comment', function (data) {
        console.log('comment:', data)
        io.to(data.roomKey).emit('comment', data)
    })

})

console.log('listening on port 3713...')
