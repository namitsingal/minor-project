import json

from flask import request, Response, session,redirect, escape, url_for
from jinja2 import Template, Environment, FileSystemLoader

from users import app
from users.models import *

env = Environment(loader=FileSystemLoader(['users/templates', 'geonres/templates']))

@app.route('/login')
def index():
    ctx = {'STATIC': '/static/'}
    if 'username' in session:
	   return redirect('/')
    else:
        template = env.get_template('index.html')
        rendered = template.render(ctx)
        return rendered

@app.route('/')
def status():
    if 'username' in session:
        return 'Logged in as %s' % escape(session['username'])
    return 'You are not logged in'

@app.route('/login', methods=['POST'])
def login():
    error = None
    uname = request.form['username']
    password = request.form['password']
    k = User.query.filter_by(username=uname).first()
    if k:
        if k.check_password(password) == True:
	        session['username'] = uname
	        result = {'status': 'success', 'message': 'Logged in as %s.' % uname}
        else:
            result = {'status': 'error', 'message': 'You entered an incorrect password.'}
    else: 
       result = {'status': 'error', 'message': 'The user does not exist.'}

    if 'ajax' in request.args:
        return Response(json.dumps(result), mimetype='applications/json')
    else:
        ctx = {'STATIC': '/static/'}
        if result['status'] == 'success':
            return redirect('/')
        else:
            ctx['error'] = result['message']

        template = env.get_template('index.html')
        return template.render(ctx)


@app.route('/logout')
def logout():
    template = env.get_template('message.html')
    ctx = {'STATIC': '/static/'}
    if 'username' in session:
        session.pop('username', None)
        ctx['message'] = 'logged_out'
        return template.render(ctx)
    else:
        ctx['message'] = 'not_logged_in'
        return template.render(ctx)

@app.route('/register')
def registration_page():
    ctx = {'STATIC': '/static/'}
    template = env.get_template('register.html')
    rendered = template.render(ctx)
    return rendered

@app.route('/register',methods=['POST'])
def register_user():
    uname = request.form['username']
    password = request.form['passwords']
    email = request.form['email']

    k = User.query.filter_by(username=uname).first()
    if k:
        ctx = {'STATIC': '/static/', 'error': 'Username exists. Please pick another username'}
        template = env.get_template('register.html')
        return template.render(ctx)

    k = User.query.filter_by(email=email).first()
    if k:
        ctx = {'STATIC': '/static/', 'error': 'A user exists with the same email address. Please pick another email.'}
        template = env.get_template('register.html')
        return template.render(ctx)

    user = User(uname, password, email)
    db.session.add(user)
    db.session.commit()	
    session['username'] = uname
    return redirect('/')

app.secret_key='\xe6m\x897\xeec\x88\x9e\xc8\xdd\x99\xd2\xec\xf0\x0f\x88\x00\x00psb\x10'
