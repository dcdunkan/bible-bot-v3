require('dotenv').config()
const config = require('./config')
// Bot
const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN, { telegram: { webhookReply: false }})
const log = console.log;

// Custom helpers
const { getTranslations, getBooks, getChapters, getVerses, getTranslationsDefault } = require('./helpers/data-retrieve')
const { getBookDetails } = require('./helpers/ref-validator')  // Not a perfect validator. But it do the job in good way.
const { writeIfNotExist, getDefault, updateDefault } = require('./helpers/firebase')
// ^^^^
// A simple small collection of functions which
//can be used to work with firebase.

// Basic commands and actions
bot.start((ctx) => {
  ctx.reply(config.bot.start.msg, config.bot.start.opts)
  if(ctx.chat.type == 'private'){
    writeIfNotExist('users', ctx.chat.id, { uid: ctx.chat.id, username: ctx.chat.username, def: 'akjv' })
  }
})
bot.action('home', (ctx) => {
  ctx.editMessageText(config.bot.start.msg, config.bot.start.opts)
})

bot.help((ctx) => {
  ctx.reply(config.bot.help.msg, config.bot.help.opts)
})
bot.action([/help_(.+)/, 'help'], (ctx) => {
  if(ctx.match[1] !== undefined){
    ctx.editMessageText(config.bot.help.msg,
      { parse_mode: 'Markdown', disable_web_page_preview: true, reply_markup: { inline_keyboard: [[ { text: '📖 Start Reading →', callback_data: 'read_1' }, { text: '💬 About', callback_data: 'about' }], [{ text: '← Go back', callback_data: `${ctx.match[1]}` }]] }}
    )
  } else {
    ctx.editMessageText(config.bot.help.msg, config.bot.help.opts)
  }
})

bot.command('about', (ctx) => {
  ctx.reply(config.bot.about.msg, config.bot.about.opts)
})
bot.action('about', (ctx) => {
  ctx.editMessageText(config.bot.about.msg, config.bot.about.opts)
})

bot.command('read', async (ctx) => {
  getTranslations(1)
  .then((keyboard) => {
    keyboard.push([{ text: '← Previous', callback_data: 'read_0' }, { text: 'Next →', callback_data: 'read_2' }], [{ text: '🏡 Home', callback_data: 'home' }])
    ctx.reply('*Choose a version from below*. Browse all other versions using the next and previous buttons.',
      { parse_mode: 'Markdown', reply_markup: { inline_keyboard: keyboard } }
    )
  })
  .catch((err) => {
    ctx.reply(config.bot.error.translation,
      { reply_markup: { inline_keyboard: [[{ text: '🏡 Home', callback_data: 'home' }, { text: '↻ Try Again', callback_data: read_1 }]] } }
    )
    log(err)
  })
})
bot.action(/read_(.+)/, async (ctx) => {
  await ctx.editMessageText('Updating Translation List...')
  const page = parseInt(ctx.match[1])
  getTranslations(page)
  .then((keyboard) => {
    if(page == 3){
      keyboard.push([{ text: '← Previous', callback_data: `read_2` }])
    } else if(page == 0) {
      keyboard.push([{ text: 'Next →', callback_data: `read_1` }])
    } else {
      keyboard.push([{ text: '← Previous', callback_data: `read_${page-1}` }, { text: 'Next →', callback_data: `read_${page+1}` }])
    }
    keyboard.push([{ text: '🏡 Home', callback_data: 'home' }])
    ctx.editMessageText('*Choose a version from below*. Browse all other versions using the next and previous buttons.',
      { parse_mode: 'Markdown', reply_markup: { inline_keyboard: keyboard } }
    )
  })
  .catch((err) => {
    ctx.editMessageText(config.bot.errors.translation,
      { reply_markup: { inline_keyboard: [[{ text: '🏡 Home', callback_data: 'home' }, { text: '↻ Try Again', callback_data: ctx.match[0] }]] } }
    )
    log(err)
  })
})

bot.action(/lang_(.+)/, async (ctx) => {
  await ctx.editMessageText("Getting book list...")
  const version = ctx.match[1].split('_')[0]
  const testament = parseInt(ctx.match[1].split('_')[1])
  const page = parseInt(ctx.match[1].split('_')[2])
  getBooks(version, testament, page)
  .then((result) => {
    const keyboard = result.keyboard;
    if(page == 0){
      keyboard.push([{ text: 'Next →', callback_data: `lang_${version}_${testament}_${page + 1}` }])
    } else if(page == 2){
      keyboard.push([{ text: '← Previous', callback_data: `lang_${version}_${testament}_${page - 1}` }])
    } else if(page == 1){
      if(testament == 0){
        keyboard.push([{ text: '← Previous', callback_data: `lang_${version}_${testament}_${page - 1}` }, { text: 'Next →', callback_data: `lang_${version}_${testament}_${page + 1}` }])
      } else {
        keyboard.push([{ text: '← Previous', callback_data: `lang_${version}_${testament}_${page - 1}` }])
      }
    }
    var testamentName = 'New Testament'
    switch(testament){
      case 0:
        keyboard.push([{ text: 'New Testament', callback_data: `lang_${version}_1_0` }])
      break;
      case 1:
        testamentName = 'Old Testament'
        keyboard.push([{ text: 'Old Testament', callback_data: `lang_${version}_0_0` }])
      break;
      default:
        keyboard.push([{ text: 'New Testament', callback_data: `lang_${version}_1_0` }])
    }
    keyboard.push([{ text: '←', callback_data: `read_1` }, { text: '🏡 Home', callback_data: 'home' }, { text: '📚 Help', callback_data: `help_${ctx.match[0]}` }])
    ctx.editMessageText(`📚 Here is the Book list of ${result.details.language} *${result.details.translation}*(${result.details.abbreviation.toUpperCase()})\n🗨️ Choose one from below or browse all others using next and previous buttons. Or, click on *${testamentName}* button to switch to ${testamentName}. '←' to go back.`,
      { parse_mode: 'Markdown', reply_markup: { inline_keyboard: keyboard } }
    )
  }).catch((err) => {
    ctx.editMessageText(config.bot.error.books,
      { reply_markup: { inline_keyboard: [[{ text: '🏡 Home', callback_data: 'home' }, { text: '↻ Try Again', callback_data: ctx.match[0] }]] } }
    )
    log(err);
  });
})

bot.action(/book_(.+)/, async (ctx) => {
  const version = ctx.match[1].split('_')[0]
  const bookno = parseInt(ctx.match[1].split('_')[1])
  const page = parseInt(ctx.match[1].split('_')[2])
  await ctx.editMessageText('Getting chapters...')
  getChapters(version, bookno, page)
  .then((result) => {
    const keyboard = result.keyboard;
    if(result.details.isPsalms){
      if(page == 0){
        keyboard.push([{ text: 'Next →', callback_data: `book_${version}_${bookno}_1` }])
      } else if(page == 2){
        keyboard.push([{ text: '← Previous', callback_data: `book_${version}_${bookno}_1` }])
      } else {
        keyboard.push([{ text: '← Previous', callback_data: `book_${version}_${bookno}_0` }, { text: 'Next →', callback_data: `book_${version}_${bookno}_2` }])
      }
    }
    keyboard.push([{ text: '← Books', callback_data: `lang_${version}_0_0` }, { text: '🏡 Home', callback_data: 'home' }])
    ctx.editMessageText(`*Chapters*: ${result.details.book_name}\nChoose a chapter to start reading.\nVersion: ${result.details.translation}\nTotal chapters: ${result.details.chapters}`,
      { parse_mode: 'Markdown', reply_markup: { inline_keyboard: keyboard } }
    )
  })
  .catch((error) => {
    ctx.editMessageText(config.bot.error.chapters,
      { reply_markup: { inline_keyboard: [[{ text: '🏡 Home', callback_data: 'home' }, { text: '↻ Try Again', callback_data: ctx.match[0] }]] } }
    )
    log(error)
  })
})

bot.action(/chapter_(.+)/, (ctx) => {
  const version = ctx.match[1].split('_')[0]
  const bookno = parseInt(ctx.match[1].split('_')[1])
  const chapter = parseInt(ctx.match[1].split('_')[2])
  const page = parseInt(ctx.match[1].split('_')[3])
  getVerses(version, bookno, chapter, page)
  .then((res) => {
    const keyboard = res.keyboard;
    keyboard.push([{ text: '#', callback_data: `book_${version}_${bookno}_0` }, { text: '📚', callback_data: `lang_${version}_0_0` }, { text: '🏡 Home', callback_data: 'home' }])
    ctx.editMessageText(res.message,
      { parse_mode: 'Markdown', reply_markup: { inline_keyboard: keyboard } }
    )
  })
  .catch((err) => {
    ctx.editMessageText(config.bot.error.verses,
      { reply_markup: { inline_keyboard: [[{ text: '🏡 Home', callback_data: 'home' }, { text: '↻ Try Again', callback_data: ctx.match[0] }]] } }
    )
    log(err)
  })
})

bot.on('text', (ctx) => {
  if(ctx.chat.type == 'private'){
    getDefault(ctx.chat.id)
    .then((def) => {
      const bookdetail = getBookDetails(ctx.message.text)
      if(bookdetail.status){
        var keyboard = []
        if(bookdetail.verses == 'ALL'){
          if(def == 'akjv'){
            keyboard = [[{ text: 'AKJV', callback_data: `chapter_akjv_${bookdetail.nr}_${bookdetail.chapter}_0` }]]
          } else {
            keyboard = [[{ text: def.toUpperCase(), callback_data: `chapter_${def}_${bookdetail.nr}_${bookdetail.chapter}_0` }, { text: 'AKJV', callback_data: `chapter_akjv_${bookdetail.nr}_${bookdetail.chapter}_0` }]]
          }
          ctx.reply(`Choose a version to get the requested passage: *${ctx.message.text}*`,
            { parse_mode: 'Markdown', reply_markup: { inline_keyboard: keyboard } }
          )
        } else {
          var part;
          if((bookdetail.verses[0] % 10) == 0){
            part = Math.floor( (parseInt(bookdetail.verses[0]) / 10) - 1)
          } else {
            part = Math.floor(parseInt(bookdetail.verses[0])/10)
          }
          if(def == 'akjv'){
            keyboard = [[{ text: 'AKJV', callback_data: `chapter_akjv_${bookdetail.nr}_${bookdetail.chapter}_${part}` }]]
          } else {
            keyboard = [[{ text: def.toUpperCase(), callback_data: `chapter_${def}_${bookdetail.nr}_${bookdetail.chapter}_${part}` }, { text: 'AKJV', callback_data: `chapter_akjv_${bookdetail.nr}_${bookdetail.chapter}_${part}` }]]
          }
          ctx.reply(`Choose a version to get the requested passage: *${ctx.message.text}*`,
            { parse_mode: 'Markdown', reply_markup: { inline_keyboard: keyboard } }
          )
        }
      } else {
        ctx.reply('🤕 Sorry. The reference you entered is not valid as per our system. Please click the button below and find what are the valid book names.',
          { reply_markup: { inline_keyboard: [[{ text: 'Valid References', callback_data: 'valid_0' }]] } }
        )
      }    
    })
    .catch((err) => {
      ctx.reply(config.bot.errors.text)
      console.log(err)
    })
  } else {
    const bookdetail = getBookDetails(ctx.message.text)
    if(bookdetail.status){
      var keyboard = []
      if(bookdetail.verses == 'ALL'){
        keyboard = [[{ text: 'AKJV', callback_data: `chapter_akjv_${bookdetail.nr}_${bookdetail.chapter}_0` }, { text: 'KJV', callback_data: `chapter_kjv_${bookdetail.nr}_${bookdetail.chapter}_0` }], [{ text: 'ASV', callback_data: `chapter_asv_${bookdetail.nr}_${bookdetail.chapter}_0` }]]
        ctx.reply(`Choose a version to get the requested passage: *${ctx.message.text}*`,
          { parse_mode: 'Markdown', reply_markup: { inline_keyboard: keyboard } }
        )
      } else {
        var part;
        if((bookdetail.verses[0] % 10) == 0){
          part = Math.floor( (parseInt(bookdetail.verses[0]) / 10) - 1)
        } else {
          part = Math.floor(parseInt(bookdetail.verses[0])/10)
        }
        keyboard = [[{ text: 'AKJV', callback_data: `chapter_akjv_${bookdetail.nr}_${bookdetail.chapter}_0` }, { text: 'KJV', callback_data: `chapter_kjv_${bookdetail.nr}_${bookdetail.chapter}_0` }], [{ text: 'ASV', callback_data: `chapter_asv_${bookdetail.nr}_${bookdetail.chapter}_0` }]]
        ctx.reply(`Choose a version to get the requested passage: *${ctx.message.text}*`,
          { parse_mode: 'Markdown', reply_markup: { inline_keyboard: keyboard } }
        )
      }
    } else {
      ctx.reply('🤕 Sorry. The reference you entered is not valid as per our system. Please click the button below and find what are the valid book names.',
        { reply_markup: { inline_keyboard: [[{ text: 'Valid References', callback_data: 'valid_0' }]] } }
      )
    }
  }
})

bot.action(/valid_(.+)/, (ctx) => {
  if(ctx.match[1] == 0){
    ctx.editMessageText('Only *King James Version(KJV)* book names and book names are valid. *These methods are only valid.*\n• Book name \n• Book name <Chapter>\n• Book name <Chapter>:<Verse>\n\n*The available abbreviations and book names given below.* It will be case insensitive, which means, you can enter it as UPPERCASE, lowercase, or like Camel Case.\n' + config.bot.valid.bookarray[0],
      { parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: '🏡 Home', callback_data: 'home' }, { text: 'Next →', callback_data: 'valid_1' }]] } }
    )
  } else {
    ctx.editMessageText(config.bot.valid.bookarray[1],
      { parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: '← Previous', callback_data: 'valid_0' }, { text: '🏡 Home', callback_data: 'home' }]] } }
    )
  }
})

bot.action('default', async (ctx) => {
  await getDefault(ctx.chat.id)
  .then((def) => {
    ctx.editMessageText(`*Setting a default version*\nThis bot have a default version setting feature, which can be used to set your own default version. This will be used to give you the passage when you request reference as a message. Send a reference to see the usage.\n\nCurrently your default version to *${def.toUpperCase()}*`,
      { parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: 'Set default', callback_data: 'setd-list_1' }, { text: '🏡 Home', callback_data: 'home' }]] } }
    )
  })
  .catch((err) => {
    ctx.editMessageText(`*Setting a default version*\nThis bot have a default version setting feature, which can be used to set your own default version. This will be used to give you the passage when you request reference as a message. Send a reference to see the usage.`,
      { parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: 'Set default', callback_data: 'setd-list_1' }, { text: '🏡 Home', callback_data: 'home' }]] } }
    )
  })
})

bot.action(/setd-list_(.+)/, (ctx) => {
  const page = parseInt(ctx.match[1])
  getTranslationsDefault(page)
  .then((keyboard) => {
    if(page == 3){
      keyboard.push([{ text: '← Previous', callback_data: `setd-list_2` }])
    } else if(page == 0) {
      keyboard.push([{ text: 'Next →', callback_data: `setd-list_1` }])
    } else {
      keyboard.push([{ text: '← Previous', callback_data: `setd-list_${page-1}` }, { text: 'Next →', callback_data: `setd-list_${page+1}` }])
    }
    keyboard.push([{ text: '🏡 Home', callback_data: 'home' }])
    ctx.editMessageText( 'Choose a version from below *to set as your default from-message version*. This default will be used to get the version buttons while you are requesting a reference by messaging.',
      { parse_mode: 'Markdown', reply_markup: { inline_keyboard: keyboard } }
    )
  })
  .catch((err) => {
    ctx.editMessageText(config.bot.errors.translation,
      { reply_markup: { inline_keyboard: [[{ text: '🏡 Home', callback_data: 'home' }, { text: '↻ Try Again', callback_data: ctx.match[0] }]] } }
    )
    log(err)
  })
})

bot.action(/setd_(.+)/, async (ctx) => {
  const version = ctx.match[1]
  await ctx.editMessageText('Trying to update default version...')
  await updateDefault(ctx.chat.id, version)
  await getDefault(ctx.chat.id)
  .then((def) => {
    if(def == version){
      ctx.editMessageText(`*Your default version has been updated to ${def.toUpperCase()}!*`,
        { parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: '← Go back', callback_data: 'default' }, { text: '🏡 Home', callback_data: 'home' }]] } }
      )
    } else {
      ctx.editMessageText('Sorry. There was an error while updating your default version. Please try again or come back later!',
        { reply_markup: { inline_keyboard: [[{ text: '🏡 Home', callback_data: 'home' }, { text: '↻ Try Again', callback_data: ctx.match[0] }]] } }
      )
    }
  })
  .catch((err) => {
    ctx.editMessageText('Error while updating or getting the new default versions.',
      { reply_markup: { inline_keyboard: [[{ text: '🏡 Home', callback_data: 'home' }, { text: '↻ Try Again', callback_data: ctx.match[0] }]] }}
    )
    log(err)
  })
})

log('No syntax errors. Running...')
bot.launch({
  webhook: {
    domain: process.env.BOT_DOMAIN,
    port: process.env.PORT
  }
})
