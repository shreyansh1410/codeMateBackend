import Razorpay from "razorpay";

const rzpsecret = process.env.RAZORPAY_SECRET;
const rzpkeyid = process.env.RAZORPAY_KEY_ID;

var instance = new Razorpay({
  key_id: rzpkeyid,
  key_secret: rzpsecret,
});

export default instance;
