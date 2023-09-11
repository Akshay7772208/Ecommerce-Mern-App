import userModel from '../models/userModel.js'
import orderModel from '../models/orderModel.js'
import {hashPassword,comparePassword} from './../helpers/authHelper.js'
import JWT from 'jsonwebtoken'

export const registerController= async(req,res)=>{
	try{
		const {name,email,password,phone,address,answer}=req.body
		//validation
		if(!name){
			return res.status(400).send({
				error: "Name is required"
			})
		}
		if(!email){
			return res.status(400).send({
				message: "Email is required"
			})
		}
		if(!password){
			return res.status(400).send({
				message: "Password is required"
			})
		}
		if(!phone){
			return res.status(400).send({
				message: "Phone No. is required"
			})
		}

		if(!address){
			return res.status(400).send({
				message: "Address is required"
			})
		}

		if(!answer){
			return res.status(400).send({
				message: "Answer is required"
			})
		}

		//existing user
		const existingUser=await userModel.findOne({email})
		if(existingUser){
			return res.status(200).send({
				success: false, 
				message: "Already registred Please Login"
			})
		}

		//register user
		const hashedPassword=await hashPassword(password)
		//save new user
		const user=new userModel({name,email,phone,address,password:hashedPassword,answer})
		await user.save()
		
		return res.status(201).send({
			success: true,
			message: "User Registered Successfully",
			user
		})
	}catch(error){
		console.log(error)
		return res.status(500).send({
			message: "Error in register controller", 
			success: false,
			error
		})
	}
}

//login || post
export const loginController= async(req,res)=>{
	try{
		const {email,password}=req.body
		//validatiom
		if(!email || !password){
			return res.status(400).send({
				success: false,
				message: "Invalid email or password" 
			})
		}
		//user
		const user=await userModel.findOne({email})
		if(!user){
			return res.status(404).send({
				success: false,
				message: "Email is not registered" 
			})
		}
		//password
		const isMatch=await comparePassword(password,user.password)
		if(!isMatch){
			res.status(401).send({
				success: false,
				message: "Invalid Password" 
			})
		}

		//token
		const token= await JWT.sign({_id:user._id},process.env.JWT_SECRET,{expiresIn: '7d'})

		return res.status(200).send({
			success: true,
			message: "Logged in successfully",
			user: {
				name: user.name,
				email: user.email,
				phone: user.phone, 
				address: user.address,
				role: user.role
			},
			token
		})
	}catch(error){
		console.log(error)
		return res.status(500).send({
			message: "Error in login controller", 
			success: false,
			error
		})
	}
}

//forgot-password controller
export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    if (!email) {
      res.status(400).send({ message: "Emai is required" });
    }
    if (!answer) {
      res.status(400).send({ message: "answer is required" });
    }
    if (!newPassword) {
      res.status(400).send({ message: "New Password is required" });
    }
    //check
    const user = await userModel.findOne({ email, answer });
    //validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Wrong Email Or Answer",
      });
    }
    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

//test controller
export const testController= (req,res)=>{
	res.send('Protected route')
}

//update prfole
export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const user = await userModel.findById(req.user._id);
    //password
    if (password && password.length < 4) {
      return res.json({ error: "Passsword is required and 6 character long" });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error WHile Update profile",
      error,
    });
  }
};

//orders
export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Orders",
      error,
    });
  }
};
//orders
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: "-1" });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Orders",
      error,
    });
  }
};

//order status
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Updateing Order",
      error,
    });
  }
};