const http = require('http')
const mineflayer = require('mineflayer')

// ========================================
// CONFIG
// ========================================

const CONFIG = {
  host: 'BlixxPloits.aternos.me',
  port: 15401,

  username: 'LimitedIsTheVoid',
  password: 'devdevdev',

  version: '1.20.1',

  reconnectDelay: 5000,

  // Authentication
  authDelay: 3000,
  loginDelay: 2500,

  // Movement
  movementInterval: 5000,
  jumpInterval: 12000
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
let movementInterval = null
let jumpInterval = null

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
    connectTimeout: 30000
  })

  // ========================================
  // MINECRAFT LOGIN
  // ========================================

  bot.on('login', () => {
    console.log('Minecraft connection established! ✅')
  })

  // ========================================
  // SPAWN
  // ========================================

  bot.on('spawn', () => {
    console.log('BOT SPAWNED! 🎉')

    // ----------------------------------------
    // AUTHME
    // ----------------------------------------

    setTimeout(() => {
      if (!bot.entity) return

      console.log('Trying AuthMe registration...')

      bot.chat(
        `/register ${CONFIG.password} ${CONFIG.password}`
      )

      console.log('Sent: /register <password> <password>')

      // Login after registration attempt
      setTimeout(() => {
        if (!bot.entity) return

        console.log('Trying AuthMe login...')

        bot.chat(`/login ${CONFIG.password}`)

        console.log('Sent: /login <password>')
      }, CONFIG.loginDelay)

    }, CONFIG.authDelay)

    // ----------------------------------------
    // RANDOM MOVEMENT
    // ----------------------------------------

    if (movementInterval) {
      clearInterval(movementInterval)
    }

    movementInterval = setInterval(() => {
      if (!bot.entity) return

      const directions = [
        'forward',
        'back',
        'left',
        'right'
      ]

      const direction =
        directions[Math.floor(Math.random() * directions.length)]

      console.log(`Moving ${direction}`)

      // Stop previous movement
      bot.clearControlStates()

      // Move in random direction
      bot.setControlState(direction, true)

      // Random movement duration
      const duration =
        Math.floor(Math.random() * 3000) + 2000

      setTimeout(() => {
        if (!bot.entity) return

        bot.setControlState(direction, false)
      }, duration)

    }, CONFIG.movementInterval)

    // ----------------------------------------
    // RANDOM JUMPING
    // ----------------------------------------

    if (jumpInterval) {
      clearInterval(jumpInterval)
    }

    jumpInterval = setInterval(() => {
      if (!bot.entity) return

      console.log('Jumping')

      bot.setControlState('jump', true)

      setTimeout(() => {
        if (bot.entity) {
          bot.setControlState('jump', false)
        }
      }, 500)

    }, CONFIG.jumpInterval)
  })

  // ========================================
  // SERVER MESSAGES
  // ========================================

  bot.on('messagestr', (message) => {
    console.log(`[SERVER] ${message}`)
  })

  // ========================================
  // PLAYER CHAT
  // ========================================

  bot.on('chat', (username, message) => {
    if (username === bot.username) return

    console.log(`[CHAT] ${username}: ${message}`)
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
    console.log('Bot disconnected.')

    reconnect('Disconnected')
  })
}

// ========================================
// RECONNECT
// ========================================

function reconnect(reason) {
  if (reconnecting) return

  reconnecting = true

  if (movementInterval) {
    clearInterval(movementInterval)
    movementInterval = null
  }

  if (jumpInterval) {
    clearInterval(jumpInterval)
    jumpInterval = null
  }

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

console.log('Drippy Mineflayer Bot starting...')

createBot()
