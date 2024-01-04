import { Router } from "express";
import { Authorize, BOOKING_COLLECTION, DATABASE, DATE_TIME_OPTIONS, asyncHandler } from "../GLOBAL.js"
import { ObjectId } from "mongodb";

export const AREA_TYPE = {
    "turf": "turf",
    "lawn": "lawn",
    "both": "both"
}

function year_month_string(date) {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}
function set_monthly_data(monthly_data, id, startDate, endDate) {

    let currentDate = new Date(startDate);
    currentDate.setUTCHours(0, 0, 0, 0)

    const compareEndDate = new Date(endDate);
    compareEndDate.setUTCHours(0, 0, 0, 0)

    while (currentDate <= compareEndDate) {

        const key = year_month_string(currentDate)

        if (!(key in monthly_data))
            monthly_data[key] = {}


        if (!(currentDate.getUTCDate() in monthly_data[key]))
            monthly_data[key][currentDate.getUTCDate()] = []

        monthly_data[key][currentDate.getUTCDate()].push(id)

        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }


    // Pop last if at exactly 12:00am
    if (compareEndDate.getTime() === new Date(endDate).getTime()) {
        currentDate.setUTCDate(currentDate.getUTCDate() - 1);

        const key = year_month_string(currentDate)
        monthly_data[key][currentDate.getUTCDate()].pop()

        if (monthly_data[key].length == 0)
            delete monthly_data[key]
    }


}
async function check_clashing(area, from, till, _id = "") {

    console.log("from.getTime()=>", from.getTime())
    console.log("till.getTime()=>", till.getTime())

    if (from.getTime() === till.getTime())
        return {
            area: "self",
            from,
            till
        }

    // check clash in ids
    const clashing_result = await DATABASE.collection(BOOKING_COLLECTION).find({
        "from": {
            "$lte": till.toISOString()
        },
        "till": {
            "$gte": from.toISOString()
        }
    }, {
        "$project": {
            _id: 1,
            from: 1,
            till: 1
        }
    })

    for await (const doc of clashing_result) {
        doc.from = new Date(doc.from)
        doc.till = new Date(doc.till)

        if (area != AREA_TYPE.both)
            if (doc.area != area && doc.area != AREA_TYPE.both)
                continue;

        if (doc.from < till && from < doc.till && doc._id.toString() != _id) // check if dates overlap
            return {
                area: doc.area,
                from: doc.from,
                till: doc.till
            }
    }

    return false
}
async function add_update_checking(data, _id = "") {

    if (data.from > data.till)
        [data.from, data.till] = [data.till, data.from]

    const clash_status = await check_clashing(data.area, new Date(data.from), new Date(data.till), _id)

    // Check clashing
    if (clash_status)
        throw new Error(`Booking is clashing with\n\nArea:${clash_status.area}\nFrom:${clash_status.from.toLocaleString('en-nz', DATE_TIME_OPTIONS)}\nTill:${clash_status.till.toLocaleString('en-nz', DATE_TIME_OPTIONS)}\n\nPlease refresh and try again!`)

}


const BookingRouter = Router()

BookingRouter.post("/check_clash", asyncHandler(async (req, res) => {  // Add Booking to Database

    Authorize(req, [process.env.MASTER_PASSWORD, process.env.DEV_PASSWORD])

    let area = req.body.area
    let from = new Date(req.body.from)
    let till = new Date(req.body.till)

    let clashing = await check_clashing(area, from, till)

    res.json({
        is_valid: true,
        is_clashing: Boolean(clashing),
        data: clashing
    })

}))

BookingRouter.post("/add", asyncHandler(async (req, res) => {  // Add Booking to Database

    Authorize(req, [process.env.MASTER_PASSWORD, process.env.DEV_PASSWORD])

    await add_update_checking(req.body.data)

    // Add booking
    let insert_result = await DATABASE.collection(BOOKING_COLLECTION).insertOne(req.body.data)
    console.log("/add, insert response=>", insert_result)

    res.json({
        is_valid: true,
        _id: insert_result?.insertedId
    })

}));

BookingRouter.patch("/update", asyncHandler(async (req, res) => {  // Add Booking to Database

    Authorize(req, [process.env.MASTER_PASSWORD, process.env.DEV_PASSWORD])

    await add_update_checking(req.body.data, req.body.id)

    // Update booking
    let update_result = await DATABASE.collection(BOOKING_COLLECTION).updateOne({ "_id": new ObjectId(req.body.id) }, { $set: req.body.data })
    console.log("/update, update response=>", update_result)

    res.json({
        is_valid: true
    })
}));

BookingRouter.delete("/delete", asyncHandler(async (req, res) => {  // Add Booking to Database

    Authorize(req, [process.env.MASTER_PASSWORD, process.env.DEV_PASSWORD])

    let delete_result = await DATABASE.collection(BOOKING_COLLECTION).deleteOne({ "_id": new ObjectId(req.body.id) })
    console.log("/delete, delete response=>", delete_result)

    res.json({
        is_valid: true
    })
}));

BookingRouter.get("/", asyncHandler(async (req, res) => {  // Add Booking to Database

    if (!("month" in req.query) || !("year" in req.query))
        throw new Error("URL query must contain month & year!")

    let monthly_data = {}
    let booking_data = {}

    const start_date = new Date(Date.UTC(parseInt(req.query.year), parseInt(req.query.month), 1)).toISOString()
    const end_date = new Date(Date.UTC(parseInt(req.query.year), parseInt(req.query.month) + 1, 1)).toISOString()

    let cursor = await DATABASE.collection(BOOKING_COLLECTION).find({
        "from": {
            "$lte": end_date
        },
        "till": {
            "$gte": start_date
        }
    })

    for await (const doc of cursor) {

        const id = doc._id.toString()
        delete doc._id

        booking_data[id] = doc
        set_monthly_data(monthly_data, id, doc.from, doc.till)
    }

    res.json({
        is_valid: true,
        monthly_data: monthly_data,
        booking_data: booking_data
    })
}));

export default BookingRouter