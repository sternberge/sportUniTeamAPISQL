module.exports = {
  apps: [{
    name: 'SUT',
    script: './index.js'
  }],
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'ec2-54-89-175-224.compute-1.amazonaws.com',
      key: '~/.ssh/tutorial.pem',
      ref: 'origin/master',
      repo: 'git@github.com:sternberge/sportUniTeamAPISQL.git',
      path: '/home/ubuntu/aws-node-tutorial',
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
    }
  }
}