import express from "express"
import cors from "cors"
import 'dotenv/config';
import { MongoClient } from "mongodb";

const app = express()
const PORT = 5000;
app.use(express.json())
app.use(cors())
const DB_URI = process.env.DATABASE_URL;

const client = new MongoClient(DB_URI);
export async function connectToMongoDB() {
    try{
        await client.connect()
        console.log("You Successfully connected to MongoDB!")
        return client
    }catch(err){
        console.dir(err)
    }
}

const mongoClient = await connectToMongoDB()
const db = mongoClient.db("BookNook")
const allBooksCollection = db.collection("Books")




app.get("/",(req,res)=>{
    res.send({massage: "welcome to express backend"})
})


app.listen(PORT,()=>{
    console.log("backend running on port",PORT)
})