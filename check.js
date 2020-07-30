const class_sets = require('./class_sets')

var checkClassSet = function(css){
    // Check property
    var class_set = class_sets[css.property];
    if(!(class_set && class_set.value_set)) return false;
  
    // Check value
    var index = class_set.value_set.indexOf(css.value);
    if( !(index>=0) ) return false;
  
    // Set class_set
    css.class_set = class_set;
    return true;
}

module.exports = { checkClassSet }