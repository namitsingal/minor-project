import json
import urllib

from bs4 import BeautifulSoup
from flask import request, redirect
import requests

from api import app, api_response
from geonres import Artist

PAGE_LENGTH = 5

@app.route('/')
def index():
    return '{"ApiResponse": "Home"}'

@app.route('/artists/<country>', defaults={'page': 1})
@app.route('/artists/<country>/<page>')
def get_artists(country, page):
    format = request.args['format']
    artists = Artist.query.filter_by(country=country).all()
    offset = 5 * (int(page) - 1)
    artists_page = artists[offset: offset + PAGE_LENGTH - 1]
  
    artists_list = []
    for artist in artists_page:
        artists_list.append({'name': artist.name})
    
    response_obj = {'artists': artists_list}
   
    return api_response(response_obj, format)

@app.route('/videos/<artist>', defaults={'page': 1})
@app.route('/videos/<artist>/<page>')
def get_videos(artist, page):
    format = request.args['format']
    lfm_url = 'http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks'
    lfm_url += '&artist=' + artist
    lfm_url += '&api_key=977a73b8d997832303ec0a4bbd516ca7&limit=5'
    lfm_url += '&page=' + str(page)    

    r = requests.get(lfm_url)
    soup = BeautifulSoup(r.text)
    track_items = soup.find_all('track')

    response = []
    for track in track_items:
        track_title = track.find('name').string
        yt_url = 'https://gdata.youtube.com/feeds/api/videos?'
        yt_url += 'q=' + artist + '+' + track_title
        yt_url += '&v=2&max-results=1'
        r = requests.get(yt_url)
        soup = BeautifulSoup(r.text)
        entry = soup.find('entry')
        vid_id = entry.find('id').string.split(':')[-1]
        vid_thumb = entry.find('media:thumbnail')['url']
        vid_result = {'id': vid_id, 'thumb_url': vid_thumb,
                'title': track_title}

        response.append(vid_result)

    return api_response({'videos': response}, format)

@app.route('/suggestions/countries/<key>')
def get_suggestions(key):
    format = request.args['format']
    artists = Artist.query.filter(Artist.country.like(key + '%'))
    countries_list = []
    for artist in artists:
        country = artist.country
        if country not in countries_list:
            countries_list.append(artist.country)
        if len(countries_list) == 5:
            break

    return api_response({'countries': countries_list}, format)

@app.route('/details/artist/<artist>')
def get_artist_details(artist):
    format = request.args['format']
    url = ('http://ws.audioscrobbler.com/2.0/?method=artist.getinfo' +
           '&artist=' + artist + 
           '&api_key=977a73b8d997832303ec0a4bbd516ca7&format=json')
    r = requests.get(url)
    response = json.loads(r.text)

    bio = response['artist']['bio']['summary']
    images = response['artist']['image']
    for image in images:
        if image['size'] == 'medium':
            image_small = image['#text']
        elif image['size'] == 'large':
            image_large = image['#text']

    if 'arg' in request.args:
        arg = request.args['arg']
        if 'image_large' in arg:
            return redirect(image_large)
            
    else:    
        details = {'image_small': image_small,
                   'image_large': image_large,
                   'bio': bio}

        return api_response({'details': details}, format)