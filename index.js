const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mysql = require('mysql2');
const session = require('express-session'); // Import session middleware
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

// Setup session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,  // Use the strong secret key from the environment variables
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }   // Set 'secure: true' if using HTTPS
}));

// Middleware to make user info available in templates
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Create a connection to the RDS MySQL database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ', err.stack);
    return;
  }
  console.log('Connected to RDS MySQL database');
});

// Login page route (GET)
app.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});

// Login route (POST)
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  
  const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
  db.query(query, [username, password], (err, results) => {
    if (err) {
      return res.status(500).render("login", { title: "Login", error: "Database error" });
    }

    if (results.length > 0) {
      // Store user information in the session
      req.session.user = results[0];
      
      // Redirect to the home page after successful login
      res.redirect("/home");
    } else {
      // Invalid credentials
      res.render("login", { title: "Login", error: "Invalid credentials" });
    }
  });
});

// Signup page route (GET)
app.get("/signup", (req, res) => {
  res.render("signup", { title: "Sign Up" });
});

// Signup form submission route (POST)
app.post("/signup", (req, res) => {
  const { username, email, password } = req.body;

  // Check if the user already exists
  const checkQuery = `SELECT * FROM users WHERE username = ?`;
  db.query(checkQuery, [username], (err, results) => {
    if (err) {
      return res.status(500).render("signup", { title: "Sign Up", error: "Database error" });
    }

    if (results.length > 0) {
      res.render("signup", { title: "Sign Up", error: "User already exists" });
    } else {
      // Add the new user to the database
      const insertQuery = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
      db.query(insertQuery, [username, email, password], (err, result) => {
        if (err) {
          return res.status(500).render("signup", { title: "Sign Up", error: "Database error" });
        }

        // After successful signup, automatically log the user in
        const newUserQuery = `SELECT * FROM users WHERE id = ?`;  // Retrieve the newly created user
        db.query(newUserQuery, [result.insertId], (err, userResult) => {
          if (err) {
            return res.status(500).render("signup", { title: "Sign Up", error: "Database error" });
          }

          // Store the newly signed-up user in the session
          req.session.user = userResult[0];
          
          // Redirect to home page or another desired page
          res.redirect("/home");
        });
      });
    }
  });
});

// Logout route (GET)
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Logout failed");
    }
    res.redirect("/login");
  });
});


// Order page route (GET)
app.get("/order", (req, res) => {
  res.render("Order", { title: "Order" });
});

// Order page (POST)
app.post("/order", (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');  // Redirect if the user is not logged in
  }

  const userId = req.session.user.id;
  const { name, email, phone, address1, address2, city, state } = req.body;
  const address = `${address1}, ${address2 ? address2 + ', ' : ''}${city}, ${state}`;

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 7);

  // Insert the order with address details and formatted date
  const insertOrderQuery = `INSERT INTO orders (user_id, name, email, phone, address, city, state, estimated_delivery_date)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(insertOrderQuery, [userId, name, email, phone, address, city, state, deliveryDate], (err, result) => {
    if (err) {
      return res.status(500).send("Database error");
    }

    // Format the date properly without the time
    const formattedDate = deliveryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    res.render("thankyou", { title: "Thank You", address, estimatedDate: formattedDate });
  });
});

// View user's orders
app.get("/orders", (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');  // Redirect if the user is not logged in
  }

  const userId = req.session.user.id;

  const query = `SELECT * FROM orders WHERE user_id = ?`;
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).send("Database error");
    }

    // Pass both the order details and address to the orders.pug file
    res.render("orders", { title: "Your Orders", orders: results });
  });
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
