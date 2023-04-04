const express = require("express");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const cors = require("cors");
const app = express();
const PORT = 5000;
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });

const adminApi = require("./routes/adminApi");
const studentApi = require("./routes/studentApi");
const teacherApi = require("./routes/teacherApi");
const subAdminApi = require("./routes/subadminApi");

// body parser
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
  );
  if ("OPTIONS" == req.method) {
    res.send(200);
  } else {
    next();
  }
});

app.use("/api/student", studentApi);
app.use("/api/teacher", teacherApi);
app.use("/api/v1/admin", adminApi);
app.use("/api/v1/sub-admin", subAdminApi);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "PAGE NOT FOUND"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something Went Wrong!";
  res.status(statusCode).json(err.message);
});
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
