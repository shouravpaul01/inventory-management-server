const express = require('express')
const accessoryModel = require('../models/accessoryModel');
const singleFileUpload = require('../middlewares/multer');
const fileUploadCloudinary = require('../utils/fileUploadCloudinary');
const deleteFileCloudinary = require('../utils/deleteFileCloudinary');
const { generateAccessoryUniqueCode } = require('../utils/utils');
const router = express.Router()

router.post('/', singleFileUpload, async (req, res) => {


    try {
        const formData = JSON.parse(req.body.newData)
        const accessoryCode = formData.isItReturnable=='Yes'?generateAccessoryUniqueCode(1, formData.codeTitle.toUpperCase(), Number(formData.quantity)):[]
        formData['quantityDetails'] = { totalQuantity: Number(formData.quantity), allCode: accessoryCode, allQuantity: { quantity: Number(formData.quantity), code: accessoryCode, date: new Date() } }
        formData['currentQuantity'] = Number(formData.quantity)
        formData['orderQuantity'] = 0
        formData['codeTitle'] = formData.codeTitle.toUpperCase()

        console.log(formData, 'formData');
        console.log(accessoryCode, 'accessoryCode');
        if (req.file) {
            const cloudinaryResult = await fileUploadCloudinary(req?.file?.path)
            formData['image'] = { public_id: cloudinaryResult.public_id, url: cloudinaryResult.secure_url }
        }


        const isSaved = new accessoryModel(formData)
        await isSaved.save()
        res.status(200).json({ message: 'Successfully added.' })
    } catch (err) {

        if (err.name === 'MongoServerError' && err.code === 11000) {
            console.log('2');
            res.status(201).json({ validationErrors: [{ field: 'name', message: 'Already exist the name.' }] })
        } else if (err.name === 'ValidationError') {

            // Handle validation error
            const validationErrors = Object.keys(err.errors).map(field => ({
                field,
                message: err.errors[field].message,
            }));
            res.status(201).json({ validationErrors: validationErrors })
        } else {
            // Handle other errors
            console.error('err', err.message);
        }
    }
})
router.get('/', async (req, res) => {
    const page = Number(req?.query?.page) || 1
    const pageSize = Number(req?.query?.pageSize) || 5
    const { fromDate, toDate } = JSON.parse(req.query.filterByDate) || { fromDate: null, toDate: null }
    const search = req.query.search
    console.log('1');
    try {
        const searchValue = {}
        if (search) {
            searchValue.name = { $regex: search, $options: 'i' }
        }
        if (fromDate && toDate) {
            searchValue.createdAt = {
                $gte: Date.parse(fromDate),
                $lte: Date.parse(toDate)
            }
        }


        const totalCount = await accessoryModel.countDocuments()
        const totalPages = Math.ceil(totalCount / pageSize)

        const data = await accessoryModel.find(searchValue).skip((page - 1) * pageSize).limit(pageSize).populate('category').populate('subCategory')
        res.json({ data, totalPages })

    } catch (err) {
        console.log(err);
    }

})
router.get('/all-active-product', async (req, res) => {
    const page = Number(req?.query?.page) || 1
    const pageSize = Number(req?.query?.pageSize) || 5
    const search = req.query.search
    const subCategories = req.query.subCategories
    const categories = req.query.categories
    const isItReturnable = req.query.isItReturnable
    const categoriesArray = categories.split(',')
    const subCategoriesArray = subCategories.split(',')

    try {
        const searchValue = { status: true }
        if (search) {
            searchValue.name = { $regex: search, $options: 'i' }
            if (isItReturnable) {
                searchValue.isItReturnable = isItReturnable
            }
            if (categories) {
                searchValue.category = { $in: categoriesArray }
            }
        }
        if (categories) {
            if (categories) {
                searchValue.category = { $in: categoriesArray }
            }
            if (subCategories) {
                searchValue.subCategory = { $in: subCategoriesArray }
            }
            if (isItReturnable) {
                searchValue.isItReturnable = isItReturnable
            }
        }
        if (isItReturnable) {
            searchValue.isItReturnable = isItReturnable
        }
        console.log(searchValue);
        const totalCount = await accessoryModel.countDocuments()
        const totalPages = Math.ceil(totalCount / pageSize)

        const data = await accessoryModel.find(searchValue).skip((page - 1) * pageSize).limit(pageSize).populate('category').populate('subCategory')
        res.json({ data, totalPages })

    } catch (err) {
        console.log(err);
    }

})
router.delete('/:_id', async (req, res) => {
    try {
        const findAccessorie = await accessoryModel.findById(req.params._id)
        if (findAccessorie) {
            await deleteFileCloudinary(findAccessorie.image.public_id)
        }
        const result = await accessoryModel.deleteOne({ _id: req.params._id })
        res.json({ message: "Successfully deleted." })
    } catch (err) {
        console.log(err);
    }

})
router.patch('/update-status', async (req, res) => {

    try {
        await accessoryModel.findByIdAndUpdate(req.query._id, { status: req.query.status },
            { new: true }
        )
        res.status(200).json({ code: 200, message: "Successfully updated" })
    } catch (error) {
        console.log(error);
    }
})
router.patch('/update-quantity', async (req, res) => {
    const { _id, quantity } = req.query

    try {

        const findAccessory = await accessoryModel.findOne({ _id: _id })
        const totalQuantity = Number(findAccessory.quantityDetails.totalQuantity)
        const currentQuantity = Number(findAccessory.currentQuantity)
        const formQuantity = Number(quantity)
        const codeGenerate = generateAccessoryUniqueCode(totalQuantity, findAccessory.codeTitle, formQuantity)

        //Added more quantity
        findAccessory['quantityDetails'] = {
            //Update Total Quantity
            totalQuantity: totalQuantity + formQuantity,
            allCode: [...findAccessory.quantityDetails.allCode, ...codeGenerate],
            allQuantity: [...findAccessory.quantityDetails.allQuantity, { quantity: formQuantity, code: codeGenerate, date: new Date() }]
        }
        //Update Current Quantity
        findAccessory['currentQuantity'] = currentQuantity + formQuantity

        await findAccessory.save()
        res.status(200).json({ message: "Successfully Added More Quantity." })
    } catch (error) {
        console.log(error);
    }
})
router.get('/edit/:_id', async (req, res) => {

    try {
        const result = await accessoryModel.findById(req.params._id).populate('category').populate('subCategory')
        res.status(200).json(result)

    } catch (err) {
        console.log(err.message);
    }
})
router.patch('/', singleFileUpload, async (req, res) => {

    try {
        const data = JSON.parse(req.body.newData)
        const file = req.file
        if (!file) {
            delete data['image']
        }
        if (file) {
            const findData = await accessoryModel.findById(data._id)
            await deleteFileCloudinary(findData?.image?.public_id)
            const cloudinaryResult = await fileUploadCloudinary(req?.file?.path)
            data['image'] = { public_id: cloudinaryResult.public_id, url: cloudinaryResult.secure_url }

        }
        console.log(data);
        const result = await accessoryModel.findOneAndUpdate({ _id: data._id }, data,
            { new: true }
        )
        res.status(200).json({ code: 200, message: "Successfully updated" })
    } catch (err) {
        if (err.name === 'MongoServerError' && err.code === 11000) {
            console.log('2');
            res.json({ code: 204, validationErrors: [{ field: 'name', message: 'Already exist the name.' }] })
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

module.exports = router