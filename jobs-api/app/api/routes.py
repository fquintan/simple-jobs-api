from app import app, db
from flask import jsonify, render_template, request
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
    machine_id = request.args.get('machine', str(uuid.uuid4()))
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
        now = datetime.utcnow()
        runtime = (now - job.last_modified).total_seconds()
        job.runtime = runtime
        job.last_modified = now
        db.session.commit()

    return jsonify(job.serialize())


@app.route('/job_start/<int:index>')
def job_start(index):
    job = Job.query.get(index)
    if job is None:
        return jsonify({})
    if job.status == JobStatus.DOING or job.status == JobStatus.DONE:
        return jsonify({})
    if job.status == JobStatus.PENDING:
        machine_id = request.args.get('machine', str(uuid.uuid4()))
        job.status = JobStatus.DOING
        job.machine = machine_id
        now = datetime.utcnow()
        job.last_modified = now
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
    return jsonify(job.serialize())


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


@app.route('/create_jobs/', methods=['POST'])
def create_jobs():
    instructions = request.form.get('instructions', '')
    lines = str(instructions).split('\n')
    resp = {}
    for line in lines:
        if len(line) == 0:
            continue
        job = Job(
            instruction = line.strip(),
            status = JobStatus.PENDING,
            last_modified = datetime.utcnow(),
            machine = '')
        db.session.add(job)
        db.session.flush()
        resp[job.id] = job.serialize()
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


@app.route('/delete/<int:index>')
def delete(index):
    job = Job.query.get(index)
    if job is None:
        return jsonify({})
    job_id = job.id
    db.session.delete(job)
    db.session.commit()
    return str(job_id)

@app.route('/')
def index():
    return render_template('index.html', **{"greeting": "Hello from Flask!"})
