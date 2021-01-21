const core = require('@actions/core');
const exec = require('@actions/exec');

async function run() {
  core.info('Stopping Genymotion Cloud SaaS instance');
  try {
    await exec.exec(`gmsaas instances stop ${process.env.INSTANCE_UUID}`)
   } catch (error) {
    core.setFailed(error.message);
  }
}

run();
