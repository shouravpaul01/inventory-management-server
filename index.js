const express=require('express')
require('dotenv').config();
const cors=require('cors')
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const app=express()
const port = process.env.PORT || 3000

//Import all routes
const category=require('./routes/category')
const subCategory=require('./routes/subCategory')
const product=require('./routes/product')

app.use(cors())
app.use(express.json())

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
app.use('/product',product)

app.get('/',(req,res)=>{
    res.send('Hello...Welcome')
})
app.listen(port,()=>{
    console.log(`The app listening on port ${port}`)
})
