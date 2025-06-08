const jwt = require('jsonwebtoken')
const {signupSchema, signinSchema, acceptedCodeSchema} = require("../middlewares/validator")
const user = require("../models/usermodel")
const { dohash, doHashValidation, hmacprocess } = require("../utils/hash")
const { transport } = require("../middlewares/sendMail")


exports.signup = async (req, res) => {
    const  {email, password} = req.body
    try { 
        
        const {error, value} = signupSchema.validate({email, password})

        if(error){
            return res.status(401).json({success: false, message: error.details[0].message})
        }

        const existUser = await user.findOne({email})

        if(existUser){
            return res.status(401).json({success: false, message: "user already exists"})
        }

        const hashedoutput = await dohash(password, 12)

        const newuser = new user({
            email,
            password: hashedoutput,

        })

        const result = await newuser.save()
        result.password = undefined
        res.status(201).json({
            success: true, 
            message: "your account is created successfully", 
            result,
        })

    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
        });
    }
}

exports.signin = async (req, res) => {
    const {email, password} = req.body
    try {
        
        const {error, value} = signinSchema.validate({email, password})
        if(error){             
            return res.status(401).json({success: false, message: error.details[0].message})
        }

        const existingUser = await user.findOne({email}).select('+password')
        
        if(!existingUser){
            return res.status(401).json({success: false, message: "user does not exists!"})
        }

        const result = await doHashValidation(password, existingUser.password)

        if(!result){
            return res.status(401).json({success: false, message: "invalid credentials!"})
        }

        const token = jwt.sign({

            userid: existingUser._id,
            email: existingUser.email,
            verified: existingUser.verified,

        },
        process.env.TOKEN_SECRET,
        {
            expiresIn: '8h'
        }
    );
      
    res.cookie('Authorization', 'Bearer' + token, { 
        expires: new Date(Date.now() + 8 * 3600000), 
        httpOnly: process.env.NODE_ENV === 'production', 
        secure: process.env.NODE_ENV === 'production'
    })
    .json({
        success: true,
        token,
        message: 'logged in Successfully',
    })


    }catch (error) {
        console.log(error)
    }
}

exports.signout = async (req, res) => {
    res.clearCookie('Authorization').status(200).json({success: true, message: "logged out successfully"})
}

exports.sendVerificationCode = async (req, res) => {
    const {email} = req.body
    try {
        
        const existingUser = await user.findOne({email})
        
        if(!existingUser){
            return res.status(401).json({success: false, message: "user does not exists!"})
        }
        if(existingUser.verified){
            return res.status(401).json({success: false, message: "user already verified!"})
        }

        const codeValue = Math.floor(Math.random() * 100000).toString(); 
        const info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_MAIL_ADDRESS,
            to: existingUser.email,
            subject: 'verification code',
            html: '<h1>' + codeValue + '</h1>'
        })

        if(info.accepted[0] === existingUser.email){
            const hashedcode = hmacprocess(codeValue, process.env.HMAC_VERIFICATION_CODE_VALUE);
            existingUser.verificationCode = hashedcode;
            existingUser.verificationCodeValidation = Date.now();
            await existingUser.save();
            return res.status(200).json({success: true, message: 'code sent'});

        }
        return res.status(400).json({success: false, message: 'code sent failed'});
        
    } catch (error) {
        console.log(error)
    }
}

exports.verifyVerificationCode = async (req, res) => {
    const { email, providedcode } = req.body;
    try {
        const { error } = acceptedCodeSchema.validate({ email, providedcode });
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const codeValue = providedcode.toString();

        const existingUser = await user.findOne({ email }).select('+verificationCode +verificationCodeValidation');

        if (!existingUser) {
            return res.status(401).json({ success: false, message: "User does not exist!" });
        }

        if (existingUser.verified) {
            return res.status(400).json({ success: false, message: "User already verified!" });
        }

        if (!existingUser.verificationCode || !existingUser.verificationCodeValidation) {
            return res.status(400).json({ success: false, message: "No verification code found!" });
        }

        const isExpired = Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000; // 5 minutes
        if (isExpired) {
            return res.status(400).json({ success: false, message: "Verification code has expired." });
        }

        const hashedCodeValue = hmacprocess(codeValue, process.env.HMAC_VERIFICATION_CODE_VALUE);

        if (hashedCodeValue === existingUser.verificationCode) {
            existingUser.verified = true;
            existingUser.verificationCode = undefined;
            existingUser.verificationCodeValidation = undefined;
            await existingUser.save();

            return res.status(200).json({ success: true, message: "Your account has been verified." });
        }

        return res.status(400).json({ success: false, message: "Invalid verification code." });

    } catch (error) {
        console.error("Verification error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
