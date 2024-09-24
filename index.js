const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { title } = require("process");

const app = express();
const port = process.env.PORT || "8000";

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

// Sample user storage (replace with a database in a real application)
let users = [];

// Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    // Handle successful login
    res.redirect("/index", { title: "Home"}); // Redirect to home or dashboard
  } else {
    // Handle login error
    res.render("login", { title: "Login", error: "Invalid credentials" });
  }
});

// Signup route
app.post("/signup", (req, res) => {
  const { username, email, password } = req.body;
  // Check if the user already exists
  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    // Handle user exists error
    res.render("signup", { title: "Sign Up", error: "User already exists" });
  } else {
    // Add the new user
    users.push({ username, email, password });
    res.redirect("/login"); // Redirect to login after signup
  }
});

app.get("/", (req, res) => {
    res.render("login", { title: "Login" });
});

app.get("/user", (req, res) => {
    res.render("user", { title: "Profile", userProfile: { nickname: "RMJ" } });
});

app.get("/ground", (req, res) => {
    res.render("ground", { title: "Ground Type" });
});

app.get("/AG", (req, res) => {
    res.render("AG", { title: "Artificial Ground" });
});

app.get("/FG", (req, res) => {
    res.render("FG", { title: "Football Ground" });
});

app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});
