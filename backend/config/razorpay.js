import Razorpay from "razorpay"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const envPath = path.resolve(__dirname, "../.env")
dotenv.config({ path: envPath })
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    dotenv.config()
}

const sanitizeKey = (key) => (typeof key === "string" ? key.trim() : "")

let razorpayInstance = null
let loggedDiag = false

const getRazorpayInstance = () => {
    const keyId = sanitizeKey(process.env.RAZORPAY_KEY_ID)
    const keySecret = sanitizeKey(process.env.RAZORPAY_KEY_SECRET)

    if (!keyId || !keySecret) {
        console.warn("[Razorpay Config] Keys missing. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the backend .env file.")
        return new Razorpay({
            key_id: keyId || "rzp_test_missing_key",
            key_secret: keySecret || "missing_secret"
        })
    }

    if (!razorpayInstance || razorpayInstance.key_id !== keyId || razorpayInstance.key_secret !== keySecret) {
        if (!loggedDiag) {
            const isTestMode = keyId.startsWith("rzp_test_")
            const maskedKey = keyId.length > 8 ? `${keyId.slice(0, 8)}...${keyId.slice(-4)}` : "***"
            console.log(`[Razorpay Config] Initialized in ${isTestMode ? "Test" : "Live"} Mode (Key ID: ${maskedKey}, Secret: [configured, ${keySecret.length} chars])`)
            loggedDiag = true
        }

        razorpayInstance = new Razorpay({
            key_id: keyId,
            key_secret: keySecret
        })
    }

    return razorpayInstance
}

const initialKeyId = sanitizeKey(process.env.RAZORPAY_KEY_ID)
const initialKeySecret = sanitizeKey(process.env.RAZORPAY_KEY_SECRET)
if (initialKeyId) process.env.RAZORPAY_KEY_ID = initialKeyId
if (initialKeySecret) process.env.RAZORPAY_KEY_SECRET = initialKeySecret

getRazorpayInstance()

const razorpay = new Proxy({}, {
    get(target, prop) {
        const instance = getRazorpayInstance()
        const value = instance[prop]
        if (typeof value === "function") {
            return value.bind(instance)
        }
        return value
    }
})

export default razorpay

