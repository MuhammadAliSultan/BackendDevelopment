import express from "express";
const app=express();
app.get("/get", (req, res) => {    

    
    console.log("Hello There")
    res.send("Hello World");

})


export {app};
