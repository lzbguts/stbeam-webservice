import express from 'express';
import cors from 'cors';
import routes from './routes';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

var app = express();

mongoose.set("strictQuery", false);
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@guts-cluster.fereejj.mongodb.net/stbeam`);

app.use(cors());
app.use(express.json());
app.use(routes)

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`STBeam WebService running on port ${PORT}.`);
});