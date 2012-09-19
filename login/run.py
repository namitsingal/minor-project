import sys
sys.path.append('../')
from login import app
app.debug = True;
#app.run(port=8080)
from login import views

app.run(port=8080)
