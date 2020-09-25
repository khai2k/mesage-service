import { socketIoDevice, userStatus } from '../models/userStatus'

const userStatusDao = {
    async getListStatusUser() {
        let result = await userStatus.find({});
        return result;
    }
    ,
    async updateStatus({ userId, status, socketId }) {
        try {
            let result = await userStatus.findOne({ userId })
            if (result == null) return;
            result.status = status;
            result.socketId = socketId
            await userStatus.findOneAndUpdate({ userId }, result);
        } catch (error) {
            console.log(error, "error")
        }

    },
    async createStatusForUser({ name, userId }) {
        await userStatus.create({ name, userId, status: false })
    },
    async CheckaUserDisconnectAllDevice(socketId) {
        let result = await socketIoDevice.findOneAndRemove({ socketId })
        if (result == null) return;

        let { userId } = result;
        result = await userStatus.findOne({ userId })
        if (result == null) return;
        if (result.numberOfDevice == 1) result.status = false;
        result.numberOfDevice = result.numberOfDevice - 1

        await userStatus.findOneAndUpdate({ userId }, result)
        await socketIoDevice.findOneAndRemove({ socketId })
        if (result.numberOfDevice == 0) return true;
        return false
    },
    async CheckOnlineAndUpdateNumberOfDeviceOnline({ userId, socketId }) {
        let result = await userStatus.findOne({ userId })
        result.numberOfDevice = result.numberOfDevice + 1;
        await userStatus.findOneAndUpdate({ userId }, result)
        await socketIoDevice.create({ userId, socketId })
        if (result.numberOfDevice == 1) return false;
        return true;
    }

}

export default userStatusDao
