from app import app, db
from flask import jsonify
from app.models.Job import Job, JobStatus
from flask_sqlalchemy import functools
import uuid
from datetime import datetime

@app.route('/get_jobs/<int:amount>')
def get_jobs(amount):
    jobs = Job.query.filter_by(status=JobStatus.PENDING).limit(amount).all()
    if jobs is None:
        return jsonify({})
    resp = {}
    machine_id = str(uuid.uuid4())
    for job in jobs:
        job.status = JobStatus.DOING
        job.machine = machine_id
        job.last_modified = datetime.utcnow()
        resp[job.id] = job.serialize()
    db.session.commit()
    return jsonify(resp)


@app.route('/job_done/<int:index>')
def job_done(index):
    job = Job.query.get(index)
    if job is None:
        return jsonify({})
    if job.status == JobStatus.DOING:
        job.status = JobStatus.DONE
        job.last_modified = datetime.utcnow()
        db.session.commit()

    return jsonify(job.serialize())


@app.route('/job_retry/<int:index>')
def job_retry(index):
    job = Job.query.get(index)
    if job is None:
        return jsonify({})
    job.status = JobStatus.PENDING
    job.last_modified = datetime.utcnow()
    job.machine = ''
    db.session.commit()
    return jsonify(job.sereialize())

@app.route('/release_all/')
def job_release():
    jobs = Job.query.filter_by(status=JobStatus.DOING)
    if jobs is None:
        return jsonify({})
    resp = {}
    for job in jobs:
        job.status = JobStatus.PENDING
        job.last_modified = datetime.utcnow()
        job.machine = ''
        resp[job.id] = job.serialize()
    db.session.commit()
    return jsonify(resp)


@app.route('/create_jobs/<int:amount>')
def create_jobs(amount):
    job = Job.query.order_by(Job.id.desc()).first()
    if job is None:
        max_id = 0
    else:
        max_id = job.id + 1
    resp = []
    for i in range(amount):
        job = Job(
            id=(max_id+i),
            instruction='',
            status=JobStatus.PENDING,
            last_modified = datetime.utcnow(),
            machine = ''
        )
        db.session.add(job)
        resp.append(max_id+i)
    db.session.commit()
    return jsonify(resp)



@app.route('/clear_all/')
def clear_all():
    Job.query.delete()
    db.session.commit()
    return jsonify({})


@app.route('/status/')
def status_all():
    jobs = Job.query.all()
    if jobs is None:
        return jsonify({})
    resp = {}
    for job in jobs:
        resp[job.id] = job.serialize()
    return jsonify(resp)


@app.route('/status/<int:index>')
def status(index):
    job = Job.query.get(index)
    if job is None:
        return jsonify({})
    
    return jsonify(job.serialize())

