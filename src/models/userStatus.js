import { boolean } from 'joi'

var mongoose = require('mongoose')

var userStatusSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        required: true
    },
    numberOfDevice: {
        type: Number,
        default: 0
    }
})
var socketIoDeviceSchema = new mongoose.Schema({
    socketId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
})
export const userStatus = mongoose.model('userStatus', userStatusSchema)
export const socketIoDevice = mongoose.model('socketIoDevice', socketIoDeviceSchema)

