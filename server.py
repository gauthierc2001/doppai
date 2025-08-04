from flask import Flask, send_from_directory

app = Flask(__name__)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/public/<path:filename>')
def public_files(filename):
    return send_from_directory('public', filename)

if __name__ == '__main__':
    print("Starting DoppAI server...")
    print("Visit http://localhost:5000 to view your website")
    app.run(debug=True, host='0.0.0.0', port=5000) 