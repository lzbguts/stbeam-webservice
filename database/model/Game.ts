import mongoose from "mongoose";

const Game = new mongoose.Schema({
    _id: Number,
    name: String,
    views: {
        type: Number,
        default: 1
    }
});


export default mongoose.model("Game", Game);