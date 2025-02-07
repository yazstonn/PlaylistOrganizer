using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.DotNet.MSIdentity.Shared;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using PlaylistOrganizer.Data;


namespace PlaylistOrganizer.Classes
{
    public static class LastFM
    {

        private static string apiUrl = "http://ws.audioscrobbler.com/2.0/";

        public static async Task<List<string[]>> GetTags(string[] args)
        {

            using HttpClient client = new HttpClient();

            try
            {
                // args[0] = artist && args[1] = track
                var query = args.Length == 1 ? $"?method=artist.getTopTags&artist={Uri.EscapeDataString(args[0])}&api_key={Api.ApiKeyLastFm}&format=json" : $"?method=artist.getTopTags&track={Uri.EscapeDataString(args[1])}&artist={Uri.EscapeDataString(args[0])}&api_key={Api.ApiKeyLastFm}&format=json";
                var requestUrl = apiUrl + query;

                HttpResponseMessage response = await client.GetAsync(requestUrl);

                if (response.IsSuccessStatusCode)
                {
                    string responseBody = await response.Content.ReadAsStringAsync();
                    return ExtractTagsFromResponse(responseBody);
                }
                else
                {
                    Console.WriteLine($"Erreur dans l'appel : {response.StatusCode}");
                }
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"Erreur HTTP : {ex.Message}");
            }

            return new List<string[]>();
        }

        private static List<string[]> ExtractTagsFromResponse(string response)
        {

            JObject jsonObject = JObject.Parse(response);
            JArray tagsArray = (JArray)jsonObject["toptags"]["tag"]!;

            List<string[]> tagList = new List<string[]>();

            foreach (JObject tag in tagsArray)
            {
                string name = tag["name"]!.ToString();
                string count = tag["count"]!.ToString();

                tagList.Add([name, count]);
            }

            return tagList;
        }
    }
}
