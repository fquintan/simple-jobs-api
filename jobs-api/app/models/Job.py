from flask import Flask
import enum
from datetime import datetime

from app import db

class JobStatus(enum.Enum):
	PENDING = 'PENDING'
	DOING = 'DOING'
	DONE = 'DONE'

class Job(db.Model):
	id = db.Column(db.Integer, primary_key=True, autoincrement=False)
	instruction = db.Column(db.String(255), nullable=False)
	status = db.Column(db.Enum(JobStatus), nullable=False)
	last_modified = db.Column(db.DateTime , nullable=False, default=datetime.utcnow)
	machine = db.Column(db.String(255), nullable=False)


	def __repr__(self):
		return '<Job #%d>: %s [%s]' % (self.id, self.instruction, self.status)


	def set_status(self, status):
		self.status = status


	def serialize(self):
		return {
			'id': self.id,
			'instruction': self.instruction,
			'status': self.status.value,
			'last_modified': self.last_modified,
			'machine_id': self.machine
		}