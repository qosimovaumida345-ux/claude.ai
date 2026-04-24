#!/usr/bin/env node
// Claude Fan-Made CLI v1.0.1 — To'g'rilangan versiya

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
  gray:    '\x1b[90m',
}

// ── Config fayli (~/.claude-cli.json) ────────────
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

// ── API chaqiruv (Cerebras) ───────────────────────
function callAPI(messages, apiKey) {
  return new Promise((resolve, reject) => {
    const bodyObj = {
      model: 'llama3.3-70b',
      messages: messages,
      stream: true,
      max_tokens: 8192
    }
    const bodyStr = JSON.stringify(bodyObj)

    const options = {
      hostname: 'api.cerebras.ai',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr)
      }
    }

    let fullText = ''
    let buffer = ''

    const req = https.request(options, function(res) {
      // Agar xato status bo'lsa
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
            const delta = (json.choices &&
                          json.choices[0] &&
                          json.choices[0].delta &&
                          json.choices[0].delta.content) || ''
            if (delta) {
              fullText += delta
              process.stdout.write(delta)
            }
          } catch (e) {
            // broken SSE line — o'tkazib yuborish
          }
        }
      })

      res.on('end', function() {
        process.stdout.write('\n')
        resolve(fullText)
      })

      res.on('error', reject)
    })

    req.on('error', function(err) {
      reject(err)
    })

    req.write(bodyStr)
    req.end()
  })
}

// ── Fayllarni aniqlash ────────────────────────────
// AI javobidagi kod bloklaridan fayl nomi va kodni topadi
function extractFiles(text) {
  const results = []
  const seen = new Set()

  // Format 1: ```til:fayl/nomi.ext\nkod\n```
  const regex1 = /```[a-zA-Z0-9]*:([^\n`]+)\n([\s\S]*?)```/g
  let m
  while ((m = regex1.exec(text)) !== null) {
    const filePath = m[1].trim()
    const code = m[2].trim()
    if (filePath && code && !seen.has(filePath)) {
      seen.add(filePath)
      results.push({ path: filePath, code: code })
    }
  }

  // Format 2: ```til\n// file: fayl/nomi.ext\nkod\n```
  const regex2 = /```[a-zA-Z0-9]*\n\/\/\s*(?:file|FILE|fayl):\s*([^\n]+)\n([\s\S]*?)```/g
  while ((m = regex2.exec(text)) !== null) {
    const filePath = m[1].trim()
    const code = m[2].trim()
    if (filePath && code && !seen.has(filePath)) {
      seen.add(filePath)
      results.push({ path: filePath, code: code })
    }
  }

  // Format 3: ### fayl.ext\n```\nkod\n```
  const regex3 = /###\s+([^\n]+\.\w+)\n```[^\n]*\n([\s\S]*?)```/g
  while ((m = regex3.exec(text)) !== null) {
    const filePath = m[1].trim()
    const code = m[2].trim()
    if (filePath && code && !seen.has(filePath)) {
      seen.add(filePath)
      results.push({ path: filePath, code: code })
    }
  }

  return results
}

// ── Fayllarni diskka yozish ───────────────────────
function writeFiles(files, workDir) {
  if (files.length === 0) return

  console.log('\n' + C.yellow + C.bold + '📁 Yaratilgan fayllar:' + C.reset)
  for (let i = 0; i < files.length; i++) {
    const f = files[i]
    const fullPath = path.resolve(workDir, f.path)
    const dir = path.dirname(fullPath)
    try {
      fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(fullPath, f.code, 'utf-8')
      const lines = f.code.split('\n').length
      console.log('  ' + C.green + '✓' + C.reset + ' ' + C.cyan + f.path + C.reset +
                  C.dim + ' (' + lines + ' qator)' + C.reset)
    } catch (err) {
      console.log('  ' + C.red + '✗' + C.reset + ' ' + f.path + ' — ' + err.message)
    }
  }
  console.log('')
}

// ── Boshlang'ich sozlash ──────────────────────────
function setupConfig(rl, callback) {
  console.log('\n' + C.yellow + C.bold + '⚙️  Birinchi marta sozlash' + C.reset)
  console.log(C.dim + 'Cerebras API kalit olish: https://cloud.cerebras.ai (bepul)' + C.reset + '\n')

  rl.question(C.cyan + 'API kalitingiz: ' + C.reset, function(input) {
    const key = input.trim()
    if (!key) {
      console.log(C.red + 'Kalit kiritilmadi. Qayta ishga tushiring.' + C.reset)
      process.exit(1)
    }

    // Kalitni sinab ko'rish
    console.log(C.dim + 'Tekshirilmoqda...' + C.reset)
    const testMessages = [{ role: 'user', content: 'hi' }]

    callAPI(testMessages, key)
      .then(function() {
        saveConfig({ apiKey: key })
        console.log('\n' + C.green + '✓ API kalit to\'g\'ri! Sozlamalar saqlandi.' + C.reset + '\n')
        callback(key)
      })
      .catch(function(err) {
        console.log('\n' + C.red + '✗ API kalit xato: ' + err.message + C.reset)
        console.log(C.yellow + 'Kalitni tekshirib qayta urinib ko\'ring.' + C.reset)
        process.exit(1)
      })
  })
}

// ── Banner ────────────────────────────────────────
function printBanner() {
  console.log(
    '\n' + C.cyan + C.bold +
    '  ╔══════════════════════════════════════╗\n' +
    '  ║    Claude Fan-Made CLI  v1.0.1       ║\n' +
    '  ║    Fayl yaratuvchi AI assistant      ║\n' +
    '  ╚══════════════════════════════════════╝' +
    C.reset
  )
  console.log(
    '\n  ' + C.dim + 'Buyruqlar:' + C.reset +
    '\n  ' + C.cyan + '/papka <yo\'l>' + C.reset + '  — fayllar yaratiladigan papkani o\'zgartirish' +
    '\n  ' + C.cyan + '/qaerda' + C.reset + '       — joriy papkani ko\'rish' +
    '\n  ' + C.cyan + '/tozala' + C.reset + '       — ekranni tozalash' +
    '\n  ' + C.cyan + '/chiqish' + C.reset + '      — dasturdan chiqish' +
    '\n'
  )
}

// ── System prompt ─────────────────────────────────
const SYSTEM = [
  'Siz Claude Fan-Made CLI yordamchisisiz.',
  'Foydalanuvchi fayl yaratishni so\'rasa, ALBATTA quyidagi formatdan foydalaning:',
  '',
  '```til:fayl/manzili.kengaytma',
  'kod bu yerda',
  '```',
  '',
  'Misol:',
  '```typescript:src/components/Button.tsx',
  'import React from \'react\'',
  'export const Button = () => <button>Bosing</button>',
  '```',
  '',
  'Har bir fayl uchun to\'liq va ishlaydigan kod yozing.',
  'O\'zbekcha so\'rasalar o\'zbekcha, ruscha so\'rasalar ruscha javob bering.'
].join('\n')

// ── Asosiy dastur ─────────────────────────────────
function startChat(apiKey, workDir) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  // Suhbat tarixi
  const history = []

  console.log(C.dim + '📂 Ishchi papka: ' + C.cyan + workDir + C.reset + '\n')

  function ask() {
    rl.question(C.bold + 'Siz' + C.reset + C.dim + ' › ' + C.reset, function(input) {
      const text = input.trim()

      if (!text) {
        ask()
        return
      }

      // Buyruqlar
      if (text === '/chiqish' || text === '/exit') {
        console.log('\n' + C.cyan + 'Xayr! 👋' + C.reset + '\n')
        rl.close()
        process.exit(0)
        return
      }

      if (text === '/tozala' || text === '/clear') {
        console.clear()
        printBanner()
        ask()
        return
      }

      if (text === '/qaerda') {
        console.log('\n' + C.cyan + '📂 ' + workDir + C.reset + '\n')
        ask()
        return
      }

      if (text.startsWith('/papka ')) {
        const newDir = path.resolve(text.slice(7).trim())
        if (fs.existsSync(newDir)) {
          workDir = newDir
          console.log('\n' + C.green + '✓ Papka o\'zgartirildi: ' + C.cyan + workDir + C.reset + '\n')
        } else {
          console.log('\n' + C.red + 'Papka topilmadi: ' + newDir + C.reset + '\n')
        }
        ask()
        return
      }

      // AI ga yuborish
      history.push({ role: 'user', content: text })

      // System + tarix
      const messages = [{ role: 'system', content: SYSTEM }].concat(history)

      process.stdout.write('\n' + C.cyan + C.bold + 'Claude' + C.reset + ' ')

      callAPI(messages, apiKey)
        .then(function(response) {
          history.push({ role: 'assistant', content: response })

          // Fayllarni aniqlash va yaratish
          const files = extractFiles(response)
          writeFiles(files, workDir)

          ask()
        })
        .catch(function(err) {
          console.log('\n' + C.red + 'Xato: ' + err.message + C.reset + '\n')
          // Oxirgi xabarni tarixdan olib tashlash
          history.pop()
          ask()
        })
    })
  }

  ask()
}

// ── Ishga tushirish ───────────────────────────────
function main() {
  // Ishchi papka: argument berilsa u, aks holda joriy papka
  const workDir = process.argv[2]
    ? path.resolve(process.argv[2])
    : process.cwd()

  printBanner()

  const cfg = loadConfig()

  if (cfg && cfg.apiKey) {
    // Config bor — to'g'ridan ishga tushirish
    startChat(cfg.apiKey, workDir)
  } else {
    // Config yo'q — sozlash
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    setupConfig(rl, function(apiKey) {
      rl.close()
      startChat(apiKey, workDir)
    })
  }
}

main()