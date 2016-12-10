const express = require('express');
const app = express();
const fs = require('fs');
const MAX_LENGTH = 50;

// Load input data
let input = [];
fs.readdirSync('./data').forEach((file) => {
  input = input.concat(fs.readFileSync('./data/' + file, 'utf8').split('.'));
});
console.log(input);
//find starting words
const startSeeds = input.map(function(d) {
  return d.split(" ").slice(0, 1).join(" ");
}).filter(Boolean);
const mapArray = [generateMarkovModel(1), generateMarkovModel(2)];
//console.log(generateText(mapArray));
app.use('/', (req, res) => {
  res.send(generateText(mapArray));
});
// Listen
app.listen(8080);
/*
//strip hashtags and mentions
function cleanInput() {
  var targets = ["@", "#", "|"];
  for (var i = 0; i < input.length; i++) {
    var tweetArray = input[i].split(" ");
    var newArray = [];
    for (var j = 0; j < tweetArray.length; j++) {
      if (targets.indexOf(tweetArray[j].substring(0, 1)) < 0) {
        newArray.push(tweetArray[j]);
      }
    }
    input[i] = newArray.join(" ").trim();
  }
}
*/
function generateMarkovModel(kVal) {
  var map = {};
  for (var i = 0; i < input.length; i++) {
    var array = input[i].split(" ");
    for (var j = 0; j < array.length - kVal; j++) {
      const key = array.slice(j, j + kVal).join(" ");
      const value = array[j + kVal];
      if (!(key in map)) {
        map[key] = [];
      }
      map[key].push(value);
    }
  }
  return map;
}

function generateText(mapArray) {
  //select a random start seed
  let start = startSeeds[Math.floor(Math.random() * startSeeds.length)];
  let currMap = mapArray[0]; //first iteration using order-1 model
  const string = start.split(" ");
  while (currMap[start] !== undefined && string.length < MAX_LENGTH) {
    var next = currMap[start][Math.floor(Math.random() * currMap[start].length)]; //weighted random choice
    string.push(next);
    //randomly choose between order 1 and 2 for next map
    var rand = Math.floor(Math.random() * mapArray.length);
    //console.log(rand);
    currMap = mapArray[rand];
    start = string.slice(string.length - (rand + 1), string.length).join(" ");
  }
  return string.join(" ") + ".";
}
