from geonres import app

@app.route('/')
def index():
    return 'this is the geonres index page'

