from flask import Flask, request, send_from_directory
import json

app = Flask(__name__, static_url_path="")

@app.route("/")
def index():
    return send_from_directory("", "index.html")

@app.route("/static/<path:path>")
def serve_static(path):
    return send_from_directory("static", path)

@app.route("/save-data", methods = ["POST", ])
def save_data():
    print(request.is_json)
    content = request.get_json()
    print(content)
    return "OK"

if __name__ == "__main__":
    app.run()