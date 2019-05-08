
/**
* @description Server interface describing the contract to create a GET API Server.
* @author Bruno Carvalho
*/
export interface ServerAbstraction{
    
    setServerConfiguration();
    setServerRoutes();
    startServer(port: number);

};