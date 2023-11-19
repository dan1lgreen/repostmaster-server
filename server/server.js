const express = require("express");
const app = express();
const PORT = process.env.PORT || 4000;
const bodyParser = require("body-parser");
const cors = require("cors");
const sendgrid = require("@sendgrid/mail");
const axios = require("axios");
require("dotenv").config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = (to, from, subject, html) => {
  const msg = { to, from, subject, html };
  return sendgrid.send(msg);
};

const addContactToSendGrid = async (email, name) => {
  try {
    const response = await axios({
      method: "put",
      url: "https://api.sendgrid.com/v3/marketing/contacts",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      data: {
        contacts: [
          {
            email: email,
            first_name: name,
          },
        ],
      },
    });

    console.log("Contact added:", response.data);
  } catch (error) {
    console.error("Error adding contact:", error.response.data);
  }
};

app.post("/send-email", async (req, res) => {
  const { name, email } = req.body;
  try {
    await sendEmail(
      email,
      "info@raamdeluxe.nl", // Your email address
      "Thank you for joining the waitlist!", // Subject
      `Hi ${name},<br><br>We're thrilled to have you on board! 🌟 Your spot on our waitlist is confirmed.<br/><br>We believe that good things come to those who wait, and we promise the wait will be worth it.</br><br>Stay tuned, and don't hesitate to reach out if you have any questions or just want to say hi.</br><br>Kind regards,<br/><br>Team RepostMaster</br>` // Html
    );
    await addContactToSendGrid(email, name);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
