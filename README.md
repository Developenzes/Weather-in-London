# Weather-in-London
Historical data about weather in London

The application has 3 tabs:
1. Table filled with data from API about weather. User can pick arbitary date. Default date is set to 2018/4/30.
2. Line chart displaying relationship between time and temperature from the table in the first tab.
3. Heat Index calculator: temperature can be entered either in °C or °F. Output temperature can be also chosen in both degree units. Heat Index is calculated based on temperature and relative humidity. Heat Index cannot be calculated for temperatures less than 27°C and 80°F. Last 5 results of Heat Index calculator are stored in local storage and also displayed on the screen.  

Run the app: **npm run dev**
