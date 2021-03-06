// Global Variables
var datasets = ["vehicle", "oceanographic", "atmospheric", "biogeochemical"];
var missions = ["1039", "1040", "1043", "1044", "1045", "1046", "1047"];

function refreshPage() {
    var pageVersion = new Date().getTime();
    var path = window.location.href.split('?')[0] + '?v=' + pageVersion;
    var func = 'window.location.replace(\"' + path + '\")';
    // console.info(`version = ${pageVersion}`);
    // console.info(`path = ${path}`);
    // console.info(`func = ${func}`);
    var timeout = 30000;
    if (window.location.href.indexOf('?v=') === -1) {
        timeout = 0;
    }
    setTimeout(func, timeout);
}

function populateData() {

    // Configure the 30s countdown

    var counterID = document.getElementById("counter");
    var timer = new easytimer.Timer();
    timer.start({countdown: true, startValues: {seconds: 30}});
    counterID.innerHTML = timer.getTimeValues().seconds;
    timer.addEventListener('secondsUpdated', function (e) {
        counterID.innerHTML = timer.getTimeValues().seconds;
    });
    //timer.addEventListener('targetAchieved', function (e) {
    //    counterID.innerHTML = 'REFRESHING ...';
    //});

    // Configure the Clock
    var clockID = document.getElementById("clock");
    var clock = new easytimer.Timer();
    var now = new Date();
    clock.start({precision: 'seconds', 
        startValues: {hours: now.getHours(), minutes: now.getMinutes(), seconds: now.getSeconds()}});
    clock.addEventListener('secondsUpdated', function (e) {
        clockID.innerHTML = clock.getTimeValues().toString();
    })

    // Configure the nextUpdate
    nextUpdate = new Date(lastUpdate);
    var nextUpdateID = document.getElementById("nextUpdate");
    nextUpdate.setMinutes(nextUpdate.getMinutes() + 30);
    nextUpdateID.innerHTML = formatDateTime(nextUpdate);

    // Configure the remaining time
    var remainingTimeID = document.getElementById('remainingTime');
    var remainingTimer = new easytimer.Timer();
    remainingTimer.start({countdown: true, precision: 'seconds', 
        startValues: {hours: nextUpdate.getHours() - clock.getTimeValues().hours,
        minutes: nextUpdate.getMinutes() - clock.getTimeValues().minutes,
        seconds: nextUpdate.getSeconds() - clock.getTimeValues().seconds}
    });
    //remainingTimer.addEventListener('secondsUpdated', function (e) {
    //    remainingTimeID.innerHTML = remainingTimer.getTimeValues().toString();
    //})

    // Configure the lastUpdate
    lastUpdate = formatDateTime(lastUpdate);
    var lastUpdateTimeID = document.getElementById("lastUpdateDateTime");
    lastUpdateTimeID.innerHTML = lastUpdate;

    var newRow, newCell, newText, newLink, url;
    var table = document.getElementById("dataTable").getElementsByTagName('tbody')[0];
    //missions.forEach(x => {
    //    datasets.forEach(y => {
    for (var x of missions) {
        for (var y of datasets) {
            newRow = table.insertRow(table.rows.length);

            // Mission
            missionCell = newRow.insertCell(0);
            missionText = document.createTextNode(x);
            missionCell.appendChild(missionText);

            // Dataset
            datasetCell = newRow.insertCell(1);
            datasetText = document.createTextNode(titleCase(y));
            datasetCell.appendChild(datasetText);

            // DateTime
            dateTimeCell = newRow.insertCell(2);

            // Link
            linkCell = newRow.insertCell(3);
            url = "saildrone/" + x + "_" + y + ".csv";
            fileExists(linkCell, url, dateTimeCell);
        };
    };
    // table.refresh();
}

function fileExists(linkCell, url, dateTimeCell) {
    if(url){
        var req = new XMLHttpRequest();
        var contentType;
        req.onreadystatechange = function() {
            if (this.readyState === this.DONE) {
                contentType = req.getResponseHeader("Content-Type");
                if ((req.status === 200) && (contentType === "text/csv")) {
                    newLink = document.createElement('a');
                    linkText = document.createTextNode("Link");
                    newLink.appendChild(linkText);
                    newLink.setAttribute("href", url);    
                    linkCell.appendChild(newLink);
                    dateTimeText = document.createTextNode(lastUpdate);
                    dateTimeCell.appendChild(dateTimeText);        
                } else {
                    linkText = document.createTextNode("Mission has not been launched yet");
                    linkCell.appendChild(linkText);
                    dateTimeText = document.createTextNode("N/A");
                    dateTimeCell.appendChild(dateTimeText);
                }
            }
        }
        req.open('HEAD', url, true);
        req.send();
    }
}

function formatDateTime(dateTime) {
    var dt = new Date(dateTime);     // get string of last modified date
    return padZeroes(dt.getMonth()+1) + "/" + padZeroes(dt.getDate()) + "/" + dt.getFullYear() + " " +
        padZeroes(dt.getHours()) + ":" + padZeroes(dt.getMinutes()) + ":" + padZeroes(dt.getSeconds());
}

function padZeroes(value) {
    if (value < 10) return "0" + value;
    return value;
}

function titleCase(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}
