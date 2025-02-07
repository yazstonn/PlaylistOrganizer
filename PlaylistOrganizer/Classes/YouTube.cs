using Google.Apis.Services;
using Google.Apis.YouTube.v3;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Util.Store;
using PlaylistOrganizer.Data;
using PlaylistOrganizer.Classes.Utils;

namespace PlaylistOrganizer.Classes
{
    public static class YouTube
    {

        private static YouTubeService YouTubeService;

        public static async Task<UserCredential> AuthorizeAsync()
        {
            try
            {

                var clientSecrets = new ClientSecrets
                {
                    ClientId = Api.YouTubeClientId,
                    ClientSecret = Api.YouTubeClientSecret
                };


                var credential = await GoogleWebAuthorizationBroker.AuthorizeAsync(
                    clientSecrets,
                    Api.YouTubeScopes,
                    "user",
                    CancellationToken.None,
                    new FileDataStore("YouTube.Auth.Store")
                );

                return credential;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur d'autorisation OAuth : {ex.Message}");
                throw;
            }
        }

        public static async Task<List<VideoInfo>> GetLikedVideosAsync(YouTubeService youtubeService)
        {
            string nextPageToken = null;

            var videos = new List<VideoInfo>();

            try
            {
                do
                {
                    // Requête pour récupérer les vidéos "J’aime" (playlistItems.list)
                    var request = youtubeService.PlaylistItems.List("snippet");
                    request.PlaylistId = "LM"; // PlaylistId correspond à "LM" (J’aime)
                    request.MaxResults = 50; // Limite maximale (50 est le max permis par l'API)
                    request.PageToken = nextPageToken; // Jeton pour la pagination

                    var response = await request.ExecuteAsync(); // Exécuter la requête

                    // Parcourir les vidéos et les ajouter à la liste
                    foreach (var item in response.Items)
                    {
                        videos.Add(new VideoInfo
                        {
                            Title = item.Snippet.Title,
                            VideoId = item.Snippet.ResourceId.VideoId,
                            ChannelTitle = item.Snippet.VideoOwnerChannelTitle
                        });
                    }

                    // Passer à la page suivante (s'il y en a une)
                    nextPageToken = response.NextPageToken;

                    Console.WriteLine($"Récupéré {videos.Count} vidéos jusqu'à présent...");
                }
                while (!string.IsNullOrEmpty(nextPageToken)); // Continue jusqu'à la fin des pages

                return videos; // Retourne la liste des vidéos une fois récupérées
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur lors de la récupération des vidéos : {ex.Message}");
                return videos; // Retourne la liste partielle si une erreur se produit
            }
        }


        // Créer une nouvelle playlist sur YouTube
        private static async Task<string> CreatePlaylist(string name, string description)
        {
            var playlist = new Google.Apis.YouTube.v3.Data.Playlist
            {
                Snippet = new Google.Apis.YouTube.v3.Data.PlaylistSnippet
                {
                    Title = name,
                    Description = description
                },
                Status = new Google.Apis.YouTube.v3.Data.PlaylistStatus
                {
                    PrivacyStatus = "private"
                }
            };

            try
            {
                var request = YouTubeService.Playlists.Insert(playlist, "snippet,status");
                var response = await request.ExecuteAsync();
                Console.WriteLine($"Playlist créée : {response.Snippet.Title} ({response.Id})");
                return response.Id;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur lors de la création de la playlist : {ex.Message}");
                return null;
            }
        }

        // Ajouter une vidéo à une playlist sur YouTube
        private static async Task<bool> AddToPlaylist(string playlistId, string videoId)
        {
            var playlistItem = new Google.Apis.YouTube.v3.Data.PlaylistItem
            {
                Snippet = new Google.Apis.YouTube.v3.Data.PlaylistItemSnippet
                {
                    PlaylistId = playlistId,
                    ResourceId = new Google.Apis.YouTube.v3.Data.ResourceId
                    {
                        Kind = "youtube#video",
                        VideoId = videoId
                    }
                }
            };

            try
            {
                var request = YouTubeService.PlaylistItems.Insert(playlistItem, "snippet");
                var response = await request.ExecuteAsync();
                Console.WriteLine($"Vidéo ajoutée à la playlist : {response.Snippet.Title}");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur lors de l'ajout de la vidéo : {ex.Message}");
                return false;
            }
        }
    }
}


