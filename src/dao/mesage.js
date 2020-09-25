import { messageModel, messageModel1 } from '../models/message'
import { date } from 'joi'

const message = {
    async updateReadMessage(query) {
        var { senderId, receiverId } = query;
        let result = await messageModel.findOne({ $and: [{ "users.userId": senderId }, { "users.userId": receiverId }] })
        result.numberUnreadMessage = 0;
        await messageModel.findOneAndUpdate({ $and: [{ "users.userId": senderId }, { "users.userId": receiverId }] }, result)
    }
    ,
    async readNumberOfCoversation(query) {
        var { userId, length } = query;
        let result = await messageModel.find({ "users.userId": userId }).sort({ updatedAt: -1 }).limit(parseInt(length))

        // GET ONLY 1 MESSAGE FORM LIST MESSAGE
        for (let index = 0; index < result.length; index++) {
            result[index].messages = [result[index].messages[0]]
        }

        return result
    },

    async readNumberOfMessage(query) {
        var { senderId, receiverId, length, time } = query;
        let result = await messageModel.findOne({ $and: [{ "users.userId": senderId }, { "users.userId": receiverId }] })
        if (result == null) return [];
        let numberUnreadMessage = result.numberUnreadMessage
        result = result.messages
        result.sort(function (a, b) { return new Date(b.time) - new Date(a.time) })
        let positon = -1;;
        for (let index = 0; index < result.length; index++) {
            console.log(result[index].time, " time ", time)
            if (result[index].time == time) { console.log("hihi", index); positon = index };
        }

        result = result.slice(positon + 1, positon + 1 + length)
        result = { numberUnreadMessage, listMessages: result }
        // if (time == "0") return result = [{ numberUnreadMessage }, ...result]
        return result
    },
    async saveMessage({ senderId, senderName, receiverId, receiverName, content }) {
        let chekExis = await messageModel.findOne({ $and: [{ "users.userId": senderId }, { "users.userId": receiverId }] })
        let chekExist = JSON.parse(JSON.stringify(chekExis))

        let result;
        if (chekExist == null) {
            var d = new Date();
            var time = d.toISOString();
            result = await messageModel.create({
                users: [{ userId: senderId, name: senderName }, { userId: receiverId, name: receiverName }],
                messages: [{ content, senderId, time }]
            })
        }
        else {
            var d = new Date();
            var time = d.toISOString();
            var addContent = new messageModel1({ content, senderId, time })
            addContent = JSON.parse(JSON.stringify(addContent))
            chekExist.messages = [...chekExist.messages, addContent]
            chekExist.numberUnreadMessage += 1;
            console.log(chekExist)
            result = await messageModel.findOneAndUpdate({ $and: [{ "users.userId": senderId }, { "users.userId": receiverId }] }, chekExist, {
                new: true
            })
        }
        return result
    },
}

export default message

