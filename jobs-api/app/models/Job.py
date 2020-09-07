from flask import Flask
import enum
from datetime import datetime

from app import db

class JobStatus(enum.Enum):
	PENDING = 'PENDING'
	DOING = 'DOING'
	DONE = 'DONE'

class Job(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	instruction = db.Column(db.String(255), nullable=False)
	status = db.Column(db.Enum(JobStatus), nullable=False)
	last_modified = db.Column(db.DateTime , nullable=False, default=datetime.utcnow)
	runtime = db.Column(db.Integer, nullable=False, default=0)
	machine = db.Column(db.String(255), nullable=False)


	def __repr__(self):
		return '<Job #%d>: %s [%s]' % (self.id, self.instruction, self.status)


	def set_status(self, status):
		self.status = status


	def serialize(self):
		as_dict = {
			'id': self.id,
			'instruction': self.instruction,
			'status': self.status.value,
			'last_modified': self.last_modified,
			'machine_id': self.machine,
		}
		if self.runtime > 0: 
			as_dict['runtime'] = self.runtime
		return as_dict