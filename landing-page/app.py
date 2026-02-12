from flask import Flask, send_from_directory, send_file
import os

app = Flask(__name__, static_folder=".", static_url_path="")

PREFIX = "/omo"


@app.route("/")
@app.route(PREFIX)
@app.route(PREFIX + "/")
def index():
    return send_file("index.html")


@app.route("/<path:path>")
@app.route(PREFIX + "/<path:path>")
def serve_static(path):
    if path.startswith("omo/"):
        path = path[4:]
    if os.path.exists(path):
        return send_from_directory(".", path)
    return send_file("index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9000)
