const nodemailer = require('nodemailer');
const ErrorResponse = require('../utils/errorResponse');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  // Send email using the configured transporter
  async sendEmail(options) {
    try {
      const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.html
      };

      const info = await this.transporter.sendMail(message);
      console.log('Message sent: %s', info.messageId);
      return info;
    } catch (error) {
      throw new ErrorResponse(`Email could not be sent: ${error.message}`, 500);
    }
  }

  // Welcome email when user registers
  async sendWelcomeEmail(user) {
    const html = this.getWelcomeEmailTemplate(user.firstName);
    await this.sendEmail({
      email: user.email,
      subject: 'Welcome to L\'ardene Leather',
      html
    });
  }

  // Email verification email
  async sendEmailVerification(user, verificationToken) {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    const html = this.getEmailVerificationTemplate(user.firstName, verificationUrl);
    await this.sendEmail({
      email: user.email,
      subject: 'Verify Your Email - L\'ardene Leather',
      html
    });
  }

  // Order confirmation email
  async sendOrderConfirmation(order, user) {
    const html = this.getOrderConfirmationTemplate(order, user);
    await this.sendEmail({
      email: user.email,
      subject: `Order Confirmation - #${order._id}`,
      html
    });
  }

  // Payment confirmation email
  async sendPaymentConfirmation(order, user) {
    const html = this.getPaymentConfirmationTemplate(order, user);
    await this.sendEmail({
      email: user.email,
      subject: `Payment Received - Order #${order._id}`,
      html
    });
  }

  // Password reset email
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const html = this.getPasswordResetTemplate(resetUrl);
    await this.sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      html
    });
  }

  // Order status update email
  async sendOrderStatusUpdate(order, user) {
    const html = this.getOrderStatusUpdateTemplate(order, user);
    await this.sendEmail({
      email: user.email,
      subject: `Order Status Update - #${order._id}`,
      html
    });
  }

  // Email template for welcome email
  getWelcomeEmailTemplate(firstName) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to L'ardene Leather!</h2>
        <p>Dear ${firstName},</p>
        <p>Thank you for creating an account with L'ardene Leather. We're excited to have you join our community of leather enthusiasts.</p>
        <p>With your account, you can:</p>
        <ul>
          <li>Track your orders</li>
          <li>Save your favorite items</li>
          <li>Get exclusive access to new products</li>
          <li>Receive special offers</li>
        </ul>
        <p>Start exploring our collection today!</p>
        <a href="${process.env.CLIENT_URL}/shop" style="background-color: #8B4513; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
          Shop Now
        </a>
      </div>
    `;
  }

  // Email template for verification
  getEmailVerificationTemplate(firstName, verificationUrl) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify Your Email</h2>
        <p>Dear ${firstName},</p>
        <p>Thank you for registering with L'ardene Leather. Please verify your email address by clicking the button below:</p>
        
        <a href="${verificationUrl}" style="background-color: #8B4513; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
          Verify Email
        </a>

        <p>If you didn't create an account with us, please ignore this email.</p>
        <p>This link will expire in 24 hours.</p>
      </div>
    `;
  }

  // Email template for order confirmation
  getOrderConfirmationTemplate(order, user) {
    const items = order.items.map(item => `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>PKR ${item.price.toLocaleString()}</td>
        <td>PKR ${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Order Confirmation</h2>
        <p>Dear ${user.firstName},</p>
        <p>Thank you for your order! We've received your order and will begin processing it right away.</p>
        
        <div style="margin: 20px 0;">
          <h3>Order Details</h3>
          <p>Order Number: #${order._id}</p>
          <p>Order Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p>Payment Method: ${order.paymentDetails.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="text-align: left; padding: 10px;">Item</th>
              <th style="text-align: left; padding: 10px;">Quantity</th>
              <th style="text-align: left; padding: 10px;">Price</th>
              <th style="text-align: left; padding: 10px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align: right; padding: 10px;"><strong>Subtotal:</strong></td>
              <td>PKR ${(order.total - order.shippingFee).toLocaleString()}</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align: right; padding: 10px;"><strong>Shipping:</strong></td>
              <td>PKR ${order.shippingFee.toLocaleString()}</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align: right; padding: 10px;"><strong>Total:</strong></td>
              <td>PKR ${order.total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <div style="margin: 20px 0;">
          <h3>Shipping Address</h3>
          <p>${order.shippingAddress.fullName}</p>
          <p>${order.shippingAddress.address}</p>
          <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}</p>
          <p>${order.shippingAddress.phone}</p>
        </div>

        <p>You can track your order status here:</p>
        <a href="${process.env.CLIENT_URL}/orders/${order._id}" style="background-color: #8B4513; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Track Order
        </a>
      </div>
    `;
  }

  // Email template for payment confirmation
  getPaymentConfirmationTemplate(order, user) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payment Confirmation</h2>
        <p>Dear ${user.firstName},</p>
        <p>We've received your payment for order #${order._id}.</p>
        
        <div style="margin: 20px 0;">
          <h3>Payment Details</h3>
          <p>Amount Paid: PKR ${order.total.toLocaleString()}</p>
          <p>Payment Method: ${order.paymentDetails.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</p>
          <p>Transaction ID: ${order.paymentDetails.transactionId || 'N/A'}</p>
          <p>Date: ${new Date(order.paymentDetails.paidAt).toLocaleString()}</p>
        </div>

        <p>View your order details here:</p>
        <a href="${process.env.CLIENT_URL}/orders/${order._id}" style="background-color: #8B4513; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          View Order
        </a>
      </div>
    `;
  }

  // Email template for password reset
  getPasswordResetTemplate(resetUrl) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>You are receiving this email because you (or someone else) has requested to reset your password.</p>
        <p>Click the button below to reset your password:</p>
        
        <a href="${resetUrl}" style="background-color: #8B4513; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
          Reset Password
        </a>

        <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
        <p>This link will expire in 10 minutes.</p>
      </div>
    `;
  }

  // Email template for order status update
  getOrderStatusUpdateTemplate(order, user) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Order Status Update</h2>
        <p>Dear ${user.firstName},</p>
        <p>Your order #${order._id} has been updated to: <strong>${order.status.toUpperCase()}</strong></p>
        
        <div style="margin: 20px 0;">
          <p>Order Details:</p>
          <ul>
            <li>Order Date: ${new Date(order.createdAt).toLocaleDateString()}</li>
            <li>Total Amount: PKR ${order.total.toLocaleString()}</li>
            <li>Payment Method: ${order.paymentDetails.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</li>
          </ul>
        </div>

        <p>Track your order here:</p>
        <a href="${process.env.CLIENT_URL}/orders/${order._id}" style="background-color: #8B4513; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Track Order
        </a>
      </div>
    `;
  }
}

module.exports = new EmailService();