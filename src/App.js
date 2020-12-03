const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
const server = require('http').createServer(app)

// create instance
const io = require('socket.io')(server, {})
module.exports = io // export instance untuk bisa digunakan disetiap controller

io.on('connection', socket => {
  console.log('One user connected to server')
})

const { APP_PORT } = process.env

app.use(bodyParser.urlencoded({ extended: false }))
app.use(morgan('dev'))
app.use(cors())

// provide static file
app.use('/uploads', express.static('assets/uploads'))

const userRoute = require('./routes/user')
const authRoute = require('./routes/auth')
const messageRoute = require('./routes/message')
const contactRoute = require('./routes/contact')
const deviceRoute = require('./routes/device')

app.use('/auth', authRoute)
app.use('/users', userRoute)
app.use('/message', messageRoute)
app.use('/contact', contactRoute)
app.use('/device', deviceRoute)

app.get('/', (req, res) => {
  res.send({
    success: true,
    message: 'Backend is running'
  })
})

server.listen(APP_PORT, () => {
  console.log('listening on port ' + APP_PORT)
})
