const express = require('express')
const router = express.Router()
const userModel = require('../models/userModel')
const roleModel = require('../models/roleModel')

router.post('/', async (req, res) => {
    try {
        const findRole = await roleModel.findOne({ role: 'User' })
        console.log(findRole);
        const data = req.body
        data.role = findRole._id
        const result = new userModel(data)
        if (result) {
            await result.save()
            res.status(200).json({ code: 200, message: 'Successfully Register.' })
        }
    } catch (err) {

        if (err.email === 'MongoServerError' && err.code === 11000) {
            res.json({ code: 204, validationErrors: [{ field: 'email', message: 'Already exist the email.' }] })
        } else if (err.name === 'ValidationError') {
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
router.get('/', async (req, res) => {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const search = req.query.search
    console.log("object", search, req.query.search);
    try {
        const searchValue = {}
        if (search) {
            searchValue.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        }

        const totalCount = await userModel.countDocuments();
        const totalPages = Math.ceil(totalCount / pageSize);
        const data = await userModel.find(searchValue).skip((page - 1) * pageSize).limit(pageSize).populate('role');

        res.status(200).json({ data, totalPages })
    } catch (error) {
        res.status(500).json({ error: "There was a serser side error." })
    }


})
//user status updated by ID
router.patch('/update-status', async (req, res) => {
    console.log(req.query);

    try {
        const result = await userModel.findByIdAndUpdate(req.query._id, { status: req.query.status },
            { new: true }
        )
        res.status(200).json({ code: 200, message: "Successfully updated" })
    } catch (error) {
        console.log(error);
    }
})

// User deleted by specific id
router.delete('/:_id', async (req, res) => {

    try {
        await userModel.deleteOne({ _id: req.params._id })
        res.status(200).json({ code: 200, message: "Successfully Deleted" })
    } catch (error) {
        console.log(error);
    }
})
router.get('/details/:_id', async (req, res) => {

    try {
        const result = await userModel.findById(req.params._id)
        res.status(200).json(result)
    } catch (error) {
        console.log(error);
    }
})
router.get('/role/:_id', async (req, res) => {

    try {
        const result = await userModel.findById(req.params._id).select('role').populate('role')
        console.log(result);
        res.status(200).json(result)
    } catch (error) {
        console.log(error);
    }
})
router.post('/update-role', async (req, res) => {
    const { _id, role } = req.body

    try {
        const result = await userModel.findByIdAndUpdate(_id, { $set: { role: role } },
            { new: true },)
        console.log(result);
        res.status(200).json({ code: 200, message: 'Successfully set Roles' })
    } catch (error) {
        console.log(error);
    }
})
//check-approve-user
router.get('/check-approve-user', async (req, res) => {
    console.log(req.query.email);
    try {
        const result = await userModel.findOne({ email: req.query.email, status: true })
        console.log(result);
        if (result) {
            res.status(200).json(result)
        } else{
            res.status(201).json({error:"Invalid User."})
        }

    } catch (error) {
        res.status(500).json({ error: "There was a serser side error." })
    }


})
router.get('/all-approve-user', async (req, res) => {
    console.log(req.query.email);
    try {
        const result = await userModel.find({status: true })
        console.log(result);
        if (result) {
            res.status(200).json(result)
        } else{
            res.status(201).json({error:"Invalid User."})
        }

    } catch (error) {
        res.status(500).json({ error: "There was a serser side error." })
    }


})
//Get specific user where user role is admin
router.get('/admin-user', async (req, res) => {

    try {
        const data = await userModel.findOne({ email: req.query.email, role: "admin" })

        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({ error: "There was a serser side error." })
    }


})
//Get specific user where user role is claint
router.get('/teacher-user', async (req, res) => {

    try {
        const data = await userModel.findOne({ email: req.query.email, role: "teacher" })

        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({ error: "There was a serser side error." })
    }


})
module.exports = router