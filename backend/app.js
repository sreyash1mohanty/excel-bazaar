const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { DBconnection } = require("./database/db.js");
const cors = require("cors");
const User = require("./models/User.js");
const Sheet = require("./models/Sheet");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

DBconnection();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinSheet", (sheetId) => {
    socket.join(sheetId);
    console.log(`User joined sheet: ${sheetId}`);
  });

  socket.on("sheetUpdated", (updatedData) => {
    const { sheetId, data } = updatedData;
    socket.to(sheetId).emit("updateSheet", data);
    console.log(`Sheet ${sheetId} updated`);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

app.post("/signup", async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    if (!(firstname && lastname && password && email)) {
      return res.status(400).json({ message: "Please enter all the fields" });
    }
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashPassword = bcrypt.hashSync(password, 10);
    const user = await User.create({
      firstname,
      lastname,
      email,
      password: hashPassword,
    });
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "2h",
    });
    user.token = token;
    user.password = undefined;
    res.status(201).json({
      message: "You have successfully registered",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      return res.status(400).send("Please enter all the fields");
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send("User not registered");
    }
    const enteredPassword = await bcrypt.compare(password, user.password);
    if (!enteredPassword) {
      return res.status(401).send("Password is incorrect");
    }
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });
    user.token = token;
    user.password = undefined;
    const options = {
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only send cookie over HTTPS in production
      sameSite: "none",
    };
    res.cookie("token", token, options).json({
      message: "You have successfully logged in!",
      success: true,
      token,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Create a new sheet
app.post("/sheets", async (req, res) => {
  try {
    const { userId, title, data } = req.body;

    // Check if userId, title, and data are provided and valid
    if (!userId || !title || !Array.isArray(data)) {
      return res.status(400).send("Bad Request: Missing or invalid fields");
    }

    const sheet = new Sheet({ userId, title, data });
    await sheet.save();
    res.status(201).json(sheet);
  } catch (error) {
    console.error("Error creating spreadsheet:", error); // Log error details
    res.status(500).send("Internal Server Error");
  }
});

// Update a sheet
app.put("/sheets/:id", async (req, res) => {
  try {
    const { data } = req.body;
    const sheet = await Sheet.findByIdAndUpdate(
      req.params.id,
      { data },
      { new: true }
    );
    if (!sheet) return res.status(404).send("Sheet not found");

    // Emit the update event to other clients in the same room
    io.to(req.params.id).emit("updateSheet", sheet.data);

    res.json(sheet);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.get("/sheets/:id", async (req, res) => {
  try {
    const sheet = await Sheet.findById(req.params.id);
    if (!sheet) return res.status(404).send("Sheet not found");
    res.json(sheet);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Get all sheets for a specific user
app.get("/sheets", async (req, res) => {
  try {
    const sheets = await Sheet.find({});
    res.json(sheets);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Delete a sheet
app.delete("/sheets/:id", async (req, res) => {
  try {
    const sheet = await Sheet.findByIdAndDelete(req.params.id);
    if (!sheet) return res.status(404).send("Sheet not found");
    res.json({ message: "Sheet deleted successfully" });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

server.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
