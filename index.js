#!/usr/bin/env node

const { commandsDescription } = require('./lib/constants')
const { processModule } = require('./lib/execute')

const shortcuts = {
    h: "--help",
    v: "--version"
}

const cmd = process.argv[2]
if (cmd in shortcuts) {
    cmd = shortcuts[cmd]
}

switch (cmd) {

    case (`${shortcuts.h}`):
        console.log(commandsDescription);
        break;
    case (`${shortcuts.v}`):
        console.log(require('./package.json').version);
        break;
    default:
        {
            if (cmd) {
                // process.argv[2] is the file path given through cli
                processModule(cmd)
            }
            else {
                console.log(commandsDescription)
            }
        }
}