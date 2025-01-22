const { google } = require('googleapis');
const readline = require('readline');
const fs = require('node:fs');
const path = require('node:path');
const promise = require('fs/promises');

// Charger les informations d'identification
const credentials = {
    installed: {
        client_id: "1049306400638-qdlnebp4t00sd7o7p6j41h71m822ncf9.apps.googleusercontent.com",
        project_id: "robust-channel-429515-e4",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_secret: "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",
        redirect_uris: ["http://localhost:3000/getToken"],
    },
};

const { client_secret, client_id, redirect_uris } = credentials.installed;
const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);


(async function main() {
    const authClient = await getAccessToken();
    const directoryPath = './playlistFiles';
    const iterator = checkIterator();
    let filesName = await getFilesInDirectory(directoryPath);
    for (let index = iterator[0]; index < filesName.length; index++) {
        const fileName = filesName[index];
        const name = path.parse(fileName).name;
        const playlistId = await createPlaylist(name, "Playlist Généré automatiquement",authClient);
        let videos = [];
        let skip = false;
        const file = JSON.parse(fs.readFileSync(`./playlistFiles/${name}.json`,err => {
                if (err) {
                  console.error(err);
                  skip = true;
                }
              }));
        for (let index2 = iterator[1]; index2 < file.length; index2++) {
            const element = file[index2];
            if(!await addToPlaylist(playlistId, element.videoId,authClient)){
                updateIterator(index,index2);
                break;
            }
        }
    }

    /*// Créer la playlist
    const playlistId = await createPlaylist(playlistName, playlistDescription);

    // Ajouter les vidéos à la playlist
    for (const videoId of videoIds) {
        await addToPlaylist(playlistId, videoId);
    }

    console.log('Toutes les vidéos ont été ajoutées à la playlist:', playlistName);*/
})()

function updateIterator(index,index2){
    fs.writeFileSync("./stopped.json",JSON.stringify([index,index2]),err => {
            if (err) {
              console.error(err);
            } else {
              // file written successfully
            }
          });
}

function checkIterator(){
    fs.open('stopped.json', 'r', (err, fd) => {
        if(err){

        }else{
            
        }
      });
}

// Obtenir un token d'accès
async function getAccessToken() {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/youtube.force-ssl',
         'https://www.googleapis.com/auth/youtube.readonly']
    });

    console.log('Visitez cette URL pour autoriser l\'application:', authUrl);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve, reject) => {
        rl.question('Entrez le code d\'autorisation ici : ', (code) => {
            rl.close();
            oauth2Client.getToken(code, (err, token) => {
                if (err) return reject('Erreur lors de l\'obtention du token : ' + err);
                oauth2Client.setCredentials(token);
                resolve(oauth2Client);
            });
        });
    });
}

// Appeler l'API YouTube
async function getLikedVideos() {
    const authClient = await getAccessToken();

    const youtube = google.youtube({ version: 'v3', auth: authClient });

    let nextPageToken = '';
    const videos = [];

    // Boucle pour récupérer toutes les pages de vidéos
    try {
        do {
            const response = await youtube.playlistItems.list({
                playlistId: 'LM',  // Playlist "J’aime"
                part: 'snippet',
                maxResults: 50, // Max per request (le maximum autorisé)
                pageToken: nextPageToken, // Token pour la page suivante
            });

            const items = response.data.items;
            items.forEach((item) => {
                videos.push({
                    title: item.snippet.title,
                    videoId: item.snippet.resourceId.videoId,
                    channelTitle: item.snippet.videoOwnerChannelTitle,
                });
            });

            nextPageToken = response.data.nextPageToken; // Passage à la page suivante

            console.log(`Récupéré ${videos.length} vidéos jusqu'à présent...`);

        } while (nextPageToken); // Continue jusqu'à avoir 500 vidéos

        return videos;
    } catch (error) {
        console.error('Erreur lors de la récupération des vidéos :', error);
    }
}

async function createPlaylist(name, description,authClient) {
    const youtube = google.youtube({ version: 'v3', auth: authClient });

    try {
        const response = await youtube.playlists.insert({
            part: ['snippet', 'status'],
            requestBody: {
                snippet: {
                    title: name,
                    description: description,
                },
                status: {
                    privacyStatus: 'private', // 'public', 'unlisted', ou 'private'
                },
            },
        });

        console.log('Playlist créée avec succès:', response.data);
        return response.data.id; // ID de la playlist
    } catch (error) {
        console.error('Erreur lors de la création de la playlist:', error);
    }
}

async function addToPlaylist(playlistId, videoId,authClient) {
    const youtube = google.youtube({ version: 'v3', auth: authClient });

    try {
        const response = await youtube.playlistItems.insert({
            part: ['snippet'],
            requestBody: {
                snippet: {
                    playlistId: playlistId,
                    resourceId: {
                        kind: 'youtube#video',
                        videoId: videoId,
                    },
                },
            },
        });

        console.log('Vidéo ajoutée à la playlist:', response.data);
        return true;
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la vidéo à la playlist:', error);
        return false;
    }
}

async function getFilesInDirectory(directoryPath) {
    try {
        const files = await promise.readdir(directoryPath, { withFileTypes: true });
        // Filtrer pour ne retourner que les fichiers
        return files
            .filter(dirent => dirent.isFile())
            .map(dirent => dirent.name);
    } catch (error) {
        console.error('Erreur lors de la lecture du dossier:', error);
        return []; // Retourner un tableau vide en cas d'erreur
    }
}

