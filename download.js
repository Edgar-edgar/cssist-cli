const fs = require('fs');

function download(codes){
    fs.writeFile("./src/assets/cssist.css", codes, 'utf-8', function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
}

module.exports = { download }