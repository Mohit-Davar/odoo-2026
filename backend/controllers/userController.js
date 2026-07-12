import User from "../models/User.js"

export const getProfile = async(req , res)=>{
    try{
        const user = await User.findById(req.user.id).select("-password -refreshToken");
        if(!user)return res.status(404).json({
            msg : "User Not found"
        });
        res.json(user);
    }catch(error){
        res.status(500).json({
            msg : "Something went wrong so"
        })
    }
}