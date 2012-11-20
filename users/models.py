from flask.ext.sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

from users import app

db = SQLAlchemy(app)

class User(db.Model):
    __tablename__ = 'users'
    username = db.Column(db.String(100), unique=True)
    password_hash = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)
    id = db.Column(db.Integer(20), primary_key=True)
    
    def __init__(self, name, password, email):
        self.username = name
        self.password_hash = generate_password_hash(password)
        self.email = email

    def check_password(self, password):
    	return check_password_hash(self.password_hash, password)

    def __repr__(self):
    	return '<User %s' % self.username

class UserProfile(db.Model):
    __tablename__ = 'user_profiles'
    id = db.Column(db.Integer(20), primary_key=True)
    user = db.Column(db.Integer, db.ForeignKey(User.id), unique=True)
    photo = db.Column(db.String(200))
    about = db.Column(db.String(200))
    interest = db.Column(db.String(200))
    name = db.Column(db.String(200))
    
class Discussion(db.Model):
    __tablename__ = 'discussions'
    id = db.Column(db.Integer(20), primary_key=True, autoincrement=True)
    genre = db.Column(db.String(100))
    name = db.Column(db.String(100))
    user_name = db.Column(db.String(100))
    comment = db.Column(db.String(100))
    date = db.Column(db.DateTime)

    def __init__(self, genre, name = 'default', user_name = 'default', comment = 'default'):
        self.genre = genre
        self.name = name
        self.user_name = user_name
        self.comment = comment
        self.date = datetime.utcnow()
    
    def __repr__(self):
        return '<genre - '+self.genre+'> <user - '+self.user_name+'>'



class Playlist(db.Model):
    __tablename__ = 'playlist'
    user = db.Column(db.String(100), db.ForeignKey(User.username), primary_key=True)
    name = db.Column(db.String(100), primary_key=True)
    id = db.Column(db.String(100), primary_key=True)
    thumb_url = db.Column(db.String(100))
    title = db.Column(db.String(100))
    
    def __init__(self, user, name, song_id='default',thumb_url='default',title='default'):
        self.user = user
        self.name = name
        self.id = song_id
        self.thumb_url = thumb_url
        self.title = title

    def __repr__(self):
        return '<User %s>' % self.user



class Friends(db.Model):
    __tablename__ = 'user_friends'
    user = db.Column(db.String(100), db.ForeignKey(User.username), primary_key=True)
    friend_name = db.Column(db.String(100), db.ForeignKey(User.username), primary_key=True)
    def __init__(self, user, friend_name):
        self.user = user
        self.friend_name = friend_name
    def __repr__(self):
        return '<User %s>' % self.user



class Request(db.Model):
    __tablename__ = 'friend_request'
    user = db.Column(db.String(100), db.ForeignKey(User.username), primary_key=True)
    friend_name = db.Column(db.String(100), db.ForeignKey(User.username), primary_key=True)    
    def __init__(self, user, friend_name):
        self.user = user
        self.friend_name = friend_name
    def __repr__(self):
        return '<User %s>' % self.user