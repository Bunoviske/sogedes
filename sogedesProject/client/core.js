
let sogedesApp = angular.module('sogedesApp', []);
let tableRows = [];


/**
* @description Angular main controller (communicate with html index)
* @param $scope Html scope abstraction from angular
* @param $http  Http abstraction 
* @returns void
* @author Bruno Carvalho
*/
function mainController($scope, $http) {

    $scope.tableRows = [];         //the table 
    $scope.isTableVisible = false; //controls the elements that are visible in the page

    // when the get button is pressed, get json file from API
    $scope.getDirectories = function () {
        $http.get('/server/public/directories')
            .success(function (data) {
                
                parseJsonToTable(data);       //parse json to table structure  
                $scope.tableRows = tableRows; //after parsing, the html table receive the data
                $scope.isTableVisible = true; //now table is visible, so the button is set invisible
                console.log(data);

            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    };
}

/**
* @description Read the json data and organize it as table rows
* @param data Json data from directory.json file
* @returns void
* @author Bruno Carvalho
*/
function parseJsonToTable(data) {

    data.data.directory.forEach(directory => {

        let keys = Object.keys(directory);
        let level1dir = keys[0];

        directory[keys[0]].forEach(subdirectory => {

            let keys = Object.keys(subdirectory);
            let level2dir = keys[0];

            subdirectory[keys[0]].forEach(name => {
                let keys = Object.keys(name);

                setTableRow(level1dir, level2dir, keys[0], name[keys[0]].date,
                            name[keys[0]].type,  name[keys[0]].changed,  name[keys[0]].size);

            });
        });
    });
    console.log(tableRows);
}


/**
* @description Create a tableRow object and push it to the tableRows array
* @param level1dir Level 1: the name of the first child of the object directory
* @param level2dir Level 2: the name of second child of the object directory
* @param nameStr Name: the name of third child of the object directory
* @param dateStr Date: attribute of the object level 3
* @param typeStr Type: attribute of the object level 3
* @param changedStr Changed: attribute of the object level 3
* @param sizeStr Size: attribute of the object level 3
* @returns void
* @author Bruno Carvalho
*/
function setTableRow(level1dir, level2dir, nameStr, dateStr, typeStr,changedStr,sizeStr) {

    let tableRow = {
        l1: level1dir,
        l2: level2dir,
        name: nameStr,
        date: dateStr,
        type: typeStr,
        change: changedStr,
        size: sizeStr
    }
    tableRows.push(tableRow);
}