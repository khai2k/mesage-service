import { strict, date } from 'joi'

var mongoose = require('mongoose')
var user = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    }
})
var message = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    senderId: {
        type: String,
        required: true,
    },
    time: {
        type: String,
        required: true
    },
})

var messageSchema = new mongoose.Schema({
    users: [user],
    messages: [message],
    numberUnreadMessage: {
        type: Number,
        default: 0
    }
}, { timestamps: true })
export const messageModel = mongoose.model('message', messageSchema)
export const messageModel1 = mongoose.model('messagetest', message)



