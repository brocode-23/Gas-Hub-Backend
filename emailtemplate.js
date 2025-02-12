const generateEmailTemplate = (tokenCode, expirationDate) => {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify Your Email</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
        background-color: #f5f5f5;
      }
      .container {
        max-width: 500px;
        margin: 0 auto;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        border: 1px solid #ccc;
      }
      .header {
        background-color: #4caf50;
        color: white;
        padding: 15px 20px;
        font-size: 18px;
        text-align: center;
      }
      .content {
        padding: 20px;
      }
      .code-box {
        background-color: #f8fff8;
        border: 1px solid #e0e0e0;
        padding: 15px;
        text-align: center;
        font-size: 24px;
        margin: 20px 0;
        color: #333;
        letter-spacing: 2px;
      }
      .footer {
        padding: 15px 20px;
        font-size: 12px;
        color: #666;
        text-align: center;
        border-top: 1px solid #eee;
      }
      p {
        color: #666;
        line-height: 1.6;
        margin: 10px 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">Gas Tank Request Token</div>
      <div class="content">
        <p>Hello,</p>
        <p>Thank you for choosing us your token code below:</p>
        <div class="code-box">${tokenCode}</div>
      </div>
      <div class="footer">© 2024 Your Company. All rights reserved.</div>
    </div>
  </body>
</html>
  `;
};

module.exports = generateEmailTemplate;

const contactEmailTemplate = (name, email, message) => {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f4f4f4; font-family: Arial, sans-serif;">
    <table cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 20px;">
        <tr>
            <td style="padding-bottom: 20px;">
                <h2 style="color: #333333; margin: 0;">New Contact Form Submission</h2>
            </td>
        </tr>
        <tr>
            <td style="padding-bottom: 10px;">
                <strong style="color: #555555;">Name:</strong>
                <p style="margin: 5px 0; color: #333333;">${name}</p>
            </td>
        </tr>
        <tr>
            <td style="padding-bottom: 10px;">
                <strong style="color: #555555;">Email:</strong>
                <p style="margin: 5px 0; color: #333333;">${email}</p>
            </td>
        </tr>
        <tr>
            <td>
                <strong style="color: #555555;">Message:</strong>
                <p style="margin: 5px 0; color: #333333;">${message}</p>
            </td>
        </tr>
    </table>
</body>
</html>`;
};

module.exports = contactEmailTemplate;