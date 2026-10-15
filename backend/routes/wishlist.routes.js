import express from 'express'
import { addToWishlist,getWishlist,removeFromWishlist } from '../controllers/wishlist.controller.js'
import { isAuthenticated } from '../middlewares/auth.middleware.js'

const wishlistRoutes = express.Router()

wishlistRoutes.post('/:productId', isAuthenticated, addToWishlist)
wishlistRoutes.get('/', isAuthenticated, getWishlist)
wishlistRoutes.delete('/:productId', isAuthenticated, removeFromWishlist)

export default wishlistRoutes