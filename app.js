//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const ejs = require("ejs");

const homeStartingContent = "Hi! This is Mary Bernard, Welcome to my Journal!";
const aboutContent = "Hi This is Mary Bernard, I'm a software engineer by profession. This is where I document all of my life's experience. Hope it will help someone to learn from it as much as it has helped me grow";
const contactContent = "You can drop me an email @ marychandinibernard@gmail.com, would love to hear from you";

const app = express();

const posts= [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



app.get("/",function(req,res){
    res.render("home",{homeStartingContent: homeStartingContent,posts: posts});
})

app.get("/about",function(req,res){
    res.render("about",{aboutContent: aboutContent});
})

app.get("/contact",function(req,res){
    res.render("contact",{contactContent: contactContent});
})

app.get("/compose",function(req,res){
    res.render("compose",{posts: posts});
})
app.post("/compose",function(req,res){
    const post = {
        title: req.body.postTitle,
        content: req.body.postText
    };
    posts.push(post);
    res.redirect("/");
})

app.get("/post/:postid",function(req,res){
   const requestedTitle =  _.lowerCase(req.params.postid)
   posts.forEach(function(post){ 
       const storeTitle = _.lowerCase(post.title)
      if(storeTitle == requestedTitle){
          res.render("post",{
              title: post.title,
              content: post.content
          });
      }
   }) 
    //console.log(req.params.postid);
})
app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
