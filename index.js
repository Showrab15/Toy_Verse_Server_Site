const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//middleware of the server site
app.use(cors());
app.use(express.json());


//home server path
app.get('/', (req, res) => {
  res.send('Assignment Eleven is running')
})


//mongodb uri with password and username of the projects
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j5l9lxb.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});







async function run() {
  try {


    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();


    //collection of my database with the name of toysCollection
    const toysCollection = client.db('ToysDB').collection('allToys');



    //url for the search by name in my toy pages
    app.get('/searchByName/:text', async (req, res) => {
      const searchText = req.params.text;
      const result = await toysCollection.find({
        $or: [
          { toyName: { $regex: searchText, $options: "i" } }
        ],
      })
        .toArray()
      res.send(result)
    })


    //server url for the all toys by added user
    app.get('/allToys', async (req, res) => {
      const result = await toysCollection.find().limit(20).toArray();
      res.send(result)
    })


    app.get('/allToys/:subCategory', async (req, res) => {
      const category = req.params.subCategory;
      const result = await toysCollection.find({ toyCategory: category }).toArray()
      res.send(result)
    })

    //server url for the added toys in the client site by user
    app.post("/addedToys", async (req, res) => {
      const body = req.body;
      const result = await toysCollection.insertOne(body);
      res.send(result);
      console.log(result);

    });



    //server url for ony matched email by the user visit the client site
    app.get('/myToys/:email', async (req, res) => {
      const email = req.params.email

      const type = req.query.sort;
      if (type == "ascending") {
        let result = await toysCollection.find({ sellerEmail: email }).sort({ toyPrice: 1 }).toArray();
        res.send(result)
      }
      else if (type == 'descending') {
        let result = await toysCollection.find({ sellerEmail: email }).sort({ toyPrice: -1 }).toArray()
        res.send(result)
      }
      else {
        let result = await toysCollection.find({ sellerEmail: email }).toArray()
        res.send(result)

      }

    })





    //route for user know the details for single product in client site
    app.get('/toy-details/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.findOne(query);
      res.send(result);
    })





    //route for update url , then client site user can update her/his data
    app.put('/updatedtoysData/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedToys = req.body;

      const toys = {
        $set: {
          toyPrice: updatedToys.toyPrice,
          toyQuantity: updatedToys.toyQuantity,
          toyDetails: updatedToys.toyDetails,
        }
      }
      const result = await toysCollection.updateOne(filter, toys, options)
      res.send(result)
    })





    //route for the delete , then user delete his/her added product from the client site
    app.delete('/myToys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.deleteOne(query);
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}



run().catch(console.dir);





app.listen(port, () => {
  console.log(`Assignment Eleven is running on port ${port}`)
})