import 'dotenv/config'
import { bootServer } from './app'

bootServer().catch(e => {
  console.log('Something went wrong while booting up the server...')
})