import sys
sys.path.append('../')

from users import app
app.debug = True;
app.run(port=8080)
