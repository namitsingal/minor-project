from flask import Flask
from werkzeug.serving import run_simple

from werkzeug.wsgi import DispatcherMiddleware

from geonres import app as geonres_app
from api import app as api_app

app = DispatcherMiddleware(geonres_app, {
    '/api': api_app
})
run_simple('localhost', 8080, app, use_reloader=True, use_debugger=True)