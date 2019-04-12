from flask import Flask, send_from_directory

app = Flask(__name__, static_url_path="")

@app.route("/static/<path:path>")
def serve_static(path):
    return send_from_directory("static", path)

@app.route("/")
def index():
    return send_from_directory("", "index.html")
    
if __name__ == "__main__":
    app.run()