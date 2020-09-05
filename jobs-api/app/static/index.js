const vm = new Vue({ // Again, vm is our Vue instance's name for consistency.
    el: '#vm',
    delimiters: ['[[', ']]'],
    data: {
		jobs: [],
		jobs_doing: [],
		jobs_done: [],
		jobs_pending: [],
		counts: {
			total: 0,
			doing: 0,
			done: 0,
			pending: 0
		},
		percentage: {
			doing: 0,
			done: 0,
			pending: 0
		}
	},
	mounted () {
		axios
		  .get('http://jobs-api.felipequintanilla.cl:8080/status')
		  .then(response => {
			  this.jobs = response.data;
			  for (const job_id in this.jobs) {
				  if (this.jobs.hasOwnProperty(job_id)) {
					  const job = this.jobs[job_id];
					  this.counts['total']++;
					  if (job.status == 'DOING') {
						  runtime = Math.floor(((new Date()).getTime() - Date.parse(job.last_modified)) / 1000);
						  job.runtime_second = runtime;
						  hours = Math.floor(runtime / 3600);
						  minutes = Math.floor((runtime - (hours * 3600)) / 60);
						  seconds = runtime - (hours * 3600) - (minutes * 60);

						  job.runtime = hours.toString().padStart(2, '0') + ':' + 
							minutes.toString().padStart(2, '0') + ':' + 
							seconds.toString().padStart(2, '0');
			
						  this.jobs_doing.push(job);
						  this.counts['doing']++;
					  }
					  else if (job.status == 'DONE') {
						  this.jobs_done.push(job);
						  this.counts['done']++;
					}
					  else if (job.status == 'PENDING') {
						  this.jobs_pending.push(job);
						  this.counts['pending']++;
					}
				  }
				  if (this.counts['total']){
					  this.percentage['doing'] = this.counts['doing'] * 100 / this.counts['total'];
					  this.percentage['done'] = this.counts['done'] * 100 / this.counts['total'];
					  this.percentage['pending'] = this.counts['pending'] * 100 / this.counts['total'];
				  }
			  }
		  })
	  }
})