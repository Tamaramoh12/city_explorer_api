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

    let arrOfDays=[];

    try{
        let jsonData = require('./data/weather.json');

        let JsonWatherData = jsonData.data; //target the data array in json file

        JsonWatherData.forEach((value) =>{
         let weatherObject = new Weather(value.weather.description,value.valid_date);
         arrOfDays.push(weatherObject);
        });

        response.status(200).send(arrOfDays);
        
    }
    catch(error){
        response.status(500).send('Sorry, something went wrong');
    }
}
// weather constructor
function Weather(forecast,time){ 
    this.forecast = forecast; //description
    this.time = new Date(time).toDateString() ; //valid_date"
}
//weather end here//

app.listen(PORT, ()=>{
    console.log(`app is listening on port ${PORT}`);
});

