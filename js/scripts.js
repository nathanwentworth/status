
let lastTimeTempAccessed;
let temp;
let reviewNo;

let time;

let weatherKey = '';
let wanikaniKey = '';

let CLIENT_ID = '';
let DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];
let SCOPES = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.labels';

window.addEventListener('load', function () {
  getKeys();
});

function getKeys() {
  getJSON('/js/keys.json',
  function(err, data) {
    if (err != null) {
      alert('Something went wrong: ' + err);
    } else {
      CLIENT_ID = data.gmail;
      weatherKey = data.weather;
      wanikaniKey = data.wanikani;

      init();
    }
  });
}

function init() {

  let d = new Date();
  let n = d.getTime();

  getTime();

  lastTimeTempAccessed = localStorage.getItem('lastTimeTempAccessed');
  if (lastTimeTempAccessed != null) {
    if (lastTimeTempAccessed < (n - 600000)) {
      console.log("it's been more than 10 minutes since the weather was accessed, getting new data");
      getWeatherData();
      getWaniKaniData();
    } else {
      console.log('lastTimeTempAccessed is less than 10 minutes ago: ' + lastTimeTempAccessed);
      setTempDisplay();
      setWaniKaniDisplay();
    }
  } else {
    console.log("localStorage version of lastTimeTempAccessed is null: " + lastTimeTempAccessed);
  }

  lastTimeTempAccessed = n;

  localStorage.setItem('lastTimeTempAccessed', lastTimeTempAccessed);
  console.log('lastTimeTempAccessed was ' + lastTimeTempAccessed);

  window.setInterval(function () {
    getTime();
  }, 1000);

  window.setInterval(function () {
    getWeatherData();
  }, 1800000);

  window.setInterval(function () {
    getWaniKaniData();
  }, 900000);
}



function getTime() {
  var d = new Date();

  var h = d.getHours();
  var m = d.getMinutes();
  if (h < 10) {
    h = '0' + h;
  } else if (h > 12) {
    h -= 12;
  }
  if (m < 10) {
    m = '0' + m;
  }

  displayTime(h, m);
}

function displayTime(h, m) {
  var timeEl = document.getElementById('time');
  time = h + ":" + m;
  timeEl.innerText = time;
}

function getWaniKaniData() {
  if (wanikaniKey != '') {
    getJSON('https://www.wanikani.com/api/user/' + wanikaniKey + '/study-queue',
      function(err, data) {
        if (err != null) {
          console.log('Something went wrong: ' + err);
        } else {
          console.log('success!');
          getWaniKaniStudyNo(data);
          setWaniKaniDisplay();
        }
      }
    );
  } else {
    console.error("wanikaniKey is blank!");
  }
}

function getWaniKaniStudyNo(data) {
  reviewNo = data.requested_information.reviews_available;
  localStorage.setItem('wanikani', reviewNo);
  console.log('new wanikani data recieved at ' + time);
}

function setWaniKaniDisplay() {
  reviewNo = localStorage.getItem('wanikani');

  if (reviewNo == null) {
    console.log("couldn't find cached wanikani, getting new data");
    getWaniKaniData();
  }

  wanikani = document.getElementById('wanikani');
  wanikani.innerText = reviewNo;
}

function getWeatherData() {
  if (weatherKey != '') {
    getJSON('http://api.openweathermap.org/data/2.5/weather?id=4936812&units=imperial&appid=' + weatherKey,
      function(err, data) {
        if (err != null) {
          console.log('Something went wrong: ' + err);
          temp = localStorage.getItem('temp');
        } else {
          console.log('success!');
          getTemp(data);
        }
        setTempDisplay();
      }
    );
  } else {
    console.error("weatherKey is blank!");
  }
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
  console.log('new temp data recieved at ' + time);
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

  if (CLIENT_ID == '') {
    getJSON('/js/keys.json',
    function(err, data) {
      if (err != null) {
        alert('Something went wrong: ' + err);
      } else {
        CLIENT_ID = data.gmail;
      }
    });
  }

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

    window.setInterval(function () {
      displayUnread();
    }, 900000);

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
    console.log('new mail data recieved at ' + time);
  });
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


