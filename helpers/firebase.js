const firebase = require('firebase')
const config = require('../config')
if(config.firebase.status == true){
  firebase.initializeApp(config.firebase.config)
  const db = firebase.database()
} else {
  console.log("firebase is not enabled");
}

function update(toWhere, data){
  if(config.firebase.status == true){
    const ref = firebase.database().ref(toWhere)
    ref.update(data)
  } else {
    console.log('firebase is not enabled.')
  }
}

function writeIfNotExist(toWhere, dataName, data){
  if(config.firebase.status == true){
    const ref = firebase.database().ref(toWhere)
    ref.on('value', function(snapshot){
      const existing = snapshot.val()
      if(existing === null || !existing.hasOwnProperty(dataName)){
        update(toWhere + '/' + dataName, data)
      }
    })
  } else {
    console.log('firebase is not enabled.')
  }
}

function getUdata(uid){
  if(config.firebase.status == true){
    var getPromise = new Promise(function(resolve, reject){
      const ref = firebase.database().ref(`users/${uid}`)
      ref.on('value', function(snap){
        const data = snap.val();
        resolve(data);
      });
    });
    return getPromise;
  } else {
    console.log('firebase is not enabled.')
  }
}

function getDefault(uid){
  if(config.firebase.status == true){
    var getPromise = new Promise(function(resolve, reject){
      const ref = firebase.database().ref(`users/${uid}`)
      ref.on('value', function(snap){
        const data = snap.val().def;
        resolve(data);
      });
    });
    return getPromise;
  } else {
    console.log('firebase is not enabled.')
  }
}

async function updateDefault(uid, def){
  if(config.firebase.status == true){
    const ref = firebase.database().ref(`users/${uid}`)
    await ref.update({ def: def }, function(error){
      if(error){
        console.log("Data could not be saved." + error)
        throw err;
      }
    })
  } else {
    console.log('firebase is not enabled.')
  }
}

module.exports = { update, writeIfNotExist, getUdata, getDefault, updateDefault }
