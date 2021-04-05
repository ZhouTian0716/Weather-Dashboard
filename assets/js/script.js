//console.log('hello');
var myApiKey = 'http://api.openweathermap.org/data/2.5/forecast?id=524901&appid=db24224f8e3ca0b3dccfc89d78aedc3a';

// Display date using moment.js
var currentDate = $('#currentDate');
currentDate.text(moment().format("ddd, DD/MM/YYYY"));
//----------------------------------------------------------------------------------- 

var formEl=$('form');
var userSearch=$('#cityInput');
var searchSecEl=$('.searchSection');
var currentSearch = {
    city: "Sydney",
    weather: "Sunny",
    temp: "30'C",
    wind: "6.67MPH",
    humidity: "46%",
    uvIndex: "0.47"
};




var searchHistory =[];
var storedCities = JSON.parse(localStorage.getItem("searchHistory"));



formEl.on('submit', addSearch);

function addSearch(event){
    event.preventDefault();
    var newCityEl= $('<button class="cityBtn">');
    searchSecEl.append(newCityEl);
    newCityEl.text(userSearch.val());
    searchHistory.push(userSearch.val());
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    currentSearch = userSearch.val();
    userSearch.val("");
}

function init(){
    //importain, check if localStorage exists!
    if (storedCities!==null){
        for(var i=0; i<storedCities.length; i++){
            var newCityEl= $('<button class="cityBtn">');
            searchSecEl.append(newCityEl);
            newCityEl.text(storedCities[i]);
        }
    }
    else {return;}
}
init();


//----------------------------------------------------------------------------------- 
var getUserRepos = function (user) {
    var apiUrl = 'https://api.github.com/users/' + user + '/repos';
  
    fetch(apiUrl)
      .then(function (response) {
        if (response.ok) {
          response.json().then(function (data) {
            displayRepos(data, user);
          });
        } else {
          alert('Error: ' + response.statusText);
        }
      })
      .catch(function (error) {
        alert('Unable to connect to GitHub');
      });
  };


// Autocomplete widget
$(function () {
    var cityNames = [
      'Bootstrap',
      'C',
      'C++',
      'CSS',
      'Express.js',
      'Git',
      'HTML',
      'Java',
      'JavaScript',
      'jQuery',
      'JSON',
      'MySQL',
      'Node.js',
      'NoSQL',
      'PHP',
      'Python',
      'React',
      'Ruby',
    ];
    userSearch.autocomplete({
      source: cityNames,
    });
  });