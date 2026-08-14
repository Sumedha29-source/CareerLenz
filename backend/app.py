import os
import re
import difflib

from flask import Flask, request, jsonify
from flask_cors import CORS
from pypdf import PdfReader
from pypdf.errors import PdfReadError

app = Flask(__name__)
CORS(app)

# Reject uploads bigger than 8MB before they ever hit disk/memory in full.
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024  # 8 MB

ALLOWED_EXTENSIONS = {".pdf"}


# ==========================================
# SKILL DATABASE
# ==========================================
# Canonical skill name -> list of aliases that should also count as a match.
# This replaces the old flat list + substring search, which let single-letter
# entries like "c" match almost any word containing that letter.

SKILL_DATABASE = {
    "python": [],
    "java": [],
    "c": [],
    "c++": ["cpp"],
    "javascript": ["js"],
    "typescript": ["ts"],
    "html": [],
    "css": [],

    "react": ["react.js", "reactjs"],
    "node.js": ["node", "nodejs"],
    "express": ["express.js", "expressjs"],
    "flask": [],
    "django": [],

    "sql": [],
    "mysql": [],
    "postgresql": ["postgres"],
    "mongodb": ["mongo"],

    "machine learning": ["ml"],
    "deep learning": ["dl"],
    "artificial intelligence": ["ai"],
    "data science": [],
    "data analysis": [],
    "statistics": [],
    "natural language processing": ["nlp"],
    "computer vision": ["cv"],

    "tensorflow": [],
    "pytorch": [],
    "keras": [],
    "scikit-learn": ["sklearn"],

    "git": [],
    "github": [],
    "docker": [],
    "kubernetes": ["k8s"],

    "aws": ["amazon web services"],
    "azure": [],
    "google cloud": ["gcp"],

    "rest api": ["rest apis", "restful api"],
    "fastapi": [],

    "pandas": [],
    "numpy": [],
    "matplotlib": [],

    "tableau": [],
    "power bi": ["powerbi"],

    "figma": [],
    "leadership": [],
    "communication": [],
    "problem solving": [],
}


def _build_skill_patterns():
    """
    Precompile one word-boundary regex per canonical skill (covering all its
    aliases). Word boundaries stop "c" from matching inside "science" and
    stop "node" from matching inside some unrelated word, while still
    allowing multi-word phrases like "machine learning" and symbol-bearing
    skills like "c++" / "node.js" to match correctly.
    """
    patterns = {}

    # Boundaries block letters/digits and "+"/"#" (so bare "c" doesn't also
    # match inside "C++" or "C#"), but deliberately let "." and "-" pass
    # through so symbol-bearing skills ("node.js", "scikit-learn") still
    # match right up against a sentence-ending period or comma.
    for canonical, aliases in SKILL_DATABASE.items():
        variants = [canonical] + aliases
        escaped = [re.escape(variant) for variant in variants]
        pattern = r"(?<![A-Za-z0-9+#])(?:" + "|".join(escaped) + r")(?![A-Za-z0-9+#])"
        patterns[canonical] = re.compile(pattern, re.IGNORECASE)

    return patterns


SKILL_PATTERNS = _build_skill_patterns()


# ==========================================
# ROLE REQUIREMENTS
# ==========================================

ROLE_REQUIREMENTS = {
    "machine learning engineer": [
        "python", "machine learning", "deep learning", "pytorch",
        "tensorflow", "scikit-learn", "sql", "git",
    ],
    "data scientist": [
        "python", "machine learning", "statistics", "sql", "pandas",
        "numpy", "scikit-learn",
    ],
    "frontend developer": [
        "html", "css", "javascript", "react", "git", "rest api",
    ],
    "backend developer": [
        "python", "node.js", "sql", "mongodb", "rest api", "git",
    ],
    "full stack developer": [
        "html", "css", "javascript", "react", "node.js", "sql", "mongodb", "git",
    ],
}

DEFAULT_REQUIREMENTS = ["python", "sql", "git", "communication", "problem solving"]


# ==========================================
# LEARNING ROADMAP DATABASE
# ==========================================
# Keyed by the exact canonical skill names used above/in SKILL_DATABASE so a
# missing required skill maps straight to its roadmap entry.

ROADMAP_DATABASE = {
    "html": {
        "title": "HTML Fundamentals",
        "description": "Build a strong foundation in semantic HTML and accessible web structure.",
        "topics": ["Semantic HTML", "Forms and input elements", "Tables and lists", "Accessibility basics"],
        "time": "3 days",
        "practice": "Build a responsive personal profile page.",
    },
    "css": {
        "title": "CSS & Responsive Design",
        "description": "Learn how to create polished and responsive interfaces.",
        "topics": ["CSS selectors", "Flexbox", "CSS Grid", "Responsive design"],
        "time": "4 days",
        "practice": "Recreate a modern landing page using HTML and CSS.",
    },
    "javascript": {
        "title": "JavaScript Fundamentals",
        "description": "Strengthen your programming foundation for modern web development.",
        "topics": ["Variables and functions", "Arrays and objects", "DOM manipulation", "Async JavaScript"],
        "time": "5 days",
        "practice": "Build an interactive expense tracker.",
    },
    "react": {
        "title": "React Development",
        "description": "Learn how to build modern component-based web applications.",
        "topics": ["Components", "Props and state", "Hooks", "Event handling", "React Router"],
        "time": "7 days",
        "practice": "Build a job application tracking dashboard.",
    },
    "rest api": {
        "title": "REST API Integration",
        "description": "Learn how frontend applications communicate with backend services.",
        "topics": ["HTTP methods", "GET and POST requests", "JSON", "API integration", "Error handling"],
        "time": "5 days",
        "practice": "Connect a React application to a public REST API.",
    },
    "typescript": {
        "title": "TypeScript",
        "description": "Add type safety and maintainability to JavaScript applications.",
        "topics": ["Basic types", "Interfaces", "Type aliases", "Generics"],
        "time": "5 days",
        "practice": "Convert an existing React project from JavaScript to TypeScript.",
    },
    "python": {
        "title": "Python Programming",
        "description": "Build a strong programming foundation using Python.",
        "topics": ["Functions", "Data structures", "Object-oriented programming", "File handling", "Error handling"],
        "time": "5 days",
        "practice": "Build a command-line productivity application.",
    },
    "machine learning": {
        "title": "Machine Learning Fundamentals",
        "description": "Understand the core concepts behind supervised and unsupervised learning.",
        "topics": ["Regression", "Classification", "Clustering", "Model evaluation", "Feature engineering"],
        "time": "7 days",
        "practice": "Build a machine learning model and deploy a simple prediction interface.",
    },
    "deep learning": {
        "title": "Deep Learning",
        "description": "Learn neural networks and modern deep learning workflows.",
        "topics": ["Neural networks", "Backpropagation", "CNNs", "Training and validation", "Model optimization"],
        "time": "10 days",
        "practice": "Build an image classification model.",
    },
    "pytorch": {
        "title": "PyTorch",
        "description": "Learn to implement and train deep learning models with PyTorch.",
        "topics": ["Tensors", "Datasets and DataLoaders", "Neural networks", "Training loops"],
        "time": "7 days",
        "practice": "Train and evaluate a neural network using PyTorch.",
    },
    "tensorflow": {
        "title": "TensorFlow",
        "description": "Learn how to develop and train machine learning models with TensorFlow.",
        "topics": ["Tensors", "Keras", "Model building", "Training", "Evaluation"],
        "time": "7 days",
        "practice": "Build a classification model using TensorFlow.",
    },
    "scikit-learn": {
        "title": "Scikit-learn",
        "description": "Learn the standard Python toolkit for practical machine learning.",
        "topics": ["Preprocessing", "Classification", "Regression", "Clustering", "Model evaluation"],
        "time": "5 days",
        "practice": "Build an end-to-end ML prediction project.",
    },
    "sql": {
        "title": "SQL & Databases",
        "description": "Learn how to query, manipulate and analyze relational data.",
        "topics": ["SELECT queries", "Filtering and sorting", "JOINs", "GROUP BY", "Subqueries"],
        "time": "5 days",
        "practice": "Build a database-backed analytics project.",
    },
    "mongodb": {
        "title": "MongoDB",
        "description": "Learn how to work with document-oriented NoSQL databases.",
        "topics": ["Documents and collections", "CRUD operations", "Queries", "Indexes"],
        "time": "4 days",
        "practice": "Create a backend API using MongoDB.",
    },
    "node.js": {
        "title": "Node.js",
        "description": "Learn how to build server-side applications with Node.js.",
        "topics": ["Modules", "npm", "Async I/O", "Building an HTTP server", "Middleware"],
        "time": "5 days",
        "practice": "Build a REST API server using Node.js and Express.",
    },
    "git": {
        "title": "Git & GitHub",
        "description": "Learn professional version-control workflows.",
        "topics": ["Commits", "Branches", "Merge and rebase", "Pull requests"],
        "time": "2 days",
        "practice": "Collaborate on a project using Git branches and pull requests.",
    },
    "docker": {
        "title": "Docker",
        "description": "Learn how to package and run applications consistently.",
        "topics": ["Images", "Containers", "Dockerfiles", "Docker Compose"],
        "time": "4 days",
        "practice": "Containerize a full-stack application.",
    },
    "aws": {
        "title": "AWS Fundamentals",
        "description": "Learn the fundamentals of deploying applications to the cloud.",
        "topics": ["EC2", "S3", "IAM", "Basic cloud architecture"],
        "time": "5 days",
        "practice": "Deploy a web application to AWS.",
    },
    "statistics": {
        "title": "Statistics for Data Science",
        "description": "Build the statistical foundation needed for data analysis and machine learning.",
        "topics": ["Mean and variance", "Probability", "Distributions", "Hypothesis testing"],
        "time": "6 days",
        "practice": "Analyze a real-world dataset and present statistical findings.",
    },
    "pandas": {
        "title": "Pandas",
        "description": "Learn to manipulate and analyze structured datasets with Python.",
        "topics": ["DataFrames", "Data cleaning", "Filtering", "Grouping", "Data transformation"],
        "time": "4 days",
        "practice": "Perform exploratory data analysis on a real dataset.",
    },
    "numpy": {
        "title": "NumPy",
        "description": "Learn efficient numerical computing in Python.",
        "topics": ["Arrays", "Indexing", "Vectorized operations", "Matrix operations"],
        "time": "3 days",
        "practice": "Implement basic numerical algorithms using NumPy.",
    },
    "figma": {
        "title": "Figma & UI Design",
        "description": "Learn the fundamentals of designing modern user interfaces.",
        "topics": ["Layouts", "Components", "Typography", "Design systems"],
        "time": "3 days",
        "practice": "Design a complete dashboard in Figma.",
    },
    "communication": {
        "title": "Technical Communication",
        "description": "Improve your ability to explain technical ideas clearly.",
        "topics": ["Technical writing", "Presentations", "Explaining projects", "Interview communication"],
        "time": "3 days",
        "practice": "Prepare and present a five-minute explanation of one technical project.",
    },
    "problem solving": {
        "title": "Problem Solving",
        "description": "Develop structured approaches to solving technical problems.",
        "topics": ["Problem decomposition", "Algorithms", "Complexity", "Debugging"],
        "time": "5 days",
        "practice": "Solve a structured set of programming problems.",
    },
}

# Used when a required skill has no dedicated roadmap entry, so a gap in
# ROADMAP_DATABASE never causes a skill to silently vanish from the plan.
GENERIC_ROADMAP_TEMPLATE = {
    "title": "{skill} Fundamentals",
    "description": "Build working knowledge of {skill} for this role.",
    "topics": ["Core concepts", "Hands-on practice", "Common tools and workflows"],
    "time": "5 days",
    "practice": "Complete a small project that applies {skill} end to end.",
}


# ==========================================
# PROJECT RECOMMENDATIONS
# ==========================================

PROJECT_RECOMMENDATIONS = {
    "frontend developer": {
        "title": "Job Application Tracker",
        "description": "Build a dashboard where users can track applications, interviews and job status.",
        "skills": ["HTML", "CSS", "JavaScript", "React", "REST API", "Git"],
    },
    "backend developer": {
        "title": "Task Management API",
        "description": "Build a backend API for creating, updating and managing tasks.",
        "skills": ["Python", "REST API", "SQL", "MongoDB", "Git"],
    },
    "full stack developer": {
        "title": "Full-Stack Job Portal",
        "description": "Build a complete job portal with authentication, search and application tracking.",
        "skills": ["React", "Node.js", "SQL", "MongoDB", "REST API", "Git"],
    },
    "machine learning engineer": {
        "title": "End-to-End ML Prediction Platform",
        "description": "Build a machine learning application that trains a model and exposes predictions through an API.",
        "skills": ["Python", "Machine Learning", "Scikit-learn", "PyTorch", "REST API", "Git"],
    },
    "data scientist": {
        "title": "Data Analytics & Prediction Dashboard",
        "description": "Analyze a real dataset, build predictive models and present insights through a dashboard.",
        "skills": ["Python", "Pandas", "NumPy", "SQL", "Machine Learning", "Statistics"],
    },
}

DEFAULT_PROJECT = {
    "title": "CareerLenz Portfolio Project",
    "description": "Build a project that demonstrates your missing skills.",
    "skills": [],
}


# ==========================================
# HOME ROUTE
# ==========================================

@app.route("/")
def home():
    return jsonify({"message": "CareerLenz backend is running!"})


# ==========================================
# SKILL EXTRACTION
# ==========================================

def extract_skills(text):
    """Return the sorted list of canonical skills found in the text."""
    detected = [
        canonical
        for canonical, pattern in SKILL_PATTERNS.items()
        if pattern.search(text)
    ]
    return sorted(detected)


# ==========================================
# GET ROLE REQUIREMENTS
# ==========================================

def get_role_requirements(role):
    """
    Resolve a free-typed role name to a known requirements list.
    Returns (requirements, matched_role_name_or_None).
    matched_role_name is None when we fell back to the generic defaults,
    so the caller/UI can be upfront about that instead of silently guessing.
    """
    role_normalized = re.sub(r"\s+", " ", role.lower().strip())

    if role_normalized in ROLE_REQUIREMENTS:
        return ROLE_REQUIREMENTS[role_normalized], role_normalized

    # Fuzzy match on typos ("mchine learning engineer") rather than a loose
    # substring check, which used to return whichever dict entry happened to
    # iterate first for any string containing e.g. "developer".
    close = difflib.get_close_matches(
        role_normalized, ROLE_REQUIREMENTS.keys(), n=1, cutoff=0.72
    )
    if close:
        return ROLE_REQUIREMENTS[close[0]], close[0]

    return DEFAULT_REQUIREMENTS, None


# ==========================================
# CALCULATE READINESS
# ==========================================

def calculate_readiness(detected_skills, required_skills):
    if not required_skills:
        return 0

    detected_set = {skill.lower() for skill in detected_skills}
    matched = sum(1 for skill in required_skills if skill.lower() in detected_set)

    return round((matched / len(required_skills)) * 100)


# ==========================================
# BUILD PERSONALIZED ROADMAP
# ==========================================

def build_roadmap(missing_skills):
    """
    Turn each missing skill into a learning-plan step. Skills without a
    dedicated ROADMAP_DATABASE entry still get a (generic) step rather than
    being silently dropped from the plan.
    """
    roadmap = []

    for index, skill in enumerate(missing_skills):
        skill_key = skill.lower()
        item = ROADMAP_DATABASE.get(skill_key)

        if item is None:
            item = {
                key: (value.format(skill=skill) if isinstance(value, str) else value)
                for key, value in GENERIC_ROADMAP_TEMPLATE.items()
            }

        roadmap.append({
            "step": index + 1,
            "skill": skill,
            "title": item["title"],
            "description": item["description"],
            "topics": item["topics"],
            "time": item["time"],
            "practice": item["practice"],
        })

    return roadmap


# ==========================================
# GET PROJECT RECOMMENDATION
# ==========================================

def get_project_recommendation(role, matched_role):
    """
    Reuse whatever role get_role_requirements already resolved (exact or
    fuzzy match) so the project suggestion always agrees with the skill
    requirements shown elsewhere in the response, instead of running its
    own separate (and previously substring-based) lookup that could pick a
    different role.
    """
    if matched_role and matched_role in PROJECT_RECOMMENDATIONS:
        return PROJECT_RECOMMENDATIONS[matched_role]

    return DEFAULT_PROJECT


# ==========================================
# HELPERS
# ==========================================

def _has_allowed_extension(filename):
    _, ext = os.path.splitext(filename.lower())
    return ext in ALLOWED_EXTENSIONS


# ==========================================
# ANALYZE RESUME
# ==========================================

@app.route("/analyze", methods=["POST"])
def analyze_resume():

    if "resume" not in request.files:
        return jsonify({"error": "No resume uploaded"}), 400

    file = request.files["resume"]

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not _has_allowed_extension(file.filename):
        return jsonify({"error": "Only PDF resumes are supported"}), 400

    target_role = request.form.get("targetRole", "Machine Learning Engineer")
    include_text = request.form.get("includeText", "false").lower() == "true"

    # ==================================
    # READ PDF
    # ==================================
    try:
        reader = PdfReader(file)
    except PdfReadError:
        return jsonify({"error": "Could not read this PDF. It may be corrupted."}), 400

    if reader.is_encrypted:
        return jsonify({"error": "This PDF is password-protected. Please upload an unlocked copy."}), 400

    try:
        pages_text = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                pages_text.append(page_text)
        text = "\n".join(pages_text)
    except Exception:
        return jsonify({"error": "Failed to extract text from this PDF."}), 500

    if not text.strip():
        return jsonify({
            "error": "No readable text found in this PDF. It may be a scanned image without a text layer."
        }), 422

    # ==================================
    # SKILLS + READINESS
    # ==================================
    detected_skills = extract_skills(text)
    required_skills, matched_role = get_role_requirements(target_role)

    detected_set = {skill.lower() for skill in detected_skills}
    matched_skills = [s for s in required_skills if s.lower() in detected_set]
    missing_skills = [s for s in required_skills if s.lower() not in detected_set]

    readiness_score = calculate_readiness(detected_skills, required_skills)
    roadmap = build_roadmap(missing_skills)
    recommended_project = get_project_recommendation(target_role, matched_role)

    response = {
        "message": "Resume analyzed successfully",
        "filename": file.filename,
        "target_role": target_role,
        "role_recognized": matched_role is not None,
        "detected_skills": detected_skills,
        "required_skills": required_skills,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "readiness_score": readiness_score,
        "roadmap": roadmap,
        "recommended_project": recommended_project,
    }

    if include_text:
        response["text"] = text

    return jsonify(response)


# ==========================================
# ERROR HANDLERS
# ==========================================

@app.errorhandler(413)
def file_too_large(_error):
    return jsonify({"error": "File too large. Max upload size is 8MB."}), 413


@app.errorhandler(404)
def not_found(_error):
    return jsonify({"error": "Not found"}), 404


# ==========================================
# RUN SERVER
# ==========================================

if __name__ == "__main__":
    debug_mode = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(debug=debug_mode, port=5000)