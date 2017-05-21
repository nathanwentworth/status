// weather key: a71f82f2133f7b4bb180150d528361ce

// http://api.openweathermap.org/data/2.5/forecast?id=4936812&units=imperial&appid=a71f82f2133f7b4bb180150d528361ce

// gmail api 171868967722-8hgapsq2vvu9v6aqgud3vgi5v9n3apkp.apps.googleusercontent.com

var lastTimeTempAccessed;
var lastTimeGmailAccessed;
var temp;

var CLIENT_ID = '171868967722-8hgapsq2vvu9v6aqgud3vgi5v9n3apkp.apps.googleusercontent.com';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];
var SCOPES = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.labels';

window.onload = function () {
  init();
}

function init() {
  var d = new Date();
  var n = d.getTime();

  lastTimeTempAccessed = localStorage.getItem('lastTimeTempAccessed');
  lastTimeGmailAccessed = localStorage.getItem('lastTimeGmailAccessed');
  if (lastTimeTempAccessed != null) {
    if (lastTimeTempAccessed < (n - 600000)) {
      console.log("it's been more than 10 minutes since the weather was accessed, getting new data");
      getWeatherData();
    } else {
      console.log('lastTimeTempAccessed is less than 10 minutes ago: ' + lastTimeTempAccessed);
      setTempDisplay();
    }
  } else {
    console.log("localStorage version of lastTimeTempAccessed is null: " + lastTimeTempAccessed);
  }

  lastTimeTempAccessed = n;

  localStorage.setItem('lastTimeTempAccessed', lastTimeTempAccessed);
  console.log('lastTimeTempAccessed was ' + lastTimeTempAccessed);

  setInterval(function() {
    getTime(d), 1000
  });
}

function getTime(d) {
  var h = d.getHours();
  var m = d.getMinutes();
  h = h % 12;
  if (h < 10) {
    h = '0' + h;
  }
  if (m < 10) {
    m = '0' + m;
  }
  displayTime(h, m);
}

function displayTime(h, m) {
  var timeEl = document.getElementById('time');
  timeEl.innerText = h + ":" + m;
}

function getWeatherData() {
  getJSON('http://api.openweathermap.org/data/2.5/weather?id=4936812&units=imperial&appid=a71f82f2133f7b4bb180150d528361ce',
    function(err, data) {
      if (err != null) {
        console.log('Something went wrong: ' + err);
      } else {
        console.log('success!');
        getTemp(data);
        setTempDisplay();
      }
    }
  );
}

var getJSON = function(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';
  xhr.onload = function() {
    var status = xhr.status;
    if (status == 200) {
      callback(null, xhr.response);
    } else {
      callback(status);
    }
  };
  xhr.send();
};

function getTemp(data) {
  console.log(data);
  temp = data.main.temp;
  Math.round(temp);
  localStorage.setItem('temp', temp);
}


function setTempDisplay() {
  temp = localStorage.getItem('temp');

  if (temp == null) {
    console.log("couldn't find cached weather, getting new data");
    getWeatherData();
  }

  var tempEl = document.getElementById('temp');
  tempEl.innerText = Math.round(temp) + '°';
}

// gmail stuff

var authorizeButton = document.getElementById('authorize');
var signoutButton = document.getElementById('signout-button');


function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

function initClient() {
  gapi.client.init({
    discoveryDocs: DISCOVERY_DOCS,
    clientId: CLIENT_ID,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
  });
}

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    displayUnread();
  } else {
    handleAuthClick();
  }
}

function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

function displayUnread() {
  gapi.client.gmail.users.labels.get({
    'id': 'INBOX',
    'userId': 'me'
  }).then(function(response) {
    var unread = response.result.messagesUnread;
    var mailEl = document.getElementById('mail');
    mailEl.innerText = unread;
  });
}





