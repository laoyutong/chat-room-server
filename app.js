const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
server.listen(5008);

//存放用户列表`
let userList = []

io.on('connection', socket => {
    let storeName;
    socket.on('enter', userName => {
        if (userList.filter(userMsg => userMsg.userName === userName).length >= 1) {
            socket.emit('login', false)
        } else {
            storeName = userName
            socket.emit('login', true)
            userList.push({
                userName,
                socket
            })
            socket.broadcast.emit('userIn', userName)
        }
    });
    socket.on('msg', data => {
        socket.emit('msg', {
            to: data.to,
            from: storeName,
            content: data.content
        })
        if (data.to === '所有人') {
            socket.broadcast.emit('msg', {
                to: data.to,
                from: storeName,
                content: data.content
            })
        } else {
            for (let i = 0; i < userList.length; i++) {
                if (userList[i].userName === data.to) {
                    userList[i].socket.emit('msg', {
                        to: data.to,
                        from: storeName,
                        content: data.content
                    })
                }
            }
        }
    })
    socket.on('userList', () => {
        socket.emit('userList', userList.map(item => item.userName))
    })
    socket.on('disconnect', () => {
        for (let i = 0; i < userList.length; i++) {
            if (userList[i].userName === storeName) {
                socket.broadcast.emit('userOut', storeName)
                userList = userList.filter(item => item.userName !== storeName)
                storeName = ''
            }
        }
    })
});
