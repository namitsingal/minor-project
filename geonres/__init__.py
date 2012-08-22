from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

# Configs
SQLALCHEMY_DATABASE_URI = 'mysql://root:@localhost/geonres'

app = Flask(__name__)

from geonres.views import *

app.config.from_object(__name__)

db = SQLAlchemy(app)

class Artist(db.Model):
    __tablename__ = 'artists'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    country = db.Column(db.String(100))

    def __init__(self, name, country):
        self.name = name
        self.country = country
