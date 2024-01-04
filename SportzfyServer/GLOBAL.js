export let DATABASE
export const BOOKING_COLLECTION = 'Bookings'
export const OVERALL_COLLECTION = 'Overall'
export const SETTINGS_COLLECTION = 'Settings'

export function set_DATABASE(val) {
    DATABASE = val
}

export const asyncHandler = func => (req, res, next) => {
    func(req, res, next).catch(next);
}

// Checks if given password is valid
export function Authorize(req, accepted_passwords = []) {

    if (!("username" in req.headers))
        throw Error("No username provided! Identify yourself & try again")

    if (!accepted_passwords.includes(req.headers?.password))
        throw Error("Invalid Credentials! Try logging in again")
}

export function InvalidDb(msg = "Invalid Database") {
    this.collection = (...Args) => {
        throw new Error(msg)
    }
}


export function dateRange(startDate, endDate, steps = 1) {

    const compareEndDate = new Date(endDate.getTime());
    compareEndDate.setUTCHours(0, 0, 0, 0)

    let currentDate = new Date(startDate.getTime());
    currentDate.setUTCHours(0, 0, 0, 0)

    let pop_last = compareEndDate.getTime() === endDate.getTime()

    const dateArray = [];

    while (currentDate <= compareEndDate) {
        dateArray.push(new Date(currentDate.getTime()));
        currentDate.setUTCDate(currentDate.getUTCDate() + steps);
    }

    if (pop_last)
        dateArray.pop()

    return dateArray;
}

export const DATE_TIME_OPTIONS = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  }