import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken"
import Joi from 'joi'
Joi.objectId = require('joi-objectid')(Joi)

import restifyRouter from 'restify-router'
import messageDao from '../dao/mesage'

const Router = restifyRouter.Router
const mesageRoute = new Router()

mesageRoute.get({
    path: '/getConversations',
    validation: {
        schema: Joi.object().keys({
            query: Joi.object()
                .keys({
                    id: Joi.string().required(),
                    length: Joi.string().required(),
                })
                .required()
        })
    }
},
    async (req, res) => {
        // console.log(req.query, "hihihi")
        var userId = req.query.id
        var length = req.query.length
        var query = { userId, length }

        let result = await messageDao.readNumberOfCoversation(query);
        res.send(result);
    }
),
    mesageRoute.get({
        path: '/getMessages',
        validation: {
            schema: Joi.object().keys({
                query: Joi.object()
                    .keys({
                        senderId: Joi.string().required(),
                        receiverId: Joi.string().required(),
                        length: Joi.string().required(),
                        time: Joi.string(),

                    })
                    .required()
            })
        }
    },

        async (req, res) => {
            try {
                var senderId = req.query.senderId
                var receiverId = req.query.receiverId
                var length = req.query.length
                var time = req.query.time || "0"
                var query = { senderId, receiverId, length, time }
                // console.log(query, "query")

                let result = await messageDao.readNumberOfMessage(query)
                res.send(result);
            } catch (error) {
                console.log(error, "error")
            }

        },
    ),

    mesageRoute.post(
        {
            path: '',
            validation: {
                schema: Joi.object().keys({
                    body: Joi.object()
                        .keys({
                            senderId: Joi.string().required(),
                            senderName: Joi.string().required(),
                            receiverId: Joi.string().required(),
                            receiverName: Joi.string().required(),
                            content: Joi.string().required(),
                        })
                        .required()
                })
            }
        },
        async (req, res, next) => {
            try {
                const { senderId, senderName, receiverId, receiverName, content } = req.body
                let result = await messageDao.saveMessage({ senderId, senderName, receiverId, receiverName, content })
                res.send({ data: result })
            } catch (error) {
                res.send(error)
            }
        }
    )

export default mesageRoute
