import os
import re
import difflib

from flask import Flask, request, jsonify
from flask_cors import CORS
from pypdf import PdfReader
from pypdf.errors import PdfReadError


# ==========================================
# APP SETUP
# ==========================================

app = Flask(__name__)
CORS(app)

# Maximum resume size = 8 MB
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024

ALLOWED_EXTENSIONS = {".pdf"}


# ==========================================
# SKILL DATABASE
# ==========================================

SKILL_DATABASE = {
    "python": [],
    "java": [],
    "c": [],
    "c++": ["cpp"],

    "javascript": ["js"],
    "typescript": ["ts"],

    "html": [],
    "css": [],

    "react": [
        "react.js",
        "reactjs"
    ],

    "node.js": [
        "node",
        "nodejs"
    ],

    "express": [
        "express.js",
        "expressjs"
    ],

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

    "natural language processing": [
        "nlp"
    ],

    "computer vision": [
        "cv"
    ],

    "tensorflow": [],
    "pytorch": [],
    "keras": [],

    "scikit-learn": [
        "sklearn"
    ],

    "git": [],
    "github": [],

    "docker": [],

    "kubernetes": [
        "k8s"
    ],

    "aws": [
        "amazon web services"
    ],

    "azure": [],

    "google cloud": [
        "gcp"
    ],

    "rest api": [
        "rest apis",
        "restful api"
    ],

    "fastapi": [],

    "pandas": [],
    "numpy": [],
    "matplotlib": [],

    "tableau": [],

    "power bi": [
        "powerbi"
    ],

    "figma": [],

    "leadership": [],
    "communication": [],
    "problem solving": [],
}


# ==========================================
# BUILD SKILL REGEX PATTERNS
# ==========================================

def _build_skill_patterns():

    patterns = {}

    for canonical, aliases in SKILL_DATABASE.items():

        variants = [
            canonical,
            *aliases
        ]

        escaped = [
            re.escape(variant)
            for variant in variants
        ]

        pattern = (
            r"(?<![A-Za-z0-9+#])(?:"
            + "|".join(escaped)
            + r")(?![A-Za-z0-9+#])"
        )

        patterns[canonical] = re.compile(
            pattern,
            re.IGNORECASE
        )

    return patterns


SKILL_PATTERNS = _build_skill_patterns()


# ==========================================
# ROLE REQUIREMENTS
# ==========================================

ROLE_REQUIREMENTS = {

    "machine learning engineer": [
        "python",
        "machine learning",
        "deep learning",
        "pytorch",
        "tensorflow",
        "scikit-learn",
        "sql",
        "git",
    ],

    "data scientist": [
        "python",
        "machine learning",
        "statistics",
        "sql",
        "pandas",
        "numpy",
        "scikit-learn",
    ],

    "frontend developer": [
        "html",
        "css",
        "javascript",
        "react",
        "git",
        "rest api",
    ],

    "backend developer": [
        "python",
        "node.js",
        "sql",
        "mongodb",
        "rest api",
        "git",
    ],

    "full stack developer": [
        "html",
        "css",
        "javascript",
        "react",
        "node.js",
        "sql",
        "mongodb",
        "git",
    ],
}


DEFAULT_REQUIREMENTS = [
    "python",
    "sql",
    "git",
    "communication",
    "problem solving",
]


# ==========================================
# PRIORITY SKILLS
# ==========================================
#
# This helps CareerLenz decide which missing
# skill should be attacked FIRST.
#
# Earlier items have higher priority.
# ==========================================

ROLE_PRIORITY_SKILLS = {

    "machine learning engineer": [
        "python",
        "machine learning",
        "scikit-learn",
        "deep learning",
        "pytorch",
        "tensorflow",
        "sql",
        "git",
    ],

    "data scientist": [
        "python",
        "statistics",
        "sql",
        "pandas",
        "numpy",
        "machine learning",
        "scikit-learn",
    ],

    "frontend developer": [
        "html",
        "css",
        "javascript",
        "react",
        "rest api",
        "git",
    ],

    "backend developer": [
        "python",
        "rest api",
        "sql",
        "node.js",
        "mongodb",
        "git",
    ],

    "full stack developer": [
        "javascript",
        "react",
        "node.js",
        "rest api",
        "sql",
        "mongodb",
        "git",
        "html",
        "css",
    ],
}


# ==========================================
# LEARNING ROADMAP DATABASE
# ==========================================

ROADMAP_DATABASE = {

    "html": {
        "title": "HTML Fundamentals",

        "description":
            "Build a strong foundation in semantic HTML and accessible web structure.",

        "topics": [
            "Semantic HTML",
            "Forms and input elements",
            "Tables and lists",
            "Accessibility basics",
        ],

        "time": "3 days",

        "practice":
            "Build a responsive personal profile page.",
    },

    "css": {
        "title":
            "CSS & Responsive Design",

        "description":
            "Learn how to create polished and responsive interfaces.",

        "topics": [
            "CSS selectors",
            "Flexbox",
            "CSS Grid",
            "Responsive design",
        ],

        "time": "4 days",

        "practice":
            "Recreate a modern landing page using HTML and CSS.",
    },

    "javascript": {
        "title":
            "JavaScript Fundamentals",

        "description":
            "Strengthen your programming foundation for modern web development.",

        "topics": [
            "Variables and functions",
            "Arrays and objects",
            "DOM manipulation",
            "Async JavaScript",
        ],

        "time": "5 days",

        "practice":
            "Build an interactive expense tracker.",
    },

    "react": {
        "title":
            "React Development",

        "description":
            "Learn how to build modern component-based web applications.",

        "topics": [
            "Components",
            "Props and state",
            "Hooks",
            "Event handling",
            "React Router",
        ],

        "time": "7 days",

        "practice":
            "Build a job application tracking dashboard.",
    },

    "rest api": {
        "title":
            "REST API Integration",

        "description":
            "Learn how frontend applications communicate with backend services.",

        "topics": [
            "HTTP methods",
            "GET and POST requests",
            "JSON",
            "API integration",
            "Error handling",
        ],

        "time": "5 days",

        "practice":
            "Connect a React application to a public REST API.",
    },

    "typescript": {
        "title":
            "TypeScript",

        "description":
            "Add type safety and maintainability to JavaScript applications.",

        "topics": [
            "Basic types",
            "Interfaces",
            "Type aliases",
            "Generics",
        ],

        "time": "5 days",

        "practice":
            "Convert an existing React project from JavaScript to TypeScript.",
    },

    "python": {
        "title":
            "Python Programming",

        "description":
            "Build a strong programming foundation using Python.",

        "topics": [
            "Functions",
            "Data structures",
            "Object-oriented programming",
            "File handling",
            "Error handling",
        ],

        "time": "5 days",

        "practice":
            "Build a command-line productivity application.",
    },

    "machine learning": {
        "title":
            "Machine Learning Fundamentals",

        "description":
            "Understand the core concepts behind supervised and unsupervised learning.",

        "topics": [
            "Regression",
            "Classification",
            "Clustering",
            "Model evaluation",
            "Feature engineering",
        ],

        "time": "7 days",

        "practice":
            "Build a machine learning model and deploy a simple prediction interface.",
    },

    "deep learning": {
        "title":
            "Deep Learning",

        "description":
            "Learn neural networks and modern deep learning workflows.",

        "topics": [
            "Neural networks",
            "Backpropagation",
            "CNNs",
            "Training and validation",
            "Model optimization",
        ],

        "time": "10 days",

        "practice":
            "Build an image classification model.",
    },

    "pytorch": {
        "title":
            "PyTorch",

        "description":
            "Learn to implement and train deep learning models with PyTorch.",

        "topics": [
            "Tensors",
            "Datasets and DataLoaders",
            "Neural networks",
            "Training loops",
        ],

        "time": "7 days",

        "practice":
            "Train and evaluate a neural network using PyTorch.",
    },

    "tensorflow": {
        "title":
            "TensorFlow",

        "description":
            "Learn how to develop and train machine learning models with TensorFlow.",

        "topics": [
            "Tensors",
            "Keras",
            "Model building",
            "Training",
            "Evaluation",
        ],

        "time": "7 days",

        "practice":
            "Build a classification model using TensorFlow.",
    },

    "scikit-learn": {
        "title":
            "Scikit-learn",

        "description":
            "Learn the standard Python toolkit for practical machine learning.",

        "topics": [
            "Preprocessing",
            "Classification",
            "Regression",
            "Clustering",
            "Model evaluation",
        ],

        "time": "5 days",

        "practice":
            "Build an end-to-end ML prediction project.",
    },

    "sql": {
        "title":
            "SQL & Databases",

        "description":
            "Learn how to query, manipulate and analyze relational data.",

        "topics": [
            "SELECT queries",
            "Filtering and sorting",
            "JOINs",
            "GROUP BY",
            "Subqueries",
        ],

        "time": "5 days",

        "practice":
            "Build a database-backed analytics project.",
    },

    "mongodb": {
        "title":
            "MongoDB",

        "description":
            "Learn how to work with document-oriented NoSQL databases.",

        "topics": [
            "Documents and collections",
            "CRUD operations",
            "Queries",
            "Indexes",
        ],

        "time": "4 days",

        "practice":
            "Create a backend API using MongoDB.",
    },

    "node.js": {
        "title":
            "Node.js",

        "description":
            "Learn how to build server-side applications with Node.js.",

        "topics": [
            "Modules",
            "npm",
            "Async I/O",
            "Building an HTTP server",
            "Middleware",
        ],

        "time": "5 days",

        "practice":
            "Build a REST API server using Node.js and Express.",
    },

    "git": {
        "title":
            "Git & GitHub",

        "description":
            "Learn professional version-control workflows.",

        "topics": [
            "Commits",
            "Branches",
            "Merge and rebase",
            "Pull requests",
        ],

        "time": "2 days",

        "practice":
            "Collaborate on a project using Git branches and pull requests.",
    },

    "docker": {
        "title":
            "Docker",

        "description":
            "Learn how to package and run applications consistently.",

        "topics": [
            "Images",
            "Containers",
            "Dockerfiles",
            "Docker Compose",
        ],

        "time": "4 days",

        "practice":
            "Containerize a full-stack application.",
    },

    "aws": {
        "title":
            "AWS Fundamentals",

        "description":
            "Learn the fundamentals of deploying applications to the cloud.",

        "topics": [
            "EC2",
            "S3",
            "IAM",
            "Basic cloud architecture",
        ],

        "time": "5 days",

        "practice":
            "Deploy a web application to AWS.",
    },

    "statistics": {
        "title":
            "Statistics for Data Science",

        "description":
            "Build the statistical foundation needed for data analysis and machine learning.",

        "topics": [
            "Mean and variance",
            "Probability",
            "Distributions",
            "Hypothesis testing",
        ],

        "time": "6 days",

        "practice":
            "Analyze a real-world dataset and present statistical findings.",
    },

    "pandas": {
        "title":
            "Pandas",

        "description":
            "Learn to manipulate and analyze structured datasets with Python.",

        "topics": [
            "DataFrames",
            "Data cleaning",
            "Filtering",
            "Grouping",
            "Data transformation",
        ],

        "time": "4 days",

        "practice":
            "Perform exploratory data analysis on a real dataset.",
    },

    "numpy": {
        "title":
            "NumPy",

        "description":
            "Learn efficient numerical computing in Python.",

        "topics": [
            "Arrays",
            "Indexing",
            "Vectorized operations",
            "Matrix operations",
        ],

        "time": "3 days",

        "practice":
            "Implement basic numerical algorithms using NumPy.",
    },

    "figma": {
        "title":
            "Figma & UI Design",

        "description":
            "Learn the fundamentals of designing modern user interfaces.",

        "topics": [
            "Layouts",
            "Components",
            "Typography",
            "Design systems",
        ],

        "time": "3 days",

        "practice":
            "Design a complete dashboard in Figma.",
    },

    "communication": {
        "title":
            "Technical Communication",

        "description":
            "Improve your ability to explain technical ideas clearly.",

        "topics": [
            "Technical writing",
            "Presentations",
            "Explaining projects",
            "Interview communication",
        ],

        "time": "3 days",

        "practice":
            "Prepare and present a five-minute explanation of one technical project.",
    },

    "problem solving": {
        "title":
            "Problem Solving",

        "description":
            "Develop structured approaches to solving technical problems.",

        "topics": [
            "Problem decomposition",
            "Algorithms",
            "Complexity",
            "Debugging",
        ],

        "time": "5 days",

        "practice":
            "Solve a structured set of programming problems.",
    },
}


GENERIC_ROADMAP_TEMPLATE = {

    "title":
        "{skill} Fundamentals",

    "description":
        "Build working knowledge of {skill} for this role.",

    "topics": [
        "Core concepts",
        "Hands-on practice",
        "Common tools and workflows",
    ],

    "time":
        "5 days",

    "practice":
        "Complete a small project that applies {skill} end to end.",
}


# ==========================================
# PROJECT RECOMMENDATIONS
# ==========================================

PROJECT_RECOMMENDATIONS = {

    "frontend developer": {
        "title":
            "Job Application Tracker",

        "description":
            "Build a dashboard where users can track applications, interviews and job status.",

        "skills": [
            "HTML",
            "CSS",
            "JavaScript",
            "React",
            "REST API",
            "Git",
        ],
    },

    "backend developer": {
        "title":
            "Task Management API",

        "description":
            "Build a backend API for creating, updating and managing tasks.",

        "skills": [
            "Python",
            "REST API",
            "SQL",
            "MongoDB",
            "Git",
        ],
    },

    "full stack developer": {
        "title":
            "Full-Stack Job Portal",

        "description":
            "Build a complete job portal with authentication, search and application tracking.",

        "skills": [
            "React",
            "Node.js",
            "SQL",
            "MongoDB",
            "REST API",
            "Git",
        ],
    },

    "machine learning engineer": {
        "title":
            "End-to-End ML Prediction Platform",

        "description":
            "Build a machine learning application that trains a model and exposes predictions through an API.",

        "skills": [
            "Python",
            "Machine Learning",
            "Scikit-learn",
            "PyTorch",
            "REST API",
            "Git",
        ],
    },

    "data scientist": {
        "title":
            "Data Analytics & Prediction Dashboard",

        "description":
            "Analyze a real dataset, build predictive models and present insights through a dashboard.",

        "skills": [
            "Python",
            "Pandas",
            "NumPy",
            "SQL",
            "Machine Learning",
            "Statistics",
        ],
    },
}


DEFAULT_PROJECT = {
    "title":
        "CareerLenz Portfolio Project",

    "description":
        "Build a project that demonstrates your missing skills.",

    "skills": [],
}


# ==========================================
# HOME ROUTE
# ==========================================

@app.route("/")
def home():

    return jsonify({
        "message":
            "CareerLenz backend is running!"
    })


# ==========================================
# SKILL EXTRACTION
# ==========================================

def extract_skills(text):

    detected = [

        canonical

        for canonical, pattern
        in SKILL_PATTERNS.items()

        if pattern.search(text)
    ]

    return sorted(detected)


# ==========================================
# GET ROLE REQUIREMENTS
# ==========================================

def get_role_requirements(role):

    role_normalized = re.sub(
        r"\s+",
        " ",
        role.lower().strip()
    )

    if role_normalized in ROLE_REQUIREMENTS:

        return (
            ROLE_REQUIREMENTS[
                role_normalized
            ],
            role_normalized,
        )

    close = difflib.get_close_matches(
        role_normalized,
        ROLE_REQUIREMENTS.keys(),
        n=1,
        cutoff=0.72,
    )

    if close:

        matched_role = close[0]

        return (
            ROLE_REQUIREMENTS[
                matched_role
            ],
            matched_role,
        )

    return (
        DEFAULT_REQUIREMENTS,
        None,
    )


# ==========================================
# CALCULATE READINESS
# ==========================================

def calculate_readiness(
    detected_skills,
    required_skills
):

    if not required_skills:
        return 0

    detected_set = {
        skill.lower()
        for skill in detected_skills
    }

    matched = sum(

        1

        for skill
        in required_skills

        if skill.lower()
        in detected_set
    )

    return round(
        (
            matched /
            len(required_skills)
        )
        * 100
    )


# ==========================================
# BUILD ROADMAP
# ==========================================

def build_roadmap(
    missing_skills
):

    roadmap = []

    for index, skill in enumerate(
        missing_skills
    ):

        skill_key = skill.lower()

        item = ROADMAP_DATABASE.get(
            skill_key
        )

        if item is None:

            item = {

                key: (
                    value.format(
                        skill=skill
                    )
                    if isinstance(
                        value,
                        str
                    )
                    else value
                )

                for key, value
                in GENERIC_ROADMAP_TEMPLATE.items()
            }

        roadmap.append({

            "step":
                index + 1,

            "skill":
                skill,

            "title":
                item["title"],

            "description":
                item["description"],

            "topics":
                item["topics"],

            "time":
                item["time"],

            "practice":
                item["practice"],
        })

    return roadmap


# ==========================================
# PROJECT RECOMMENDATION
# ==========================================

def get_project_recommendation(
    role,
    matched_role
):

    if (
        matched_role
        and matched_role
        in PROJECT_RECOMMENDATIONS
    ):

        return PROJECT_RECOMMENDATIONS[
            matched_role
        ]

    return DEFAULT_PROJECT


# ==========================================
# CAREER INSIGHT ENGINE
# ==========================================

def get_priority_gap(
    missing_skills,
    matched_role
):

    if not missing_skills:
        return None

    missing_set = {
        skill.lower()
        for skill in missing_skills
    }

    if matched_role:

        priority_order = (
            ROLE_PRIORITY_SKILLS.get(
                matched_role,
                []
            )
        )

        for skill in priority_order:

            if skill.lower() in missing_set:
                return skill

    return missing_skills[0]


def build_strength_summary(
    matched_skills
):

    if not matched_skills:

        return (
            "Your resume does not yet show enough "
            "role-specific skills to identify a clear "
            "technical strength."
        )

    if len(matched_skills) == 1:

        return (
            f"Your strongest verified skill for this "
            f"career path is {matched_skills[0]}."
        )

    if len(matched_skills) == 2:

        return (
            f"Your strongest verified skills are "
            f"{matched_skills[0]} and "
            f"{matched_skills[1]}."
        )

    strongest = matched_skills[:3]

    return (
        "Your strongest role-aligned skills are "
        + ", ".join(strongest[:-1])
        + f" and {strongest[-1]}."
    )


def build_career_summary(
    target_role,
    readiness_score,
    matched_skills,
    missing_skills
):

    if readiness_score >= 85:

        level = (
            "Your resume shows a very strong "
            "technical match"
        )

    elif readiness_score >= 70:

        level = (
            "Your resume shows a strong foundation"
        )

    elif readiness_score >= 50:

        level = (
            "Your resume shows a developing foundation"
        )

    elif readiness_score >= 25:

        level = (
            "Your resume currently shows an early "
            "foundation"
        )

    else:

        level = (
            "Your resume currently has limited "
            "alignment"
        )

    if not missing_skills:

        return (
            f"{level} for the {target_role} role. "
            "You already demonstrate all of the "
            "core skills currently tracked by "
            "CareerLenz for this role."
        )

    top_gap = missing_skills[0]

    return (
        f"{level} for the {target_role} role. "
        f"You currently match {len(matched_skills)} "
        f"core skills, while {len(missing_skills)} "
        f"important skill areas still need attention. "
        f"Closing your {top_gap} gap would be a useful "
        f"next step."
    )


def build_improvement_advice(
    priority_gap,
    recommended_project,
    missing_skills
):

    if not missing_skills:

        return (
            "Your core tracked skills are already "
            "covered. Focus next on deeper projects, "
            "deployment, real-world experience and "
            "stronger evidence of impact on your resume."
        )

    project_title = (
        recommended_project.get(
            "title",
            "portfolio project"
        )
    )

    if priority_gap:

        return (
            f"Start with {priority_gap}. Complete its "
            f"learning path, then apply it in the "
            f"recommended project: {project_title}. "
            "After finishing the project, add the "
            "technology and measurable project outcomes "
            "to your resume."
        )

    return (
        f"Work through the missing skills one at a "
        f"time and apply them in the recommended "
        f"project: {project_title}."
    )


def calculate_estimated_impact(
    matched_skills,
    missing_skills,
    required_skills
):

    if not required_skills:

        return {
            "current_readiness": 0,
            "projected_readiness": 0,
            "potential_gain": 0,
            "message":
                "Not enough role data is available "
                "to estimate improvement.",
        }

    current_matches = len(
        matched_skills
    )

    current_score = round(
        (
            current_matches /
            len(required_skills)
        )
        * 100
    )

    # Estimate improvement after closing
    # up to the TWO highest-priority gaps.
    gaps_to_close = min(
        2,
        len(missing_skills)
    )

    projected_matches = min(
        len(required_skills),
        current_matches
        + gaps_to_close
    )

    projected_score = round(
        (
            projected_matches /
            len(required_skills)
        )
        * 100
    )

    potential_gain = max(
        0,
        projected_score
        - current_score
    )

    if gaps_to_close == 0:

        message = (
            "Your tracked role requirements are "
            "already fully matched."
        )

    elif gaps_to_close == 1:

        message = (
            f"Closing your next skill gap could "
            f"raise your tracked readiness from "
            f"{current_score}% to approximately "
            f"{projected_score}%."
        )

    else:

        message = (
            f"Closing your top two skill gaps could "
            f"raise your tracked readiness from "
            f"{current_score}% to approximately "
            f"{projected_score}%."
        )

    return {
        "current_readiness":
            current_score,

        "projected_readiness":
            projected_score,

        "potential_gain":
            potential_gain,

        "message":
            message,
    }


def build_career_insights(
    target_role,
    matched_role,
    matched_skills,
    missing_skills,
    required_skills,
    readiness_score,
    recommended_project
):

    priority_gap = get_priority_gap(
        missing_skills,
        matched_role
    )

    career_summary = (
        build_career_summary(
            target_role,
            readiness_score,
            matched_skills,
            missing_skills
        )
    )

    strength_summary = (
        build_strength_summary(
            matched_skills
        )
    )

    improvement_advice = (
        build_improvement_advice(
            priority_gap,
            recommended_project,
            missing_skills
        )
    )

    estimated_impact = (
        calculate_estimated_impact(
            matched_skills,
            missing_skills,
            required_skills
        )
    )

    if priority_gap:

        priority_info = (
            ROADMAP_DATABASE.get(
                priority_gap.lower()
            )
        )

        why_it_matters = (
            priority_info[
                "description"
            ]
            if priority_info
            else (
                f"{priority_gap} is one of the "
                f"required skills for the "
                f"{target_role} role."
            )
        )

        recommended_action = (
            priority_info[
                "practice"
            ]
            if priority_info
            else (
                f"Build a small project using "
                f"{priority_gap}."
            )
        )

    else:

        why_it_matters = (
            "Your tracked core role requirements "
            "are already covered."
        )

        recommended_action = (
            "Build a stronger production-level "
            "portfolio project and demonstrate "
            "real-world application of your skills."
        )

    return {

        "career_summary":
            career_summary,

        "highest_priority_gap":
            priority_gap,

        "strength_summary":
            strength_summary,

        "improvement_advice":
            improvement_advice,

        "why_priority_gap_matters":
            why_it_matters,

        "recommended_action":
            recommended_action,

        "estimated_impact":
            estimated_impact,
    }


# ==========================================
# HELPERS
# ==========================================

def _has_allowed_extension(
    filename
):

    _, ext = os.path.splitext(
        filename.lower()
    )

    return (
        ext
        in ALLOWED_EXTENSIONS
    )


# ==========================================
# ANALYZE RESUME
# ==========================================

@app.route(
    "/analyze",
    methods=["POST"]
)
def analyze_resume():

    # --------------------------------------
    # VALIDATE FILE
    # --------------------------------------

    if "resume" not in request.files:

        return jsonify({
            "error":
                "No resume uploaded"
        }), 400

    file = request.files[
        "resume"
    ]

    if file.filename == "":

        return jsonify({
            "error":
                "No file selected"
        }), 400

    if not _has_allowed_extension(
        file.filename
    ):

        return jsonify({
            "error":
                "Only PDF resumes are supported"
        }), 400

    target_role = request.form.get(
        "targetRole",
        "Machine Learning Engineer"
    )

    include_text = (
        request.form.get(
            "includeText",
            "false"
        ).lower()
        == "true"
    )

    # ======================================
    # READ PDF
    # ======================================

    try:

        reader = PdfReader(
            file
        )

    except PdfReadError:

        return jsonify({
            "error":
                "Could not read this PDF. "
                "It may be corrupted."
        }), 400

    if reader.is_encrypted:

        return jsonify({
            "error":
                "This PDF is password-protected. "
                "Please upload an unlocked copy."
        }), 400

    # ======================================
    # EXTRACT TEXT
    # ======================================

    try:

        pages_text = []

        for page in reader.pages:

            page_text = (
                page.extract_text()
            )

            if page_text:

                pages_text.append(
                    page_text
                )

        text = "\n".join(
            pages_text
        )

    except Exception:

        return jsonify({
            "error":
                "Failed to extract text from "
                "this PDF."
        }), 500

    if not text.strip():

        return jsonify({
            "error":
                "No readable text found in this PDF. "
                "It may be a scanned image without "
                "a text layer."
        }), 422

    # ======================================
    # DETECT SKILLS
    # ======================================

    detected_skills = extract_skills(
        text
    )

    # ======================================
    # ROLE REQUIREMENTS
    # ======================================

    (
        required_skills,
        matched_role
    ) = get_role_requirements(
        target_role
    )

    detected_set = {
        skill.lower()
        for skill
        in detected_skills
    }

    matched_skills = [

        skill

        for skill
        in required_skills

        if skill.lower()
        in detected_set
    ]

    missing_skills = [

        skill

        for skill
        in required_skills

        if skill.lower()
        not in detected_set
    ]

    # ======================================
    # READINESS
    # ======================================

    readiness_score = (
        calculate_readiness(
            detected_skills,
            required_skills
        )
    )

    # ======================================
    # ROADMAP
    # ======================================

    roadmap = build_roadmap(
        missing_skills
    )

    # ======================================
    # RECOMMENDED PROJECT
    # ======================================

    recommended_project = (
        get_project_recommendation(
            target_role,
            matched_role
        )
    )

    # ======================================
    # CAREER INTELLIGENCE
    # ======================================

    career_insights = (
        build_career_insights(
            target_role,
            matched_role,
            matched_skills,
            missing_skills,
            required_skills,
            readiness_score,
            recommended_project
        )
    )

    # ======================================
    # FINAL RESPONSE
    # ======================================

    response = {

        "message":
            "Resume analyzed successfully",

        "filename":
            file.filename,

        "target_role":
            target_role,

        "role_recognized":
            matched_role is not None,

        "detected_skills":
            detected_skills,

        "required_skills":
            required_skills,

        "matched_skills":
            matched_skills,

        "missing_skills":
            missing_skills,

        "readiness_score":
            readiness_score,

        "roadmap":
            roadmap,

        "recommended_project":
            recommended_project,

        # NEW INTELLIGENCE LAYER

        "career_insights":
            career_insights,

        "career_summary":
            career_insights[
                "career_summary"
            ],

        "highest_priority_gap":
            career_insights[
                "highest_priority_gap"
            ],

        "strength_summary":
            career_insights[
                "strength_summary"
            ],

        "improvement_advice":
            career_insights[
                "improvement_advice"
            ],

        "why_priority_gap_matters":
            career_insights[
                "why_priority_gap_matters"
            ],

        "recommended_action":
            career_insights[
                "recommended_action"
            ],

        "estimated_impact":
            career_insights[
                "estimated_impact"
            ],
    }

    # Only expose full resume text
    # when explicitly requested.

    if include_text:

        response["text"] = text

    return jsonify(
        response
    )


# ==========================================
# ERROR HANDLERS
# ==========================================

@app.errorhandler(413)
def file_too_large(
    _error
):

    return jsonify({
        "error":
            "File too large. "
            "Max upload size is 8MB."
    }), 413


@app.errorhandler(404)
def not_found(
    _error
):

    return jsonify({
        "error":
            "Not found"
    }), 404


# ==========================================
# RUN SERVER
# ==========================================

if __name__ == "__main__":

    debug_mode = (
        os.environ.get(
            "FLASK_DEBUG",
            "false"
        ).lower()
        == "true"
    )

    app.run(
        debug=debug_mode,
        port=5000
    )