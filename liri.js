require('dotenv').config();
const keys = require('./keys.js');
const Spotify = require('node-spotify-api');
const axios = require('axios');
const omdb = require('omdb');
const moment = require('moment');
const fs = require('fs');
let spotify = new Spotify(keys.spotify);
const [node, js, type, ...arr] = process.argv;
let input = arr.join(' ');
switch(type) {
  case("concert-this"): 
    gettingConcert(input);
    break;
  case("spotify-this-song"):
    gettingSong(input);
    break;
  case("movie-this"):
    gettingMovie(input);
  break;
  case("do-what-it-says"):
    
  break;
  default: 
    // gettingRandom();
  break;
}

function gettingConcert(input) {
  axios.get("https://rest.bandsintown.com/artists/" + input + "/events?app_id=codingbootcamp")
  .then(function(response) {    
    
      for (var i = 0; i < response.data.length; i++) {

          var datetime = response.data[i].datetime; //Saves datetime response into a variable
          var dateArr = datetime.split('T'); //Attempting to split the date and time in the response
          var concertResults = 
              "--------------------------------------------------------------------" +
                  "\nVenue Name: " + response.data[i].venue.name + 
                  "\nVenue Location: " + response.data[i].venue.city +
                  "\nDate of the Event: " + moment(dateArr[0], "YYYY-MM-DD").format("MM-DD-YYYY"); //dateArr[0] should be the date separated from the time
          console.log(concertResults);
      }
  })
  .catch(function (error) {
      console.log(error);
  });
}

function gettingSong(input) {
  if(!input){
    input = "The Sign"
    spotify
    .search({ type: 'track', query: input})
    .then(function(response) {
      const {tracks: {items}} = response;
      items
      .filter(item => item.artists.filter(artist => artist.name === "Ace of Base").length !== 0)
      .map(item => {
        const {album: {name: albumName}, artists, name, preview_url} = item;
        const songResult = `-------------------------------- 
        Song's name : ${name}
        album's name : ${albumName}
        Artists : ${artists.map(artist => artist.name).join(', ')}
        Preview Url : ${preview_url}`;
        console.log(songResult)
        storingOutputData(songResult);
      });
    })
    .catch(function(err) {
      console.log(err);
    });
  } else {
    spotify
    .search({ type: 'track', query: input})
    .then(function(response) {
      const {tracks: {items}} = response;
      items.map(item => {
        const {album: {name: albumName}, artists, name, preview_url} = item;
        const songResult = `-------------------------------- 
        Song's name : ${name}
        album's name : ${albumName}
        Artists : ${artists.map(artist => artist.name).join(', ')}
        Preview Url : ${preview_url}`;
        console.log(songResult)
        storingOutputData(songResult);
      });
    })
    .catch(function(err) {
      console.log(err);
    });
  }
}

function gettingMovie(input) {
  if(!input){
      input = "mr nobody";
  }
  axios.get("https://www.omdbapi.com/?t=" + input + "&y=&plot=short&apikey=trilogy")
  .then(function(response) {
    const {data: {Title, Year, imdbRating, Country, Language, Plot, Actors, Ratings}} = response;
    let rottenTomatoesRating;
    if(Ratings.length !==0) {
      if(Ratings.filter(rating => rating.Source === "Rotten Tomatoes").length !== 0) {
        rottenTomatoesRating = Ratings.filter(rating => rating.Source === "Rotten Tomatoes")[0].Value;
      } else {
        rottenTomatoesRating = "N/A";
      }
    } else {
      rottenTomatoesRating = "N/A";
    }
    var movieResults = `-----------------------
    Movie Title: ${Title}
    Year of Release:${Year}
    IMDB Rating: ${imdbRating}
    Rotten Tomatoes Rating : ${rottenTomatoesRating}
    Country Produced: ${Country}
    Language: ${Language}
    Plot: ${Plot}
    Actors/Actresses: ${Actors}`;
    console.log(movieResults);
    storingOutputData(movieResults)
  })
  .catch(function (error) {
      console.log(error);
  });
}

function gettingInputFromRandomtxt() {
  fs.readFile('random.txt', "utf8",function(err, res) {
    if(err) {
      return console.log(err);
    }
    let inputArr = res.replace(/"/g, '').replace(/\n/g, ',').trim().split(',');
    let inputObject = inputArr.filter(input => inputArr.indexOf(input) % 2 === 0);
    let values = inputArr.filter(input => inputArr.indexOf(input) % 2 === 1);
    
    return inputObject.map(x=> ({type: x,name: values[inputObject.indexOf(x)]}));
  });
}


function storingOutputData(data) {
    fs.appendFile('log.txt', data + '\n', function (err) {
        if (err) throw err
    })
}
