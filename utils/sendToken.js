const sendToken = (res, user, message, statusCode = 200) =>{
    const token = user.getJWTToken();
    // console.log(token);
    
    
    res.status(statusCode).json({
        success:true,
        message,
        data:user,
        token
    })
}

export default sendToken