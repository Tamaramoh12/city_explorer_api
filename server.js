'use strict';
//Configurations/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//packages
require('dotenv').config();
let express = require('express');
let cors = require('cors');
let superAgent = require('superagent');
let bg = require('bg');
const { response } = require('express');
let app = express();
app.use(cors());
//DB
const DATABASE_URL = process.env.DATABASE_URL;
let client = new pg.Client(DATABASE_URL);
//port
const PORT = process.env.PORT;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//Location starts here//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/location',handleLocation);

//add try and catch 
function handleLocation(request,response){
    try{
        let geoAPIKey = process.env.GEOCODE_API_KEY; 
        let city = request.query.city;     
        getDataFromDataBase();
        //getting the city from the url
        superAgent.get(`https://eu1.locationiq.com/v1/search.php?key=${geoAPIKey}&q=${city}&format=json`).
        then((data)  => {
            const geoAPIdata = data.body[0];
            let locationObject = new Location(city,geoAPIdata.display_name,geoAPIdata.lat,geoAPIdata.lon);

            response.status(200).json(locationObject);
        });
    }
    catch(error){
        response.status(500).send('Sorry, something went wrong');
    }
}

//function to get data from database
function getDataFromDataBase(){
    let quert = 'SELECT * FROM locations WHERE search_query = $1';
    let values = [city];

    return client.query(query,values).then(result =>{
        // console.log(result);
        return result;
    });
}


// location constructor
function Location(search_query,formatted_query,latitude,longitude){
    this.search_query = search_query;
    this.formatted_query = formatted_query;
    this.latitude = latitude;
    this.longitude = longitude;
}
//Location starts here//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//Weather starts here//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/weather',handleWeather);

//add try and catch 
function handleWeather(request,response){
    let weatherArray = [];
    let weatherAPIkey = process.env.WEATHER_API_KEY;
    let search_query = request.query.search_query;    
    
    try{
        superAgent.get(`https://api.weatherbit.io/v2.0/forecast/daily?city=${search_query}&key=${weatherAPIkey}`).
        then((dataX) => {
            dataX.body.data.map(rain => {
                let weatherObj = new Weather(search_query,rain);
                weatherArray.push(weatherObj);  
            });
            // console.log(weatherAPIdata);
            // response.send(weatherAPIdata);
            response.send(weatherArray);
            // response.status(200).send(weatherArray);
        });
    }
    catch(error){
        response.status(500).send('Sorry, something went wrong');
    }
}
// weather constructor
function Weather(search_query,rain){ 
    this.search_query = search_query;
    this.forecast = rain.weather.description;
    this.time = rain.datetime;
}
//Weather starts here//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//Trails start here//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/trails',handleTrail);

//add try and catch 
function handleTrail(request,response){
    let trailAPIkey = process.env.TRAIL_API_KEY;
    
    try{
        superAgent.get(`https://www.hikingproject.com/data/get-trails?lat=${request.query.latitude}&lon=${request.query.longitude}&maxDistance=100&key=${trailAPIkey}`).
        then((data) => {
            const trailsData = data.body.trails;

            // response.send(trailsData); //display on browser

            let trailsArray = trailsData.map((element) =>{
                let trailObject = new Trails(element);
                return trailObject;
            });
            response.send(trailsArray);
        });
    }
    catch(error){
        response.status(500).send('Sorry, something went wrong');
    }
}

// trails constructor
function Trails(trailsData){ 
    this.name = trailsData.name;
    this.location = trailsData.location;
    this.length = trailsData.length;
    this.stars = trailsData.stars;
    this.star_votes = trailsData.star_votes;
    this.summary = trailsData.summary;
    this.trail_url = trailsData.trail_url;
    this.conditions = trailsData.conditions;
    this.condition_date = trailsData.condition_date;
    this.condition_time = trailsData.condition_time;
}
//Trails end here//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//Connecting to DB//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
client.connect().then(()=>{
    app.listen(PORT, ()=>{
      console.log(`App listening to port ${PORT}`);
    });
  }).catch(err =>{
    console.log('Sorry ... an error occured ..', err);
  });

// app.listen(PORT, ()=>{
//     console.log(`app is listening on port ${PORT}`);
// });

