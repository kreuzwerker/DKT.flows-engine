import moment from 'moment-timezone'
import settings from '../../settings'


/**
 * Returns UNIX timestamp from specified timezone. This is needed because AWS Lambda
 * Functions can run in different locations with different Timezones.
 * @param  {String} [timezone='Europe/Berlin'] Timezone indicator
 * @return {String}                            UNIX Timestamp
 */
export default function timestamp(timezone = settings.timezone) {
  return moment.tz(timezone).unix()
}
