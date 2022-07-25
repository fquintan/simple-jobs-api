const API_URL = 'https://jobs-api.felipequintanilla.cl'
const vm = new Vue({ // Again, vm is our Vue instance's name for consistency.
    el: '#vm',
    delimiters: ['[[', ']]'],
    data: {
		jobs_doing: {},
		jobs_done: {},
		jobs_pending: {},
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
		},
		stats: {
			total: {
				id: 'total',
				count: 0,
				time: 0,
			}
		},

	},
	mounted () {
		axios
		  .get(API_URL + '/status')
		  .then(response => {
			  const jobs = response.data;
			  for (const job_id in jobs) {
				  if (jobs.hasOwnProperty(job_id)) {
					  const job = jobs[job_id];
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
						  
						  this.jobs_doing[job.id] = job;
						  this.counts['doing']++;
						}
						else if (job.status == 'DONE') {
							if( ! this.stats[job.machine_id] ) {
								this.stats[job.machine_id] = {
									time: 0,
									count: 0,
									id: job.machine_id
								}
							}
							this.stats[job.machine_id]['time'] += job.runtime;
							this.stats[job.machine_id]['count']++;
							this.stats.total['time'] += job.runtime;
							this.stats.total['count']++;
							hours = Math.floor(job.runtime / 3600)
							minutes = Math.floor((job.runtime - (hours * 3600)) / 60);
							seconds = job.runtime - (hours * 3600) - (minutes * 60);
							job.runtime = hours.toString().padStart(2, '0') + ':' + 
							minutes.toString().padStart(2, '0') + ':' + 
							seconds.toString().padStart(2, '0');
							this.jobs_done[job.id] = job;
  
						  this.counts['done']++;
					}
					  else if (job.status == 'PENDING') {
						  this.jobs_pending[job.id] = job;
						  this.counts['pending']++;
					}
				  }
				  if (this.counts['total']){
					  this.percentage['doing'] = this.counts['doing'] * 100 / this.counts['total'];
					  this.percentage['done'] = this.counts['done'] * 100 / this.counts['total'];
					  this.percentage['pending'] = this.counts['pending'] * 100 / this.counts['total'];
				  }
			  }
			  for (const machine in this.stats) {
				var m = this.stats[machine];
				if(m['count'] == 0) continue;
				m['avg'] = Math.floor(m['time'] / m['count']);
				hours = Math.floor(m['avg'] / 3600)
				minutes = Math.floor((m['avg'] - (hours * 3600)) / 60);
				seconds = m['avg'] - (hours * 3600) - (minutes * 60);
				m['avg'] = hours.toString().padStart(2, '0') + ':' + 
				minutes.toString().padStart(2, '0') + ':' + 
				seconds.toString().padStart(2, '0');
				this.stats[m['id']] = m;
				console.log('mac', m);

			  }
			  console.log(this.stats);
		  })
	  },
	  methods: {
	  }
})