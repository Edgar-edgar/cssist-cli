#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const jsdom = require("jsdom");
const chalk = require("chalk")
var package_json = require('./cssist/package.json');
const { JSDOM } = jsdom;

const {createCodeFromCss} = require('./create');
const initialize = require('./initialize');
// const { angularDownload } = require('./download');

// const cssist = require('./cssist');

let startPath = null;
let downloadPath = null;
let codes = null;
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
  download(downloadPath, codes)
  startPath = path.resolve(argv.path)
  readCode(startPath, filter_html, filter_vue)
  
})

.command('version', '', () => {}, ()=> showGreetings())
.help()
.argv

function download(download_path, codes){
  fs.writeFile(`${download_path}/cssist.css`, codes, 'utf-8', function(err) {
      if(err) {
          return console.log(err);
      }
  });
}

function showGreetings(){
  var greeting = '/*' + '\n';
  greeting += 'CSSIST' + '\n';
  greeting += 'version : ' + package_json.version + '\n';
  greeting += 'date : ' + new Date() + '\n';

  console.log(greeting)
}


function readCode(startPath, filter_html, filter_vue){
  let html_content = null
  let vue_content = null
  if(!fs.existsSync(startPath)){
    return console.log('no dir')
  }
  
  var files = fs.readdirSync(startPath)
  files.forEach((file) =>{
    let filename = path.join(startPath, file)
    let stat = fs.lstatSync(filename)
    if(stat.isDirectory()){
      readCode(filename, filter_html, filter_vue)
    }else if(filename.indexOf(filter_html)>0){
      html_content = fs.readFileSync(filename, 'utf-8')
      const dom = new JSDOM(`<body>${html_content}</body>`)
      console.log(chalk.blue('----------',file,'------'))
      getAngularStartSelector(dom.window.document.querySelector('body'), cssist_storage)
      return
    }
    if(filename.indexOf(filter_vue)>0){
      vue_content = fs.readFileSync(filename, 'utf-8')
      vue_content = vue_content.replace("<template>", "").replace("</template>","")
      const dom = new JSDOM(`<body>${vue_content}</body>`)
      console.log(chalk.blue('----------',file,'------'))
      getVueStartSelector(dom.window.document.querySelector('body'), cssist_storage)
      return
      
    } 
  })
  let codes = createCodeFromCss(cssist_storage.css.success)
  download(downloadPath,codes)
  
  function getAngularStartSelector(rawcode, cssist_storage){
    let ng_extra_class = []
    let innerhtml = rawcode.innerHTML
    let ng_identifier = 'ng-class="[{'
    let index = innerhtml.indexOf(ng_identifier)
    let start = 0
    let end = 0
    let newer_trim = null
      while(index !== -1){
        start =  innerhtml.indexOf(ng_identifier) + ng_identifier.length-1
        end = innerhtml.substring(start).indexOf(']"')
        
        let ng_identifiers = innerhtml.substr(start, end)
        innerhtml = innerhtml.substring(start + end)
  
        index = innerhtml.indexOf(ng_identifier)
        ng_identifiers = ng_identifiers.replace(/'/g, '"').split(',')
        ng_identifiers.forEach((ng_identifier) =>{
          let trimmed = ng_identifier.trim()
          let begin_trim = trimmed.indexOf('"')+1
          let end_trim = trimmed.substring(begin_trim).indexOf('"')
          newer_trim = trimmed.substr(begin_trim, end_trim)
        })
        ng_classes = newer_trim.split(' ')
        ng_classes.forEach((ng_class)=>{
        ng_extra_class.push(ng_class)
        })
      }
        initialize.initialize(rawcode, cssist_storage, ng_extra_class)
  }
}

function getVueStartSelector(rawcode, cssist_storage){
  let innerhtml = rawcode.innerHTML
  let vue_extra_class = []
  let vue_identifier = ':class="{'
  let index = innerhtml.indexOf(vue_identifier)
  let start = 0
  let end = 0

  while(index !== -1){
    start =  innerhtml.indexOf(vue_identifier) + vue_identifier.length-1
    end = innerhtml.substring(start).indexOf('"')
    
    let vue_identifiers = innerhtml.substr(start, end)
    innerhtml = innerhtml.substring(start + end)
    index = innerhtml.indexOf(vue_identifier)
    vue_identifiers = vue_identifiers.replace(/'/g, '"').split(',')
    vue_extra_class.push(...Object.keys(JSON.parse(vue_identifiers)))
  }
  initialize.initialize(rawcode, cssist_storage, vue_extra_class)
}

// extra_class.push(...Object.keys(JSON.parse(id_class)))
// let cli_content = new JSDOM(dom.window.document.querySelector('template').innerHTML)