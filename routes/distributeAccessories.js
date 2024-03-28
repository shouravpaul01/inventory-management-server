const express = require('express')
const router = express.Router()
const distributeModal = require('../models/distributeModal')
const { Promise } = require('mongoose')
const accessoryModel = require('../models/accessoryModel')

router.post('/', async (req, res) => {
    try {

        const formData = req.body
        formData.accessories.map(async (accessory) => {
            {
                //Find accessory form accessories document
                const findAccessory = await accessoryModel.findById(accessory._id)
                //Update accessory data
                findAccessory.quantityDetails.allCode = findAccessory.quantityDetails.allCode.filter(code => !accessory.allCode.includes(code))
                findAccessory.currentQuantity = Number(findAccessory.currentQuantity) - Number(accessory.quantity)
                findAccessory.distributedQuantity = Number(accessory.quantity)
                //Finally data updated and saved 
                await findAccessory.save()
            }
        })

        const findRecentDistributeAccessory = await distributeModal.findOne({}, {}, { sort: { 'createdAt': -1 } });
        const lastInvoiceNo = findRecentDistributeAccessory?.invoiceId ? findRecentDistributeAccessory?.invoiceId?.split('-')[2] : 0;
        const invoiceId = `INV-D${new Date().getFullYear()}${new Date().getSeconds()}-${Number(lastInvoiceNo) + 1}`;
        formData.invoiceId = invoiceId

        const isSaved = new distributeModal(req.body)
        await isSaved.save()
        res.status(200).json({ message: 'Successfully Distributed.' })
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {

            // Handle validation error
            const validationErrors = Object.keys(err.errors).map(field => ({
                field,
                message: err.errors[field].message,
            }));
            res.json({ code: 204, validationErrors: validationErrors })
        } else {
            // Handle other errors
            console.error('err', err.message);
        }
    }
})
router.get('/all-approve-distributed-accessoris-by-email', async (req, res) => {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 5;
    const {fromDate,toDate} =JSON.parse(req.query.filterByDate) || {fromDate:null,toDate:null}
    const search = req.query.search
    const email = req.query.email
    try {
        console.log(  fromDate,'fromdate1');
        const searchValue = {}
        if (email) {
            searchValue.$and = [
                { receiverEmail: email },
                { 'approve.status': true },
            ]

        }
        if (fromDate && toDate) {
            console.log('fromdate');
            searchValue.createdAt = {
                $gte: Date.parse(fromDate),
                $lte: Date.parse(toDate)
            }
        }
        if (search) {
            searchValue.$or = [
                { receiverName: { $regex: search, $options: 'i' } },
                { receiverEmail: { $regex: search, $options: 'i' } },
                { invoiceId: { $regex: search, $options: 'i' } },
                
            ]
            if (Number(search)) {
               searchValue.$or=[
                { "roomDetails.roomNo":Number(search)},
               ]
            }
        }
        console.log(searchValue);
        const totalCount = await distributeModal.countDocuments();
        const totalPages = Math.ceil(totalCount / pageSize);
        const data = await distributeModal.find(searchValue).skip((page - 1) * pageSize).limit(pageSize);
        // console.log(data);
        res.status(200).json({ data, totalPages })
    } catch (error) {
        res.status(500).json({ error: "There was a serser side error." })
    }
})
router.patch('/update-recieved-status/:distributedId', async (req, res) => {
console.log(req.params.distributedId,'dd');
    try {
        await distributeModal.findByIdAndUpdate(req.params.distributedId, { received: {status:true,date:new Date()} },
            { new: true }
        )
        res.status(200).json({ message: "Successfully Approved." })
    } catch (error) {
        console.log(error);
    }
})
//Admin Routes
router.get('/', async (req, res) => {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 5;
    const {fromDate,toDate} =JSON.parse(req.query.filterByDate) || {fromDate:null,toDate:null}
    const search = req.query.search
    try {
        const searchValue = {}
        if (fromDate && toDate) {
            searchValue.createdAt = {
                $gte: Date.parse(fromDate),
                $lte: Date.parse(toDate)
            }
        }
        if (search) {
            searchValue.$or = [
                { receiverName: { $regex: search, $options: 'i' } },
                { receiverEmail: { $regex: search, $options: 'i' } },
                { invoiceId: { $regex: search, $options: 'i' } },
            ]
            if (Number(search)) {
                searchValue.$or=[
                 { "roomDetails.roomNo":Number(search)},
                ]
             }
        }
        console.log(searchValue);
        const totalCount = await distributeModal.countDocuments();
        const totalPages = Math.ceil(totalCount / pageSize);
        const data = await distributeModal.find(searchValue).skip((page - 1) * pageSize).limit(pageSize);

        res.status(200).json({ data, totalPages })
    } catch (error) {
        res.status(500).json({ error: "There was a serser side error." })
    }
})
router.patch('/update-approve-status', async (req, res) => {

    try {
        await distributeModal.findByIdAndUpdate(req.query._id, { approve: { status: req.query.approveStatus, email: req.query.email, date: new Date() } },
            { new: true }
        )
        res.status(200).json({ message: "Successfully Approved." })
    } catch (error) {
        console.log(error);
    }
})
module.exports = router