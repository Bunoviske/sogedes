
import {ServerAbstraction} from "./interfaces/ServerAbstraction"


/**
* @description BaseServer class uses ServerAbstraction interface (dependency inversion).
  This class describes the logic behind a tipical server: first Set Configuration, then set the Routes
  and finally start the server.
* @author Bruno Carvalho
*/
export class BaseServer {

    private server : ServerAbstraction;
    private port : number;

    constructor(serverInterface : ServerAbstraction, port : number){
        this.server = serverInterface;
        this.port = port;
    }

    run(){
        this.server.setServerConfiguration();
        this.server.setServerRoutes();
        this.server.startServer(this.port);
    }

}