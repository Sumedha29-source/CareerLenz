from flask import Flask, request, jsonify
from flask_cors import CORS
from pypdf import PdfReader

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return jsonify({
        "message": "CareerLenz backend is running!"
    })


@app.route("/analyze", methods=["POST"])
def analyze_resume():

    if "resume" not in request.files:
        return jsonify({
            "error": "No resume uploaded"
        }), 400

    file = request.files["resume"]

    if file.filename == "":
        return jsonify({
            "error": "No file selected"
        }), 400

    try:
        reader = PdfReader(file)

        text = ""

        for page in reader.pages:
            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

        return jsonify({
            "message": "Resume analyzed successfully",
            "text": text
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)