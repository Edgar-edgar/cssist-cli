const { property_sets } = require('./property_sets')

var getCssOfClass = function(res_class){
  if(!res_class){ return; }

  var regx_prop = '([a-zA-Z\\_]+)';
  var regx_value = '(?:-([a-zA-Z0-9\\_]+))?';
  var regx_event = '(?:-([a-zA-Z]{1,3}))?';
  var regx_media_query = '(?:-((?:(?:XH|NH|XW|NW|X|N)[0-9]+)+))?';
  var regx = new RegExp('^'+regx_prop+regx_value+regx_event+regx_media_query+'$');
  // Current: /^([a-zA-Z_]+)([a-zA-Z0-9_]+)(?:-([a-zA-Z]{1,3}))?(?:-((?:(?:XH|NH|XW|NW|X|N)[0-9]+)+))?$/
  // Past: /^([a-zA-Z\_]+)-((?:[a-zA-Z0-9]|(?:\_)|(?:\-\-))+)(?:-([a-zA-Z]{1,2}))?(?:-((?:(?:XH|NH|XW|NW|X|N)[0-9]+)+))?$/

  // Match
  var matches = res_class.match(regx);
  // Check
  if(!(matches && matches[1])) return; // No property
  if(!matches[2]){ // No value
    if(matches[1]!=='cen') return;
  }
  return {
    res_class: res_class,
    property: matches[1],
    value: matches[2]?matches[2]:null,
    event: matches[3]?matches[3]:null,
    media_query: matches[4]?matches[4]:null
  };
};

var getPropertyValue = function(prop, val){
  // Loop property_sets
  for(var i=0; i<property_sets.length; i++){
    // Set property_set
    var property_set = property_sets[i];
    if(!(property_set && property_set.properties[prop])) continue;
    // Set value_sets
    var value_sets = property_set.value_sets;
    // Loop value_sets
    for(var j=0; j<value_sets.length; j++){
      var value_set = value_sets[j];
      var regex = new RegExp('^'+value_set.regex+'$');
      if(val.match(regex)) {
        return {
          property:property_set.properties[prop],
          property_set : property_set,
          value_set : value_set,
          value: value_set.getValue(val)
        };
      }
    }
  }
}

var getEvent = function(evt){
  if(!evt) return;
  if(!event_set[evt.toLowerCase()]) return;
  return event_set[evt.toLowerCase()];
};

var getMediaQuery = function(mq){
  if(!mq) return null;
  var media_query = {};
  if(mq.match(/^XW[0-9]+/)||mq.match(/^X[0-9]+/)) media_query.key = 'max_width';
  else if(mq.match(/^NW[0-9]+/)||mq.match(/^N[0-9]+/)) media_query.key = 'min_width';
  else if(mq.match(/^XH[0-9]+/)) media_query.key = 'max_height';
  else if(mq.match(/^NH[0-9]+/)) media_query.key = 'min_height';
  else return null;
  media_query.value = mq.match(/[0-9]+/)[0]+'px';
  return media_query;
};

var getMediaQueries = function(mqs){
  var media_queries = {};
  if(!mqs) return media_queries;
  var regex_each = '((?:XH|NH|XW|NW|X|N)[0-9]+)';
  var regex = new RegExp('^'+regex_each+regex_each+'?'+'$');

  var matches = mqs.match(regex);
  for(var i=1; i<=matches.length-1; i++){
    var media_query = getMediaQuery(matches[i]);
    if(media_query) media_queries[media_query.key] = media_query.value;
  }
  return media_queries;
};

var getCodesMediaQuery = function(codes, css){
  var getMax = function(px){
    if(!px) return;
    var gap = 0.00000001;
    var number = px.match(/[0-9]+/)[0] - gap;
    return number + 'px';
  }

  // Set css_codes
  if(!(css.max_width||css.min_width||css.max_height||css.min_height)) return codes+'\n\n';

  // Set media_query
  var media_queries = [];
  if(css.max_width) media_queries.push('max-width:'+getMax(css.max_width));
  if(css.min_width) media_queries.push('min-width:'+css.min_width);
  if(css.max_height) media_queries.push('max-height:'+getMax(css.max_height));
  if(css.min_height) media_queries.push('min-height:'+css.min_height);
  return '@media all and ('+media_queries.join(') and (')+') { '+codes+' }'+'\n\n';
};

var getCode = function(style){
    return style.property + ": " + style.value

}

var getCodesCors = function(css){
  var broswers = ['', '-webkit-', '-moz-', '-o-', '-ms-'];
  var styles = ''

  css.forEach(css_i => {
    var code = getCode(css_i)
    var codes = ''
    broswers.forEach(browser => {
      codes +="  " + browser + code + ";\n" 
    });
    styles += "." + css_i.res_class + " {\n" + codes + "}\n"
  });
  return styles
};

module.exports= { getCssOfClass, getPropertyValue,getMediaQueries, 
  getEvent, getCodesCors, getCodesMediaQuery }