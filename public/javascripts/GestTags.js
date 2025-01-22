const fs = require("fs");

function fetchTags(){
    const file =  fs.readFileSync("./tagged.json",err => {
            if (err) {
              console.error(err);
            } else {
              // file written successfully
            }
          });
    let tags = [];
    let tagsWeight = [];
    let tracks = JSON.parse(file);
    tracks.forEach((element) => {
        element.tags.forEach((tag) => {
            if(!tags.includes(tag)){
                tags.push(tag);
                tagsWeight.push(1);
                console.log(`added ${tag} to the list`);
            }else{
                tagsWeight[tags.indexOf(tag)]++;
                console.log(`${tag} incremented to ${tagsWeight[tags.indexOf(tag)]}`);
            }
        });
    });
    let tagsWeighted = [];
    for (let index = 0; index < tags.length; index++) {
        const tag = tags[index];
        const weight = tagsWeight[index];
        tagsWeighted.push([tag,weight]);
    }

    tagsWeighted.sort(sortFunction);
    fs.writeFileSync("./listOfTagsRaw.json",JSON.stringify(tagsWeighted),err => {
            if (err) {
              console.error(err);
            } else {
              // file written successfully
            }
          })
}

function sortFunction(a, b) {
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[1] < b[1]) ? 1 : -1;
    }
}

function makePlaylist(){
    const TrackList =  JSON.parse(fs.readFileSync("./tagged.json",err => {
        if (err) {
          console.error(err);
        } else {
          // file written successfully
        }
      }));
      const tagsTmp =  JSON.parse(fs.readFileSync("./listOfTagsEdited.json",err => {
        if (err) {
          console.error(err);
        } else {
          // file written successfully
        }
      }));
      let tags = [];
      tagsTmp.forEach((tag) => {
        tags.push(tag[0]);
      })
      const map = new Map();
      TrackList.forEach((track) => {
        track.tags.forEach((tag) => {
            if(tags.includes(tag)){
                if (map.has(tag)) {
                    console.log(tag);
                    map.get(tag).push(track);
                }else{
                    console.log(tag);
                    map.set(tag,[track]);
                }
            }
        });
      });
      console.log(map);
      tags.forEach((tag) => {
        fs.writeFileSync(`./playlist/${tag}.json`,JSON.stringify(map.get(tag)),err => {
            if (err) {
              console.error(err);
            } else {
              // file written successfully
            }
          })
      })
}

//fetchTags();
makePlaylist();