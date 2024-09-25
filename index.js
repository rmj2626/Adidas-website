const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 8000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

// Sample user storage (replace with a database in a real application)
let users = [
  {
    username: "RMJ20",
    email: "rudraksha.jejurikar21@pccoepune.org",
    password: "abcd1234"
  },
  {
    username: "Ram",
    email: "r@pm.me",
    password: "RAM"
  }
];

// Login page route (GET)
app.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});

// Login route (POST)
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    // Handle successful login
    res.redirect("/home"); // Redirect to a home or dashboard page
  } else {
    // Handle login error
    res.render("login", { title: "Login", error: "Invalid credentials" });
  }
});

// Signup page route (GET)
app.get("/signup", (req, res) => {
  res.render("signup", { title: "Sign Up" });
});

// Signup form submission route (POST)
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

// Logout route (GET)
app.get("/logout", (req, res) => {
  // Logic for handling logout can be added here if needed
  res.redirect("/login"); // Redirect to login after logging out
});

// Order page route (GET)
app.get("/order", (req, res) => {
  res.render("Order", { title: "Order" });
});

app.post("/order", (req, res) => {
  const { name, email, phone, address1, address2, city, state } = req.body;

  // Constructing the delivery address
  const address = `${address1}, ${address2 ? address2 + ', ' : ''}${city}, ${state}`;
  
  // Calculate estimated delivery date
  const today = new Date();
  const deliveryDate = new Date(today.setDate(today.getDate() + 7));
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const estimatedDate = deliveryDate.toLocaleDateString('en-US', options);

  // Render thank you page with address and estimated delivery date
  res.render("thankyou", { title: "Thank You", address, estimatedDate });
});

// Other routes...
app.get("/", (req, res) => {
    res.render("login", { title: "Login" });
});

// Home page route (GET)
app.get("/home", (req, res) => {
  res.render("index", { title: "Home" }); // Render the home page with the title
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

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
