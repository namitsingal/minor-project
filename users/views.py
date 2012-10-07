from flask import request, session,redirect, escape, url_for
from jinja2 import Template, Environment, FileSystemLoader

from users import app
from users.models import *

env = Environment(loader=FileSystemLoader('templates'))

@app.route('/login')
def index():
    if 'username' in session:
	   return redirect('/index')
    else:
        template = env.get_template('index.html')
        rendered = template.render()
        return rendered

@app.route('/')
def status():
    if 'username' in session:
        return 'Logged in as %s' % escape(session['username'])
    return 'You are not logged in'

@app.route('/login',methods=['POST','GET'])
def login():
        error = None
        uname = request.form['username']
        password = request.form['password']
        k = User.query.filter_by(username=uname).first()
        if k:
            if k.check_password(password) == True:
    	        session['username'] = uname
    	        return 'successfull login' 
            else:
    	        return redirect('/login');
        else: 
	    return 'Username does not exist'

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('status'))

@app.route('/register')
def registration_page():
    template = env.get_template('register.html')
    rendered = template.render()
    return rendered

@app.route('/register',methods=['POST'])
def register_user():
    uname = request.form['username']
    password = request.form['passwords']
    email = request.form['email']

    user = User(uname, password, email)
    db.session.add(user)
    db.session.commit();	
    session['username'] = uname
    return redirect(url_for('status'))

app.secret_key='\xe6m\x897\xeec\x88\x9e\xc8\xdd\x99\xd2\xec\xf0\x0f\x88\x00\x00psb\x10'
