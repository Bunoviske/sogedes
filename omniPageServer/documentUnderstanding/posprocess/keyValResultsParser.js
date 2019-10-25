

module.exports = {
    sortResultsByScore: sortResultsByScore,
    filterResultsByScore: filterResultsByScore
}

function createResultsObject(results){
    let resultsObject = {};
    results.forEach((label, i) => { //create an object with the label type as key
        (resultsObject[label.type] = resultsObject[label.type] || []).push(label);
    });
    return resultsObject;
}

function sortResultsByScore(results) {
    let resultsObject = createResultsObject(results); 
    let sortedResults = resultsObject;
    Object.keys(sortedResults).forEach(labelType => {
        sortedResults[labelType].sort((label1, label2) => {
            return label2.score - label1.score; //sort the scores in descending order 
        });
    });
    return sortedResults;
}

function filterResultsByScore(results){
    let filteredResults = results;
    const SCORE_THRESHOLD = 0.0;
    Object.keys(filteredResults).filter(label => { return label.score > SCORE_THRESHOLD }); //threshold the score
    return filteredResults;
}