const API_URL = 'https://jobs-api.felipequintanilla.cl'
const vm = new Vue({ // Again, vm is our Vue instance's name for consistency.
    el: '#vm',
    delimiters: ['[[', ']]'],
    data: {
		jobs_doing: {},
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
		stats: {},
		runtime: ''
	},
	mounted () {
		axios
		  .all([
			axios.get(API_URL + '/stats'), 
			axios.get(API_URL + '/status_doing')])
		  .then(axios.spread((statsRet, jobsRet) => {
			  const stats = statsRet.data;
			  const labels = {
				'PENDING': 'pending',
				'DOING': 'doing',
				'DONE': 'done',
			  }
			  for (const row in stats.counts) {
				if (Object.hasOwnProperty.call(stats.counts, row)) {
					const el = stats.counts[row];
					this.counts[labels[el.status]] = el.count;
					this.counts.total += el.count;
				}
			  }
			  this.percentage.doing = this.counts.doing * 100 / this.counts.total; 
			  this.percentage.done = this.counts.done * 100 / this.counts.total; 
			  this.percentage.pending= this.counts.pending * 100 / this.counts.total;

			  for (const m in stats.runtimes) {
				if (Object.hasOwnProperty.call(stats.runtimes, m)) {
					const machine = stats.runtimes[m];
					this.stats[machine['machine_id']] = {
						'id': machine['machine_id'],
						'avg': runtime2txt(machine['avg'])
					};
				}
			  }
			  this.runtime = runtime2txt(stats.total_runtime);

			  const jobs = jobsRet.data;
			  for (const k in jobs) {
				  if (Object.hasOwnProperty.call(jobs, k)) {
					  const job = jobs[k];
					  runtime = Math.floor(((new Date()).getTime() - Date.parse(job.last_modified)) / 1000);
					  job.runtime = runtime2txt(runtime);
					  this.jobs_doing[job.id] = job;
					  console.log(this.jobs_doing);
				  }
			  }
			  console.log(this.counts, this.percentage);
  
		  }));
	  },
	  methods: {
		  retry: function(id) {
			  axios
				  .get(API_URL + '/job_retry/'+ id)
				  .then((response) => {
					const job = response.data;
					if (this.jobs_doing.hasOwnProperty(job.id)){
						this.$delete(this.jobs_doing, job.id);
						this.$set(this.jobs_pending, job.id, job);
						this.counts['doing']--;
						this.counts['pending']++;
						this.percentage['doing'] = this.counts['doing'] * 100 / this.counts['total'];
						this.percentage['pending'] = this.counts['pending'] * 100 / this.counts['total'];
  
					}
					}, (error) => {console.log('error')})
		  },
	  }
})

function runtime2txt(t) {
	hours = Math.floor(t / 3600)
	minutes = Math.floor((t - (hours * 3600)) / 60);
	seconds = t - (hours * 3600) - (minutes * 60);

	return hours.toString().padStart(2, '0') + ':' + 
	minutes.toString().padStart(2, '0') + ':' + 
	seconds.toString().padStart(2, '0');
}