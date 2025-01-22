import axios from "axios";
import dotenv from "dotenv";
import { ApiError } from "../utils/ApiError.js";
dotenv.config();
// let data = (template) => JSON.stringify({
//   messaging_product: "whatsapp",
//   to: "919316909534",
//   type: "template",
//   template: {
//     name: "hello_world",
//     language: {
//       code: "en_US",
//     },
//   },
// });

let config = (data) => ({
  method: "post",
  maxBodyLength: Infinity,
  url: "https://graph.facebook.com/v21.0/500713429788421/messages",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.USER_ACCESS_TOKEN}`,
  },
  data: JSON.stringify(data),
});

export const sendMessage = async (MessageBody) => {
  try {
    let response = await axios.request(config(MessageBody));
    const {data} = response;
    console.log(data);
    return data;
  } catch (error) {
    console.log(error.response.data);
    throw new ApiError(500, [], error.response.data.error.message);
  }
};
