(() => {
  const $ = s => document.querySelector(s);
  const canvas = $('#game'), ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const W = canvas.width, H = canvas.height;

  const overlays = {
    title: $('#titleScreen'), intro: $('#introScreen'), config: $('#configScreen'),
    briefing: $('#briefingScreen'), msg: $('#messageOverlay'), over: $('#gameOverScreen'), ending: $('#endingScreen')
  };
  const ui = {
    stage: $('#stageName'), hp: $('#hpText'), hpFill: $('#hpFill'), morale: $('#moraleText'), moraleFill: $('#moraleFill'),
    kills: $('#killText'), jar: $('#jarText'), status: $('#statusText')
  };

  const assets = {};
  const files = ['shibata','shibata_walk','enemy','spearman','ally','jar','heal','banner','fire','castle','ground','stone','slash'];
  files.forEach(n => { const img = new Image(); img.src = `images/${n}.png`; assets[n] = img; });

  const stages = [
    {name:'第一陣', title:'かかれ柴田', text:'敵陣へ踏み込み、斬って士気を高めよ。士気が満ちた時、斬撃ボタンはそのまま「かかれ柴田！」の号令になる。', objective:'25人を討ち取り、戦場を制圧せよ', goalKills:25, spawn:900, mode:'kills', terrain:'ground'},
    {name:'第二陣', title:'瓶割柴田', text:'敵はなお押し寄せる。ここから戦場に水瓶が現れる。斬って割れば、回復を失う代わりにその陣の攻勢が一気に強まる。', objective:'40人を討ち取り、包囲を破れ', goalKills:40, spawn:700, mode:'kills', terrain:'stone'},
    {name:'第三陣', title:'賤ヶ岳', text:'敵勢は圧倒的。まず敵を斬って北庄への退路を切り開き、その退路へ駆け込め。', objective:'60人討取後、画面上の「退路」へ到達せよ', goalKills:60, spawn:560, mode:'escape', terrain:'ground'},
    {name:'最終陣', title:'北庄城', text:'北庄城は包囲された。勝利条件はない。水瓶を割るか否かも含め、最後まで抗え。', objective:'倒れるまで戦え。討取数と生存時間が最終記録になる', goalKills:0, spawn:470, mode:'last', terrain:'stone'}
  ];

  const defaultBindings = { up:'ArrowUp', down:'ArrowDown', left:'ArrowLeft', right:'ArrowRight', action:'Space', pause:'KeyP' };
  const bindings = {...defaultBindings};
  const bindEls = { up:$('#bindUp'), down:$('#bindDown'), left:$('#bindLeft'), right:$('#bindRight'), action:$('#bindAction'), pause:$('#bindPause') };
  let bindingTarget = null;

  const state = {
    screen:'title', stageIndex:0, totalKills:0, charges:0, bottleBreaks:0,
    stageBottleBroken:false, finalSeconds:0, score:0, sound:true, paused:false, checkpoint:null
  };

  let player, enemies=[], allies=[], drops=[], fx=[], last=0, spawnAcc=0, stageKills=0, jarObj=null, escapeOpen=false, finalStart=0, raf=0;
  const keys = {up:false, down:false, left:false, right:false};

  function newPlayer(){
    return {x:W/2,y:H-45,hp:100,maxHp:100,morale:0,speed:78,attackCd:0,inv:0,dirX:0,dirY:-1,atkFlash:0,damage:1, moving:false, walkT:0};
  }

  function show(name){
    Object.values(overlays).forEach(o => o.classList.remove('active'));
    if(name) overlays[name].classList.add('active');
    state.screen = name || 'play';
  }

  function flash(text, ms=900){
    overlays.msg.textContent = text;
    overlays.msg.classList.add('active');
    setTimeout(() => overlays.msg.classList.remove('active'), ms);
  }

  function brief(i){
    state.stageIndex = i;
    const s = stages[i];
    $('#briefingTag').textContent = s.name;
    $('#briefingTitle').textContent = s.title;
    $('#briefingText').textContent = s.text;
    $('#briefingObjective').textContent = s.objective;

    // 陣説明へ切り替わった時点で右側HUDも次の陣へ同期する
    ui.stage.textContent = `${s.name} ${s.title}`;
    ui.hp.textContent = '100';
    ui.hpFill.style.width = '100%';
    ui.morale.textContent = '0';
    ui.moraleFill.style.width = '0%';
    ui.kills.textContent = '0';
    ui.jar.textContent = i === 0 ? 'なし' : '出現';
    ui.status.textContent = '戦闘前';

    show('briefing');
    startMusic('menu');
  }

  function resetCampaign(){
    state.totalKills=0; state.charges=0; state.bottleBreaks=0; state.stageBottleBroken=false;
    state.finalSeconds=0; state.score=0; state.paused=false; state.checkpoint=null;
    $('#pauseBtn').textContent='PAUSE';
  }

  function prettyCode(code){
    const map={Space:'SPACE',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',Escape:'ESC',Enter:'ENTER',ShiftLeft:'L-SHIFT',ShiftRight:'R-SHIFT'};
    if(map[code]) return map[code];
    if(code.startsWith('Key')) return code.slice(3);
    if(code.startsWith('Digit')) return code.slice(5);
    return code.replace('Numpad','NUM ');
  }

  function renderBindings(){
    Object.keys(bindEls).forEach(k => bindEls[k].textContent = prettyCode(bindings[k]));
    $('#legendMove').innerHTML = `<kbd>${prettyCode(bindings.up)}</kbd><kbd>${prettyCode(bindings.down)}</kbd><kbd>${prettyCode(bindings.left)}</kbd><kbd>${prettyCode(bindings.right)}</kbd> 移動`;
    $('#legendAction').textContent = prettyCode(bindings.action);
    $('#legendPause').textContent = prettyCode(bindings.pause);
  }

  function openConfig(){
    bindingTarget = null;
    document.querySelectorAll('.bind-btn').forEach(b => { b.classList.remove('waiting'); b.textContent='変更'; });
    $('#bindMessage').textContent='士気MAX時は、斬撃ボタンがそのまま「かかれ柴田！」に変わる。';
    renderBindings();
    show('config');
    startMusic('menu');
  }

  document.querySelectorAll('.bind-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bind-btn').forEach(b => { b.classList.remove('waiting'); b.textContent='変更'; });
      bindingTarget = btn.dataset.bind;
      btn.classList.add('waiting'); btn.textContent='入力待ち';
      $('#bindMessage').textContent=`「${btn.parentElement.querySelector('span').textContent}」に使うキーを押してください。`;
    });
  });

  $('#defaultBindBtn').onclick = () => {
    Object.assign(bindings, defaultBindings); bindingTarget=null; renderBindings();
    document.querySelectorAll('.bind-btn').forEach(b => { b.classList.remove('waiting'); b.textContent='変更'; });
    $('#bindMessage').textContent='初期設定に戻しました。';
  };

  $('#newGameBtn').onclick = () => { audioStart(); startMusic('menu'); show('intro'); };
  $('#introNextBtn').onclick = () => openConfig();
  $('#configStartBtn').onclick = () => { resetCampaign(); brief(0); };
  $('#briefingStartBtn').onclick = () => startStage(state.stageIndex);
  $('#retryBtn').onclick = () => startStage(state.stageIndex, true);
  $('#titleReturnBtn').onclick = () => returnToTitle();
  $('#endingRetryBtn').onclick = () => { resetCampaign(); brief(0); };

  $('#soundBtn').onclick = () => {
    state.sound = !state.sound;
    $('#soundBtn').textContent = state.sound ? '♪ ON' : '♪ OFF';
    if(!state.sound){ stopMusic(); return; }
    audioStart();
    if(state.screen==='play') startMusic(stages[state.stageIndex].mode==='last'?'last':'battle');
    else if(state.screen==='ending') startMusic('ending');
    else startMusic('menu');
  };

  $('#pauseBtn').onclick = () => {
    if(state.screen!=='play') return;
    state.paused = !state.paused;
    $('#pauseBtn').textContent = state.paused ? 'RESUME' : 'PAUSE';
    if(state.paused) stopMusic(); else { last=performance.now(); startMusic(stages[state.stageIndex].mode==='last'?'last':'battle'); }
  };

  function randomJarPosition(){
    const start={x:W/2,y:H-45};
    for(let i=0;i<30;i++){
      const p={x:34+Math.random()*(W-68), y:40+Math.random()*(H-92)};
      if(Math.hypot(p.x-start.x,p.y-start.y)>70) return p;
    }
    return {x:50,y:60};
  }

  function startStage(i, retry=false){
    cancelAnimationFrame(raf);
    if(retry && state.checkpoint){
      state.totalKills=state.checkpoint.totalKills; state.charges=state.checkpoint.charges; state.bottleBreaks=state.checkpoint.bottleBreaks; state.score=state.checkpoint.score;
    } else {
      state.checkpoint={totalKills:state.totalKills,charges:state.charges,bottleBreaks:state.bottleBreaks,score:state.score};
    }
    state.stageIndex=i; state.screen='play'; show(null); state.paused=false; state.stageBottleBroken=false;
    player=newPlayer(); enemies=[]; allies=[]; drops=[]; fx=[]; spawnAcc=0; stageKills=0; escapeOpen=false;
    jarObj=i === 0 ? null : randomJarPosition();
    const s=stages[i];
    if(s.mode==='last'){ finalStart=performance.now(); player.hp=120; player.maxHp=120; }
    ui.stage.textContent=`${s.name} ${s.title}`;
    ui.status.textContent=s.objective;
    updateHUD();
    if(i > 0) flash('水瓶あり',500);
    last=performance.now(); startMusic(s.mode==='last'?'last':'battle'); raf=requestAnimationFrame(loop);
  }

  function loop(t){
    const dt=Math.min((t-last)/1000,.035); last=t;
    if(state.screen!=='play') return;
    if(!state.paused) update(dt,t);
    draw(t);
    raf=requestAnimationFrame(loop);
  }

  function update(dt,t){
    const s=stages[state.stageIndex];
    if(s.mode==='last') state.finalSeconds=(t-finalStart)/1000;

    if(player.attackCd>0) player.attackCd-=dt;
    if(player.inv>0) player.inv-=dt;
    if(player.atkFlash>0) player.atkFlash-=dt;

    let dx=(keys.right?1:0)-(keys.left?1:0), dy=(keys.down?1:0)-(keys.up?1:0);
    player.moving=!!(dx||dy);
    if(player.moving){
      const l=Math.hypot(dx,dy); dx/=l; dy/=l; player.dirX=dx; player.dirY=dy;
      player.x+=dx*player.speed*dt; player.y+=dy*player.speed*dt; player.walkT+=dt;
    } else player.walkT=0;
    player.x=Math.max(9,Math.min(W-27,player.x)); player.y=Math.max(14,Math.min(H-31,player.y));

    // 勇猛システム：前に出るほど士気上昇、後退すると低下
    if(player.y<92) player.morale=Math.min(100,player.morale+6*dt*(state.stageBottleBroken?1.65:1));
    if(player.y>170) player.morale=Math.max(0,player.morale-9*dt);

    spawnAcc+=dt*1000;
    let spawnMs=s.spawn;
    if(s.mode==='last') spawnMs=Math.max(210,s.spawn-state.finalSeconds*4.5);
    if(spawnAcc>=spawnMs){
      spawnAcc=0;
      spawnEnemy(s.mode==='last'&&Math.random()<.32?'spear':Math.random()<.22?'spear':'grunt');
      if(s.mode==='last'&&state.finalSeconds>28&&Math.random()<.35) spawnEnemy('grunt');
    }

    if(s.mode==='escape'&&!escapeOpen&&stageKills>=s.goalKills){ escapeOpen=true; flash('退路が開いた！',1000); ui.status.textContent='画面上の退路へ到達せよ'; }
    if(s.mode==='escape'&&escapeOpen&&player.y<24){ state.score+=250; advance(); return; }
    if(s.mode==='kills'&&stageKills>=s.goalKills){ flash('勝鬨！',650); state.screen='transition'; setTimeout(()=>advance(),650); return; }

    enemies.forEach(e=>updateEnemy(e,dt));
    allies.forEach(a=>{ a.y-=150*dt; a.life-=dt; for(const e of enemies){ if(e.dead)continue; if(dist(a,e)<17){ hitEnemy(e,3,true); a.life=.01; break; } } });
    drops.forEach(d=>{ d.life-=dt; if(dist(player,d)<17 && d.type==='heal' && !state.stageBottleBroken){ player.hp=Math.min(player.maxHp,player.hp+22); beep(520,.06); d.life=0; } });
    fx.forEach(f=>f.life-=dt);
    enemies=enemies.filter(e=>!e.dead&&e.y<H+28&&e.x>-28&&e.x<W+28);
    allies=allies.filter(a=>a.life>0&&a.y>-30); drops=drops.filter(d=>d.life>0); fx=fx.filter(f=>f.life>0);
    updateHUD();
  }

  function spawnEnemy(type){
    let side=Math.floor(Math.random()*3),x,y;
    if(side===0){x=8+Math.random()*(W-16);y=-24}
    else if(side===1){x=-24;y=20+Math.random()*120}
    else{x=W+24;y=20+Math.random()*120}
    enemies.push({type,x,y,hp:type==='spear'?2:1,speed:type==='spear'?37:45,hitCd:0,dead:false,knockX:0,knockY:0});
  }

  function updateEnemy(e,dt){
    if(e.hitCd>0)e.hitCd-=dt;
    const dx=player.x-e.x,dy=player.y-e.y,l=Math.hypot(dx,dy)||1;
    e.x+=dx/l*e.speed*dt+e.knockX*dt; e.y+=dy/l*e.speed*dt+e.knockY*dt; e.knockX*=.86; e.knockY*=.86;
    if(l<16&&e.hitCd<=0){ e.hitCd=.7; damagePlayer(e.type==='spear'?16:11,dx/l,dy/l); }
  }

  function damagePlayer(amount,dx,dy){
    if(player.inv>0)return;
    player.hp-=amount; player.inv=.65; player.x+=dx*8; player.y+=dy*8; beep(110,.09); shake();
    if(player.hp<=0){
      player.hp=0; updateHUD();
      if(stages[state.stageIndex].mode==='last') endGame(); else fail('柴田勝家、ここに討死。','death');
    }
  }

  function performAction(){
    if(state.screen!=='play'||state.paused) return;
    if(player.morale>=100) special(); else attack();
  }

  function attack(){
    if(player.attackCd>0)return;
    player.attackCd=.28; player.atkFlash=.11; beep(260,.035);
    const ax=player.x+player.dirX*15, ay=player.y+player.dirY*15;
    for(const e of enemies){
      if(e.dead)continue;
      const d=Math.hypot(e.x-ax,e.y-ay);
      if(d<27){ const l=Math.hypot(e.x-player.x,e.y-player.y)||1; hitEnemy(e,player.damage,false,(e.x-player.x)/l,(e.y-player.y)/l); }
    }
    if(jarObj&&!state.stageBottleBroken&&Math.hypot(jarObj.x-ax,jarObj.y-ay)<31) shatterBottle();
  }

  function hitEnemy(e,dmg,ally=false,kx=0,ky=-1){
    e.hp-=dmg; e.knockX=kx*120; e.knockY=ky*120;
    if(e.hp<=0){
      e.dead=true; stageKills++; state.totalKills++; state.score+=10+(player.y<92?4:0);
      player.morale=Math.min(100,player.morale+(state.stageBottleBroken?17:9));
      fx.push({type:'burst',x:e.x,y:e.y,life:.28}); beep(390,.025);
      if(!state.stageBottleBroken&&player.hp<82&&Math.random()<.10) drops.push({type:'heal',x:e.x,y:e.y,life:7});
    }
  }

  function special(){
    if(player.morale<100)return;
    player.morale=0; state.charges++; state.score+=80;
    flash('かかれ柴田！',650); shake(); beep(90,.18); setTimeout(()=>beep(180,.16),120);
    for(let i=0;i<11;i++) allies.push({x:14+i*35+(Math.random()*8-4),y:H+10+Math.random()*18,life:2.1});
  }

  function shatterBottle(){
    if(state.stageBottleBroken||!jarObj)return;
    const bx=jarObj.x,by=jarObj.y;
    state.stageBottleBroken=true; state.bottleBreaks++;
    applyBottleBonus(true);
    fx.push({type:'jarburst',x:bx,y:by,life:.55}); jarObj=null;
    flash('瓶割柴田！',900); shake(); beep(70,.25); setTimeout(()=>beep(145,.08),80);
    ui.status.textContent='回復不能 / 攻撃・速度・士気 大幅UP';
  }

  function applyBottleBonus(score=true){ player.damage=1.75; player.speed=92; player.morale=100; if(score)state.score+=180; }

  function advance(){
    stopMusic(); state.score+=Math.floor(player.hp*1.5);
    const next=state.stageIndex+1; if(next>=stages.length)return endGame();
    state.screen='transition'; setTimeout(()=>brief(next),450);
  }

  function fail(msg,type='mission'){
    stopMusic(); cancelAnimationFrame(raf); state.screen='over';
    const death=type==='death';
    $('#gameOverLabel').textContent=death?'無念':'戦、ここに敗る';
    $('#gameOverTitle').textContent=death?'討死':'敗戦';
    $('#gameOverText').textContent=msg;
    show('over'); startMusic('menu');
  }

  function returnToTitle(){
    stopMusic(); cancelAnimationFrame(raf); resetCampaign();
    state.stageIndex=0; stageKills=0; player=null; enemies=[]; allies=[]; drops=[]; fx=[]; jarObj=null; escapeOpen=false;
    ui.stage.textContent='---'; ui.jar.textContent='--'; ui.status.textContent='出陣前'; updateHUD();
    show('title'); startMusic('menu'); requestAnimationFrame(attract);
  }

  function endGame(){
    stopMusic(); cancelAnimationFrame(raf); state.screen='ending';
    const survival=Math.round(state.finalSeconds);

    // 鬼柴田度は討取数を主軸に厳しく判定する。
    // 100人以下は30、900人以上で100。その間を段階的に補間する。
    const killsForJudge = state.totalKills;
    let raw;
    if(killsForJudge <= 100){
      raw = 30;
    } else if(killsForJudge >= 900){
      raw = 100;
    } else {
      raw = Math.round(30 + ((killsForJudge - 100) / 800) * 70);
    }

    let rank,copy;
    if(raw>=92){rank='かかれ柴田';copy='退かず、怯まず、最後まで前へ出た。もはや号令そのものがあなたの名となった。'}
    else if(raw>=75){rank='鬼柴田';copy='敵中へ踏み込み、味方を奮い立たせた。剛勇の名に恥じぬ戦いだった。'}
    else if(raw>=55){rank='猛将';copy='無理押しだけではない。生き残る判断を重ねながら、要所では前へ出た。'}
    else{rank='慎重なる勝家';copy='鬼柴田と呼ばれるには慎重だった。だが、最後まで戦場を見失うことはなかった。'}
    $('#endingRank').textContent=rank; $('#endingCopy').textContent=copy;
    $('#endKills').textContent=state.totalKills; $('#endCharges').textContent=state.charges; $('#endBottles').textContent=state.bottleBreaks; $('#endSurvival').textContent=`${survival}秒`; $('#endScore').textContent=raw;
    show('ending'); startMusic('ending');
  }

  function updateHUD(){
    const hp=player?.hp??100,maxHp=player?.maxHp??100,morale=player?.morale??0;
    ui.hp.textContent=Math.ceil(hp); ui.hpFill.style.width=`${Math.max(0,hp/maxHp*100)}%`;
    ui.morale.textContent=Math.floor(morale); ui.moraleFill.style.width=`${morale}%`; ui.kills.textContent=stageKills;
    ui.jar.textContent=state.screen==='play' ? (state.stageIndex===0?'なし':(state.stageBottleBroken?'破壊済':'あり')) : '--';
    const touch=$('#touchAttack');
    if(touch){ touch.textContent=morale>=100?'かかれ':'斬'; touch.classList.toggle('ready',morale>=100); }
    if(state.screen==='play'){
      if(morale>=100) ui.status.textContent='斬撃ボタンで「かかれ柴田！」';
      else if(state.stageBottleBroken) ui.status.textContent='瓶割り済：回復不能・攻勢強化';
      else if(player.y<92) ui.status.textContent='敵陣深く：士気上昇！';
      else if(player.y>170) ui.status.textContent='後退中：士気低下';
      else ui.status.textContent=stages[state.stageIndex].objective;
    }
  }

  function draw(t){
    const s=stages[state.stageIndex]||stages[0]; drawTiled(s.terrain); drawDecor(s.mode,t); if(escapeOpen)drawEscape(); if(jarObj)drawJar();
    drops.forEach(drawDrop); allies.forEach(drawAlly); enemies.forEach(drawEnemy); if(player)drawPlayer(); fx.forEach(drawFx); drawFrontLine();
    if(state.paused){ctx.fillStyle='#000a';ctx.fillRect(0,0,W,H);pixelText('PAUSE',W/2,H/2,'#f0d79a',18,'center')}
  }

  function drawTiled(tile){
    const im=assets[tile]; if(im&&im.complete){for(let y=0;y<H;y+=16)for(let x=0;x<W;x+=16)ctx.drawImage(im,x,y,16,16)}
    else{ctx.fillStyle='#49372c';ctx.fillRect(0,0,W,H)}
  }

  function drawDecor(mode,t){
    ctx.fillStyle='#0002';ctx.fillRect(0,0,W,18);
    for(let i=0;i<4;i++){const x=20+i*105;drawImg('banner',x,10,24,24)}
    if(mode==='last'){drawImg('castle',W/2-28,2,56,56);for(let i=0;i<5;i++){const x=20+i*84,y=160+(i%2)*18;drawImg('fire',x,y,21,21)}}
  }

  function drawFrontLine(){
    ctx.fillStyle='#d8b06122';ctx.fillRect(0,86,W,2);ctx.fillStyle='#1118';ctx.fillRect(0,170,W,2);
    pixelText('攻勢線',4,82,'#d9b366',7,'left');pixelText('後退線',4,181,'#9a8974',7,'left');
  }

  function drawPlayer(){
    const blink=player.inv>0&&Math.floor(performance.now()/70)%2===0;
    if(!blink){ const sprite=player.moving&&Math.floor(player.walkT*7)%2?'shibata_walk':'shibata'; drawImg(sprite,player.x-12,player.y-17,32,32); }
    if(player.atkFlash>0){ctx.save();ctx.translate(player.x+6,player.y);ctx.rotate(Math.atan2(player.dirY,player.dirX));drawImg('slash',4,-18,36,36);ctx.restore()}
  }
  function drawEnemy(e){drawImg(e.type==='spear'?'spearman':'enemy',e.x-10,e.y-15,28,28)}
  function drawAlly(a){drawImg('ally',a.x-9,a.y-14,26,26)}
  function drawDrop(d){drawImg('heal',d.x-8,d.y-8,17,17)}
  function drawJar(){drawImg('jar',jarObj.x-14,jarObj.y-17,30,30);if(!state.stageBottleBroken&&Math.hypot(player.x-jarObj.x,player.y-jarObj.y)<42)pixelText('斬って割れ！',jarObj.x,jarObj.y-23,'#f3d791',8,'center')}
  function drawEscape(){ctx.fillStyle='#d9b65b66';ctx.fillRect(W/2-36,0,72,22);pixelText('▲ 北庄への退路 ▲',W/2,13,'#ffe1a0',8,'center')}

  function drawFx(f){
    if(f.type==='burst'){ctx.fillStyle=`rgba(240,211,147,${f.life*2})`;for(let i=0;i<5;i++)ctx.fillRect(f.x+(i-2)*4,f.y+(i%2?5:-5),2,2)}
    if(f.type==='jarburst'){
      const a=Math.max(0,f.life/.55);ctx.fillStyle=`rgba(154,196,230,${a})`;
      for(let i=0;i<10;i++){const ang=i*.63,r=(1-a)*25+5;ctx.fillRect(f.x+Math.cos(ang)*r,f.y+Math.sin(ang)*r,3,3)}
      ctx.fillStyle=`rgba(226,205,173,${a})`;for(let i=0;i<6;i++)ctx.fillRect(f.x+(i-3)*5,f.y+((i%2)*7-3),3,4);
    }
  }

  function drawImg(name,x,y,w,h){const im=assets[name];if(im&&im.complete)ctx.drawImage(im,Math.round(x),Math.round(y),w,h)}
  function pixelText(txt,x,y,color='#fff',size=8,align='left'){ctx.save();ctx.font=`bold ${size}px monospace`;ctx.textAlign=align;ctx.fillStyle='#000';ctx.fillText(txt,x+1,y+1);ctx.fillStyle=color;ctx.fillText(txt,x,y);ctx.restore()}
  function dist(a,b){return Math.hypot((a.x||0)-(b.x||0),(a.y||0)-(b.y||0))}
  function shake(){const el=$('.screen-wrap');el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake')}

  // keyboard + touch
  document.addEventListener('keydown', e => {
    if(state.screen==='config' && bindingTarget){
      e.preventDefault();
      const old=bindings[bindingTarget], code=e.code;
      const other=Object.keys(bindings).find(k=>k!==bindingTarget&&bindings[k]===code);
      if(other) bindings[other]=old;
      bindings[bindingTarget]=code;
      document.querySelectorAll('.bind-btn').forEach(b=>{b.classList.remove('waiting');b.textContent='変更'});
      $('#bindMessage').textContent=`${prettyCode(code)} を割り当てました。`;
      bindingTarget=null; renderBindings(); return;
    }

    if(state.screen==='play'){
      if([bindings.up,bindings.down,bindings.left,bindings.right,bindings.action].includes(e.code)) e.preventDefault();
      if(e.code===bindings.up)keys.up=true;
      if(e.code===bindings.down)keys.down=true;
      if(e.code===bindings.left)keys.left=true;
      if(e.code===bindings.right)keys.right=true;
      if(e.code===bindings.action && !e.repeat) performAction();
      if(e.code===bindings.pause && !e.repeat) $('#pauseBtn').click();
    }
  });

  document.addEventListener('keyup', e => {
    if(e.code===bindings.up)keys.up=false;
    if(e.code===bindings.down)keys.down=false;
    if(e.code===bindings.left)keys.left=false;
    if(e.code===bindings.right)keys.right=false;
  });

  document.querySelectorAll('.pad').forEach(btn=>{
    const key=btn.dataset.key;
    btn.addEventListener('pointerdown',e=>{e.preventDefault();keys[key]=true;btn.setPointerCapture(e.pointerId)});
    btn.addEventListener('pointerup',()=>keys[key]=false);btn.addEventListener('pointercancel',()=>keys[key]=false);
  });
  $('#touchAttack').addEventListener('pointerdown',e=>{e.preventDefault();performAction()});

  // Original 16-bit-style BGM made with WebAudio (no external audio files)
  let ac=null,musicTimer=null,musicStep=0;
  const musicPatterns={
    menu:{step:210,melody:[220,0,262,0,294,262,247,0,220,0,196,220,247,0,196,0],bass:[110,0,110,0,98,0,98,0,92,0,92,0,98,0,110,0]},
    battle:{step:145,melody:[294,294,349,392,349,330,294,247,294,330,392,440,392,349,330,294],bass:[98,0,98,98,87,0,87,87,92,0,92,92,82,0,87,92]},
    last:{step:132,melody:[220,233,262,233,220,196,185,196,220,262,294,262,233,220,196,185],bass:[73,73,82,82,69,69,73,73,65,65,69,69,62,62,65,69]},
    ending:{step:310,melody:[220,262,294,0,262,247,220,0,196,220,247,0,220,196,185,0],bass:[73,0,82,0,73,0,65,0,62,0,73,0,65,0,55,0]}
  };
  function audioStart(){if(!ac)ac=new(window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume()}
  function tone(freq,dur=.08,vol=.028,type='square'){if(!state.sound||!freq)return;audioStart();const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(vol,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+dur);o.connect(g).connect(ac.destination);o.start();o.stop(ac.currentTime+dur)}
  function beep(freq,dur=.05,vol=.035){tone(freq,dur,vol,'square')}
  function startMusic(mode='battle'){
    if(!state.sound)return;audioStart();stopMusic();musicStep=0;const p=musicPatterns[mode]||musicPatterns.battle;
    const tick=()=>{if(!state.sound||state.paused)return;const i=musicStep++,m=p.melody[i%p.melody.length],b=p.bass[i%p.bass.length];if(m)tone(m,p.step/1000*.72,.021,'square');if(b)tone(b,p.step/1000*.90,.014,'triangle');if(mode==='battle'&&i%4===0)tone(55,.035,.010,'square');if(mode==='last'&&i%2===0)tone(49,.045,.012,'sawtooth')};
    tick();musicTimer=setInterval(tick,p.step);
  }
  function stopMusic(){if(musicTimer){clearInterval(musicTimer);musicTimer=null}}

  function attract(){
    if(state.screen==='title'){
      ctx.fillStyle='#33241d';ctx.fillRect(0,0,W,H);for(let y=0;y<H;y+=16)for(let x=0;x<W;x+=16)drawImg('ground',x,y,16,16);
      drawImg('castle',W/2-38,26,76,76);for(let i=0;i<6;i++)drawImg('fire',25+i*68,160+(i%2)*14,22,22);pixelText('1583',W/2,130,'#d7b261',14,'center');requestAnimationFrame(attract);
    }
  }

  renderBindings(); updateHUD(); requestAnimationFrame(attract);
})();
