import sys
import os.path

from werkzeug.serving import run_simple
from werkzeug.wsgi import DispatcherMiddleware

from geonres import app as geonres_app
from api import app as api_app
from users import app as users_app

cmd = sys.argv[1]
port = int(sys.argv[2])

users_app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__),
	'static/dp/')

if cmd == 'geonres':
	print 'running geonres'
	geonres_app.run(port=port)

elif cmd == 'api':
	api_app.run(port=port)

elif cmd is 'users':
	users_app.run(port=port)

else:
	app = DispatcherMiddleware(geonres_app, {
	    '/api': api_app,
	    '/users': users_app
	})
	run_simple('0.0.0.0', port, app, use_reloader=True, use_debugger=True)