from flask import request, session
from jinja2 import Template, Environment, FileSystemLoader

from geonres import app
from users.models import User

env = Environment(loader=FileSystemLoader('geonres/templates'))

@app.route('/')
def index():
	ctx = {'STATIC': '/static/'}

	if 'username' in session:
		user = User.query.filter_by(username=session['username']).first()
		ctx['user'] = user
		template = env.get_template('user_home.html')
	else:
		template = env.get_template('index.html')

	rendered = template.render(ctx)
	return rendered

@app.route('/geobrowse')
def geo_browse():
	template = env.get_template('geobrowse.html')
	ctx = {'STATIC': '/static/', 'geobrowse': True}
	rendered = template.render(ctx)
	return rendered