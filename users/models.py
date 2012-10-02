from flask.ext.sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

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