const { spawn } = require('child_process');
const { parse_yaml } = require('./parse_yaml')
const { font } = require('./constants')
const readline = require('readline')

//Options
const args = process.argv.slice(3);
const options = {
    push: args.includes('--push') || args.includes('-p'),
    log: args.includes('--log') || args.includes('-l'),
    repository: args.find(arg => arg.startsWith('--repository'))?.split('=')[1] ?? '',
    modules: args.find(arg => arg.startsWith('--modules'))?.split('=')[1].split(',') ?? []
}

function logMessage(message) {
    console.log(message + '...')
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
    const args = command.slice(1).flat()
    const childProcess = spawn(mainCommand, args, {
        cwd: process.cwd(),
        shell: true
    })
    if (log) childProcess.stdout.on("data", (data) => process.stdout.write(data));
    childProcess.stderr.on("data", (data) => process.stderr.write(data))
    childProcess.on('error', (err) => console.error(`${font.reset}Error: ${err.message}`));
    return new Promise((resolve, reject) => {
        childProcess.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error());
        })
    })
}

async function tagAndPush(modules, repository) {
    for (const module of modules) {
        // run tag command
        logMessage(`Pushing ${module.name}:${module.tag} to ${repository}`)
        await execCommand(module.tagCmd)
        // run push command
        await execCommand(module.pushCmd)
    }
}
async function executeModules(modules, repository, options) {
    for (const module of modules) {
        logMessage(`Containerising module ${module.name}`)
        for (const buildCommand of module.buildCmd) {
            await execCommand(buildCommand)
        }
    }
    if (options.push) await tagAndPush(modules, repository)
    else {
        const answer = await ask("Do you wish to push the images to registry? (y/n): ")
        if (answer === 'yes' || answer === 'y') await tagAndPush(modules, repository)
        else console.log("Aborted")
    }
}
async function processModule(filename) {
    try {
        const { repository = '', before_all = [], commands: modules = [] } = parse_yaml(filename, options.repository)
        if (!repository || !modules) return

        for (const command of before_all) await execCommand(command, '--log')

        console.log('\n')

        if(options.modules.length > 0) {
            let filteredModules = [];
            for(const moduleName of options.modules) {
                const module = modules.find(module => module.name === moduleName)
                if(!module) throw new Error(`No module found with the name ${moduleName}`);
                filteredModules.push(module);
            }
            await executeModules(filteredModules, repository, options);
        }
        else {
            await executeModules(modules, repository, options);
        }
    }
    catch (e) {
        console.log(`${font.red}${e.message}${font.reset}`);
        process.exit(1);
    }
}

module.exports = { processModule }