const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; 
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  secret: 'lighthouselabs'
}));
app.set("view engine", "ejs")


const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    user_id: "userRandomID",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    user_id: "userRandomID",
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "123"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

function urlsForUser(user_id) {
  var userOnly = {};
  for (let key in urlDatabase)
    if (urlDatabase[key].user_id === user_id) {
      userOnly[key] = urlDatabase[key];
    }
  return userOnly;
};

function generateRandomString() {
  let r = Math.random().toString(36).substring(7);
  return r;
}

app.get("/", (req, res) => {
  res.end("Home-Page");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/users.json", (req, res) => {
  res.json(users);
});
// Login 
app.get("/login", (req, res) => {
  let user_id = req.session.user_id;
  res.render("login", { user: users[user_id] } );
});
// Checking email and password + encryption.
app.post("/login", (req, res) => {
  let {email, password} = req.body;
  if (!email || !password) {
    res.send("Enter Username and Password");
  } else {
    let getEmail = Object.values(users).find(obj => obj.email === email);
    if (!getEmail || !bcrypt.compareSync(password, getEmail.password)) {
      res.send(404)
    } else {
      req.session.user_id = getEmail.id;
      res.redirect('urls');
    }
  }
});
//main page
app.get("/urls", (req, res) => {
  let user_id = req.session.user_id;
  let templateVars = {
    user: users[user_id],
    user_id: user_id,
    urlDatabase: urlsForUser(user_id)
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let user_id = req.session.user_id;
  if (user_id) {
    let templateVars = { 
      user_id: user_id, 
      user: users[user_id] 
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  let user_id = req.session.user_id;
  let templateVars = {
    shortURL: req.params.id,
    user: users[user_id],
    longURL: urlDatabase[req.params.id].longURL,
    user_id: req.session.user_id,
    email: req.session["email"]
  };
  res.render("urls_show", templateVars);
});



app.get("/register", (req, res) => {
  res.render("register", { user: users[req.session.user_id] } );
});
//register a new user & encrypts the password
app.post("/register", (req, res) => {
  let user_id = generateRandomString();
  let { email, password } = req.body;
  let hashpassword = bcrypt.hashSync(password, 10)
  if (!req.body.email || !req.body.password) {
    res.send(404);
  } else {
    let getEmail = Object.values(users).find(obj => obj.email === email);
    if (!getEmail) {
      users[user_id] = {id: user_id, email: email, password: hashpassword}
      req.session.user_id = user_id;
      req.session.email = email;
      res.redirect("/urls");
    } else {
      res.send(404);
    }
  }
});


app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  let user_id = req.session.user_id;
  if (longURL) {
    urlDatabase[shortURL] = {
    longURL: longURL,
    user_id: user_id,
    user: users[user_id],
  };;
    res.redirect("/urls");
  } else {
    res.send(404)
  }
});

app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let user_id = req.session["user_id"]
  if (!user_id) {
    res.redirect("/urls");
  } else if (urlDatabase[shortURL].user_id === user_id) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id;
  let user_id = req.session["user_id"]
  if (urlDatabase[shortURL].user_id === user_id) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  }
});


//clears the cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("urls");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

