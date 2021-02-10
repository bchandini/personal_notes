//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const homeStartingContent = "Hi! This is Mary Bernard, Welcome to my Journal!";
const aboutContent = "Hi! This is Mary Bernard, I would like to share a bit of my story with you.";
const contactContent = "You can drop me an Email ";
const errorContent = "Username or Paswword is Incorrect";
const thankyouContent = "Will get back to you shortly   on the query";
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-user:Corp2020$@realmcluster.r5zwp.mongodb.net/blogger?retryWrites=true&w=majority", {useNewUrlParser: true});
let emailuser= "";
const postSchema = {
  title: String,
  content: String,
};

const userSchema =new mongoose.Schema({
  email: String,
  password: String
});

const querySchema = {
  userid: String,
  query: String,
};

var secret = "Thisisthesecretstring";
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });

const User = mongoose.model("User", userSchema);

const Post = mongoose.model("Post", postSchema);

const Query =  mongoose.model("Query", querySchema);

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
});

app.post("/register", function(req, res){
 const newUser = new User({
    email: req.body.username,
    password: req.body.password
 });
 
 User.findOne({email: req.body.username}, function(err, foundUser){
  if(err)
  {
    console.log(err);
  }else{
        if(foundUser){
          if(foundUser.password === req.body.password){
            emailuser = req.body.username;
            res.redirect("/home");              
          }else{
            newUser.save(function(err){
            if(err){
                console.log(err);
            }else{
              emailuser = req.body.username;
              res.redirect("/home");
            }
          });
        }            
       }
       else {
        newUser.save(function(err){
          if(err){
              console.log(err);
          }else{
           emailuser = req.body.username;
           res.redirect("/home");
          }
        });
      }
    }
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
              emailuser = req.body.username;
              res.redirect("/home");              
            }else{
              res.redirect("/error");
            }
        }else{
            res.redirect("/error");
          
        }
    }
 })

});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.get("/question", function(req, res){
  res.render("question");
});

app.post("/question", function(req, res){
    const query = new Query({
      userid: emailuser,
      query: req.body.postQuestion,
  });
  
  query.save(function(err){
    if (!err){
        res.redirect("/thankyou");
    }
  });
});

app.post("/compose", function(req, res){
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });

  post.save(function(err){
    if (!err){
        res.redirect("/home");
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

app.get("/error", function(req, res){
  res.render("error", {errorContent: errorContent});
});

app.get("/thankyou", function(req, res){
  res.render("thankyou", {thankyouContent: thankyouContent});
});


app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
