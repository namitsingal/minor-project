import json
import urllib

from bs4 import BeautifulSoup
import requests

from api import app
from geonres import Artist

PAGE_LENGTH = 5

@app.route('/')
def index():
    return '{"ApiResponse": "Home"}'

@app.route('/artists/<country>', defaults={'page': 1})
@app.route('/artists/<country>/<page>')
def get_artists(country, page):
    artists = Artist.query.filter_by(country=country).all()
    offset = 5 * (int(page) - 1)
    artists_page = artists[offset: offset + PAGE_LENGTH - 1]
  
    artists_list = []
    for artist in artists_page:
        artists_list.append(artist.name)
    
    response = json.dumps(artists_list)
    return response

@app.route('/videos/<artist>', defaults={'page': 1})
@app.route('/videos/<artist>/<page>')
def get_videos(artist, page):
    lfm_url = 'http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks'
    lfm_url += '&artist=' + artist
    lfm_url += '&api_key=b25b959554ed76058ac220b7b2e0a026&limit=5'
    lfm_url += '&page=' + str(page)    

    r = requests.get(lfm_url)
    soup = BeautifulSoup(r.text)
    track_items = soup.find_all('track')

    response = []
    for track in track_items:
        track_title = track.find('name').string
        yt_url = 'https://gdata.youtube.com/feeds/api/videos?'
        yt_url += 'q=' + artist + ' ' + track_title
        yt_url += '&v=2&max-results=1'

        r = requests.get(yt_url)
        #return r.text
        soup = BeautifulSoup(r.text)
        entry = soup.find_all('entry')[0]
        vid_id = entry.find('id').string.split(':')[-1]
        vid_thumb = entry.find('media:thumbnail')['url']
        vid_result = {'id': vid_id, 'thumb_url': vid_thumb,
                'title': track_title}

        response.append(vid_result)

    return json.dumps(response)
