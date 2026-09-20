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
    agricultor:0xa99c55,cazador:0x80543e,explorador:0x507d86,constructor:0xa7794d,
    leñador:0x668253,recolector:0x746781,"niño":0x9e8b72
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
      this.cameras.main.setBounds(0,0,WORLD_W,WORLD_H);
      this.physics.world.setBounds(0,0,WORLD_W,WORLD_H);
      this.drawWorld();
      this.drawVillage();
      this.createPeople();
      this.createLighting();
      this.setupCamera();
      this.cameras.main.centerOn(1080,720);
      this.cameras.main.setZoom(0.82);
      this.time.addEvent({delay:5200,loop:true,callback:()=>this.emitVillageEvent()});
      this.time.addEvent({delay:9000,loop:true,callback:()=>this.rebalanceTasks()});
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
      river.lineStyle(82,0x648d8a,1);
      river.beginPath();river.moveTo(-40,120);river.bezierCurveTo(420,330,340,710,660,900);river.bezierCurveTo(940,1080,1180,1260,1340,1450);river.strokePath();
      river.lineStyle(5,0x8fb5ad,.55);river.beginPath();river.moveTo(-40,108);river.bezierCurveTo(420,318,340,700,660,888);river.bezierCurveTo(940,1068,1180,1248,1340,1438);river.strokePath();

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
      const c=this.add.container(x,y).setDepth(y);
      const trunk=this.add.rectangle(0,14,11*s,26*s,0x624b35);
      const crown=this.add.circle(0,-2,22*s,0x355838);
      const crown2=this.add.circle(-12*s,3,16*s,0x456b43);
      const crown3=this.add.circle(13*s,4,17*s,0x40653f);
      c.add([trunk,crown,crown2,crown3]);
    }

    makeRock(x,y,s=1){
      const r=this.add.ellipse(x,y,34*s,20*s,0x77776a).setDepth(y);
      this.add.ellipse(x-5*s,y-5*s,20*s,8*s,0x999887,.45).setDepth(y+.1);
      return r;
    }

    drawVillage(){
      const village=this.add.graphics().setDepth(-5);
      village.fillStyle(0x76885e,.75).fillCircle(1080,720,330);
      village.lineStyle(3,0x514c39,.45).strokeCircle(1080,720,330);

      const houses=[
        [890,610],[1010,555],[1160,580],[1280,650],[910,760],[1020,815],[1195,820],[1320,760]
      ];
      houses.forEach((p,i)=>this.makeHouse(p[0],p[1],i===3?"Almacén":i===5?"Taller":"Vivienda",i===3?0x5b4b35:0x7a4b34));

      // well
      const well=this.add.container(1080,700).setDepth(705);
      well.add(this.add.ellipse(0,10,48,24,0x55594f));
      well.add(this.add.ellipse(0,4,39,18,0x1f3537));
      well.add(this.add.rectangle(-16,-18,5,42,0x6c5539));
      well.add(this.add.rectangle(16,-18,5,42,0x6c5539));
      well.add(this.add.rectangle(0,-36,40,5,0x6c5539));

      this.add.text(1080,470,"PRIMER ASENTAMIENTO",{fontFamily:"Spectral",fontSize:"24px",fontStyle:"700",color:"#f5edd3",backgroundColor:"#152019cc",padding:{x:10,y:5}}).setOrigin(.5).setDepth(5000);
    }

    makeHouse(x,y,label,roofColor){
      const c=this.add.container(x,y).setDepth(y+30);
      const shadow=this.add.ellipse(0,24,95,28,0x263126,.24);
      const wall=this.add.rectangle(0,0,76,58,0xc4a67c).setStrokeStyle(2,0x795e42);
      const roof=this.add.triangle(0,-43,-50,15,0,-36,50,15,roofColor).setStrokeStyle(2,0x513525);
      const door=this.add.rectangle(0,12,16,27,0x5b3d2d);
      const window1=this.add.rectangle(-24,-2,12,12,0x77969a);
      const window2=this.add.rectangle(24,-2,12,12,0x77969a);
      const tag=this.add.text(0,42,label,{fontFamily:"Manrope",fontSize:"11px",color:"#f2e8cb",backgroundColor:"#18231acc",padding:{x:5,y:2}}).setOrigin(.5);
      c.add([shadow,wall,roof,door,window1,window2,tag]);
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
      const c=this.add.container(data.x,data.y).setDepth(data.y+100);
      const shadow=this.add.ellipse(0,15,22,8,0x1b261e,.27);
      const body=this.add.ellipse(0,0,data.age<16?13:17,data.age<16?22:29,ROLE_COLORS[data.role]||0x777777).setStrokeStyle(1,0x344239,.5);
      const head=this.add.circle(0,-17,data.age<16?6:8,data.sex==="F"?0xd8ab82:0xc99a73).setStrokeStyle(1,0x6a4936,.45);
      const hair=this.add.arc(0,-20,data.age<16?6:8,180,360,false,data.sex==="F"?0x604834:0x4a392e);
      const marker=this.add.circle(0,-34,4,0xd7bd70).setVisible(false);
      const ring=this.add.ellipse(0,14,31,14).setStrokeStyle(2,0xf2d276).setFillStyle(0x000000,0).setVisible(false);
      const label=this.add.text(0,-48,data.name.split(" ")[0],{fontFamily:"Manrope",fontSize:"11px",fontStyle:"600",color:"#fff7df",backgroundColor:"#17221acc",padding:{x:4,y:2}}).setOrigin(.5).setVisible(false);
      c.add([shadow,ring,body,head,hair,marker,label]);
      c.setSize(36,52).setInteractive(new Phaser.Geom.Rectangle(-18,-42,36,58),Phaser.Geom.Rectangle.Contains);
      c.person={...data,health:96-(hash(data.name+"h")%9),energy:70+(hash(data.name+"e")%28),prestige:hash(data.name+"p")%26,followed:false,activity:"En casa",home:{x:data.x,y:data.y}};
      c.parts={marker,ring,label,body};
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
        const speed=person.person.age<16?70:95;
        const duration=Math.max(700,(dist/speed)*1000);
        person.parts.body.setScale(1.04,0.96);
        this.tweens.add({
          targets:person,x:t.x,y:t.y,duration,ease:"Sine.easeInOut",
          onUpdate:()=>{person.setDepth(person.y+100)},
          onComplete:()=>{
            person.parts.body.setScale(1);
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
        let nearest=null,best=42;
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