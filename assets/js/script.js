//console.log('hello');
var myApiKey = 'db24224f8e3ca0b3dccfc89d78aedc3a';
//----------------------------------------------------------------------------------- 
//DOM elements
var formEl=$('form');
var citySearch=$('#cityInput');
var countrySearch=$('#countryInput');
var stateSearch=$('#stateInput');
var clearBtn=$('#clear');
var searchSecEl=$('.searchSection');
//----------------------------------------------------------------------------------- 
//variables for weather search
var localLat; //var localLat=-33.891678;
var localLon; //var localLon=151.1231104;
var searchedCityLat; //Get Latitude from user searched city and country
var searchedCityLon; //Get Longtitude from user searched city and country
//----------------------------------------------------------------------------------- 
//LocalStorage variables
var searchHistory =[];
var storedCities = JSON.parse(localStorage.getItem("searchHistory"));


//----------------------------------------------------------------------------------- 
//check user location
function locateUser() {
  if (navigator.geolocation) {navigator.geolocation.getCurrentPosition(showPosition)}
  else {alert("Geolocation is not supported by this browser.")}
}
function showPosition(position) {
  localLat = position.coords.latitude; 
  localLon = position.coords.longitude;
  init();
}
//----------------------------------------------------------------------------------- 








//----------------------------------------------------------------------------------- 
//to be solved
formEl.on('click', '#clear', clearHistory);
function clearHistory(event){
    event.stopPropagation();
    if (storedCities!==null){
        searchHistory =[];
        localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
     
    }
    else {alert('Please enter a valid CITY NAME');}
}


//-----------------------------------------------------------------------------------
//Add search history buttons 
formEl.on('submit', addSearch);

function addSearch(event){
    event.preventDefault();
    if (citySearch.val()&&countrySearch.val()){
        var newCityEl= $('<button class="cityBtn">');
        searchSecEl.append(newCityEl);
        if(stateSearch.val()){
          var usSearch = citySearch.val() +'-'+ stateSearch.val() +'-'+ countrySearch.val();
          newCityEl.text(usSearch);
          searchHistory.push(usSearch);
        }
        else{
          var otherSearch = citySearch.val() +'-'+ countrySearch.val();
          newCityEl.text(otherSearch);
          searchHistory.push(otherSearch);
        };
        localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
        
    }
    else {return;}
}
//----------------------------------------------------------------------------------- 
//Fetch search city data and update weather info in display section
formEl.on('submit', displaySearch);

function displaySearch(event){
    event.preventDefault();
    checkUserInput(); 
}

function checkUserInput(){
  if (citySearch.val()&&countrySearch.val()){
      if(countrySearch.val()==='US'){
        if(stateSearch.val()){cityToGeo(citySearch.val(), stateSearch.val(), countrySearch.val());
          
        }
        else{alert('All three inputs Required')}
      }
      else {cityToGeo(citySearch.val(), undefined, countrySearch.val());
      }
      //Clear input after fetching
      citySearch.val(""); stateSearch.val(""); countrySearch.val("");
    }
    else {alert('Required both City Name and Country Code')}
}
//----------------------------------------------------------------------------------- 


//----------------------------------------------------------------------------------- 
//Click on history search buttons to update weather.

searchSecEl.on('click','.cityBtn', historyWeather);

function historyWeather(event){
  var cityBtnClicked = $(event.target);
  //get inputs from the clicked button (we need: City Name - Country Code - State Code)
  var btnClickedArray = cityBtnClicked.text().split('-')
  var name = btnClickedArray[0];
  var country = btnClickedArray[1];
  //Convert previous searched city name and country to Geo Location (latitude & longtitude)
  cityToGeo(name, undefined, country);
}

//searchSecEl.on('click', '.cityBtn', test());
//function test(){console.log('hello')}



//----------------------------------------------------------------------------------- 


//----------------------------------------------------------------------------------- 
function init(){
getSearchWeather(localLat,localLon);
//importain, check if localStorage exists!
  if (storedCities){
    searchHistory = storedCities;
    for(var i=0; i<storedCities.length; i++){
      var newCityEl= $('<button class="cityBtn">');
      searchSecEl.append(newCityEl);
      newCityEl.text(storedCities[i]);
    }
  }
  else {return;}
}

//script start here
locateUser();

//----------------------------------------------------------------------------------- 
//https://api.openweathermap.org/data/2.5/onecall?lat=33.441792&lon=-94.037689&exclude=hourly,daily&appid={API key}"
function getSearchWeather(Lat,Lon) {
  var targetUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + Lat + '&lon=' + Lon + '&exclude=minutely,hourly,alerts&units=metric&appid=db24224f8e3ca0b3dccfc89d78aedc3a';
    fetch(targetUrl)
      .then(function (response) {
        if (response.ok) {
          response.json().then(function (data) {
            //Display Search City Name
            geoToCity(Lat,Lon);
            //Display Searched City's current weather
            currentUpdate(data);
            //Display Searched City's 5-days forecast
            forecastUpdate(data);
          });
        } else {
          alert('Error: ' + response.statusText);
        }
      })
      .catch(function (error) {
        alert('Unable to connect to OpenWeather onecall API');
      });
};

//--------------------------------------------------------------------


//Reverse geocoding
//http://api.openweathermap.org/geo/1.0/reverse?lat=51.5098&lon=-0.1180&limit=5&appid=db24224f8e3ca0b3dccfc89d78aedc3a

function geoToCity(Lat,Lon) {
  var targetUrl = 'http://api.openweathermap.org/geo/1.0/reverse?lat=' + Lat + '&lon=' + Lon + '&limit=1&appid=db24224f8e3ca0b3dccfc89d78aedc3a';
  fetch(targetUrl)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          //Initially show user location weather
          $('#chosenCountry').text(data[0].country +'-');
          $('#chosenCity').text(data[0].name);
        });
      } else {
          alert('Error: ' + response.statusText);
        }
      })
      .catch(function (error) {
        alert('Unable to connect to OpenWeather Reverse geocoding API');
    });
};
//--------------------------------------------------------------------


//Direct geocoding, City name convert to searchedCityLat and searchedCityLon
//http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}

function cityToGeo(cityName,stateCode,countryCode) {
  var targetUrl = 'http://api.openweathermap.org/geo/1.0/direct?q='+ cityName +','+ stateCode +','+ countryCode +'&limit=1&appid=db24224f8e3ca0b3dccfc89d78aedc3a';
  fetch(targetUrl)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          //Get the latitude and longtitude for user specified city,statecode(if US),countryCode.
          var cityLat = data[0].lat; //checked working
          var cityLon = data[0].lon; //checked working
          getSearchWeather(cityLat,cityLon);
        });
      } else {
          alert('Error: ' + response.statusText);
        }
      })
      .catch(function (error) {
        alert('Unable to connect to OpenWeather Reverse geocoding API');
    });
};

//--------------------------------------------------------------------


// Autocomplete widget for country codes and US state codes
$(function () {
    var countryCodes = ['AF','AX','AL','DZ','AS','AD','AO','AI','AQ','AG','AR','AM','AW','AC','AU','AT','AZ','BS','BH','BD','BB','BY','BE','BZ','BJ','BM','BT','BO','BA','BW','BR','IO','VG','BN','BG','BF','BI','KH','CM','CA','IC','CV','BQ','KY','CF','EA','TD','CL','CN','CX','CC','CO','KM','CG','CD','CK','CR','CI','HR','CU','CW','CY','CZ','DK','DG','DJ','DM','DO','EC','EG','SV','GQ','ER','EE','SZ','ET','FK','FO','FJ','FI','FR','GF','PF','TF','GA','GM','GE','DE','GH','GI','GR','GL','GD','GP','GU','GT','GG','GN','GW','GY','HT','HN','HK','HU','IS','IN','ID','IR','IQ','IE','IM','IL','IT','JM','JP','JE','JO','KZ','KE','KI','XK','KW','KG','LA','LV','LB','LS','LR','LY','LI','LT','LU','MO','MG','MW','MY','MV','ML','MT','MH','MQ','MR','MU','YT','MX','FM','MD','MC','MN','ME','MS','MA','MZ','MM','NA','NR','NP','NL','NC','NZ','NI','NE','NG','NU','NF','KP','MK','MP','NO','OM','PK','PW','PS','PA','PG','PY','PE','PH','PN','PL','PT','XA','XB','PR','QA','RE','RO','RU','RW','WS','SM','ST','SA','SN','RS','SC','SL','SG','SX','SK','SI','SB','SO','ZA','GS','KR','SS','ES','LK','BL','SH','KN','LC','MF','PM','VC','SD','SR','SJ','SE','CH','SY','TW','TJ','TZ','TH','TL','TG','TK','TO','TT','TA','TN','TR','TM','TC','TV','UM','VI','UG','UA','AE','GB','US','UY','UZ','VU','VA','VE','VN','WF','EH','YE','ZM','ZW'];
    countrySearch.autocomplete({source: countryCodes});
  });

  $(function () {
    var stateCodes = ['AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY'];
    stateSearch.autocomplete({source: stateCodes});
  });
//----------------------------------------------------------------------------------- 
//currentSearch


function currentUpdate(data){
  $('#currentDate').text(moment.unix(data.current.dt).format("ddd, DD/MM/YYYY, hh:mm a")+' (localtime)');
  // $('#chosenCity').text(object.city);
  // $('#currentIcon').addClass(object.weather);
  $('#currentTemp').text('Temp: '+ data.current.temp +'°C');
  $('#currentWind').text('Wind: '+ data.current.wind_speed +'m/s');
  $('#currentHumidity').text('Humidity: '+ data.current.humidity +'%');
  $('#UV-value').text(data.current.uvi);
  if (data.current.uvi < 2){$('#UV-value').css('background-color', 'LimeGreen')}
  else if (data.current.uvi < 5){$('#UV-value').css('background-color', 'Gold')}
  else if (data.current.uvi < 7){$('#UV-value').css('background-color', 'Orange')}
  else if (data.current.uvi < 10){$('#UV-value').css('background-color', 'Red')}
  else {$('#UV-value').css('background-color', 'Maroon')}
};

//----------------------------------------------------------------------------------- 

//----------------------------------------------------------------------------------- 
//currentForecast

function forecastUpdate(data){
  for(var i=0; i<5; i++){
    $('.container-days').children().eq(i).children().eq(0).text(moment.unix(data.daily[i+1].dt).format("ddd, DD/MM/YYYY"));
    //$('.container-days').children().eq(i).children().eq(1).addClass(object[i].weather);
    $('.container-days').children().eq(i).children().eq(2).text('Top Temp: '+ data.daily[i+1].temp.max +'°C');
    $('.container-days').children().eq(i).children().eq(3).text('Low Temp: '+ data.daily[i+1].temp.min +'°C');
    $('.container-days').children().eq(i).children().eq(4).text('Wind: '+ data.daily[i+1].wind_speed +'m/s');
    $('.container-days').children().eq(i).children().eq(5).text('Humidity: '+ data.daily[i+1].humidity +'%');
  } 
};





