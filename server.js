let express = require('express');
let cors = require('cors');
let superAgent = require('superagent');
const { response } = require('express');

let app = express();
app.use(cors());

require('dotenv').config();

const PORT = process.env.PORT;


///////////////////////////////////////////location starts here//////////////////////////////////////////////
app.get('/location',handleLocation);

//add try and catch 
function handleLocation(request,response){
    try{
        let geoAPIKey = process.env.GEOCODE_API_KEY; 
        let city = request.query.city;     
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
// location constructor
function Location(search_query,formatted_query,latitude,longitude){
    this.search_query = search_query;
    this.formatted_query = formatted_query;
    this.latitude = latitude;
    this.longitude = longitude;
}
/////////////////////////////////////////////////location end here/////////////////////////////////////



/////////////////////////////////////weather starts here//////////////////////////////////////////////
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
//////////////////////////////////////////////////////weather end here//////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////Trial Starts Here///////////////////////////////////////////////////////////////
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
///////////////////////////////////////////////////////////////Trial Starts Here///////////////////////////////////////////////////////////////

app.listen(PORT, ()=>{
    console.log(`app is listening on port ${PORT}`);
});

