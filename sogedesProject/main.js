
import { Server } from "./server/Server";
import { BaseServer } from "./server/BaseServer";

const port = 3000;

//dependency inversion using interface
let serverImplementation = new Server(); 
let serverAbstraction = new BaseServer(serverImplementation, port); 

serverAbstraction.run(); 

