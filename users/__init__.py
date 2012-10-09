from lib import RedisSessionInterface
from flask import Flask

# Configs
SQLALCHEMY_DATABASE_URI = 'mysql://root:@localhost/geonres'

app = Flask(__name__)
app.config.from_object(__name__)
app.session_interface = RedisSessionInterface.RedisSessionInterface()
app.debug = True

from users import views