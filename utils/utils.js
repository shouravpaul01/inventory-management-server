const generateAccessoryUniqueCode=(totalQuantity,codeTitle,quantity)=>{
    const accessoryCodes = [];
    let codeStart=1
    let length=0
    if (totalQuantity==1) {
        codeStart=1
        length=quantity
    }else{
        codeStart=totalQuantity+1
        length=totalQuantity+quantity
    }
    console.log(codeStart,length);
    for (let i = codeStart; i <= length; i++) {
        accessoryCodes.push(`${codeTitle}-${i}`);
    }
    return accessoryCodes;
}

module.exports={generateAccessoryUniqueCode}