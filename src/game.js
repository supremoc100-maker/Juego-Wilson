/* global Phaser */
(() => {
  const WORLD_W = 2200;
  const WORLD_H = 1400;

  const PEOPLE = [
    ["Leria del Río","F",24,"recolector"],["Kael de Ardan","M",25,"agricultor"],
    ["Mara de Valen","F",38,"constructor"],["Soren de Oria","M",37,"leñador"],
    ["Sena de Meria","F",29,"agricultor"],["Marek del Bosque","M",31,"cazador"],
    ["Ayla de Lume","F",22,"explorador"],["Tarin de Ardan","M",28,"recolector"],
    ["Neria del Río","F",26,"leñador"],["Loran de Valen","M",42,"constructor"],
    ["Tala de Oria","F",21,"agricultor"],["Eran de Meria","M",20,"cazador"],
    ["Elena del Bosque","F",34,"recolector"],["Narek de Lume","M",33,"explorador"],
    ["Mira de Ardan","F",14,"niño"],["Aren de Valen","M",13,"niño"],
    ["Saria del Río","F",11,"niño"],["Doran de Oria","M",10,"niño"],
    ["Vela de Meria","F",9,"niño"],["Tarek del Bosque","M",8,"niño"],
    ["Iria de Lume","F",7,"niño"],["Eron de Ardan","M",5,"niño"],
    ["Dara de Valen","F",4,"niño"],["Rian del Río","M",15,"niño"],["Nila de Oria","F",12,"niño"]
  ];

  const ROLE_COLORS = {
    agricultor:0x9c944f,cazador:0x76503e,explorador:0x476f78,constructor:0x9a7249,
    leñador:0x5d7549,recolector:0x6e6079,"niño":0xa18c70
  };
  const ROLE_ACCENTS = {
    agricultor:0xd4bc68,cazador:0xa78258,explorador:0x8ab3b3,constructor:0xc99559,
    leñador:0x96a963,recolector:0xa591af,"niño":0xc8ae83
  };
  const ROLE_LABEL = {
    agricultor:"Agricultura",cazador:"Caza",explorador:"Exploración",constructor:"Construcción",
    leñador:"Madera",recolector:"Recolección","niño":"Aprendizaje"
  };
  const ROLE_SPRITES = {
    agricultor:"medievalUnit_11.png",
    leñador:"medievalUnit_03.png",
    constructor:"medievalUnit_02.png",
    cazador:"medievalUnit_07.png",
    explorador:"medievalUnit_01.png",
    recolector:"medievalUnit_08.png",
    "niño":"medievalUnit_12.png"
  };
  const HOUSE_SPRITES = {
    home:["medievalStructure_09.png","medievalStructure_11.png","medievalStructure_17.png","medievalStructure_18.png","medievalStructure_19.png"],
    storage:["medievalStructure_21.png","medievalStructure_20.png"],
    workshop:["medievalStructure_16.png","medievalStructure_03.png"]
  };

  const ZONES = {
    home:{x:1070,y:720,r:250},
    farm:{x:480,y:980,r:180},
    forest:{x:1770,y:480,r:220},
    quarry:{x:1660,y:1050,r:160},
    hunt:{x:1880,y:800,r:180},
    explore:{x:2050,y:650,r:120},
    gather:{x:500,y:450,r:200},
    school:{x:1050,y:930,r:150}
  };

  let sceneRef;
  let timeScale = 1;
  let selected = null;
  let command = null;
  let dayMinutes = 7 * 60;
  let day = 1;
  let year = 0;
  let seasonIndex = 0;
  let food = 220;
  let mood = 78;
  let liveSnapshot = null;
  let liveWorldLabel = null;
  let liveMode = false;

  const seasons = ["Primavera","Verano","Otoño","Invierno"];
  const $ = id => document.getElementById(id);

  function hash(v){
    let h=2166136261;
    for(const ch of String(v)){ h^=ch.charCodeAt(0); h=Math.imul(h,16777619); }
    return h>>>0;
  }
  function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
  function seeded01(v){ return (hash(v)%10000)/10000; }

  class VillageScene extends Phaser.Scene {
    constructor(){ super("Village"); }

    preload(){
      this.load.atlasXML(
        "kenney",
        "./assets/kenney/medievalRTS_spritesheet@2.png",
        "./assets/kenney/medievalRTS_spritesheet@2.xml"
      );
    }

    create(){
      sceneRef=this;
      window.__wilsonScene=this;
      window.__wilsonStage="bounds";
      try{
        this.cameras.main.setBounds(0,0,WORLD_W,WORLD_H);
        this.physics.world.setBounds(0,0,WORLD_W,WORLD_H);
        window.__wilsonStage="drawWorld";
        this.drawWorld();
        window.__wilsonStage="drawVillage";
        this.drawVillage();
        window.__wilsonStage="createPeople";
        this.createPeople();
        window.__wilsonStage="lighting";
        this.createLighting();
        window.__wilsonStage="camera";
        this.setupCamera();
        this.cameras.main.centerOn(1080,720);
        this.cameras.main.setZoom(0.82);
        this.setupMiniMap();
        this.time.addEvent({delay:5200,loop:true,callback:()=>this.emitVillageEvent()});
        this.time.addEvent({delay:9000,loop:true,callback:()=>this.rebalanceTasks()});
        window.__wilsonStage="ready";
        this.loadLiveState();
      }catch(e){
        window.__wilsonError={message:e?.message||String(e),stack:e?.stack||""};
        window.__wilsonStage="error";
        throw e;
      }
    }

    drawWorld(){
      const g=this.add.graphics().setDepth(-20);
      g.fillStyle(0x71885f,1).fillRect(0,0,WORLD_W,WORLD_H);

      // broad terrain patches
      const patches=[
        [360,290,480,330,0x829568,.5],[1590,250,520,420,0x55744e,.55],
        [310,870,570,390,0x9b965b,.32],[1510,900,540,350,0x817967,.38]
      ];
      patches.forEach(([x,y,w,h,c,a])=>{g.fillStyle(c,a).fillEllipse(x,y,w,h)});

      // river
      const river=this.add.graphics().setDepth(-18);
      const cubic=(a,b,c,d,t)=>{
        const mt=1-t;
        return mt*mt*mt*a+3*mt*mt*t*b+3*mt*t*t*c+t*t*t*d;
      };
      const drawRiverSegment=(p0,p1,p2,p3)=>{
        for(let i=0;i<=34;i++){
          const t=i/34;
          const x=cubic(p0.x,p1.x,p2.x,p3.x,t);
          const y=cubic(p0.y,p1.y,p2.y,p3.y,t);
          river.fillStyle(0x648d8a,1).fillCircle(x,y,43);
          river.fillStyle(0x8fb5ad,.20).fillCircle(x-10,y-8,29);
        }
      };
      drawRiverSegment(
        {x:-40,y:120},{x:420,y:330},{x:340,y:710},{x:660,y:900}
      );
      drawRiverSegment(
        {x:660,y:900},{x:940,y:1080},{x:1180,y:1260},{x:1340,y:1450}
      );

      // paths
      const p=this.add.graphics().setDepth(-10);
      p.lineStyle(52,0x9b8764,.78);
      [[1080,720,490,980],[1080,720,1760,490],[1080,720,1650,1050],[1080,720,510,450]].forEach(([x1,y1,x2,y2])=>{
        p.beginPath();p.moveTo(x1,y1);p.lineTo(x2,y2);p.strokePath();
      });
      p.lineStyle(6,0xc4aa78,.35);
      p.strokeCircle(1080,720,165);

      // trees
      for(let i=0;i<120;i++){
        const h=hash("tree"+i);
        let x=1350+(h%810), y=110+((h>>>9)%610);
        if(i<30){x=80+(h%750);y=180+((h>>>7)%460)}
        this.makeTree(x,y,.75+((h>>>18)%55)/100);
      }
      for(let i=0;i<22;i++){
        const h=hash("rock"+i);
        this.makeRock(1450+(h%550),850+((h>>>8)%380),.8+((h>>>15)%40)/100);
      }

      // farm rows
      const farmBase=this.add.tileSprite(495,970,340,250,"kenney","medievalTile_13.png").setDepth(-8).setAlpha(.78);
      const f=this.add.graphics().setDepth(-7);
      f.fillStyle(0x6b5b2d,.16).fillRoundedRect(325,845,340,250,18);
      for(let i=0;i<9;i++){
        f.lineStyle(8,i%2?0xb8a653:0x7f773a,.90);
        f.lineBetween(350,875+i*23,638,875+i*23);
        if(i%2===0){
          for(let x=365;x<630;x+=34) f.fillStyle(0x6f8747,.95).fillCircle(x,875+i*23,4);
        }
      }

      // Ground texture: grass tufts, wild flowers and worn stones.
      for(let i=0;i<145;i++){
        const h=hash("ground-detail-"+i);
        const x=45+(h%2100), y=80+((h>>>9)%1240);
        if(Phaser.Math.Distance.Between(x,y,1080,720)<265)continue;
        const detail=this.add.container(x,y).setDepth(-6);
        if(i%5===0){
          detail.add(this.add.circle(0,0,2.2,[0xd0b86c,0xc98a78,0xe0d5a2][h%3],.72));
          detail.add(this.add.circle(4,-2,1.8,0xe8ddae,.55));
        }else{
          const blade1=this.add.rectangle(-2,0,2,9,0x526e46,.55).setAngle(-18);
          const blade2=this.add.rectangle(2,0,2,10,0x607d50,.55).setAngle(16);
          detail.add([blade1,blade2]);
        }
      }

      // zone labels
      this.zoneLabel(485,830,"CAMPOS");
      this.zoneLabel(1780,220,"BOSQUE");
      this.zoneLabel(1650,875,"CANTERA");
      this.zoneLabel(500,250,"RECOLECCIÓN");
    }

    zoneLabel(x,y,text){
      this.add.text(x,y,text,{fontFamily:"Manrope",fontSize:"18px",fontStyle:"700",color:"#e8e1c7",backgroundColor:"#263324aa",padding:{x:7,y:4}}).setOrigin(.5).setDepth(1);
    }

    makeTree(x,y,s=1){
      const h=hash("tree-style-"+Math.round(x)+"-"+Math.round(y));
      const frame=["medievalEnvironment_01.png","medievalEnvironment_02.png","medievalEnvironment_03.png","medievalEnvironment_04.png"][h%4];
      const shadow=this.add.ellipse(x+4,y+18,34*s,13*s,0x223025,.24).setDepth(y-1);
      const tree=this.add.image(x,y,"kenney",frame).setOrigin(.5,.78).setDepth(y);
      tree.setScale((1.15+((h>>>8)%24)/100)*s);
      return tree;
    }

    makeRock(x,y,s=1){
      const h=hash("rock-style-"+Math.round(x)+"-"+Math.round(y));
      const frame=["medievalEnvironment_07.png","medievalEnvironment_08.png","medievalEnvironment_09.png","medievalEnvironment_10.png","medievalEnvironment_15.png","medievalEnvironment_16.png"][h%6];
      const rock=this.add.image(x,y,"kenney",frame).setOrigin(.5,.78).setDepth(y);
      rock.setScale((.95+((h>>>7)%22)/100)*s);
      return rock;
    }

    drawVillage(){
      this.villageStructures=[];
      this.villageSmoke=[];
      const village=this.add.graphics().setDepth(-5);
      village.fillStyle(0x72845c,.75).fillCircle(1080,720,345);
      village.fillStyle(0x84906a,.28).fillCircle(1080,720,285);
      village.lineStyle(3,0x514c39,.38).strokeCircle(1080,720,345);

      // Small worn-earth patches around the settlement.
      const worn=this.add.graphics().setDepth(-4);
      [[980,690,150,65],[1170,725,170,70],[1060,820,180,56],[1080,610,180,58]].forEach(([x,y,w,h])=>{
        worn.fillStyle(0x9b8966,.20).fillEllipse(x,y,w,h);
      });

      const houses=[
        [885,610,"Vivienda","home",0],
        [1005,555,"Vivienda","home",1],
        [1165,575,"Vivienda","home",2],
        [1290,650,"Almacén","storage",1],
        [900,765,"Vivienda","home",2],
        [1025,820,"Taller","workshop",0],
        [1195,825,"Vivienda","home",1],
        [1320,760,"Vivienda","home",0]
      ];
      houses.forEach(([x,y,label,kind,variant],i)=>{
        this.villageStructures.push(this.makeHouse(x,y,label,kind,variant));
        if(i===0||i===2||i===6)this.villageSmoke.push(this.makeSmoke(x+34,y-62,0.75+i*.04));
      });

      // Fences and little work clutter make the settlement read as inhabited.
      this.makeFence(790,700,125,0);
      this.makeFence(1265,875,135,-8);
      this.makeCrate(1245,690,1);
      this.makeCrate(1270,704,.82);
      this.makeCrate(1065,855,.82);
      this.makeLogPile(825,790);
      this.makeCampfire(1115,745);

      // well
      const well=this.add.container(1080,690).setDepth(705);
      const wellShadow=this.add.ellipse(1,17,58,21,0x263126,.22);
      const stone=this.add.ellipse(0,8,54,27,0x716f60).setStrokeStyle(2,0x4d5048);
      const water=this.add.ellipse(0,4,41,18,0x355f65).setStrokeStyle(1,0x9aa99a,.35);
      const postL=this.add.rectangle(-18,-19,6,47,0x65492f);
      const postR=this.add.rectangle(18,-19,6,47,0x65492f);
      const beam=this.add.rectangle(0,-40,44,6,0x65492f);
      const rope=this.add.rectangle(0,-21,2,30,0xa9966b);
      well.add([wellShadow,stone,water,postL,postR,beam,rope]);

      this.add.text(1080,455,"PRIMER ASENTAMIENTO",{fontFamily:"Spectral",fontSize:"24px",fontStyle:"700",color:"#f6edd2",backgroundColor:"#152019cc",padding:{x:11,y:5}}).setOrigin(.5).setDepth(5000);
    }

    makeHouse(x,y,label,kind="home",variant=0){
      const frames=HOUSE_SPRITES[kind]||HOUSE_SPRITES.home;
      const frame=frames[variant%frames.length];
      const c=this.add.container(x,y).setDepth(y+42);
      const scale=kind==="storage"?1.45:kind==="workshop"?1.38:1.42;
      const shadow=this.add.ellipse(4,28,118,34,0x1e2b22,.28);
      const sprite=this.add.image(0,0,"kenney",frame).setOrigin(.5,.72).setScale(scale);
      c.add([shadow,sprite]);

      // Warm windows / work glow keep the settlement feeling occupied.
      const glow=this.add.circle(kind==="workshop"?16:8,5,9,0xf5b957,.18);
      glow.setBlendMode(Phaser.BlendModes.ADD);
      c.add(glow);
      this.tweens.add({targets:glow,alpha:{from:.10,to:.25},scale:{from:.85,to:1.15},duration:1200,yoyo:true,repeat:-1});

      const tag=this.add.text(0,47,label,{
        fontFamily:"Manrope",fontSize:"10px",fontStyle:"700",color:"#f6edd5",
        backgroundColor:"#17221ad8",padding:{x:6,y:3}
      }).setOrigin(.5);
      c.add(tag);
      return c;
    }

    makeSmoke(x,y,scale=1){
      const smoke=this.add.container(x,y).setDepth(4000);
      for(let i=0;i<4;i++){
        const puff=this.add.circle(i*2,0,6+i*2,0xd8d2c4,.28-i*.04);
        smoke.add(puff);
        this.tweens.add({
          targets:puff,
          y:-42-i*8,x:Phaser.Math.Between(-10,12),
          alpha:0,scale:1.45,
          duration:2400+i*260,repeat:-1,delay:i*520
        });
      }
      smoke.setScale(scale);
      return smoke;
    }

    makeFence(x,y,length=120,angle=0){
      const c=this.add.container(x,y).setDepth(y+10).setAngle(angle);
      const rail1=this.add.rectangle(0,-5,length,5,0x80603e);
      const rail2=this.add.rectangle(0,7,length,5,0x6b5036);
      c.add([rail1,rail2]);
      for(let px=-length/2;px<=length/2;px+=30)c.add(this.add.rectangle(px,1,6,31,0x705237));
    }

    makeCrate(x,y,s=1){
      const c=this.add.container(x,y).setDepth(y+30).setScale(s);
      const shadow=this.add.ellipse(2,8,31,11,0x243026,.2);
      const box=this.add.rectangle(0,0,25,22,0x89643f).setStrokeStyle(2,0x5c432e);
      const slat=this.add.rectangle(0,0,23,3,0xb08758,.7);
      c.add([shadow,box,slat]);
    }

    makeLogPile(x,y){
      const c=this.add.container(x,y).setDepth(y+30);
      const shadow=this.add.ellipse(0,10,60,16,0x253027,.18);
      c.add(shadow);
      for(let i=0;i<4;i++){
        const log=this.add.rectangle(-19+i*13,0-(i%2)*8,34,9,0x765235).setAngle(i%2?8:-5).setStrokeStyle(1,0x4f3928);
        const end=this.add.circle(-4+i*13,0-(i%2)*8,4,0xb18959).setStrokeStyle(1,0x5b422c);
        c.add([log,end]);
      }
    }

    makeCampfire(x,y){
      const c=this.add.container(x,y).setDepth(y+50);
      c.add(this.add.ellipse(0,10,52,18,0x263127,.20));
      c.add(this.add.rectangle(-8,5,30,6,0x5c412c).setAngle(22));
      c.add(this.add.rectangle(8,5,30,6,0x5c412c).setAngle(-22));
      const glow=this.add.circle(0,-3,18,0xe89b42,.16);
      const flame=this.add.triangle(0,-10,-9,11,0,-14,9,11,0xe99a3f);
      const core=this.add.triangle(0,-7,-5,7,0,-10,5,7,0xf4d26d);
      c.add([glow,flame,core]);
      this.tweens.add({targets:[flame,core,glow],scaleY:{from:.9,to:1.12},scaleX:{from:1,to:.92},duration:430,yoyo:true,repeat:-1});
    }

    syncBuildings(buildingRows){
      if(!Array.isArray(buildingRows)||!buildingRows.length)return;
      for(const item of this.villageStructures||[])item?.destroy(true);
      for(const item of this.villageSmoke||[])item?.destroy(true);
      this.villageStructures=[];
      this.villageSmoke=[];

      const positions=[
        [885,610],[1005,555],[1165,575],[1290,650],[900,765],[1025,820],
        [1195,825],[1320,760],[1080,525],[1380,690],[825,690],[1220,510]
      ];
      const visual=[];
      for(const row of buildingRows){
        const count=Math.max(0,Number(row.count||0));
        for(let i=0;i<count;i++)visual.push({type:String(row.type||"vivienda"),index:i});
      }
      visual.slice(0,positions.length).forEach((b,i)=>{
        const [x,y]=positions[i];
        let kind="home",label="Vivienda";
        if(["almacen","almacén","storage"].includes(b.type)){kind="storage";label="Almacén"}
        else if(["taller","workshop"].includes(b.type)){kind="workshop";label="Taller"}
        else if(["granja","farm"].includes(b.type)){kind="home";label="Granja"}
        const structure=this.makeHouse(x,y,label,kind,i%3);
        this.villageStructures.push(structure);
        if(i%2===0)this.villageSmoke.push(this.makeSmoke(x+30,y-58,.72+(i%3)*.06));
      });
    }

    createPeople(source=PEOPLE){
      this.people=[];
      source.forEach((raw,i)=>{
        let data;
        if(Array.isArray(raw)){
          const [name,sex,age,role]=raw;
          data={id:i+1,name,sex,age,role,live:false};
        }else{
          data={
            id:raw.id,
            name:raw.name,
            sex:raw.sex,
            age:Math.max(0,Math.floor(Number(raw.age_months||0)/12)),
            role:raw.profession||"recolector",
            live:true,
            health:Number(raw.health??100),
            energy:Number(raw.energy??100),
            hunger:Number(raw.hunger??0),
            prestige:Number(raw.prestige??0),
            discipline:Number(raw.discipline??50),
            curiosity:Number(raw.curiosity??50),
            perception:Number(raw.perception??50),
            strength:Number(raw.strength??50),
            intelligence:Number(raw.intelligence??50),
            charisma:Number(raw.charisma??50),
            courage:Number(raw.courage??50),
            sociability:Number(raw.sociability??50),
            ambition:Number(raw.ambition??50),
            followed:!!raw.followed,
            partner_id:raw.partner_id??null,
            father_id:raw.father_id??null,
            mother_id:raw.mother_id??null,
            agriculture:Number(raw.agriculture??0),
            hunting:Number(raw.hunting??0),
            building:Number(raw.building??0),
            gathering:Number(raw.gathering??0),
            exploration:Number(raw.exploration??0)
          };
        }
        const h=hash(data.name+"-"+data.id);
        const x=920+(h%320), y=610+((h>>>8)%250);
        const person=this.makePerson({...data,x,y});
        this.people.push(person);
        this.scheduleNext(person,500+i*70);
      });
      $("populationStat").textContent=this.people.length;
    }

    clearPeople(){
      for(const person of this.people||[]){
        this.tweens.killTweensOf(person);
        if(person.parts?.sprite)this.tweens.killTweensOf(person.parts.sprite);
        person.destroy(true);
      }
      this.people=[];
      if(selected){
        $("personPanel").classList.add("hidden");
        selected=null;
      }
    }

    async loadLiveState(){
      try{
        const response=await fetch("/api/state",{credentials:"same-origin",headers:{"Accept":"application/json"}});
        if(!response.ok)throw new Error("state "+response.status);
        const snapshot=await response.json();
        this.applySnapshot(snapshot,true);
        liveMode=true;
        window.__wilsonLive=true;
        this.startLivePolling();
        showActivity("Simulación persistente conectada. La aldea refleja el estado real del mundo.");
      }catch(err){
        liveMode=false;
        window.__wilsonLive=false;
        window.__wilsonLiveError=String(err?.message||err);
        const mode=$("dataMode");
        if(mode)mode.textContent="Demo visual";
      }
    }

    applySnapshot(snapshot,replacePeople=false){
      if(!snapshot?.world||!snapshot?.settlement)return;
      liveSnapshot=snapshot;
      liveWorldLabel=snapshot.world.label||null;
      food=Math.round(Number(snapshot.settlement.food||0));
      mood=Math.round(Number(snapshot.summary?.average_health||100));

      const settlementName=$("settlementName");
      if(settlementName)settlementName.textContent=snapshot.settlement.name||"Primer Asentamiento";
      $("populationStat").textContent=String(snapshot.summary?.population??snapshot.people?.length??0);
      $("foodStat").textContent=String(Math.round(Number(snapshot.settlement.food||0)));
      const wood=$("woodStat"); if(wood)wood.textContent=String(Math.round(Number(snapshot.settlement.wood||0)));
      const stone=$("stoneStat"); if(stone)stone.textContent=String(Math.round(Number(snapshot.settlement.stone||0)));
      const health=$("healthStat"); if(health)health.textContent=`${Math.round(Number(snapshot.summary?.average_health||100))}%`;
      const mode=$("dataMode"); if(mode)mode.textContent="Simulación persistente";

      const latest=snapshot.events?.[0];
      if(latest)updateEvent(latest.title,latest.description);
      renderEventList(snapshot.events||[]);
      renderObjectives(snapshot);
      if(Array.isArray(snapshot.buildings))this.syncBuildings(snapshot.buildings);

      if(replacePeople&&Array.isArray(snapshot.people)){
        this.clearPeople();
        this.createPeople(snapshot.people.filter(p=>p.alive!==false));
      }
      updateClock();
    }

    startLivePolling(){
      if(window.__wilsonPoll)clearInterval(window.__wilsonPoll);
      window.__wilsonPoll=setInterval(()=>this.refreshLiveState(),60000);
    }

    async refreshLiveState(){
      if(!liveMode)return;
      try{
        const response=await fetch("/api/state",{credentials:"same-origin",headers:{"Accept":"application/json"}});
        if(!response.ok)return;
        const snapshot=await response.json();
        const next=(snapshot.people||[]).filter(p=>p.alive!==false);
        const currentSig=(this.people||[]).map(p=>`${p.person.id}:${p.person.role}`).sort().join("|");
        const nextSig=next.map(p=>`${p.id}:${p.profession}`).sort().join("|");
        if(currentSig!==nextSig){
          this.applySnapshot(snapshot,true);
        }else{
          const byId=new Map(next.map(p=>[p.id,p]));
          for(const visual of this.people){
            const raw=byId.get(visual.person.id);
            if(!raw)continue;
            visual.person.health=Number(raw.health??visual.person.health);
            visual.person.energy=Number(raw.energy??visual.person.energy);
            visual.person.prestige=Number(raw.prestige??visual.person.prestige);
            visual.person.followed=!!raw.followed;
            visual.person.discipline=Number(raw.discipline??visual.person.discipline);
            visual.person.curiosity=Number(raw.curiosity??visual.person.curiosity);
            visual.person.perception=Number(raw.perception??visual.person.perception);
            visual.parts.marker.setVisible(visual.person.followed||visual===selected);
          }
          this.applySnapshot(snapshot,false);
          if(selected)updatePersonPanel(selected);
        }
      }catch{}
    }

    makePerson(data){
      const isChild=data.age<16;
      const c=this.add.container(data.x,data.y).setDepth(data.y+100);

      const shadow=this.add.ellipse(0,15,isChild?20:28,isChild?7:9,0x18221b,.30);
      const ring=this.add.ellipse(0,15,isChild?28:38,isChild?12:16)
        .setStrokeStyle(2,0xf2d276).setFillStyle(0x000000,0).setVisible(false);

      const frame=ROLE_SPRITES[data.role]||ROLE_SPRITES.recolector;
      const sprite=this.add.image(0,0,"kenney",frame).setOrigin(.5,.76);
      const baseScale=isChild?.92:1.38;
      sprite.setScale(baseScale);

      // Profession badge: tiny and readable at mobile zoom.
      const badgeColor=ROLE_COLORS[data.role]||0x777777;
      const badge=this.add.circle(12,-21,isChild?3:4,badgeColor).setStrokeStyle(1,0xf2e6c8,.75);

      const marker=this.add.circle(0,-39,4,0xd7bd70).setVisible(false);
      const label=this.add.text(0,-53,data.name.split(" ")[0],{
        fontFamily:"Manrope",fontSize:"11px",fontStyle:"700",color:"#fff7df",
        backgroundColor:"#17221ad9",padding:{x:4,y:2}
      }).setOrigin(.5).setVisible(false);

      c.add([shadow,ring,sprite,badge,marker,label]);
      c.setSize(48,64).setInteractive(new Phaser.Geom.Rectangle(-24,-48,48,68),Phaser.Geom.Rectangle.Contains);
      c.person={
        ...data,
        health:data.health??(96-(hash(data.name+"h")%9)),
        energy:data.energy??(70+(hash(data.name+"e")%28)),
        prestige:data.prestige??(hash(data.name+"p")%26),
        discipline:data.discipline??(35+hash(data.name+"d")%61),
        curiosity:data.curiosity??(35+hash(data.name+"c")%61),
        perception:data.perception??(35+hash(data.name+"q")%61),
        followed:data.followed??false,
        activity:"En casa",
        home:{x:data.x,y:data.y}
      };
      c.parts={marker,ring,label,sprite,badge,baseScale};
      c.on("pointerdown",(pointer)=>{
        pointer.event.stopPropagation?.();
        selectPerson(c);
      });
      return c;
    }

    targetFor(person){
      const r=person.person.role;
      let zone=ZONES.home, activity="Descansando";
      if(r==="agricultor"){zone=ZONES.farm;activity="Trabajando en los campos"}
      else if(r==="leñador"){zone=ZONES.forest;activity="Cortando madera"}
      else if(r==="constructor"){zone=command==="housing"?ZONES.home:ZONES.quarry;activity=command==="housing"?"Levantando una vivienda":"Preparando materiales"}
      else if(r==="cazador"){zone=ZONES.hunt;activity="Rastreando animales"}
      else if(r==="explorador"){zone=ZONES.explore;activity="Reconociendo la frontera"}
      else if(r==="recolector"){zone=ZONES.gather;activity="Recolectando alimentos"}
      else if(r==="niño"){zone=ZONES.school;activity="Aprendiendo y ayudando"}

      if(command==="food" && ["recolector","agricultor","cazador"].includes(r)){activity="Prioridad: conseguir alimentos"}
      if(command==="explore" && r==="explorador"){activity="Expedición prioritaria"}
      if(command==="storage" && r==="constructor"){zone=ZONES.home;activity="Ampliando reservas"}
      if(command==="expand" && r==="explorador"){zone=ZONES.explore;activity="Midiendo terreno para expansión"}

      const h=hash(person.person.name+"-"+day+"-"+Math.floor(dayMinutes/60)+"-"+Math.random());
      const a=(h%628)/100, rad=(h>>>9)%zone.r;
      return {x:zone.x+Math.cos(a)*rad,y:zone.y+Math.sin(a)*rad,activity};
    }

    scheduleNext(person,delay=400){
      this.time.delayedCall(delay,()=>{
        if(!person.active)return;
        const t=this.targetFor(person);
        person.person.activity=t.activity;
        const dist=Phaser.Math.Distance.Between(person.x,person.y,t.x,t.y);
        const speed=person.person.age<16?72:96;
        const duration=Math.max(700,(dist/speed)*1000);
        const sprite=person.parts.sprite;
        const base=person.parts.baseScale;

        person.walkTween?.stop();
        sprite.setFlipX(t.x<person.x);
        person.walkTween=this.tweens.add({
          targets:sprite,
          y:{from:0,to:-3},
          angle:{from:-1.8,to:1.8},
          scaleY:{from:base*.97,to:base*1.03},
          duration:180,yoyo:true,repeat:-1
        });

        this.tweens.add({
          targets:person,x:t.x,y:t.y,duration,ease:"Sine.easeInOut",
          onUpdate:()=>{person.setDepth(person.y+100)},
          onComplete:()=>{
            person.walkTween?.stop();
            sprite.setY(0).setAngle(0).setScale(base);
            this.tweens.add({targets:sprite,y:{from:0,to:-1.5},duration:600,yoyo:true,repeat:1});
            if(selected===person)updatePersonPanel(person);
            this.scheduleNext(person,900+Math.random()*1700);
          }
        });
      });
    }

    rebalanceTasks(){
      if(command){
        const count=this.people.filter(p=>p.person.role!=="niño").length;
        showActivity(`El consejo mantiene la prioridad de ${commandLabel(command)}. ${count} adultos ajustan sus rutinas.`);
      }
    }

    createLighting(){
      this.night=this.add.rectangle(WORLD_W/2,WORLD_H/2,WORLD_W,WORLD_H,0x0b1830,0).setDepth(9000).setScrollFactor(1);
      this.night.setBlendMode(Phaser.BlendModes.MULTIPLY);
      this.night.disableInteractive();
    }

    setupMiniMap(){
      const mapWidth=180,mapHeight=128,pad=12;
      this.miniCam=this.cameras.add(0,0,mapWidth,mapHeight,false,"minimap");
      this.miniCam.setBounds(0,0,WORLD_W,WORLD_H);
      this.miniCam.setBackgroundColor("#1b2a20");
      this.miniCam.setZoom(.105);
      this.miniCam.centerOn(1080,720);
      this.miniCam.roundPixels=true;

      const layout=()=>{
        const visible=this.scale.width>780;
        this.miniCam.setVisible(visible);
        if(visible){
          this.miniCam.setViewport(
            Math.max(0,this.scale.width-mapWidth-pad),
            Math.max(0,this.scale.height-mapHeight-pad),
            mapWidth,mapHeight
          );
        }
      };
      layout();
      this.scale.on("resize",layout);
    }

    setupCamera(){
      this.input.on("wheel",(_p,_go,_dx,dy)=>{
        const cam=this.cameras.main;
        cam.setZoom(clamp(cam.zoom-dy*0.0006,.48,1.45));
      });

      let dragging=false,lastX=0,lastY=0,downX=0,downY=0;
      this.input.on("pointerdown",p=>{
        if(!p.leftButtonDown())return;
        dragging=true;lastX=p.x;lastY=p.y;downX=p.x;downY=p.y;
      });
      this.input.on("pointermove",p=>{
        if(!dragging||!p.isDown)return;
        const cam=this.cameras.main;
        cam.scrollX-=(p.x-lastX)/cam.zoom;cam.scrollY-=(p.y-lastY)/cam.zoom;
        lastX=p.x;lastY=p.y;
      });
      this.input.on("pointerup",p=>{
        const wasTap=Phaser.Math.Distance.Between(downX,downY,p.x,p.y)<9;
        dragging=false;
        if(!wasTap)return;
        const world=this.cameras.main.getWorldPoint(p.x,p.y);
        let nearest=null,best=48;
        for(const person of this.people){
          const d=Phaser.Math.Distance.Between(world.x,world.y,person.x,person.y);
          if(d<best){best=d;nearest=person}
        }
        if(nearest)selectPerson(nearest);
      });

      // Fallback táctil directo sobre el canvas. Es más fiable en navegadores móviles
      // y mantiene la selección correcta aunque la cámara tenga zoom o desplazamiento.
      const canvas=this.game.canvas;
      canvas.addEventListener("click",e=>{
        const rect=canvas.getBoundingClientRect();
        const px=(e.clientX-rect.left)*(canvas.width/rect.width);
        const py=(e.clientY-rect.top)*(canvas.height/rect.height);
        const world=this.cameras.main.getWorldPoint(px,py);
        let nearest=null,best=58;
        for(const person of this.people){
          const d=Phaser.Math.Distance.Between(world.x,world.y,person.x,person.y);
          if(d<best){best=d;nearest=person}
        }
        if(nearest)selectPerson(nearest);
      });
    }

    emitVillageEvent(){
      const pool=this.people.filter(p=>p.person.role!=="niño");
      const p=Phaser.Utils.Array.GetRandom(pool);
      const messages=[
        `${p.person.name} continúa ${p.person.activity.toLowerCase()}.`,
        `${p.person.name} intercambió noticias con otra familia en el centro de la aldea.`,
        `Se escuchan herramientas cerca de ${p.person.name}; la jornada continúa.`,
        `El consejo registra avances en ${ROLE_LABEL[p.person.role].toLowerCase()}.`
      ];
      showActivity(Phaser.Utils.Array.GetRandom(messages));
      updateEvent("Actividad cotidiana",Phaser.Utils.Array.GetRandom(messages));
    }

    update(_time,delta){
      if(timeScale===0){ this.tweens.timeScale=0; this.time.timeScale=0; return; }
      this.tweens.timeScale=timeScale;
      this.time.timeScale=timeScale;
      const minutesAdvance=delta*0.0045*timeScale;
      dayMinutes+=minutesAdvance;
      if(dayMinutes>=1440){
        dayMinutes-=1440;day++;
        if(day>30){day=1;seasonIndex=(seasonIndex+1)%4;if(seasonIndex===0)year++}
        if(!liveMode){
          food=Math.max(0,food-2+Math.floor(Math.random()*5));
          mood=clamp(mood+(Math.random()>.5?1:-1),62,92);
        }
      }

      const hour=dayMinutes/60;
      let darkness=0;
      if(hour<6)darkness=.48-(hour/6)*.34;
      else if(hour<18)darkness=.04;
      else darkness=.04+((hour-18)/6)*.44;
      this.night.setAlpha(darkness);

      updateClock();
    }
  }

  function selectPerson(person){
    if(selected){
      selected.parts.ring.setVisible(false);
      selected.parts.label.setVisible(false);
      selected.parts.marker.setVisible(selected.person.followed);
    }
    selected=person;
    person.parts.ring.setVisible(true);
    person.parts.label.setVisible(true);
    person.parts.marker.setVisible(true);
    updatePersonPanel(person);
  }

  function updatePersonPanel(person){
    const p=person.person;
    $("personPanel").classList.remove("hidden");
    $("personName").textContent=p.name;
    $("personMeta").textContent=`${p.age} años · ${p.role} · ${p.sex==="F"?"mujer":"hombre"}`;
    $("personActivity").textContent=p.activity;
    $("personHealth").textContent=`${p.health}%`;
    $("personEnergy").textContent=`${Math.round(p.energy)}%`;
    $("personPrestige").textContent=p.prestige;
    $("personSkills").innerHTML=[
      ["Disciplina",Math.round(p.discipline??50)],
      ["Curiosidad",Math.round(p.curiosity??50)],
      ["Percepción",Math.round(p.perception??50)]
    ].map(([k,v])=>`<span>${k} ${v}</span>`).join("");
    $("followPerson").textContent=p.followed?"★ Siguiendo esta vida":"☆ Seguir esta vida";
  }

  function updateClock(){
    const h=Math.floor(dayMinutes/60),m=Math.floor(dayMinutes%60);
    const time=`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
    $("worldDate").textContent=liveWorldLabel?`${liveWorldLabel} · ${time}`:`Año ${year} · ${seasons[seasonIndex]} · Día ${day} · ${time}`;
    $("foodStat").textContent=food;
    const health=$("healthStat"); if(health)health.textContent=`${mood}%`;
  }

  function commandLabel(c){
    return ({food:"alimentos",housing:"viviendas",explore:"exploración",storage:"reservas",expand:"expansión"})[c]||c;
  }
  function showActivity(text){$("activityToast").querySelector("strong").textContent=text}
  function updateEvent(title,text){$("eventTitle").textContent=title;$("eventText").textContent=text}

  function renderEventList(events){
    const root=$("eventList");
    if(!root)return;
    root.innerHTML="";
    const symbols={
      nacimiento:"✦",muerte:"†",construccion:"⌂",familia:"♥",
      politica:"⚑",bestia:"!",mayoria_edad:"↑",exploracion:"⌖"
    };
    for(const event of (events||[]).slice(0,5)){
      const row=document.createElement("div");
      const icon=document.createElement("span");
      const text=document.createElement("p");
      icon.textContent=symbols[event.category]||"●";
      text.textContent=event.title||event.description||"Evento de la comunidad";
      row.append(icon,text);
      root.append(row);
    }
    if(!root.children.length){
      const row=document.createElement("div");
      const icon=document.createElement("span"); icon.textContent="●";
      const text=document.createElement("p"); text.textContent="La comunidad continúa su historia.";
      row.append(icon,text); root.append(row);
    }
  }

  function renderObjectives(snapshot){
    const root=$("objectiveList");
    if(!root)return;
    const pop=Number(snapshot.summary?.population||0);
    const foodMonths=Number(snapshot.summary?.food_months||0);
    const homes=Number((snapshot.buildings||[]).find(b=>b.type==="vivienda")?.count||0);
    const regions=(snapshot.regions||[]).length;
    const items=[
      {done:pop>=25,text:`Mantener 25 habitantes (${pop})`},
      {done:foodMonths>=6,text:`Reservas para 6 meses (${foodMonths.toFixed(1)})`},
      {done:homes>=5,text:`Construir 5 viviendas (${homes}/5)`},
      {done:regions>=5,text:`Explorar 5 regiones (${Math.min(regions,5)}/5)`}
    ];
    root.innerHTML="";
    for(const item of items){
      const row=document.createElement("div");
      if(item.done)row.classList.add("done");
      const icon=document.createElement("i"); icon.textContent=item.done?"✓":"○";
      const text=document.createElement("span"); text.textContent=item.text;
      row.append(icon,text); root.append(row);
    }
  }

  const config={
    type:Phaser.AUTO,parent:"game",backgroundColor:"#71885f",
    width:1280,height:760,physics:{default:"arcade",arcade:{debug:false}},
    scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},
    scene:[VillageScene],render:{antialias:true,pixelArt:false}
  };
  new Phaser.Game(config);

  document.querySelectorAll("[data-speed]").forEach(btn=>btn.addEventListener("click",()=>{
    timeScale=Number(btn.dataset.speed);
    document.querySelectorAll("[data-speed]").forEach(b=>b.classList.toggle("active",b===btn));
    showActivity(timeScale===0?"El mundo está en pausa.":`El tiempo avanza a velocidad ×${timeScale}.`);
  }));
  $("zoomIn").addEventListener("click",()=>{if(sceneRef){const c=sceneRef.cameras.main;c.setZoom(clamp(c.zoom+.12,.48,1.45))}});
  $("zoomOut").addEventListener("click",()=>{if(sceneRef){const c=sceneRef.cameras.main;c.setZoom(clamp(c.zoom-.12,.48,1.45))}});
  $("centerCamera").addEventListener("click",()=>{if(sceneRef){sceneRef.cameras.main.pan(1080,720,450,"Sine.easeInOut")}});
  document.querySelectorAll("[data-view]").forEach(btn=>btn.addEventListener("click",()=>{
    if(!sceneRef)return;
    const view=btn.dataset.view;
    if(view==="village"){
      sceneRef.cameras.main.pan(1080,720,450,"Sine.easeInOut");
      showActivity("Vista centrada en el asentamiento.");
    }else if(view==="people"){
      const target=sceneRef.people.find(p=>p.person.followed)||sceneRef.people.slice().sort((a,b)=>(b.person.prestige||0)-(a.person.prestige||0))[0];
      if(target){
        selectPerson(target);
        sceneRef.cameras.main.pan(target.x,target.y,400,"Sine.easeInOut");
      }
    }else if(view==="resources"){
      const s=liveSnapshot?.settlement;
      showActivity(s?`Reservas: ${Math.round(Number(s.food||0))} comida · ${Math.round(Number(s.wood||0))} madera · ${Math.round(Number(s.stone||0))} piedra.`:"Los recursos aparecerán al conectar la simulación persistente.");
    }else if(view==="explore"){
      sceneRef.cameras.main.pan(ZONES.explore.x,ZONES.explore.y,500,"Sine.easeInOut");
      showActivity("La cámara se desplaza hacia la frontera de exploración.");
    }else if(view==="council"){
      const panel=document.querySelector(".command-bar");
      panel?.classList.add("attention");
      setTimeout(()=>panel?.classList.remove("attention"),850);
      showActivity("El consejo espera una orden estratégica.");
    }else if(view==="history"){
      const panel=document.querySelector(".event-strip");
      panel?.classList.add("attention");
      setTimeout(()=>panel?.classList.remove("attention"),850);
      showActivity("Mostrando los acontecimientos recientes de la comunidad.");
    }
  }));
  $("closePerson").addEventListener("click",()=>{
    $("personPanel").classList.add("hidden");
    if(selected){selected.parts.ring.setVisible(false);selected.parts.label.setVisible(false);selected.parts.marker.setVisible(selected.person.followed)}
    selected=null;
  });
  $("followPerson").addEventListener("click",async()=>{
    if(!selected)return;
    if(selected.person.live){
      try{
        const response=await fetch("/api/follow",{
          method:"POST",credentials:"same-origin",
          headers:{"Content-Type":"application/json","Accept":"application/json"},
          body:JSON.stringify({person_id:selected.person.id})
        });
        if(!response.ok)throw new Error("follow "+response.status);
        const snapshot=await response.json();
        liveSnapshot=snapshot;
        const updated=snapshot.people?.find(p=>p.id===selected.person.id);
        selected.person.followed=updated?!!updated.followed:!selected.person.followed;
      }catch(err){
        showActivity("No se pudo guardar el seguimiento. Verifica que estés conectado como propietario.");
        return;
      }
    }else{
      selected.person.followed=!selected.person.followed;
    }
    selected.parts.marker.setVisible(selected.person.followed||selected===selected);
    updatePersonPanel(selected);
    showActivity(selected.person.followed?`Ahora sigues la vida de ${selected.person.name}.`:`Dejaste de seguir a ${selected.person.name}.`);
  });
  document.querySelectorAll("[data-command]").forEach(btn=>btn.addEventListener("click",async()=>{
    command=btn.dataset.command;
    document.querySelectorAll("[data-command]").forEach(b=>b.classList.toggle("active",b===btn));
    showActivity(`Orden enviada: priorizar ${commandLabel(command)}. La población decidirá cómo responder.`);
    updateEvent("Nueva orden estratégica",`La comunidad recibió la instrucción de priorizar ${commandLabel(command)} durante los próximos ciclos.`);

    if(liveMode){
      try{
        const response=await fetch("/api/order",{
          method:"POST",credentials:"same-origin",
          headers:{"Content-Type":"application/json","Accept":"application/json"},
          body:JSON.stringify({type:command,weight:35})
        });
        if(!response.ok)throw new Error("order "+response.status);
        const snapshot=await response.json();
        sceneRef?.applySnapshot(snapshot,false);
        showActivity(`Orden persistida: priorizar ${commandLabel(command)}.`);
      }catch(err){
        showActivity("La orden visual se aplicó, pero no pudo persistirse. Verifica tu sesión de Hatchable.");
      }
    }
  }));
})();