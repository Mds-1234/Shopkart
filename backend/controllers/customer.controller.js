import Customer from '../models/customer.model.js'
import bcrypt from 'bcrypt'
import genToken from '../utils/generateToken.js'


const cookieOptions = {
    httpOnly: true
}

export const registerCustomer = async (req, res) => {
    try {

        const { fullName, email, password, phone } = req.body


        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({ message: 'All fileds Required' })
        }

        if (password.length <= 6) {
            return res.status(400).json({ message: 'Password should be greater than 6 characters' })
        }

        const emailExists = await Customer.findOne({ email })

        if (emailExists) {
            return res.status(409).json({ message: 'Customer Already Exists' })
        }

        const salt = await bcrypt.genSalt(10)

        const hashedPassword = await bcrypt.hash(password, salt)

        const phoneExists = await Customer.findOne({ phone })

        if (phoneExists) {
            return res.status(409).json({ message: 'Customer Already Exists' })
        }


        const newCustomer = await Customer.create({
            fullName,
            email,
            password: hashedPassword,
            phone

        })

        const token = genToken(newCustomer._id)

        res.cookie('token', token, cookieOptions)



        res.status(201).json({
            "success": true,
            "message": "Customer registered successfully",
            "customer": {
                "id": newCustomer._id,
                "fullName": newCustomer.fullName,
                "email": newCustomer.email,
                "phone": newCustomer.phone
            }
        })

    } catch (error) {
        res.status(500).json({ message: 'Server crashed', error: error.message })
    }

}

export const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: 'All fileds Required' })
        }

        const customer = await Customer.findOne({ email })

        if (!customer) {
            return res.status(404).json({ message: 'Customer Not Found' })
        }

        const passwordMatched = await bcrypt.compare(password, customer.password)


        if (!passwordMatched) {
            return res.status(401).json({ message: 'Password Did not match' })
        }

        console.log(passwordMatched)
        
        const token = genToken(customer._id)
        res.cookie('token',token,cookieOptions)

        res.status(200).json({
            "success": true,
            "message": "Login successful",
            "customer": {
                "id": customer._id,
                "fullName": customer.fullName,
                "email": customer.email,
                "phone": customer.phone
            }
        })

    } catch (error) {
        res.status(500).json({ message: 'Server crashed', error: error.message })
    }
}

export const getMe = (req, res) => {
    try {
        if (!req.customer) {
            return res.status(404).json({ message: 'Customer Not Found' })
        }

        const authenticatedCustomer = req.customer
        res.status(200).json(
            {
                "id": authenticatedCustomer._id,
                "fullName": authenticatedCustomer.fullName,
                "email": authenticatedCustomer.email,
                "phone": authenticatedCustomer.phone
            }
        )
    }
    catch {
        res.status(401).json({ message: 'Unauthorized' })
    }
}

export const logOut = (req, res) => {
    res.clearCookie('token')
    res.status(200).json({
        "success": true,
        "message": "Logged out successfully"
    })
}