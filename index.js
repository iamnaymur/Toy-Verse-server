const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ac-wscs5t5-shard-00-00.7guimwk.mongodb.net:27017,ac-wscs5t5-shard-00-01.7guimwk.mongodb.net:27017,ac-wscs5t5-shard-00-02.7guimwk.mongodb.net:27017/?ssl=true&replicaSet=atlas-954gd2-shard-0&authSource=admin&retryWrites=true&w=majority`;

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

    const collectionToyDB = client.db("toyVerseDB").collection("categoriesToy");
    const addToyToDB = client.db("toyVerseDB").collection("addToy");

    app.get("/toyCategories", async (req, res) => {
      const result = await collectionToyDB.find().toArray();
      res.send(result);
    });

    app.post("/addedToys", async (req, res) => {
      const added = req.body;
      // console.log(added)
      const result = await addToyToDB.insertOne(added);
      res.send(result);
    });

    app.get("/addedToys/:email", async (req, res) => {
      const filter = {
        projection: {
          price: 1,
          quantity: 1,
          description: 1,
          category: 1,
          name: 1,
        },
      };

      const myToys = await addToyToDB
        .find({ email: req.params.email }, filter)
        .toArray();

      res.send(myToys);
    });

    app.get("/addedToys", async (req, res) => {
      const allToys = await addToyToDB.find().limit(20).toArray();
      res.send(allToys);
    });

    app.get("/addToys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await addToyToDB.findOne(filter);
      res.send(result);
    });

    app.put("/addToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToy = req.body;
      const NewToyInfo = {
        $set: {
          price: updatedToy.price,

          quantity: updatedToy.quantity,

          description: updatedToy.description,
        },
      };
      const result = await addToyToDB.updateOne(query, NewToyInfo, options);
      res.send(result);
    });

    app.delete("/addedToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addToyToDB.deleteOne(query);
      res.send(result);
      console.log(result);
    });

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
  res.send("toy-verse is running");
});

app.listen(port, () => {
  console.log(`toy verse is listening on port ${port}`);
});
