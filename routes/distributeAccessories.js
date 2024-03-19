const express = require('express')
const router = express.Router()
const distributeModal = require('../models/distributeModal')
const { Promise } = require('mongoose')
const accessoryModel = require('../models/accessoryModel')

router.post('/', async (req, res) => {
    try {

        const formData = req.body
        formData.accessories.map(async (accessory) => {
            {
                //Find accessory form accessories document
                const findAccessory = await accessoryModel.findById(accessory._id)
                //Update accessory data
               findAccessory.quantityDetails.allCode=findAccessory.quantityDetails.allCode.filter(code => !accessory.allCode.includes(code))
               findAccessory.currentQuantity=Number(findAccessory.currentQuantity)-Number(accessory.quantity)
               findAccessory.distributeQuantity=Number(accessory.quantity)
               //Finally data updated and saved 
                await findAccessory.save()
            }
        })

        const findRecentDistributeAccessory = await distributeModal.findOne({}, {}, { sort: { 'createdAt': -1 } });
        const lastInvoiceNo = findRecentDistributeAccessory?.invoiceId ? findRecentDistributeAccessory?.invoiceId?.split('-')[2] : 0;
        const invoiceId = `INV-D${new Date().getFullYear()}${new Date().getSeconds()}-${Number(lastInvoiceNo) + 1}`;
        formData.invoiceId = invoiceId

        const isSaved = new distributeModal(req.body)
        await isSaved.save()
        res.status(200).json({ message: 'Successfully Distributed.' })
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {

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