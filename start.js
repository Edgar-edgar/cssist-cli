const {createCssFromClass, createCodeFromCss} = require('./create');

let debug = true

let startElement = function(element,window){
  let created_codes = '';
  let success_codes = window.css.success
  // Check element
  if(!(element && element.classList && element.classList.length>=1)) return;
  
  // Set classes
  var selectors = element.classList;
  for(var i=0; i<selectors.length; i++){
    var classes = selectors[i];
    // Check selector
    css_class = createCssFromClass(classes, window)
    if(css_class != null){
      window.css.success.push(css_class)
    } else{
      window.css.fail.push(css_class)
    } 
  }
  created_codes += createCodeFromCss(success_codes);
}

let startRootElement = function(element,window){
    // if(debug) console.log('[start] startRootElement', element);
    
    // Check element
    if( !(element && typeof element === 'object' && element.nodeType && element.nodeType !== 8 && element.tagName) ) return;
    // if(debug) console.log('[start] startRootElement', element.tagName);

    // Start element
    startElement(element,window);
    
    // Get element_childen
    var element_childen = element.querySelectorAll('*');
  
    // Check element_childen
    if(!(element_childen && element_childen.length>=1)) return;
  
    // Start element_childen
    for(var i = 0; i < element_childen.length; i++){
      if(!element_childen[i]._cssist) startElement(element_childen[i], window);
    }
};

module.exports  =  { startRootElement, startElement }