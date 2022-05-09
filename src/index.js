import "./styles/main.scss"
import FetchWrapper from "./fetch-wrapper";
import "../node_modules/chart.js/dist/chart";
import { saveToLocalStorage, getDate, getTime } from "./helpers";
import flatpickr from "flatpickr";
import "../node_modules/flatpickr/dist/flatpickr.min.css";

const API = new FetchWrapper("https://www.metaweather.com/api");
const tabs = document.querySelectorAll(".tab");
const tableBody = document.querySelector(".table tbody");
const form = document.querySelector("#heat-index-form");
let temperature = document.querySelector("#temperature");
let humidity = document.querySelector("#humidity");
const degreesEntry = document.querySelector("#degrees");
const degreesResult = document.querySelector("#degrees-result");
const heatIndexResult = document.querySelector("#heat-index");
const errorMessage = document.querySelector(".error-message");
const recentResults = document.querySelector(".recent-results");
const spinner = document.querySelector(".spinner-border");
const dateInput = document.querySelector("#weather-date");
const dateForm = document.querySelector("#date-form");

/**
 * Tabs creating
 */

tabs.forEach(tab => {    
    tab.addEventListener("click", event => {
        const previousTab = document.querySelector(".tab.active");
        
        if(previousTab) {
            previousTab.classList.remove("active");
        }
        event.currentTarget.classList.add("active");   

        const content = document.querySelector(event.currentTarget.dataset.content);
        const previousShow = document.querySelector(".tab-content.show")
        previousShow.classList.remove("show");   
        
        content.classList.add("show");       
    });
});

/**
 * Tab 1  - Table
 */

flatpickr(dateInput, {dateFormat: "Y/m/d",});

const date = () => !dateInput.value ? "2018/04/30" : dateInput.value;
      
const render = () => {
    getDataFromWeatherAPI();
    renderChart();
}

// GET request for fetching data from API and import them to the table
const getDataFromWeatherAPI = () => {
    spinner.style.visibility = "visible";
    
    API.get(`/location/44418/${date()}`)
    .then(data => {
        if (data.error) {
            errorMessage.textContent = "Something went wrong";
            return;       
        }
        data?.forEach(entry => {
            tableBody.insertAdjacentHTML("beforeend", `
            <tr>
                <td>${getDate(entry.created)}</td>
                <td>${getTime(entry.created)}</td>
                <td>${entry.weather_state_name}</td>
                <td>${entry.the_temp.toFixed(1)}</td>
                <td>${entry.air_pressure.toFixed(1)}</td>
                <td>${entry.humidity.toFixed(1)}</td>
                <td>${entry.wind_speed.toFixed(1)}</td>
            </tr>`);
        })
        spinner.style.visibility = "hidden";
    });
}

/**
 * Tab 2 - Chart
 */
let myChart = null;

const renderChart = () => { 
    // destroy old instance of the chart if it exists
    myChart?.destroy();
    API.get(`/location/44418/${date()}`)
        .then(data => {    
        const temperature = data.map(entry => entry.the_temp);   
        const dateTime = data.reverse().map(entry => getDate(entry.created) + " " + getTime(entry.created));
    
    // Chart creating
    let ctx = document.getElementById('my-chart').getContext('2d');
        myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dateTime,
            datasets: [{
                label: 'Temperature',
                data: temperature,
                backgroundColor: "transparent",
                borderColor: "red",
                borderWidth: 3
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });        
});
}

dateForm.addEventListener("submit", (e) => {
    e.preventDefault();
    tableBody.innerHTML = "";
    render();
});

/**
 * Tab 3
 */
// calculate entry data from user to °F
const calculateTemperature = () => {
    let result = "";
    if (degreesEntry.value === "°F") {
        result = temperature.value;    
    } else {
        result = 1.8 * temperature.value + 32;
    }

    if(result < 80) {
        errorMessage.textContent = "Entered temperature is too low. Please add temperature above 80°F or 27°C";
        setTimeout(() => {                
            errorMessage.textContent = "";
        }, 4000);                
    } else {
        return result;
    }  
}

// Function for Heat Index calculation*/ function for Heat Index calculation
const calculateHeatIndex = () => {
    const T = calculateTemperature();
    const rh = humidity.value;
   
    let index = -42.379 + (2.04901523 * T) + (10.14333127 * rh) - (0.22475541 * T * rh) - (6.83783 * Math.pow(10, -3) * Math.pow(T, 2)) - (5.481717 * Math.pow(10, -2) * Math.pow(rh, 2)) + (1.22874 * Math.pow(10, -3) * Math.pow(T, 2) * rh) + (8.5282 * Math.pow(10, -4) * T * Math.pow(rh, 2)) - (1.99 * Math.pow(10, -6) * Math.pow(T, 2) * Math.pow(rh, 2));

    if(degreesResult.value !== "°F") {            
        index = 0.55 * (index -32);
        return index;
    } else {           
        return index;
    }
}


// Submit form and fill the result heat index based on selected unit (°C or °F)
// Save to local storage
// Display results in UL list (last 5)
form.addEventListener("submit", event => {
    event.preventDefault();    

    const heatIndex = calculateHeatIndex().toFixed(1);
    const heatIndexToStorage = heatIndex + " " + degreesResult.value;

    recentResults.insertAdjacentHTML("afterbegin", `
        <li class="recent-result">${heatIndexToStorage}</li>
    `);
    
    if(recentResults.getElementsByTagName('li').length > 5) {
        recentResults.lastElementChild.remove();
    }
                
    saveToLocalStorage(heatIndexToStorage);
    heatIndexResult.textContent = heatIndex;   
});

// Display history of 5 results of Heat Index from local storage
const displayHeatIndexes = () => {
    let heatIndexes;
    if (localStorage.getItem("heatIndexes") === null) {
        heatIndexes = [];
    } else {
        heatIndexes = JSON.parse(localStorage.getItem("heatIndexes"));
    }
    const lastIndexes = heatIndexes.slice(Math.max(heatIndexes.length - 5, 0))
    lastIndexes.reverse().forEach(index => {
        recentResults.insertAdjacentHTML("beforeend", `
        <li class="recent-result">${index}</li>
        `)       
    })
}

displayHeatIndexes();
render()


