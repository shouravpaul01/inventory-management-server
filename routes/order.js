const express = require('express');
const userModel = require('../models/userModel');
const orderModel = require('../models/orderModel');
const router = express.Router()

//User Route
router.post('/', async (req, res) => {
    try {
        const findRecentOrder = await orderModel.findOne({},{},{ sort: { 'createdAt' : -1 } });
        const lastInvoiceNo=findRecentOrder?.invoiceId? findRecentOrder?.invoiceId?.split('-')[2]:0;
        const invoiceId = `INV-${new Date().getFullYear()}${new Date().getSeconds()}-${Number(lastInvoiceNo) + 1}`;
        const findUser = await userModel.findOne({ email: req.body.userEmail })
        const newOrder = { invoiceId: invoiceId, userName: findUser.name, userEmail: findUser?.email, roomNo: findUser?.roomNo, accessories: req.body.accessories }
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
    const fromDate = req.query.fromDate
    const toDate = req.query.toDate
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
        await orderModel.findByIdAndUpdate(req.query._id, { approveStatus: req.query.approveStatus },
            { new: true }
        )
        res.status(200).json({ code: 200, message: "Successfully updated" })
    } catch (error) {
        console.log(error);
    }
})
router.delete('/:_id',async(req,res)=>{
    try {
        const result=await orderModel.deleteOne({ _id: req.params._id })
        res.json({message:"Successfully deleted."})
    } catch (err) {
        console.log(err);
    }
   
})
router.patch('/update-order-deadline', async (req, res) => {
    console.log(req.query);
    const { orderId, accessorieId, date } = req.query
    try {
        const result = await orderModel.findOneAndUpdate({ _id: orderId, 'accessories._id': accessorieId }, { $set: { 'accessories.$.deadline': date } },
            { new: true }
        )
        console.log(result);
        res.status(200).json({ code: 200, data: result, message: "Successfully Set Deadline" })
    } catch (error) {
        console.log(error);
    }
})
router.patch('/update-recieved-status/:_id', async (req, res) => {

    try {
        await orderModel.findByIdAndUpdate(req.params._id, { recievedOrder: {status:true} },
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
        const result = await orderModel.findOne({ _id: req.params._id, 'accessories': { $elemMatch: { isItReturnable: 'Yes' } } })
        const filterData = result.accessories.filter(accessorie => accessorie.isItReturnable == 'Yes')
        result.accessories = filterData
        res.status(200).json({ code: 200, data: result, message: "Successfully updated" })
    } catch (error) {
        console.log(error);
    }
})

router.patch('/update-accessories-returned-status', async (req, res) => {
    const { accessoriesId, orderId } = req.query
    const accessorieIdArray = accessoriesId.split(',')
    try {
        const findOrder = await orderModel.findById(orderId);
        findOrder.accessories.forEach(obj => {
            if (accessorieIdArray.includes(obj._id.toString())) {
                obj.returned = { status: true, date: new Date() };
            }
        });
       const result= await findOrder.save()
       const filterData=result.accessories?.filter(accessorie=>accessorie.isItReturnable=='Yes')
        res.status(200).json({ code: 200, data: filterData, message: "Successfully Returned" })
    } catch (error) {
        console.log(error);
    }
})
router.patch('/update-recieved-accessories-date', async (req, res) => {
    console.log(req.body);
        const { accessoriesId,email, orderId } = req.body
       console.log(accessoriesId,email, orderId );
        try {
            const findOrder = await orderModel.findById(orderId);
            findOrder.accessories.forEach(obj => {
                if (accessoriesId.includes(obj._id.toString())) {
                    obj.returned.recievedReturned = {email:email, status: true, date: new Date() };
                }
            });
           const result= await findOrder.save()
           const filterData=result.accessories?.filter(accessorie=>accessorie.isItReturnable=='Yes')
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
        const searchValue = {approveStatus:true}
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