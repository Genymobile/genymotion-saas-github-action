'use strict';

const core = require('@actions/core');
const exec = require('@actions/exec');
const execSync = require('child_process').execSync;
const path = require('path');

/**
 * Install gmsaas version with the specified version
 * @param {string} gmsaasVersion Version of gmsaas.
 */
async function installGmsaasCLI(gmsaasVersion) {
    try {
        if (gmsaasVersion) {
            core.info(`Installing gmsaas ${gmsaasVersion} ...`);
            await exec.exec(`pip3 install gmsaas===${gmsaasVersion}`);
        } else {
            core.info('Installing gmsaas ...');
            await exec.exec('pip3 install gmsaas');
        }
        core.info('gmsaas has been installed.');

        // Add gmsaas to PATH
        core.addPath(path.join(process.env.HOME, '.local/bin'));
    } catch (error) {
        core.setFailed('Failed to install gmsaas: ' + error.message);
    }
}

/**
 * Log in
 * @param {string} gmsaasEmail Email of your Genymotion Cloud SaaS account.
 * @param {string} gmsaasPassword Password of your Genymotion Cloud SaaS account.
 */
async function login(gmsaasEmail, gmsaasPassword) {
    try {
        core.info('Login gmsaas ...');

        await exec.exec(`gmsaas auth login ${gmsaasEmail} ${gmsaasPassword}`);
    } catch (error) {
        core.setFailed('Failed to login: ' + error.message);
    }
}

/**
 * Configure gmsaas
 */
async function configure() {
    try {
        core.info('Configuring gmsaas ...');

        // set Android SDK path
        await exec.exec('env');
        const ANDROID_SDK_ROOT = process.env.ANDROID_SDK_ROOT;
        await exec.exec(`gmsaas config set android-sdk-path ${ANDROID_SDK_ROOT}`);
    } catch (error) {
        core.setFailed(error.message);
    }
}

/**
 * Start and Connect Genymotion Cloud SaaS instance
 * @param {string} recipeUuid Instance recipe to use.
 * @param {string} adbSerialPort ABD serial port to use (Optional).
 * @param {string} instanceIndex Instance index for avoid conflict on instance name.
 */
async function startInstance(recipeUuid, adbSerialPort, instanceIndex) {
    try {
        const instanceName = `gminstance_${process.env.GITHUB_JOB}_${process.env.GITHUB_RUN_NUMBER}`;
        const instanceUuid = execSync(`gmsaas instances start ${recipeUuid} ${instanceName}_${instanceIndex}`).toString()
            .split(/\r?\n/)[0];
        core.info(`Instance started with instance_uuid ${instanceUuid}`);
        core.setOutput('instance_uuid', instanceUuid);
        core.exportVariable('INSTANCE_UUID', instanceUuid);

        let options;
        if (adbSerialPort) {
            options = ['--adb-serial-port', `${adbSerialPort}`];
        }
        await exec.exec(`gmsaas instances adbconnect ${instanceUuid}`, options, function(_error, stdout) {
            core.info('Genymotion instance is connected: ' + stdout);
            return stdout;
        });
    } catch (error) {
        core.setFailed('Failed to start Genymotion instance: ' + error.message);
    }
}

async function run() {
    const gmsaasVersion = core.getInput('gmsaas_version');
    const gmsaasEmail = core.getInput('email', {required: true});
    const gmsaasPassword = core.getInput('password', {required: true});
    const recipeUuid = core.getInput('recipe_uuid', {required: true});
    const adbSerialPort = core.getInput('adb_serial_port');
    const instanceIndex = core.getInput('instance_index');

    // Add USER_AGENT to improve customer support.
    core.exportVariable('GMSAAS_USER_AGENT_EXTRA_DATA', 'githubactions');

    try {
    // Install gmsaas
        await installGmsaasCLI(gmsaasVersion);

        // login
        await login(gmsaasEmail, gmsaasPassword);

        // configure
        await configure();

        // Start a Genymotion Cloud Instance
        await startInstance(recipeUuid, adbSerialPort, instanceIndex);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
