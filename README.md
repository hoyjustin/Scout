Scout
=====
Scout is an experimental application which tests the effectiveness of using
bluetooth low energy technology beacons to gather customer data and track customers through retail space.
An integrated loyalty program provided incentives clients to use this platform.

Scout has two components, the Android mobile application intended for customer use and the web 
dashboard for the company. The mobile application collects the emitted data as from the beacons as well as providing a method of acummulating points over time.

The admin dashboard visualizes customer analytics, including time spend spent in the business and point accumulation over time using a D3 dashboard. A heatmap.js layer overlayed upon a leaflet basemap also allows the visualization of customers over the company's space.


Install
-------
The mobile application is developed in Android Studio and we recommend you to
use this IDE in further development.  Simply open `ScoutMobile` with Android 
Studio and hit `run` to execute.

The web application uses node.js. To run the development server, simply 
navigate to the `ScoutWeb` folder in the command line and run `node app.js` 
start the local server on localhost port 3000 .


License
-------

Licensed under GNU GPL v3.
