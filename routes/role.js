const express=require('express')
const roleModel = require('../models/roleModel')
const router=express.Router()

router.post('/',async(req,res)=>{
    try {
        const isSaved=new roleModel(req.body)
        await isSaved.save()
        res.status(200).json({code:200,message:'Successfully added.'})
    } catch (err) {
        console.log(err);
        if (err.name === 'MongoServerError' && err.code === 11000) {
            console.log('2');
            res.json({ code: 204, validationErrors: [{ field: 'role', message: 'Already exist the Role.' }] })
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
        if (search  && req.query.page) {
            searchValue.role = { $regex: search, $options: 'i' }
        }
        if (!search && !req.query.page) {
            const data=await roleModel.find({})
            return res.json(data)
        }
       
        console.log(searchValue);
        const totalCount=await roleModel.countDocuments()
        const totalPages=Math.ceil(totalCount/pageSize)

        const data=await roleModel.find(searchValue).skip((page-1)*pageSize).limit(pageSize)
        res.json({data,totalPages})
        
    } catch (err) {
        console.log(err);
    }
   
})
router.delete('/:_id',async(req,res)=>{
    try {
        await roleModel.deleteOne({ _id: req.params._id })
        res.json({message:"Successfully deleted."})
    } catch (err) {
        console.log(err);
    }
   
})
router.get('/edit/:_id',async(req,res)=>{
    try {
        const result=await roleModel.findById(req.params._id)
        res.status(200).json(result)
        
    } catch (err) {
      console.log(err.message);  
    }
})
router.patch('/',async(req,res)=>{
    try {
        await roleModel.findByIdAndUpdate(req.body._id, req.body,
            { new: true }
        )
        res.status(200).json({ code: 200, message: "Successfully updated" })
    } catch (err) {
        if (err.name === 'MongoServerError' && err.code === 11000) {
            console.log('2');
            res.json({ code: 204, validationErrors: [{ field: 'role', message: 'Already exist the name.' }] })
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