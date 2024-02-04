const express=require('express')
require('dotenv').config();
const cors=require('cors')
const mongoose = require('mongoose');
const app=express()
const port = process.env.PORT || 3000

const category=require('./routes/category')

app.use(cors())
app.use(express.json())

const dbConnection=async()=>{
    await mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.8sp76yj.mongodb.net/inventoryManagementDB?retryWrites=true&w=majority`);
    console.log('Successfully DB colnected');
}
dbConnection().catch(err=>console.log(err))


app.use('/category',category)

app.get('/',(req,res)=>{
    res.send('Hello...Welcome')
})
app.listen(port,()=>{
    console.log(`The app listening on port ${port}`)
})
