let express = require('express');
let cors = require('cors');
const { response } = require('express');

let app = express();
app.use(cors());

require('dotenv').config();

const PORT = process.env.PORT;

app.get('/location',handleLocation);

//add try and catch 
function handleLocation(request,response){
    try{
        let city = request.query.city;
        let jsonData = require('./data/location.json')
        let jsonObject = jsonData[0];
        let locationObject = new Location(city,jsonObject.display_name,jsonObject.lat,jsonObject.lon);
        response.status(200).json(locationObject);
    }
    catch(error){
        response.status(500).send('Sorry, something went wrong');
    }
}



function Location(search_query,formatted_query,latitude,longitude){
    this.search_query = search_query;
    this.formatted_query = formatted_query;
    this.latitude = latitude;
    this.longitude = longitude;
}

app.listen(PORT, ()=>{
    console.log(`app is listening on port ${PORT}`);
});

