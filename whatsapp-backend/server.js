// importing from
import express from 'express'
import mongoose from 'mongoose'
import Messages from './dbMessages.js';
import Pusher from "pusher"
import Cors from 'cors'

// app config

const app = express();
const port = process.env.PORT || 9000;


const pusher = new Pusher({
  appId: '1078330',
  key: '0ebaac0edefbb5a2867d',
  secret: 'ae6f2f8f64056448de1c',
  cluster: 'eu',
  encrypted: true
});

const db = mongoose.connection

db.once("open", () => {
    console.log("DB connected");

    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();
    //console.log(msgCollection)

    changeStream.on("change", (change) => {
        console.log("A Change occurred", change);

        if(change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted', 
                {
                    name: messageDetails.name, 
                    message: messageDetails.message,
                    timestamp: messageDetails.timestamp, 
                    recieved: messageDetails.recieved
                });
        } else {
            console.log('Error triggering pusher')
        }
    })
});

// middleware
app.use(express.json());    
app.use(Cors());
app.use((req, res, next)  => {
    req.header("Access-Control-Allow-Origin", "*");
    req.header("Access-Control-Allow-Headers", "*");
    next();
})

// DB config
const connection_url = 'mongodb+srv://<username>:<password>@cluster0.jzfxr.mongodb.net/<dbname>?retryWrites=true&w=majority'

mongoose.connect(connection_url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {console.log("Connected!")})
.catch((err) => console.log(err));

// ????? 



// DB 

// api routers
app.get('/', (req, res) => {res.status(200).send("Hello world")})

app.get('/messages/sync', (req, res) => {
    Messages.find((err, data) => {
        if(err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(data);
        }
    })
})

app.post('/messages/new', (req, res) => {
    const dbMessages = req.body;

    Messages.create(dbMessages, (err, data) => {
        if(err) {
            res.status(500).send(err);
        } else {
            res.status(201).send(data);
        }
    });
});

// listener

app.listen(port, () => {console.log(`Listening on localhost:${port}`);})