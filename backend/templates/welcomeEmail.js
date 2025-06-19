const WelcomeEmail = ({ name }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome Email</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f9;
      margin: 0;
      padding: 0;
      color: #333;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      background-color: #e3811b;
      color: #fff;
      padding: 20px;
      text-align: center;
    }
    .email-header img {
      max-width: 150px;
    }
    .email-body {
      padding: 20px;
    }
    .email-body h1 {
      font-size: 24px;
      margin-bottom: 10px;
      color: #e3811b;
    }
    .email-body p {
      font-size: 16px;
      line-height: 1.6;
    }
    .email-footer {
      background-color: #f4f4f9;
      text-align: center;
      padding: 10px;
      font-size: 12px;
      color: #777;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>Welcome to Food For Life System!</h1>
    </div>
    <div class="email-body">
      <h1>Dear ${name},</h1>
      <p>We are so excited to have you join our community. Welcome aboard!</p>
    </div>
    <div class="email-footer">
      <p>&copy; ${new Date().getFullYear()} Mind Connect by Sushmita Bishwakarma. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

module.exports = WelcomeEmail;
