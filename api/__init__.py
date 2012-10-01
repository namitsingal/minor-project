from flask import Flask, Response

from api.helpers import encode_xml, encode_json

app = Flask(__name__)

# Configs

class api_response(Response):
    def __init__(self, response_obj, format, *args, **kwargs):
        headers = []
        super(api_response, self).__init__(*args, **kwargs)

        if format == 'xml':
        	self.data = encode_xml(response_obj)
        	self.mimetype = 'text/xml'
    	else:
        	self.data = encode_json(response_obj)
        	self.mimetype = 'application/json'
        

app.debug = True;
#app.response_class = api_response

from api.views import *
