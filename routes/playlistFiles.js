var express = require('express');
var router = express.Router();
const fs = require("fs");
const path = require("path");
const playlistsDir = path.join(__dirname, '../public/json/playlistFiles');

router.get('/', function (req, res, next) {
    
    
    console.log(playlistsDir);
    fs.readdir(playlistsDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading directory' });
        }
        let playlists = files
            .filter(file => file.endsWith('.json'))
            
        for (let index = 0; index < playlists.length; index++) {
            playlists[index] = path.parse(playlists[index]).name;
            
        }
        res.json(playlists);
    });
});

router.get('/*',function(req,res,next){
    let data = fs.readFileSync(playlistsDir+"/"+req.params[0]+".json",err => {
        if (err) {
          console.error(err);
        } else {
          // file written successfully
        }
      })
      let dataObj = JSON.parse(data)
    const page = parseInt(req.query.page) || 1; // Page actuelle, par défaut 1
    const limit = 30; // Nombre d'éléments par page

    const totalPages = Math.ceil(dataObj.length / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const pageData = dataObj.slice(startIndex, endIndex);
    res.render("music",{ title: req.params[0], data: pageData,
        currentPage: page,
        totalPages: totalPages
    } );
});

module.exports = router;