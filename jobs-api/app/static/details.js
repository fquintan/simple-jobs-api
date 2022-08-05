const API_URL = 'http://jobs-api.felipequintanilla.cl'
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
		stats: {},
		runtime: {
			min_timestamp: 999999999999999,
			max_timestamp: 0,
			min_length: 0
		}
	},
	mounted () {
		axios
		  .all([axios.get(API_URL + '/stats'),
				axios.get(API_URL + '/status')])
		  .then(axios.spread((statsRet, jobsRet) => {
			  const stats = statsRet.data;
			  const jobs = jobsRet.data;
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

			  for (const job_id in jobs) {
				  if (jobs.hasOwnProperty(job_id)) {
					  const job = jobs[job_id];
					  if(!job.hasOwnProperty('runtime')) {
						  job.runtime = Math.floor(((new Date()).getTime() - Date.parse(job.last_modified)) / 1000);
					  }
					  job.runtime = runtime2txt(job.runtime);
					  this['jobs_' + labels[job.status]][job.id] = job;
				  }
			  }
			  console.log(this);
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
		  delete_job: function(id) {
			axios
			.get(API_URL + '/delete/'+ id)
			.then((response) => {
			  const job_id = response.data;
			  if (this.jobs_doing.hasOwnProperty(job_id)){
				  this.$delete(this.jobs_doing, job_id);
				  this.counts['doing']--;
				  this.counts['total']--;
			  } else if (this.jobs_pending.hasOwnProperty(job_id)){
				this.$delete(this.jobs_pending, job_id);
				this.counts['pending']--;
				this.counts['total']--;
			  } else if (this.jobs_done.hasOwnProperty(job_id)){
				this.$delete(this.jobs_done, job_id);
				this.counts['done']--;
				this.counts['total']--;
			  }
			  if (this.counts['total']){
				this.percentage['doing'] = this.counts['doing'] * 100 / this.counts['total'];
				this.percentage['done'] = this.counts['done'] * 100 / this.counts['total'];
				this.percentage['pending'] = this.counts['pending'] * 100 / this.counts['total'];
		      }
			}, (error) => {console.log('error')})
		  },
		  add_jobs: function() {
			  console.log($('#add-form-instructions').val());
			  var formData = new FormData();
			  formData.append('instructions', $('#add-form-instructions').val())
			  axios({
				  method: 'post',
				  url: API_URL + '/create_jobs/',
				  data: formData
			  }).then((response) => {
				const jobs = response.data;
				for (const job_id in jobs) {
					if (jobs.hasOwnProperty(job_id)) {
						const job = jobs[job_id];
						this.$set(this.jobs_pending, job_id, job);
						this.counts['pending']++;
						this.counts['total']++;
					}
				}
				this.percentage['doing'] = this.counts['doing'] * 100 / this.counts['total'];
				this.percentage['done'] = this.counts['done'] * 100 / this.counts['total'];
				this.percentage['pending'] = this.counts['pending'] * 100 / this.counts['total'];

			  }, 
			  (error) => (console.log(error)))
		  }
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