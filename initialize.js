const {createCssFromClass} = require('./create');

// const create = require('create')

// Variable Section
var debug = true;

// Initialize Section
var initialize = function(window, classes){
  for(i = 0; i < classes.length; i++){
    if(window.css.success.some(css_class => css_class.res_class === classes[i])){ continue }
    extra_class = createCssFromClass(classes[i], window)
    if(extra_class != undefined) window.css.success.push(extra_class)
  }
};

module.exports = { initialize }