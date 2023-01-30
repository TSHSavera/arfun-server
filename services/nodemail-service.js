require("dotenv").config();
const {
  getResetPassMailText,
  getResetPassMail,
} = require("../views/resetpass-view-mail");

const nodemailer = require("nodemailer");
const { auth } = require('./firebase-service');
const path = require("path");



async function initMailTransporter() {
  return nodemailer.createTransport({
    service: process.env.SVC_MAIL_SVC,
    auth: {
      user: process.env.SVC_MAIL_USER,
      pass: process.env.SVC_MAIL_PASS
    },
  });
}

function sendPasswordResetMail(name, email, password) {
  var displayName = name.toLocaleLowerCase().split(" ")[0];
  displayName = displayName[0].toUpperCase() + displayName.substring(1);
  
  var cid = {
    topBanner: "topmailbanner",
    lowerBanner: "bottommailbanner",
  };

  return new Promise(async (resolve, reject) => {
    // generate password reset link
    var resetLink = await auth.generatePasswordResetLink(email);

    const config = {
      from: process.env.TEAM_NAME,
      to: email,
      subject: `ARFUN Account Created for ${displayName}`,
      text: getResetPassMailText(displayName, email, password, resetLink),
      html: getResetPassMail(displayName, email, password, resetLink, cid),
      attachments: [
        {
          filename: "emptpbn.png",
          path: path.join(__dirname, "assets", "email_top_banner.png"),
          cid: cid.topBanner,
        },
        {
          filename: "empbtbn.png",
          path: path.join(__dirname, "assets", "email_lower_banner.png"),
          cid: cid.lowerBanner,
        },
      ],
    };

    var mailTransporter = await initMailTransporter();

    mailTransporter.sendMail(config, function (error, info) {
      if (error) {
        console.log(error);
        return reject(error);
      }

      return resolve(info);
    });
  });
}

module.exports = { sendPasswordResetMail };
