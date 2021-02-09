//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const ejs = require("ejs");
const mongoose = require('mongoose');
const homeStartingContent = "Hi! This is Mary Bernard, Welcome to my Journal!";
const aboutContent = "Hi This is Mary Bernard, I'm a software engineer by profession. This is where I document all of my life's experience. Hope it will help someone to learn from it as much as it has helped me grow";
const contactContent = "You can drop me an email at marychandinibernard@gmail.com, would love to hear from you";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-user:Corp2020$@realmcluster.r5zwp.mongodb.net/blogger?retryWrites=true&w=majority", {useNewUrlParser: true});

const postSchema = {
  title: String,
  content: String,
};

const userSchema = {
  email: String,
  password: String
};

const User = mongoose.model("User", userSchema);

const Post = mongoose.model("Post", postSchema);

app.get("/", function(req, res){
  res.render("main");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});


app.get("/logout", function(req, res){
  res.redirect("/");
});

app.get("/home", function(req, res){
  Post.find({}, function(err, posts){
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
      });
});

app.post("/register", function(req, res){

 const newUser = new User({
    email: req.body.username,
    password: req.body.password
 });
 newUser.save(function(err){
     if(err){
         console.log(err);
     }else{
      res.redirect("/home");
      }
    })
 })

});

app.post("/login", function(req, res){

    const username= req.body.username;
    const password= req.body.password;


  User.findOne({email: username}, function(err, foundUser){
    if(err)
    {
        console.log(err);
    }else{
        if(foundUser){
            if(foundUser.password === password){
              res.redirect("/home");              
            }
        }
    }
 })

});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });


  post.save(function(err){
    if (!err){
        res.redirect("/");
    }
  });
});

app.get("/posts/:postId", function(req, res){

const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId}, function(err, post){
    res.render("post", {
      title: post.title,
      content: post.content
    });
  });

});

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});


app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
