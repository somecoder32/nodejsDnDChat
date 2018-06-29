var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

    var spells = JSON.parse(fs.readFileSync('spells.json', 'utf8'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


app.get('/spells', function(req, res){   
    //spells.filter(x => x[req.query.className] === req.query.lvl).map(x => console.log(x.name));
    var spellFound = [];
    spells.filter(x => x[req.query.className] === req.query.lvl).map(x => spellFound.push(x.name));
    spellFound.sort();
    res.end(JSON.stringify(spellFound));
});

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
      console.log('user disconnected');
    });
    socket.on('chat message', function(msg, die){     
        
        var endMsg = msg.split(" ")[1];
        var isNum = parseInt(endMsg, 10);

        if(die){                       
            if(isNum){
                var rolls = roll(isNum, die);
                var total = 0;
                var builtMsg = 'Rolls ' + isNum + ' d' + die + 's ';

                for(var i = 0; i < rolls.length; i++){
                    builtMsg = builtMsg + rolls[i] + ', ' ;
                    total = total + rolls[i];
                }
                io.emit('chat message', msg.split(" ")[0] + builtMsg);
                io.emit('chat message', msg.split(" ")[0] + 'Total = ' + total);
            }
            else {
                io.emit('chat message', msg + 'Rolls a d' + die + ' for ' +  Math.floor((Math.random() * die) + 1));
            }
        }
        else {
            io.emit('chat message', msg);
        }        
    });    
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});

function roll(numdice, dicesize){
    
    var results = [];
    
    for(var i = 0; i < numdice; i++) {
        results[i] =  Math.floor((Math.random() * dicesize) + 1);
    }
    
    return results;
}