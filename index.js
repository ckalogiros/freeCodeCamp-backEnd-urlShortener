const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv').config();
const mongoose = require('mongoose')

// const VALIDATE_URL = /((http|https):\/\/)(www.|localhost:)(([0-9]{1,6})|([a-z]{1,4}\.[a-z]{2,6}))/
const VALIDATE_URL = /((http|https):\/\/)((www.([0-9]{1,6}))|localhost:|([a-z]{3,110}))/

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));


mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true});


const {Url} = require('./dataBase');


app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
    res.json({ greeting: 'hello API' });
});



app.get('/api/shorturl/:data?', function (req, res) {
    const shorturl = req.params.data;
    console.log('------------------------------------------------- GET:', shorturl)

    Url.findOne({shorturl:shorturl}, function(err, found){
        if(err) {
            return res.json({ error: 'invalid shorturl' });
        }
        // Validate type:url here
        if(!found || found === undefined){
            return res.json({ error: 'Url not found' });
        }
        if(found){
            return res.redirect(found.originalurl)
        }
    })
});


app.post('/api/shorturl/:data?', express.urlencoded({ extended: true }), function (req, res) {
    const url = req.body.url;
    let ascVal = 1;
    
    // Url.findOne({})
    // .sort({shorturl:-1})
    // .exec(function(err, foundMax){
    //     if(err) throw new Error('Mongo failed on findOne:', err);
        
    //     // Validate type:url 
    //     const urlPart = url.split('?')[0];
    //     console.log('++++++++++++++++++++++++++++++++++++++++++++ POST:', urlPart)
    //     const isValidUrl = VALIDATE_URL.test(urlPart);
    //     if(!isValidUrl){
    //         console.log('ERROR invalid url:', urlPart)
    //         return res.json({ error: 'invalid url' });
    //     }
    //     if(foundMax && foundMax !== undefined){
            
    //         /*  If at least one entry exists in the database, search if the original url exists. 
    //             If exists do nothing. 
    //             Else if it does not exist, create a new entry with a shorturl =  the incremented ascVal
    //          */
    //         Url.findOne({ originalurl: url}, function(err, found){
    //             if(!found && found !== undefined){
    //                 ascVal = foundMax.shorturl+1; 
    //                 // Create new database entry. The shortened number is equal to 1 at this point
    //                 console.log('++++++ Creating database entry:', urlPart, ' shorturl:', ascVal)
    //                 const newUrl = new Url({ originalurl: url, shorturl: ascVal });
    //                 newUrl.save();
    //                 return res.json({ original_url : newUrl.originalurl, short_url : newUrl.shorturl})
    //             }
    //             else {
    //                 console.log('oooooo Database entry allready exist:', found.originalurl, ' shorturl:', found.shorturl)
    //                 res.redirect('/')
    //             }
    //         })


    //     }
    //     else{ // Case it's the first entry in the database
    //         console.log('Creating First database entry:', url)
    //         const newUrl = new Url({ originalurl: urlPart, shorturl: ascVal });
    //         newUrl.save();
    //         return res.json({ original_url : newUrl.originalurl, short_url : newUrl.shorturl})
    //     }
    // })

    // const promise = Url.findOne({})
    // .sort({shorturl:-1})
    // .exec();

    // const promise = Url.findOne({}, {shorturl:-1})
    Url.findOne({}, null, { sort: { shorturl: -1 }}, null )
    .exec(function(err, foundMax){
        if(err) 
            throw new Error('Mongo failed on findOne:', err);
        
        // Validate type:url 
        const urlPart = url.split('?')[0];
        console.log('++++++++++++++++++++++++++++++++++++++++++++ POST:', urlPart)
        const isValidUrl = VALIDATE_URL.test(urlPart);
        if(!isValidUrl){
            console.log('ERROR invalid url:', urlPart)
            return res.json({ error: 'invalid url' });
        }
        if(foundMax && foundMax !== undefined){
            
            /*  If at least one entry exists in the database, search if the original url exists. 
                If exists do nothing. 
                Else if it does not exist, create a new entry with a shorturl =  the incremented ascVal
             */
            Url.findOne({ originalurl: url}, function(err, found){
                if(!found && found !== undefined){
                    ascVal = foundMax.shorturl+1; 
                    // Create new database entry. The shortened number is equal to 1 at this point
                    const newUrl = new Url({ originalurl: url, shorturl: ascVal });
                    newUrl.save();
                    return res.json({ original_url : newUrl.originalurl, short_url : newUrl.shorturl})
                }
                else {
                    res.redirect('/')
                }
            })


        }
        else{ // Case it's the first entry in the database
            const newUrl = new Url({ originalurl: urlPart, shorturl: ascVal });
            newUrl.save();
            return res.json({ original_url : newUrl.originalurl, short_url : newUrl.shorturl})
        }
    })
});


app.listen(port, function () { console.log(`Listening on port ${port}`); });
