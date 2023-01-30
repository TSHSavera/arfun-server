require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

const { StatusCodes, ReasonPhrases } = require("http-status-codes");

let httpServer = http.createServer(app);
let PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(require('./routes/login-handler.js')());

app.use(require("./routes/quiz-handler")());

app.use(require('./routes/usercreate-handler')());

app.get("/", (req, res) => {
  res.status(StatusCodes.OK).json({
    title: "Waiting for request...",
    status: StatusCodes.OK,
  });
});

app.all("*", (req, res) => {
  res.status(StatusCodes.METHOD_NOT_ALLOWED).json({
    status: StatusCodes.METHOD_NOT_ALLOWED,
    title: ReasonPhrases.METHOD_NOT_ALLOWED,
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running at port : ${PORT}`);
});
