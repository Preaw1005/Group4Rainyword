async function connect() {
  const socket = io("http://localhost:3000/", { transports: ['websocket'] }); 
  return new Promise((resolve, reject) => {
    socket.on('connect', () => {
      console.log(`Connected to server [${socket.id}]`);
      const prevId = localStorage.getItem('playerId'); 

      socket.on('connect-success', (playerId) => {
        if (prevId) {
          socket.emit('set-id', prevId); 

          socket.on('set-id-success', (side) => {
            console.log(`Resume session as [${prevId}]`);
            if (side) localStorage.setItem('playerSide', side); 
            resolve(socket);
          });

          socket.on('set-id-fail', () => {
            localStorage.setItem('playerId', playerId);
            console.log(`New session as [${playerId}]`);
            resolve(socket);
          })
        } else {
          localStorage.setItem('playerId', playerId);
          console.log(`New session as [${playerId}]`);
          resolve(socket);
        }
      });

      setTimeout(() => {
        reject("Connection timeout 30s");
      }, 30000);
    });
  });
}



async function jsWelcome() {
  const socket = await connect(); 
  if(localStorage.getItem('opponentUsername')) localStorage.removeItem('opponentUsername')
  if(localStorage.getItem('opponentAvatar')) localStorage.removeItem('opponentAvatar')
  
  socket.emit('user-connected');
  socket.on('user-connected-success', (count) => {
    document.getElementById('users-count').innerHTML = 'Online users: '+count
  })
  
  document.getElementById('newgame-button').addEventListener('click', (e) => {
    socket.emit('create-room', () => {});
    socket.on('join-room-success', (side, id) => {
      console.log(`New game ${id} as ${side}`);
      localStorage.setItem('playerSide', side);
      localStorage.setItem('roomId', id);
      window.location.href = "newgame";
    }); 
  }); 

  document.getElementById('joingame-button').addEventListener('click', () => {
    const text = document.getElementById('roomcode').value;
    console.log(`Joining room code [${text}]`);
    socket.emit('join-room', (text));
    socket.on('join-room-success', (side, id) => {
      console.log('success')
      localStorage.setItem('playerSide', side);
      localStorage.setItem('roomId', id);
      window.location.href = 'joingame'
    }); 
    
   
    socket.on('join-room-full',() => {
      console.log('cannot join --> already full');
      document.getElementById('roomcode').value = '';
      alert('room full');
    })
  });


}

async function jsNewGame() {
  const socket = await connect(); 
  socket.emit('user-connected');
  document.getElementById('gamecode').innerHTML = localStorage.getItem('roomId')
  
   document.addEventListener('keypress', (e) => {
    switch (e.code) {
      case "Enter": {
        const word = document.getElementById("username").value;
        console.log(word);
        socket.emit("set-name", word);
        socket.on('set-name-success',(name) => {
          localStorage.setItem('playerUsername', name);
          console.log('set name success')
          window.location.href = "/gamelevel"
        });
  
      }
    }
  }); 
}
async function jsGameLevel() {
  const socket = await connect(); 
  socket.emit('user-connected');
  document.getElementById('easy-button').addEventListener('click', (e) => {
    socket.emit('set-level', (1))
  })
  document.getElementById('medium-button').addEventListener('click', (e) => {
    socket.emit('set-level', (2))
  })
  document.getElementById('hard-button').addEventListener('click', (e) => {
    socket.emit('set-level', (3))
  })
  socket.on('set-level-success', (level) => {
    console.log('set level success: '+level)
    window.location.href = '/gametime'
  })
}

async function jsGameTime() {
  const socket = await connect(); 
  socket.emit('user-connected');
  document.getElementById('3-mins-button').addEventListener('click', (e) => {
    socket.emit('set-time', (180))
  })
  document.getElementById('4-mins-button').addEventListener('click', (e) => {
    socket.emit('set-time', (240))
  })
  document.getElementById('5-mins-button').addEventListener('click', (e) => {
    socket.emit('set-time', (300))
  })
  socket.on('set-time-success', (time) => {
    console.log('set time success: '+time)
    window.location.href = '/fighter'
  })
}


async function jsJoinGame() {
  const socket = await connect(); 
  socket.emit('user-connected');
  document.addEventListener('keypress', (e) => {
    switch (e.code) {
      case "Enter": {
        const word = document.getElementById("username").value;
        console.log(word);
        socket.emit("set-name", word);
        socket.on('set-name-success',(name) => {
          localStorage.setItem('playerUsername', name);
          console.log('set name success')
          window.location.href = "/fighter"
        });
  
      }
    }
  }); 
}

async function jsFighter() {
  console.log('fighter')
  const socket = await connect(); 
  socket.emit('user-connected');
  
  document.getElementById('username').innerHTML = 'Welcome, ' + localStorage.getItem('playerUsername');
  
  document.getElementById('water_avatar').addEventListener('click', (e) => {
    const src = 'water.png'
    socket.emit("set-avatar", src);
    socket.on('set-avatar-success', () => {
        console.log('set '+src+' as avatar')
        document.getElementById('water_avatar').style.opacity = 1
        document.getElementById('umbrella_avatar').style.opacity = 0.5
        document.getElementById('wind_avatar').style.opacity = 0.5
        localStorage.setItem('playerAvatar',src)
    }) 
  })
  document.getElementById('umbrella_avatar').addEventListener('click', (e) => {
    const src = 'umbrella.png'
    socket.emit("set-avatar", src);
    socket.on('set-avatar-success',() => {
        console.log('set '+src+' as avatar')
        document.getElementById('water_avatar').style.opacity = 0.5
        document.getElementById('umbrella_avatar').style.opacity = 1
        document.getElementById('wind_avatar').style.opacity = 0.5
        localStorage.setItem('playerAvatar',src)
    }) 
  })
  document.getElementById('wind_avatar').addEventListener('click', (e) => {
    const  src = 'wind.png'
    socket.emit("set-avatar", src);
    socket.on('set-avatar-success', () => {
        console.log('set '+src+' as avatar')
        document.getElementById('water_avatar').style.opacity = 0.5
        document.getElementById('umbrella_avatar').style.opacity = 0.5
        document.getElementById('wind_avatar').style.opacity = 1
        localStorage.setItem('playerAvatar',src)
    }) 
  })
  socket.on('set-avatar-opponent',(username,avatar) => {
    localStorage.setItem('opponentUsername',username)
    localStorage.setItem('opponentAvatar',avatar)
  })
  document.getElementById('start-button').addEventListener('click',(e) => {
    window.location.href = "/waitingroom"
  })
  
  
}

async function jsWaitingroom() {
  console.log('wait')
  const socket = await connect(); 
  socket.emit('user-connected');
  const side = localStorage.getItem('playerSide')
  var opponentSide = 'guest'
  if(side!=='host') opponentSide = 'host'

  console.log(localStorage.getItem('roomId'))
  document.getElementById('gamecode').innerHTML = 'Game Code: ' + localStorage.getItem('roomId') ;

  document.getElementById(side+"_avatar").src = localStorage.getItem('playerAvatar')
  document.getElementById(side+"_name").innerHTML = localStorage.getItem('playerUsername')
  console.log(localStorage.getItem('playerUsername'))

  socket.on('set-avatar-opponent',(username,avatar) => {
    localStorage.setItem('opponentUsername',username)
    localStorage.setItem('opponentAvatar',avatar)
    document.getElementById(opponentSide+"_avatar").src = localStorage.getItem('opponentAvatar')
    document.getElementById(opponentSide+"_name").innerHTML=localStorage.getItem('opponentUsername')
    
  })

  if(localStorage.getItem('opponentUsername') && localStorage.getItem('opponentUsername')) {
    document.getElementById(opponentSide+"_avatar").src = localStorage.getItem('opponentAvatar')
    document.getElementById(opponentSide+"_name").innerHTML = localStorage.getItem('opponentUsername')
  }
  
  socket.emit('start-game') ;
  
  socket.on('start-game-success', () => {
    console.log('both ready --> start game');
    document.getElementById('start-button').style.display = 'block';
    document.getElementById('start-button').addEventListener('click', (e) => {
      socket.emit('go-game')
    })
  }) 
  socket.on('go-game-success', () => {
    window.location.href = "/game";
  })

  socket.on('start-game-fail', (reason) => {
    console.log(reason)
  })

  //copy game code to clipboard
  document.getElementById('copy-code').addEventListener('click', (e) => {
    navigator.clipboard.writeText(localStorage.getItem('roomId'));
    console.log('copied: '+localStorage.getItem('roomId'))
  })

  document.getElementById('send-msg').addEventListener('keypress', (e) => {
    switch (e.code) {
      case "Enter"  :{
        const msg = document.getElementById('send-msg').value;
        document.getElementById("send-msg").value = '';
        console.log('msg send: '+msg)
        socket.emit('send-msg', msg)
      }
    }
  });
  socket.on('rcv-msg', (msg) => {
    document.getElementById('rcv-msg').innerHTML += '<br />'+msg;
    console.log('message received!')
  });
}

async function jsGame() {
  const socket = await connect(); 
  socket.emit('user-connected');
  const wordMap = {};
  //const side = localStorage.getItem('playerSide');
  //change bg to rain
  document.getElementById('rain-bg').addEventListener('click',(e) => {
    console.log('its raining!');
    document.body.style = 'background-image: url(rainbg.jpeg);background-repeat: no-repeat;background-size: cover;"';
  })
  document.getElementById('blue-bg').addEventListener('click',(e) => {
   console.log('its not raining');
    document.body.style = 'background-image: none; background-color: #73d8f4';
  })

  
  // notify server after load finish
  socket.emit('load-game');

  // count down -1 second every tick sent from server
  socket.on('tick', (timer) => {
    // and update the UI accordingly
    const minute = Math.floor(timer / 60); 
    const second = timer % 60; 
    const timestamp = second < 10 ? `${minute}:0${second}s` : `${minute}:${second}s`;
    const el = document.getElementById('timeleft'); 
    el.innerText = timestamp; 
  });
  document.getElementById('host_avatar').src = localStorage.getItem('playerAvatar')
  document.getElementById('host_name').innerHTML = localStorage.getItem('playerUsername')
  
  //user submit word
  document.addEventListener('keypress', (e) => {
    switch (e.code) {
      case "Enter": {
        const word = document.getElementById("inputBox").value;
        document.getElementById("inputBox").value = '';
        socket.emit("word-submit", word);
      }
    }
  });
  
  //end game
  document.getElementById('reset-button').addEventListener('click', () => {
    console.log('clicked reset button')
    socket.emit("end-game-click")
  });

  socket.on('end-game',() =>{
    console.log('redirect to result')
    window.location.href = '/result'; 
  })

  socket.on('load-game-waiting', () => {
    console.log('wait')
  });

  socket.on('load-game-success', () => {
    console.log('start')
  });

  socket.on('word-new', (word) => {
    wordMap[word] = true;
    CreateBlock(word);
    console.log('new word: '+word)
  });

  socket.on('word-timeout', (word, score) => {
    console.log(`Timeout: [${word}]`);
    if (score) {
      document.getElementById("opponentscore").innerHTML = `Opponent Score: ${score}`;
      localStorage.setItem("opponentscore", `${score}`);
    }  
    if (wordMap[word]) {
      delete wordMap[word];
      if (document.getElementById('generated_' + word))
        document.getElementById('generated_' + word).style.display = 'none';
    }
  });

  socket.on('word-submit-correct', ( word, score) => {
    delete wordMap[word];

    document.getElementById("yourscore").innerHTML = `Your Score: ${score}`;
    localStorage.setItem("yourscore", `${score}`);
    var audio = new Audio('bellsound.mp3');
    audio.play();
    if (document.getElementById('generated_' + word))
      document.getElementById('generated_' + word).style.display = 'none';
  });

  socket.on('force-restart-success', () => {
    console.log('force restart success');
    socket.emit('restart-by-admin');
  }); 

  socket.on('restart-by-admin-success', () => {
    console.log('restart success')
    window.location.href = 'waitingroom';
  }); 

}





async function jsResult() {
  const socket = await connect();
  socket.emit('user-connected');
  // show both players score and compare who is the winner

  //sound effect
  var audio = new Audio('gameopen.mp3');
  audio.play();

  socket.emit('show-winner');

  socket.on('show-winner-success', (
    side, 
    [hostName, hostAvatar, hostScore], 
    [guestName, guestAvatar, guestScore]
  ) => {
    const playerSide = localStorage.getItem('playerSide');

    if (playerSide && side !== playerSide)
      document.getElementById('resultText').innerHTML = "You lose..<br />that was a close race!"

    document.getElementById('player1_username').innerText = hostName;
    document.getElementById('player2_username').innerText = guestName;
    document.getElementById('player1_avatar').src = hostAvatar; 
    document.getElementById('player2_avatar').src = guestAvatar;

    const hostEl = document.getElementById('player1_score_result');
    const guestEl = document.getElementById('player2_score_result');
    
    //if player's side = winner side: yellow
    hostEl.style.color = side === 'host' ? "#EECB11" : "#AEAEAE"; 
    guestEl.style.color = side === 'guest' ? "#EECB11" : "#AEAEAE";

    hostEl.innerHTML = `${hostScore}<br />Points`;
    guestEl.innerHTML = `${guestScore}<br />Points`; 
  });

  document.getElementById('restartButton').addEventListener('click', () => {
    socket.emit('restart');
  });
  socket.on('restart-success', () => {
    console.log('restart success')
    window.location.href = 'waitingroom';
  }); 
}

async function jsInspect() {
  const socket = await connect();
  socket.emit('user-connected');
  socket.on('user-connected-success', (count) => {
    document.getElementById('users-count').innerHTML = count
  })
  document.getElementById('reset').addEventListener('click', (e) => {
    socket.emit('force-restart');
    console.log('force-start-click')
  })
  socket.on('send-detail', (text) => {
    console.log(text)
    document.getElementById('show').innerHTML = text;

  })
}


switch (window.location.pathname) {
  case "/welcome": {
    jsWelcome();
    break; 
  }
  case "/newgame": {
    jsNewGame(); 
    break; 
  }
  case "/gamelevel": {
    jsGameLevel(); 
    break; 
  }
  case "/gametime": {
    jsGameTime(); 
    break; 
  }
  case "/joingame": {
    jsJoinGame(); 
    break; 
  }
  case "/game": {
    jsGame(); 
    break; 
  }
  case "/fighter": {
    console.log('asdasd')
    jsFighter()
    break; 
  }
  case "/waitingroom": {
    console.log('asdasd')
    jsWaitingroom()
    break; 
  }
  case "/result": {
    jsResult(); 
    break; 
  }
  case "/inspect": {
    jsInspect(); 
    break; 
  }

}

function CreateBlock(word) {
    const board = document.getElementById('main');
    if (board === null) 
      return; 

    const block = document.createElement('div');
    const offsetY = board.clientHeight; 
    const offsetX = Math.floor(Math.random() * board.clientWidth)-0.2;
      
    requestAnimationFrame(() => {
      // Base Position
      block.innerText = word; 
      block.id = 'generated_'+word;
      block.className = "game_box";
      block.style.top = `0px`; 
      block.style.left = `${offsetX}px`; 
      board.appendChild(block);

      // Animation Origin
      block.style.transform = `translateY(0)`;

      // Enable Animation
      block.style.transition = "transform 10s linear";

      // Animation Destination
      requestAnimationFrame(() => {
          block.style.transform = `translateY(${offsetY}px)`;
          setTimeout(() => {
          }, 10000);
      });
    });
}






