'use strict';
//Configurations/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//packages
require('dotenv').config();
let express = require('express');
let cors = require('cors');
let superAgent = require('superagent');
let pg = require('pg');
const { response } = require('express');
let app = express();
app.use(cors());
//DB
const DATABASE_URL = process.env.DATABASE_URL;
let client = new pg.Client(DATABASE_URL);
//port
const PORT = process.env.PORT;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let globalCity = 'london'; //london for test

//Location starts here//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/location', handleLocation);
let geoAPIKey = process.env.GEOCODE_API_KEY;
//add try and catch 
function handleLocation(request, response) {
    try {
        let city = request.query.city;
        globalCity = city;
        getDataFromDataBase(city).then((data) => {
            response.send(data);
        }).catch(error => {
            console.log('error in handleLocation')
        });
    }
    catch (error) {
        response.status(500).send('Sorry, something went wrong');
    }
}

//function to get data from database
function getDataFromDataBase(city) {
    console.log('test ..... getDataFromDataBase');
    let query = 'SELECT search_query,formatted_query,latitude,longitude FROM locations WHERE search_query = $1';
    let values = [city];

    return client.query(query, values).then(result => {
        if (result.rowCount !== 0) {
            console.log('test ..... get city from DB');
            return result.rows[0];
        } else {
            return getDataFromAPI(city);
        }
    });
}
//function to get data from API
function getDataFromAPI(city) {
    console.log('test ..... getDataFromAPI');
    return superAgent.get(`https://eu1.locationiq.com/v1/search.php?key=${geoAPIKey}&q=${city}&format=json`).
        then((data) => {
            const geoAPIdata = data.body[0];
            let locationObject = new Location(city, geoAPIdata.display_name, geoAPIdata.lat, geoAPIdata.lon);
            console.log('test ..... create locationObject from API');
            let addToDB = 'INSERT INTO locations(search_query,formatted_query,latitude,longitude)VALUES($1,$2,$3,$4);';
            let insertionValues = [city, geoAPIdata.display_name, geoAPIdata.lat, geoAPIdata.lon];
            client.query(addToDB, insertionValues).then(result => {
                console.log('test ..... insert to DB');
            }).catch(error => {
                console.log('error in getDataFromAPI, insert into DB');
            });
            return locationObject;
        });
}

// location constructor
function Location(search_query, formatted_query, latitude, longitude) {
    this.search_query = search_query;
    this.formatted_query = formatted_query;
    this.latitude = latitude;
    this.longitude = longitude;
}
//Location starts here//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//Weather starts here//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/weather', handleWeather);

//add try and catch 
function handleWeather(request, response) {
    let weatherArray = [];
    let weatherAPIkey = process.env.WEATHER_API_KEY;
    let search_query = request.query.search_query;

    try {
        superAgent.get(`https://api.weatherbit.io/v2.0/forecast/daily?city=${search_query}&key=${weatherAPIkey}`).
            then((dataX) => {
                dataX.body.data.map(rain => {
                    let weatherObj = new Weather(search_query, rain);
                    weatherArray.push(weatherObj);
                });
                // console.log(weatherAPIdata);
                // response.send(weatherAPIdata);
                response.send(weatherArray);
                // response.status(200).send(weatherArray);
            });
    }
    catch (error) {
        response.status(500).send('Sorry, something went wrong');
    }
}
// weather constructor
function Weather(search_query, rain) {
    this.search_query = search_query;
    this.forecast = rain.weather.description;
    this.time = rain.datetime;
}
//Weather starts here//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//Trails start here//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/trails', handleTrail);

//add try and catch 
function handleTrail(request, response) {
    let trailAPIkey = process.env.TRAIL_API_KEY;

    try {
        superAgent.get(`https://www.hikingproject.com/data/get-trails?lat=${request.query.latitude}&lon=${request.query.longitude}&maxDistance=100&key=${trailAPIkey}`).
            then((data) => {
                const trailsData = data.body.trails;

                // response.send(trailsData); //display on browser

                let trailsArray = trailsData.map((element) => {
                    let trailObject = new Trails(element);
                    return trailObject;
                });
                response.send(trailsArray);
            });
    }
    catch (error) {
        response.status(500).send('Sorry, something went wrong');
    }
}

// trails constructor
function Trails(trailsData) {
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


//Movies start here//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/movies', handleMovies);

//add try and catch 
function handleMovies(request, response) {
    let moviesAPIkey = process.env.MOVIES_API_KEY;
    try {
        superAgent.get(`https://api.themoviedb.org/3/search/movie?api_key=${moviesAPIkey}&query=${globalCity}`).
            then((data) => {
                const moviesData = data.body.results;

                let moviesArray = moviesData.map((element) => {
                    let moviesObject = new Movie(element);
                    return moviesObject;
                });
                response.send(moviesArray);
            }).catch(error => {
                console.log('error in handleMovies');
            });
    }
    catch (error) {
        response.status(500).send('Sorry, something went wrong');
    }
}

// Movies constructor
function Movie(element) {
    this.title = element.title;
    this.overview = element.overview;
    this.average_votes = element.vote_average;
    this.total_votes = element.vote_count;
    this.image_url = `https://image.tmdb.org/t/p/w500${element.poster_path}`;
    this.popularity = element.popularity;
    this.released_on = element.release_date;
}
//Movies end here//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Yelp starts here////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/yelp', handleYelp);

//add try and catch 
function handleYelp(request, response) {
    let yelpAPIkey = process.env.YELP_API_KEY;
    try {
        let obj = {
            location: globalCity,
            term: 'resturant',
        }
        superAgent.get(`https://api.yelp.com/v3/businesses/search`).query(obj).set('Authorization', `Bearer ${yelpAPIkey}`).
            then((data) => {
                const yelpData = data.body.businesses;

                let yelpArray = yelpData.map((element) => {
                    let yelpObject = new Yelp(element);
                    return yelpObject;
                });
                response.send(yelpArray);
            }).catch(error => {
                console.log('error in handleYelp');
            });
    }
    catch (error) {
        response.status(500).send('Sorry, something went wrong');
    }
}
//yelp constructor
function Yelp(element){
    this.name = element.name;
    this.image_url = element.image_url;
    this.price = element.price;
    this.rating = element.rating;
    this.url = element.url;
}

//yelp end here//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Connecting to DB///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
client.connect().then(() => {
    app.listen(PORT, () => {
        console.log(`App listening to port ${PORT}`);
    });
}).catch(err => {
    console.log('Sorry ... an error occured ..', err);
});

// app.listen(PORT, ()=>{
//     console.log(`app is listening on port ${PORT}`);
// });

