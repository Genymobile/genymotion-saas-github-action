const core = require('@actions/core');
const exec = require('@actions/exec');
const exec_sync = require('child_process').execSync;
const path = require("path")


/**
 * Install gmsaas version with the specified version
 * @param {string} gmsaas_version
 */
async function installGmsaasCLI(gmsaas_version) {
  try {
    if (gmsaas_version) {
      core.info(`Installing gmsaas ${gmsaas_version} ...`);
      await exec.exec(`pip3 install gmsaas===${gmsaas_version}`);
    } else {
      core.info(`Installing gmsaas ...`);
      await exec.exec(`pip3 install gmsaas`);
    }
    core.info(`gmsaas has been installed.`);

    // Add gmsaas to PATH
    core.addPath(path.join(process.env['HOME'], ".local/bin"));
    return true
   } catch (error) {
    core.setFailed('Failed to install gmsaas: ' + error.message);
  }
}

/**
 * Log in
 * @param {string} gmsaas_email
 * @param {string} gmsaas_password
 */
async function login(gmsaas_email, gmsaas_password) {
  try {
    
    core.info(`Login gmsaas ...`);

    await exec.exec(`gmsaas auth login ${gmsaas_email} ${gmsaas_password}`);
    return true;
   } catch (error) {
    core.setFailed('Failed to login: ' + error.message);
  }
}

/**
 * Configure gmsaas
 */
async function configure() {
  try {
    core.info(`Configuring gmsaas ...`);

    // set Android SDK path
    await exec.exec(`env`);
    const ANDROID_SDK_ROOT = process.env['ANDROID_SDK_ROOT'];
    await exec.exec(`gmsaas config set android-sdk-path ${ANDROID_SDK_ROOT}`);

   } catch (error) {
    core.setFailed(error.message);
  }
}

/**
 * Start and Connect Genymotion Cloud SaaS instance
 * @param {string} recipe_uuid
 * @param {string} adb_serial_port
 */
async function startInstance(recipe_uuid, adb_serial_port, instance_index) {
  try {
    const instance_name = `gminstance_${process.env.GITHUB_JOB}_${process.env.GITHUB_RUN_NUMBER}`;
    const instance_uuid = exec_sync(`gmsaas instances start ${recipe_uuid} ${instance_name}_${instance_index}`).toString().split(/\r?\n/)[0];
    core.info(`Instance started with instance_uuid ${instance_uuid}`);
    core.setOutput('instance_uuid', instance_uuid);
    core.exportVariable('INSTANCE_UUID', instance_uuid);

    let options;
    if (adb_serial_port) {
      options = ['--adb-serial-port', `${adb_serial_port}`]
    }
    await exec.exec(`gmsaas instances adbconnect ${instance_uuid}`, options, function (_error, stdout, _stderr) {
      core.info(`Genymotion instance is connected: ` + stdout);
      return stdout
    });
  } catch (error) {
    core.setFailed('Failed to start Genymotion instance: ' + error.message);
  }
};


async function run() {
  const gmsaas_version = core.getInput('gmsaas_version');
  const gmsaas_email = core.getInput('email', { required: true });
  const gmsaas_password = core.getInput('password', { required: true });
  const recipe_uuid = core.getInput('recipe_uuid', { required: true });
  const adb_serial_port = core.getInput('adb_serial_port');
  const instance_index = core.getInput('instance_index');

  // Add USER_AGENT to improve customer support.
  core.exportVariable('GMSAAS_USER_AGENT_EXTRA_DATA', 'githubactions');

  try {
    // Install gmsaas
    await installGmsaasCLI(gmsaas_version);

    // login
    await login(gmsaas_email, gmsaas_password);

    // configure
    await configure();

    // Start a Genymotion Cloud Instance
    await startInstance(recipe_uuid, adb_serial_port, instance_index);

 
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
