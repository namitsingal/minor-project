from login import app
from flask import request


@app.route('/')
def index:
    return 'hello'

@app.route('/login',methods=['POST','GET'])
def login():
    error = None
    uname=request.form['username']
    password=request.form['password']

    k=login.query.filter_by(username=uname).first()
    
    if(k=='admin'):
        return 'successfull login' 
    else: 
	return 'unsuccessfull'
