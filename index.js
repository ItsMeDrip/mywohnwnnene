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

  // Reconnect
  reconnectDelay: 5000,

  // Authentication
  authDelay: 3000,
  loginDelay: 2500,

  // Movement
  movementInterval: 5000,
  jumpInterval: 12000,

  // If the bot hasn't connected within this time,
  // force a reconnect attempt.
  connectionTimeout: 45000,

  // Watchdog checks the connection this often
  watchdogInterval: 10000
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

let bot = null

let reconnecting = false
let connected = false
let spawned = false

let movementInterval = null
let jumpInterval = null
let watchdogInterval = null
let connectionTimer = null

// ========================================
// CLEAR TIMERS
// ========================================

function clearBotTimers() {
  if (movementInterval) {
    clearInterval(movementInterval)
    movementInterval = null
  }

  if (jumpInterval) {
    clearInterval(jumpInterval)
    jumpInterval = null
  }

  if (watchdogInterval) {
    clearInterval(watchdogInterval)
    watchdogInterval = null
  }

  if (connectionTimer) {
    clearTimeout(connectionTimer)
    connectionTimer = null
  }
}

// ========================================
// CREATE BOT
// ========================================

function createBot() {
  if (reconnecting === false) {
    console.log('')
  }

  reconnecting = false
  connected = false
  spawned = false

  clearBotTimers()

  console.log('========================================')
  console.log('Starting Mineflayer bot...')
  console.log(`Server: ${CONFIG.host}:${CONFIG.port}`)
  console.log(`Username: ${CONFIG.username}`)
  console.log(`Version: ${CONFIG.version}`)
  console.log('========================================')

  // ========================================
  // CREATE NEW BOT
  // ========================================

  const newBot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: CONFIG.version,
    auth: 'offline',
    connectTimeout: 30000
  })

  bot = newBot

  // ========================================
  // CONNECTION TIMEOUT
  // ========================================

  connectionTimer = setTimeout(() => {
    if (bot !== newBot) return

    if (!connected) {
      console.log('')
      console.log('========================================')
      console.log('CONNECTION TIMEOUT ⚠️')
      console.log('Bot did not connect within 45 seconds.')
      console.log('Forcing reconnect...')
      console.log('========================================')

      reconnect('Connection timeout')
    }
  }, CONFIG.connectionTimeout)

  // ========================================
  // LOGIN
  // ========================================

  newBot.on('login', () => {
    if (bot !== newBot) return

    connected = true

    if (connectionTimer) {
      clearTimeout(connectionTimer)
      connectionTimer = null
    }

    console.log('')
    console.log('========================================')
    console.log('Minecraft connection established! ✅')
    console.log('========================================')
  })

  // ========================================
  // SPAWN
  // ========================================

  newBot.on('spawn', () => {
    if (bot !== newBot) return

    spawned = true

    console.log('')
    console.log('========================================')
    console.log('BOT SPAWNED! 🎉')
    console.log('========================================')

    // ========================================
    // AUTHME
    // ========================================

    setTimeout(() => {
      if (bot !== newBot || !newBot.entity) return

      console.log('Trying AuthMe registration...')

      try {
        newBot.chat(
          `/register ${CONFIG.password} ${CONFIG.password}`
        )

        console.log('Sent: /register <password> <password>')
      } catch (err) {
        console.log('Could not send register command:', err.message)
      }

      // Login after registration attempt
      setTimeout(() => {
        if (bot !== newBot || !newBot.entity) return

        console.log('Trying AuthMe login...')

        try {
          newBot.chat(`/login ${CONFIG.password}`)

          console.log('Sent: /login <password>')
        } catch (err) {
          console.log('Could not send login command:', err.message)
        }

      }, CONFIG.loginDelay)

    }, CONFIG.authDelay)

    // ========================================
    // RANDOM MOVEMENT
    // ========================================

    if (movementInterval) {
      clearInterval(movementInterval)
    }

    movementInterval = setInterval(() => {
      if (bot !== newBot) return
      if (!newBot.entity) return

      const directions = [
        'forward',
        'back',
        'left',
        'right'
      ]

      const direction =
        directions[Math.floor(Math.random() * directions.length)]

      console.log(`Moving ${direction}`)

      try {
        newBot.clearControlStates()

        newBot.setControlState(direction, true)

        const duration =
          Math.floor(Math.random() * 3000) + 2000

        setTimeout(() => {
          if (bot !== newBot) return
          if (!newBot.entity) return

          try {
            newBot.setControlState(direction, false)
          } catch (err) {}
        }, duration)

      } catch (err) {
        console.log('Movement error:', err.message)
      }

    }, CONFIG.movementInterval)

    // ========================================
    // RANDOM JUMPING
    // ========================================

    if (jumpInterval) {
      clearInterval(jumpInterval)
    }

    jumpInterval = setInterval(() => {
      if (bot !== newBot) return
      if (!newBot.entity) return

      console.log('Jumping')

      try {
        newBot.setControlState('jump', true)

        setTimeout(() => {
          if (bot !== newBot) return
          if (!newBot.entity) return

          try {
            newBot.setControlState('jump', false)
          } catch (err) {}
        }, 500)

      } catch (err) {
        console.log('Jump error:', err.message)
      }

    }, CONFIG.jumpInterval)
  })

  // ========================================
  // SERVER MESSAGES
  // ========================================

  newBot.on('messagestr', (message) => {
    if (bot !== newBot) return

    console.log(`[SERVER] ${message}`)
  })

  // ========================================
  // PLAYER CHAT
  // ========================================

  newBot.on('chat', (username, message) => {
    if (bot !== newBot) return
    if (username === newBot.username) return

    console.log(`[CHAT] ${username}: ${message}`)
  })

  // ========================================
  // KICKED
  // ========================================

  newBot.on('kicked', (reason) => {
    if (bot !== newBot) return

    console.log('')
    console.log('========================================')
    console.log('BOT KICKED ❌')
    console.log('Reason:')
    console.log(reason)
    console.log('========================================')

    reconnect('Kicked')
  })

  // ========================================
  // ERROR
  // ========================================

  newBot.on('error', (err) => {
    if (bot !== newBot) return

    console.log('')
    console.log('========================================')
    console.log('MINEFLAYER ERROR ❌')
    console.log(err.message)
    console.log('========================================')

    // IMPORTANT:
    // Some connection errors don't immediately
    // trigger "end", so reconnect here too.
    if (!connected) {
      reconnect('Connection error')
    }
  })

  // ========================================
  // DISCONNECTED
  // ========================================

  newBot.on('end', () => {
    if (bot !== newBot) return

    console.log('')
    console.log('========================================')
    console.log('BOT DISCONNECTED 🔌')
    console.log('========================================')

    reconnect('Disconnected')
  })

  // ========================================
  // EXTRA WATCHDOG
  // ========================================

  watchdogInterval = setInterval(() => {
    if (bot !== newBot) return

    // Bot hasn't even connected
    if (!connected) {
      console.log(
        '⚠️ Watchdog: bot is not connected.'
      )

      reconnect('Watchdog detected no connection')

      return
    }

    // Bot connected but somehow lost its entity
    if (connected && !newBot.entity) {
      console.log(
        '⚠️ Watchdog: connection exists but bot entity is missing.'
      )

      reconnect('Watchdog detected missing entity')
    }

  }, CONFIG.watchdogInterval)
}

// ========================================
// RECONNECT
// ========================================

function reconnect(reason) {
  if (reconnecting) {
    console.log(
      `Reconnect already scheduled. Ignoring: ${reason}`
    )

    return
  }

  reconnecting = true
  connected = false
  spawned = false

  console.log('')
  console.log('========================================')
  console.log(`RECONNECT REQUEST: ${reason}`)
  console.log(`Reconnecting in ${CONFIG.reconnectDelay / 1000} seconds...`)
  console.log('========================================')

  clearBotTimers()

  // Stop movement on old bot
  if (bot) {
    try {
      bot.clearControlStates()
    } catch (err) {}
  }

  setTimeout(() => {
    console.log('')
    console.log('Attempting to reconnect... 🔄')

    createBot()

  }, CONFIG.reconnectDelay)
}

// ========================================
// START
// ========================================

console.log('========================================')
console.log('Drippy Mineflayer Bot starting...')
console.log('========================================')

createBot()
