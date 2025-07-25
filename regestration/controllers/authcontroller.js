const jwt = require('jsonwebtoken')
const {signupSchema, signinSchema, acceptedCodeSchema, changePasswordSchema} = require("../middlewares/validator")
const user = require("../models/usermodel")
const { dohash, doHashValidation, hmacprocess } = require("../utils/hash")
const { transport } = require("../middlewares/sendMail")
const { exist } = require('joi')


exports.signup = async (req, res) => {
    const  {username, email, password} = req.body
    try { 
        
        const {error, value} = signupSchema.validate({username, email, password})

        if(error){
            return res.status(401).json({success: false, message: error.details[0].message})
        }

        const existUser = await user.findOne({
            $or: [
                {username: username},
                {email: email}
                
            ]
        })

        if(existUser){
            return res.status(401).json({success: false, message: "user already exists"})
        }

        const hashedoutput = await dohash(password, 12)

        const newuser = new user({
            username,
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
    const {username, email, password} = req.body
    try {
        
        const {error, value} = signinSchema.validate({username, email, password})
        if(error){             
            return res.status(401).json({success: false, message: error.details[0].message})
        }

        const existingUser = await user.findOne({email}).select('+password')
        console.log(existingUser)
        if(!existingUser){
            return res.status(401).json({success: false, message: "user does not exists!"})
        }

        const result = await doHashValidation(password, existingUser.password)

        if(!result){
            return res.status(401).json({success: false, message: "invalid credentials!"})
        }

        // New check for email verification
        if (!existingUser.verified) {
            return res.status(401).json({
                success: false,
                verified: false,
                message: 'Your account is not verified.'
            });
        }

        const token = jwt.sign({
            username: existingUser.username,
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
    console.log("Received request to send verification code");
    const {email} = req.body
    try {

        const allUsers = await user.find();  // no filter = all documents
        console.log(allUsers);


        const existingUser = await user.findOne({email}).select("+verified")
        console.log(existingUser)
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


exports.changePassword = async (req,res) => {
    const {email, verified} = req.user
    const {oldpassword, newpassword} = req.body;
    try {
        const {error, value} = changePasswordSchema.validate({oldpassword, newpassword});
        if(error){
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        if(!verified){
            return res.status(400).json({ success: false, message: "User not verified!" });
        }
        const existingUser = await user.findOne({email}).select("+password");
        if (!existingUser) {
            return res.status(401).json({ success: false, message: "User does not exist!" });
        }
        const result = await doHashValidation(oldpassword, existingUser.password)
        if(!result){
            return res.status(402).json({ success: false, message: "incorrect old password!" });
        }
        const hashedpassword = await dohash(newpassword,12);
        existingUser.password = hashedpassword;
        await existingUser.save();
        return res.status(200).json({ success: true, message: "password is updated" });


    } catch (error) {
        console.error("error in changing password:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
        
    }
}


exports.sendforgotpasswordcode = async (req, res) => {
    const {username, email} = req.body
    try {

        const existingUser = await user.findOne({email}).select("+verified")
        console.log(existingUser)
        if(!existingUser){
            return res.status(401).json({success: false, message: "user does not exists!"})
        }

        const codeValue = Math.floor(Math.random() * 100000).toString(); 
        const info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_MAIL_ADDRESS,
            to: existingUser.email,
            subject: 'fogot password code',
            html: '<h1>' + codeValue + '</h1>'
        })

        if(info.accepted[0] === existingUser.email){
            const hashedcode = hmacprocess(codeValue, process.env.HMAC_VERIFICATION_CODE_VALUE);
            existingUser.forgotpasswordcode = hashedcode;
            existingUser.forgotpasswordcodevalidation = Date.now();
            await existingUser.save();
            return res.status(200).json({success: true, message: 'code sent'});

        }
        return res.status(400).json({success: false, message: 'code sent failed'});
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "Internal server error" });  
    }
}

exports.verifyforgotpasswordcode = async (req, res) => {
    const { providedcode, newpassword, email } = req.body;
    try {
        const { error } = acceptedCodeSchema.validate({ email, providedcode });
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const codeValue = providedcode.toString();

        const existingUser = await user.findOne({ email }).select('+forgotpasswordcode +forgotpasswordcodevalidation');

        if (!existingUser) {
            return res.status(401).json({ success: false, message: "User does not exist!" });
        }


        if (!existingUser.forgotpasswordcode || !existingUser.forgotpasswordcodevalidation) {
            return res.status(400).json({ success: false, message: "No verification code found!" });
        }

        const isExpired = Date.now() - existingUser.forgotpasswordcodevalidation > 5 * 60 * 1000; // 5 minutes
        if (isExpired) {
            return res.status(400).json({ success: false, message: "Verification code has expired." });
        }

        const hashedCodeValue = hmacprocess(codeValue, process.env.HMAC_VERIFICATION_CODE_VALUE);

        if (hashedCodeValue === existingUser.forgotpasswordcode) {
            const hashedpassword = await dohash(newpassword, 12)
            existingUser.password = hashedpassword
            existingUser.forgotpasswordcode = undefined;
            existingUser.forgotpasswordcodevalidation = undefined;
            await existingUser.save();

            return res.status(200).json({ success: true, message: "Password is updated." });
        }

        return res.status(400).json({ success: false, message: "Invalid verification code." });

    } catch (error) {
        console.error("Verification error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};