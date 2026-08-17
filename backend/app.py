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
# LEARNING RESOURCES
# ==========================================
#
# Free/reputable references that CareerLenz
# attaches to missing skills.
# ==========================================

LEARNING_RESOURCES = {
    "html": [
        {
            "title": "Structuring Content with HTML",
            "provider": "MDN Web Docs",
            "type": "Free Learning Module",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content",
        },
        {
            "title": "MDN Web Development Core",
            "provider": "MDN Web Docs",
            "type": "Practice & Reference",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core",
        },
    ],

    "css": [
        {
            "title": "CSS Styling Basics",
            "provider": "MDN Web Docs",
            "type": "Free Learning Module",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics",
        },
        {
            "title": "Getting Started with CSS",
            "provider": "MDN Web Docs",
            "type": "Guided Tutorial",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Getting_started",
        },
    ],

    "javascript": [
        {
            "title": "Dynamic Scripting with JavaScript",
            "provider": "MDN Web Docs",
            "type": "Free Learning Module",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting",
        },
        {
            "title": "JavaScript Guide",
            "provider": "MDN Web Docs",
            "type": "Reference",
            "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
        },
    ],

    "react": [
        {
            "title": "React Quick Start",
            "provider": "React",
            "type": "Official Tutorial",
            "url": "https://react.dev/learn",
        },
        {
            "title": "Thinking in React",
            "provider": "React",
            "type": "Practice Guide",
            "url": "https://react.dev/learn/thinking-in-react",
        },
    ],

    "rest api": [
        {
            "title": "HTTP Overview",
            "provider": "MDN Web Docs",
            "type": "Official Reference",
            "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP",
        },
        {
            "title": "Using the Fetch API",
            "provider": "MDN Web Docs",
            "type": "Hands-on Guide",
            "url": "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch",
        },
    ],

    "python": [
        {
            "title": "The Python Tutorial",
            "provider": "Python",
            "type": "Official Tutorial",
            "url": "https://docs.python.org/3/tutorial/",
        },
        {
            "title": "Python Standard Library",
            "provider": "Python",
            "type": "Reference",
            "url": "https://docs.python.org/3/library/",
        },
    ],

    "machine learning": [
        {
            "title": "Machine Learning Crash Course",
            "provider": "Google for Developers",
            "type": "Free Course",
            "url": "https://developers.google.com/machine-learning/crash-course",
        },
        {
            "title": "Rules of Machine Learning",
            "provider": "Google for Developers",
            "type": "Reference",
            "url": "https://developers.google.com/machine-learning/guides/rules-of-ml",
        },
    ],

    "deep learning": [
        {
            "title": "TensorFlow Tutorials",
            "provider": "TensorFlow",
            "type": "Official Tutorials",
            "url": "https://www.tensorflow.org/tutorials",
        },
        {
            "title": "PyTorch Learn the Basics",
            "provider": "PyTorch",
            "type": "Official Tutorial",
            "url": "https://docs.pytorch.org/tutorials/beginner/basics/intro.html",
        },
    ],

    "pytorch": [
        {
            "title": "Learn the Basics",
            "provider": "PyTorch",
            "type": "Official Tutorial",
            "url": "https://docs.pytorch.org/tutorials/beginner/basics/intro.html",
        },
        {
            "title": "PyTorch Tutorials",
            "provider": "PyTorch",
            "type": "Practice Library",
            "url": "https://docs.pytorch.org/tutorials/",
        },
    ],

    "tensorflow": [
        {
            "title": "TensorFlow Tutorials",
            "provider": "TensorFlow",
            "type": "Official Tutorials",
            "url": "https://www.tensorflow.org/tutorials",
        },
        {
            "title": "TensorFlow Quickstart for Beginners",
            "provider": "TensorFlow",
            "type": "Guided Tutorial",
            "url": "https://www.tensorflow.org/tutorials/quickstart/beginner",
        },
    ],

    "scikit-learn": [
        {
            "title": "Getting Started with scikit-learn",
            "provider": "scikit-learn",
            "type": "Official Guide",
            "url": "https://scikit-learn.org/stable/getting_started.html",
        },
        {
            "title": "scikit-learn User Guide",
            "provider": "scikit-learn",
            "type": "Reference",
            "url": "https://scikit-learn.org/stable/user_guide.html",
        },
    ],

    "sql": [
        {
            "title": "PostgreSQL SQL Tutorial",
            "provider": "PostgreSQL",
            "type": "Official Tutorial",
            "url": "https://www.postgresql.org/docs/current/tutorial-sql.html",
        },
        {
            "title": "PostgreSQL Tutorial",
            "provider": "PostgreSQL",
            "type": "Official Learning Guide",
            "url": "https://www.postgresql.org/docs/current/tutorial.html",
        },
    ],

    "mongodb": [
        {
            "title": "MongoDB Getting Started",
            "provider": "MongoDB",
            "type": "Official Tutorial",
            "url": "https://www.mongodb.com/docs/manual/tutorial/getting-started/",
        },
        {
            "title": "MongoDB CRUD Operations",
            "provider": "MongoDB",
            "type": "Practice Reference",
            "url": "https://www.mongodb.com/docs/manual/crud/",
        },
    ],

    "node.js": [
        {
            "title": "Introduction to Node.js",
            "provider": "Node.js",
            "type": "Official Tutorial",
            "url": "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs",
        },
        {
            "title": "Node.js Learn",
            "provider": "Node.js",
            "type": "Learning Path",
            "url": "https://nodejs.org/en/learn",
        },
    ],

    "git": [
        {
            "title": "Pro Git Book",
            "provider": "Git",
            "type": "Free Official Book",
            "url": "https://git-scm.com/book/en/v2",
        },
        {
            "title": "Git Reference",
            "provider": "Git",
            "type": "Official Reference",
            "url": "https://git-scm.com/docs",
        },
    ],

    "docker": [
        {
            "title": "Docker Get Started",
            "provider": "Docker",
            "type": "Official Tutorial",
            "url": "https://docs.docker.com/get-started/",
        },
        {
            "title": "Docker Workshop",
            "provider": "Docker",
            "type": "Hands-on Tutorial",
            "url": "https://docs.docker.com/get-started/workshop/",
        },
    ],

    "aws": [
        {
            "title": "AWS Getting Started",
            "provider": "AWS",
            "type": "Official Learning Hub",
            "url": "https://aws.amazon.com/getting-started/",
        },
        {
            "title": "AWS Skill Builder",
            "provider": "AWS",
            "type": "Training Platform",
            "url": "https://skillbuilder.aws/",
        },
    ],

    "statistics": [
        {
            "title": "Statistics & Probability Prerequisites",
            "provider": "Google for Developers",
            "type": "ML Prerequisite",
            "url": "https://developers.google.com/machine-learning/crash-course/prereqs-and-prework",
        },
    ],

    "pandas": [
        {
            "title": "Getting Started Tutorials",
            "provider": "pandas",
            "type": "Official Tutorials",
            "url": "https://pandas.pydata.org/docs/getting_started/intro_tutorials/index.html",
        },
        {
            "title": "pandas User Guide",
            "provider": "pandas",
            "type": "Reference",
            "url": "https://pandas.pydata.org/docs/user_guide/index.html",
        },
    ],

    "numpy": [
        {
            "title": "NumPy Quickstart",
            "provider": "NumPy",
            "type": "Official Tutorial",
            "url": "https://numpy.org/doc/stable/user/quickstart.html",
        },
        {
            "title": "NumPy Learn",
            "provider": "NumPy",
            "type": "Learning Resources",
            "url": "https://numpy.org/learn/",
        },
    ],

    "figma": [
        {
            "title": "Figma Learn",
            "provider": "Figma",
            "type": "Official Learning Hub",
            "url": "https://help.figma.com/hc/en-us/categories/360002051613-Get-started",
        },
    ],

    "communication": [
        {
            "title": "Technical Writing Courses",
            "provider": "Google for Developers",
            "type": "Free Course",
            "url": "https://developers.google.com/tech-writing",
        },
    ],

    "problem solving": [
        {
            "title": "Python Data Structures",
            "provider": "Python",
            "type": "Reference Foundation",
            "url": "https://docs.python.org/3/tutorial/datastructures.html",
        },
    ],
}


def get_learning_resources(skill):
    return LEARNING_RESOURCES.get(
        skill.lower(),
        []
    )


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

            "resources":
                get_learning_resources(
                    skill
                ),
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
# 30-DAY ACTION PLAN
# ==========================================

def _chunk_list(items, size):
    return [
        items[index:index + size]
        for index in range(0, len(items), size)
    ]


def _resource_titles(resources, limit=2):
    return [
        resource.get("title")
        for resource in resources[:limit]
        if resource.get("title")
    ]


def build_30_day_action_plan(
    target_role,
    missing_skills,
    roadmap,
    recommended_project,
    resume_feedback
):
    roadmap_by_skill = {
        (item.get("skill") or "").lower(): item
        for item in roadmap
    }

    prioritized = [
        skill
        for skill in missing_skills
        if skill
    ]

    skill_groups = _chunk_list(
        prioritized[:4],
        2
    )

    while len(skill_groups) < 2:
        skill_groups.append([])

    week_1_skills = skill_groups[0]
    week_2_skills = skill_groups[1]

    def learning_tasks(skills):
        tasks = []

        for skill in skills:
            item = roadmap_by_skill.get(
                skill.lower(),
                {}
            )

            topics = (
                item.get("topics")
                or []
            )

            resources = (
                item.get("resources")
                or []
            )

            resource_titles = (
                _resource_titles(
                    resources
                )
            )

            if resource_titles:
                tasks.append(
                    f"Study {skill} using "
                    + " and ".join(
                        resource_titles
                    )
                    + "."
                )
            else:
                tasks.append(
                    f"Learn the fundamentals of {skill}."
                )

            if topics:
                tasks.append(
                    f"Practice: "
                    + ", ".join(
                        topics[:3]
                    )
                    + "."
                )

            practice = (
                item.get("practice")
            )

            if practice:
                tasks.append(
                    f"Mini project: {practice}"
                )

        return tasks[:6]

    week_1_tasks = learning_tasks(
        week_1_skills
    )

    week_2_tasks = learning_tasks(
        week_2_skills
    )

    if not week_1_tasks:
        week_1_tasks = [
            "Review your strongest role-aligned skills.",
            "Improve one existing project so it shows stronger technical depth.",
            "Document what you learned in your GitHub README.",
        ]

    if not week_2_tasks:
        week_2_tasks = [
            "Strengthen an existing project with one production-level feature.",
            "Add testing, error handling or deployment evidence where relevant.",
            "Update your project documentation and screenshots.",
        ]

    project_title = (
        recommended_project.get(
            "title"
        )
        or "role-relevant portfolio project"
    )

    project_description = (
        recommended_project.get(
            "description"
        )
        or (
            "Build a project that proves "
            "your missing skills."
        )
    )

    project_skills = (
        recommended_project.get(
            "skills"
        )
        or []
    )

    week_3_tasks = [
        f"Build the recommended project: {project_title}.",
        project_description,
    ]

    if project_skills:
        week_3_tasks.append(
            "Use these skills in the build: "
            + ", ".join(
                project_skills[:6]
            )
            + "."
        )

    week_3_tasks.extend([
        "Commit progress regularly to GitHub.",
        "Write a clear README with setup steps, features and screenshots.",
        "Test the main user flow before deployment.",
    ])

    week_4_tasks = [
        "Deploy your strongest project or prepare a reliable live demo.",
        "Update GitHub with a polished README and final screenshots.",
        f"Tailor your resume toward {target_role}.",
        "Add measurable outcomes only where you can support them truthfully.",
        "Practice a 60-90 second explanation of your project and career gap strategy.",
    ]

    if resume_feedback:
        week_4_tasks.insert(
            3,
            resume_feedback[0]
        )

    return {
        "title":
            "30-Day Career Action Plan",

        "target_role":
            target_role,

        "duration_days":
            30,

        "weeks": [
            {
                "week": 1,
                "title":
                    "Close your highest-priority gaps",
                "focus_skills":
                    week_1_skills,
                "tasks":
                    week_1_tasks,
            },
            {
                "week": 2,
                "title":
                    "Strengthen the next skill layer",
                "focus_skills":
                    week_2_skills,
                "tasks":
                    week_2_tasks,
            },
            {
                "week": 3,
                "title":
                    "Build proof through a project",
                "focus_skills":
                    project_skills,
                "tasks":
                    week_3_tasks[:6],
            },
            {
                "week": 4,
                "title":
                    "Package, deploy and present",
                "focus_skills":
                    [],
                "tasks":
                    week_4_tasks[:6],
            },
        ],
    }



# ==========================================
# RESUME BULLET IMPROVER
# ==========================================

WEAK_BULLET_PREFIXES = [
    "worked on",
    "helped",
    "responsible for",
    "made",
    "created",
    "developed",
    "built",
    "implemented",
    "designed",
    "worked with",
    "used",
]


def _clean_resume_line(line):
    cleaned = re.sub(
        r"^[\s•●▪◦*-]+",
        "",
        line.strip()
    )

    cleaned = re.sub(
        r"\s+",
        " ",
        cleaned
    )

    return cleaned.strip()


def _looks_like_resume_bullet(line):
    if not line:
        return False

    if len(line) < 18 or len(line) > 220:
        return False

    lowered = line.lower()

    if re.search(
        r"^[A-Z][A-Z\s&/-]{3,}$",
        line
    ):
        return False

    if lowered.startswith(
        (
            "http://",
            "https://",
            "www.",
            "linkedin",
            "github"
        )
    ):
        return False

    has_action_verb = any(
        re.search(
            r"\b"
            + re.escape(verb)
            + r"\b",
            lowered
        )
        for verb in ACTION_VERBS
    )

    has_weak_prefix = any(
        lowered.startswith(prefix)
        for prefix in WEAK_BULLET_PREFIXES
    )

    has_tech = any(
        pattern.search(line)
        for pattern
        in SKILL_PATTERNS.values()
    )

    return (
        has_action_verb
        or has_weak_prefix
        or has_tech
    )


def _extract_candidate_bullets(text):
    candidates = []

    for raw_line in text.splitlines():

        line = _clean_resume_line(
            raw_line
        )

        if not _looks_like_resume_bullet(
            line
        ):
            continue

        if line not in candidates:
            candidates.append(
                line
            )

    return candidates[:12]


def _detect_skills_in_line(line):
    found = []

    for canonical, pattern in (
        SKILL_PATTERNS.items()
    ):

        if pattern.search(line):
            found.append(
                canonical
            )

    return found[:4]


def _contains_quantified_impact(line):
    return bool(
        count_impact_signals(
            line
        )
    )


def _bullet_reason(
    original,
    detected_line_skills
):
    reasons = []

    lowered = original.lower()

    if any(
        lowered.startswith(prefix)
        for prefix in [
            "worked on",
            "helped",
            "responsible for",
            "worked with",
            "used",
        ]
    ):
        reasons.append(
            "Starts with weak or passive wording"
        )

    if not _contains_quantified_impact(
        original
    ):
        reasons.append(
            "No measurable outcome is visible"
        )

    if not detected_line_skills:
        reasons.append(
            "Technical contribution is not explicit"
        )

    if len(original.split()) < 9:
        reasons.append(
            "The bullet lacks enough context"
        )

    if not reasons:
        reasons.append(
            "The bullet can communicate impact more clearly"
        )

    return "; ".join(
        reasons[:3]
    ) + "."


def _build_truth_preserving_template(
    original,
    detected_line_skills,
    target_role
):
    skill_text = (
        ", ".join(
            skill.title()
            for skill in detected_line_skills
        )
        if detected_line_skills
        else "[technology / tools used]"
    )

    lowered = original.lower()

    if (
        "machine learning" in lowered
        or "model" in lowered
        or "prediction" in lowered
    ):
        return (
            "Built [model/application] using "
            f"{skill_text} to [solve the problem], "
            "evaluated with [metric/test method], and "
            "documented [real result or improvement]."
        )

    if (
        "api" in lowered
        or "backend" in lowered
        or "flask" in lowered
        or "node" in lowered
        or "django" in lowered
    ):
        return (
            "Developed [backend/API feature] using "
            f"{skill_text} to [support user/business need], "
            "handling [real scale or workflow] and "
            "validated through [tests/performance/result]."
        )

    if (
        "react" in lowered
        or "frontend" in lowered
        or "website" in lowered
        or "web app" in lowered
        or "dashboard" in lowered
    ):
        return (
            "Built [frontend feature/application] using "
            f"{skill_text} to [improve user workflow], "
            "implementing [key feature] and measuring "
            "[real usability/performance/result if available]."
        )

    if (
        "sql" in lowered
        or "database" in lowered
        or "mongodb" in lowered
    ):
        return (
            "Implemented [database/data feature] using "
            f"{skill_text} to [support application need], "
            "improving [real query/workflow/result] through "
            "[schema/query/indexing approach]."
        )

    return (
        "Delivered [feature/project contribution] using "
        f"{skill_text} for the {target_role} path, "
        "solving [specific problem] and demonstrating "
        "[real outcome, scale, test result, or user impact]."
    )


def build_resume_bullet_improvements(
    text,
    target_role
):
    candidates = (
        _extract_candidate_bullets(
            text
        )
    )

    improvements = []

    for original in candidates:

        line_skills = (
            _detect_skills_in_line(
                original
            )
        )

        reason = _bullet_reason(
            original,
            line_skills
        )

        suggestion = (
            _build_truth_preserving_template(
                original,
                line_skills,
                target_role
            )
        )

        improvements.append({
            "original":
                original,

            "suggestion":
                suggestion,

            "reason":
                reason,

            "skills_detected":
                line_skills,

            "has_measurable_impact":
                _contains_quantified_impact(
                    original
                ),

            "warning":
                (
                    "Replace placeholders only with facts "
                    "you can truthfully support. Do not "
                    "invent metrics, users, percentages, "
                    "revenue, accuracy, or outcomes."
                ),
        })

        if len(improvements) >= 4:
            break

    if not improvements:
        improvements.append({
            "original":
                "No strong project or experience bullet was confidently detected.",

            "suggestion":
                (
                    "Use this structure: Built [feature/project] "
                    "using [technology] to [solve problem], "
                    "then add [real metric/test/result] only "
                    "if you actually measured it."
                ),

            "reason":
                (
                    "CareerLenz could not confidently isolate "
                    "a bullet suitable for rewriting."
                ),

            "skills_detected":
                [],

            "has_measurable_impact":
                False,

            "warning":
                (
                    "Use the template as a guide and keep "
                    "every claim factually accurate."
                ),
        })

    return improvements


# ==========================================
# RESUME QUALITY ANALYSIS
# ==========================================

SECTION_KEYWORDS = {
    "projects": [
        "project",
        "projects",
        "personal projects",
        "academic projects",
    ],
    "experience": [
        "experience",
        "work experience",
        "internship",
        "internships",
        "employment",
        "professional experience",
    ],
    "education": [
        "education",
        "academic background",
        "academics",
    ],
    "achievements": [
        "achievement",
        "achievements",
        "awards",
        "honors",
        "accomplishments",
    ],
    "certifications": [
        "certification",
        "certifications",
        "certificate",
        "certificates",
    ],
}

IMPACT_PATTERNS = [
    re.compile(r"\b\d+(?:\.\d+)?\s*%\b"),
    re.compile(r"\b\d+(?:\.\d+)?\s*[xX]\b"),
    re.compile(r"\b\d+\+\s*(?:users?|projects?|clients?|requests?|records?|students?|customers?|downloads?|views?|tasks?|models?|features?)\b", re.IGNORECASE),
    re.compile(r"[₹$€£]\s?\d[\d,]*(?:\.\d+)?"),
    re.compile(r"\b(?:reduced|increased|improved|boosted|grew|saved|cut|decreased|optimized|accelerated)\b.{0,45}\b\d+(?:\.\d+)?\s*%\b", re.IGNORECASE),
]

ACTION_VERBS = [
    "built",
    "developed",
    "created",
    "implemented",
    "designed",
    "deployed",
    "optimized",
    "trained",
    "integrated",
    "automated",
    "engineered",
    "analyzed",
    "improved",
    "managed",
    "led",
    "delivered",
]

CONTACT_PATTERNS = {
    "email": re.compile(
        r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b",
        re.IGNORECASE,
    ),
    "phone": re.compile(
        r"(?<!\d)(?:\+?\d{1,3}[\s\-]?)?(?:\(?\d{2,5}\)?[\s\-]?)?\d{5,10}(?!\d)"
    ),
    "linkedin": re.compile(
        r"(?:linkedin\.com|linkedin\b)",
        re.IGNORECASE,
    ),
    "github": re.compile(
        r"(?:github\.com|github\b)",
        re.IGNORECASE,
    ),
}


def _normalize_resume_text(text):
    return re.sub(
        r"\s+",
        " ",
        text.lower()
    ).strip()


def _contains_any_keyword(
    normalized_text,
    keywords
):
    return any(
        re.search(
            r"(?<![a-z0-9])"
            + re.escape(keyword.lower())
            + r"(?![a-z0-9])",
            normalized_text
        )
        for keyword in keywords
    )


def detect_resume_sections(text):
    normalized = _normalize_resume_text(text)

    found = {
        section: _contains_any_keyword(
            normalized,
            keywords
        )
        for section, keywords
        in SECTION_KEYWORDS.items()
    }

    found["skills"] = _contains_any_keyword(
        normalized,
        [
            "skills",
            "technical skills",
            "technologies",
            "tech stack",
        ]
    )

    found["summary"] = _contains_any_keyword(
        normalized,
        [
            "summary",
            "profile",
            "objective",
            "career objective",
        ]
    )

    return found


def detect_contact_details(text):
    return {
        key: bool(pattern.search(text))
        for key, pattern
        in CONTACT_PATTERNS.items()
    }


def count_impact_signals(text):
    matches = []

    for pattern in IMPACT_PATTERNS:
        matches.extend(
            match.group(0)
            for match in pattern.finditer(text)
        )

    unique_matches = []

    for item in matches:
        cleaned = item.strip()

        if cleaned not in unique_matches:
            unique_matches.append(cleaned)

    return unique_matches


def count_action_verbs(text):
    normalized = _normalize_resume_text(text)

    count = 0

    for verb in ACTION_VERBS:
        count += len(
            re.findall(
                r"\b"
                + re.escape(verb)
                + r"\b",
                normalized
            )
        )

    return count


def score_skills_quality(
    detected_skills,
    required_skills
):
    if not required_skills:
        return 0

    detected = {
        skill.lower()
        for skill in detected_skills
    }

    matched_count = sum(
        1
        for skill in required_skills
        if skill.lower() in detected
    )

    role_coverage = (
        matched_count /
        len(required_skills)
    )

    breadth_bonus = min(
        len(detected_skills) / 12,
        1
    )

    score = round(
        (
            role_coverage * 0.8
            + breadth_bonus * 0.2
        )
        * 100
    )

    return max(
        0,
        min(100, score)
    )


def score_projects_quality(
    text,
    sections
):
    normalized = _normalize_resume_text(text)

    score = 0

    if sections.get("projects"):
        score += 50

    project_terms = [
        "project",
        "built",
        "developed",
        "created",
        "github",
        "deployed",
        "prototype",
    ]

    evidence_count = sum(
        len(
            re.findall(
                r"\b"
                + re.escape(term)
                + r"\b",
                normalized
            )
        )
        for term in project_terms
    )

    score += min(
        evidence_count * 5,
        35
    )

    if (
        "github.com" in normalized
        or "demo" in normalized
        or "deployed" in normalized
    ):
        score += 15

    return min(
        100,
        score
    )


def score_experience_quality(
    text,
    sections
):
    normalized = _normalize_resume_text(text)

    score = 0

    if sections.get("experience"):
        score += 55

    experience_terms = [
        "intern",
        "internship",
        "experience",
        "freelance",
        "volunteer",
        "worked",
        "company",
        "organization",
        "team",
    ]

    evidence_count = sum(
        len(
            re.findall(
                r"\b"
                + re.escape(term)
                + r"\b",
                normalized
            )
        )
        for term in experience_terms
    )

    score += min(
        evidence_count * 5,
        35
    )

    if re.search(
        r"\b(?:20\d{2}|19\d{2})\s*[-–]\s*(?:20\d{2}|present|current)\b",
        normalized,
        re.IGNORECASE,
    ):
        score += 10

    return min(
        100,
        score
    )


def score_impact_quality(text):
    impact_signals = count_impact_signals(text)
    action_verb_count = count_action_verbs(text)

    score = min(
        len(impact_signals) * 18,
        72
    )

    score += min(
        action_verb_count * 3,
        28
    )

    return min(
        100,
        score
    )


def score_completeness(
    sections,
    contact_details,
    detected_skills
):
    score = 0

    if sections.get("education"):
        score += 18

    if sections.get("projects"):
        score += 18

    if sections.get("experience"):
        score += 18

    if sections.get("skills") or detected_skills:
        score += 18

    if contact_details.get("email"):
        score += 10

    if contact_details.get("phone"):
        score += 6

    if (
        contact_details.get("linkedin")
        or contact_details.get("github")
    ):
        score += 6

    if (
        sections.get("summary")
        or sections.get("achievements")
        or sections.get("certifications")
    ):
        score += 6

    return min(
        100,
        score
    )


def build_resume_feedback(
    skills_score,
    projects_score,
    experience_score,
    impact_score,
    completeness_score,
    sections,
    impact_signals,
    detected_skills,
    missing_skills
):
    feedback = []

    if skills_score < 60:
        if missing_skills:
            top_missing = ", ".join(
                missing_skills[:3]
            )

            feedback.append(
                "Strengthen role-specific evidence by "
                f"adding projects or experience using {top_missing}."
            )
        else:
            feedback.append(
                "Make your technical skills more explicit in a dedicated skills section."
            )

    if projects_score < 65:
        feedback.append(
            "Strengthen your Projects section with 2-3 role-relevant projects and clearly state the stack, problem and outcome."
        )

    if experience_score < 55:
        feedback.append(
            "Your resume shows limited work or internship evidence. Add internships, freelance work, leadership, volunteering or substantial team projects where relevant."
        )

    if impact_score < 50:
        feedback.append(
            "Add measurable outcomes to bullets. Replace generic statements such as 'built an application' with impact-focused results using users, speed, accuracy, percentages or scale where truthful."
        )

    if completeness_score < 75:
        missing_sections = [
            name.title()
            for name in [
                "education",
                "skills",
                "projects",
                "experience",
            ]
            if not sections.get(name)
        ]

        if missing_sections:
            feedback.append(
                "Improve resume completeness by making these sections easier to identify: "
                + ", ".join(missing_sections)
                + "."
            )

    if not impact_signals:
        feedback.append(
            "No clear quantified achievements were detected. Add numbers only where you can support them, such as model accuracy, users served, requests handled or time saved."
        )

    if len(detected_skills) < 4:
        feedback.append(
            "Your technical footprint appears narrow. Make sure your relevant tools, languages and frameworks are explicitly listed where they are actually used."
        )

    if not feedback:
        feedback.append(
            "Your resume has a solid structure. Focus next on stronger project depth, deployment evidence and more quantified impact."
        )

    return feedback[:5]


def build_resume_quality_analysis(
    text,
    detected_skills,
    required_skills,
    missing_skills
):
    sections = detect_resume_sections(
        text
    )

    contact_details = (
        detect_contact_details(
            text
        )
    )

    impact_signals = (
        count_impact_signals(
            text
        )
    )

    action_verb_count = (
        count_action_verbs(
            text
        )
    )

    skills_score = (
        score_skills_quality(
            detected_skills,
            required_skills
        )
    )

    projects_score = (
        score_projects_quality(
            text,
            sections
        )
    )

    experience_score = (
        score_experience_quality(
            text,
            sections
        )
    )

    impact_score = (
        score_impact_quality(
            text
        )
    )

    completeness_score = (
        score_completeness(
            sections,
            contact_details,
            detected_skills
        )
    )

    overall_score = round(
        skills_score * 0.30
        + projects_score * 0.20
        + experience_score * 0.20
        + impact_score * 0.15
        + completeness_score * 0.15
    )

    if overall_score >= 85:
        quality_label = "Excellent"
    elif overall_score >= 70:
        quality_label = "Strong"
    elif overall_score >= 55:
        quality_label = "Developing"
    else:
        quality_label = "Needs Improvement"

    feedback = (
        build_resume_feedback(
            skills_score,
            projects_score,
            experience_score,
            impact_score,
            completeness_score,
            sections,
            impact_signals,
            detected_skills,
            missing_skills
        )
    )

    return {
        "overall_score":
            overall_score,

        "quality_label":
            quality_label,

        "skills_score":
            skills_score,

        "projects_score":
            projects_score,

        "experience_score":
            experience_score,

        "impact_score":
            impact_score,

        "completeness_score":
            completeness_score,

        "sections_detected":
            sections,

        "contact_details_detected":
            contact_details,

        "impact_signals":
            impact_signals[:10],

        "action_verb_count":
            action_verb_count,

        "feedback":
            feedback,
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
    # RESUME QUALITY
    # ======================================

    resume_quality = (
        build_resume_quality_analysis(
            text,
            detected_skills,
            required_skills,
            missing_skills
        )
    )

    # ======================================
    # 30-DAY ACTION PLAN
    # ======================================

    action_plan_30_days = (
        build_30_day_action_plan(
            target_role,
            missing_skills,
            roadmap,
            recommended_project,
            resume_quality.get(
                "feedback",
                []
            )
        )
    )

    # ======================================
    # RESUME BULLET IMPROVER
    # ======================================

    bullet_improvements = (
        build_resume_bullet_improvements(
            text,
            target_role
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

        "learning_resources":
            {
                skill: get_learning_resources(
                    skill
                )
                for skill in missing_skills
            },

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

        # RESUME QUALITY

        "resume_quality":
            resume_quality,

        "resume_quality_score":
            resume_quality[
                "overall_score"
            ],

        "resume_quality_label":
            resume_quality[
                "quality_label"
            ],

        "resume_feedback":
            resume_quality[
                "feedback"
            ],

        # 30-DAY ACTION PLAN

        "action_plan_30_days":
            action_plan_30_days,

        # RESUME BULLET IMPROVER

        "bullet_improvements":
            bullet_improvements,
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