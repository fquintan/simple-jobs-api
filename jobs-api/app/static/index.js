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
		}
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
		  })
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