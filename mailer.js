const { CourierClient } = require("@trycourier/courier");

const sendMagicLinkEmail = async ({ email, name, token }) => {
  const courier = CourierClient({
    authorizationToken: process.env.COURIER_AUTH_TOKEN,
  });

  const { requestId } = await courier.send({
    message: {
      content: {
        title: "[Metamatch] Verification Email",
        body: "Welcome back {{name}}, click the verification link to login - {{link}}",
      },
      data: {
        link: `${process.env.CLIENT_SERVER_URL}/verify?token=${token}`,
      },
      to: {
        email: email,
        name: name,
      },
    },
  });

  console.log("request Id", requestId);
};

module.exports = {
  sendMagicLinkEmail,
};
