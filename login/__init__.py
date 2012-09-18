from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

# Configs
SQLALCHEMY_DATABASE_URI = 'mysql://root:@localhost/geonres'

app = Flask(__name__)

app.config.from_object(__name__)

db = SQLAlchemy(app)

class login(db.Model):
    __tablename__ = 'login'
    username = db.Column(db.String(100),primary_key=True)
    password = db.Column(db.String(100))

    def __init__(self, name, password):
        self.username = name
        self.password = password

