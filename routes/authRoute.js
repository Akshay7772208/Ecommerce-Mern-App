import express from 'express'
import {registerController,loginController,forgotPasswordController,testController,updateProfileController,getOrdersController,getAllOrdersController,orderStatusController} from '../controllers/authController.js'
import {requireSignIn,isAdmin} from '../middlewares/authMiddleware.js'


//router object
const router= express.Router()

//routing
//REGISTER ||  METHOD POST
router.post('/register',registerController)

//LOGIN || POST
router.post('/login',loginController)

//FORGOT PASSWORD || POST
router.post('/forgot-password',forgotPasswordController)

//test route
router.get('/test',requireSignIn,isAdmin,testController)

//private user route 
router.get('/user-auth',requireSignIn,(req,res)=>{
	res.status(200).send({ok: true})
})

//private admin route 
router.get('/admin-auth',requireSignIn,isAdmin,(req,res)=>{
	res.status(200).send({ok: true})
})

//update 
router.put('/profile',requireSignIn,updateProfileController)

router.get('/orders',requireSignIn,getOrdersController)

//all orders
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);

// order status update
router.put("/order-status/:orderId",requireSignIn,isAdmin,orderStatusController);

export default router
