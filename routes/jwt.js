const express=require('express')
const router=express.Router()
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

router.post('/jwt-signin',async(req,res)=>{
    try {
        const findUser=await userModel.findOne({email:req.body.email,status:true}).populate('role')
        const allPermissions=[...new Set(findUser?.role?.flatMap(role => role.permissions))]
        const user={...findUser.toObject(),allPermissions:allPermissions}
        console.log(req.body.email);
        console.log(user,'findUser');
        const token=jwt.sign({
            rigths:allPermissions
        },process.env.JWT_SECRET,{ expiresIn: '1h' })
        res.json({token:token ,user:user}) 
    } catch (err) {
        console.log(err.message);
    }

})

module.exports=router