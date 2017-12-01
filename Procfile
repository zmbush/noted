server: yarn nodemon -e js,jsx src/index.js -w src --exec babel-node src/index.js --source-maps
webpack: yarn webpack --color=true -w
relay: yarn relay --watch
schema: yarn nodemon -e js,jsx -w tools/writeSchema.js -w src/graphql --exec yarn update-schema
lint: yarn nodemon -e js,jsx -w ui -w src --exec 'yarn lint; exit 0'
