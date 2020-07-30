const {startRootElement} = require('./start');
const {getCssOfClass} = require('./get');
const {createCss, createCssFromClass, createCodeFromCss} = require('./create');

// const create = require('create')

// Variable Section
var debug = true;

// Initialize Section
var initialize = function(content, window, vue_classes){
  for(i = 0; i < vue_classes.length; i++){
    if(window.css.success.some(function(css_class){
      return css_class.res_class == vue_classes[i]
    })){
    continue
    }
    extra_class = createCssFromClass(vue_classes[i], window)
    if(extra_class != undefined){
      window.css.success.push(extra_class)
    }
  }
  if(content != undefined){
    startRootElement(content,window)
  }
};

module.exports = { initialize }