import express from "express"
import cors from "cors"
import 'dotenv/config';
import { MongoClient, ObjectId } from "mongodb";

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
const borrowsCollection = db.collection("borrows")

app.get("/books", async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) ;
  const result = await allBooksCollection.find().skip((page - 1) * limit).limit(limit).toArray();
  res.send(result);
});
app.get("/book/:id", async(req,res)=>{
    const {id} = req.params
    const result = await allBooksCollection.findOne({_id: new ObjectId(id)})
    res.send(result)
})
app.put("/book/:id", async(req,res)=>{
    const {id} = req.params
    const {ownerEmail, ...data} = req.body
    const result = await allBooksCollection.updateOne(
        {_id: new ObjectId(id), ownerEmail},
        {$set: data},
    )
    res.status(result.matchedCount ? 200 : 403).send(result)
})
app.post("/add", async(req,res)=>{
    const data = req.body
    const result = await allBooksCollection.insertOne(data)
    
    res.send(result)
})
app.get("/my-books/:email", async(req,res)=>{
    const {email} = req.params
    const result = await allBooksCollection.find({ownerEmail:email}).toArray()
    res.send(result)
})

app.post('/borrows', async(req,res)=>{
    const data = req.body;
    const result = await borrowsCollection.insertOne(data)
    const updated = await allBooksCollection.updateOne({_id: new ObjectId(data.bookId)},{ $inc: { availableCopies: - data.quantity } })
    res.send(result)
})
app.post('/return', async(req,res)=>{
    const data = req.body;
    const result = await borrowsCollection.updateOne(
        { email: data.email, bookId: data.bookId },
        { $inc: { quantity: -data.quantity } },
    );
    await borrowsCollection.deleteMany({
        email: data.email,
        bookId: data.bookId,
        quantity: { $lte: 0 },
    });
    await allBooksCollection.updateOne(
        { _id: new ObjectId(data.bookId) },
        { $inc: { availableCopies: +data.quantity } },
    );
    res.send(result);
})

app.get('/borrows/:email', async(req,res)=>{
    const {email} = req.params
    const result = await borrowsCollection.find({email}).toArray()
    res.send(result)
})

app.get("/",(req,res)=>{
    res.send({massage: "Welcome to node & express backend"})
})


app.listen(PORT,()=>{
    console.log("backend running on port",PORT)
})