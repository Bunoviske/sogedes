

/********************************* 
 PARSE HTML FILE
*********************************/

function javascriptClientSelection() {

    /*************
    * Functions for the sectionWithBiggerTdHeight logic
    **************/

    // TODO - Need to generalize this bigSectionOffset because it only works with there is only one big section impacting the initialX of the next rows
    // need to make an array of big sections...
    let sectionWithBiggerTdHeight = {
        'initialX': -1, 'initialY': -1, 'width': -1, 'height': -1, 'trIdx': -1
    };
    let isFirstTdAfterBigSection = true;
    function setSectionWithBiggerTdHeight(initialX, initialY, width, height, trIdx) {
        sectionWithBiggerTdHeight.initialX = initialX;
        sectionWithBiggerTdHeight.initialY = initialY;
        sectionWithBiggerTdHeight.width = width;
        sectionWithBiggerTdHeight.height = height;
        sectionWithBiggerTdHeight.trIdx = trIdx;
    }
    function updateSectionWithBiggerTdHeight(lastYInitialCoordinate) {
        //just reset the section if it has some value and if the actual TR is after the big section
        if (sectionWithBiggerTdHeight.height != -1 && Math.round(lastYInitialCoordinate) >= Math.round(sectionWithBiggerTdHeight.initialY + sectionWithBiggerTdHeight.height))
            setSectionWithBiggerTdHeight(-1, -1, -1, -1, -1);
    }
    function getBiggerSectionOffset(lastXInitialCoordinate, trIdx) {
        if (sectionWithBiggerTdHeight.trIdx != -1 && trIdx > sectionWithBiggerTdHeight.trIdx) { //just check this condition if there is some big section
            //check if lastXInitialCoordinate is equal or bigger sectionWithBiggerTdHeight.initialX (to avoid precision error, give a range to be equal)
            if (isFirstTdAfterBigSection && Math.round(lastXInitialCoordinate) >= Math.round(sectionWithBiggerTdHeight.initialX)) {
                isFirstTdAfterBigSection = false; //the offset for the big section is used, now wait until next row
                return sectionWithBiggerTdHeight.width; //only get the offset once per TR because the variable lastXInitialCoordinate will be updated for the next TDs in this row
            }
            else
                return 0;
        }
        else //if it is in the same row which the big section was defined, dont set offset because lastXInitialCoordinate will give the right offset 
            return 0;
    }

    /*************
     * Begin of the javascript client code
     **************/

    let tableWidth = 0;
    let tableHeight = 0;
    let biggestDivBox;
    let sectionsCoordinates = []; //contain initial coordinates of the sections and its size
    let sectionsWithError = []; //sections which X offset is wrong (see TODO above)

    let divBoxes = document.querySelectorAll("div.Box");
    divBoxes.forEach(divBox => {
        //for now, take the biggest div.Box from all div.Boxs
        let width = parseFloat(divBox.querySelector("layer").attributes.width.value);
        let height = parseFloat(divBox.querySelector("layer").attributes.height.value);

        if (width >= tableWidth && height >= tableHeight) {
            tableWidth = width;
            tableHeight = height;
            biggestDivBox = divBox;
        }
    });

    let lastYInitialCoordinate = 0, lastXInitialCoordinate = 0;
    setSectionWithBiggerTdHeight(-1, -1, -1, -1);

    //get the section coordinates from the biggest table
    biggestDivBox.querySelectorAll("tr").forEach((tr, trIdx) => {
        lastXInitialCoordinate = 0;

        updateSectionWithBiggerTdHeight(lastYInitialCoordinate); //every time I process a TR, check if is necessary to reset the big section object
        isFirstTdAfterBigSection = true; //always set this variable true before processing the TDs. This logic is necessary because I need to add the big section offset only once per TR
        let trHeight = parseFloat(tr.style.height);
        tr.querySelectorAll("td").forEach(td => {
            let tdHeight = parseFloat(td.style.height) / 0.75; //convert from pt to px
            let tdWidth = tableWidth * (parseFloat(td.width) / 100); //percentage value
            let sectionHeight = tdHeight;
            let sectionInitialX = lastXInitialCoordinate + getBiggerSectionOffset(lastXInitialCoordinate, trIdx); //gets bigger section offset if it exists

            //always round before comparing floating points
            if (Math.round(tdHeight) <= Math.round(trHeight)) //in this case, the TD is aligned with the TR (there is only a small difference in the height)
                sectionHeight = trHeight; //if td.height <= tr.height, take tr value     
            else { //in this case, a TR contains a TD that has a bigger height, so it is necessary to save the height to manage the initialX for the next TDs
                if (sectionWithBiggerTdHeight.height != -1) {
                    console.log("Already exists bigger section! Error here"); //ERROR HERE!!!!!!!!
                    sectionsWithError.push({
                        'initialX': sectionInitialX, 'initialY': lastYInitialCoordinate,
                        'width': tdWidth, 'height': sectionHeight
                    });
                }
                else
                    setSectionWithBiggerTdHeight(sectionInitialX, lastYInitialCoordinate, tdWidth, sectionHeight, trIdx);
            }

            sectionsCoordinates.push({
                'initialX': sectionInitialX, 'initialY': lastYInitialCoordinate,
                'width': tdWidth, 'height': sectionHeight
            });

            lastXInitialCoordinate = sectionInitialX + tdWidth;
        });
        lastYInitialCoordinate += trHeight;
    });
    return { tableWidth, tableHeight, sectionsCoordinates, sectionsWithError };

}

const puppeteer = require('puppeteer');
async function parseFile(htmlFile) {
    console.log("Starting html parse");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(__dirname + htmlFile);

    let result = await page.evaluate(javascriptClientSelection);
    // console.log(result);
    browser.close(); // dont wait for the browser 
    console.log("Finished html parse");

    return result;
}

module.exports = {
    parseFile: parseFile
}

// var htmlText = fs.readFileSync(htmlFile, 'utf8').toString();
// const cheerio = require('cheerio');

// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;
// const document  = new JSDOM(htmlText).window.document;
// console.log(document.querySelector("div.Box").textContent);

// const $ = cheerio.load(htmlText);
// let tableWidth = 0;
// let tableHeight = 0;
// let sectionsWidthPercentage = [], sectionsHeightPercentage = [];
// let sectionsPosition = [];
// $("body").find("div.Box").each(function (index, table) {

//     //for now, take the biggest table from all div.Boxs
//     let width = parseInt($(table).find("layer").attr("width"));
//     tableWidth = width > tableWidth ? width : tableWidth;
//     let height = parseInt($(table).find("layer").attr("height"));
//     tableHeight = height > tableHeight ? height : tableHeight;

//     $(table).find("TD").each(function (idx, td) {
//         let width = parseInt($(td).css('width')) / 100;
//         let height = (parseInt($(td).css('height')) / 0.75) / tableHeight; //this height is in 'pt' and the tableHeight is in 'px'. The proportion between them is 0.75
//         sectionsWidthPercentage.push(width);
//         sectionsHeightPercentage.push(height);
//         sectionsPosition.push({ 'width': width, 'height': height });
//         // console.log(width + " " + height + " " + $(td).text());
//     });
// });
// console.log(tableWidth + " " + tableHeight);