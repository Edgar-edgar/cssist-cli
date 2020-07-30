#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const jsdom = require("jsdom");
const chalk = require("chalk")
var package_json = require('./cssist/package.json');
const { JSDOM } = jsdom;

const {createCodeFromCss} = require('./create');
const initialize = require('./initialize');
const { download } = require('./download');

// const cssist = require('./cssist');

let startPath = 'src'
let filter = '.vue'
let filter_html = '.html'
let cssist_storage = {
  css : {
    success: [],
    fail: []
  }
}

const argv = require('yargs')
.command('build', '', () => {}, ()=> readCode(startPath, filter))
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

function readCode(startPath, filter){
  let content = null
  if(!fs.existsSync(startPath)){
    return console.log('no dir')
  }
  
  var files = fs.readdirSync(startPath)

  files.forEach((file) =>{
    let filename = path.join(startPath, file)
    let stat = fs.lstatSync(filename)

    if(stat.isDirectory()){
      readCode(filename, filter)
    }else if(filename.indexOf(filter)>0){
      content = fs.readFileSync(filename, 'utf-8')
      const dom = new JSDOM(`<body>${content}</body>`)
      let cli_content = new JSDOM(dom.window.document.querySelector('template').innerHTML)
      console.log(chalk.blue('----------',file,'------'))
      getStartSelector(cli_content.window.document.querySelector('body'), cssist_storage)
      var codes = createCodeFromCss(cssist_storage.css.success)
      download(codes)
    }
  })

  function getStartSelector(rawcode, cssist_storage){
    let innerhtml = rawcode.innerHTML
    let vue =':class="{'
    let index = innerhtml.indexOf(vue)
    let start = 0
    let end = 0
    let extra_class = []
    while(index !== -1){
      start =  innerhtml.indexOf(vue) + vue.length-1
      end = innerhtml.substring(start).indexOf('"')
      
      vue_classes = innerhtml.substr(start, end)
      innerhtml = innerhtml.substring(start + end)

      index = innerhtml.indexOf(vue)
      vue_classes = vue_classes.replace(/'/g, '"')
      extra_class.push(...Object.keys(JSON.parse(vue_classes)))
    }

    initialize.initialize(rawcode, cssist_storage, extra_class)
  }
}