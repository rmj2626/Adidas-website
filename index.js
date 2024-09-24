const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || "8000";

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index", { title: "Home" });
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
