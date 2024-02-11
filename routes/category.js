const express=require('express')
const router=express.Router()
const categoryModel=require('../models/categoryModel.js')

router.post('/',async(req,res)=>{
    try {
        const newCategory=new categoryModel(req.body)
        await newCategory.save()
        res.status(200).json({code:200,message:'Successfully added.'})
    } catch (err) {
        console.log(err);
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

router.get('/',async(req,res)=>{
    const page=Number(req?.query?.page) || 1
    const pageSize=Number(req?.query?.pageSize) || 5
    const search = req.query.search

    try {
        const searchValue = {}
        if (search) {
            searchValue.name = { $regex: search, $options: 'i' }
        }

        if (!search && !req.query.page) {
            const data=await categoryModel.find({status:'active'}).populate({
                path:'subcategories',
                match:{status:'active'}
            })
           return res.json({data})
        } 
        const totalCount=await categoryModel.countDocuments()
        const totalPages=Math.ceil(totalCount/pageSize)

        const data=await categoryModel.find(searchValue).skip((page-1)*pageSize).limit(pageSize)
        res.json({data,totalPages})
        
    } catch (err) {
        console.log(err);
    }
   
})
router.delete('/:_id',async(req,res)=>{
    try {
        const result=await categoryModel.deleteOne({ _id: req.params._id })
        res.json({message:"Successfully deleted."})
    } catch (err) {
        console.log(err);
    }
   
})
router.patch('/update-status', async (req, res) => {

    try {
        const result = await categoryModel.findByIdAndUpdate(req.query._id, { status: req.query.status },
            { new: true }
        )
        res.status(200).json({ code: 200, message: "Successfully updated" })
    } catch (error) {
        console.log(error);
    }
})
router.get('/edit/:_id',async(req,res)=>{
    try {
        const result=await categoryModel.findById(req.params._id)
        res.status(200).json(result)
        
    } catch (err) {
      console.log(err.message);  
    }
})
router.patch('/',async(req,res)=>{
    try {
        const result = await categoryModel.findByIdAndUpdate(req.body._id, { name: req.body.name },
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
module.exports=router