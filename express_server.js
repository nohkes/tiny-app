var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");



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


app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
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
  res.render("urls_new");

});


app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
  						longURL: urlDatabase    };
  res.render("urls_show", templateVars);

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