const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.knxp44y.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const taskCollection = client.db("taskDB").collection("tasks");

    app.get("/tasks", async (req, res) => {
      const result = await taskCollection.find().toArray();
      res.send(result);
    });

    app.post("/tasks", async (req, res) => {
      const task = req.body;
      const result = taskCollection.insertOne(task);
      res.send(result);
    });

    app.patch("/tasks/:id", async(req, res) => {
      const id = req.params.id;
      const task = req.body;
      const filter = {_id : new ObjectId(id)};
      const updatedTest = {
        $set : {
          title : task.title,
          description : task.description,
          deadline : task.deadline,
          priority : task.priority,
          status : task.status
        }
      }
      const result = await taskCollection.updateOne(filter, updatedTest);
      res.send(result); 
    })

    app.delete("/tasks/:id", async(req, res) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)};
      const result = await taskCollection.deleteOne(query);
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Task Forge Server is running");
});
app.listen(port, () => {
  console.log(`Task Server is running on port ${port}`);
});
