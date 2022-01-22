import 'dotenv/config' // used to expose the .env variables as soon as possible
import { init, Collection, connect } from 'mongodb-helper'
import { env_variables } from '../src/config'

const collections: Array<Collection> = [
  { name: 'Logs', indexes: [], dataSourcePath: `${__dirname}/data/Logs.json` }
];

(async () => {
  const client = await connect(env_variables.DATABASE.url, env_variables.DATABASE.name)

  await init(client, env_variables.DATABASE.name, collections)

  // close this script
  process.exit(0)
})()

