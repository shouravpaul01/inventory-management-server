const express = require('express')
const productModel = require('../models/productModel');
const singleFileUpload = require('../middlewares/multer');
const fileUploadCloudinary = require('../utils/fileUploadCloudinary');
const deleteFileCloudinary = require('../utils/deleteFileCloudinary');
const router = express.Router()

router.post('/', singleFileUpload, async (req, res) => {


    try {
        const data = JSON.parse(req.body.newData)
        if (req.file) {
            const cloudinaryResult = await fileUploadCloudinary(req?.file?.path)
            data['image'] = { public_id: cloudinaryResult.public_id, url: cloudinaryResult.secure_url }
        }


        const newProduct = new productModel(data)
        await newProduct.save()
        res.status(200).json({ code: 200, message: 'Successfully added.' })
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
router.get('/', async (req, res) => {
    const page = Number(req?.query?.page) || 1
    const pageSize = Number(req?.query?.pageSize) || 5
    const search = req.query.search
    console.log('1');
    try {
        const searchValue = {}
        if (search) {
            console.log('2');
            searchValue.name = { $regex: search, $options: 'i' }
        }

        // if (!search && !req.query.page) {
        //     const data=await categoryModel.find(searchValue)
        //    return res.json({data})
        // } 
        const totalCount = await productModel.countDocuments()
        const totalPages = Math.ceil(totalCount / pageSize)

        const data = await productModel.find(searchValue).skip((page - 1) * pageSize).limit(pageSize).populate('category').populate('subCategory')
        res.json({ data, totalPages })

    } catch (err) {
        console.log(err);
    }

})
router.get('/all-active-product', async (req, res) => {
    const page = Number(req?.query?.page) || 1
    const pageSize = Number(req?.query?.pageSize) || 5
    const search = req.query.search
    const subCategories =req.query.subCategories 
    const categories = req.query.categories
    const returnStatus = req.query.returnStatus
    const categoriesArray =categories.split(',')
    const subCategoriesArray =subCategories.split(',')
   
    try {
        const searchValue = {}
        if (search) {
            console.log('2');
            searchValue.name = { $regex: search, $options: 'i' }
            searchValue.status='active'
            if (returnStatus) {
                searchValue.returnStatus=returnStatus
            }
            if (categories) {
                searchValue.category={ $in: categoriesArray }
            }
        }
        if (categories) {
            if (categories) {
                searchValue.category={ $in: categoriesArray }
            }
            if (subCategories) {
                searchValue.subCategory={ $in: subCategoriesArray }
            }
            if (returnStatus) {
                searchValue.returnStatus=returnStatus
            }
            searchValue.status='active'
        }
        if (returnStatus) {
            searchValue.returnStatus=returnStatus
            searchValue.status='active'
        }
        const totalCount = await productModel.countDocuments()
        const totalPages = Math.ceil(totalCount / pageSize)

        const data = await productModel.find(searchValue).skip((page - 1) * pageSize).limit(pageSize).populate('category').populate('subCategory')
        res.json({ data, totalPages })

    } catch (err) {
        console.log(err);
    }

})
router.delete('/:_id', async (req, res) => {
    try {
        const findProduct = await productModel.findById(req.params._id)
        if (findProduct) {
            await deleteFileCloudinary(findProduct.image.public_id)
        }
        const result = await productModel.deleteOne({ _id: req.params._id })
        res.json({ message: "Successfully deleted." })
    } catch (err) {
        console.log(err);
    }

})
router.patch('/update-status', async (req, res) => {

    try {
        const result = await productModel.findByIdAndUpdate(req.query._id, { status: req.query.status },
            { new: true }
        )
        res.status(200).json({ code: 200, message: "Successfully updated" })
    } catch (error) {
        console.log(error);
    }
})
router.get('/edit/:_id', async (req, res) => {
    try {
        const result = await productModel.findById(req.params._id).populate('category').populate('subCategory')
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
            const findData = await productModel.findById(data._id)
            await deleteFileCloudinary(findData?.image?.public_id)
            const cloudinaryResult = await fileUploadCloudinary(req?.file?.path)
            data['image'] = { public_id: cloudinaryResult.public_id, url: cloudinaryResult.secure_url }

        }
        console.log(data);
        const result = await productModel.findOneAndUpdate({ _id: data._id }, data,
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