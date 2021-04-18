const axios = require('axios')
const splitArray = require('split-array')
const log = console.log
module.exports = { getTranslations, getBooks, getChapters, getVerses, getTranslationsDefault }

async function getTranslations(page){
  const data = await axios.get('https://getbible.net/v2/translations.json')
  .then(async (res) => {
    var langarray = []
    Object.keys(res.data)
      .forEach((element) => {
        langarray.push(res.data[element])
      })
    langarray = langarray.sort((a, b) => {
      if (a.language > b.language) return 1;
      return -1;
    })
    var keyboard = []
    var i = 0;
    while(i < langarray.length){
      const version = langarray[i].abbreviation
      const lang = langarray[i].language
      let version1, lang1;
      if(langarray[i+1] !== undefined){
        version1 = langarray[i+1].abbreviation
        lang1 = langarray[i+1].language
        keyboard.push([{ text: `${lang}: ${version.toUpperCase()}`, callback_data: `lang_${version}_0_0` }, { text: `${lang1}: ${version1.toUpperCase()}`, callback_data: `lang_${version1}_0_0` }])
      } else keyboard.push([{ text: `${lang}: ${version.toUpperCase()}`, callback_data: `lang_${version}_0_0` }])

      // const version1 = langarray[i+1].abbreviation
      // const lang1 = langarray[i+1].language
      // keyboard.push([{ text: `${lang}: ${version.toUpperCase()}`, callback_data: `lang_${version}_0_0` }, { text: `${lang1}: ${version1.toUpperCase()}`, callback_data: `lang_${version1}` }])

      i = i + 2;
    }
    keyboard = await splitArray(keyboard, 10)[page]
    return keyboard
  })
  .catch((err) => {
    throw err;
  })
  return data;
}

async function getBooks(version, testament, page){
  //                             ^^^
  // 0 for old testament and, 1 for new testament
  const data = await axios.get(`https://getbible.net/v2/${version}/books.json`)
  .then((result) => {
    const books =  Object.values(result.data);
    var keyboard = []
    // 0 for old testament and, 1 for new testament
    if(testament == 0){
      // Old testament: get books 1 to 39; or 0 to 38
      const start = page * 13;      // 0 => 0
      var end;
      if(page == 2){
        end = 38  // 2 => 38
      } else {
        end = (page + 1) * 13;  // 0 => 13
      }
      for(var i = start; i <= end; i++){
        const book = books[i]
        keyboard.push([{ text: `${book.name}`, callback_data: `book_${version}_${book.nr}_0` }])
      }
    } else {
      // New testament: get books 40 to 66; or 39 to 65
      const start = (page * 13) + 39;  // 0 => 39
      var end;
      if(page == 1){
        end = 66 // 2 => 38
      } else {
        end = ((page + 1) * 13) + 39;  // 0 => 13
      }
      for(var i = start; i < end; i++){
        const book = books[i]
        keyboard.push([{ text: `${book.name}`, callback_data: `book_${version}_${book.nr}_0` }])
      }
    }
    return { details: { translation: books[1].translation, abbreviation: books[1].abbreviation, language: books[1].language }, keyboard: keyboard }
  }).catch((err) => {
    throw err
  });
  return data
}

// getBooks('kjv', 1, 1)
// .then((result) => {
//   console.log(result);
// }).catch((err) => {
//   console.log(err);
// });

async function getChapters(version, bookno, page){
  const data = await axios.get(`https://getbible.net/v2/${version}/${bookno}/chapters.json`)
  .then(async (result) => {
    const chapters = Object.values(result.data)
    var keyboard = []
    for(var i = 0; i < chapters.length; i++){
      keyboard.push({ text: chapters[i].chapter, callback_data: `chapter_${chapters[i].abbreviation}_${chapters[i].book_nr}_${chapters[i].chapter}_0` })
    }
    var isPsalms;
    if(bookno == 19){
      //         ^
      // Book number 19 is Psalms.
      isPsalms = true
      keyboard = await splitArray(splitArray(keyboard, 4), 13)[page]
    } else {
      isPsalms = false;
      keyboard = await splitArray(keyboard, 4)
    }
    return { details: { language: chapters[0].language, translation: chapters[0].translation, version: chapters[0].abbreviation, book_name: chapters[0].book_name, book_no: chapters[0].book_nr, chapters: chapters.length, isPsalms: isPsalms }, keyboard: keyboard }
  })
  .catch((err) => {
    throw err;
  })
  return data
}

/*getChapters('kjv', 19, 0)
.then((result) => {
  console.log(result);
}).catch((err) => {
  console.log(err);
});*/

async function getVerses(version, bookno, chapter, page){
  const data = await axios.get(`https://getbible.net/v2/${version}/${bookno}/${chapter}.json`)
  .then(async (res) => {
    var verses = res.data.verses
    var message, pages;
    const nextchapter = chapter + 1
    const prevchapter = chapter - 1
    const nextbook = bookno + 1
    const prevbook = bookno - 1
    var chapters = [], books = [];
    var prevbookname, nextbookname;
    var keyboard = []
    await axios.get(`https://getbible.net/v2/${version}/${bookno}/chapters.json`)
    .then((reschap) => {
      Object.keys(reschap.data).forEach((el) => {
        chapters.push(parseInt(el))
      })
    })
    .catch((errchap) => {
      throw errchap
    })
    if(verses.length <= 15){
      pages = 1;
      message = `*${res.data.name}*\n_Showing page ${page + 1} out of ${pages}_\n`
      if(chapters.includes(nextchapter) && chapters.includes(prevchapter)){
        keyboard = [[{ text: `← ${prevchapter}`, callback_data: `chapter_${version}_${bookno}_${prevchapter}_0` }, { text: `${nextchapter} →`, callback_data: `chapter_${version}_${bookno}_${nextchapter}_0` }]]
      } else if(chapters.includes(nextchapter) && !chapters.includes(prevchapter)){
        await axios.get(`https://getbible.net/v2/${version}/books.json`)
        .then((resbook) => {
          Object.keys(resbook.data).forEach((el) => {
            books.push(parseInt(el))
          })
          if(books.includes(prevbook)){
            prevbookname = resbook.data[prevbook].name
            keyboard = [[{ text: `← ${prevbookname}`, callback_data: `chapter_${version}_${prevbook}_1_0` }, { text: `${nextchapter} →`, callback_data: `chapter_${version}_${bookno}_${nextchapter}_0` }]]
          } else {
            keyboard = [[{ text: `${nextchapter} →`, callback_data: `chapter_${version}_${bookno}_${nextchapter}_0` }]]
          }
        })
        .catch((errbook) => {
          throw errbook
        })
      } else if(!chapters.includes(nextchapter) && chapters.includes(prevchapter)){
        await axios.get(`https://getbible.net/v2/${version}/books.json`)
        .then((resbook) => {
          Object.keys(resbook.data).forEach((el) => {
            books.push(parseInt(el))
          })
          if(books.includes(nextbook)){
            nextbookname = resbook.data[nextbook].name
            keyboard = [[{ text: `← ${prevchapter}`, callback_data: `chapter_${version}_${bookno}_${prevchapter}_0` }, { text: `${nextbookname} →`, callback_data: `chapter_${version}_${nextbook}_1_0` }]]
          } else {
            keyboard = [[{ text: `← ${prevchapter}`, callback_data: `chapter_${version}_${bookno}_${prevchapter}_0` }, { text: `${nextchapter} →`, callback_data: `chapter_${version}_${bookno}_${nextchapter}_0` }]]
          }
        })
        .catch((errbook) => {
          throw errbook
        })
      } else {
        await axios.get(`https://getbible.net/v2/${version}/books.json`)
        .then((resbook) => {
          Object.keys(resbook.data).forEach((el) => {
            books.push(parseInt(el))
          })
          if(books.includes(nextbook)){
            nextbookname = resbook.data[nextbook].name
            if(books.includes(prevbook)){
              prevbookname = resbook.data[prevbook].name
              keyboard = [[{ text: `← ${prevbookname}`, callback_data: `chapter_${version}_${prevbook}_1_0` }, { text: `${nextbookname} →`, callback_data: `chapter_${version}_${nextbook}_1_0` }]]
            } else {
              keyboard = [[{ text: `${nextbookname} →`, callback_data: `chapter_${version}_${nextbook}_1_0` }]]
            }
          } else if(books.includes(prevbook)){
            prevbookname = resbook.data[prevbook].name
            keyboard = [[{ text: `← ${prevbookname}`, callback_data: `chapter_${version}_${prevbook}_1_0` }]]
          }
        })
        .catch((errbook) => {
          throw errbook
        })
      }
    } else {
      pages = splitArray(verses, 10).length
      verses = splitArray(verses, 10)[page]
      message = `*${res.data.name}*\n_Showing page ${page + 1} out of ${pages}_\n`
      if(page == 0){
        if(chapters.includes(prevchapter)){
          keyboard = [[{ text: `← ${prevchapter}`, callback_data: `chapter_${version}_${bookno}_${prevchapter}_0` }, { text: 'Next →', callback_data: `chapter_${version}_${bookno}_${chapter}_${page+1}` }]]
        } else {
          await axios.get(`https://getbible.net/v2/${version}/books.json`)
          .then((resbook) => {
            Object.keys(resbook.data).forEach((el) => {
              books.push(parseInt(el))
            })
            if(books.includes(prevbook)){
              prevbookname = resbook.data[prevbook].name
              keyboard = [[{ text: `← ${prevbookname}`, callback_data: `chapter_${version}_${prevbook}_1_0` }, { text: 'Next →', callback_data: `chapter_${version}_${bookno}_${chapter}_${page+1}` }]]
            } else {
              keyboard = [[{ text: 'Next →', callback_data: `chapter_${version}_${bookno}_${chapter}_${page+1}` }]]
            }
          })
          .catch((errbook) => {
            throw errbook
          })
        }
      } else if(page == (pages - 1)){
        if(chapters.includes(nextchapter)){
          keyboard = [[{ text: `← Previous`, callback_data: `chapter_${version}_${bookno}_${chapter}_${page-1}` }, { text: `${nextchapter} →`, callback_data: `chapter_${version}_${bookno}_${nextchapter}_0` }]]
        } else {
          await axios.get(`https://getbible.net/v2/${version}/books.json`)
          .then((resbook) => {
            Object.keys(resbook.data).forEach((el) => {
              books.push(parseInt(el))
            })
            if(books.includes(nextbook)){
              nextbookname = resbook.data[nextbook].name
              keyboard = [[{ text: `← Previous`, callback_data: `chapter_${version}_${bookno}_${chapter}_${page-1}` }, { text: `${nextbookname} →`, callback_data: `chapter_${version}_${nextbook}_1_0` }]]
            } else {
              keyboard = [[{ text: `← Previous`, callback_data: `chapter_${version}_${bookno}_${chapter}_${page-1}` }]]
            }
          })
          .catch((errbook) => {
            throw errbook
          })
        }
      } else {
        keyboard = [[{ text: '← Previous', callback_data: `chapter_${version}_${bookno}_${chapter}_${page-1}` }, { text: 'Next →', callback_data: `chapter_${version}_${bookno}_${chapter}_${page+1}` }]]
      }
    }
    verses.forEach((el) => {
      message = `${message}*${el.verse}* ${el.text}\n`
    })
    return { keyboard: keyboard, message: message, details: { translation: res.data.translation, version: res.data.abbreviation, language: 'English', book_nr: 19, book_name: 'Psalms', chapter: 119, name: 'Psalms 119', pages: pages, page: page+1 } }
  })
  .catch((err) => {
    throw err;
  })
  return data;
}

/* getVerses('kjv', 19, 119, 17)
.then((res) => {
  log(res.keyboard)
})
.catch((err) => {
  log(err)
}) */

async function getTranslationsDefault(page){
  const data = await axios.get('https://getbible.net/v2/translations.json')
  .then(async (res) => {
    var langarray = []
    Object.keys(res.data)
      .forEach((element) => {
        langarray.push(res.data[element])
      })
    langarray = langarray.sort((a, b) => {
      if (a.language > b.language) return 1;
      return -1;
    })
    var keyboard = []
    var i = 0;
    while(i < langarray.length){
      const version = langarray[i].abbreviation
      const lang = langarray[i].language
      let version1, lang1;
      if(langarray[i+1] !== undefined){
        version1 = langarray[i+1].abbreviation
        lang1 = langarray[i+1].language
        keyboard.push([{ text: `${lang}: ${version.toUpperCase()}`, callback_data: `setd_${version}` }, { text: `${lang1}: ${version1.toUpperCase()}`, callback_data: `setd_${version1}` }])
      } else keyboard.push([{ text: `${lang}: ${version.toUpperCase()}`, callback_data: `setd_${version}` }])
      i = i + 2;
    }
    keyboard = await splitArray(keyboard, 10)[page]
    return keyboard
  })
  .catch((err) => {
    throw err;
  })
  return data;
}
