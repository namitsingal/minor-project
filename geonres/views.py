from jinja2 import Template, Environment, FileSystemLoader

from geonres import app

env = Environment(loader=FileSystemLoader('geonres/templates'))

@app.route('/')
def index():
    template = env.get_template('index.html')
    ctx = {'STATIC': '/static/'}
    rendered = template.render(ctx)
    return rendered