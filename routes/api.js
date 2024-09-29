var express = require('express');
var util = require('../modules/utils.js');
var router = express.Router();
var CheckWorker = require('../modules/classes/CheckWorker.js');
var fs = require('fs');
const { get } = require('http');
var Ollama = require('../modules/ollama.js');
var ollama = new Ollama();
var Gemini = require('../modules/gemini.js');
var gemini = new Gemini();
var CacheManager = require('../modules/CacheManager.js');
var cacheManager = new CacheManager();

function getCheckerList(){
  var checkers = fs.readdirSync('modules/checkers');
  checkers.forEach((checker, index) => {
    checkers[index] = checker.replace('.js', '');
  });
  return checkers;
}


async function runWorker(checker, website){
  return new Promise(async (resolve, reject) => {
    var worker = new CheckWorker();
    var workData;
    worker.on('message', function(data){
      workData = data;
    });
    var result = await worker.run(checker, website);
    worker.on('exit', function(){
      resolve(JSON.stringify({result, data: workData}));
    });
  })
}

async function runAllWorkers(website) {
  const checkerList = getCheckerList();
  const promises = checkerList.map(checker => runWorker(checker, website));
  const resultsArray = await Promise.all(promises);
  
  const results = {};
  checkerList.forEach((checker, index) => {
    results[checker] = resultsArray[index];
  });
  
  return results;
}

router.get('/', function(req, res, next) {
  res.send('Hello world xD');
});

router.get('/check/list', async function(req, res, next) {
  
  res.send(JSON.stringify(getCheckerList()));
});

router.get('/check/full', async function(req, res, next) {
  var results = await runAllWorkers(req.query.website);
  res.send(results);
});


router.get('/check/:checker', async function(req, res, next) {
  var checkerList = getCheckerList();
  var website = util.parseUrl(req.query.website).host;
  if(checkerList.includes(req.params.checker)){
    var result = await runWorker(req.params.checker, website);
    res.send(result);
  }else{
    res.send(JSON.stringify({error: 'Checker not found'}));
  }
});

router.get('/ollama', async (req, res, next) => {
  var website = req.query.website;
  var result = await runAllWorkers(website);
  var data = await ollama.getResponse(JSON.stringify(result) + "   Is that website safe??, odpisz po polsku");
  res.send(JSON.stringify({ data}));
});

function parseText(text){
  text = text.replace("\n", '');
  text = text.replace("*", '');
  text = text.replace("\\", '');
  text = text.replace("*", '');
  text = text.replace("```json", '');
  text = text.replace("```", ''); 
  return text;
}

async function generateGeminiResponse(result){
  var whoisResult = await gemini.getResponse("Sprawdź wiarygodność danych i oceń od 0 do 100 (0-Niebezpieczna, 100-Bezpieczna). Sprwadź czy firma jest znana a dane powiązane z nią są prawidłowe. Jeżeli firma nie jest znana dokonaj oceny na podstawie dostępnych danych. Dane: "+JSON.stringify(result.whois));
  result.whois = whoisResult;
  var sslResult = await gemini.getResponse("Sprawdź wiarygodność danych i oceń od 0 do 100 (0-Niebezpieczna, 100-Bezpieczna). Sprwadź czy firma jest znana a dane powiązane z nią są prawidłowe. Jeżeli firma nie jest znana dokonaj oceny na podstawie dostępnych danych. Dane: "+JSON.stringify(result.sslcert));
  result.sslcert = sslResult;
  var data = await gemini.getResponse("Muszę ocenić czy strona jest oszustwem. Muszę to przedstawić w skali od 0 do 100 (0-Niebezpieczna, 100-Bezpieczna). Zwróć szczególną uwagę na dane whois. Potrzebuję oddzielnych ocen dla WHOIS, treści strony, rezultatu API IPQS, i średniej z tych 3 wyników. Podaj mi również pare krótkich plusów i minusów. Wytłumacz jak dla osoby nie znającej się na informatyce. Zwróć dane w postaci JSON w formacie {whois: 0, ssl: 0, ipqs: 0, average: 0, pros: [], cons: []} Dane:"+JSON.stringify(result));
  var parsed = parseText(data);
  var final = await gemini.getResponse("Wypuść tylko dane json z tych danych: ["+parsed+"] usuń '```json");
  try{
    JSON.parse(parseText(final));
  }catch{
    final = await generateGeminiResponse(result);
  }
  return final;
}

router.get('/gemini', async (req, res, next) => {
  var connectable = await util.checkIfConnectable(req.query.website);
  if(!connectable){
    res.send(JSON.stringify({error: 'Website is not reachable'}));
    return;
  }
  cacheManager.clean();
  if(!(req.query.fr && req.query.fr == "true")){
    if(cacheManager.get(req.query.website)){
      var data = await cacheManager.get(req.query.website);
      res.send(parseText(data));
      return;
    }
  }
  var website = req.query.website;
  var result = await runAllWorkers(website);
  console.log("Gemini working")
  var final = await generateGeminiResponse(result);
  cacheManager.set(website, final);
  res.send(parseText(final));
});

module.exports = router;
