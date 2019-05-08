import { ServerAbstraction } from "./interfaces/ServerAbstraction"

const fs = require('fs');                     //acess files from the system
const express = require('express');
const app = express();                        // create app w/ express
const morgan = require('morgan');             // log requests to the console (express4)
const bodyParser = require('body-parser');    // pull information from HTML POST (express4)

let root_path; //this variable must be from javascript (didn't work declaring this variable inside the class)

/**
* @description Server class implements ServerAbstraction Interface methods. Its main responsibility is setting the
  server configuration, the server routes and initializing it
* @author Bruno Carvalho
*/
export class Server implements ServerAbstraction {

    constructor() {

        //I didn't find other way to set the project root dir to acess de client files 
        root_path = __dirname;
        root_path = root_path.substring(0, root_path.length - 12);

        console.log('Initializing server at directory ' + root_path);
    }

    /**
    * @description The server is based in an express app. This function sets this app configuration
    * @param void
    * @returns void
    * @author Bruno Carvalho
    */
    setServerConfiguration() {

        app.use(express.static(root_path + 'client/'));        // set the static files location
        app.use(morgan('dev'));                                // log every request to the console
        app.use(bodyParser.urlencoded({ 'extended': 'true' }));// parse application/x-www-form-urlencoded
        app.use(bodyParser.json());                            // parse application/json
    }

    /**
    * @description Set the API routes of an express app
    * @param void
    * @returns void
    * @author Bruno Carvalho
    */
    setServerRoutes() {

        app.get('/server/public/directories', function (req, res) {

            //return the directory list as json  
            let rawdata = fs.readFileSync(root_path + 'client/directory.json');
            let list = JSON.parse(rawdata);
            res.status(200).json(list);

        });

        app.get('/', function (req, res) {
            // load the single view file
            res.sendFile(root_path + 'client/index.html');
        });

    }

    /**
    * @description The server is based in an express app. This function sets this app configuration
    * @param port Server port number
    * @returns void
    * @author Bruno Carvalho
    */
    startServer(port: number) {
        
        //start the server
        app.listen(port, (err) => {
    
            if (err) {
                return console.log('Error: ', err)
            }
            console.log(`Server is running at localhost: ${port}`)
        })
    }

}