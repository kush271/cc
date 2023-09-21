import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { decrypt, encrypt } from 'src/utils';
import { Request, Response } from 'express'; // Import Request and Response from 'express' for proper typing
import * as crypto from 'crypto-js';
import * as querystring from 'querystring';
@Controller('payment')
export class PaymentController {
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

  @Post()
  async initiatePayment(@Body() body: any, @Res() res) {
    try {
      const workingKey = '8F38D2856241173F62FB07842774F311' // Replace with your working key
      const merchantId = '2872736'; // Replace with your merchant ID


      // Create a string with the request parameters
      const paramsString = querystring.stringify(body);

      // Encrypt the request parameters
      // const encryptedParams = crypto.AES.encrypt(
      //   paramsString,
      //   workingKey,
      // ).toString();
      const encryptedParams = encrypt(paramsString, workingKey);

      // Prepare the HTML form to submit to CCAvenue
      const formHtml = `
      <html>
        <body onload="document.forms['ccavenueForm'].submit();">
          <form method="post" action="https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction" name="ccavenueForm">
            <input type="hidden" name="encRequest" value="${encryptedParams}" />
            <input type="hidden" name="access_code" value="AVSS14KI64BN71SSNB" /> <!-- Replace with your access code -->
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