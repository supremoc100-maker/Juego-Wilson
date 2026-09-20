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
        this.time.addEvent({delay:5200,loop:true,callback:()=>this.emitVillageEvent()});
        this.time.addEvent({delay:9000,loop:true,callback:()=>this.rebalanceTasks()});
        window.__wilsonStage="ready";
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
      const f=this.add.graphics().setDepth(-7);
      f.fillStyle(0x7d713a,.86).fillRoundedRect(330,850,330,240,18);
      for(let i=0;i<9;i++){f.lineStyle(8,i%2?0xb3a452:0x918741,.85);f.lineBetween(350,875+i*23,638,875+i*23)}

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
      const c=this.add.container(x,y).setDepth(y);
      const shadow=this.add.ellipse(5,23,50*s,18*s,0x243326,.20);
      const trunk=this.add.rectangle(0,15,10*s,34*s,0x614932).setStrokeStyle(1,0x493624,.45);
      const trunkHi=this.add.rectangle(-2,12,2*s,25*s,0x876849,.45);
      const baseColor=[0x315337,0x3a5d3b,0x426842][h%3];
      const lightColor=[0x50794c,0x557f50,0x5b844f][(h>>>4)%3];
      const crown1=this.add.circle(0,-10,22*s,baseColor);
      const crown2=this.add.circle(-14*s,-2,17*s,baseColor);
      const crown3=this.add.circle(15*s,-1,18*s,baseColor);
      const crown4=this.add.circle(3*s,-24,15*s,lightColor,.94);
      const glint=this.add.circle(-8*s,-15*s,7*s,0x759665,.28);
      c.add([shadow,trunk,trunkHi,crown1,crown2,crown3,crown4,glint]);
      return c;
    }

    makeRock(x,y,s=1){
      const r=this.add.ellipse(x,y,34*s,20*s,0x77776a).setDepth(y);
      this.add.ellipse(x-5*s,y-5*s,20*s,8*s,0x999887,.45).setDepth(y+.1);
      return r;
    }

    drawVillage(){
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
        this.makeHouse(x,y,label,kind,variant);
        if(i===0||i===2||i===6)this.makeSmoke(x+34,y-62,0.75+i*.04);
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
      const c=this.add.container(x,y).setDepth(y+42);
      const widths=[82,90,76], heights=[58,64,55];
      const w=kind==="storage"?104:kind==="workshop"?96:widths[variant%3];
      const h=kind==="storage"?68:kind==="workshop"?62:heights[variant%3];
      const roofColor=kind==="storage"?0x574636:kind==="workshop"?0x72452f:[0x846044,0x73513a,0x906b49][variant%3];
      const wallColor=kind==="storage"?0xb29268:kind==="workshop"?0xbc9870:[0xc6a77b,0xbfa27c,0xcfb487][variant%3];

      const shadow=this.add.ellipse(5,h/2+14,w+30,30,0x223025,.24);
      const wall=this.add.rectangle(0,0,w,h,wallColor).setStrokeStyle(2,0x6c5339,.8);
      const lower=this.add.rectangle(0,h/2-7,w-5,12,0x9b7a55,.28);
      const roof=this.add.triangle(0,-h/2-27,-w*.66,18,0,-40,w*.66,18,roofColor).setStrokeStyle(2,0x493225,.85);
      const roofBand=this.add.rectangle(0,-h/2-8,w+12,6,0x5b3b2d,.55);
      const beamL=this.add.rectangle(-w/2+10,0,4,h-4,0x76583a,.6);
      const beamR=this.add.rectangle(w/2-10,0,4,h-4,0x76583a,.6);
      const door=this.add.rectangle(0,h/2-13,17,28,0x5b3d2d).setStrokeStyle(1,0x40291f);
      const latch=this.add.circle(5,h/2-14,1.8,0xd1aa65);
      const winColor=0x739397;
      const window1=this.add.rectangle(-w*.27,-3,13,12,winColor).setStrokeStyle(2,0x5b4935);
      const window2=this.add.rectangle(w*.27,-3,13,12,winColor).setStrokeStyle(2,0x5b4935);

      c.add([shadow,wall,lower,roof,roofBand,beamL,beamR,door,latch,window1,window2]);

      if(kind==="storage"){
        const sign=this.add.rectangle(0,-3,34,12,0x6f5638).setStrokeStyle(1,0x463322);
        const brace1=this.add.rectangle(-30,5,4,44,0x715238).setAngle(-12);
        const brace2=this.add.rectangle(30,5,4,44,0x715238).setAngle(12);
        c.add([sign,brace1,brace2]);
      }
      if(kind==="workshop"){
        const awning=this.add.rectangle(w/2+7,9,27,8,0x6c4b34).setAngle(-7);
        const bench=this.add.rectangle(w/2+18,24,32,6,0x765437);
        c.add([awning,bench]);
      }

      const chimney=this.add.rectangle(w*.28,-h/2-38,12,29,0x776456).setStrokeStyle(1,0x4b4039);
      c.add(chimney);

      const tag=this.add.text(0,h/2+28,label,{fontFamily:"Manrope",fontSize:"10px",fontStyle:"600",color:"#f6edd5",backgroundColor:"#17221ac7",padding:{x:5,y:2}}).setOrigin(.5);
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

    createPeople(){
      this.people=[];
      PEOPLE.forEach((raw,i)=>{
        const [name,sex,age,role]=raw;
        const h=hash(name);
        const x=920+(h%320), y=610+((h>>>8)%250);
        const person=this.makePerson({id:i+1,name,sex,age,role,x,y});
        this.people.push(person);
        this.scheduleNext(person,500+i*90);
      });
    }

    makePerson(data){
      const isChild=data.age<16;
      const c=this.add.container(data.x,data.y).setDepth(data.y+100);
      const scale=isChild?.78:1;
      c.setScale(scale);

      const shadow=this.add.ellipse(0,17,26,9,0x1b261e,.28);
      const ring=this.add.ellipse(0,17,34,15).setStrokeStyle(2,0xf2d276).setFillStyle(0x000000,0).setVisible(false);

      // Legs and arms create a readable walking silhouette.
      const legL=this.add.rectangle(-5,8,5,16,0x4e4337).setOrigin(.5,0);
      const legR=this.add.rectangle(5,8,5,16,0x4e4337).setOrigin(.5,0);
      const body=this.add.rectangle(0,-1,18,28,ROLE_COLORS[data.role]||0x777777).setStrokeStyle(1,0x344239,.65);
      body.setRoundedRadius?.(5);
      const belt=this.add.rectangle(0,4,18,4,0x493c30,.8);
      const accent=this.add.rectangle(0,-8,17,4,ROLE_ACCENTS[data.role]||0xb99d65,.9);
      const armL=this.add.rectangle(-12,-1,5,20,ROLE_COLORS[data.role]||0x777777).setOrigin(.5,.15);
      const armR=this.add.rectangle(12,-1,5,20,ROLE_COLORS[data.role]||0x777777).setOrigin(.5,.15);

      const skin=data.sex==="F"?0xd9ac83:0xc99b75;
      const head=this.add.circle(0,-22,8.5,skin).setStrokeStyle(1,0x694b39,.45);
      const hairColor=["0x4b3529","0x674a31","0x3c3028"][hash(data.name)%3];
      const hair=this.add.arc(0,-25,8.5,180,360,false,Number(hairColor));
      if(data.sex==="F"&&!isChild){
        c.add(this.add.ellipse(6,-19,6,14,Number(hairColor)).setAngle(18));
      }

      const marker=this.add.circle(0,-42,4,0xd7bd70).setVisible(false);
      const label=this.add.text(0,-56,data.name.split(" ")[0],{fontFamily:"Manrope",fontSize:"11px",fontStyle:"700",color:"#fff7df",backgroundColor:"#17221ad9",padding:{x:4,y:2}}).setOrigin(.5).setVisible(false);

      c.add([shadow,ring,legL,legR,armL,armR,body,belt,accent,head,hair]);
      this.addRoleAccessory(c,data.role,isChild);
      c.add([marker,label]);

      c.setSize(46,64).setInteractive(new Phaser.Geom.Rectangle(-23,-48,46,68),Phaser.Geom.Rectangle.Contains);
      c.person={...data,health:96-(hash(data.name+"h")%9),energy:70+(hash(data.name+"e")%28),prestige:hash(data.name+"p")%26,followed:false,activity:"En casa",home:{x:data.x,y:data.y}};
      c.parts={marker,ring,label,body,legL,legR,armL,armR};
      c.on("pointerdown",(pointer)=>{
        pointer.event.stopPropagation?.();
        selectPerson(c);
      });
      return c;
    }

    addRoleAccessory(c,role,isChild){
      if(isChild){
        const scarf=this.add.rectangle(0,-12,18,4,0xd1a86a,.9);
        c.add(scarf);
        return;
      }
      if(role==="agricultor"){
        const brim=this.add.rectangle(0,-31,23,4,0xc4a85f);
        const hat=this.add.ellipse(0,-34,14,8,0xb5944e);
        c.add([brim,hat]);
      }else if(role==="leñador"){
        const handle=this.add.rectangle(17,-2,3,27,0x6a4b31).setAngle(-18);
        const axe=this.add.rectangle(22,-14,10,7,0x8a8b83).setAngle(-18);
        c.add([handle,axe]);
      }else if(role==="constructor"){
        const handle=this.add.rectangle(17,-2,3,24,0x6c4d31).setAngle(-16);
        const hammer=this.add.rectangle(20,-13,11,5,0x777875).setAngle(-16);
        c.add([handle,hammer]);
      }else if(role==="cazador"){
        const bow=this.add.arc(17,-3,11,250,110,false).setStrokeStyle(2,0x7a5636);
        const string=this.add.line(0,0,17,-14,17,9,0xcab994,.8);
        c.add([bow,string]);
      }else if(role==="explorador"){
        const pack=this.add.rectangle(-10,-1,9,20,0x644b36).setStrokeStyle(1,0x3d3127);
        const cloak=this.add.triangle(-3,5,-10,-9,-3,18,5,-9,0x385c63,.68);
        c.add([pack,cloak]);
      }else if(role==="recolector"){
        const basket=this.add.ellipse(15,7,16,11,0x8a6a43).setStrokeStyle(2,0x60492f);
        c.add(basket);
      }
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

        person.walkTween?.stop();
        person.parts.body.setScale(1.03,.97);
        person.walkTween=this.tweens.add({
          targets:[person.parts.legL,person.parts.armR],
          angle:{from:-13,to:13},duration:190,yoyo:true,repeat:-1
        });
        person.walkTween2=this.tweens.add({
          targets:[person.parts.legR,person.parts.armL],
          angle:{from:13,to:-13},duration:190,yoyo:true,repeat:-1
        });

        this.tweens.add({
          targets:person,x:t.x,y:t.y,duration,ease:"Sine.easeInOut",
          onUpdate:()=>{person.setDepth(person.y+100)},
          onComplete:()=>{
            person.walkTween?.stop();person.walkTween2?.stop();
            person.parts.legL.setAngle(0);person.parts.legR.setAngle(0);
            person.parts.armL.setAngle(0);person.parts.armR.setAngle(0);
            person.parts.body.setScale(1);
            this.tweens.add({targets:person.parts.body,scaleY:{from:.97,to:1.03},duration:650,yoyo:true,repeat:1});
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
        food=Math.max(0,food-2+Math.floor(Math.random()*5));
        mood=clamp(mood+(Math.random()>.5?1:-1),62,92);
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
      ["Disciplina",35+hash(p.name+"d")%61],["Curiosidad",35+hash(p.name+"c")%61],
      ["Percepción",35+hash(p.name+"q")%61]
    ].map(([k,v])=>`<span>${k} ${v}</span>`).join("");
    $("followPerson").textContent=p.followed?"★ Siguiendo esta vida":"☆ Seguir esta vida";
  }

  function updateClock(){
    const h=Math.floor(dayMinutes/60),m=Math.floor(dayMinutes%60);
    $("worldDate").textContent=`Año ${year} · ${seasons[seasonIndex]} · Día ${day} · ${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
    $("foodStat").textContent=food;
    $("moodStat").textContent=`${mood}%`;
  }

  function commandLabel(c){
    return ({food:"alimentos",housing:"viviendas",explore:"exploración",storage:"reservas",expand:"expansión"})[c]||c;
  }
  function showActivity(text){$("activityToast").querySelector("strong").textContent=text}
  function updateEvent(title,text){$("eventTitle").textContent=title;$("eventText").textContent=text}

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
  $("closePerson").addEventListener("click",()=>{
    $("personPanel").classList.add("hidden");
    if(selected){selected.parts.ring.setVisible(false);selected.parts.label.setVisible(false);selected.parts.marker.setVisible(selected.person.followed)}
    selected=null;
  });
  $("followPerson").addEventListener("click",()=>{
    if(!selected)return;
    selected.person.followed=!selected.person.followed;
    selected.parts.marker.setVisible(selected.person.followed||selected===selected);
    updatePersonPanel(selected);
    showActivity(selected.person.followed?`Ahora sigues la vida de ${selected.person.name}.`:`Dejaste de seguir a ${selected.person.name}.`);
  });
  document.querySelectorAll("[data-command]").forEach(btn=>btn.addEventListener("click",()=>{
    command=btn.dataset.command;
    document.querySelectorAll("[data-command]").forEach(b=>b.classList.toggle("active",b===btn));
    showActivity(`Orden enviada: priorizar ${commandLabel(command)}. La población decidirá cómo responder.`);
    updateEvent("Nueva orden estratégica",`La comunidad recibió la instrucción de priorizar ${commandLabel(command)} durante los próximos ciclos.`);
  }));
})();