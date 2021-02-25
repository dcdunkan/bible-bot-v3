const ReferenceParser = require('bible-reference-parser')
module.exports = { getBookDetails }
const books = [
  'genesis',         'exodus',          'leviticus',     'numbers',
  'deuteronomy',     'joshua',          'judges',        'ruth',
  '1 samuel',        '2 samuel',        '1 kings',       '2 kings',
  '1 chronicles',    '2 chronicles',    'ezra',          'nehemiah',
  'esther',          'job',             'psalms',        'proverbs',
  'ecclesiastes',    'song of songs', 'isaiah',        'jeremiah',
  'lamentations',    'ezekiel',         'daniel',        'hosea',
  'joel',            'amos',            'obadiah',       'jonah',
  'micah',           'nahum',           'habakkuk',      'zephaniah',
  'haggai',          'zechariah',       'malachi',       'matthew',
  'mark',            'luke',            'john',          'acts',
  'romans',          '1 corinthians',   '2 corinthians', 'galatians',
  'ephesians',       'philippians',     'colossians',    '1 thessalonians',
  '2 thessalonians', '1 timothy',       '2 timothy',     'titus',
  'philemon',        'hebrews',         'james',         '1 peter',
  '2 peter',         '1 john',          '2 john',        '3 john',
  'jude',            'revelation'
]

const books2letter = [
  'gen',     'ex',      'lev',     'num',    'deut',
  'josh',    'judg',    'rt',      '1 sam',  '2 sam',
  '1 king',  '2 king',  '1 chro',  '2 chro', 'ez',
  'neh',     'est',     'jb',      'ps',     'prov',
  'eccles',  'song',    'isa',     'jer',    'lam',
  'ezek',    'dan',     'hos',     'joel',   'amos',
  'obad',    'jonah',   'mic',     'nah',    'hab',
  'zeph',    'hag',     'zech',    'mal',    'matt',
  'mk',      'lk',      'jn',      'act',    'rom',
  '1 cor',   '2 cor',   'gal',     'eph',    'phil',
  'col',     '1 thess', '2 thess', '1 tim',  '2 tim',
  'tit',     'philem',  'heb',     'jm',     '1 pet',
  '2 pet',   '1 jn',    '2 jn',    '3 jn',   'jud',
  'rev'
]

function getBookDetails(text){
  const ref = ReferenceParser(text.toLowerCase())
  var words = []
  if(text.split(" ").length == 1){
    words = ref.chapter.split(" ")
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }
    if(books.includes(ref.chapter.toLowerCase())){
      return { status: true, book: words.join(" "), nr: books.indexOf(ref.chapter) + 1, chapter: 1, verses: ref.verses }
    } else if(books2letter.includes(ref.chapter.toLowerCase())){
      return { status: true, book: words.join(" "), nr: books2letter.indexOf(ref.chapter) + 1, chapter: 1, verses: ref.verses }
    } else {
      return { status: false }
    }
  } else {
    words = ref.book.split(" ")
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }
    if(books.includes(ref.book.toLowerCase())){
      return { status: true, book: words.join(" "), nr: books.indexOf(ref.book) + 1, chapter: ref.chapter, verses: ref.verses }
    } else if(books2letter.includes(ref.book.toLowerCase())){
      return { status: true, book: words.join(" "), nr: books2letter.indexOf(ref.book) + 1, chapter: ref.chapter, verses: ref.verses }
    } else {
      return { status: false }
    }
  }
}
