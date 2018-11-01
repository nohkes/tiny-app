var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')


app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")


function generateRandomString() {
	let r = Math.random().toString(36).substring(7);
	return r;
}

var urlDatabase = { 
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "shortURL": "longURL" 
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}
const getEmailsbyPerson = (actEmail) => {
  // console.log({email});
  // console.log(users);
  for (var key in users) {
    // console.log({key});
    if (users[key].email === actEmail){

      return users[key];
    } 
  }

}


app.get("/login", (req, res) => {
  let user_id = req.cookies["user_id"]
  res.render("login", user_id);

});

app.post("/login", (req, res) => {
      let user_id = req.cookies["user_id"];
      if (!req.body.email || !req.body.password){
        res.send('bad login')
      } 
      else if (req.body.email && req.body.password){ 
         
         const info = getEmailsbyPerson(req.body.email)
         
         if(info.password === req.body.password){
            
            res.cookie("user_id", user_id)
            res.redirect("/urls")
          } 
          else {
            res.send('wrong password')
          }
          
            
    }
});

app.get("/register", (req, res) => {
  let user_id = req.cookies["user_id"]
  res.render("register", user_id);
})


app.post("/register", (req, res) => {
  let user_id = generateRandomString();
   if (!req.body.email || !req.body.password) {
      // res.send('404')login
      console.log('400')
    res.redirect("register")
    } else {
    users[user_id] = {
                 id:user_id,
              email:req.body.email,
           password:req.body.password}
      console.log(users)
  res.cookie('user_id', user_id);
  res.redirect("/urls/" + user_id);
   }
 
});




app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let user_id = req.cookies["user_id"];
  let templateVars = { 
                      urls: urlDatabase,
                   user_id: req.cookies["user_id"],
                      user: users
                 };
  res.render("urls_index", templateVars);
});
app.post("/urls", (req, res) => {
  // console.log(req.body);
  // console.log(req.body.longURL) 
  urlDatabase[generateRandomString()] = req.body.longURL
  console.log(urlDatabase);// debug statement to see POST parameters

  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
	let longURL = urlDatabase[req.params.shortURL] // using the short url against the database
	
	if (urlDatabase[req.params.shortURL] === undefined) {
		res.send('404')
	} else {

  res.redirect(longURL)
}
});


app.get("/urls/new", (req, res) => {
  let user_id = req.cookies["user_id"]
  res.render("urls_new");

});


app.get("/urls/:id", (req, res) => {
  let user_id =  req.cookies["user_id"]
  let templateVars = { shortURL: req.params.id,
  						longURL: urlDatabase,
              user_id: req.cookies["user_id"],
              user : users 
            };
  res.cookie('user_id', user_id) 
  res.render("urls_show", templateVars);

});

app.post("/urls/:id", (req, res) => {
    urlDatabase[req.params.id] = req.body[req.params.id]
    res.redirect("/urls");
});


app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
    console.log(urlDatabase)
    res.redirect("/urls");
});




app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// function compareEmail(input, data){
//   for (var user in data) {
//     if (user[data].email === )
//    }
// }
