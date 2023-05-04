module.exports = {
    Ok: (...args)=>{
        return {
            code: 200,
            msg: args[0]?args[0]:"Ok",
            data: args[1]?args[1]:null
        }
    }
}