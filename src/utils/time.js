import moment from 'moment'

export function convertTimeZone2Number (tZ) {
  // Number (minutes)
  return (
    moment()
      .utcOffset(tZ)
      .utcOffset() / 60
  )
}
