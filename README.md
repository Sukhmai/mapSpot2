
# The Map Spot

To document and reflect upon the connections and disjunctions between civic data and lived experience, through the collaborative creation of large-scale, interpretive maps.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. 

### Installing

After cloning the repository, ensure that [node](https://nodejs.org/en/) and npm are installed on your machine. Change directory into the main folder and run command `npm install` to install dependencies. Then create an .env file, and fill in the uploadKey and password fields. If you don't have these keys, you can still test and develop the map, however the upload portal will not work.

### Starting the Server

Navigate to the main directory and then move down one level to the /src folder. Run `node main.js` to start the server, which will listen on the port specified within the files (by default, port 8080).

Once the server is running, you should be able to navigate to the page in a web browser (http://localhost:8080) in order to view the index.html page, which shows the interactive map. Navigate to (http://localhost:8080/upload to see the upload portal. ) 

## Built With

* [MapBox GL](https://www.mapbox.com/mapbox-gl-js/api/) - Open-source libraries for embedding maps
* [Node.js](https://nodejs.org/en/) - JavaScript runtime

## Authors
### MapSpot
* **Sukhmai Kapur** - *MapSpot* - [Sukhmai](https://github.com/Sukhmai)
* **Raya Ward** - *Map Spot* - [rayaward](https://github.com/rayaward)
### Original Project 
* **Muniba M. Khan** - *Initial work* - [kmuniba98](https://github.com/kmuniba98)
* **Christopher Polack** - *Initial work* - [cfpolack](https://github.com/cfpolack)
* **Annabel Rothschild** - *Initial work* - [annabelrothschild](https://github.com/annabelrothschild)

## Acknowledgments

* Dr. Ellen Zegura, Dr. Chris Le Dantec, Dr. Amanda Meng, Dr. Alex Godwin, Francella Tonge and the Civic Data Science REU
* Jer Thorp, Emily Catedral, and the Office for Creative Research and St. Louis Center for Creative Arts
* Melanie Richard and the support staff of the School of Literature, Media, and Communication
* Digital Integrative Liberal Arts Center at the Georgia Institute of Technology Ivan Allen College of Liberal Arts
