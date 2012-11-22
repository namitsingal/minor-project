import json

from flask import request, Response, session,redirect, escape, url_for
from jinja2 import Template, Environment, FileSystemLoader

from users import app
from users.models import *
from sqlalchemy import distinct
from werkzeug import secure_filename
import os

UPLOAD_FOLDER = '/home/namit/.repo/minor1/static/dp'
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif'])
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

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

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

@app.route('/save_profile',methods=['POST'])
def save_profile():
    file = request.files['photo']
    filename = 'unknown.jpg'
    if file and allowed_file(file.filename):
        filename=secure_filename(session['username'])+ '.'+ file.filename.rsplit('.', 1)[1]
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

    name = request.form['name']
    aboutme = request.form['aboutme']
    interest = request.form['interest']
    photo = '/static/dp/' + filename
    user1=session['username']
    k=UserProfile(user1, name, aboutme, photo, interest)
    s=UserProfile.query.filter_by(user=user1).first()
    if(s):
        db.session.delete(s)
        db.session.commit()
    db.session.add(k)
    db.session.commit()
    return redirect('/')

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
    profile = UserProfile.query.filter_by(user=session['username']).first()

    if profile != None:
        ctx['profile'] = profile

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

@app.route('/show_discussion')
def show_discussion():
    playlist = Discussion.query.filter_by(name='default').distinct()
    n=[]
    play=[]
    for k in playlist:
        n.append(k.genre)
    n=set(n)
    for lists in n:
        play.append({'playlist':lists})
    response_obj = {'player': play}
    return Response(json.dumps(response_obj),mimetype='json')

@app.route('/show_topics',methods=['POST'])
def show_topics():
    k=request.form['name'].lower()
    playlist = Discussion.query.filter_by(comment='default',genre=k).distinct()
    play=[]
    for lists in playlist:
        if(lists.user_name!='default'):
            play.append({'by':lists.user_name,'title':lists.name})
            #play.append({'thumb_url':lists.thumb_url})
            #play.append({'title':lists.title})
    response_obj = {'player': play}
    return Response(json.dumps(response_obj),mimetype='json')

@app.route('/create_topic',methods=['POST'])
def create_topic():
    k = request.form['name'].lower()
    user1 = session['username'].lower()
    k1 = request.form['play']
    k2 = Discussion.query.filter_by(genre=k1,name=k).first()
    if(k2):
        result = {'status': 'error', 'message': 'Playlist Already exists'}
    else:
        playlist = Discussion(k1,k,user1)
        db.session.add(playlist)
        db.session.commit()
        result = {'status': 'success', 'message': 'topic created'}
    return Response(json.dumps(result), mimetype='applications/json')

@app.route('/create_genre',methods=['POST'])
def create_genre():
    k1 = request.form['name'].lower()
    k2 = Discussion.query.filter_by(genre=k1).first()
    if(k2):
        result = {'status': 'error', 'message': 'Genre Already exists'}
    else:
        playlist = Discussion(k1)
        db.session.add(playlist)
        db.session.commit()
        result = {'status': 'success', 'message': 'Discussion created'}
    return Response(json.dumps(result), mimetype='applications/json')

@app.route('/show_topics1',methods=['POST'])
def show_topics1():
    k=request.form['name'].lower()
    k1 = request.form['play']

    k2 = Discussion.query.filter_by(genre=k1,name=k).order_by('date').all()
    play=[]
    for lists in k2:
        if(lists.comment!='default'):
            play.append({'by':lists.user_name,'title':lists.name,'comment':lists.comment})
            #play.append({'thumb_url':lists.thumb_url})
            #play.append({'title':lists.title})
    response_obj = {'player': play}
    return Response(json.dumps(response_obj),mimetype='json')

@app.route('/add_comment',methods=['POST'])
def add_comment():
    k=request.form['name'].lower()
    k1 = request.form['play']
    k2 = request.form['comment']
    user1 = session['username'].lower()
    comment = Discussion(k1,k,user1,k2)
    db.session.add(comment)
    db.session.commit()
    response_obj = {'user': {'name':user1}}
    return Response(json.dumps(response_obj),mimetype='json')    

@app.route('/show_profile')
def show_profile():
    ctx = {'STATIC': '/static/'}
    user1 = request.args['id'];
    tempp=0
    if 'username' in session:
        ctx['user'] = User.query.filter_by(username=session['username']).first()

    if user1 == None:
        user1 = session['username']
        tempp=2
        ctx['is_self'] = True
    elif len(user1) == 0:
        user1 = session['username']
        tempp=2
        ctx['is_self'] = True
    
    if(tempp!=2):
        ctx['user1']=user1
    
    ff=session['username']

    profile_user = User.query.filter_by(username=user1).first()
    profile = UserProfile.query.filter_by(user=user1).first()
    friends = Friends.query.filter_by(user=user1).distinct().all()

    """ for friend in friends:
        profile = UserProfile.query.filter_by(user=user1).first()

        if profile == None:
            name = friend.username
            picture = '/static/dp/unknown.jpg'

        elif profile.name == None:
            name = friend.username

        else:
            name = profile.name

        friends.append({'name': })
    """
    playlists = Playlist.query.filter_by(user=user1,id='default').distinct().all()
    if(user1!=ff):
        fr = Request.query.filter_by(user=session['username'],friend_name=user1).first()
        fr11 = Request.query.filter_by(user=user1,friend_name=session['username']).first()
        if fr:
            request1 = 1
        else:
            request1 = 0
        if(fr11):
            request1 = 1
        fr1 = Friends.query.filter_by(user=session['username'],friend_name=user1).first()
        if fr1:
            friend = 1
        else:
            friend = 0
        ctx['request'] = request1
        ctx['friend'] = friend
    ctx['friends'] = friends
    ctx['profile'] = profile
    ctx['profile_user'] = profile_user
    ctx['playlists'] = playlists
    
    template = env.get_template('profile.html')
    rendered = template.render(ctx)
    return rendered

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

@app.route('/show_songs1',methods=['POST'])
def show_songs1():
    k=request.form['name'].lower()
    user1=request.form['user1'].lower()
    playlist = Playlist.query.filter_by(user=user1,name=k).distinct()
    play=[]
    for lists in playlist:
        if(lists.id!='default'):
            play.append({'id':lists.id,'thumb_url':lists.thumb_url,'title':lists.title})
            #play.append({'thumb_url':lists.thumb_url})
            #play.append({'title':lists.title})
    response_obj = {'player': play}
    return Response(json.dumps(response_obj),mimetype='json')

@app.route('/show_songs1',methods=['POST'])
def show_songs1():
    k=request.form['name'].lower()
    user1=request.form['user1'].lower()
    playlist = Playlist.query.filter_by(user=user1,name=k).distinct()
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