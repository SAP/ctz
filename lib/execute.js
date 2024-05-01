const { spawn } = require('child_process');
const path = require('path')
const { parse_yaml } = require('./parse_yaml')
const { font } = require('./constants')
const readline = require('readline')

//Options
const args = process.argv.slice(3);
const options = {
    push: args.includes('--push') || args.includes('-p'),
    log: args.includes('--log') || args.includes('-l')
}

async function ask(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const prompt = (query) => new Promise((resolve) => rl.question(query, resolve));
    const answer = await prompt(question);
    rl.close()
    return answer.trim().toLowerCase();
}

async function execCommand(command, log = options.log) {
    if (!command) return
    const mainCommand = command[0]
    const options = command.slice(1).flat()
    const childProcess = spawn(mainCommand, options, {
        stdio: log ? 'inherit': 'pipe',
        cwd: process.cwd()
    });

    childProcess.on("data", (data) => log && console.log(`${data}`));
    childProcess.on('error', (err) => console.error(`${font.reset}Error: ${err.message}`));
    return new Promise((resolve, reject) => {
        childProcess.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                const enableLog = log ? '' : 'Enable log option to know more about the error\n';
                reject(new Error(`${font.reset}${enableLog}`));
            }
        });
    });
}

async function tagAndPush(modules, repository) {
    for (const module of modules) {
        // run tag command
        console.log(`\nPushing ${module.name}:${module.tag} to ${repository} ...`)
        await execCommand(module.tagCmd)
        // run push command
        await execCommand(module.pushCmd)
    }
    console.log(`\n${font.green}Successfully pushed images to ${repository}${font.reset}`)
}

async function processModule(filename) {
    try {
        const { repository = '', before_all = [], commands: modules = [] } = parse_yaml(filename)
        if (!repository || !modules) return

        for(const command of before_all) await execCommand(command, '--log')

        for (const module of modules) {
            console.log(`\nContainerising module ${module.name} ...`)
            for (const buildCommand of module.buildCmd) {
                await execCommand(buildCommand)
            }
            console.log(`\n${font.green}Successfully created ${module.name}:${module.tag}.${font.reset}`)
        }
        if (options.push) await tagAndPush(modules, repository)
        else {
            const answer = await ask("Do you wish to push the images to registry? (y/n): ")
            if (answer === 'yes' || answer === 'y') await tagAndPush(modules, repository)
            else console.log("Aborted")
        }
    }
    catch (e) {
        console.log(`${font.red}${e.message}${font.reset}`)
    }
}

module.exports = { processModule }