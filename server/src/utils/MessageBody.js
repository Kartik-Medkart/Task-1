export const newOrder = (RECIPIENT_NUMBER, CUSTOMER_NAME, ORDER_NUMBER, DELIVERY_DATE) => ({
    "messaging_product": "whatsapp",
    "to": `91${RECIPIENT_NUMBER}`,
    "type": "template",
    "template": {
      "name": "order_confirm",
      "language": {
        "code": "en_US"
      },
      "components": [
        {
          "type": "body",
          "parameters": [
            {
              "type": "text",
              "text": `${CUSTOMER_NAME}`  
              
            },
            {
              "type": "text",
              "text": `${ORDER_NUMBER}`  
              
            },
            {
              "type": "text",
              "text": `${DELIVERY_DATE}`  
              
            }
          ]
        }
      ]
    }
  })
  
export const receiveOrder = (ORDER_ID, CUSTOMER_NAME, ITEMS_ORDERED, TOTAL_AMOUNT) => (
    {
    "messaging_product": "whatsapp",
    "to": "919316909534",
    "type": "template",
    "template": {
      "name": "receive_order",
      "language": {
        "code": "en"
      },
      "components": [
        {
          "type": "body",
          "parameters": [
            {
              "type": "text",
              "text": `${ORDER_ID}`
            },
            {
              "type": "text",
              "text": `${CUSTOMER_NAME}`
            },
            {
              "type": "text",
              "text": `${ITEMS_ORDERED}`
            },
            {
              "type": "text",
              "text": `${TOTAL_AMOUNT}`
            }
          ]
        },
        {
          "type": "button",
          "sub_type": "url",
          "index": "0",
          "parameters": [
            {
              "type": "text",
              "text": `${ORDER_ID}`
            }
          ]
        }
      ]
    }
  }
  )