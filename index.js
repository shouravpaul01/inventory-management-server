const express=require('express')
require('dotenv').config();
const cors=require('cors')
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const app=express()
const port = process.env.PORT || 3000


app.use(cors())
app.use(express.json())

//Import all route
const category=require('./routes/category')
const subCategory=require('./routes/subCategory')
const accessory=require('./routes/accessory')
const user=require('./routes/user')
const jwt=require('./routes/jwt')
const role=require('./routes/role')
const order=require('./routes/order')
const distributeAccessories=require('./routes/distributeAccessories')
const returnedAccessories=require('./routes/returnedAccessories')



const dbConnection=async()=>{
    await mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.8sp76yj.mongodb.net/inventoryManagementDB?retryWrites=true&w=majority`);
    console.log('Successfully DB colnected');
}
dbConnection().catch(err=>console.log(err))

cloudinary.config({
    cloud_name:`${process.env.CLOUD_NAME}`,
    api_key:`${process.env.API_KEY}`,
    api_secret:`${process.env.API_SECRET}`
})


app.use('/category',category)
app.use('/sub-cat',subCategory)
app.use('/accessory',accessory)
app.use('/user',user)
app.use('/jwt',jwt)
app.use('/role',role)
app.use('/order',order)
app.use('/distribute-accessories',distributeAccessories)
app.use('/returned-accessories',returnedAccessories)

app.get('/',(req,res)=>{
    res.send('Hello...Welcome')
})
app.listen(port,()=>{
    console.log(`The app listening on port ${port}`)
})
