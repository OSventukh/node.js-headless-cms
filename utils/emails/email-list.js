export function confirmRegistrationEmail({ userName, userEmail, host, token }) {
  return {
    to: userEmail,
    subject: 'Confirm registration',
    body: `<body>
      <h1>VETHEALTH</h1>
      <p>Dear, ${userName}</p>
      <p>An administrator has created an account for you. To complete your registration and activate your account, please click on the link below</p>
      <div>
        <a href="${host}/confirm/${token}">Click Here</a>
      </div>
    </body>`,
  };
}

export function resetPasswordEmail({ userName, userEmail, host, token }) {
  return {
    to: userEmail,
    subject: 'Reset password',
    body: `<body>
      <h1>VETHEALTH</h1>
      <p>Dear, ${userName}</p>
      <p>To confirm password reset, follow the link below</p>
      <div>
        <a href="${host}/confirm/${token}">Click Here</a>
      </div>
      <p>If you have not tried to reset your password, contact administrator</p>
    </body>`,
  };
}
