from api import app

@app.route('/')
def index():
    return 'This is the index API endpoint.'

