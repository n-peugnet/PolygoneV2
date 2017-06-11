# Polygone V2

*Le Polygone* is an open online chat place which aim is to mimic real life conversations through different mechanisms.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You will need to have these softwares installed :
- MySQL server (for example [XAMPP](https://www.apachefriends.org/fr/download.html))
- [Node.js](https://nodejs.org/en/download/)

### Installation

1. Download or Clone the repository
2. Open command terminal and navigate to the project folder then install the dependencies by running :
	```
	npm install
	```
3. Rename `./sampleconfig.js` to `./config.js` and change credentials
4. Start the Node.js server by running :
	```
	node server.js
	```
5. Start MySQL server
6. Create a MySQL database called 'polygonev2' and import inside it the two tables `./sessions.sql`,`./memory.sql`
7. Access [http://localhost:3000](http://localhost:3000) in your browser

## Authors

- **Nicolas Peugnet** - *Initial work*
	- [Github](https://github.com/n-peugnet)
	- [Website](http://n.peugnet.free.fr)

See also the list of [contributors](https://github.com/n-peugnet/PolygoneV2/contributors) who participated in this project.