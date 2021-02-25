const config = {};
module.exports = config;

config.bot = {
  start: {
    msg: 'Hi there. This is a simple Bible Bot made by @dcdunkan from [Bots.DC](https://t.me/dcbots). Either click on the *Start Reading* button or use the /read command to start reading. Check the help, if you need to.\nRead about to get the source code!',
    opts: { parse_mode: 'Markdown', disable_web_page_preview: true, reply_markup: { inline_keyboard: [[ { text: '📖 Start Reading →', callback_data: 'read_1' } ], [{ text: '📚 Help', callback_data: 'help' }, { text: '💬 About', callback_data: 'about' }]] }}
  },
  help: {
    msg: "*Here is what you can do with this simple *[Scripture Bot](https://telegram.me/scripturbot)*!*\nYou can actually read the whole bible inside Telegram in 75+ versions, different languages. That's all.\nAlso, you can send a reference as a message to get that specific part instantly. Also, there might be some little lags. So, please be patient at some points.",
    opts: { parse_mode: 'Markdown', disable_web_page_preview: true, reply_markup: { inline_keyboard: [[ { text: '📖 Read →', callback_data: 'read_1' }, { text: '💬 About', callback_data: 'about' }, { text: '🏡 Home', callback_data: 'home' }], [{ text: '📃 Valid Ref.', callback_data: 'valid_0' }, { text: '⚙️ Set Default', callback_data: 'default' }]] }}
  },
  about: {
    msg: "Created by @dcdunkan from [Bots.DC](https://t.me/dcbots) using getbible.net API, also, [Telegraf](https://telegraf.js.org) in [Node.js](https://nodejs.org).\nBot version: 3.1.\nOpen source repository is now available in github.com/dcdunkan/bible-bot\nMade with ❤️ in memory of my friend *Shamil*.",
    opts: { parse_mode: 'Markdown', disable_web_page_preview: true, reply_markup: { inline_keyboard: [[ { text: '📖 Read →', callback_data: 'read_1' }, { text: '📚 Help', callback_data: 'help' }, { text: '🏡 Home', callback_data: 'home' }], [{ text: '📃 Valid Ref.', callback_data: 'valid_0' }, { text: '⚙️ Set Default', callback_data: 'default' }]] }}
  },
  errors: {
    translation: 'Error while getting translation list! We will be looking upto it. Please try again.',
    book: 'Error while getting books! We will be looking upto it. Please try again.',
    chapter: 'Error while getting chapters! We will be looking upto it. Please try again.',
    verse: 'Error while getting verses! We will be looking upto it. Please try again.',
    text: 'Error while getting the requested reference! We will be looking upto it. Please try again.',
    default: 'Error while getting the default version. Please try again later.'
  },
  valid: {
    bookarray: [
`• Genesis/Gen
• Exodus/Ex
• Leviticus/Lev
• Numbers/Num
• Deuteronomy/Deut
• Joshua/Josh
• Judges/Judg
• Ruth/Rt
• 1 Samuel/1 Sam
• 2 Samuel/2 Sam
• 1 Kings/1 Kings
• 2 Kings/2 Kings
• 1 Chronicles/1 Chron
• 2 Chronicles/2 Chro
• Ezra/Ez
• Nehemiah/Neh
• Esther/Est
• Job/Jb
• Psalms/Ps
• Proverbs/Prov
• Ecclesiastes/Eccles
• Song of Songs/Song`,

`• Isaiah/Isa
• Jeremiah/Jer
• Lamentations/Lam
• Ezekiel/Ezek
• Daniel/Dan
• Hosea/Hos
• Joel/Joel
• Amos/Amos
• Obadiah/Obad
• Jonah/Jonah
• Micah/Mic
• Nahum/Nah
• Habakkuk/Hab
• Zephaniah/Zeph
• Haggai/Hag
• Zechariah/Zech
• Malachi/Mal
• Matthew/Matt
• Mark/Mk
• Luke/Lk
• John/Jn
• Acts/Act
• Romans/Rom
• 1 Corinthians/1 Cor
• 2 Corinthians/2 Cor
• Galatians/Gal
• Ephesians/Eph
• Philippians/Phil
• Colossians/Col
• 1 Thessalonians/1 Thess
• 2 Thessalonians/2 Thess
• 1 Timothy/1 Tim
• 2 Timothy/2 Tim
• Titus/Tit
• Philemon/Philem
• Hebrews/Heb
• James/Jm
• 1 Peter/1 Pet
• 2 Peter/2 Pet
• 1 John/1 Jn
• 2 John/2 Jn
• 3 John/3 Jn
• Jude/Jud
• Revelation/Rev`
]
  }
};

if(process.env.FIREBASE == 'true'){
  if(process.env.FB_APIKEY === undefined || process.env.FB_AUTHDOMAIN === undefined || process.env.FB_DATABASEURL === undefined || process.env.FB_PROJECTID === undefined || process.env.FB_STORAGEBUCKET === undefined || process.env.FB_MESSAGINGSENDERID === undefined || process.env.FB_APPID === undefined){
    config.firebase = { status: false }
    console.log('Firebase is set to be enabled. But some of the or all of the required parameters are undefined in env. Make sure you set all of the parameters which required using the documentation https://github.com/dcdunkan/bible-bot/blob/v3/')
  } else {
    console.log('Firebase is enabled.')
    config.firebase = {
      status: true,
      config: {
        apiKey: process.env.FB_APIKEY,
        authDomain: process.env.FB_AUTHDOMAIN,
        databaseURL: process.env.FB_DATABASEURL,
        projectId: process.env.FB_PROJECTID,
        storageBucket: process.env.FB_STORAGEBUCKET,
        messagingSenderId: process.env.FB_MESSAGINGSENDERID,
        appId: process.env.FB_APPID,
        measurementId: process.env.FB_MEASUREMENTID
      }
    }
  }
} else {
  config.firebase = { status: false }
}
