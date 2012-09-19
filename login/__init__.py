from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

# Configs
SQLALCHEMY_DATABASE_URI = 'mysql://root:@localhost/geonres'

app = Flask(__name__)

app.config.from_object(__name__)

db = SQLAlchemy(app)

class Login(db.Model):
    __tablename__ = 'user_info'
    username = db.Column(db.String(100),unique=True)
    password = db.Column(db.String(100))
    email = db.Column(db.String(100),unique=True)
    id = db.Column(db.Integer(20),primary_key=True)
    def __init__(self, name, password,email):
        self.username = name
        self.password = password
	self.email=email

