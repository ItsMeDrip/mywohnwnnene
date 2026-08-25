const http = require('http')
const mineflayer = require('mineflayer')

// =========================
// RENDER WEB SERVER
// =========================

const WEB_PORT = process.env.PORT || 10000

http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain'
  })

  res.end('Drippy Mineflayer Bot is online!')
}).listen(WEB_PORT, '0.0.0.0', () => {
  console.log(`Web server running on port ${WEB_PORT}`)
})

// =========================
// BOT CONFIG
// =========================

const CONFIG = {
  host: 'BlixxPloits.aternos.me',
  port: 15401,

  username: '_LimitedVoid',
  password: 'devdevdev',

  version: '1.20.1',

  reconnectDelay: 5000,
  antiAfkDelay: 30000
}

// =========================
// VARIABLES
// =========================

let reconnecting = false
let antiAfkInterval = null

// =========================
// CREATE BOT
// =========================

function createBot() {
  reconnecting = false

  console.log('================================')
  console.log('Starting Mineflayer bot...')
  console.log(`Server: ${CONFIG.host}:${CONFIG.port}`)
  console.log(`Username: ${CONFIG.username}`)
  console.log('================================')

  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: CONFIG.version,
    auth: 'offline'
  })

  // =========================
  // CONNECTING
  // =========================

  bot.on('connecting', () => {
    console.log('Connecting to Minecraft server...')
  })

  // =========================
  // LOGIN PACKET
  // =========================

  bot.on('login', () => {
    console.log('Minecraft connection established!')
  })

  // =========================
  // SPAWN
  // =========================

  bot.on('spawn', () => {
    console.log('BOT SPAWNED! 🎉')

    // Start anti-AFK
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

  // =========================
  // CHAT / AUTHME
  // =========================

  bot.on('chat', (username, message) => {
    if (username === bot.username) return

    console.log(`[Chat] ${username}: ${message}`)

    const msg = message.toLowerCase()

    // REGISTER
    if (
      msg.includes('register') &&
      !msg.includes('login')
    ) {
      console.log('AuthMe registration detected!')

      setTimeout(() => {
        bot.chat(`/register ${CONFIG.password} ${CONFIG.password}`)
        console.log('Sent /register command')
      }, 1000)

      return
    }

    // LOGIN
    if (
      msg.includes('login') ||
      msg.includes('log in')
    ) {
      console.log('AuthMe login detected!')

      setTimeout(() => {
        bot.chat(`/login ${CONFIG.password}`)
        console.log('Sent /login command')
      }, 1000)
    }
  })

  // =========================
  // KICKED
  // =========================

  bot.on('kicked', (reason) => {
    console.log('================================')
    console.log('BOT KICKED')
    console.log(reason)
    console.log('================================')

    reconnect('Kicked')
  })

  // =========================
  // ERROR
  // =========================

  bot.on('error', (err) => {
    console.log('================================')
    console.log('MINEFLAYER ERROR')
    console.log(err.message)
    console.log('================================')
  })

  // =========================
  // DISCONNECTED
  // =========================

  bot.on('end', () => {
    console.log('Bot disconnected.')

    reconnect('Disconnected')
  })
}

// =========================
// RECONNECT
// =========================

function reconnect(reason) {
  if (reconnecting) return

  reconnecting = true

  if (antiAfkInterval) {
    clearInterval(antiAfkInterval)
    antiAfkInterval = null
  }

  console.log(
    `${reason}, reconnecting in ${CONFIG.reconnectDelay / 1000} seconds...`
  )

  setTimeout(() => {
    createBot()
  }, CONFIG.reconnectDelay)
}

// =========================
// START BOT
// =========================

console.log('Drippy Mineflayer Bot starting...')

createBot()
