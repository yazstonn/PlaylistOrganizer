const axios = require('axios');
const fs = require("fs");

async function getGenresFromLastFM(artist, title) {
    const apiKey = '8e63b9f1f71282dfea10e2d562bf723f';  // Remplacez avec votre clé d'API Last.fm
    let answer = `erreur pour le titre ${title} ${artist}`;
    // Recherche de l'artiste dans Last.fm pour récupérer ses informations
    try {

        let response = await axios.get(`http://ws.audioscrobbler.com/2.0/`, {
            params: {
                method: 'track.getTopTags',
                track: title,
                artist: artist,
                api_key: apiKey,
                format: 'json',
            },
        });
        let tags = response.data.toptags.tag;
        if(tags.length == 0){
                response = await axios.get(`http://ws.audioscrobbler.com/2.0/`, {
                    params: {
                        method: 'artist.getTopTags',
                        artist: artist,
                        api_key: apiKey,
                        format: 'json',
                    },
                });
                tags = response.data.toptags.tag;
        }

        let toptags = [];
        tags.forEach(element => {
            if(element.count > 30){
                toptags.push(element.name);
            }
        });
        if(toptags.length == 0){
            answer = null;
            console.log(`no tags found for ${title} from ${artist}`);
        }else{
            answer = JSON.stringify(toptags);
            console.log(`found ${toptags.length} tags for ${title} from ${artist}`);
        }
        
        // Vérifiez les tags renvoyés

    } catch (error) {
       answer =  ['Erreur lors de l\'appel à Last.fm:', error];
    }
    return answer;
}

async function writeTags() {
  let tagged = [];
  let untagged = [];
    const file =  fs.readFileSync("./playlist.json",err => {
        if (err) {
          console.error(err);
        } else {
          // file written successfully
        }
      });
    let playlist = JSON.parse(file);
      for (let index = 0; index < playlist.length; index++) {
        let element = playlist[index];
        let tmp = await getGenresFromLastFM(element.channelTitle, element.title);
        if(typeof tmp == "string"){
          element.tags = JSON.parse(tmp);
          tagged.push(element);
        }else{
          untagged.push(element);
        }
      }
        
      fs.writeFileSync("./tagged.json",JSON.stringify(tagged),err => {
        if (err) {
          console.error(err);
        } else {
          // file written successfully
        }
      });
      fs.writeFileSync("./untagged.json",JSON.stringify(untagged),err => {
        if (err) {
          console.error(err);
        } else {
          // file written successfully
        }
      })
}

writeTags();


