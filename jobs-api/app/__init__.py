from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

import os

app = Flask(__name__)
CORS(app)

DB_USER = os.environ.get('DB_USER', '<db_user>')
DB_PASS = os.environ.get('DB_PASS', '<db_pass>')
DB_HOST = os.environ.get('DB_HOST', '<db_host>')
DB_BASE = os.environ.get('DB_BASE', '<db_name>')

DB_URI = '%s:%s@%s/%s' % (DB_USER, DB_PASS, DB_HOST, DB_BASE)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://%s' % DB_URI

db = SQLAlchemy(app)

from app import api
from app import models

db.create_all()
