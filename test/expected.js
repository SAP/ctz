const desired_output = {
   "commands": [
      {
         "name": "bookshop-approuter",
         "tag": "v1",
         "buildCmd": [
            [
               "pack",
               "build",
               "bookshop-approuter",
               "--path",
               "app",
               [
                  "--buildpack",
                  "paketo-buildpacks/nodejs"
               ],
               "--builder",
               "paketobuildpacks/builder-jammy-base",
               "--env",
               "BP_NODE_RUN_SCRIPTS=\"\""
            ]
         ],
         "tagCmd": [
            "docker",
            "tag",
            "bookshop-approuter:v1",
            "docker.io/username/bookshop-approuter:v1"
         ],
         "pushCmd": [
            "docker",
            "push",
            "docker.io/username/bookshop-approuter:v1"
         ]
      },
      {
         "name": "dockerfile-image",
         "tag": "latest",
         "buildCmd": [
            [
               "docker",
               "build",
               "-t",
               "dockerfile-image:latest",
               "-f",
               "dockerfiles/sample.Dockerfile",
               "."
            ]
         ],
         "tagCmd": [
            "docker",
            "tag",
            "dockerfile-image:latest",
            "docker.io/username/dockerfile-image:latest"
         ],
         "pushCmd": [
            "docker",
            "push",
            "docker.io/username/dockerfile-image:latest"
         ]
      },
      {
         "name": "bookshop-hana-deployer",
         "tag": "latest",
         "buildCmd": [
            [
               "pack",
               "build",
               "bookshop-hana-deployer",
               "--path",
               "db",
               "--builder",
               "paketobuildpacks/builder:base"
            ]
         ],
         "tagCmd": [
            "docker",
            "tag",
            "bookshop-hana-deployer:latest",
            "docker.io/username/bookshop-hana-deployer:latest"
         ],
         "pushCmd": [
            "docker",
            "push",
            "docker.io/username/bookshop-hana-deployer:latest"
         ]
      }
   ],
   "before_all": [
      [
         "npx",
         "cds",
         "build",
         "--production"
      ]
   ],
   "repository": "docker.io/username"
}

module.exports = { desired_output }