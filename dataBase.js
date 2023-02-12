const mongoose = require('mongoose')

const urlShortenerScema = new mongoose.Schema({
    originalurl: {type: String, required: true},
    shorturl: Number
});
const Url = mongoose.model('urlShortener', urlShortenerScema);

async function RefreshDatabase(){
    await Url.deleteMany({});
}
RefreshDatabase();


module.exports = {Url};