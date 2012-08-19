from flask import Flask
app = Flask(__name__)

@app.route('/')
def index():
    return 'Welcome to Geonres'

if __name__ == '__main__':
    app.run()

