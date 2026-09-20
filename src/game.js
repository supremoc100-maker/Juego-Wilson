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
  const CHARACTER_ASSETS = {
    "agricultor_M":"./assets/characters/agricultor_M.svg",
    "agricultor_F":"./assets/characters/agricultor_F.svg",
    "leñador_M":"./assets/characters/le%C3%B1ador_M.svg",
    "leñador_F":"./assets/characters/le%C3%B1ador_F.svg",
    "constructor_M":"./assets/characters/constructor_M.svg",
    "constructor_F":"./assets/characters/constructor_F.svg",
    "cazador_M":"./assets/characters/cazador_M.svg",
    "cazador_F":"./assets/characters/cazador_F.svg",
    "explorador_M":"./assets/characters/explorador_M.svg",
    "explorador_F":"./assets/characters/explorador_F.svg",
    "recolector_M":"./assets/characters/recolector_M.svg",
    "recolector_F":"./assets/characters/recolector_F.svg",
    "niño_M":"./assets/characters/nino_M.svg",
    "niño_F":"./assets/characters/nino_F.svg"
  };
  function characterKey(role,sex,age){
    const base=age<16?"niño":(CHARACTER_ASSETS[`${role}_${sex}`]?role:"recolector");
    return `${base}_${sex==="F"?"F":"M"}`;
  }
  function characterUrl(role,sex,age){
    return CHARACTER_ASSETS[characterKey(role,sex,age)]||CHARACTER_ASSETS.recolector_M;
  }
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
  const activeCommands = new Set();
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
      for(const [key,url] of Object.entries(CHARACTER_ASSETS)){
        this.load.svg("wilson_"+key,url);
      }
    }

    create(){
      sceneRef=this;
      window.__wilsonScene=this;
      window.__wilsonStage="bounds";
      try{
        this.cameras.main.setBounds(0,0,WORLD_W,WORLD_H);
        this.physics.world.setBounds(0,0,WORLD_W,WORLD_H);
        this.resourceTrees=[];
        this.storyStructures=[];
        this.storyEffects=[];
        this.projectVisuals=[];
        this.visualStory={
          logsDelivered:0,
          cropsDelivered:0,
          explorationTrips:0,
          expansionProgress:0,
          expansionActive:false,
          constructionIndex:0,
          construction:null
        };
        window.__wilsonStage="drawWorld";
        this.drawWorld();
        window.__wilsonStage="drawVillage";
        this.drawVillage();
        this.createWorldStories();
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
      const container=this.add.container(x,y).setDepth(y);
      const shadow=this.add.ellipse(4,18,34*s,13*s,0x223025,.24);
      const tree=this.add.image(0,0,"kenney",frame).setOrigin(.5,.78);
      tree.setScale((1.15+((h>>>8)%24)/100)*s);
      container.add([shadow,tree]);
      const node={
        id:"tree-"+this.resourceTrees.length,
        x,y,container,tree,shadow,
        zone:x>1300?"forest":"gather",
        harvested:false,reserved:false
      };
      this.resourceTrees.push(node);
      return container;
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
      return c;
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
      return c;
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

    syncBuildings(buildingRows,buildingInstances=null){
      const instances=Array.isArray(buildingInstances)&&buildingInstances.length
        ? buildingInstances
        : null;
      if(!instances&&(!Array.isArray(buildingRows)||!buildingRows.length))return;

      for(const item of this.villageStructures||[])item?.destroy(true);
      for(const item of this.villageSmoke||[])item?.destroy(true);
      this.villageStructures=[];
      this.villageSmoke=[];

      const fallbackLayouts={
        vivienda:[[885,610],[1005,555],[1165,575],[900,765],[1195,825],[1320,760],[1080,525],[1380,690]],
        almacen:[[1260,680],[1210,610]],granja:[[545,815],[420,805],[640,830]],
        carpinteria:[[1435,675],[1500,760]],taller:[[1435,675],[1500,760]]
      };

      const rows=[];
      if(instances){
        for(const item of instances){
          rows.push({...item,x:Number(item.x),y:Number(item.y)});
        }
      }else{
        const used=Object.create(null);
        for(const row of buildingRows){
          const type=String(row.type||"vivienda");
          const key=type==="almacén"?"almacen":type;
          const count=Math.max(0,Number(row.count||0));
          for(let i=0;i<count;i++){
            const idx=used[key]||0;used[key]=idx+1;
            const list=fallbackLayouts[key]||fallbackLayouts.vivienda;
            const [x,y]=list[idx%list.length];
            rows.push({id:`fallback-${key}-${idx}`,type:key,x,y,name:key});
          }
        }
      }

      rows.forEach((row,idx)=>{
        const key=String(row.type||"vivienda");
        const x=Number(row.x),y=Number(row.y);
        if(!Number.isFinite(x)||!Number.isFinite(y))return;
        let kind="home",label="Vivienda";
        if(key==="almacen"){kind="storage";label="Almacén"}
        else if(key==="granja"){kind="home";label="Granja"}
        else if(key==="carpinteria"||key==="taller"){kind="workshop";label="Carpintería"}
        const structure=this.makeHouse(x,y,label,kind,idx%3);
        structure.setData("buildingId",row.id);
        structure.setData("buildingType",key);
        this.villageStructures.push(structure);
        if(key==="granja"){
          this.villageStructures.push(this.makeFence(x-35,y+55,100,-4));
        }
        if(key==="carpinteria"||key==="taller"){
          this.villageStructures.push(this.makeLogPile(x+55,y+35));
        }
        if(key!=="granja" && idx%2===0)this.villageSmoke.push(this.makeSmoke(x+30,y-58,.72+(idx%3)*.06));
      });
    }

    makePersistentProject(row){
      const x=Number(row.x),y=Number(row.y),v=clamp(Number(row.progress||0),0,1);
      const container=this.add.container(x,y).setDepth(y+25);
      const shadow=this.add.ellipse(0,24,112,29,0x223025,.22);
      const earth=this.add.rectangle(0,13,104,52,0x927b58,.52).setStrokeStyle(2,0x685641,.75);
      const foundation=this.add.rectangle(0,11,84,40,0xb2a27c,.28).setStrokeStyle(3,0x6e6658,.8);
      const postA=this.add.rectangle(-33,-2,7,58,0x74543a).setOrigin(.5,1);
      const postB=this.add.rectangle(33,-2,7,58,0x74543a).setOrigin(.5,1);
      const beam=this.add.rectangle(0,-42,78,7,0x76563b);
      const roof=this.add.triangle(0,-54,-52,17,0,-30,52,17,0x76513b);
      const labelMap={vivienda:"VIVIENDA",almacen:"ALMACÉN",granja:"GRANJA",carpinteria:"CARPINTERÍA"};
      const sign=this.add.text(0,46,`${labelMap[row.type]||"OBRA"} · ${Math.round(v*100)}%`,{
        fontFamily:"Manrope",fontSize:"10px",fontStyle:"700",color:"#f3e6bf",
        backgroundColor:"#17221ad5",padding:{x:6,y:3}
      }).setOrigin(.5);
      container.add([shadow,earth,foundation,postA,postB,beam,roof,sign]);
      const view={
        id:row.id,type:row.type,x,y,container,foundation,postA,postB,beam,roof,sign,
        progress:v,complete:false,persistent:true
      };
      postA.setScale(1,.15+.85*clamp((v-.16)/.30,0,1));
      postB.setScale(1,.15+.85*clamp((v-.16)/.30,0,1));
      foundation.setAlpha(.28+.55*Math.min(1,v/.25));
      beam.setAlpha(clamp((v-.42)/.16,0,1));
      roof.setAlpha(clamp((v-.68)/.20,0,1));
      return view;
    }

    syncProjects(projectRows){
      for(const view of this.projectVisuals||[])view?.container?.destroy(true);
      this.projectVisuals=[];
      if(this.visualStory?.construction?.container&&!this.visualStory.construction.persistent){
        this.visualStory.construction.container.destroy(true);
      }
      this.visualStory.construction=null;

      for(const row of projectRows||[]){
        const view=this.makePersistentProject(row);
        this.projectVisuals.push(view);
      }
      if(this.projectVisuals.length){
        this.visualStory.construction=this.projectVisuals[0];
      }
    }

    createWorldStories(){
      this.expansionVisual=this.add.container(0,0).setDepth(-2);
      this.expansionTrail=this.add.graphics().setDepth(-9);
      this.expansionArea=this.add.graphics().setDepth(-8);
      this.expansionLabel=this.add.text(1860,215,"FRONTERA",{fontFamily:"Manrope",fontSize:"12px",fontStyle:"700",color:"#d6cfb1",backgroundColor:"#17221abb",padding:{x:7,y:3}}).setOrigin(.5).setDepth(3000).setAlpha(.55);
      this.ensureConstructionProject(false);
    }

    ensureConstructionProject(force=false){
      if(liveMode)return this.visualStory.construction;
      if(this.visualStory.construction&&!this.visualStory.construction.complete)return;
      const sites=[
        {x:1455,y:730},{x:1515,y:620},{x:1415,y:865},{x:1600,y:725}
      ];
      const site=sites[this.visualStory.constructionIndex%sites.length];
      this.visualStory.constructionIndex++;
      const container=this.add.container(site.x,site.y).setDepth(site.y+25);
      const shadow=this.add.ellipse(0,24,112,29,0x223025,.22);
      const earth=this.add.rectangle(0,13,104,52,0x927b58,.52).setStrokeStyle(2,0x685641,.75);
      const foundation=this.add.rectangle(0,11,84,40,0xb2a27c,.28).setStrokeStyle(3,0x6e6658,.8);
      const postA=this.add.rectangle(-33,-2,7,58,0x74543a).setOrigin(.5,1).setScale(1,0.15);
      const postB=this.add.rectangle(33,-2,7,58,0x74543a).setOrigin(.5,1).setScale(1,0.15);
      const beam=this.add.rectangle(0,-42,78,7,0x76563b).setAlpha(0);
      const roof=this.add.triangle(0,-54,-52,17,0,-30,52,17,0x76513b).setAlpha(0);
      const sign=this.add.text(0,46,"OBRA · 0%",{fontFamily:"Manrope",fontSize:"10px",fontStyle:"700",color:"#f3e6bf",backgroundColor:"#17221ad5",padding:{x:6,y:3}}).setOrigin(.5);
      container.add([shadow,earth,foundation,postA,postB,beam,roof,sign]);
      this.visualStory.construction={x:site.x,y:site.y,container,foundation,postA,postB,beam,roof,sign,progress:force?.08:0,complete:false};
      this.updateConstructionVisual();
      showActivity(force?"La comunidad ha abierto una nueva obra.":"Los constructores han marcado una futura parcela.");
    }

    updateConstructionVisual(){
      const p=this.visualStory.construction;
      if(!p||p.complete)return;
      const v=clamp(p.progress,0,1);
      p.sign.setText(`OBRA · ${Math.round(v*100)}%`);
      p.foundation.setAlpha(.28+.55*Math.min(1,v/.25));
      p.postA.setScale(1,.15+.85*clamp((v-.16)/.30,0,1));
      p.postB.setScale(1,.15+.85*clamp((v-.16)/.30,0,1));
      p.beam.setAlpha(clamp((v-.42)/.16,0,1));
      p.roof.setAlpha(clamp((v-.68)/.20,0,1));
      if(v>=1)this.completeConstruction();
    }

    advanceConstruction(amount=.10,person=null){
      const p=this.visualStory.construction;
      if(!p||p.complete)return;
      if(liveMode){
        if(person)showActivity(`${person.person.name} trabaja en ${p.type||"la obra"}; el avance real lo decide la simulación.`);
        return;
      }
      p.progress=Math.min(1,p.progress+amount);
      this.updateConstructionVisual();
      if(person)showActivity(`${person.person.name} avanzó la construcción al ${Math.round(p.progress*100)}%.`);
    }

    completeConstruction(){
      const p=this.visualStory.construction;
      if(!p||p.complete)return;
      p.complete=true;
      const x=p.x,y=p.y;
      p.container.destroy(true);
      const house=this.makeHouse(x,y,"Nueva vivienda","home",this.visualStory.constructionIndex%3);
      this.storyStructures.push(house);
      this.villageSmoke.push(this.makeSmoke(x+31,y-58,.72));
      updateEvent("Nueva vivienda terminada","La construcción cambió físicamente el borde del asentamiento.");
      showActivity("Una nueva vivienda ha quedado terminada.");
      this.time.delayedCall(6500,()=>this.ensureConstructionProject(false));
    }

    activateExpansion(){
      if(this.visualStory.expansionActive){
        showActivity("La expedición de expansión continúa avanzando hacia la frontera.");
        return;
      }
      this.visualStory.expansionActive=true;
      this.visualStory.expansionProgress=Math.max(.08,this.visualStory.expansionProgress);
      this.expansionLabel.setText("EXPANSIÓN EN CURSO").setAlpha(1);
      this.updateExpansionVisual();
      updateEvent("Comienza una expansión","Exploradores abandonan el núcleo para establecer una nueva posición.");
      showActivity("La expansión ya tiene un destino físico fuera de la aldea.");
    }

    updateExpansionVisual(){
      const v=clamp(this.visualStory.expansionProgress,0,1);
      this.expansionTrail.clear();
      this.expansionArea.clear();
      const points=[
        {x:1300,y:650},{x:1490,y:540},{x:1650,y:420},{x:1790,y:315},{x:1900,y:260}
      ];
      const usable=Math.max(2,Math.ceil(1+v*(points.length-1)));
      this.expansionTrail.lineStyle(24,0x9d8b67,.25+.42*v);
      this.expansionTrail.beginPath();
      this.expansionTrail.moveTo(points[0].x,points[0].y);
      for(let i=1;i<usable;i++)this.expansionTrail.lineTo(points[i].x,points[i].y);
      this.expansionTrail.strokePath();
      this.expansionTrail.lineStyle(4,0xd1bb86,.28+.30*v);
      this.expansionTrail.beginPath();
      this.expansionTrail.moveTo(points[0].x,points[0].y);
      for(let i=1;i<usable;i++)this.expansionTrail.lineTo(points[i].x,points[i].y);
      this.expansionTrail.strokePath();

      if(v>.28){
        const radius=35+v*75;
        this.expansionArea.fillStyle(0x9d9368,.12+.16*v).fillCircle(1900,260,radius);
        this.expansionArea.lineStyle(3,0xc5b27c,.28+.28*v).strokeCircle(1900,260,radius);
      }
      if(v>.52&&!this.expansionCamp){
        this.expansionCamp=this.add.container(1900,270).setDepth(300);
        const shadow=this.add.ellipse(0,17,70,20,0x203024,.25);
        const tent=this.add.triangle(0,-7,-35,25,0,-28,35,25,0x8e6848).setStrokeStyle(2,0x55402f);
        const flap=this.add.triangle(0,2,-9,19,0,-8,9,19,0x4e3e31);
        const flag=this.add.rectangle(31,-28,3,44,0x61462e);
        const cloth=this.add.triangle(42,-39,31,-48,31,-29,0x536d55);
        this.expansionCamp.add([shadow,tent,flap,flag,cloth]);
        updateEvent("Campamento de frontera","La expedición ha establecido presencia permanente fuera del núcleo.");
      }
      this.expansionLabel.setAlpha(.55+.45*v);
      if(v>=1)this.expansionLabel.setText("NUEVA ZONA INTEGRADA");
    }

    advanceExpansion(person,amount=.14){
      if(!this.visualStory.expansionActive)this.activateExpansion();
      this.visualStory.expansionProgress=Math.min(1,this.visualStory.expansionProgress+amount);
      this.updateExpansionVisual();
      showActivity(`${person.person.name} amplió el conocimiento de la nueva zona.`);
      if(this.visualStory.expansionProgress>=1){
        updateEvent("Expansión consolidada","La nueva zona ya está conectada visualmente con el asentamiento.");
      }
    }

    nearestTree(person){
      const candidates=this.resourceTrees.filter(t=>!t.harvested&&!t.reserved&&t.zone==="forest");
      if(!candidates.length)return null;
      candidates.sort((a,b)=>Phaser.Math.Distance.Between(person.x,person.y,a.x,a.y)-Phaser.Math.Distance.Between(person.x,person.y,b.x,b.y));
      const pick=candidates[Math.min(candidates.length-1,hash(person.person.id+"-"+this.visualStory.logsDelivered)%Math.min(8,candidates.length))];
      pick.reserved=true;
      return pick;
    }

    markTreeHarvested(node,person){
      if(!node||node.harvested)return;
      node.harvested=true;node.reserved=false;
      this.tweens.add({targets:node.container,alpha:.12,scaleX:.72,scaleY:.38,duration:650,onComplete:()=>{
        node.container.setVisible(false);
        const stump=this.add.container(node.x,node.y).setDepth(node.y);
        stump.add(this.add.ellipse(0,6,22,10,0x71513a));
        stump.add(this.add.ellipse(0,3,17,7,0xb38a57).setStrokeStyle(1,0x5d4532));
        this.storyEffects.push(stump);
      }});
      this.visualStory.logsDelivered++;
      if(this.visualStory.logsDelivered%3===0)updateEvent("El bosque retrocede",`${person.person.name} y los leñadores están trabajando cada vez más lejos del centro.`);
    }

    setCarry(person,type,on){
      if(person.carryVisual){person.carryVisual.destroy();person.carryVisual=null}
      if(!on)return;
      if(type==="wood"){
        person.carryVisual=this.add.rectangle(0,-34,28,7,0x765136).setStrokeStyle(1,0x4d3828);
      }else{
        person.carryVisual=this.add.circle(0,-33,8,0xb29a56).setStrokeStyle(1,0x6c5c37);
      }
      person.add(person.carryVisual);
    }

    movePersonTo(person,target,activity,onComplete){
      if(!person.active)return;
      person.person.activity=activity;
      if(selected===person)updatePersonPanel(person);
      const sprite=person.parts.sprite;
      const base=person.parts.baseScale;
      const dist=Phaser.Math.Distance.Between(person.x,person.y,target.x,target.y);
      const duration=Math.max(500,(dist/(person.person.age<16?72:105))*1000);
      person.walkTween?.stop();
      sprite.setFlipX(target.x<person.x);
      person.walkTween=this.tweens.add({
        targets:sprite,y:{from:0,to:-3},angle:{from:-1.7,to:1.7},
        scaleY:{from:base*.97,to:base*1.03},duration:180,yoyo:true,repeat:-1
      });
      this.tweens.add({
        targets:person,x:target.x,y:target.y,duration,ease:"Sine.easeInOut",
        onUpdate:()=>person.setDepth(person.y+100),
        onComplete:()=>{
          person.walkTween?.stop();
          sprite.setY(0).setAngle(0).setScale(base);
          if(onComplete)onComplete();
        }
      });
    }

    moveRoute(person,stops,onComplete,index=0){
      if(index>=stops.length){if(onComplete)onComplete();return}
      const stop=stops[index];
      this.movePersonTo(person,stop,stop.activity||person.person.activity,()=>this.moveRoute(person,stops,onComplete,index+1));
    }

    performWork(person,label,duration,onComplete){
      person.person.activity=label;
      if(selected===person)updatePersonPanel(person);
      const sprite=person.parts.sprite;
      const base=person.parts.baseScale;
      const spark=this.add.circle(person.x+12,person.y-30,4,0xe0bd68,.8).setDepth(person.y+200);
      this.tweens.add({targets:spark,y:person.y-58,alpha:0,scale:1.8,duration:700,repeat:1,onComplete:()=>spark.destroy()});
      const work=this.tweens.add({targets:sprite,angle:{from:-5,to:5},y:{from:0,to:-2},duration:220,yoyo:true,repeat:-1});
      this.time.delayedCall(duration,()=>{
        work.stop();sprite.setAngle(0).setY(0).setScale(base);
        if(onComplete)onComplete();
      });
    }

    runPersonCycle(person,delay=0){
      this.time.delayedCall(delay,()=>{
        if(!person.active)return;
        const p=person.person;
        const home=p.home;
        const role=p.role;
        const rest=()=>this.time.delayedCall(900+Math.random()*1600,()=>this.runPersonCycle(person,0));

        const liveTask=liveMode
          ? (liveSnapshot?.tasks||[]).find(t=>Number(t.person_id)===Number(p.id))
          : null;
        if(liveTask){
          const target={x:Number(liveTask.target_x),y:Number(liveTask.target_y)};
          const source={
            x:Number(liveTask.source_x??1260),
            y:Number(liveTask.source_y??680)
          };
          if(liveTask.task_type==="transport"){
            const resource=liveTask.resource_type==="wood"?"wood":"stone";
            const label=resource==="wood"?"madera":"piedra";
            this.moveRoute(person,[
              {x:source.x,y:source.y,activity:"Recogiendo "+label+" para "+(liveTask.project_name||"una obra")}
            ],()=>this.performWork(person,"Cargando "+label,700,()=>{
              this.setCarry(person,resource,true);
              this.movePersonTo(person,target,"Transportando "+label+" a "+(liveTask.project_name||"la obra"),()=>{
                this.setCarry(person,resource,false);
                this.performWork(person,"Entregando "+Number(liveTask.amount||0).toFixed(1)+" de "+label,850,()=>{
                  this.movePersonTo(person,home,"Regresando después de la entrega",rest);
                });
              });
            }));
            return;
          }
          if(liveTask.task_type==="build"){
            this.movePersonTo(person,target,"Dirigiéndose a "+(liveTask.project_name||"la obra"),()=>{
              this.performWork(person,"Trabajando en "+(liveTask.project_name||"la construcción"),2100,()=>{
                this.movePersonTo(person,home,"Regresando de la obra",rest);
              });
            });
            return;
          }
        }

        if(role==="leñador"){
          const tree=this.nearestTree(person);
          if(!tree){this.movePersonTo(person,home,"Regresando a casa",rest);return}
          const route=[
            {x:1370,y:650,activity:"Caminando hacia el bosque"},
            {x:1540,y:560,activity:"Siguiendo el sendero forestal"},
            {x:tree.x,y:tree.y,activity:"Llegando al árbol seleccionado"}
          ];
          this.moveRoute(person,route,()=>this.performWork(person,"Talando un árbol",1700,()=>{
            this.markTreeHarvested(tree,person);
            this.setCarry(person,"wood",true);
            this.moveRoute(person,[
              {x:1540,y:560,activity:"Transportando madera"},
              {x:1370,y:650,activity:"Regresando con madera"},
              {x:1260,y:680,activity:"Entregando madera en el almacén"}
            ],()=>{
              this.setCarry(person,"wood",false);
              this.performWork(person,"Descargando madera",650,()=>this.movePersonTo(person,home,"Volviendo a casa",rest));
            });
          }));
          return;
        }

        if(role==="constructor"){
          if(activeCommands.has("housing"))this.ensureConstructionProject(true);
          const project=this.visualStory.construction;
          if(!project||project.complete){this.movePersonTo(person,home,"Esperando una nueva obra",rest);return}
          this.moveRoute(person,[
            {x:1260,y:680,activity:"Recogiendo materiales"},
            {x:1390,y:705,activity:"Transportando materiales"},
            {x:project.x,y:project.y,activity:"Llegando a la obra"}
          ],()=>this.performWork(person,"Construyendo físicamente",1800,()=>{
            this.advanceConstruction(.09+((hash(p.id+"build")%5)/100),person);
            this.movePersonTo(person,home,"Regresando de la obra",rest);
          }));
          return;
        }

        if(role==="agricultor"){
          const h=hash(p.id+"field");
          const field={x:380+(h%230),y:890+((h>>>8)%150)};
          this.moveRoute(person,[
            {x:850,y:805,activity:"Saliendo hacia los campos"},
            {x:660,y:900,activity:"Siguiendo el camino agrícola"},
            {x:field.x,y:field.y,activity:"Llegando a su parcela"}
          ],()=>this.performWork(person,"Trabajando su parcela",1800,()=>{
            this.visualStory.cropsDelivered++;
            this.setCarry(person,"food",true);
            this.moveRoute(person,[
              {x:660,y:900,activity:"Llevando cosecha"},
              {x:950,y:770,activity:"Regresando a la aldea"},
              {x:1260,y:680,activity:"Entregando alimentos"}
            ],()=>{
              this.setCarry(person,"food",false);
              if(this.visualStory.cropsDelivered%4===0)updateEvent("Cosecha entregada","Los campos alimentan de forma visible las reservas del asentamiento.");
              this.movePersonTo(person,home,"Volviendo a casa",rest);
            });
          }));
          return;
        }

        if(role==="explorador"){
          if(activeCommands.has("expand")||this.visualStory.expansionActive){
            this.activateExpansion();
            this.moveRoute(person,[
              {x:1320,y:640,activity:"Abandonando el núcleo"},
              {x:1510,y:520,activity:"Siguiendo la ruta de expansión"},
              {x:1690,y:400,activity:"Explorando terreno nuevo"},
              {x:1900,y:260,activity:"Reconociendo la nueva zona"}
            ],()=>this.performWork(person,"Cartografiando la frontera",1500,()=>{
              this.advanceExpansion(person,.12);
              this.visualStory.explorationTrips++;
              this.moveRoute(person,[
                {x:1690,y:400,activity:"Regresando de la frontera"},
                {x:1450,y:550,activity:"Volviendo con información"},
                {x:1120,y:700,activity:"Informando al consejo"}
              ],()=>this.movePersonTo(person,home,"Regresando a casa",rest));
            }));
          }else{
            const far=[
              {x:1490,y:340},{x:1770,y:205},{x:2070,y:330},{x:2040,y:690}
            ];
            const dest=far[hash(p.id+"explore-"+this.visualStory.explorationTrips)%far.length];
            this.moveRoute(person,[
              {x:1370,y:570,activity:"Saliendo de exploración"},
              {x:1650,y:430,activity:"Atravesando territorio conocido"},
              {x:dest.x,y:dest.y,activity:"Explorando lejos de la aldea"}
            ],()=>this.performWork(person,"Observando y cartografiando",1300,()=>{
              this.visualStory.explorationTrips++;
              this.movePersonTo(person,{x:1120,y:700},"Regresando de expedición",()=>this.movePersonTo(person,home,"Descansando tras explorar",rest));
            }));
          }
          return;
        }

        if(role==="recolector"){
          const h=hash(p.id+"gather-"+this.visualStory.cropsDelivered);
          const patch={x:330+(h%310),y:320+((h>>>8)%250)};
          this.moveRoute(person,[
            {x:820,y:610,activity:"Saliendo a recolectar"},
            {x:650,y:500,activity:"Buscando recursos silvestres"},
            {x:patch.x,y:patch.y,activity:"Llegando a una zona de recolección"}
          ],()=>this.performWork(person,"Recolectando plantas y bayas",1500,()=>{
            this.setCarry(person,"food",true);
            this.movePersonTo(person,{x:1260,y:680},"Llevando lo recolectado al almacén",()=>{
              this.setCarry(person,"food",false);
              this.movePersonTo(person,home,"Regresando a casa",rest);
            });
          }));
          return;
        }

        if(role==="cazador"){
          const h=hash(p.id+"hunt-"+this.visualStory.explorationTrips);
          const dest={x:1760+(h%300),y:700+((h>>>8)%180)};
          this.moveRoute(person,[
            {x:1390,y:690,activity:"Saliendo de caza"},
            {x:1600,y:720,activity:"Siguiendo rastros"},
            {x:dest.x,y:dest.y,activity:"Rastreando animales"}
          ],()=>this.performWork(person,"Cazando en el exterior",1700,()=>{
            this.setCarry(person,"food",true);
            this.movePersonTo(person,{x:1260,y:680},"Regresando con provisiones",()=>{
              this.setCarry(person,"food",false);
              this.movePersonTo(person,home,"Volviendo a casa",rest);
            });
          }));
          return;
        }

        const h=hash(p.id+"child");
        const school={x:980+(h%150),y:875+((h>>>7)%95)};
        this.moveRoute(person,[
          {x:1070,y:790,activity:"Caminando por la aldea"},
          {x:school.x,y:school.y,activity:"Aprendiendo y ayudando"}
        ],()=>this.performWork(person,"Aprendiendo con otros niños",1100,()=>this.movePersonTo(person,home,"Regresando a casa",rest)));
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
            household_id:raw.household_id??null,
            agriculture:Number(raw.agriculture??0),
            hunting:Number(raw.hunting??0),
            building:Number(raw.building??0),
            gathering:Number(raw.gathering??0),
            exploration:Number(raw.exploration??0)
          };
        }
        const h=hash(data.name+"-"+data.id);
        const household=data.live&&data.household_id
          ? (liveSnapshot?.households||[]).find(x=>Number(x.id)===Number(data.household_id))
          : null;
        const homeX=household&&Number.isFinite(Number(household.x))?Number(household.x):920+(h%320);
        const homeY=household&&Number.isFinite(Number(household.y))?Number(household.y):610+((h>>>8)%250);
        const x=homeX-18+(h%37), y=homeY+18+((h>>>9)%24);
        const person=this.makePerson({...data,x,y,homeX,homeY});
        this.people.push(person);
        this.runPersonCycle(person,500+i*95);
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
      syncActiveOrders(snapshot.orders||[]);
      if(Array.isArray(snapshot.buildings))this.syncBuildings(snapshot.buildings,snapshot.building_instances||null);
      this.syncProjects(snapshot.projects||[]);

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

      const charKey=characterKey(data.role,data.sex,data.age);
      const sprite=this.add.image(0,0,"wilson_"+charKey).setOrigin(.5,.88);
      const baseScale=isChild?.50:.56;
      sprite.setScale(baseScale);

      // Subtle role accent. The clothing itself now carries the profession identity.
      const badgeColor=ROLE_COLORS[data.role]||0x777777;
      const badge=this.add.circle(17,-27,isChild?3:3.5,badgeColor,.92).setStrokeStyle(1,0xf2e6c8,.65);

      const marker=this.add.circle(0,-48,4,0xd7bd70).setVisible(false);
      const label=this.add.text(0,-62,data.name.split(" ")[0],{
        fontFamily:"Manrope",fontSize:"11px",fontStyle:"700",color:"#fff7df",
        backgroundColor:"#17221ad9",padding:{x:4,y:2}
      }).setOrigin(.5).setVisible(false);

      c.add([shadow,ring,sprite,badge,marker,label]);
      c.setSize(54,76).setInteractive(new Phaser.Geom.Rectangle(-27,-58,54,82),Phaser.Geom.Rectangle.Contains);
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
        visualKey:characterKey(data.role,data.sex,data.age),
        visualUrl:characterUrl(data.role,data.sex,data.age),
        home:{x:data.homeX??data.x,y:data.homeY??data.y}
      };
      c.parts={marker,ring,label,sprite,badge,baseScale};
      c.on("pointerdown",(pointer)=>{
        pointer.event.stopPropagation?.();
        selectPerson(c);
      });
      return c;
    }

    targetFor(person){
      return {x:person.person.home.x,y:person.person.home.y,activity:"Regresando a casa"};
    }

    scheduleNext(person,delay=400){
      this.runPersonCycle(person,delay);
    }

    rebalanceTasks(){
      if(activeCommands.size){
        const count=this.people.filter(p=>p.person.role!=="niño").length;
        const labels=[...activeCommands].map(commandLabel).join(", ");
        showActivity(`Prioridades activas: ${labels}. ${count} adultos ajustan sus rutinas.`);
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
    const portrait=$("personPortrait");
    if(portrait){
      portrait.src=p.visualUrl||characterUrl(p.role,p.sex,p.age);
      portrait.alt=`Retrato de ${p.name}`;
    }
    $("personName").textContent=p.name;
    const household=p.household_id?(liveSnapshot?.households||[]).find(h=>Number(h.id)===Number(p.household_id)):null;
    $("personMeta").textContent=`${p.age} años · ${p.role} · ${p.sex==="F"?"mujer":"hombre"}${household?` · ${household.name}`:""}`;
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

  function syncActiveOrders(orders){
    activeCommands.clear();
    for(const order of orders||[]){
      if(order.status==="active")activeCommands.add(order.type);
    }
    document.querySelectorAll("[data-command]").forEach(btn=>{
      btn.classList.toggle("active",activeCommands.has(btn.dataset.command));
      btn.setAttribute("aria-pressed",activeCommands.has(btn.dataset.command)?"true":"false");
    });
  }

  function renderObjectives(snapshot){
    const root=$("objectiveList");
    if(!root)return;
    const pop=Number(snapshot.summary?.population||0);
    const housing=Number(snapshot.settlement?.housing_capacity||0);
    const freeHousing=housing-pop;
    const foodMonths=Number(snapshot.summary?.food_months||0);
    const farms=Number((snapshot.buildings||[]).find(b=>b.type==="granja")?.count||0);
    const carpentry=Number((snapshot.buildings||[]).find(b=>b.type==="carpinteria")?.count||0);
    const regions=(snapshot.regions||[]).length;
    const items=[
      {done:freeHousing>=4,text:freeHousing>=4?`Vivienda estable · ${freeHousing} plazas libres`:`Consejo: ampliar vivienda · solo ${Math.max(0,freeHousing)} plazas libres`},
      {done:foodMonths>=6,text:foodMonths>=6?`Reservas estables · ${foodMonths.toFixed(1)} meses`:`Consejo: reforzar alimentos · ${foodMonths.toFixed(1)} meses`},
      {done:farms>0,text:farms>0?`Infraestructura agrícola · ${farms} granja(s)`:"Consejo: aún no existe una granja permanente"},
      {done:carpentry>0,text:carpentry>0?`Carpintería operativa · ${carpentry}`:"Consejo: falta una carpintería estable"},
      {done:regions>=9,text:regions>=9?`Frontera conocida · ${regions} regiones`:`Consejo: explorar más territorio · ${regions} regiones`}
    ];
    root.innerHTML="";
    for(const item of items){
      const row=document.createElement("div");
      if(item.done)row.classList.add("done");
      const icon=document.createElement("i"); icon.textContent=item.done?"✓":"!";
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
    const type=btn.dataset.command;
    const activate=!activeCommands.has(type);
    if(activate)activeCommands.add(type); else activeCommands.delete(type);
    btn.classList.toggle("active",activate);
    btn.setAttribute("aria-pressed",activate?"true":"false");

    if(activate&&type==="expand")sceneRef?.activateExpansion();
    if(activate&&type==="housing"&&!liveMode)sceneRef?.ensureConstructionProject(true);

    const activeLabels=[...activeCommands].map(commandLabel);
    showActivity(activate
      ? `Prioridad añadida: ${commandLabel(type)}. Activas: ${activeLabels.join(", ")||"ninguna"}.`
      : `Prioridad retirada: ${commandLabel(type)}. Activas: ${activeLabels.join(", ")||"ninguna"}.`);
    updateEvent(
      activate?"Nueva prioridad estratégica":"Prioridad retirada",
      activate
        ? `La comunidad recibió la instrucción de priorizar ${commandLabel(type)} junto con las demás órdenes activas.`
        : `La prioridad ${commandLabel(type)} dejó de ser un mandato activo.`
    );

    if(liveMode){
      try{
        const response=await fetch("/api/order",{
          method:"POST",credentials:"same-origin",
          headers:{"Content-Type":"application/json","Accept":"application/json"},
          body:JSON.stringify({type,weight:35,active:activate})
        });
        if(!response.ok)throw new Error("order "+response.status);
        const snapshot=await response.json();
        sceneRef?.applySnapshot(snapshot,false);
      }catch(err){
        if(activate)activeCommands.delete(type); else activeCommands.add(type);
        btn.classList.toggle("active",activeCommands.has(type));
        showActivity("No se pudo guardar el cambio de prioridad. Se restauró el estado anterior.");
      }
    }
  }));

  const newGameBtn=$("newGameBtn");
  const newGameModal=$("newGameModal");
  const cancelNewGame=$("cancelNewGame");
  const confirmNewGame=$("confirmNewGame");
  newGameBtn?.addEventListener("click",()=>newGameModal?.classList.remove("hidden"));
  cancelNewGame?.addEventListener("click",()=>newGameModal?.classList.add("hidden"));
  confirmNewGame?.addEventListener("click",async()=>{
    confirmNewGame.disabled=true;
    confirmNewGame.textContent="Creando mundo…";
    try{
      const response=await fetch("/api/new-game",{
        method:"POST",credentials:"same-origin",
        headers:{"Content-Type":"application/json","Accept":"application/json"},
        body:JSON.stringify({confirm:"NUEVA_PARTIDA"})
      });
      if(!response.ok)throw new Error("new game "+response.status);
      if("serviceWorker" in navigator){
        const regs=await navigator.serviceWorker.getRegistrations();
        for(const reg of regs)await reg.update().catch(()=>{});
      }
      location.reload();
    }catch(err){
      confirmNewGame.disabled=false;
      confirmNewGame.textContent="Sí, crear nueva partida";
      showActivity("No se pudo crear la nueva partida.");
    }
  });
})();