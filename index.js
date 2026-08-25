const http = require('http')
const mineflayer = require('mineflayer')

// ========================================
// CONFIG
// ========================================

const CONFIG = {
  host: 'BlixxPloits.aternos.me',
  port: 15401,

  username: '_LimitedVoid',
  password: 'CHANGE_YOUR_PASSWORD',

  version: '1.20.1',

  reconnectDelay: 5000,
  antiAfkDelay: 30000,
  connectionTimeout: 20000
}

// ========================================
// RENDER WEB SERVER
// ========================================

const WEB_PORT = process.env.PORT || 10000

http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain'
  })

  res.end('Drippy Mineflayer Bot is online!')
}).listen(WEB_PORT, '0.0.0.0', () => {
  console.log(`Web server running on port ${WEB_PORT}`)
})

// ========================================
// VARIABLES
// ========================================

let reconnecting = false
let antiAfkInterval = null

// ========================================
// CREATE BOT
// ========================================

function createBot() {
  reconnecting = false

  console.log('')
  console.log('========================================')
  console.log('Starting Mineflayer bot...')
  console.log(`Server: ${CONFIG.host}:${CONFIG.port}`)
  console.log(`Username: ${CONFIG.username}`)
  console.log(`Version: ${CONFIG.version}`)
  console.log('========================================')

  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: CONFIG.version,
    auth: 'offline',
    connectTimeout: CONFIG.connectionTimeout
  })

  let connected = false
  let finished = false

  // ========================================
  // LOGIN / CONNECTION
  // ========================================

  bot.on('login', () => {
    connected = true

    console.log('')
    console.log('Minecraft connection established! ✅')
    console.log('Waiting for server spawn...')
  })

  // ========================================
  // SPAWN
  // ========================================

  bot.on('spawn', () => {
    console.log('')
    console.log('BOT SPAWNED! 🎉')
    console.log('Bot is now in the Minecraft server.')

    if (antiAfkInterval) {
      clearInterval(antiAfkInterval)
    }

    antiAfkInterval = setInterval(() => {
      if (!bot.entity) return

      console.log('Anti-AFK jump')

      bot.setControlState('jump', true)

      setTimeout(() => {
        if (bot.entity) {
          bot.setControlState('jump', false)
        }
      }, 500)

    }, CONFIG.antiAfkDelay)
  })

  // ========================================
  // AUTHME CHAT
  // ========================================

  bot.on('chat', (username, message) => {
    if (username === bot.username) return

    console.log(`[CHAT] ${username}: ${message}`)

    const msg = message.toLowerCase()

    // ----------------------------------------
    // REGISTER
    // ----------------------------------------

    if (
      msg.includes('register') &&
      !msg.includes('login')
    ) {
      console.log('AuthMe registration detected!')

      setTimeout(() => {
        if (!bot.entity) return

        bot.chat(
          `/register ${CONFIG.password} ${CONFIG.password}`
        )

        console.log('Sent: /register <password> <password>')
      }, 1000)

      return
    }

    // ----------------------------------------
    // LOGIN
    // ----------------------------------------

    if (
      msg.includes('login') ||
      msg.includes('log in')
    ) {
      console.log('AuthMe login detected!')

      setTimeout(() => {
        if (!bot.entity) return

        bot.chat(`/login ${CONFIG.password}`)

        console.log('Sent: /login <password>')
      }, 1000)
    }
  })

  // ========================================
  // KICKED
  // ========================================

  bot.on('kicked', (reason) => {
    console.log('')
    console.log('========================================')
    console.log('BOT KICKED ❌')
    console.log(reason)
    console.log('========================================')

    reconnect('Kicked')
  })

  // ========================================
  // ERROR
  // ========================================

  bot.on('error', (err) => {
    console.log('')
    console.log('========================================')
    console.log('MINEFLAYER ERROR ❌')
    console.log(err.message)
    console.log('========================================')
  })

  // ========================================
  // DISCONNECTED
  // ========================================

  bot.on('end', () => {
    console.log('')
    console.log('BOT CONNECTION ENDED')

    reconnect('Disconnected')
  })

  // ========================================
  // CONNECTION TIMEOUT
  // ========================================

  setTimeout(() => {
    if (!connected && !finished) {
      console.log('')
      console.log('========================================')
      console.log('CONNECTION TIMEOUT ❌')
      console.log(`Could not connect within ${CONFIG.connectionTimeout / 1000} seconds.`)
      console.log('')
      console.log(`Server: ${CONFIG.host}:${CONFIG.port}`)
      console.log('')
      console.log('CHECK:')
      console.log('1. Is the Aternos server ONLINE?')
      console.log('2. Is the IP correct?')
      console.log('3. Is the PORT correct?')
      console.log('4. Is the server running Minecraft 1.20.1?')
      console.log('========================================')

      finished = true

      try {
        bot.end()
      } catch (err) {
        console.log('Could not close bot connection.')
      }
    }
  }, CONFIG.connectionTimeout + 1000)
}

// ========================================
// RECONNECT
// ========================================

function reconnect(reason) {
  if (reconnecting) {
    return
  }

  reconnecting = true

  if (antiAfkInterval) {
    clearInterval(antiAfkInterval)
    antiAfkInterval = null
  }

  console.log('')
  console.log(
    `${reason}, reconnecting in ${CONFIG.reconnectDelay / 1000} seconds...`
  )

  setTimeout(() => {
    createBot()
  }, CONFIG.reconnectDelay)
}

// ========================================
// START
// ========================================

console.log('')
console.log('========================================')
console.log('Drippy Mineflayer Bot starting...')
console.log('========================================')

createBot()
