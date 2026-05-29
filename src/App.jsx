import { useState, useEffect, useRef, useCallback } from "react";

// ══════════════ CONSTANTS ══════════════
const SC=3.2, PW=292, PH=182;
const f=v=>v*SC;

const TC={
  "5AX":  {c:"#6366f1",bg:"#eef2ff",lbl:"5-Axis Mill"},
  MTURN:  {c:"#d97706",bg:"#fffbeb",lbl:"Mill-Turn"},
  HMILL:  {c:"#059669",bg:"#ecfdf5",lbl:"Horiz. Mill"},
  LATHE:  {c:"#7c3aed",bg:"#f5f3ff",lbl:"CNC Lathe"},
  VMC:    {c:"#ea580c",bg:"#fff7ed",lbl:"VMC"},
  DRILL:  {c:"#dc2626",bg:"#fef2f2",lbl:"Gun Drill"},
};

const ZONES=[
  {id:"detail",lbl:"Detail Part Fabrication",x:5,  y:2,  w:140,h:14, c:"#6366f1"},
  {id:"conv",  lbl:"Conventional Machining", x:5,  y:16, w:140,h:110,c:"#16a34a"},
  {id:"grind", lbl:"CNC Grinding 1,320 SF",  x:5,  y:127,w:100,h:53, c:"#2563eb"},
  {id:"spool", lbl:"Spool-N-Sleeve 680 SF",  x:107,y:130,w:50, h:50, c:"#ea580c"},
  {id:"paint", lbl:"Paint / Chemical",       x:107,y:122,w:50, h:8,  c:"#b91c1c"},
  {id:"assy",  lbl:"Assembly Dept.",         x:147,y:2,  w:48, h:110,c:"#0d9488"},
  {id:"test",  lbl:"Test Stands",            x:147,y:114,w:48, h:66, c:"#7c3aed"},
  {id:"tool",  lbl:"Tool Room",              x:197,y:2,  w:47, h:58, c:"#b45309"},
  {id:"ship",  lbl:"Shipping / Receiving",   x:197,y:62, w:90, h:118,c:"#475569"},
  {id:"office",lbl:"Offices",               x:197,y:0,  w:95, h:60, c:"#94a3b8"},
];

const INIT_MACHINES=[
  {id:"NO501",type:"5AX", mfr:"DMG-Mori",  model:"DMU 60 eVo Linear", x:58, y:19,w:9, h:9, cycleMin:45,setupMin:15,operators:1,uptime:90},
  {id:"NO502",type:"5AX", mfr:"DMG-Mori",  model:"DMU 60 eVo Linear", x:70, y:19,w:9, h:9, cycleMin:45,setupMin:15,operators:1,uptime:90},
  {id:"CP640",type:"MTURN",mfr:"Mori Seiki",model:"NT 4250 DCG",       x:9,  y:44,w:13,h:10,cycleMin:40,setupMin:20,operators:1,uptime:88},
  {id:"CP642",type:"MTURN",mfr:"Mori Seiki",model:"NT 4250 DCG",       x:25, y:44,w:13,h:10,cycleMin:40,setupMin:20,operators:1,uptime:88},
  {id:"CP644",type:"MTURN",mfr:"DMG Mori",  model:"NTX 3000",          x:41, y:44,w:13,h:10,cycleMin:38,setupMin:18,operators:1,uptime:87},
  {id:"NO119",type:"HMILL",mfr:"Mori Seiki",model:"SH-400",            x:88, y:19,w:11,h:8, cycleMin:25,setupMin:10,operators:1,uptime:92},
  {id:"NO120",type:"HMILL",mfr:"Doosan",    model:"NHP 6300",          x:102,y:19,w:11,h:8, cycleMin:25,setupMin:10,operators:1,uptime:90},
  {id:"NO121",type:"HMILL",mfr:"DMG Mori",  model:"NHX 4000",          x:116,y:19,w:11,h:8, cycleMin:28,setupMin:12,operators:1,uptime:89},
  {id:"CP641",type:"LATHE",mfr:"Doosan",    model:"Puma TT1800SV",     x:10, y:60,w:9, h:6, cycleMin:15,setupMin:8, operators:1,uptime:91,barFeed:true},
  {id:"CP643",type:"LATHE",mfr:"Doosan",    model:"Puma TT1800SY",     x:22, y:60,w:9, h:6, cycleMin:15,setupMin:8, operators:1,uptime:91,barFeed:true},
  {id:"NO191",type:"LATHE",mfr:"Doosan",    model:"Puma 300LM",        x:88, y:35,w:9, h:6, cycleMin:15,setupMin:8, operators:1,uptime:93},
  {id:"NO197",type:"LATHE",mfr:"Doosan",    model:"Puma 400LM",        x:100,y:35,w:9, h:6, cycleMin:15,setupMin:8, operators:1,uptime:92},
  {id:"NO198",type:"LATHE",mfr:"Okuma",     model:"LU45",              x:113,y:35,w:10,h:6, cycleMin:15,setupMin:8, operators:1,uptime:90},
  {id:"NO200",type:"LATHE",mfr:"Mori Seiki",model:"ZL-35",             x:88, y:49,w:9, h:6, cycleMin:15,setupMin:8, operators:1,uptime:91},
  {id:"NO203",type:"LATHE",mfr:"Mori Seiki",model:"CL-153",            x:100,y:49,w:8, h:6, cycleMin:15,setupMin:8, operators:1,uptime:90},
  {id:"NO210",type:"LATHE",mfr:"Okuma",     model:"LU 3000 EX",        x:113,y:49,w:10,h:6, cycleMin:15,setupMin:8, operators:1,uptime:89},
  {id:"NO211",type:"LATHE",mfr:"DMG Mori",  model:"NZX 2500|1000",     x:57, y:78,w:11,h:6, cycleMin:15,setupMin:8, operators:1,uptime:90},
  {id:"NO102",type:"VMC",  mfr:"Fadal",     model:"VMC 4020",          x:10, y:100,w:9,h:7, cycleMin:25,setupMin:10,operators:1,uptime:85},
  {id:"NO104",type:"VMC",  mfr:"Mori Seiki",model:"MV-55",             x:22, y:100,w:8,h:7, cycleMin:22,setupMin:10,operators:1,uptime:87},
  {id:"NO301",type:"DRILL",mfr:"DeHoff",    model:"20 Series",         x:118,y:147,w:13,h:6,cycleMin:15,setupMin:5, operators:1,uptime:82},
];

const INIT_PART_DB=[{
  id:"PDB001",partNumber:"1211317",description:"Hydraulic Valve Body",color:"#3b82f6",
  operations:[
    {id:"op001",opNum:10,machineId:"NO501",opTimeMin:45},
    {id:"op002",opNum:20,machineId:"CP641",opTimeMin:15},
    {id:"op003",opNum:30,machineId:"NO191",opTimeMin:15},
  ],
}];

const PCOLORS=["#3b82f6","#ef4444","#10b981","#f59e0b","#8b5cf6","#06b6d4","#f97316","#ec4899","#14b8a6","#a855f7"];

// ══════════════ SIM ENGINE (batch/WO) ══════════════
const clone=o=>JSON.parse(JSON.stringify(o));

function initSim(machIds){
  const ms={};
  machIds.forEach(id=>{ms[id]={queue:[],busy:false,job:null,eta:0,startTime:0,completedPieces:0};});
  return {time:0,ms,transit:[],completedWOs:[]};
}

function tickSim(sim,machines,partDB,dt){
  if(dt<=0)return sim;
  const T=sim.time+dt;
  let transit=[...sim.transit];
  let completedWOs=[...sim.completedWOs];
  const ms=clone(sim.ms);

  // Deliver in-transit batches
  transit=transit.filter(t=>{
    if(T>=t.eta){
      if(!ms[t.destId])ms[t.destId]={queue:[],busy:false,job:null,eta:0,startTime:0,completedPieces:0};
      ms[t.destId].queue.push(t.job);
      return false;
    }
    return true;
  });

  // Tick machines
  Object.keys(ms).forEach(mid=>{
    const mst=ms[mid];
    const mDef=machines.find(m=>m.id===mid);
    if(!mDef)return;

    // Finish current batch
    if(mst.busy&&T>=mst.eta){
      const job=mst.job;
      const part=partDB.find(p=>p.partNumber===job.partNumber);
      const nIdx=job.routeIdx+1;
      mst.completedPieces+=job.qty;
      if(part&&nIdx<part.operations.length){
        const nextMid=part.operations[nIdx].machineId;
        transit.push({destId:nextMid,eta:T+0.5,fromX:mDef.x+mDef.w/2,fromY:mDef.y+mDef.h/2,
          job:{...job,routeIdx:nIdx}});
      }else{
        completedWOs.push({woId:job.woId,woNumber:job.woNumber,at:T,qty:job.qty});
      }
      mst.busy=false;mst.job=null;mst.eta=0;mst.startTime=0;
    }

    // Start next queued batch
    if(!mst.busy&&mst.queue.length>0){
      const job=mst.queue.shift();
      const part=partDB.find(p=>p.partNumber===job.partNumber);
      const opTime=(part?.operations[job.routeIdx]?.opTimeMin??mDef.cycleMin)*job.qty+mDef.setupMin;
      mst.busy=true;mst.job=job;mst.eta=T+opTime;mst.startTime=T;
    }
  });

  return {time:T,ms,transit,completedWOs};
}

// ══════════════ SHARED STYLES ══════════════
const TH={padding:"7px 9px",fontSize:"9px",color:"var(--color-text-tertiary)",letterSpacing:"1.5px",
  fontWeight:"400",background:"var(--color-background-secondary)",textAlign:"left",
  borderBottom:"0.5px solid var(--color-border-secondary)",whiteSpace:"nowrap"};
const TD={padding:"5px 8px",borderBottom:"0.5px solid var(--color-border-tertiary)",
  fontSize:"11px",verticalAlign:"middle"};

// ══════════════ MAIN APP ══════════════
export default function App(){
  const [page,   setPage]  = useState("floor");
  const [machines,setMachines]= useState(INIT_MACHINES);
  const [partDB, setPartDB]= useState(INIT_PART_DB);
  const [wos,    setWos]   = useState([]);
  const [sim,    setSim]   = useState(()=>initSim(INIT_MACHINES.map(m=>m.id)));
  const [running,setRunning]=useState(false);
  const [speed,  setSpeed] = useState(30);
  const [zoom,   setZoom]  = useState(1);
  const [selMId, setSelMId]= useState(null);
  const [selWOId,setSelWOId]=useState(null);
  const [fTab,   setFTab]  = useState("machines");
  const [drag,   setDrag]  = useState(null);

  const simRef  =useRef(sim);
  const machRef =useRef(machines);
  const pdbRef  =useRef(partDB);
  const wosRef  =useRef(wos);
  const rafRef  =useRef(null);
  const lastRef =useRef(null);
  const svgRef  =useRef(null);

  machRef.current=machines; pdbRef.current=partDB; wosRef.current=wos;

  // RAF loop
  useEffect(()=>{
    if(!running){cancelAnimationFrame(rafRef.current);lastRef.current=null;return;}
    const loop=ts=>{
      if(!lastRef.current)lastRef.current=ts;
      const dt=(ts-lastRef.current)/1000; lastRef.current=ts;
      simRef.current=tickSim(simRef.current,machRef.current,pdbRef.current,dt*speed);
      setSim({...simRef.current});
      rafRef.current=requestAnimationFrame(loop);
    };
    rafRef.current=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(rafRef.current);
  },[running,speed]);

  // Sync completed WOs back to state
  useEffect(()=>{
    const ids=new Set(sim.completedWOs.map(c=>c.woId));
    if(!ids.size)return;
    setWos(prev=>prev.map(wo=>ids.has(wo.id)&&wo.status!=="complete"?{...wo,status:"complete"}:wo));
  },[sim.completedWOs]);

  const resetSim=()=>{
    setRunning(false);
    const fresh=initSim(machRef.current.map(m=>m.id));
    simRef.current=fresh; setSim({...fresh});
    setWos(prev=>prev.map(wo=>({...wo,status:"pending"})));
  };

  const releaseWO=useCallback(woId=>{
    const wo=wosRef.current.find(w=>w.id===woId);
    if(!wo)return;
    const part=pdbRef.current.find(p=>p.partNumber===wo.partNumber);
    if(!part?.operations?.length){alert("Part not found in Part DB or has no operations defined.");return;}
    const firstMid=part.operations[0].machineId;
    const job={woId:wo.id,woNumber:wo.woNumber,partNumber:wo.partNumber,
      qty:wo.qty,routeIdx:0,color:part.color};
    const ns=clone(simRef.current);
    if(!ns.ms[firstMid])ns.ms[firstMid]={queue:[],busy:false,job:null,eta:0,startTime:0,completedPieces:0};
    ns.ms[firstMid].queue.push(job);
    simRef.current=ns; setSim({...ns});
    setWos(prev=>prev.map(w=>w.id===woId?{...w,status:"running"}:w));
  },[]);

  const svgCoord=useCallback(e=>{
    const r=svgRef.current?.getBoundingClientRect();
    if(!r)return{x:0,y:0};
    return{x:((e.clientX-r.left)/r.width)*PW,y:((e.clientY-r.top)/r.height)*PH};
  },[]);

  const onMachDown=useCallback((e,id)=>{
    e.preventDefault();
    const p=svgCoord(e);
    const m=machRef.current.find(m=>m.id===id);
    setDrag({id,ox:p.x-m.x,oy:p.y-m.y});
    setSelMId(id);setFTab("machines");
  },[svgCoord]);

  const onSVGMove=useCallback(e=>{
    if(!drag)return; e.preventDefault();
    const p=svgCoord(e);
    setMachines(prev=>prev.map(m=>m.id===drag.id
      ?{...m,x:Math.round(Math.max(0,Math.min(PW-m.w,p.x-drag.ox))),
             y:Math.round(Math.max(0,Math.min(PH-m.h,p.y-drag.oy)))}
      :m));
  },[drag,svgCoord]);

  const onSVGUp=useCallback(()=>setDrag(null),[]);
  const updM=(id,k,v)=>setMachines(prev=>prev.map(m=>m.id===id?{...m,[k]:v}:m));

  const fmtT=min=>{
    const d=Math.floor(min/480),h=Math.floor((min%480)/60),m=Math.floor(min%60);
    return `Day ${d+1}  ${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
  };

  const selWO=wos.find(w=>w.id===selWOId);
  const selWOPart=selWO?partDB.find(p=>p.partNumber===selWO.partNumber):null;

  const navBtn=(k,lbl)=>({
    padding:"4px 12px",fontSize:"10px",cursor:"pointer",borderRadius:"5px",
    background:page===k?"#1e3a8a":"transparent",
    color:page===k?"#93c5fd":"var(--color-text-tertiary)",
    border:"1px solid "+(page===k?"#3b82f6":"transparent"),
    fontFamily:"var(--font-mono,monospace)",letterSpacing:"0.5px",
  });

  return(
    <div style={{display:"flex",flexDirection:"column",height:"880px",
      background:"var(--color-background-primary)",color:"var(--color-text-primary)",
      fontFamily:"var(--font-mono,monospace)",fontSize:"12px",overflow:"hidden"}}>

      {/* ── HEADER ── */}
      <header style={{display:"flex",alignItems:"center",gap:"8px",flexShrink:0,
        padding:"5px 14px",background:"var(--color-background-secondary)",
        borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
        <div>
          <div style={{fontSize:"8px",color:"var(--color-text-tertiary)",letterSpacing:"2.5px"}}>
            ARKWIN INDUSTRIES · BETHPAGE NY · TRANSDIGN
          </div>
          <div style={{fontSize:"12px",fontWeight:"500",letterSpacing:"0.5px"}}>
            Manufacturing Digital Twin
          </div>
        </div>
        <div style={{display:"flex",gap:"3px",marginLeft:"14px"}}>
          <button onClick={()=>setPage("floor")}     style={navBtn("floor",     "🏭 Floor")}>     🏭 Floor</button>
          <button onClick={()=>setPage("parts")}     style={navBtn("parts",     "📋 Part DB")}>   📋 Part DB</button>
          <button onClick={()=>setPage("workorders")}style={navBtn("workorders","📦 Work Orders")}>📦 Work Orders</button>
        </div>
        {page==="floor"&&(
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:"7px",flexWrap:"wrap"}}>
            <span style={{fontSize:"11px",color:"var(--color-text-secondary)",minWidth:"145px"}}>
              ⏱ {fmtT(sim.time)}
            </span>
            <span style={{fontSize:"9px",color:"#818cf8",minWidth:"70px"}}>
              ✓ {sim.completedWOs.length} WOs done
            </span>
            <span style={{fontSize:"9px",color:"var(--color-text-tertiary)"}}>Speed</span>
            <select value={speed} onChange={e=>setSpeed(+e.target.value)}
              style={{fontSize:"10px",width:"58px"}}>
              {[1,5,15,30,60,120,300].map(s=><option key={s} value={s}>{s}×</option>)}
            </select>
            <button onClick={()=>setRunning(r=>!r)}
              style={{padding:"4px 13px",fontSize:"11px",cursor:"pointer",
                background:running?"#fef2f2":"#f0fdf4",
                color:running?"#dc2626":"#15803d",
                border:`1px solid ${running?"#fca5a5":"#86efac"}`,borderRadius:"6px"}}>
              {running?"⏸ Pause":"▶ Play"}
            </button>
            <button onClick={resetSim}
              style={{padding:"4px 8px",fontSize:"10px",cursor:"pointer",borderRadius:"6px",
                border:"1px solid var(--color-border-secondary)"}}>
              ↺ Reset
            </button>
            <input type="range" min="0.5" max="2.5" step="0.1" value={zoom}
              onChange={e=>setZoom(+e.target.value)} style={{width:"50px"}}/>
            <span style={{fontSize:"8px",color:"var(--color-text-tertiary)",minWidth:"26px"}}>
              {Math.round(zoom*100)}%
            </span>
          </div>
        )}
      </header>

      {/* ══════════════ FLOOR PAGE ══════════════ */}
      {page==="floor"&&(
        <div style={{display:"flex",flex:1,minHeight:0}}>
          {/* MAP */}
          <div style={{flex:1,overflow:"auto",padding:"8px",
            background:"var(--color-background-tertiary)",minWidth:0}}>
            <svg ref={svgRef}
              width={PW*SC*zoom} height={PH*SC*zoom}
              viewBox={`0 0 ${PW*SC} ${PH*SC}`}
              style={{display:"block",cursor:drag?"grabbing":"default",
                border:"0.5px solid var(--color-border-secondary)",
                borderRadius:"6px",background:"var(--color-background-secondary)",
                userSelect:"none"}}
              onMouseMove={onSVGMove} onMouseUp={onSVGUp} onMouseLeave={onSVGUp}>

              {/* 20-ft grid */}
              {Array.from({length:Math.ceil(PW/20)+1},(_,i)=>i*20).map(v=>(
                <line key={`gx${v}`} x1={f(v)} y1={0} x2={f(v)} y2={f(PH)}
                  stroke="var(--color-border-tertiary)" strokeWidth="0.5"/>
              ))}
              {Array.from({length:Math.ceil(PH/20)+1},(_,i)=>i*20).map(v=>(
                <line key={`gy${v}`} x1={0} y1={f(v)} x2={f(PW)} y2={f(v)}
                  stroke="var(--color-border-tertiary)" strokeWidth="0.5"/>
              ))}

              {/* Zones */}
              {ZONES.map(z=>(
                <g key={z.id}>
                  <rect x={f(z.x)} y={f(z.y)} width={f(z.w)} height={f(z.h)}
                    fill={z.c+"11"} stroke={z.c} strokeWidth="1" strokeDasharray="5,3" rx="3"/>
                  <text x={f(z.x)+4} y={f(z.y)+10} fill={z.c} fontSize="8"
                    fontFamily="var(--font-mono,monospace)" letterSpacing="0.5"
                    style={{userSelect:"none",pointerEvents:"none"}}>{z.lbl}</text>
                </g>
              ))}

              {/* Outer wall */}
              <rect x={f(3)} y={f(1)} width={f(287)} height={f(180)}
                fill="none" stroke="var(--color-border-primary)" strokeWidth="1.5" rx="3"/>

              {/* Selected WO route lines */}
              {selWOPart&&selWOPart.operations.length>1&&selWOPart.operations.map((op,idx)=>{
                if(idx===selWOPart.operations.length-1)return null;
                const mA=machines.find(m=>m.id===op.machineId);
                const mB=machines.find(m=>m.id===selWOPart.operations[idx+1].machineId);
                if(!mA||!mB)return null;
                const x1=f(mA.x+mA.w/2),y1=f(mA.y+mA.h/2);
                const x2=f(mB.x+mB.w/2),y2=f(mB.y+mB.h/2);
                return(
                  <g key={idx}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={selWOPart.color} strokeWidth="1.8"
                      strokeDasharray="5,3" opacity="0.7"/>
                    <circle cx={(x1+x2)/2} cy={(y1+y2)/2} r="5.5"
                      fill={selWOPart.color} opacity="0.85"/>
                    <text x={(x1+x2)/2} y={(y1+y2)/2+3.5}
                      textAnchor="middle" fontSize="6" fill="white"
                      style={{pointerEvents:"none",userSelect:"none"}}>{idx+1}</text>
                  </g>
                );
              })}

              {/* Machines */}
              {machines.map(m=>(
                <MachRect key={m.id} m={m} selected={selMId===m.id}
                  simM={sim.ms?.[m.id]} simTime={sim.time}
                  onMouseDown={e=>onMachDown(e,m.id)}/>
              ))}

              {/* In-transit batch tokens */}
              {sim.transit.map((t,i)=>{
                const dest=machines.find(m=>m.id===t.destId);
                if(!dest)return null;
                const prog=Math.max(0,Math.min(1,1-(t.eta-sim.time)/0.5));
                const x0=f(t.fromX),y0=f(t.fromY);
                const x1=f(dest.x+dest.w/2),y1=f(dest.y+dest.h/2);
                const cx=x0+(x1-x0)*prog, cy=y0+(y1-y0)*prog;
                return(
                  <g key={i}>
                    <rect x={cx-9} y={cy-6} width="18" height="12" rx="3"
                      fill={t.job?.color||"#888"}
                      stroke="var(--color-background-primary)" strokeWidth="0.8" opacity="0.92"/>
                    <text x={cx} y={cy+3} textAnchor="middle" fontSize="5.5" fill="white"
                      fontFamily="var(--font-mono,monospace)"
                      style={{pointerEvents:"none",userSelect:"none"}}>
                      {t.job?.woNumber}
                    </text>
                  </g>
                );
              })}

              {/* Scale bar */}
              <g>
                <line x1={f(6)} y1={f(PH)-6} x2={f(86)} y2={f(PH)-6}
                  stroke="var(--color-text-tertiary)" strokeWidth="1.5"/>
                <line x1={f(6)}  y1={f(PH)-10} x2={f(6)}  y2={f(PH)-2}
                  stroke="var(--color-text-tertiary)" strokeWidth="1"/>
                <line x1={f(86)} y1={f(PH)-10} x2={f(86)} y2={f(PH)-2}
                  stroke="var(--color-text-tertiary)" strokeWidth="1"/>
                <text x={f(46)} y={f(PH)-8} fill="var(--color-text-tertiary)"
                  fontSize="8" textAnchor="middle">0 ──── 80 ft</text>
              </g>
            </svg>

            {/* Type legend */}
            <div style={{display:"flex",flexWrap:"wrap",gap:"8px",marginTop:"5px",
              fontSize:"9px",color:"var(--color-text-tertiary)"}}>
              {Object.entries(TC).map(([k,v])=>(
                <span key={k} style={{display:"flex",alignItems:"center",gap:"3px"}}>
                  <span style={{width:"8px",height:"8px",borderRadius:"2px",
                    background:v.bg,border:`1.5px solid ${v.c}`,display:"inline-block"}}/>
                  {v.lbl}
                </span>
              ))}
              <span style={{marginLeft:"auto",display:"flex",gap:"10px",fontSize:"8.5px"}}>
                <span style={{color:"#d97706"}}>■ Q≥5 amber</span>
                <span style={{color:"#dc2626"}}>■ Q≥10 red choke</span>
              </span>
            </div>
          </div>

          {/* SIDEBAR */}
          <div style={{width:"272px",flexShrink:0,display:"flex",flexDirection:"column",
            overflow:"hidden",borderLeft:"0.5px solid var(--color-border-tertiary)",
            background:"var(--color-background-primary)"}}>
            <div style={{display:"flex",flexShrink:0,
              borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
              {[["machines","Machines"],["wos","Active WOs"],["analytics","Analytics"]].map(([k,lbl])=>(
                <button key={k} onClick={()=>setFTab(k)}
                  style={{flex:1,padding:"7px 0",fontSize:"9px",cursor:"pointer",
                    background:fTab===k?"var(--color-background-secondary)":"transparent",
                    color:fTab===k?"var(--color-text-primary)":"var(--color-text-tertiary)",
                    border:"none",fontFamily:"var(--font-mono,monospace)",
                    borderBottom:`2px solid ${fTab===k?"var(--color-text-primary)":"transparent"}`}}>
                  {lbl}
                </button>
              ))}
            </div>
            <div style={{flex:1,overflow:"auto",padding:"10px 12px"}}>
              {fTab==="machines"&&(
                selMId&&machines.find(m=>m.id===selMId)
                  ?<MachPanel m={machines.find(m=>m.id===selMId)}
                      simM={sim.ms?.[selMId]} simTime={sim.time}
                      onChange={updM} onClose={()=>setSelMId(null)}/>
                  :<MachList machines={machines} simSnap={sim}
                      onSelect={id=>{setSelMId(id);}}
                      onAdd={()=>{
                        const id=`H${Date.now().toString().slice(-4)}`;
                        setMachines(prev=>[...prev,{id,type:"VMC",mfr:"",model:"New Machine",
                          x:60,y:70,w:9,h:7,cycleMin:20,setupMin:10,operators:1,uptime:90}]);
                        const ns=clone(simRef.current);
                        ns.ms[id]={queue:[],busy:false,job:null,eta:0,startTime:0,completedPieces:0};
                        simRef.current=ns; setSim({...ns}); setSelMId(id);
                      }}/>
              )}
              {fTab==="wos"&&(
                <ActiveWOs wos={wos} partDB={partDB} machines={machines}
                  simSnap={sim} selWOId={selWOId} setSelWOId={setSelWOId}
                  onRelease={releaseWO}/>
              )}
              {fTab==="analytics"&&(
                <Analytics machines={machines} simSnap={sim} wos={wos}/>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ PART DB PAGE ══════════════ */}
      {page==="parts"&&(
        <PartDBPage partDB={partDB} machines={machines} setPartDB={setPartDB}/>
      )}

      {/* ══════════════ WORK ORDERS PAGE ══════════════ */}
      {page==="workorders"&&(
        <WorkOrdersPage wos={wos} setWos={setWos} partDB={partDB}
          simSnap={sim} machines={machines} onRelease={releaseWO}/>
      )}
    </div>
  );
}

// ══════════════ MACHINE RECT ══════════════
function MachRect({m,selected,simM,simTime,onMouseDown}){
  const cfg=TC[m.type]||TC.VMC;
  const q=simM?.queue?.length??0;
  const busy=simM?.busy??false;
  const job=simM?.job;
  const mx=f(m.x),my=f(m.y),mw=f(m.w),mh=f(m.h);
  const qC=q>=10?"#dc2626":q>=5?"#d97706":"#64748b";

  // Progress fraction
  let progFrac=0;
  if(busy&&simM.eta>0&&simM.startTime!=null&&simTime>simM.startTime){
    const total=simM.eta-simM.startTime;
    progFrac=total>0?Math.min(1,(simTime-simM.startTime)/total):0;
  }

  return(
    <g onMouseDown={onMouseDown} style={{cursor:"grab"}}>
      {/* Chokepoint glow */}
      {q>=5&&<rect x={mx-5} y={my-5} width={mw+10} height={mh+22}
        fill={q>=10?"#dc262616":"#d9770612"} rx="7"/>}

      {/* Bar feed indicator */}
      {m.barFeed&&<rect x={mx-5} y={my+1} width={5} height={mh-2}
        fill="none" stroke={cfg.c} strokeWidth="1" rx="1"
        strokeDasharray="2,1.5" opacity="0.5"/>}

      {/* Machine body */}
      <rect x={mx} y={my} width={mw} height={mh}
        fill={cfg.bg} stroke={cfg.c}
        strokeWidth={selected?2.5:1.5} rx="3"/>

      {/* Busy pulse overlay */}
      {busy&&<rect x={mx+1} y={my+1} width={mw-2} height={mh-2}
        fill={job?.color||cfg.c} rx="2" stroke="none" opacity="0.18">
        <animate attributeName="opacity" values="0.08;0.28;0.08"
          dur="1.4s" repeatCount="indefinite"/>
      </rect>}

      {/* Progress bar (bottom inside machine) */}
      {busy&&progFrac>0&&<rect x={mx} y={my+mh-2.5}
        width={mw*progFrac} height="2.5"
        fill={job?.color||cfg.c} rx="1.5"/>}

      {/* Selection ring */}
      {selected&&<rect x={mx-3} y={my-3} width={mw+6} height={mh+6}
        fill="none" stroke={cfg.c} strokeWidth="2.5" rx="5"/>}

      {/* Machine ID */}
      <text x={mx+mw/2} y={my+mh/2-(busy?4:2)}
        textAnchor="middle" fontSize="8" fontWeight="600"
        fill={cfg.c} fontFamily="var(--font-mono,monospace)"
        style={{pointerEvents:"none",userSelect:"none"}}>{m.id}</text>

      {/* Sub-label: type or active WO */}
      <text x={mx+mw/2} y={my+mh/2+(busy?6:6)}
        textAnchor="middle" fontSize={busy?5:5.5}
        fill={busy?(job?.color||"var(--color-text-tertiary)"):"var(--color-text-tertiary)"}
        fontFamily="var(--font-mono,monospace)"
        style={{pointerEvents:"none",userSelect:"none"}}>
        {busy?`WO${job?.woNumber} ×${job?.qty}`:m.type}
      </text>

      {/* Queue bar */}
      {q>0&&<rect x={mx} y={my+mh+1.5}
        width={Math.min(mw,(q/10)*mw)} height="2.5"
        fill={qC} rx="1.5"/>}

      {/* Queued WO badges (up to 3) */}
      {simM?.queue?.slice(0,3).map((j,i)=>{
        const bw=(mw/3)-0.8;
        return(
          <g key={i}>
            <rect x={mx+i*(bw+0.8)} y={my+mh+5}
              width={bw} height={7} rx="1.5"
              fill={j.color||"#888"} opacity="0.78"/>
            <text x={mx+i*(bw+0.8)+bw/2} y={my+mh+10.5}
              textAnchor="middle" fontSize="4.5" fill="white"
              fontFamily="var(--font-mono,monospace)"
              style={{pointerEvents:"none",userSelect:"none"}}>
              {j.woNumber}
            </text>
          </g>
        );
      })}
      {q>3&&<text x={mx+mw} y={my+mh+13}
        textAnchor="end" fontSize="6" fill={qC}>+{q-3}</text>}

      {/* Completed pieces counter */}
      {(simM?.completedPieces??0)>0&&<text x={mx+1} y={my-2}
        fontSize="6.5" fill="#10b981"
        style={{pointerEvents:"none",userSelect:"none"}}>
        ✓{simM.completedPieces}
      </text>}
    </g>
  );
}

// ══════════════ MACHINE LIST ══════════════
function MachList({machines,simSnap,onSelect,onAdd}){
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
        <span style={{fontSize:"9px",color:"var(--color-text-tertiary)",letterSpacing:"2px"}}>
          ASSETS ({machines.length})
        </span>
        <button onClick={onAdd} style={{fontSize:"9px",padding:"2px 7px",cursor:"pointer",
          border:"0.5px solid var(--color-border-secondary)",borderRadius:"4px",background:"transparent"}}>
          + Add
        </button>
      </div>
      <div style={{fontSize:"9px",color:"var(--color-text-tertiary)",marginBottom:"6px"}}>
        Click machine on map to configure
      </div>
      {machines.map(m=>{
        const sm=simSnap.ms?.[m.id];
        const q=sm?.queue?.length??0;
        const cfg=TC[m.type]||TC.VMC;
        return(
          <div key={m.id} onClick={()=>onSelect(m.id)}
            style={{display:"flex",alignItems:"center",gap:"5px",padding:"3px 4px",
              cursor:"pointer",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
            <span style={{width:"8px",height:"8px",borderRadius:"2px",flexShrink:0,
              background:cfg.bg,border:`1.5px solid ${cfg.c}`}}/>
            <span style={{color:"var(--color-text-secondary)",width:"44px",flexShrink:0,fontSize:"10px"}}>{m.id}</span>
            <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
              fontSize:"8.5px",color:"var(--color-text-tertiary)"}}>{m.model}</span>
            {sm?.busy&&<span style={{fontSize:"8px",color:"#10b981"}}>●</span>}
            {q>0&&<span style={{fontSize:"9px",fontWeight:"500",
              color:q>=10?"#dc2626":q>=5?"#d97706":"var(--color-text-tertiary)"}}>Q{q}</span>}
          </div>
        );
      })}
    </div>
  );
}

// ══════════════ MACHINE PANEL ══════════════
function MachPanel({m,simM,simTime,onChange,onClose}){
  const cfg=TC[m.type]||TC.VMC;
  const q=simM?.queue?.length??0;
  const rem=simM?.busy?Math.max(0,simM.eta-simTime).toFixed(1):null;
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
        <span style={{fontSize:"9px",color:"var(--color-text-tertiary)",letterSpacing:"2px"}}>MACHINE CONFIG</span>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",
          color:"var(--color-text-tertiary)",fontSize:"16px",lineHeight:1,padding:0}}>✕</button>
      </div>
      <div style={{borderLeft:`3px solid ${cfg.c}`,paddingLeft:"8px",marginBottom:"10px"}}>
        <div style={{fontSize:"16px",fontWeight:"500",color:cfg.c}}>{m.id}</div>
        <div style={{fontSize:"10px",color:"var(--color-text-secondary)"}}>{m.mfr}</div>
        <div style={{fontSize:"9.5px",color:"var(--color-text-tertiary)"}}>{m.model}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"4px",marginBottom:"10px"}}>
        {[{l:"Queue",v:q,c:q>=10?"#dc2626":q>=5?"#d97706":undefined},
          {l:"Done pcs",v:simM?.completedPieces??0,c:"#10b981"},
          {l:"Remain",v:rem?`${rem}m`:"—"}].map(r=>(
          <div key={r.l} style={{background:"var(--color-background-secondary)",
            padding:"4px",borderRadius:"5px",textAlign:"center"}}>
            <div style={{fontSize:"8px",color:"var(--color-text-tertiary)"}}>{r.l}</div>
            <div style={{fontSize:"12px",fontWeight:"500",
              color:r.c||"var(--color-text-primary)"}}>{r.v}</div>
          </div>
        ))}
      </div>
      <div style={{marginBottom:"5px"}}>
        <div style={{fontSize:"9px",color:"var(--color-text-tertiary)",marginBottom:"2px"}}>Machine type</div>
        <select value={m.type} onChange={e=>onChange(m.id,"type",e.target.value)}
          style={{width:"100%",fontSize:"11px"}}>
          {Object.entries(TC).map(([k,v])=><option key={k} value={k}>{v.lbl}</option>)}
        </select>
      </div>
      {[{lbl:"Cycle time (min/part)",k:"cycleMin",min:1},
        {lbl:"Setup time (min)",k:"setupMin",min:0},
        {lbl:"Uptime %",k:"uptime",min:1,max:100},
        {lbl:"Operators",k:"operators",min:1},
        {lbl:"X position (ft)",k:"x"},{lbl:"Y position (ft)",k:"y"},
        {lbl:"Width (ft)",k:"w",min:2},{lbl:"Depth (ft)",k:"h",min:2}].map(fld=>(
        <div key={fld.k} style={{marginBottom:"4px"}}>
          <div style={{fontSize:"9px",color:"var(--color-text-tertiary)",marginBottom:"2px"}}>{fld.lbl}</div>
          <input type="number" value={m[fld.k]} min={fld.min} max={fld.max}
            onChange={e=>onChange(m.id,fld.k,+e.target.value)}
            style={{width:"100%",boxSizing:"border-box",fontSize:"11px"}}/>
        </div>
      ))}
    </div>
  );
}

// ══════════════ ACTIVE WOs SIDEBAR ══════════════
function ActiveWOs({wos,partDB,machines,simSnap,selWOId,setSelWOId,onRelease}){
  const getLoc=woId=>{
    for(const[mid,ms]of Object.entries(simSnap.ms||{})){
      if(ms.job?.woId===woId)return{type:"busy",mid,opIdx:ms.job.routeIdx};
      const q=ms.queue?.find(j=>j.woId===woId);
      if(q)return{type:"queued",mid,opIdx:q.routeIdx};
    }
    const t=simSnap.transit?.find(tr=>tr.job?.woId===woId);
    if(t)return{type:"transit",destId:t.destId};
    return null;
  };
  if(!wos.length)return(
    <div style={{fontSize:"10px",color:"var(--color-text-tertiary)",textAlign:"center",marginTop:"20px"}}>
      No work orders.<br/>Go to Work Orders page to create.
    </div>
  );
  return(
    <div>
      <div style={{fontSize:"9px",color:"var(--color-text-tertiary)",letterSpacing:"2px",marginBottom:"8px"}}>
        WORK ORDERS ({wos.length})
      </div>
      {wos.map(wo=>{
        const part=partDB.find(p=>p.partNumber===wo.partNumber);
        const loc=getLoc(wo.id);
        const opCount=part?.operations?.length??0;
        const sC=wo.status==="running"?"#10b981":wo.status==="complete"?"#818cf8":"#64748b";
        return(
          <div key={wo.id} onClick={()=>setSelWOId(selWOId===wo.id?null:wo.id)}
            style={{padding:"6px 7px",marginBottom:"4px",borderRadius:"6px",cursor:"pointer",
              border:`1px solid ${selWOId===wo.id?"var(--color-border-primary)":"var(--color-border-tertiary)"}`,
              background:selWOId===wo.id?"var(--color-background-secondary)":"transparent"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontWeight:"500",fontSize:"11px"}}>WO {wo.woNumber}</span>
              <span style={{fontSize:"8.5px",color:sC,fontWeight:"500"}}>{wo.status.toUpperCase()}</span>
            </div>
            <div style={{display:"flex",gap:"5px",alignItems:"center",marginTop:"2px"}}>
              <span style={{width:"6px",height:"6px",borderRadius:"50%",
                background:part?.color||"#888",flexShrink:0}}/>
              <span style={{fontSize:"9px",color:"var(--color-text-tertiary)",flex:1}}>
                {wo.partNumber} × {wo.qty} pcs
              </span>
              {loc?.type==="busy"&&<span style={{fontSize:"9px",color:"#10b981"}}>
                Op {loc.opIdx+1}/{opCount}
              </span>}
              {loc?.type==="queued"&&<span style={{fontSize:"9px",color:"#d97706"}}>
                ⏳{loc.mid}
              </span>}
              {loc?.type==="transit"&&<span style={{fontSize:"9px",color:"#f59e0b"}}>→</span>}
            </div>
            {wo.status==="pending"&&(
              <button onClick={e=>{e.stopPropagation();onRelease(wo.id);}}
                style={{marginTop:"5px",width:"100%",padding:"3px",fontSize:"9px",cursor:"pointer",
                  background:"#1e3a5f",color:"#93c5fd",border:"1px solid #3b82f6",borderRadius:"4px"}}>
                ▶ Release to Floor
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ══════════════ ANALYTICS ══════════════
function Analytics({machines,simSnap,wos}){
  const sorted=[...machines].map(m=>({...m,
    q:simSnap.ms?.[m.id]?.queue?.length??0,
    done:simSnap.ms?.[m.id]?.completedPieces??0,
    busy:simSnap.ms?.[m.id]?.busy??false,
  })).sort((a,b)=>b.q-a.q);
  const maxQ=Math.max(1,...sorted.map(m=>m.q));
  return(
    <div>
      <div style={{fontSize:"9px",color:"var(--color-text-tertiary)",letterSpacing:"2px",marginBottom:"10px"}}>SIM ANALYTICS</div>
      <div style={{marginBottom:"12px"}}>
        <div style={{fontSize:"9px",color:"var(--color-text-tertiary)",marginBottom:"5px"}}>WO STATUS</div>
        {[["pending","#64748b"],["running","#10b981"],["complete","#818cf8"]].map(([s,c])=>(
          <div key={s} style={{display:"flex",justifyContent:"space-between",marginBottom:"3px",fontSize:"10px"}}>
            <span style={{color:c}}>{s.charAt(0).toUpperCase()+s.slice(1)}</span>
            <span style={{fontWeight:"500"}}>{wos.filter(w=>w.status===s).length}</span>
          </div>
        ))}
      </div>
      <div style={{fontSize:"9px",color:"var(--color-text-tertiary)",letterSpacing:"2px",marginBottom:"6px"}}>QUEUE DEPTH</div>
      {sorted.map(m=>{
        const cfg=TC[m.type]||TC.VMC;
        const bC=m.q>=10?"#dc2626":m.q>=5?"#d97706":cfg.c;
        return(
          <div key={m.id} style={{marginBottom:"4px"}}>
            <div style={{display:"flex",justifyContent:"space-between",
              fontSize:"9px",marginBottom:"1px",alignItems:"center"}}>
              <span style={{display:"flex",alignItems:"center",gap:"3px"}}>
                <span style={{width:"6px",height:"6px",borderRadius:"1px",
                  background:cfg.bg,border:`1px solid ${cfg.c}`,display:"inline-block"}}/>
                <span style={{color:m.q>=10?"#dc2626":m.q>=5?"#d97706":"var(--color-text-secondary)"}}>
                  {m.id}
                </span>
                {m.busy&&<span style={{color:"#10b981",fontSize:"7px"}}>●</span>}
              </span>
              <span style={{display:"flex",gap:"4px"}}>
                {m.q>0&&<span style={{color:bC,fontWeight:"500"}}>Q:{m.q}</span>}
                {m.done>0&&<span style={{color:"#10b981",fontSize:"8.5px"}}>✓{m.done}</span>}
              </span>
            </div>
            <div style={{height:"3px",background:"var(--color-background-secondary)",borderRadius:"2px"}}>
              <div style={{height:"100%",width:`${(m.q/maxQ)*100}%`,
                background:bC,borderRadius:"2px",transition:"width 0.15s"}}/>
            </div>
          </div>
        );
      })}
      <div style={{marginTop:"12px",padding:"8px 10px",
        background:"var(--color-background-secondary)",borderRadius:"6px",
        fontSize:"9px",color:"var(--color-text-tertiary)",lineHeight:"1.8"}}>
        ● Q≥5 → amber glow = building WIP<br/>
        ● Q≥10 → red glow = hard bottleneck<br/>
        ● WO batches: all qty processed before moving
      </div>
    </div>
  );
}

// ══════════════ PART DB PAGE ══════════════
function PartDBPage({partDB,machines,setPartDB}){
  const [selId,setSelId]=useState(partDB[0]?.id||null);
  const sel=partDB.find(p=>p.id===selId);

  const addPart=()=>{
    const id=`PDB${Date.now().toString().slice(-5)}`;
    const color=PCOLORS[partDB.length%PCOLORS.length];
    const np={id,partNumber:"",description:"",color,operations:[]};
    setPartDB(prev=>[...prev,np]); setSelId(id);
  };
  const updP=(id,k,v)=>setPartDB(prev=>prev.map(p=>p.id===id?{...p,[k]:v}:p));
  const delP=id=>{setPartDB(prev=>prev.filter(p=>p.id!==id));if(selId===id)setSelId(null);};

  const addOp=pid=>{
    const oid=`op${Date.now().toString().slice(-6)}`;
    setPartDB(prev=>prev.map(p=>{
      if(p.id!==pid)return p;
      const n=(p.operations.length+1)*10;
      return{...p,operations:[...p.operations,{id:oid,opNum:n,machineId:machines[0]?.id||"",opTimeMin:20}]};
    }));
  };
  const updOp=(pid,oid,k,v)=>setPartDB(prev=>prev.map(p=>{
    if(p.id!==pid)return p;
    return{...p,operations:p.operations.map(op=>op.id===oid?{...op,[k]:v}:op)};
  }));
  const delOp=(pid,oid)=>setPartDB(prev=>prev.map(p=>
    p.id===pid?{...p,operations:p.operations.filter(op=>op.id!==oid)}:p
  ));
  const mvOp=(pid,idx,dir)=>setPartDB(prev=>prev.map(p=>{
    if(p.id!==pid)return p;
    const ops=[...p.operations];const to=idx+dir;
    if(to<0||to>=ops.length)return p;
    [ops[idx],ops[to]]=[ops[to],ops[idx]];
    return{...p,operations:ops};
  }));

  return(
    <div style={{display:"flex",flex:1,minHeight:0,overflow:"hidden"}}>
      {/* Left: part list */}
      <div style={{width:"280px",flexShrink:0,borderRight:"0.5px solid var(--color-border-tertiary)",
        display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          padding:"10px 14px",borderBottom:"0.5px solid var(--color-border-tertiary)",flexShrink:0}}>
          <span style={{fontSize:"10px",color:"var(--color-text-tertiary)",letterSpacing:"2px"}}>
            PART DATABASE ({partDB.length})
          </span>
          <button onClick={addPart}
            style={{fontSize:"9px",padding:"3px 9px",cursor:"pointer",
              color:"#93c5fd",border:"1px solid #3b82f6",borderRadius:"4px",background:"#1e3a5f"}}>
            + Add Part
          </button>
        </div>
        <div style={{flex:1,overflow:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>
                <th style={TH}>&nbsp;</th>
                <th style={TH}>Part #</th>
                <th style={TH}>Description</th>
                <th style={TH}>Ops</th>
                <th style={TH}></th>
              </tr>
            </thead>
            <tbody>
              {partDB.map(p=>(
                <tr key={p.id} onClick={()=>setSelId(p.id)}
                  style={{cursor:"pointer",
                    background:selId===p.id?"var(--color-background-secondary)":"transparent"}}>
                  <td style={TD}><span style={{width:"10px",height:"10px",borderRadius:"50%",
                    background:p.color,display:"inline-block",verticalAlign:"middle"}}/></td>
                  <td style={{...TD,fontWeight:"500",
                    color:selId===p.id?"#93c5fd":"var(--color-text-primary)"}}>
                    {p.partNumber||"—"}
                  </td>
                  <td style={{...TD,fontSize:"9px",color:"var(--color-text-tertiary)",
                    maxWidth:"90px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {p.description||"—"}
                  </td>
                  <td style={{...TD,textAlign:"center"}}>{p.operations.length}</td>
                  <td style={TD}>
                    <button onClick={e=>{e.stopPropagation();delP(p.id);}}
                      style={{background:"none",border:"none",cursor:"pointer",
                        color:"var(--color-text-tertiary)",fontSize:"14px",lineHeight:1,padding:0}}>×</button>
                  </td>
                </tr>
              ))}
              {!partDB.length&&(
                <tr><td colSpan={5} style={{...TD,textAlign:"center",
                  color:"var(--color-text-tertiary)",fontStyle:"italic",padding:"20px"}}>
                  No parts. Add one above.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: editor */}
      <div style={{flex:1,overflow:"auto",padding:"16px 22px"}}>
        {!sel&&<div style={{color:"var(--color-text-tertiary)",fontSize:"11px",marginTop:"24px"}}>
          Select a part to edit routing, or add a new one.
        </div>}
        {sel&&(
          <div>
            <div style={{fontSize:"9px",color:"var(--color-text-tertiary)",
              letterSpacing:"2px",marginBottom:"16px"}}>
              EDITING: {sel.partNumber||"NEW PART"}
            </div>

            {/* Part header fields */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",
              gap:"14px",marginBottom:"20px",alignItems:"end"}}>
              <div>
                <div style={{fontSize:"9px",color:"var(--color-text-tertiary)",marginBottom:"3px"}}>
                  Part Number
                </div>
                <input value={sel.partNumber}
                  onChange={e=>updP(sel.id,"partNumber",e.target.value)}
                  placeholder="e.g. 1211317"
                  style={{width:"100%",boxSizing:"border-box",fontSize:"14px",fontWeight:"500"}}/>
              </div>
              <div>
                <div style={{fontSize:"9px",color:"var(--color-text-tertiary)",marginBottom:"3px"}}>
                  Description
                </div>
                <input value={sel.description}
                  onChange={e=>updP(sel.id,"description",e.target.value)}
                  placeholder="e.g. Hydraulic Valve Body"
                  style={{width:"100%",boxSizing:"border-box",fontSize:"12px"}}/>
              </div>
              <div>
                <div style={{fontSize:"9px",color:"var(--color-text-tertiary)",marginBottom:"3px"}}>
                  Color
                </div>
                <div style={{display:"flex",gap:"4px",flexWrap:"wrap"}}>
                  {PCOLORS.map(c=>(
                    <span key={c} onClick={()=>updP(sel.id,"color",c)}
                      style={{width:"16px",height:"16px",borderRadius:"50%",background:c,
                        cursor:"pointer",boxSizing:"border-box",
                        border:sel.color===c?"2.5px solid var(--color-text-primary)":"2.5px solid transparent"}}/>
                  ))}
                </div>
              </div>
            </div>

            {/* Operations table */}
            <div style={{fontSize:"9px",color:"var(--color-text-tertiary)",
              letterSpacing:"2px",marginBottom:"8px"}}>
              OPERATION SEQUENCE — each op runs all qty pieces before routing to next
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",marginBottom:"10px"}}>
                <thead>
                  <tr>
                    <th style={TH}>Op #</th>
                    <th style={TH}>Machine ID</th>
                    <th style={TH}>Model</th>
                    <th style={TH}>Type</th>
                    <th style={TH}>Time (min/pc)</th>
                    <th style={TH}>Reorder</th>
                    <th style={TH}></th>
                  </tr>
                </thead>
                <tbody>
                  {sel.operations.map((op,idx)=>{
                    const mDef=machines.find(m=>m.id===op.machineId);
                    const cfg=TC[mDef?.type]||TC.VMC;
                    return(
                      <tr key={op.id}
                        style={{background:idx%2===0?"transparent":"var(--color-background-secondary)"}}>
                        <td style={TD}>
                          <input type="number" min="1" value={op.opNum}
                            onChange={e=>updOp(sel.id,op.id,"opNum",+e.target.value)}
                            style={{width:"44px",fontSize:"11px",textAlign:"center"}}/>
                        </td>
                        <td style={TD}>
                          <select value={op.machineId}
                            onChange={e=>updOp(sel.id,op.id,"machineId",e.target.value)}
                            style={{fontSize:"10px",width:"82px"}}>
                            {machines.map(m=><option key={m.id} value={m.id}>{m.id}</option>)}
                          </select>
                        </td>
                        <td style={{...TD,fontSize:"9px",color:"var(--color-text-tertiary)"}}>
                          {mDef?.model||"—"}
                        </td>
                        <td style={TD}>
                          {mDef&&<span style={{padding:"2px 5px",borderRadius:"3px",
                            fontSize:"8px",background:cfg.bg,color:cfg.c,border:`1px solid ${cfg.c}`}}>
                            {mDef.type}
                          </span>}
                        </td>
                        <td style={TD}>
                          <input type="number" min="1" value={op.opTimeMin}
                            onChange={e=>updOp(sel.id,op.id,"opTimeMin",+e.target.value)}
                            style={{width:"64px",fontSize:"11px"}}/>
                        </td>
                        <td style={TD}>
                          <div style={{display:"flex",gap:"2px"}}>
                            <button onClick={()=>mvOp(sel.id,idx,-1)}
                              style={{background:"none",border:"none",cursor:"pointer",
                                color:"var(--color-text-tertiary)",fontSize:"13px",lineHeight:1,padding:"0 2px"}}>↑</button>
                            <button onClick={()=>mvOp(sel.id,idx,1)}
                              style={{background:"none",border:"none",cursor:"pointer",
                                color:"var(--color-text-tertiary)",fontSize:"13px",lineHeight:1,padding:"0 2px"}}>↓</button>
                          </div>
                        </td>
                        <td style={TD}>
                          <button onClick={()=>delOp(sel.id,op.id)}
                            style={{background:"none",border:"none",cursor:"pointer",
                              color:"var(--color-text-tertiary)",fontSize:"14px",lineHeight:1,padding:0}}>×</button>
                        </td>
                      </tr>
                    );
                  })}
                  {!sel.operations.length&&(
                    <tr><td colSpan={7} style={{...TD,textAlign:"center",
                      color:"var(--color-text-tertiary)",fontStyle:"italic",padding:"16px"}}>
                      No operations. Add one below.
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <button onClick={()=>addOp(sel.id)}
              style={{padding:"7px 16px",fontSize:"10px",cursor:"pointer",
                border:"1px dashed var(--color-border-secondary)",borderRadius:"5px",
                background:"transparent",color:"var(--color-text-secondary)"}}>
              + Add Operation
            </button>

            {sel.operations.length>0&&(
              <div style={{marginTop:"14px",display:"flex",gap:"16px",
                padding:"10px 14px",background:"var(--color-background-secondary)",
                borderRadius:"7px",fontSize:"10px",flexWrap:"wrap"}}>
                <span><strong>Total time/pc:</strong> {sel.operations.reduce((s,op)=>s+op.opTimeMin,0)} min</span>
                <span style={{color:"var(--color-text-tertiary)"}}>
                  ({(sel.operations.reduce((s,op)=>s+op.opTimeMin,0)/60).toFixed(1)} hrs)
                </span>
                <span><strong>Ops:</strong> {sel.operations.length}</span>
                <span><strong>Machines used:</strong> {[...new Set(sel.operations.map(o=>o.machineId))].join(", ")}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════ WORK ORDERS PAGE ══════════════
function WorkOrdersPage({wos,setWos,partDB,simSnap,machines,onRelease}){
  const addWO=()=>{
    const id=`WO${Date.now().toString().slice(-6)}`;
    const woNum=String(wos.length+1).padStart(4,"0");
    setWos(prev=>[...prev,{id,woNumber:woNum,partNumber:partDB[0]?.partNumber||"",
      qty:1,status:"pending",priority:1}]);
  };
  const updWO=(id,k,v)=>setWos(prev=>prev.map(wo=>wo.id===id?{...wo,[k]:v}:wo));
  const delWO=id=>setWos(prev=>prev.filter(wo=>wo.id!==id));

  const getLoc=woId=>{
    for(const[mid,ms]of Object.entries(simSnap.ms||{})){
      if(ms.job?.woId===woId)return{type:"busy",mid,opIdx:ms.job.routeIdx};
      const q=ms.queue?.find(j=>j.woId===woId);
      if(q)return{type:"queued",mid,opIdx:q.routeIdx};
    }
    const t=simSnap.transit?.find(tr=>tr.job?.woId===woId);
    if(t)return{type:"transit",destId:t.destId};
    return null;
  };

  const badge=(s)=>({
    pending: {bg:"#1e293b",c:"#94a3b8",lbl:"PENDING"},
    running: {bg:"#052e16",c:"#10b981",lbl:"RUNNING"},
    complete:{bg:"#1e1b4b",c:"#818cf8",lbl:"COMPLETE"},
  }[s]||{bg:"#1e293b",c:"#94a3b8",lbl:s.toUpperCase()});

  return(
    <div style={{flex:1,overflow:"auto",padding:"16px 22px",minHeight:0}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"16px"}}>
        <div>
          <div style={{fontSize:"9px",color:"var(--color-text-tertiary)",letterSpacing:"2px"}}>WORK ORDERS</div>
          <div style={{fontSize:"13px",fontWeight:"500",marginTop:"2px"}}>
            {wos.length} total &nbsp;·&nbsp;
            <span style={{color:"#10b981"}}>{wos.filter(w=>w.status==="running").length} running</span>&nbsp;·&nbsp;
            <span style={{color:"#818cf8"}}>{wos.filter(w=>w.status==="complete").length} complete</span>
          </div>
        </div>
        <button onClick={addWO}
          style={{padding:"6px 18px",fontSize:"11px",cursor:"pointer",
            color:"#93c5fd",border:"1px solid #3b82f6",borderRadius:"6px",
            background:"#1e3a5f",fontFamily:"var(--font-mono,monospace)"}}>
          + New Work Order
        </button>
      </div>

      {!wos.length&&(
        <div style={{textAlign:"center",padding:"40px 20px",
          color:"var(--color-text-tertiary)",fontSize:"11px",
          border:"1px dashed var(--color-border-secondary)",borderRadius:"8px",lineHeight:"1.8"}}>
          No work orders yet.<br/>
          Create a work order → assign a part number from Part DB → set qty → click ▶ Release.<br/>
          The entire batch processes each operation before routing to the next machine.
        </div>
      )}

      {!!wos.length&&(
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>
                <th style={TH}>WO #</th>
                <th style={TH}>Part #</th>
                <th style={TH}>Description</th>
                <th style={TH}>Qty</th>
                <th style={TH}>Priority</th>
                <th style={TH}>Status</th>
                <th style={TH}>Location / Op</th>
                <th style={TH}>Est. Time</th>
                <th style={TH}>Action</th>
                <th style={TH}></th>
              </tr>
            </thead>
            <tbody>
              {wos.map((wo,ri)=>{
                const part=partDB.find(p=>p.partNumber===wo.partNumber);
                const b=badge(wo.status);
                const loc=getLoc(wo.id);
                const opCount=part?.operations?.length??0;
                const canEdit=wo.status==="pending";
                const totalMin=part?part.operations.reduce((s,op)=>s+op.opTimeMin*wo.qty+(machines.find(m=>m.id===op.machineId)?.setupMin||0),0):null;
                return(
                  <tr key={wo.id}
                    style={{background:ri%2===0?"transparent":"var(--color-background-secondary)"}}>
                    <td style={TD}>
                      {canEdit
                        ?<input value={wo.woNumber} onChange={e=>updWO(wo.id,"woNumber",e.target.value)}
                            style={{width:"68px",fontSize:"12px",fontWeight:"500"}}/>
                        :<strong>{wo.woNumber}</strong>}
                    </td>
                    <td style={TD}>
                      {canEdit
                        ?<select value={wo.partNumber} onChange={e=>updWO(wo.id,"partNumber",e.target.value)}
                            style={{fontSize:"10px",width:"95px"}}>
                            {partDB.map(p=><option key={p.id} value={p.partNumber}>{p.partNumber}</option>)}
                            {!partDB.length&&<option value="">No parts</option>}
                          </select>
                        :<span style={{display:"flex",alignItems:"center",gap:"5px"}}>
                            <span style={{width:"8px",height:"8px",borderRadius:"50%",
                              background:part?.color||"#888",flexShrink:0}}/>
                            {wo.partNumber}
                          </span>}
                    </td>
                    <td style={{...TD,fontSize:"9px",color:"var(--color-text-tertiary)",
                      maxWidth:"120px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {part?.description||"—"}
                    </td>
                    <td style={TD}>
                      {canEdit
                        ?<input type="number" min="1" value={wo.qty}
                            onChange={e=>updWO(wo.id,"qty",+e.target.value)}
                            style={{width:"54px",fontSize:"12px",fontWeight:"500"}}/>
                        :<strong>{wo.qty}</strong>}
                    </td>
                    <td style={{...TD,textAlign:"center"}}>
                      {canEdit
                        ?<input type="number" min="1" max="9" value={wo.priority}
                            onChange={e=>updWO(wo.id,"priority",+e.target.value)}
                            style={{width:"38px",fontSize:"11px",textAlign:"center"}}/>
                        :wo.priority}
                    </td>
                    <td style={TD}>
                      <span style={{padding:"2px 7px",borderRadius:"4px",fontSize:"9px",
                        fontWeight:"600",background:b.bg,color:b.c}}>{b.lbl}</span>
                    </td>
                    <td style={{...TD,fontSize:"9px"}}>
                      {wo.status==="complete"&&<span style={{color:"#818cf8"}}>✓ Complete</span>}
                      {loc?.type==="busy"&&<span style={{color:"#10b981"}}>
                        ● {loc.mid} — Op {loc.opIdx+1}/{opCount}
                      </span>}
                      {loc?.type==="queued"&&<span style={{color:"#d97706"}}>
                        ⏳ Queue @ {loc.mid}
                      </span>}
                      {loc?.type==="transit"&&<span style={{color:"#f59e0b"}}>
                        → in transit to {loc.destId}
                      </span>}
                      {!loc&&wo.status==="pending"&&<span style={{color:"var(--color-text-tertiary)"}}>Not released</span>}
                    </td>
                    <td style={{...TD,fontSize:"9px",color:"var(--color-text-tertiary)"}}>
                      {totalMin!=null
                        ?<span>{totalMin>=60?`~${(totalMin/60).toFixed(1)}h`:`${totalMin}m`}</span>
                        :"—"}
                    </td>
                    <td style={TD}>
                      {wo.status==="pending"&&(
                        <button onClick={()=>onRelease(wo.id)}
                          style={{padding:"3px 11px",fontSize:"9px",cursor:"pointer",
                            color:"#93c5fd",border:"1px solid #3b82f6",borderRadius:"4px",
                            background:"#1e3a5f",whiteSpace:"nowrap"}}>
                          ▶ Release
                        </button>
                      )}
                      {wo.status==="running"&&(
                        <span style={{fontSize:"9px",color:"#10b981"}}>On floor</span>
                      )}
                      {wo.status==="complete"&&(
                        <span style={{fontSize:"9px",color:"#818cf8"}}>Done</span>
                      )}
                    </td>
                    <td style={TD}>
                      {canEdit&&(
                        <button onClick={()=>delWO(wo.id)}
                          style={{background:"none",border:"none",cursor:"pointer",
                            color:"var(--color-text-tertiary)",fontSize:"14px",lineHeight:1,padding:0}}>×</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{marginTop:"20px",padding:"11px 14px",
        background:"var(--color-background-secondary)",borderRadius:"7px",
        fontSize:"10px",color:"var(--color-text-tertiary)",lineHeight:"1.9"}}>
        <strong style={{color:"var(--color-text-secondary)"}}>Workflow:</strong><br/>
        1. Define part routing in <strong>Part DB</strong> (part# → op sequence → machine → time/pc)<br/>
        2. Create a Work Order here (WO# → part# → qty)<br/>
        3. Click <strong>▶ Release</strong> — batch enters floor simulation<br/>
        4. Monitor on <strong>Floor tab</strong> → select WO in sidebar to highlight its route<br/>
        5. All <em>qty</em> pieces finish each operation before moving to the next machine
      </div>
    </div>
  );
}
