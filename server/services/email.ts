import nodemailer from "nodemailer"

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  })
}

// Send email to buyer after order confirmation
export const sendBuyerOrderConfirmation = async (
  buyerEmail: string,
  buyerName: string,
  orderId: string,
  orderItems: any[],
  totalAmount: number,
  shippingAddress: any
) => {
  try {
    const transporter = createTransporter()

    const itemsList = orderItems
      .map(
        (item) =>
          `<tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
          </tr>`
      )
      .join("")

    const mailOptions = {
      from: `"ShopLite" <${process.env.EMAIL_USER}>`,
      to: buyerEmail,
      subject: `Order Confirmation - #${orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; }
            .total { font-size: 18px; font-weight: bold; color: #667eea; text-align: right; padding: 15px; background: #f0f0f0; margin-top: 10px; }
            .footer { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Order Confirmed!</h1>
              <p>Thank you for your purchase</p>
            </div>
            <div class="content">
              <p>Hi <strong>${buyerName}</strong>,</p>
              <p>Your order has been confirmed! We're excited to get your items to you.</p>

              <div class="order-details">
                <h2 style="color: #667eea; margin-top: 0;">Order Details</h2>
                <p><strong>Order ID:</strong> ${orderId}</p>

                <h3 style="color: #333;">Items Ordered:</h3>
                <table>
                  <thead>
                    <tr style="background: #667eea; color: white;">
                      <th style="padding: 10px; text-align: left;">Product</th>
                      <th style="padding: 10px; text-align: center;">Qty</th>
                      <th style="padding: 10px; text-align: right;">Price</th>
                      <th style="padding: 10px; text-align: right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsList}
                  </tbody>
                </table>

                <div class="total">
                  Total: $${totalAmount.toFixed(2)}
                </div>

                <h3 style="color: #333; margin-top: 20px;">Shipping Address:</h3>
                <p>
                  ${shippingAddress.fullName}<br>
                  ${shippingAddress.address}<br>
                  ${shippingAddress.city}, ${shippingAddress.postalCode}<br>
                  ${shippingAddress.country}
                </p>
              </div>

              <p>We'll send you another email when your order ships.</p>
              <p>If you have any questions, feel free to contact us.</p>
            </div>
            <div class="footer">
              <p>Thank you for shopping with ShopLite!</p>
              <p>&copy; ${new Date().getFullYear()} ShopLite. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log(`✅ Order confirmation email sent to buyer: ${buyerEmail}`)
  } catch (error) {
    console.error("❌ Error sending buyer email:", error)
  }
}

// Send email to seller when their product is ordered
export const sendSellerOrderNotification = async (
  sellerEmail: string,
  sellerName: string,
  orderId: string,
  productDetails: {
    title: string
    quantity: number
    price: number
  },
  buyerName: string,
  shippingAddress: any
) => {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: `"ShopLite" <${process.env.EMAIL_USER}>`,
      to: sellerEmail,
      subject: `New Order Received - ${productDetails.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .highlight { background: #fff4e6; padding: 15px; border-left: 4px solid #f5576c; margin: 15px 0; }
            .footer { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛍️ New Order Received!</h1>
              <p>You have a new sale</p>
            </div>
            <div class="content">
              <p>Hi <strong>${sellerName}</strong>,</p>
              <p>Great news! Your product has been ordered.</p>

              <div class="order-details">
                <h2 style="color: #f5576c; margin-top: 0;">Order Information</h2>
                <p><strong>Order ID:</strong> ${orderId}</p>

                <div class="highlight">
                  <h3 style="margin-top: 0; color: #f5576c;">Product Ordered:</h3>
                  <p style="font-size: 16px; margin: 5px 0;"><strong>${productDetails.title}</strong></p>
                  <p style="margin: 5px 0;">Quantity: <strong>${productDetails.quantity}</strong></p>
                  <p style="margin: 5px 0;">Price per unit: <strong>$${productDetails.price.toFixed(2)}</strong></p>
                  <p style="margin: 5px 0; font-size: 18px; color: #f5576c;">
                    Total Earnings: <strong>$${(productDetails.price * productDetails.quantity).toFixed(2)}</strong>
                  </p>
                </div>

                <h3 style="color: #333;">Customer Information:</h3>
                <p><strong>Buyer:</strong> ${buyerName}</p>

                <h3 style="color: #333;">Shipping Address:</h3>
                <p>
                  ${shippingAddress.fullName}<br>
                  ${shippingAddress.address}<br>
                  ${shippingAddress.city}, ${shippingAddress.postalCode}<br>
                  ${shippingAddress.country}
                </p>
              </div>

              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Prepare the product for shipping</li>
                <li>Package it securely</li>
                <li>Ship it to the customer address above</li>
              </ul>

              <p>Thank you for being a valued seller on our platform!</p>
            </div>
            <div class="footer">
              <p>ShopLite Seller Dashboard</p>
              <p>&copy; ${new Date().getFullYear()} ShopLite. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log(`✅ Order notification email sent to seller: ${sellerEmail}`)
  } catch (error) {
    console.error("❌ Error sending seller email:", error)
  }
}
