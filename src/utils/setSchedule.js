import schedule from 'node-schedule'

/**
 * set schedule for specific function, run every day at specific time
 * @param {*} hour
 * @param {*} minute
 * @param {*} second
 * @param {*} callback
 */
export const setSchedule = (hour, minute, second, callback) => {
  global.sendEmailTask = schedule.scheduleJob(`${second} ${minute} ${hour} * * 0-7`, function() {
    callback()
  })
}

export const setScheduleEverySpecificMinute = (minute, callback) => {
  global.refresher = schedule.scheduleJob(`*/${minute} * * * *`, function() {
    callback()
  })
}
export const setScheduleEverySpecificSecond = (minute, callback) => {
  global.refresher = schedule.scheduleJob(`*/${minute} * * * * *`, function() {
    callback()
  })
}
