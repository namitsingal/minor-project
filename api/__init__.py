from flask import Flask, Response

app = Flask(__name__)

# Configs

class api_response(Response):
    def __init__(self, *args, **kwargs):
        headers = []
        super(api_response, self).__init__(*args, **kwargs)
        self.content_type = 'application/json'
        self.mimetype = 'application/json'

app.debug = True;
app.response_class = api_response

from api.views import *
