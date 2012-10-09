import sys

sys.path.append('../')

from geonres import app

app.debug = True;
app.run(port=8000)
