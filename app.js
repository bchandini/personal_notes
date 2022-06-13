//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require('mongoose-encryption');
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

let usercred = "";

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://admin-user:Corp2020$@realmcluster.r5zwp.mongodb.net/secrets?retryWrites=true&w=majority", {useNewUrlParser: true});
mongoose.set("useCreateIndex", true);

const userSchema =new mongoose.Schema({
  email: String,
  password: String
});

const secretSchema = new mongoose.Schema({
  userid: String,
  content: String,
  date: String
});

const secret = process.env.SECRET;

//userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

secretSchema.plugin(encrypt, { secret: secret, encryptedFields: ["content"] });
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
  done(user.googleId, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "https://agile-taiga-93732.herokuapp.com/auth/google/notes",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
function(accessToken, refreshToken, profile, cb) {
   usercred = profile.emails[0].value;   
   User.findOrCreate({ email: profile.emails[0].value, username: profile.id }, function (err, user) {
        return cb(err, user);
    });    
 }
));

const Post = new mongoose.model("Post", secretSchema);

app.get("/", function(req, res){
  res.render("home");
});

app.get('/auth/google',
  passport.authenticate('google', { scope: [
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email"] }),
  function(accessToken, refreshToken, profile, done) {
    console.log(profile.emails[0].value);
  }); 
  
  app.get('/auth/google/notes', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
     res.redirect('/notes');
  });

/*
app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

*/
app.get("/notes", function(req, res){
  if(req.isAuthenticated()){
  res.render("notes");
  }else{
    res.redirect("/");
  }
});

app.get("/submit", function(req, res){
  if(req.isAuthenticated()){
    res.render("submit");
    }else{
      res.redirect("/");
    }
  
});


app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.get("/post", function(req, res){
 
  Post.find({}, function(err, posts){
    if(err){
      console.log(err);
    }else{   
      let userpost = []; 
      let userdate = [];
      let userpostid = [];
      
      for(i=0;i<posts.length;i++){     
                 
        if(posts[i].userid === usercred){
          userpost[i] = posts[i].content;  
          userdate[i] = posts[i].date; 
          userpostid[i] = posts[i]._id;              
          
          }
        else{
          userpost[i] = "";
          userdate[i] = "";
          userpostid[i] = "";            
        }
      }    
      userpost = userpost.filter(function (el) {
        return el != '';
      });
      
      userdate = userdate.filter(function (el) {
        return el != '';
      });

      userpostid = userpostid.filter(function (el) {
        return el != '';
      });


      console.log("userdate "+userdate+"userpost "+userpost)+"postid"+userpostid;  
      
      if(req.isAuthenticated()){
        res.render("post", {  
          userpost: userpost,
          userdate: userdate,
          userpostid: userpostid
       });
        }else{
          res.redirect("/");
        }
     
      
    }
  });

});

app.get("/posts/:postId", function(req, res){
  const requestedPostId = req.params.postId;
  if(req.isAuthenticated()){      
    Post.findOne({_id: requestedPostId}, function(err, post){
      res.render("newpost", {
        title: post.date,
        content: post.content
      });
    })
    }
    else{
      res.redirect("/");
    }  
  });

/*
  app.post("/register", function(req, res){
    User.register({email: req.body.username,username: req.body.username},req.body.password, function(err,user){
      if(err){
          console.log(err);
          res.redirect("/register");
      }else{
        passport.authenticate("local")(req, res, function(){
          usercred = req.body.username;
          res.redirect("/notes");
        })
      }
    })
  });

  app.post("/login", function(req, res){
    const user = new User({
      username: req.body.username,
      password: req.body.password
    });
    req.login(user, function(err){
      if(err){
        console.log(err);  
        res.redirect("/")      
      }else{
        passport.authenticate("local")(req, res, function(){
          usercred = req.body.username;
          res.redirect("/notes");
        })
      }
    })
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
        usercred = req.body.username;
         res.render("notes");
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
                usercred = req.body.username;
                res.render("notes");
            }
        }
    }
 })

});*/

app.post("/submit", function(req, res){
  let today = new Date();
  let options = {
      weekday: "long",
      day: "numeric",
      month: "long"
  };

  let day = today.toLocaleDateString("en-US", options);    
  const newPost = new Post({
    userid: usercred,
    content: req.body.secret,
    date: day
 });
 newPost.save(function(err){
     if(err){
         console.log(err);
     }else{
         res.render("notes");
    }
 })
})


app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000.");
});
