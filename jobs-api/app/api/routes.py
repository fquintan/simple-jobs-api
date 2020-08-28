from app import app, db
from flask import jsonify
from app.models.Job import Job, JobStatus
from flask_sqlalchemy import functools

@app.route('/get_jobs/<int:amount>')
def get_jobs(amount):
    jobs = Job.query.filter_by(status=JobStatus.PENDING).limit(amount).all()
    if jobs is None:
        return jsonify([])
    resp = []
    for job in jobs:
        job.status = JobStatus.DOING 
        resp.append(job.id)
    db.session.commit()
    return jsonify(resp)


@app.route('/job_done/<int:index>')
def job_done(index):
    job = Job.query.get(index)
    if job is None:
        return jsonify([])
    if job.status == JobStatus.DOING:
        job.status = JobStatus.DONE
        db.session.commit()
        return "Job done"
    else:
        return "Job was not running"

    return jsonify([])


@app.route('/job_retry/<int:index>')
def job_retry(index):
    job = Job.query.get(index)
    if job is None:
        return jsonify([])
    job.status = JobStatus.PENDING
    db.session.commit()
    return jsonify(job.id)

@app.route('/release_all/')
def job_release():
    jobs = Job.query.filter_by(status=JobStatus.DOING)
    if jobs is None:
        return jsonify([])
    resp = []
    for job in jobs:
        resp.append(job.id)
        job.status = JobStatus.PENDING
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
        job = Job(id=(max_id+i), instruction='', status=JobStatus.PENDING)
        db.session.add(job)
        resp.append(max_id+i)
    db.session.commit()
    return jsonify(resp)



@app.route('/clear_all/')
def clear_all():
    Job.query.delete()
    db.session.commit()
    return jsonify([])
