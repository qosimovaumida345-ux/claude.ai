#!/usr/bin/env node
// Claude Fan-Made CLI v1.1.0

const readline = require('readline')
const https = require('https')
const fs = require('fs')
const path = require('path')

// ── Ranglar ──────────────────────────────────────
const C = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  cyan:    '\x1b[36m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  red:     '\x1b[31m',
  magenta: '\x1b[35m',
}

// ── Provayderlar ─────────────────────────────────
const PROVIDERS = {
  openrouter: {
    hostname: 'openrouter.ai',
    path: '/api/v1/chat/completions',
    model: 'minimax/minimax-m2.5:free',
    label: 'OpenRouter (MiniMax M2.5 - bepul)',
  },
  cerebras: {
    hostname: 'api.cerebras.ai',
    path: '/v1/chat/completions',
    model: 'llama3.1-8b',
    label: 'Cerebras (Llama 3.1 8B - bepul)',
  }
}

// ── Config ────────────────────────────────────────
const CONFIG_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE || '.',
  '.claude-cli.json'
)

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))
    }
  } catch {}
  return null
}

function saveConfig(cfg) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2))
}

// ── API chaqiruv ──────────────────────────────────
function callAPI(messages, cfg) {
  return new Promise(function(resolve, reject) {
    const provider = PROVIDERS[cfg.provider]

    const bodyObj = {
      model: provider.model,
      messages: messages,
      stream: true,
      max_tokens: 8192
    }
    const bodyStr = JSON.stringify(bodyObj)

    const headers = {
      'Authorization': 'Bearer ' + cfg.apiKey,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(bodyStr)
    }

    // OpenRouter uchun qo'shimcha headerlar
    if (cfg.provider === 'openrouter') {
      headers['HTTP-Referer'] = 'https://claude-ai-8iev.onrender.com'
      headers['X-Title'] = 'Claude Fan-Made CLI'
    }

    const options = {
      hostname: provider.hostname,
      path: provider.path,
      method: 'POST',
      headers: headers
    }

    let fullText = ''
    let buffer = ''

    const req = https.request(options, function(res) {
      if (res.statusCode !== 200) {
        let errBody = ''
        res.on('data', function(c) { errBody += c.toString() })
        res.on('end', function() {
          reject(new Error('API xato ' + res.statusCode + ': ' + errBody))
        })
        return
      }

      res.on('data', function(chunk) {
        buffer += chunk.toString()
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line.startsWith('data:')) continue
          const data = line.slice(5).trim()
          if (!data || data === '[DONE]') continue
          try {
            const json = JSON.parse(data)
            const delta =
              (json.choices && json.choices[0] && json.choices[0].delta && json.choices[0].delta.content) || ''
            if (delta) {
              fullText += delta
              process.stdout.write(delta)
            }
          } catch (e) {}
        }
      })

      res.on('end', function() {
        process.stdout.write('\n')
        resolve(fullText)
      })

      res.on('error', reject)
    })

    req.on('error', reject)
    req.write(bodyStr)
    req.end()
  })
}

// ── Fayllarni aniqlash ────────────────────────────
function extractFiles(text) {
  const results = []
  const seen = new Set()

  // Format: ```til:fayl/nomi.ext
  const r1 = /```[a-zA-Z0-9]*:([^\n`]+)\n([\s\S]*?)```/g
  let m
  while ((m = r1.exec(text)) !== null) {
    const p = m[1].trim(), c = m[2].trim()
    if (p && c && !p.includes(' ') && !seen.has(p)) {
      seen.add(p); results.push({ path: p, code: c })
    }
  }

  // Format: ```\n// file: fayl/nomi
  const r2 = /```[a-zA-Z0-9]*\n\/\/\s*(?:file|FILE|fayl):\s*([^\n]+)\n([\s\S]*?)```/g
  while ((m = r2.exec(text)) !== null) {
    const p = m[1].trim(), c = m[2].trim()
    if (p && c && !seen.has(p)) {
      seen.add(p); results.push({ path: p, code: c })
    }
  }

  // Format: ### fayl.ext
  const r3 = /###\s+([^\n]+\.\w+)\n```[^\n]*\n([\s\S]*?)```/g
  while ((m = r3.exec(text)) !== null) {
    const p = m[1].trim(), c = m[2].trim()
    if (p && c && !seen.has(p)) {
      seen.add(p); results.push({ path: p, code: c })
    }
  }

  return results
}

// ── Fayllarni yozish ──────────────────────────────
function writeFiles(files, workDir) {
  if (!files.length) return
  console.log('\n' + C.yellow + C.bold + '📁 Yaratilgan fayllar:' + C.reset)
  files.forEach(function(f) {
    const fullPath = path.resolve(workDir, f.path)
    try {
      fs.mkdirSync(path.dirname(fullPath), { recursive: true })
      fs.writeFileSync(fullPath, f.code, 'utf-8')
      console.log('  ' + C.green + '✓' + C.reset + ' ' + C.cyan + f.path + C.reset +
        C.dim + ' (' + f.code.split('\n').length + ' qator)' + C.reset)
    } catch (err) {
      console.log('  ' + C.red + '✗' + C.reset + ' ' + f.path + ' — ' + err.message)
    }
  })
  console.log('')
}

// ── Sozlash ───────────────────────────────────────
function runSetup(rl, done) {
  console.log('\n' + C.yellow + C.bold + '⚙️  Sozlash' + C.reset + '\n')
  console.log('Qaysi provayderr ishlatmoqchisiz?\n')
  console.log('  ' + C.cyan + '1' + C.reset + ' — OpenRouter  (MiniMax M2.5:free) — ' + C.green + 'TAVSIYA' + C.reset)
  console.log('     API kalit: https://openrouter.ai/keys')
  console.log('     Saytingizda OPENROUTER_API_KEY borku — uni ishlating!\n')
  console.log('  ' + C.cyan + '2' + C.reset + ' — Cerebras    (Llama 3.1 8B)')
  console.log('     API kalit: https://cloud.cerebras.ai\n')

  rl.question(C.cyan + 'Tanlang (1 yoki 2): ' + C.reset, function(choice) {
    const provider = choice.trim() === '2' ? 'cerebras' : 'openrouter'
    const p = PROVIDERS[provider]

    console.log('\n' + C.dim + 'Tanlandi: ' + p.label + C.reset)
    rl.question(C.cyan + 'API kalitingiz: ' + C.reset, function(key) {
      const apiKey = key.trim()
      if (!apiKey) {
        console.log(C.red + 'Kalit kiritilmadi!' + C.reset)
        process.exit(1)
      }

      console.log(C.dim + '\nTekshirilmoqda...' + C.reset)

      callAPI([{ role: 'user', content: 'hi' }], { provider, apiKey })
        .then(function() {
          const cfg = { provider, apiKey }
          saveConfig(cfg)
          console.log('\n' + C.green + '✓ API kalit ishlaydi! Saqlandi.' + C.reset + '\n')
          done(cfg)
        })
        .catch(function(err) {
          console.log('\n' + C.red + '✗ API kalit xato: ' + err.message + C.reset)
          console.log(C.yellow + 'Kalitni tekshirib qayta urinib ko\'ring.' + C.reset)
          process.exit(1)
        })
    })
  })
}

// ── Banner ────────────────────────────────────────
function banner() {
  console.log(
    '\n' + C.cyan + C.bold +
    '  ╔══════════════════════════════════════╗\n' +
    '  ║    Claude Fan-Made CLI  v1.1.0       ║\n' +
    '  ║    Fayl yaratuvchi AI assistant      ║\n' +
    '  ╚══════════════════════════════════════╝' +
    C.reset + '\n'
  )
  console.log(
    '  ' + C.dim + 'Buyruqlar:' + C.reset +
    '\n  ' + C.cyan + '/papka <yo\'l>' + C.reset + '  — ishchi papkani o\'zgartirish' +
    '\n  ' + C.cyan + '/qaerda' + C.reset + '       — joriy papkani ko\'rish' +
    '\n  ' + C.cyan + '/model' + C.reset + '        — provayderr va model ni ko\'rish' +
    '\n  ' + C.cyan + '/qayta' + C.reset + '        — API kalitni qayta sozlash' +
    '\n  ' + C.cyan + '/tozala' + C.reset + '       — ekranni tozalash' +
    '\n  ' + C.cyan + '/chiqish' + C.reset + '      — dasturdan chiqish\n'
  )
}

// ── System prompt ─────────────────────────────────
const SYSTEM = `Siz Claude Fan-Made CLI yordamchisisiz. Foydalanuvchi fayl yaratishni so'rasa, ALBATTA quyidagi formatdan foydalaning:

\`\`\`til:fayl/manzili.kengaytma
kod bu yerda
\`\`\`

Misol:
\`\`\`typescript:src/components/Button.tsx
import React from 'react'
export const Button = () => <button>Bosing</button>
\`\`\`

Har bir fayl uchun to'liq va ishlaydigan kod yozing. O'zbekcha so'rasalar o'zbekcha javob bering.`

// ── Chat ──────────────────────────────────────────
function startChat(cfg, workDir) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const history = []
  const p = PROVIDERS[cfg.provider]

  console.log(C.dim + '📂 Papka: ' + C.cyan + workDir + C.reset)
  console.log(C.dim + '🤖 Model: ' + C.magenta + p.model + C.reset + '\n')

  function ask() {
    rl.question(C.bold + 'Siz' + C.reset + C.dim + ' › ' + C.reset, function(input) {
      const text = input.trim()
      if (!text) { ask(); return }

      if (text === '/chiqish' || text === '/exit') {
        console.log('\n' + C.cyan + 'Xayr! 👋' + C.reset + '\n')
        rl.close(); process.exit(0)
      }

      if (text === '/tozala') {
        console.clear(); banner()
        console.log(C.dim + '📂 ' + workDir + C.reset + '\n')
        ask(); return
      }

      if (text === '/qaerda') {
        console.log('\n' + C.cyan + '📂 ' + workDir + C.reset + '\n')
        ask(); return
      }

      if (text === '/model') {
        console.log('\n' + C.magenta + '🤖 ' + p.label + C.reset)
        console.log(C.dim + '   model: ' + p.model + C.reset + '\n')
        ask(); return
      }

      if (text === '/qayta') {
        rl.close()
        const rl2 = readline.createInterface({ input: process.stdin, output: process.stdout })
        runSetup(rl2, function(newCfg) {
          rl2.close()
          startChat(newCfg, workDir)
        })
        return
      }

      if (text.startsWith('/papka ')) {
        const newDir = path.resolve(text.slice(7).trim())
        if (fs.existsSync(newDir)) {
          workDir = newDir
          console.log('\n' + C.green + '✓ Papka: ' + C.cyan + workDir + C.reset + '\n')
        } else {
          console.log('\n' + C.red + 'Papka topilmadi: ' + newDir + C.reset + '\n')
        }
        ask(); return
      }

      // AI ga yuborish
      history.push({ role: 'user', content: text })
      const messages = [{ role: 'system', content: SYSTEM }].concat(history)

      process.stdout.write('\n' + C.cyan + C.bold + 'Claude' + C.reset + ' ')

      callAPI(messages, cfg)
        .then(function(response) {
          history.push({ role: 'assistant', content: response })
          writeFiles(extractFiles(response), workDir)
          ask()
        })
        .catch(function(err) {
          console.log('\n' + C.red + 'Xato: ' + err.message + C.reset + '\n')
          history.pop()
          ask()
        })
    })
  }

  ask()
}

// ── Main ──────────────────────────────────────────
function main() {
  const workDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd()
  banner()

  const cfg = loadConfig()
  if (cfg && cfg.apiKey && cfg.provider) {
    startChat(cfg, workDir)
  } else {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    runSetup(rl, function(newCfg) {
      rl.close()
      startChat(newCfg, workDir)
    })
  }
}

main()