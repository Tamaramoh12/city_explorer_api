'use strict';
//Configurations/////////////////////////////////////////////
//express
let express = require('express');
let app = express();
//dotenv
require('dotenv').config();
//PORT
const PORT = process.env.PORT;
//cors - allow the other domains to get data from my server
let cors = require('cors');
app.use(cors());
///////////////////////////////////////////////////////////


//Location/////////////////////////////////////////////////
app.get('/location' , handleLocation);
function handleLocation(request,response){
    try{
        //getting the data
        let city = request.query.city; //city is the name of the param, we took it form the browser form the network tap in the inspector 
        let jsonData = require('./data/location.json'); //we take the other data from the location.json file
        let jsonObject = jsonData[0]; //targeting the data from the json file, it's an array of one object so we took the first element in the array 
        //pass the data by creating an object
        let locationObject = new Location(city,jsonObject.display_name,jsonObject.lat,jsonObject.lon);
        //send response to the client as json 
        response.status(200).json(locationObject); 
    }catch(error){
        response.status(500).send('Sorry, Something went wrong');
    }
}
//location constructor
function Location(search_query,formatted_query,latitude,longitude){ //we took the constructor parameters from the sample output 
    this.search_query = search_query;
    this.formatted_query = formatted_query;
    this.latitude = latitude;
    this.longitude = longitude;
}
///////////////////////////////////////////////////////////

//Weather/////////////////////////////////////////////////

app.get('/weather' , handleWeather);
function handleWeather(request,response){
    //an array to push all the weather objects in.
    let arrOfWeatherObjects = [];
    try{
        //getting the data
        let jsonData = require('./data/weather.json'); //we take the data from the weather.json file
        let jsonObjectDataArray = jsonData.data; //targeting the data array from the weather.json file. 
        //loop over the data array in the weather.json file
        jsonObjectDataArray.forEach((value) => {
            //pass the data by creating an object
            let weatherObject = new Weather(value.weather.description,value.valid_date);
            //save the weatherObject values inside an array
            arrOfWeatherObjects.push(weatherObject);
        });
        //send response to the client as json 
        response.status(200).send(arrOfWeatherObjects); 
    }catch(error){
        response.status(500).send('Sorry, Something went wrong');
    }
}
//weather constructor
function Weather(forecast,time){ //we took the constructor parameters from the sample output 
    this.forecast = forecast; //description
    this.time = new Date(time).toDateString(); //valid_date
}
///////////////////////////////////////////////////////////

//listen to the port//////////////////////////////////////
app.listen(PORT , () => {
    console.log(`app is listening on port ${PORT}`);
});