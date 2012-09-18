import sys
from flask import request
from jinja2 import Template,Environment,FileSystemLoader

sys.path.append('../')

from login import app,Login
app.debug = True;
#app.run(port=8080)

env = Environment(loader=FileSystemLoader('templates'))

@app.route('/')
def index():
    template = env.get_template('index.html')
    rendered=template.render()
    return rendered


@app.route('/login',methods=['POST','GET'])
def login():
    error = None
    uname=request.form['username']
    password=request.form['password']
    
    k=Login.query.filter_by(username=uname).first()
    
    if(k):
        if(k.username==uname and k.password==password):
	    return 'successfull login' 
	else:
	    return 'wrong password'
    else: 
	return 'username does not exist'
app.run(port=8080)
