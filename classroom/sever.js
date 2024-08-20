const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const { nextTick } = require("process");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));


const sessionOptions = {
    secret : "mysupersecretstring",
    resave : false,
    saveUninitialized : true 
}
app.use(session(sessionOptions));
app.use(flash());
app.use((req,res,next)=>{
    res.locals.successMsg = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    next();
})

app.get("/register",(req,res)=>{
    let { name = "anonymous"} = req.query;
    req.session.name = name;
    if(name === "anonymous" ){
        req.flash("error","user not registered");
    }else{
        
        req.flash("success","user register successfully");
    }
    
    res.redirect("/hello");
});

app.get("/hello", (req,res)=>{
    res.render("page.ejs",{ name :req.session.name});
})

// app.get("/reqcount",(req,res)=>{
//     if(req.session.count){
//         req.session.count++;
//     }else{
//         req.session.count = 1;
//     }
//     res.send(`you sent a requset ${req.session.count} times`);
// });

// app.get("/tests",(req,res)=>{
//     res.send("test successful");
// })

app.listen(3000,()=>{
    console.log("listening on port 3000");
})



// app.use(cookieParser("secretcode"));

// app.get("/getsignedcookies",(req,res)=>{
//     res.cookie("made-in","India",{ signed : true});
//     res.send("done!!");
// })

// app.get("/verify",(req,res)=>{
//     console.log(req.cookies);
//     console.log(req.signedCookies);
//     res.send("Verified");
// })

// app.get("/getcookies",(req,res)=>{
//     res.cookie("greet","namaste");
//     res.cookie("origin","india");
//     res.send("We sent you a cookie");
// });

// app.get("/greets",(req,res)=>{
//     let {name = "anonymous"} = req.cookies;
//     res.send(`Hi!, ${name}`);
// })

// app.get("/", (req,res)=>{
//     console.dir(req.cookies);
//     res.send("Hi!, I am root route");
// })
