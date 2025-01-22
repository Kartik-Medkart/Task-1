import speakeasy from "speakeasy";
import { models } from "../db/index.js";
import { sendMessage } from "./message.services.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const { OTP, User } = models;

const MessageBody = (OTP_CODE, phone) => ({
  messaging_product: "whatsapp",
  to: `91${phone}`,
  type: "template",
  template: {
    name: "otp",
    language: {
      code: "en_US",
    },
    components: [
      {
        type: "body",
        parameters: [
          {
            type: "text",
            text: `${ OTP_CODE}`,
          },
        ],
      },
      {
        type: "button",
        sub_type: "url",
        index: 0,
        parameters: [
          {
            type: "text",
            text: `${ OTP_CODE }`,
          },
        ],
      },
    ],
  },
});

export const sendOTP = asyncHandler(async (req, res) => {
  try {
    const { phone } = req.body;

    const existingOtp = await OTP.findOne({
        where: { phone },
    })

    if (existingOtp) {
        if (existingOtp.expiresAt > new Date()) {
            return res
            .status(400)
            .json(new ApiResponse(400, [], "An OTP has already been sent to this number. Please wait for it to expire."));
        }
        await existingOtp.destroy();
    }

    const otp = speakeasy.totp({
      secret: process.env.OTP_SECRET,
      encoding: "base32",
      step: 300,
    });

    console.log(otp);

    // First Sent OTP if any error occurs while sending OTP then don't save OTP in the database

    const OTP_SEND = await sendMessage(MessageBody(otp, phone));
    console.log(OTP_SEND);
    const newOtp = await OTP.create({
      phone,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    return res
      .status(200)
      .json(new ApiResponse(200, [], "OTP Sent Successfully"));
  } catch (error) {
    console.error(error);
    return res.status(500).json(new ApiResponse(500, [], "Failed to send OTP"));
  }
});

export const verifyOTP = asyncHandler(async (req, res) => {
    try {
        const { phone, otp } = req.body;
        console.log(phone, otp);
        
        const otpRecord = await OTP.findOne({
            where: { phone, otp },
        });
        
        if (!otpRecord) {
            return res
            .status(400)
            .json(new ApiResponse(400, [], "Invalid OTP. Please try again."));
        }
        
        if (otpRecord.expiresAt < new Date()) {
            await otpRecord.destroy();
            return res
            .status(400)
            .json(new ApiResponse(400, [], "OTP has expired. Please try again."));
        }
    
        // await otpRecord.destroy();
        const user = await User.findOne({ where: { user_id : req.user.user_id } });
        user.isVerified = true;
        await user.save();

        // should i delete record or maintain it for later use
        await otpRecord.destroy();
        
        return res
            .status(200)
            .json(new ApiResponse(200, [], "OTP Verified successfully!"));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(500, [], "Failed to verify OTP"));
    }
});