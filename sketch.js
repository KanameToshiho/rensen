const m = 5 - 1;
var boards = [...new Array(m)].map((_,i) => [...new Array(m)].map((_,j) => 0));// 1 <= / , -1 <=  \

const cookies = document.cookie;
const ca = cookies.split(';');
var content = new Array();
ca.forEach(function(value) {
  content = value.split('=');
})
var clip = false;
var gs = 0;
var flag=false;
var dflag = false;
const margin = 50;
const FW = false;
const DF = true;
var MyRole = FW;
var turn = null;
var bless = true;
var win = false;
var lose = false;
var sflag = false;
var FirstPoint = new Array(2);
FirstPoint[0]=0;
FirstPoint[1]=0;
var FinishPoint = new Array(2);
var ename="待機中"
FinishPoint[0] = -1

  const socket=io("https://onlineapi.glitch.me", {
	  "force new connection" : true,
	  "reconnectionAttempts": "Infinity",
	  "transports" : ["websocket"]
  });
  var hei = window.innerWidth<window.innerHeight?window.innerWidth:window.innerHeight;
  var wid = hei;
  var ws = (wid-margin*2)/m;
  var hs = (hei-margin*2)/m; 
window.addEventListener('DOMContentLoaded', (event) => {
    setTimeout(() => {
	  hei = window.innerWidth<window.innerHeight?window.innerWidth:window.innerHeight;
	  wid = hei;
	  ws = (wid-margin*2)/m;
	  hs = (hei-margin*2)/m; 
	}, 500);
});
function setup() {
  if(content[0]=="uname"){
  	uname = unescape(content[1]);
  	if(!uname){uname=""}
  	  if(uname.trim()==""){uname="";}else{
  		document.getElementById("modal1").classList.add("vanish");
  		document.getElementById("bb").classList.add("vanish");
  		socket.emit("enter",{username:uname});
  		socket.emit("req",{});
  	  }
  }
  const hei = window.innerWidth<window.innerHeight?window.innerWidth:window.innerHeight;
  const wid = window.innerWidth;
  const ws = (wid-margin*2)/m;
  const hs = (hei-margin*2)/m; 
  createCanvas(wid,hei+60);
  document.getElementById("defaultCanvas0").classList.add("vanish");
  let btn = document.getElementById("plusb");
  btn.onclick = function(){
	document.getElementById("rooms").classList.add("vanish");
	document.getElementById("defaultCanvas0").classList.remove("vanish");
	document.getElementById("ruleb").classList.add("vanish");
	document.getElementById("quitb").classList.remove("vanish");
	socket.emit("create",{roomname:"O",turn:false})
	}
  let btn2 = document.getElementById("reqb");
  btn2.onclick = function(){
	let hj = document.getElementById("jj");
	hj.innerHTML="";
	let ins = document.createElement('li');
	ins.innerHTML = "取得中...";
	hj.appendChild(ins);
	socket.emit("req");
	}
  let btn3 = document.getElementById("fb");
  btn3.onclick = function(){
	let nn = document.getElementById("username").value;
	  var uname = nn;
	  if(!uname){uname=""}
	  if(uname.trim()==""){uname="";alert("ユーザー名を入力してください")}else{
		  document.getElementById("modal1").classList.add("vanish");
		  document.getElementById("bb").classList.add("vanish");
		  socket.emit("enter",{username:uname});
		  socket.emit("req",{});
		  document.cookie = 'uname=' + escape(uname);
	  }
  }
  let btn4 = document.getElementById("quitb");
  btn4.onclick = function(){
	  location.reload();
  }
  document.getElementById("ruleb").onclick = function(){
	  document.getElementById("bb").classList.remove("vanish");
	  document.getElementById("modal2").classList.remove("vanish");
  }
}
socket.on("roomdata",(e)=>{
	let hj = document.getElementById("jj");
	hj.innerHTML="";
  for(var i=0;i<e.length;i++){
	if(e[i]!=null){
	if(!e[i].status){
		let ins = document.createElement('li');
		if(e[i].hostname.length<=13){
			ins.innerHTML = (e[i].hostname.replace(/&/g, '&lt;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, "&#x27;"));
		}else{
			ins.innerHTML = (e[i].hostname.replace(/&/g, '&lt;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, "&#x27;").substring(0, 13) + "...")
		}
		ins.setAttribute('id', i);
		ins.addEventListener('click', join_);
		hj.appendChild(ins);
		}
	}
  }
  if(hj.childElementCount==0){
	  let ins = document.createElement('li');
	  ins.innerHTML = "待機中のプレイヤーがいません。";
	  hj.appendChild(ins);
  }
})
socket.on("signaling",(e)=>{
	socket.emit("start")
	console.log("signaling");
	ename = e.from;
	turn=FW;
	gs=100;
	document.getElementById("quitb").classList.add("vanish");
})
socket.on("start",(e)=>{
	turn=FW;
	console.log("sdanlk");
})
socket.on("action",(e)=>{
	if(!e.f){
	console.log(e)
	boards[e.x][e.y]=e.st;
	if(!bless){turn=!turn;}else{bless=!bless;}
	x=e.x;y=e.y;
	iswin(x,y);
	let sam_ = 0;
	let sam__ = 0;
	let sa = 0;
	for(var i=0;i<m;i++){
		for(var j=0;j<m;j++){
			sa = 0;
			if(MyRole){
				if(sonoba2(i+1,j+1)==-1 || sonoba2(i-1,j-1)==-1){sa++}
				if(sonoba2(i+1,j-1)==-1 || sonoba2(i-1,j+1)==1){sa++}
			}
			if(boards[i][j]!=0){sa=2;sam__+=2;}
			sam_ += sa;
		}
	}
	if(sam__ == m**2*2 && !win && !lose){if(MyRole){win=true}else{lose=true};socket.emit("end",{dfwin:true});turn=null;}
	if(sam__ != m**2*2 && sam_ == m**2*2 && MyRole && !win && !lose){alert("線を引ける場所がないのでパスします。");socket.emit("action",{f:true})}
	}else{turn=!turn;alert("パス");}
})
socket.on("close",(e)=>{
	socket.emit("closed");
	alert("対戦相手との接続が切れました。");
	if(!lose){win=true;}
	turn=null;
	socket.emit("leave");
})
socket.on("lg",function(){
	
	alert("対戦相手との接続が切れました。");
	if(!lose){win=true;}
	turn=null;
    socket.emit("leave");
})
function iswin(x,y){
		if(boards[x][y]==-1){
          if(sonoba(x-1,y)==1 && sonoba(x-1,y+1)==-1 && sonoba(x,y+1)==1){Hishi();}
          if(sonoba(x+1,y)==1 && sonoba(x+1,y-1)==-1 && sonoba(x,y-1)==1){Hishi();}
		  if(sonoba(x+1,y)==-1 && sonoba(x+2,y)==-1 && sonoba(x+3,y)==-1){Hishi();}
		  if(sonoba(x,y+1)==-1 && sonoba(x,y+2)==-1 && sonoba(x,y+3)==-1){Hishi();}
        }else{
          if(sonoba(x-1,y)==-1 && sonoba(x-1,y-1)==1 && sonoba(x,y-1)==-1){Hishi();}
          if(sonoba(x+1,y)==-1 && sonoba(x,y+1)==-1 && sonoba(x+1,y+1)==1){Hishi();}
		  if(sonoba(x+1,y)==1 && sonoba(x+2,y)==1 && sonoba(x+3,y)==1){Hishi();}
		  if(sonoba(x,y+1)==1 && sonoba(x,y+2)==1 && sonoba(x,y+3)==1){Hishi();}
        }
}
function join_(e){
	document.getElementById("rooms").classList.add("vanish");
	document.getElementById("defaultCanvas0").classList.remove("vanish")
	document.getElementById("ruleb").classList.add("vanish");
	let path = e.path || e.composedPath()
	let c = path[0].getAttribute("id")
	socket.emit("join",{roomid:c});
	MyRole=DF;
	ename = path[0].innerHTML.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#x27;/g,"'");
	gs=100;
}
function req(){
	socket.emit("req",{});
}
function Hishi(){
	console.log("形負け");
  if(MyRole==DF){lose=true}else{win=true}
  turn=null;
  socket.emit("end",{});
  socket.emit("leave");
}
socket.on("end",function(e){
	socket.emit("leave");
	if(e.dfwin && MyRole){win=true;}
	if(e.dfwin && !MyRole){lose = true;}
})
socket.on("error",function(){
	alert("エラーが発生しました。");
	location.reload();
})
function PtoP(x,y){
  let k = new Array(2);
  k[0]=x*ws+margin;
  k[1]=y*hs+margin;
  return k
}
function sonoba(x,y){
  x_= (x+m)%m;y_ = (y+m)%m;
  return boards[x_][y_]
}
function sonoba2(x,y){
  if(x<m && y<m && 0<=x && 0<=y){return boards[x][y]}else{return 0}
}
function draw() {
  sflag = win || lose;
  background(220);
  for(var i=0;i<m;i++){
    for(var j=0;j<m;j++){
      if(boards[i][j]==1){line(PtoP(i,j+1)[0],PtoP(i,j+1)[1],PtoP(i+1,j)[0],PtoP(i+1,j)[1]);}
      if(boards[i][j]==-1){line(PtoP(i,j)[0],PtoP(i,j)[1],PtoP(i+1,j+1)[0],PtoP(i+1,j+1)[1]);}
    }
  }
  for(var i=0;i<=m;i++){
    for(var j=0;j<=m;j++){
		if(clip){
		if((i-FirstPoint[0])**2 + (j-FirstPoint[1])**2 == 2){
			fill(255);
			x=Math.floor((FirstPoint[0]+i)/2);
			y=Math.floor((FirstPoint[1]+j)/2);
			if(FirstPoint[0]-i == FirstPoint[1]-j){
				if(MyRole){if(sonoba2(x+1,y+1)==-1 || sonoba2(x-1,y-1)==-1){fill(100,100,100)}}
			}else{
				if(MyRole){if(sonoba2(x-1,y+1)==1 || sonoba2(x+1,y-1)==1){fill(100,100,100)}}
			}
			if(boards[x][y]!=0){fill(100,100,100)}
			}else{fill(100,100,100)}
		}
	    ellipse(PtoP(i,j)[0], PtoP(i,j)[1], 10);
    }
  }
  if(dflag && !mouseIsPressed){ // マウス離す
clip=false;
    if(FinishPoint[0] != -1){
	  
      x=Math.floor((FirstPoint[0]+FinishPoint[0])/2);
      y=Math.floor((FirstPoint[1]+FinishPoint[1])/2);
      if(boards[x][y]==0){
        if(FinishPoint[0]-FirstPoint[0] == FinishPoint[1]-FirstPoint[1]){
          boards[x][y]=-1;
          if(MyRole){if(sonoba2(x+1,y+1)==-1 || sonoba2(x-1,y-1)==-1){boards[x][y]=0;}} //
		  iswin(x,y);
        }else{
          boards[x][y]=1;
          if(MyRole){if(sonoba2(x-1,y+1)==1 || sonoba2(x+1,y-1)==1){boards[x][y]=0;}} //
		  iswin(x,y);
        }
        if(boards[x][y]!=0){if(!bless){
			let sam__=0;let sa = 0;let sam_ = 0;
				for(var i=0;i<m;i++){
				for(var j=0;j<m;j++){
					sa = 0;
					if(MyRole){
						if(sonoba2(i+1,j+1)==-1 || sonoba2(i-1,j-1)==-1){sa++}
						if(sonoba2(i+1,j-1)==-1 || sonoba2(i-1,j+1)==1){sa++}
					}
					if(boards[i][j]!=0){sa=2;sam__+=2;}
					sam_ += sa;
				}
			}
			if(sam__ == m**2*2 && !win && !lose){if(MyRole){win=true}else{lose=true};socket.emit("end",{dfwin:true});turn=null}
			if(sam__ != m**2*2 && sam_ == m**2*2 && MyRole && !win && !lose){alert("線を引ける場所がないのでパスします。");socket.emit("action",{f:true})}
			turn=!turn;
			socket.emit("action",{x:x,y:y,st:boards[x][y],r:false});
			}else{bless=false;socket.emit("action",{x:x,y:y,st:boards[x][y],r:true});}
		}
      }
    }
  }
  if(mouseIsPressed && flag){
    let s = PtoP(FirstPoint[0],FirstPoint[1]);
    mx = mouseX;my = mouseY;FinishPoint[0] = -1;clip=true;
    for(var i=0;i<=m;i++){
      for(var j=0;j<=m;j++){
        if( (mouseX - i*ws-margin)**2 + (mouseY - j*hs-margin)**2 <=20**2 && (FirstPoint[0]-i)**2 + (FirstPoint[1]-j)**2==2){FinishPoint[0]=i;FinishPoint[1]=j;mx=PtoP(i,j)[0];my=PtoP(i,j)[1];}
      }
    }
    line(s[0],s[1],mx,my);
  }
  dflag = mouseIsPressed;
  fill(0)
  textAlign(CENTER);
  textSize(50);
  if(win){text("YOU WIN!",wid/2,hei/2)}
  if(lose){text("YOU LOSE",wid/2,hei/2)}
  if(gs){gs--;text("GAME START",wid/2,hei/2)}
  line(0,hei,wid,hei);
  textSize(20);
  let k = MyRole?"後攻":"先攻"
  text("対戦相手:" + ename ,wid/2,hei+20)
  if(MyRole!=turn){fill(200)}
  text("YOUR TURN" + "(" + k + ")",wid/2,hei+40)
  fill(255)
  if(document.getElementById("quitb").classList.contains("vanish") && (win || lose)){document.getElementById("quitb").classList.remove("vanish");}
}
function mousePressed(){
  flag = false;
  for(var i=0;i<=m;i++){
    for(var j=0;j<=m;j++){
      if( MyRole==turn && (mouseX - i*ws-margin)**2 + (mouseY - j*hs-margin)**2 <=20**2 ){FirstPoint[0]=i;FirstPoint[1]=j;flag = true;}
    }
  }
}
