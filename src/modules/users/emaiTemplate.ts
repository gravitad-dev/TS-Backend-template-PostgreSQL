export const verificationEmailTemplate = (name: string, verificationCode: string): string => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verification Code</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
      h1 {
        text-align: center;
        color: #333;
      }
      p {
        text-align: center;
        color: #555;
      }
      .verification-code {
        font-size: 24px;
        font-weight: bold;
        color: #007bff;
        text-align: center;
        margin: 20px 0;
      }
      .footer {
        text-align: center;
        font-size: 12px;
        color: #999;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Verification Code</h1>
      <p>
        Hello, <strong>${name}</strong>
      </p>
      <p>Your verification code is:</p>
      <div class="verification-code">${verificationCode}</div>
      <p>Please enter it in the application to be activated in our database.</p>
    </div>
  </body>
</html>
`;

export const resetPasswordTemplate = (name: string, resetURL: string): string => `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
      <h2 style="color: #2c3e50;">Password Reset Request</h2>
      <p>Hello, ${name}</p>
      <p>We received a request to reset the password for your account.</p>
      <p style="margin: 20px 0;">
        Click the button below or copy and paste this link into your browser to reset your password:
      </p>
      <div style="margin: 20px 0;">
        <a href="${resetURL}" 
          style="
            display: inline-block;
            background-color: #3498db;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            font-weight: bold;
          ">
          Reset Password
        </a>
      </div>
      <p style="margin: 20px 0; font-size: 0.9em;">
        <strong>Note:</strong> This link will expire in 15 minutes.
      </p>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 0.9em;">Thank you,<br>The Support Team</p>
    </div>
  `;
