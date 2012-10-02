from flask import Flask

# Configs
SQLALCHEMY_DATABASE_URI = 'mysql://root:@localhost/geonres'

app = Flask(__name__)
app.config.from_object(__name__)

from users import views