from flask import session
from jinja2 import Template, Environment, FileSystemLoader

from geonres import app

env = Environment(loader=FileSystemLoader('geonres/templates'))

@app.route('/')
def index():
	if 'username' in session:
		template = env.get_template('user_home.html')
	else:
		template = env.get_template('index.html')

	ctx = {'STATIC': '/static/'}
	rendered = template.render(ctx)
	return rendered

@app.route('/geobrowse')
def geo_browse():
	template = env.get_template('geobrowse.html')
	ctx = {'STATIC': '/static/'}
	rendered = template.render(ctx)
	return rendered