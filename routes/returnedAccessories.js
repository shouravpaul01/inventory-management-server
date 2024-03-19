const express=require('express')
const orderModel = require('../models/orderModel')
const router=express.Router()

router.post('/',async(req,res)=>{
    const {orderId} = req.query
    
    console.log(orderId,req.body);
    try {
     
        
        res.status(200).json({ code: 200, message: "Successfully Returned" })
    } catch (error) {
        console.log(error);
    }
})

module.exports=router