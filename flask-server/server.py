from flask import Flask
import fastf1
app = Flask(__name__)

# Route
@app.route('/test')
def test():
    #session = fastf1.get_session(1995, 1)
    #session.event
    return {'test': "Message from Flask Backend"}

if __name__ == '__main__':
    app.run(port=8000,debug=True)