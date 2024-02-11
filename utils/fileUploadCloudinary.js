const cloudinary = require('cloudinary').v2;

const fileUploadCloudinary = async(filePath) => {
    try {
        return await cloudinary.uploader.upload(filePath,{
            folder:'inventory_management/images'
        })
         
    } catch (err) {
        console.log(err);
    }
   
};

module.exports= fileUploadCloudinary