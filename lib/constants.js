const font = {
    bold: "\u001b[1m",
    green: "\u001b[32m",
    red: "\u001b[31m",
    reset: "\x1b[0m"
}

const commandsDescription = `${font.bold} USAGE
    ${font.bold} ctz = ${font.reset}ctz help
    ${font.bold} ctz <filename> <options> = ${font.reset}builds images of all modules and pushes them to remote repository
    
${font.bold} OPTIONS
    ${font.bold} -l |  --log       ${font.reset}logs the standard output in the console
    ${font.bold} -p |  --push      ${font.reset}pushes the images to specified repository
    ${font.bold} -h |  --help      ${font.reset}get detailed usage information
    ${font.bold} -v |  --version   ${font.reset}get version of the package
    ${font.bold} --repository      ${font.reset}repository to push the images to
    ${font.bold} --modules         ${font.reset}list the modules image has to be built for

${font.bold} EXAMPLES${font.reset}
    ctz build.yaml
    ctz build.yaml --log
    ctz build.yaml -l
    ctz build.yaml --push
    ctz build.yaml -p --log
    ctz build.yaml --modules=mod1,mod2
    ctz build.yaml --repository=docker.io/username
`

const native_commands = {
    pack: "pack",
    build: "build",
    builder: "--builder",
    buildpack: "--buildpack",
    path: "--path",
    env: "--env",
    docker: "docker",
    push: "push",
    tag: "tag",
}

const buildpacks = new Set([
    'java',
    'nodejs',
    'sap-machine',
    'executable-jar',
    'spring-boot',
    'syft'
])

const builders = new Set([
    'builder-jammy-base',
    'builder-jammy-buildpackless-base',
    'builder-jammy-full',
    'builder-jammy-buildpackless-full'
])

module.exports = { commandsDescription, native_commands, font, buildpacks, builders }
