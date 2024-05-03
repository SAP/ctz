const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path')
const { native_commands, font } = require('./constants')

const keyProcessorMap = {
    'dockerfile': processDockerfile,
    'commands': processCommands,
    'buildpack': processBuildpack
};

function appendSubcommand(param, subcommand) {
    if (!param) return [];
    if (subcommand === native_commands.env) {
        return Object.entries(param).flatMap(([key, value]) =>
            String(value).split(',').flatMap(env => [subcommand, `${key}=${env.trim() || '""'}`])
        );
    } else {
        return param.split(',').flatMap(element => [subcommand, element.trim()]);
    }
}

function processDockerfile(build_parameters, name, tag) {
    const dockerfile = build_parameters.dockerfile;
    if (!dockerfile) return [];
    const path = appendSubcommand(dockerfile, '-f');
    const imageTag = appendSubcommand(`${name}:${tag ?? 'latest'}`, '-t');
    const buildCommand = [native_commands.docker, native_commands.build, imageTag, path, '.'].flat();
    return [buildCommand]
}

function processCommands(build_parameters) {
    const commands = build_parameters.commands;
    return commands ? commands.map(command => command.trim().split(" ")) : [];
}

function processBuildpack(build_parameters, name, tag) {
    let { type, path, env, builder } = build_parameters.buildpack;
    type = type ? type.split(',').map(type => {
        type = type.trim()
        if (type === 'java' || type === 'nodejs' || type === 'sap-machine')
            return `gcr.io/paketo-buildpacks/${type}`;
        else
            return type
    }) : []

    if (builder === 'builder-jammy-base' || builder === 'builder-jammy-full') {
        builder = `paketobuildpacks/${builder}`
    }

    const imageCmd = appendSubcommand(name, native_commands.build);
    const pathCmd = appendSubcommand(path, native_commands.path);
    const buildpackCmd = []
    type.forEach(type => {
        buildpackCmd.push(appendSubcommand(type, native_commands.buildpack))
    })
    const builderCmd = appendSubcommand(builder, native_commands.builder);
    const envCmd = appendSubcommand(env, native_commands.env);
    // for pack command 
    const buildCommand = [native_commands.pack, imageCmd, pathCmd, buildpackCmd, builderCmd, envCmd].flat()
    return [buildCommand]
}

function parse_yaml(filename) {
    try {
        const moduleFile = yaml.load(fs.readFileSync(path.join(process.cwd(), filename), 'utf8'))
        const { repository, modules, tag: globalTag = 'latest' } = moduleFile
        const before_all = moduleFile['before-all'] ? moduleFile['before-all'].map(command => command.trim().split(" ")) : []
        if (!modules) throw new Error("Modules not defined")

        const commands = modules.map((module) => {
            const name = module.name, tag = module.tag || globalTag
            const build_parameters = module['build-parameters']
            const source_image = `${name}:${tag}`;
            const repo_image = `${repository}/${source_image}`;
            //tag command
            const tagCmd = [native_commands.docker, native_commands.tag, source_image, repo_image];
            //push command
            const pushCmd = [native_commands.docker, native_commands.push, repo_image];
            const buildType = keyProcessorMap[Object.keys(build_parameters)]
            if (!buildType) throw new Error(`build-parameters ${Object.keys(build_parameters)} is invalid.`)
            return {
                name,
                tag,
                buildCmd: buildType(build_parameters, name, tag),
                tagCmd,
                pushCmd
            }
        })
        return { commands, before_all, repository };
    } catch (e) {
        console.error(`${font.red}${e.message}${font.reset}`)
        return { commands: [], before_all: [], repsository: '' }
    }
}

module.exports = { parse_yaml };