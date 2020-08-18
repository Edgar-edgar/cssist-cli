u#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const jsdom = require("jsdom");
const chalk = require("chalk")
var package_json = require('./cssist/package.json');
const { JSDOM } = jsdom;

const {createCodeFromCss} = require('./create');
const {initialize} = require('./initialize');
// const { angularDownload } = require('./download');

// const cssist = require('./cssist');

let startPath = null;
let downloadPath = null;
let p = null;
let classes = []
let filter_vue = '.vue'
let filter_html = '.html'
let cssist_storage = {
  css : {
    success: [],
    fail: []
  }
}

const argv = require('yargs')
.command('build', 'build css classes', function(yargs){
  yargs.option('path', {
    description: "path of css classes",
    alias: "p",
    demandOption: true
  }),
  yargs.option('downloadpath', {
    description: "path to write css file",
    alias: "dp",
    demandOption: true
  })
}, function(argv){
  downloadPath = path.resolve(argv.downloadpath)
  startPath = path.resolve(argv.path)
  p = path.resolve(argv.path)
  readCode(startPath, p)
})

.command('version', '', () => {}, ()=> showGreetings())
.help()
.argv


function showGreetings(){
  var greeting = '/*' + '\n';
  greeting += 'CSSIST' + '\n';
  greeting += 'version : ' + package_json.version + '\n';
  greeting += 'date : ' + new Date() + '\n';

  console.log(greeting)
}


function readCode(startPath, p){
  let content = null
  if(!fs.existsSync(startPath)){
    return console.log('no dir')
  }
  
  var files = fs.readdirSync(startPath)

  files.forEach((file) =>{
    let filename = path.join(startPath, file)
    let stat = fs.lstatSync(filename)
    if(stat.isDirectory()){
      readCode(filename, p)
    }else if(filename.indexOf(filter_vue) !== -1 || filename.indexOf(filter_html) !== -1){
      content = fs.readFileSync(filename, 'utf-8')
      content = content.replace("<template>").replace("</template")
      const dom = new JSDOM(`<body>${content}</body>`).window.document
      console.log(chalk.blue('Compiling',file,'------'))
      getStartSelector(dom.querySelector('body'))
    }
  })
  if(startPath === p){
    initialize(cssist_storage, classes)
    save(downloadPath, createCodeFromCss(cssist_storage.css.success))
  }
}
  
function save(p, codes){
  fs.writeFile(`${p}/cssist.css`, codes, 'utf-8', () => {})
}

function getStartSelector(rawcode){

  let innerHTML = rawcode.innerHTML

  let vue = ':class="{'
  let angular = 'ng-class="[{'
  let identifier = ''

  if(innerHTML.indexOf(vue) !== -1) identifier = vue
  else if(innerHTML.indexOf(angular) !== -1) identifier = angular
  else return getAllClassesOfVanilla(rawcode)

  let index = innerHTML.indexOf(identifier)
  let start = 0
  let end = 0

  while(index !== -1){
    start =  innerHTML.indexOf(identifier) + identifier.length-1
    end = innerHTML.substring(start).indexOf('"')
    
    let identifiers = innerHTML.substr(start, end)
    innerHTML = innerHTML.substring(start + end)
    index = innerHTML.indexOf(identifier)
    identifiers = identifiers.replace(/'/g, '"').split(',')

    if(identifiers.length === 0) continue

    let cls = identifiers.map((_identifier) =>{

    _identifier = _identifier.trim()
    let begin_trim = _identifier.indexOf('"')+1
    let end_trim = _identifier.substring(begin_trim).indexOf('"')
    return _identifier.substr(begin_trim, end_trim).split(' ') 
      
    })
    
    classes.push(...[].concat.apply([], ...cls))
  }
}

function getAllClassesOfVanilla(doc){
  let AllEl = doc.querySelectorAll('[class]')
  AllEl.forEach(element => {
    let _classes = element.className.toString().split(/\s+/)
    _classes.forEach(cls =>{
      if(cls && classes.indexOf(cls) === -1){
        classes.push(cls)
      }
    })
  })
}