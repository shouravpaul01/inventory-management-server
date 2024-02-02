const express=require('express')
require('dotenv').config();
const cors=require('cors')
const app=express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())


app.get('/',(req,res)=>{
    res.send('Hello...Welcome')
})
app.listen(port,()=>{
    console.log(`The app listening on port ${port}`)
})
