import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AppService } from './app.service';
import * as crypto from 'crypto-js';
import * as querystring from 'querystring';
@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/response')
  async handleResponse(@Body() body: any, @Res() res) {
    try {
      // Decrypt the response from CCAvenue
      const encryptedResponse = body.encResp;
      const workingKey = '8F38D2856241173F62FB07842774F311'; // Replace with your working key
      const decryptedResponse = crypto.AES.decrypt(
        encryptedResponse,
        workingKey,
      ).toString(crypto.enc.Utf8);

      // Parse the response
      const responseParams = querystring.parse(decryptedResponse);

      // Check if the payment was successful
      if (responseParams.order_status === 'Success') {
        // Payment successful
        // You can update your database or perform other actions here

        return res.status(200).send('Payment successful');
      } else {
        // Payment failed
        // Handle the failure scenario here

        return res.status(200).send('Payment failed');
      }
    } catch (err) {
      console.error('Error handling CCAvenue response:', err);
      return res.status(500).send('Internal server error');
    }
  }

  @Post('/initiate')
  async initiatePayment(@Body() body: any, @Res() res) {
    try {
      const workingKey = '8F38D2856241173F62FB07842774F311'; // Replace with your working key
      const merchantId = '2872736'; // Replace with your merchant ID
      const orderId = body.orderId; // Generate a unique order ID for each transaction
      const amount = body.amount; // Amount to charge

      // Construct the request parameters
      const params = {
        order_id: orderId,
        merchant_id: merchantId,
        amount: amount,
        redirect_url: 'https://www.fullstacks.expert/', // Replace with your actual redirect URL
        cancel_url: 'http://yourwebsite.com/payment/response', // Replace with your actual cancel URL
        currency: 'INR', // Replace with your currency code
      };

      // Create a string with the request parameters
      const paramsString = querystring.stringify(params);

      // Encrypt the request parameters
      const encryptedParams = crypto.AES.encrypt(
        paramsString,
        workingKey,
      ).toString();

      // Prepare the HTML form to submit to CCAvenue
      const formHtml = `
        <html>
          <body>
            <form method="post" action="https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction">
              <input type="hidden" name="encRequest" value="${encryptedParams}" />
              <input type="hidden" name="access_code" value="AVSS14KI64BN71SSNB" /> <!-- Replace with your access code -->
              <input type="submit" value="Proceed to Payment" />
            </form>
          </body>
        </html>
      `;

      return res.status(200).send(formHtml);
    } catch (err) {
      console.error('Error initiating CCAvenue payment:', err);
      return res.status(500).send('Internal server error');
    }
  }
}