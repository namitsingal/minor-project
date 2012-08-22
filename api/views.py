import json

from api import app
from geonres import Artist

PAGE_LENGTH = 5

@app.route('/')
def index():
    return '{"ApiResponse": "Home"}'

@app.route('/artists/<country>', defaults={'page': 1})
@app.route('/artists/<country>/<page>')
def view_artists(country, page):
    artists = Artist.query.filter_by(country=country).all()
    offset = 5 * (int(page) - 1)
    artists_page = artists[offset: offset + PAGE_LENGTH - 1]
  
    artists_list = []
    for artist in artists_page:
        artists_list.append(artist.name)
    
    response = json.dumps(artists_list)
    return response
