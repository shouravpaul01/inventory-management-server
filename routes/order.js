const express = require('express');
const userModel = require('../models/userModel');
const orderModel = require('../models/orderModel');
const accessoryModel = require('../models/accessoryModel');
const router = express.Router()

//User Route
router.post('/', async (req, res) => {
    try {
        const findRecentOrder = await orderModel.findOne({}, {}, { sort: { 'createdAt': -1 } });
        const lastInvoiceNo = findRecentOrder?.invoiceId ? findRecentOrder?.invoiceId?.split('-')[2] : 0;
        const invoiceId = `INV-${new Date().getFullYear()}${new Date().getSeconds()}-${Number(lastInvoiceNo) + 1}`;
        const findUser = await userModel.findOne({ email: req.body.userEmail })
        const newOrder = { invoiceId: invoiceId, userName: findUser.name, userEmail: findUser?.email, roomNo: findUser?.roomNo, accessories: req.body.accessories }

        req.body.accessories.map(async (accessory) => {
            const findAccessory = await accessoryModel.findById(accessory._id)
            findAccessory.currentQuantity = Number(findAccessory.currentQuantity) - Number(accessory.quantity)
            findAccessory.orderQuantity = Number(findAccessory.orderQuantity) + Number(accessory.quantity)
            await findAccessory.save()
        })


        const result = new orderModel(newOrder)
        if (result) {
            await result.save()
            res.status(200).json({ code: 200, message: 'Successfully Confirm Accessories.Pls wait for few min.' })
        }

    } catch (err) {
        console.log(err);
    }
    console.log('req.body');
})
//Get all order with the specific Email
router.get('/my-order', async (req, res) => {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const fromDate = req.query.fromDate
    const toDate = req.query.toDate
    const email = req.query.email

    try {
        const searchValue = {}
        if (fromDate && toDate) {
            searchValue.createdAt = {
                $gte: fromDate,
                $lte: toDate
            }
        }
        if (email) {
            searchValue.userEmail = email
        }
        console.log(searchValue);
        const totalCount = await orderModel.countDocuments();
        const totalPages = Math.ceil(totalCount / pageSize);
        const data = await orderModel.find(searchValue).skip((page - 1) * pageSize).limit(pageSize);

        res.status(200).json({ data, totalPages })
    } catch (error) {
        res.status(500).json({ error: "There was a serser side error." })
    }
})

//Admin Routes
router.get('/', async (req, res) => {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 5;
    const { fromDate, toDate } = JSON.parse(req.query.filterByDate) || { fromDate: null, toDate: null }
    const search = req.query.search
    try {
        const searchValue = {}
        if (fromDate && toDate) {
            searchValue.createdAt = {
                $gte: fromDate,
                $lte: toDate
            }
        }
        if (search) {
            searchValue.$or = [
                { userName: { $regex: search, $options: 'i' } },
                { userEmail: { $regex: search, $options: 'i' } },
                { invoiceId: { $regex: search, $options: 'i' } }
            ]
        }

        const totalCount = await orderModel.countDocuments();
        const totalPages = Math.ceil(totalCount / pageSize);
        const data = await orderModel.find(searchValue).skip((page - 1) * pageSize).limit(pageSize);

        res.status(200).json({ data, totalPages })
    } catch (error) {
        res.status(500).json({ error: "There was a serser side error." })
    }
})
router.patch('/update-approve-status', async (req, res) => {

    try {
        console.log(req.query);


        const result = await orderModel.findByIdAndUpdate(req.query._id, { approve: { status: req.query.approveStatus, email: req.query.email, date: new Date() } },
            { new: true }
        )
        console.log(result);
        res.status(200).json({ message: "Successfully updated" })
    } catch (error) {
        console.log(error);
    }
})
router.delete('/:_id', async (req, res) => {
    try {

        const findOrder = await orderModel.findById(req.params._id)
        if (findOrder) {
            findOrder?.accessories.filter(accessory => accessory.isItReturnable == 'Yes').map(async (accessory) => {
                const findAccessory = await accessoryModel.findById(accessory._id)
                findAccessory.quantityDetails.allCode = [...findAccessory.quantityDetails.allCode, ...accessory.allCode]
                findAccessory.currentQuantity = Number(findAccessory.currentQuantity) + Number(accessory.quantity)
                findAccessory.orderQuantity = Number(findAccessory.orderQuantity) - Number(accessory.quantity)
                await findAccessory.save()
            })
        }
        const result = await orderModel.deleteOne({ _id: req.params._id })
        res.json({ message: "Successfully deleted." })
    } catch (err) {
        console.log(err);
    }

})
router.post('/update-order-accessoryCode-deadline', async (req, res) => {
    console.log(req.body);
    const { orderId, accessoryId, deadline, allCode, quantity } = req.body
    try {
        const findAccessory = await accessoryModel.findById(accessoryId)
        const updateAccessoryCode = findAccessory.quantityDetails.allCode.filter(code => !allCode.includes(code))
        if (findAccessory) {
            findAccessory.quantityDetails.allCode = updateAccessoryCode
            await findAccessory.save()
        }

        const result = await orderModel.findOneAndUpdate({ _id: orderId, 'accessories._id': accessoryId, }, { $set: { 'accessories.$.deadline': deadline, 'accessories.$.allCode': allCode } },
            { new: true }
        )
        console.log(result);
        // console.log(findAccessory,updateAccessoryCode);
        res.status(200).json({ data: result, message: "Successfully Set Deadline" })
    } catch (error) {
        console.log(error);
    }
})
router.patch('/update-recieved-status/:_id', async (req, res) => {

    try {
        await orderModel.findByIdAndUpdate(req.params._id, { recievedOrder: { status: true } },
            { new: true }
        )
        res.status(200).json({ code: 200, message: "Successfully Recieved." })
    } catch (error) {
        console.log(error);
    }
})

router.get('/returnable-accessories/:_id', async (req, res) => {
    console.log(req.params._id);
    try {
        const result = await orderModel.findOne({ _id: req.params._id })

        const filterData = await Promise.all(result.accessories.filter(accessory => accessory.isItReturnable == 'Yes').map(async (accessory) => {
            //Find Data from accessory model by order id for all accessories code
            const findAccessory = await accessoryModel.findOne({ _id: accessory._id })
            return { ...accessory.toObject(), accessoryCode: findAccessory.quantityDetails.allCode }
        }))

        const updateResult = { ...result.toObject(), accessories: filterData }
        res.status(200).json({ code: 200, data: updateResult, message: "Successfully updated" })
    } catch (error) {
        console.log(error);
    }
})

router.patch('/update-accessories-returned-status', async (req, res) => {
    const { accessoriesId, orderId } = req.query
    const accessorieIdArray = accessoriesId.split(',')
    try {
        const findOrder = await orderModel.findById(orderId);
        findOrder.accessories.map(async (accessory) => {
            if (accessorieIdArray.includes(accessory._id.toString())) {
                accessory.returned = { status: true, date: new Date() };
                if (accessory.isItReturnable == 'Yes') {
                    const findAccessory = await accessoryModel.findById(accessory._id)
                    findAccessory.quantityDetails.allCode = [...findAccessory.quantityDetails.allCode, ...accessory.allCode]
                    findAccessory.currentQuantity=Number(findAccessory.currentQuantity)+Number(accessory.quantity)
                    findAccessory.orderQuantity=Number(findAccessory.orderQuantity)-Number(accessory.quantity)
                    await findAccessory.save()
                }
            }
        });
        const result = await findOrder.save()
        const filterData = result.accessories?.filter(accessorie => accessorie.isItReturnable == 'Yes')
        res.status(200).json({ code: 200, data: filterData, message: "Successfully Returned" })
    } catch (error) {
        console.log(error);
    }
})
router.patch('/update-recieved-accessories-date', async (req, res) => {
    console.log(req.body);
    const { accessoriesId, email, orderId } = req.body
    console.log(accessoriesId, email, orderId);
    try {
        const findOrder = await orderModel.findById(orderId);
        findOrder.accessories.forEach(obj => {
            if (accessoriesId.includes(obj._id.toString())) {
                obj.returned.recievedReturned = { email: email, status: true, date: new Date() };
            }
        });
        const result = await findOrder.save()
        const filterData = result.accessories?.filter(accessorie => accessorie.isItReturnable == 'Yes')
        res.status(200).json({ code: 200, data: filterData, message: "Successfully Recieved." })
    } catch (error) {
        console.log(error);
    }
})
router.get('/returned-all-accessories', async (req, res) => {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const fromDate = req.query.fromDate
    const toDate = req.query.toDate
    const search = req.query.search
    try {
        const searchValue = { approveStatus: true }
        if (fromDate && toDate) {
            searchValue.createdAt = {
                $gte: fromDate,
                $lte: toDate
            }
        }
        if (search) {
            searchValue.$or = [
                { userName: { $regex: search, $options: 'i' } },
                { userEmail: { $regex: search, $options: 'i' } },
                { invoiceId: { $regex: search, $options: 'i' } }
            ]
        }
        console.log(searchValue);
        const totalCount = await orderModel.countDocuments();
        const totalPages = Math.ceil(totalCount / pageSize);
        const data = await orderModel.find(searchValue).skip((page - 1) * pageSize).limit(pageSize);

        res.status(200).json({ data, totalPages })
    } catch (error) {
        res.status(500).json({ error: "There was a serser side error." })
    }
})
module.exports = router