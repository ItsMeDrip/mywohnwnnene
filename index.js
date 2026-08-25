

const http = require('http')

const PORT = process.env.PORT || 10000

http.createServer((req, res) => {
  res.writeHead(200)
  res.end('Drippy Mineflayer Bot is online!')
}).listen(PORT, '0.0.0.0', () => {
  console.log(`Web server running on port ${PORT}`)
})





const mineflayer = require('mineflayer')

const CONFIG = {
  host: 'BlixxPloits.aternos.me',
  port: 15401,
  username: '_LimitedVoid',
  password: 'devdevdev',
  version: '1.20.1'
}

let reconnecting = false
let antiAfkInterval = null

function createBot() {
  reconnecting = false

  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: CONFIG.version,
    auth: 'offline'
  })

  function reconnect(reason) {
    if (reconnecting) return
    reconnecting = true

    if (antiAfkInterval) {
      clearInterval(antiAfkInterval)
      antiAfkInterval = null
    }

    console.log(`${reason}, reconnecting in 5 seconds...`)
    setTimeout(createBot, 5000)
  }

  bot.on('spawn', () => {
    console.log('Bot spawned!')

    antiAfkInterval = setInterval(() => {
      bot.setControlState('jump', true)

      setTimeout(() => {
        if (bot.entity) {
          bot.setControlState('jump', false)
        }
      }, 500)
    }, 30000)
  })

  bot.on('chat', (username, message) => {
    if (username === bot.username) return

    console.log(`[Chat] ${username}: ${message}`)

    const msg = message.toLowerCase()

    // AuthMe registration request
    if (
      msg.includes('register') &&
      !msg.includes('login')
    ) {
      console.log('AuthMe wants registration...')
      bot.chat(`/register ${CONFIG.password} ${CONFIG.password}`)
    }

    // AuthMe login request
    if (
      msg.includes('login') ||
      msg.includes('log in')
    ) {
      console.log('AuthMe wants login...')
      bot.chat(`/login ${CONFIG.password}`)
    }
  })

  bot.on('kicked', (reason) => {
    console.log('Bot was kicked:', reason)
    reconnect('Kicked')
  })

  bot.on('error', (err) => {
    console.log('Error:', err.message)
  })

  bot.on('end', () => {
    reconnect('Disconnected')
  })
}

createBot()
