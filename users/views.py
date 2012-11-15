import json

from flask import request, Response, session,redirect, escape, url_for
from jinja2 import Template, Environment, FileSystemLoader

from users import app
from users.models import *
from sqlalchemy import distinct


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

@app.route('/check')
def checklogin():
    if 'username' in session:
        return 'true'
    else:
        return 'false'

@app.route('/register1',methods=['POST'])
def check_register():
    error = None
    uname = request.form['username']
    k = User.query.filter_by(username=uname).first()
    if k:
        result = {'status': 'error', 'message': 'User Already exists'}
    else:
        result = {'status': 'success', 'message': 'username available'}
    return Response(json.dumps(result), mimetype='applications/json');

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
    #if k:
    #    ctx = {'STATIC': '/static/', 'error': 'Username exists. Please pick another username'}
    #    template = env.get_template('register.html')
    #    return template.render(ctx)

    if k:
        result = {'status': 'error', 'message': 'User Already exists'}
    else:
        result = {'status': 'success', 'message': 'username available'}
    
        k = User.query.filter_by(email=email).first()
    #if k:
    #    ctx = {'STATIC': '/static/', 'error': 'A user exists with the same email address. Please pick another email.'}
    #    template = env.get_template('register.html')
    #    return template.render(ctx)

        if k:
            result = {'status': 'error', 'message': 'A user exists with the same email address.'}
        else:
            user = User(uname, password, email)
            db.session.add(user)
            db.session.commit()	
            session['username'] = uname
            return Response(json.dumps(result), mimetype='applications/json')
    return Response(json.dumps(result), mimetype='applications/json')


@app.route('/add_song' , methods=['POST'])
def add_song():
    user1 = session['username']
    name1 = request.form['name']
    song_id = request.form['song_id']
    thumb_url1 = request.form['thumb_url']
    title1 = request.form['title1']
    k = Playlist.query.filter_by(user=user1,name=name1,id=song_id,thumb_url=thumb_url1,title=title1).first()
    if(k):
        result = {'status': 'error', 'message': 'Song Already in Playlist'}
    else:
        playlist = Playlist(user1,name1.lower(),song_id,thumb_url1,title1)
        db.session.add(playlist)
        db.session.commit()
        result = {'status': 'success', 'message': 'song added'}
    return Response(json.dumps(result), mimetype='applications/json')

@app.route('/create_playlist' , methods=['POST'])
def create_playlist():
    user1 = session['username'].lower()
    name1 = request.form['name'].lower()
    k = Playlist.query.filter_by(user=user1,name=name1).first()
    if(k):
        result = {'status': 'error', 'message': 'Playlist Already exists'}
    else:
        playlist = Playlist(user1,name1.lower())
        db.session.add(playlist)
        db.session.commit()
        result = {'status': 'success', 'message': 'playlist created'}
    return Response(json.dumps(result), mimetype='applications/json')     

@app.route('/show_playlist')
def show_playlist():
    playlist = Playlist.query.filter_by(user=session['username']).distinct()
    n=[]
    play=[]
    for k in playlist:
        n.append(k.name)
    n=set(n)
    for lists in n:
        play.append({'playlist':lists})
    response_obj = {'player': play}
    return Response(json.dumps(response_obj),mimetype='json')


@app.route('/show_profile',methods=['POST'])
def show_profile():
    return request.form['name'];

@app.route('/show_profile')
def show_my_profile():
    return session['username'];

@app.route('/show_friends')
def show_friends():
    playlist = Friends.query.filter_by(user=session['username']).distinct()
    n=[]
    play=[]
    for k in playlist:
        n.append(k.friend_name)
    n=set(n)
    for lists in n:
        play.append({'playlist':lists})
    response_obj = {'player': play}
    return Response(json.dumps(response_obj),mimetype='json')



@app.route('/show_people',methods=['POST'])
def show_people():
    s=request.form['name'].lower()
    playlist = User.query.filter_by().all()
    n=[]
    play=[]
    for k in playlist:
        n.append(k.username)
    n=set(n)
    for lists in n:
        if(lists!=session['username'] and lists.startswith(s)):
            fr = Request.query.filter_by(user=session['username'],friend_name=lists).first()
            fr11 = Request.query.filter_by(user=lists,friend_name=session['username']).first()
            if fr:
                request1 = 1
            else:
                request1 = 0
            if(fr11):
                request1 = 1
            fr1 = Friends.query.filter_by(user=session['username'],friend_name=lists).first()
            if fr1:
                friend = 1
            else:
                friend = 0
            play.append({'playlist':lists,'request':request1,'friend':friend})
    response_obj = {'player': play}
    return Response(json.dumps(response_obj),mimetype='json')


@app.route('/show_requests')
def show_requests():
    playlist = Request.query.filter_by(user=session['username']).distinct()
    n=[]
    play=[]
    for k in playlist:
        n.append(k.friend_name)
    n=set(n)
    for lists in n:
        play.append({'playlist':lists})
    response_obj = {'player': play}
    return Response(json.dumps(response_obj),mimetype='json')



@app.route('/show_songs',methods=['POST'])
def show_songs():
    k=request.form['name'].lower()
    playlist = Playlist.query.filter_by(user=session['username'],name=k).distinct()
    play=[]
    for lists in playlist:
        if(lists.id!='default'):
            play.append({'id':lists.id,'thumb_url':lists.thumb_url,'title':lists.title})
            #play.append({'thumb_url':lists.thumb_url})
            #play.append({'title':lists.title})
    response_obj = {'player': play}
    return Response(json.dumps(response_obj),mimetype='json')    



@app.route('/add_as_friend',methods=['POST'])
def add_as_friend():
    k = request.form['name'].lower()
    v = session['username']
    #s = Request(k,v)
    ss = Request(k,v)
    #db.session.add(s)
    #db.session.commit()
    db.session.add(ss)
    db.session.commit()
    result = {'status': 'success', 'message': 'friend request sent'}
    return Response(json.dumps(result),mimetype='json')    


@app.route('/addfriend',methods=['POST'])
def addfriend():
    k = request.form['name'].lower()
    v = session['username']
    ss = Request.query.filter_by(user=v,friend_name=k).first()
    db.session.delete(ss)
    db.session.commit()
    kk = Friends(k,v)
    kk1 = Friends(v,k)
    db.session.add(kk)
    db.session.commit()
    db.session.add(kk1)
    db.session.commit()
    result = {'status': 'success', 'message': 'friend request rejected'}
    return Response(json.dumps(result),mimetype='json')    



@app.route('/rejectfriend',methods=['POST'])
def rejectfriend():
    k = request.form['name'].lower()
    v = session['username']
    ss = Request.query.filter_by(user=v,friend_name=k).first()
    db.session.delete(ss)
    db.session.commit()
    result = {'status': 'success', 'message': 'friend request rejected'}
    return Response(json.dumps(result),mimetype='json')    





app.secret_key='\xe6m\x897\xeec\x88\x9e\xc8\xdd\x99\xd2\xec\xf0\x0f\x88\x00\x00psb\x10'
