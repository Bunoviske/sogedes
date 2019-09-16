
/********* HTML SECTIONS POS PROCESSING **********/

let firstXCoordinate = 800000, firstYCoordinate = 800000;
let lastXCoordinate = 0, lastYCoordinate = 0;


function getXLastCoordinate(item) {
    return item.x + (0.06 * item.w);
}

function getPdfReferenceCoordinates(item) {

    firstXCoordinate = item.x < firstXCoordinate ? item.x : firstXCoordinate;
    lastXCoordinate = getXLastCoordinate(item) > lastXCoordinate ? getXLastCoordinate(item) : lastXCoordinate;

    firstYCoordinate = item.y < firstYCoordinate ? item.y : firstYCoordinate;
    lastYCoordinate = item.y > lastYCoordinate ? item.y : lastYCoordinate;
}

function getTextByHtmlSections(htmlObject, pdfItemsArrayYFiltered) {
    let htmlTableWidth = htmlObject.tableWidth;
    let htmlTableHeight = htmlObject.tableHeight;
    let htmlSections = htmlObject.sectionsCoordinates;

    let pdfWidth = lastXCoordinate - firstXCoordinate;
    let pdfHeight = lastYCoordinate - firstYCoordinate;
    // console.log(firstYCoordinate + " " + lastYCoordinate + " " + pdfWidth +  " " + pdfHeight);
    let widthRelation = pdfWidth / htmlTableWidth;
    let heightRelation = pdfHeight / htmlTableHeight;

    // console.log(firstYCoordinate + " " + lastYCoordinate);

    htmlSections.forEach((section, idx) => {
        if (idx <= 15) {
            let minX = firstXCoordinate, maxX = firstXCoordinate, minY = firstYCoordinate, maxY = firstYCoordinate; //offset for the pdf table
            minX += section.initialX * widthRelation;
            maxX += (section.initialX + section.width) * widthRelation;
            minY += section.initialY * heightRelation;
            maxY += (section.initialY + section.height) * heightRelation;
            // console.log(heightRelation + " " + section.initialY + " " + section.height);
            console.log(minX + " " + maxX + " " + minY + " " + maxY + " ");
            let foundElems = pdfItemsArrayYFiltered.filter(function (element) {
                return element.y < maxY & element.y >= minY & element.x < maxX & element.x >= minX;
            });
            // .sort((elem1, elem2) => parseFloat(elem1.y) - parseFloat(elem2.y))
            // .forEach(elem => {
            //     (sortedYelems[elem.y] = sortedYelems[elem.y] || []).push(elem);
            // });


            console.log("Section number " + idx);
            foundElems.forEach(elem => {
                // if (elem.text == "Lohnart " || elem.text.search("Brutto") != -1
                // || elem.text == "Lohnsteuer " || elem.text == "00001 24,06,61 ")
                //     console.log(elem.text + " " + elem.y /*+ " " + elem.x*/);
                //console.log(elem.text);
            });
            console.log("");
        }
    });
}

module.exports = {
    getTextByHtmlSections: getTextByHtmlSections,
    getPdfReferenceCoordinates: getPdfReferenceCoordinates
}