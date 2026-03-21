import { useState, useEffect } from "react";

// ─── GOOGLE FONTS ─────────────────────────────────────────────────────────────
// Injected at runtime for enterprise typography
if (typeof document !== "undefined" && !document.getElementById("mna-fonts")) {
  const link = document.createElement("link");
  link.id = "mna-fonts";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap";
  document.head.appendChild(link);
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const USERS = [
  { id:"analyst1", name:"Budi Santoso",  role:"analyst",   avatar:"BS", team:"M&A Team" },
  { id:"analyst2", name:"Rina Kusuma",   role:"analyst",   avatar:"RK", team:"M&A Team" },
  { id:"exec1",    name:"Pak Direktur",  role:"executive", avatar:"PD", team:"Board" },
  { id:"exec2",    name:"Ibu Komisaris", role:"executive", avatar:"IK", team:"Board" },
];
const PASSWORDS = { analyst1:"team123", analyst2:"team123", exec1:"board456", exec2:"board456" };

const NAV = [
  { id:1, icon:"🏢", label:"Company Profile" },
  { id:2, icon:"⛏️", label:"Reserve Evaluation" },
  { id:3, icon:"🚢", label:"Pit-to-Port" },
  { id:4, icon:"📊", label:"Financial Valuation" },
  { id:5, icon:"🎯", label:"Sensitivity Analysis" },
  { id:6, icon:"🔮", label:"Scenario Simulation" },
  { id:7, icon:"🤝", label:"Deal Structuring" },
  { id:8, icon:"⚡", label:"Synergy Estimation" },
  { id:9, icon:"🛡️", label:"Risk & Regulatory" },
];

const INITIAL_COMPANIES = [
  {
    id:"msn", name:"PT Mineral Sejahtera Nusantara", ticker:"MSN",
    location:"Kalimantan Timur", type:"Thermal Coal", iup:"IUP-2024-KT-0081",
    entityType:"PT Mineral Sejahtera Nusantara (MSN)", listedOn:"IDX", mineralClass:"Thermal Coal GAR 4,500–6,600",
    shareGov:30, sharePublic:51, shareForeign:19, status:"active",
    snapshots:[
      { date:"2026-01-15", analyst:"Budi Santoso",
        params:{ coalPrice:120,discRate:10,annualProd:5,mineLife:20,cashCost:24,royaltyRate:7,taxRate:22,capex:180,
                 measuredMt:50,indicatedMt:40,inferredMt:20,measuredGar:5400,indicatedGar:5200,inferredGar:4900,
                 recoveryRate:85,stripRatio:6,haulingDist:35,bargeDist:180,crushCost:2.5,portHandling:3.5,
                 acquisitionCost:120,debtPct:60,debtCost:8,loanTenor:5,sharedInfra:12,gaConsolidation:30,procSavings:8,
                 iupValid:true,certClean:true,amdal:true,ppa:false,dmb:true },
        npv:1022,irr:18.4,payback:5.5,bearNpv:661,bullNpv:1383,ddScore:4.2,synergy:26,recommendation:"proceed" },
      { date:"2025-10-03", analyst:"Rina Kusuma",
        params:{ coalPrice:115,discRate:10,annualProd:5,mineLife:20,cashCost:25,royaltyRate:7,taxRate:22,capex:185,
                 measuredMt:48,indicatedMt:38,inferredMt:18,measuredGar:5400,indicatedGar:5200,inferredGar:4900,
                 recoveryRate:83,stripRatio:6,haulingDist:35,bargeDist:180,crushCost:2.5,portHandling:3.5,
                 acquisitionCost:115,debtPct:60,debtCost:8,loanTenor:5,sharedInfra:10,gaConsolidation:25,procSavings:7,
                 iupValid:true,certClean:true,amdal:true,ppa:false,dmb:true },
        npv:934,irr:16.8,payback:6.1,bearNpv:607,bullNpv:1261,ddScore:3.8,synergy:22,recommendation:"proceed" },
    ]
  },
  {
    id:"bke", name:"PT Bara Kencana Energi", ticker:"BKE",
    location:"Kalimantan Selatan", type:"Thermal Coal", iup:"IUP-2023-KS-0045",
    entityType:"PT Bara Kencana Energi (BKE)", listedOn:"IDX", mineralClass:"Thermal Coal GAR 4,000–5,800",
    shareGov:0, sharePublic:65, shareForeign:35, status:"watchlist",
    snapshots:[
      { date:"2026-02-20", analyst:"Budi Santoso",
        params:{ coalPrice:120,discRate:11,annualProd:3,mineLife:15,cashCost:28,royaltyRate:7,taxRate:22,capex:120,
                 measuredMt:30,indicatedMt:25,inferredMt:10,measuredGar:5100,indicatedGar:4900,inferredGar:4600,
                 recoveryRate:82,stripRatio:7,haulingDist:45,bargeDist:220,crushCost:2.8,portHandling:4.0,
                 acquisitionCost:80,debtPct:55,debtCost:9,loanTenor:5,sharedInfra:8,gaConsolidation:20,procSavings:6,
                 iupValid:true,certClean:true,amdal:false,ppa:false,dmb:true },
        npv:487,irr:14.2,payback:7.2,bearNpv:316,bullNpv:658,ddScore:3.5,synergy:14,recommendation:"monitor" },
    ]
  },
  {
    id:"smb", name:"PT Sumber Mas Borneo", ticker:"SMB",
    location:"Kalimantan Tengah", type:"Thermal Coal", iup:"IUP-2022-KT-0112",
    entityType:"PT Sumber Mas Borneo (SMB)", listedOn:"Unlisted", mineralClass:"Thermal Coal GAR 4,200–5,500",
    shareGov:20, sharePublic:80, shareForeign:0, status:"watchlist", snapshots:[]
  },
];

// ─── ENTERPRISE LIGHT DESIGN SYSTEM ──────────────────────────────────────────
// Bright, clean white surfaces · Deep navy text · Electric indigo primary
// Vivid status palette · Plus Jakarta Sans + JetBrains Mono
const S = {
  // Backgrounds — crisp white layered system
  bg:      "#f0f2f8",   // root canvas — cool grey-white
  bg2:     "#ffffff",   // topbar / sidebar — pure white
  bg3:     "#ffffff",   // card surface
  bg4:     "#eef0f8",   // input / inset
  bg5:     "#e4e7f5",   // hover

  // Borders — light, airy
  border:  "#d4d8ee",
  border2: "#e4e7f5",
  borderAccent: "#5c6bff55",

  // Typography — deep navy
  text:      "#0b0f2e",
  textMuted: "#5a6080",
  textDim:   "#8890b0",
  textFaint: "#b8bdd4",

  // Primary — electric indigo
  cyan:       "#5c6bff",
  cyanBg:     "#5c6bff12",
  cyanBorder: "#5c6bff30",
  cyanDim:    "#3d4fd4",

  // Status — vivid and distinct
  green:       "#0ead69",
  greenBg:     "#0ead6912",
  greenBorder: "#0ead6930",
  amber:       "#f59e0b",
  amberBg:     "#f59e0b12",
  amberBorder: "#f59e0b30",
  red:         "#ef4444",
  redBg:       "#ef444412",
  redBorder:   "#ef444430",

  // Accent pops for charts/bars
  violet:  "#8b5cf6",
  teal:    "#14b8a6",
  orange:  "#f97316",

  // Legacy aliases
  gold:      "#f59e0b",
  goldDim:   "#d97706",
  blue:      "#5c6bff",
  blueBg:    "#5c6bff12",
  blueBorder:"#5c6bff30",
  yellow:    "#f59e0b",

  // Font stacks
  fontUI:   "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif",
  fontMono: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (n,d=0) => (n==null||isNaN(n)) ? "—" : n.toLocaleString("en-US",{maximumFractionDigits:d,minimumFractionDigits:d});
const fmtM = n => `$${fmt(Math.round(n))}M`;
const recColor  = r => r==="proceed" ? S.green  : r==="monitor" ? S.amber  : S.red;
const recBg     = r => r==="proceed" ? S.greenBg: r==="monitor" ? S.amberBg: S.redBg;
const recBorder = r => r==="proceed" ? S.greenBorder: r==="monitor" ? S.amberBorder: S.redBorder;
const recLabel  = r => r==="proceed" ? "● Proceed" : r==="monitor" ? "● Monitor" : "● Avoid";

function calcNPV(p) {
  const rev=(p.coalPrice||120)*(p.annualProd||5), opex=(p.cashCost||24)*(p.annualProd||5);
  const roy=rev*(p.royaltyRate||7)/100, ebitda=rev-opex-roy;
  const dep=(p.capex||180)/(p.mineLife||20), ebit=ebitda-dep;
  const tax=Math.max(ebit*(p.taxRate||22)/100,0), fcf=ebit-tax+dep;
  let n=-(p.capex||180);
  for(let y=1;y<=(p.mineLife||20);y++) n+=fcf/Math.pow(1+(p.discRate||10)/100,y);
  return Math.round(n);
}

// ─── SHARED WIDGETS ───────────────────────────────────────────────────────────
const Avatar = ({initials,size=34,bg=S.bg4}) => (
  <div style={{width:size,height:size,borderRadius:6,background:bg,border:`1px solid ${S.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.3,fontWeight:600,color:S.cyan,flexShrink:0,fontFamily:S.fontMono,letterSpacing:1}}>{initials}</div>
);

const Tag = ({label,color=S.cyanBg,text=S.cyan,border=S.cyanBorder}) => (
  <span style={{fontSize:10,fontWeight:600,letterSpacing:1.2,textTransform:"uppercase",background:color,color:text,padding:"3px 8px",borderRadius:3,border:`1px solid ${border}`,fontFamily:S.fontUI}}>{label}</span>
);

const Card = ({title,children,style={}}) => (
  <div style={{background:S.bg2,border:`1px solid ${S.border}`,borderRadius:10,padding:18,marginBottom:14,...style}}>
    {title && (
      <div style={{fontSize:10,color:S.textDim,fontWeight:600,textTransform:"uppercase",letterSpacing:1.8,marginBottom:14,paddingBottom:10,borderBottom:`1px solid ${S.border2}`,fontFamily:S.fontUI,display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:3,height:12,background:S.cyan,borderRadius:2}}/>
        {title}
      </div>
    )}
    {children}
  </div>
);

const KPI = ({label,value,accent=false,warn=false}) => {
  const valColor = accent ? S.green : warn ? S.amber : S.cyan;
  return (
    <div style={{background:S.bg4,border:`1px solid ${accent?S.greenBorder:warn?S.amberBorder:S.border2}`,borderRadius:4,borderRadius:6,padding:"12px 14px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:accent?S.green:warn?S.amber:S.cyan,opacity:0.9,borderRadius:"6px 6px 0 0"}}/>
      <div style={{fontSize:9,color:S.textDim,textTransform:"uppercase",letterSpacing:1.5,marginBottom:5,fontFamily:S.fontUI}}>{label}</div>
      <div style={{fontSize:18,fontWeight:700,color:valColor,fontFamily:S.fontMono,letterSpacing:-0.5}}>{value}</div>
    </div>
  );
};

const Slider = ({label,value,min,max,step=1,unit="",onChange}) => (
  <div style={{marginBottom:14}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
      <span style={{fontSize:10,color:S.textDim,textTransform:"uppercase",letterSpacing:1,fontFamily:S.fontUI}}>{label}</span>
      <span style={{fontSize:12,color:S.cyan,fontWeight:600,fontFamily:S.fontMono}}>{fmt(value,step<1?1:0)}{unit}</span>
    </div>
    <div style={{position:"relative",height:20,display:"flex",alignItems:"center"}}>
      <div style={{position:"absolute",left:0,right:0,height:2,background:S.border,borderRadius:1}}/>
      <div style={{position:"absolute",left:0,width:`${(value-min)/(max-min)*100}%`,height:3,background:S.cyan,borderRadius:2,opacity:1}}/>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e=>onChange(Number(e.target.value))}
        style={{position:"relative",width:"100%",accentColor:S.cyan,height:2,cursor:"pointer",background:"transparent"}}/>
    </div>
    <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:S.textFaint,marginTop:3,fontFamily:S.fontMono}}>
      <span>{min}{unit}</span><span>{max}{unit}</span>
    </div>
  </div>
);

const Field = ({label,value,onChange}) => (
  <div style={{marginBottom:10}}>
    <div style={{fontSize:9,color:S.textDim,textTransform:"uppercase",letterSpacing:1.2,marginBottom:4,fontFamily:S.fontUI}}>{label}</div>
    <input value={value||""} onChange={e=>onChange&&onChange(e.target.value)}
      style={{width:"100%",background:S.bg4,border:`1px solid ${S.border}`,borderRadius:6,padding:"8px 11px",color:S.text,fontSize:12,outline:"none",boxSizing:"border-box",fontFamily:S.fontUI,transition:"border-color 0.15s"}}
      onFocus={e=>e.target.style.borderColor=S.cyan}
      onBlur={e=>e.target.style.borderColor=S.border}/>
  </div>
);

// ─── 9 MODULES ────────────────────────────────────────────────────────────────
function M1({co,setCo}) {
  const u=(k,v)=>setCo(c=>({...c,[k]:v}));
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card title="🏢 Corporate Identity">
        {[["Company Name","name"],["Entity Type","entityType"],["Listed On","listedOn"],["Location","location"],["Mineral Class","mineralClass"],["IUP License No.","iup"]].map(([l,k])=>
          <Field key={k} label={l} value={co[k]} onChange={v=>u(k,v)}/>)}
      </Card>
      <div>
        <Card title="📋 Shareholder Structure">
          {[{l:"State Owned",k:"shareGov",c:"#6c47ff"},{l:"Public",k:"sharePublic",c:"#00a86b"},{l:"Foreign",k:"shareForeign",c:"#f08c00"}].map(({l,k,c})=>(
            <div key={k} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{fontSize:11,color:S.textMuted}}>{l}</span>
                <span style={{fontSize:12,color:c,fontWeight:700}}>{co[k]||0}%</span>
              </div>
              <input type="range" min={0} max={100} value={co[k]||0} onChange={e=>u(k,Number(e.target.value))} style={{width:"100%",accentColor:c,height:2,cursor:'pointer'}}/>
            </div>
          ))}
          <div style={{display:"flex",height:16,borderRadius:6,overflow:"hidden",marginTop:8}}>
            {[{k:"shareGov",c:"#6c47ff"},{k:"sharePublic",c:"#00a86b"},{k:"shareForeign",c:"#f08c00"}].map(({k,c})=>
              <div key={k} style={{flex:co[k]||1,background:c,transition:"flex 0.3s"}}/>)}
          </div>
        </Card>
        <Card title="📎 AI Document Upload">
          <div style={{border:`2px dashed ${S.border}`,borderRadius:10,padding:22,textAlign:"center",background:S.bg4}}>
            <div style={{fontSize:26,marginBottom:8}}>📄</div>
            <div style={{fontSize:11,color:S.textMuted,marginBottom:4}}>Upload financial document (PDF)</div>
            <div style={{fontSize:10,color:S.textFaint,marginBottom:12}}>P&L · Balance Sheet · Annual Report</div>
            <div style={{background:S.cyanBg,color:S.cyan,borderRadius:3,padding:"6px 14px",fontSize:10,fontWeight:600,display:"inline-block",cursor:"pointer",border:`1px solid ${S.cyanBorder}`,fontFamily:S.fontUI,letterSpacing:0.5}}>✦ Extract with AI</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function M2({p,setP}) {
  const u=(k,v)=>setP(x=>({...x,[k]:v}));
  const res=[{n:"Measured",mk:"measuredMt",mg:"measuredGar",c:"#6c47ff"},{n:"Indicated",mk:"indicatedMt",mg:"indicatedGar",c:"#0ea5e9"},{n:"Inferred",mk:"inferredMt",mg:"inferredGar",c:"#f08c00"}];
  const total=(p.measuredMt||50)+(p.indicatedMt||40)+(p.inferredMt||20);
  const mine=total*(p.recoveryRate||85)/100;
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card title="⛏️ Block Model Summary (JORC / NI 43-101)">
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr style={{borderBottom:`1px solid ${S.border}`}}>{["Category","Mt","GAR kcal/kg","TS"].map(h=><th key={h} style={{padding:"5px 8px",textAlign:"left",color:S.textDim,fontSize:10}}>{h}</th>)}</tr></thead>
          <tbody>{res.map(r=>(
            <tr key={r.n} style={{borderBottom:`1px solid ${S.border}`}}>
              <td style={{padding:"7px 8px",color:r.c,fontWeight:600}}>{r.n}</td>
              <td style={{padding:"7px 8px"}}><input type="number" value={p[r.mk]||0} onChange={e=>u(r.mk,Number(e.target.value))} style={{width:60,background:S.bg4,border:`1px solid ${S.border}`,borderRadius:4,padding:"4px 7px",color:S.text,fontSize:11,fontFamily:S.fontMono}}/></td>
              <td style={{padding:"7px 8px"}}><input type="number" value={p[r.mg]||0} onChange={e=>u(r.mg,Number(e.target.value))} style={{width:70,background:S.bg,border:`1px solid ${S.border}`,borderRadius:3,padding:"3px 6px",color:S.text,fontSize:11,fontFamily:S.fontMono}}/></td>
              <td style={{padding:"7px 8px",color:S.textMuted}}>0.5%</td>
            </tr>
          ))}</tbody>
        </table>
        <div style={{marginTop:12,padding:10,background:S.bg4,borderRadius:6,display:"flex",justifyContent:"space-between",border:`1px solid ${S.border}`}}>
          <span style={{fontSize:11,color:S.textDim}}>Total Resources</span>
          <span style={{fontSize:14,color:S.gold,fontWeight:700,fontFamily:S.fontMono}}>{fmt(total)} Mt</span>
        </div>
      </Card>
      <Card title="⚙️ Mining Parameters">
        <Slider label="Recovery Rate" value={p.recoveryRate||85} min={50} max={100} unit="%" onChange={v=>u("recoveryRate",v)}/>
        <Slider label="Strip Ratio (OB:Coal)" value={p.stripRatio||6} min={1} max={20} unit=":1" onChange={v=>u("stripRatio",v)}/>
        <Slider label="Annual Production" value={p.annualProd||5} min={1} max={20} unit=" Mt/yr" onChange={v=>u("annualProd",v)}/>
        <Slider label="Mine Life" value={p.mineLife||20} min={5} max={40} unit=" yrs" onChange={v=>u("mineLife",v)}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:14}}>
          <KPI label="Mineable Reserve" value={`${fmt(mine,1)} Mt`}/>
          <KPI label="Est. Mine Life" value={`${fmt(mine/(p.annualProd||5),1)} yrs`}/>
        </div>
      </Card>
    </div>
  );
}

function M3({p,setP}) {
  const u=(k,v)=>setP(x=>({...x,[k]:v}));
  const haul=(p.haulingDist||35)*0.4, barge=(p.bargeDist||180)*0.08;
  const crush=p.crushCost||2.5, port=p.portHandling||3.5;
  const total=haul+barge+crush+port;
  useEffect(()=>setP(x=>({...x,cashCost:parseFloat(total.toFixed(2))})),[Math.round(total*100)]);
  const items=[{l:"1. Mining & Crushing",v:crush,c:"#6c47ff"},{l:"2. Hauling",v:haul,c:"#0ea5e9"},{l:"3. Barge & Loading",v:barge,c:"#f08c00"},{l:"4. Port Handling",v:port,c:"#00a86b"}];
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card title="🚢 Logistics Cost Flow">
        {items.map(it=>(
          <div key={it.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",marginBottom:8,background:S.bg4,borderRadius:8,borderLeft:`3px solid ${it.c}`}}>
            <span style={{fontSize:12,color:S.textMuted}}>{it.l}</span>
            <span style={{fontSize:14,color:it.c,fontWeight:700}}>${fmt(it.v,1)}</span>
          </div>
        ))}
        <div style={{display:"flex",justifyContent:"space-between",padding:"12px 16px",background:S.greenBg,borderRadius:8,border:`1px solid ${S.greenBorder}`,marginTop:4}}>
          <span style={{fontSize:13,fontWeight:700}}>Total Cash Cost (FOB)</span>
          <span style={{fontSize:20,color:S.green,fontWeight:700,fontFamily:S.fontMono}}>${fmt(total,1)}/t</span>
        </div>
        <div style={{display:"flex",height:16,borderRadius:6,overflow:"hidden",marginTop:12}}>
          {items.map(it=><div key={it.l} title={it.l} style={{flex:it.v,background:it.c}}/>)}
        </div>
      </Card>
      <Card title="⚙️ Logistics Parameters">
        <Slider label="Hauling Distance" value={p.haulingDist||35} min={5} max={150} unit=" km" onChange={v=>u("haulingDist",v)}/>
        <Slider label="Barge Distance" value={p.bargeDist||180} min={50} max={500} unit=" km" onChange={v=>u("bargeDist",v)}/>
        <Slider label="Crushing & Sizing" value={p.crushCost||2.5} min={1} max={8} step={0.1} unit=" $/t" onChange={v=>u("crushCost",v)}/>
        <Slider label="Port Handling" value={p.portHandling||3.5} min={1} max={10} step={0.1} unit=" $/t" onChange={v=>u("portHandling",v)}/>
      </Card>
    </div>
  );
}

function M4({p,setP,setNpv}) {
  const u=(k,v)=>setP(x=>({...x,[k]:v}));
  const rev=(p.coalPrice||120)*(p.annualProd||5), opex=(p.cashCost||24)*(p.annualProd||5);
  const roy=rev*(p.royaltyRate||7)/100, ebitda=rev-opex-roy;
  const dep=(p.capex||180)/(p.mineLife||20), ebit=ebitda-dep;
  const tax=Math.max(ebit*(p.taxRate||22)/100,0), fcf=ebit-tax+dep;
  let n=-(p.capex||180);
  for(let y=1;y<=(p.mineLife||20);y++) n+=fcf/Math.pow(1+(p.discRate||10)/100,y);
  n=Math.round(n);
  useEffect(()=>setNpv(n),[n]);
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        <KPI label="Current Spot NPV" value={fmtM(n)} accent={n>0}/>
        <KPI label="Annual FCF" value={fmtM(Math.round(fcf))}/>
        <KPI label="Annual Revenue" value={fmtM(Math.round(rev))}/>
        <KPI label="EBITDA Margin" value={`${fmt(ebitda/rev*100,1)}%`}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Card title="📊 P&L Summary (Annual $M)">
          {[["Revenue",rev],["Royalty",-roy],["OPEX",-opex],["EBITDA",ebitda,true],["Depreciation",-dep],["EBIT",ebit],["Tax",-tax],["Free Cash Flow",fcf,true]].map(([l,v,b])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 4px",borderBottom:`1px solid ${S.border}`}}>
              <span style={{fontSize:12,color:b?S.amber:S.textMuted,fontWeight:b?700:400}}>{l}</span>
              <span style={{fontSize:12,color:v<0?S.red:v>0&&b?S.green:S.text,fontWeight:b?700:400,fontFamily:S.fontMono}}>{fmt(v,1)}</span>
            </div>
          ))}
        </Card>
        <Card title="⚙️ DCF Parameters">
          <Slider label="Coal Price (FOB)" value={p.coalPrice||120} min={50} max={250} unit=" $/t" onChange={v=>u("coalPrice",v)}/>
          <Slider label="Discount Rate (WACC)" value={p.discRate||10} min={5} max={25} step={0.5} unit="%" onChange={v=>u("discRate",v)}/>
          <Slider label="Royalty Rate" value={p.royaltyRate||7} min={0} max={15} step={0.5} unit="%" onChange={v=>u("royaltyRate",v)}/>
          <Slider label="Income Tax Rate" value={p.taxRate||22} min={10} max={35} unit="%" onChange={v=>u("taxRate",v)}/>
          <Slider label="CAPEX ($M)" value={p.capex||180} min={50} max={500} step={5} unit=" M" onChange={v=>u("capex",v)}/>
        </Card>
      </div>
    </div>
  );
}

function M5({p,npv}) {
  const dr=p.discRate||10, cp=p.coalPrice||120;
  const calc=(price,d)=>{
    const rev=price*(p.annualProd||5), opex=(p.cashCost||24)*(p.annualProd||5);
    const roy=rev*(p.royaltyRate||7)/100, ebitda=rev-opex-roy;
    const dep=(p.capex||180)/(p.mineLife||20), ebit=ebitda-dep;
    const tax=Math.max(ebit*(p.taxRate||22)/100,0), fcf=ebit-tax+dep;
    let n=-(p.capex||180);
    for(let y=1;y<=(p.mineLife||20);y++) n+=fcf/Math.pow(1+d/100,y);
    return Math.round(n);
  };
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card title="🎯 NPV Sensitivity Matrix ($M)">
        <div style={{fontSize:10,color:S.textDim,marginBottom:10}}>Coal Price Δ vs Discount Rate</div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr>
            <th style={{padding:"5px 8px",color:S.textDim,fontSize:10,textAlign:"left"}}>Price / DR</th>
            {[dr-2,dr,dr+2].map(d=><th key={d} style={{padding:"5px 8px",color:S.textDim,fontSize:10,textAlign:"center"}}>{d}%</th>)}
          </tr></thead>
          <tbody>
            {[-20,-10,0,10,20].map(delta=>{
              const price=cp*(1+delta/100);
              return(
                <tr key={delta} style={{borderBottom:`1px solid ${S.border}`}}>
                  <td style={{padding:"7px 8px",color:delta>0?S.green:delta<0?S.red:S.cyan,fontWeight:600}}>{delta>0?"+":""}{delta}%</td>
                  {[dr-2,dr,dr+2].map(d=>{
                    const v=calc(price,d); const isBase=delta===0&&d===dr;
                    return <td key={d} style={{padding:"7px 8px",textAlign:"center",color:v>0?S.green:S.red,fontWeight:isBase?800:400,background:isBase?S.greenBg:"transparent",fontFamily:"'Courier New',monospace"}}>{fmt(v)}</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <Card title="🌪️ Tornado Chart">
        <div style={{fontSize:10,color:S.textDim,marginBottom:12}}>NPV sensitivity to key variables</div>
        {[
          {l:"Coal Price ±20%",lo:calc(cp*0.8,dr),hi:calc(cp*1.2,dr)},
          {l:"Discount Rate ±2%",lo:calc(cp,dr+2),hi:calc(cp,dr-2)},
          {l:"Production ±20%",lo:Math.round(npv*0.8),hi:Math.round(npv*1.2)},
          {l:"Cash Cost ±20%",lo:Math.round(npv*1.1),hi:Math.round(npv*0.9)},
          {l:"CAPEX ±20%",lo:Math.round(npv*1.06),hi:Math.round(npv*0.94)},
        ].map(({l,lo,hi})=>(
          <div key={l} style={{marginBottom:11}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:S.textDim,marginBottom:3}}>
              <span>{l}</span><span style={{color:S.textMuted}}>{fmt(lo)} – {fmt(hi)}</span>
            </div>
            <div style={{height:10,background:S.bg,borderRadius:5,overflow:"hidden"}}>
              <div style={{width:`${Math.min(Math.abs(hi-lo)/600*100,100)}%`,height:"100%",background:`linear-gradient(90deg,${S.cyan},${S.amber})`,borderRadius:5}}/>
            </div>
          </div>
        ))}
        <div style={{marginTop:14,padding:10,background:S.bg,borderRadius:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:11,color:S.textDim}}>Current Spot NPV</span>
          <span style={{fontSize:20,color:npv>0?S.green:S.red,fontWeight:800,fontFamily:"'Courier New',monospace"}}>{fmtM(npv)}</span>
        </div>
      </Card>
    </div>
  );
}

function M6({npv}) {
  const sc=[
    {l:"Bear Case",sub:"Price -20%, DR +2%",v:Math.round(npv*0.65),irr:12,pb:"8.2",c:S.red},
    {l:"Base Case",sub:"Current parameters",v:npv,irr:18,pb:"5.5",c:S.gold},
    {l:"Bull Case",sub:"Price +20%, DR -2%",v:Math.round(npv*1.35),irr:26,pb:"4.1",c:S.green},
  ];
  const mx=Math.max(...sc.map(s=>Math.abs(s.v)));
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:14}}>
        {sc.map(s=>(
          <Card key={s.l} style={{border:`1px solid ${s.c}44`,borderRadius:10,textAlign:"center",background:S.bg2}}>
            <div style={{fontSize:10,color:s.c,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{s.l}</div>
            <div style={{fontSize:10,color:S.textFaint,marginBottom:10}}>{s.sub}</div>
            <div style={{fontSize:26,fontWeight:800,color:s.c,fontFamily:S.fontMono,marginBottom:8}}>{fmtM(s.v)}</div>
            <div style={{display:"flex",justifyContent:"space-around",fontSize:11,color:S.textMuted}}>
              <span>IRR <b style={{color:s.c}}>{s.irr}%</b></span>
              <span>Payback <b style={{color:s.c}}>{s.pb} yrs</b></span>
            </div>
          </Card>
        ))}
      </div>
      <Card title="📊 NPV Comparison">
        {sc.map(s=>(
          <div key={s.l} style={{marginBottom:13}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <span style={{fontSize:12,color:S.textMuted}}>{s.l}</span>
              <span style={{fontSize:13,color:s.c,fontWeight:700,fontFamily:"'Courier New',monospace"}}>{fmtM(s.v)}</span>
            </div>
            <div style={{height:28,background:S.bg4,borderRadius:6,overflow:"hidden"}}>
              <div style={{width:`${Math.abs(s.v)/mx*100}%`,height:"100%",background:s.c,opacity:0.88,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:8,transition:"width 0.6s"}}>
                <span style={{fontSize:10,color:"#fff",fontWeight:700}}>{s.irr}% IRR</span>
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function M7({p,setP,npv}) {
  const u=(k,v)=>setP(x=>({...x,[k]:v}));
  const acq=p.acquisitionCost||120, dp=p.debtPct||60, dc=p.debtCost||8, dt=p.loanTenor||5;
  const debt=acq*dp/100, eq=acq-debt;
  const ads=debt*(dc/100)*Math.pow(1+dc/100,dt)/(Math.pow(1+dc/100,dt)-1);
  const lnpv=npv-debt*(dc/100*dt);
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card title="💰 Deal Structuring & Financing">
        <Slider label="Acquisition Cost ($M)" value={acq} min={50} max={500} step={5} unit=" M" onChange={v=>u("acquisitionCost",v)}/>
        <Slider label="Debt Financing" value={dp} min={0} max={80} unit="%" onChange={v=>u("debtPct",v)}/>
        <Slider label="Loan Interest Rate" value={dc} min={3} max={20} step={0.5} unit="%" onChange={v=>u("debtCost",v)}/>
        <Slider label="Loan Tenor" value={dt} min={1} max={10} unit=" yrs" onChange={v=>u("loanTenor",v)}/>
        <div style={{height:18,display:"flex",borderRadius:6,overflow:"hidden",marginTop:14}}>
          <div style={{flex:dp,background:S.cyan,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:S.bg,fontWeight:600,fontFamily:S.fontUI}}>{dp>15?`Debt ${dp}%`:""}</div>
          <div style={{flex:100-dp,background:`${S.green}cc`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:S.bg,fontWeight:600,fontFamily:S.fontUI}}>{100-dp>15?`Equity ${100-dp}%`:""}</div>
        </div>
      </Card>
      <div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <KPI label="Debt Amount" value={fmtM(Math.round(debt))}/>
          <KPI label="Equity Required" value={fmtM(Math.round(eq))}/>
          <KPI label="Annual Debt Service" value={fmtM(Math.round(ads))}/>
          <KPI label="Levered NPV" value={fmtM(Math.round(lnpv))} accent={lnpv>0}/>
        </div>
        <Card title="📋 Deal Economics">
          {[["Acquisition Cost",`$${fmt(acq)}M`],["Enterprise Value",fmtM(npv)],["Premium/(Discount)",`${fmt((acq/Math.max(npv,1)-1)*100,1)}%`],["Debt",`$${fmt(Math.round(debt))}M @ ${dc}%`],["Equity",`$${fmt(Math.round(eq))}M`],["Tenor",`${dt} years`]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 4px",borderBottom:`1px solid ${S.border}`}}>
              <span style={{fontSize:11,color:S.textMuted}}>{k}</span>
              <span style={{fontSize:12,color:S.text,fontWeight:600}}>{v}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function M8({p,setP,npv}) {
  const u=(k,v)=>setP(x=>({...x,[k]:v}));
  const infra=p.sharedInfra||12, cs=infra*0.8+10, rs=infra*0.5, tot=cs+rs;
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card title="⚡ Post-Merger Synergy">
        <Slider label="Shared Infrastructure Overlap" value={infra} min={1} max={30} unit=" units" onChange={v=>u("sharedInfra",v)}/>
        <Slider label="G&A Consolidation" value={p.gaConsolidation||30} min={0} max={80} unit="%" onChange={v=>u("gaConsolidation",v)}/>
        <Slider label="Procurement Savings" value={p.procSavings||8} min={0} max={25} unit="%" onChange={v=>u("procSavings",v)}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:14}}>
          <div style={{padding:10,background:S.bg,borderRadius:8,textAlign:"center"}}>
            <div style={{fontSize:9,color:S.textDim,textTransform:"uppercase",marginBottom:3}}>Cost Synergy/yr</div>
            <div style={{fontSize:17,color:S.green,fontWeight:700,fontFamily:S.fontMono}}>${fmt(Math.round(cs))}M</div>
          </div>
          <div style={{padding:10,background:S.bg,borderRadius:8,textAlign:"center"}}>
            <div style={{fontSize:9,color:S.textDim,textTransform:"uppercase",marginBottom:3}}>Revenue Synergy/yr</div>
            <div style={{fontSize:17,color:"#0ea5e9",fontWeight:700,fontFamily:S.fontMono}}>${fmt(Math.round(rs))}M</div>
          </div>
        </div>
      </Card>
      <div>
        <Card style={{background:S.green,border:"none",textAlign:"center",marginBottom:12,borderRadius:10}}>
          <div style={{fontSize:11,color:"#ffffff",fontWeight:700,marginBottom:6,fontSize:12}}>Total Annual Synergy</div>
          <div style={{fontSize:38,fontWeight:800,color:"#ffffff",fontFamily:S.fontMono}}>+${fmt(Math.round(tot))}M</div>
        </Card>
        <Card>{[["Current NPV",fmtM(npv),S.gold],["Synergy NPV (3yr)",`+${fmtM(Math.round(tot*3))}`,S.green],["Post-Synergy NPV",fmtM(Math.round(npv+tot*3)),S.green]].map(([k,v,c])=>(
          <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${S.border}`}}>
            <span style={{fontSize:12,color:S.textMuted}}>{k}</span>
            <span style={{fontSize:14,color:c,fontWeight:700,fontFamily:S.fontMono}}>{v}</span>
          </div>
        ))}</Card>
      </div>
    </div>
  );
}

function M9({p,setP}) {
  const u=(k,v)=>setP(x=>({...x,[k]:v}));
  const checks=[
    {k:"iupValid",l:"IUP Operasi Produksi Valid",d:"Izin aktif, tidak dalam sengketa",def:true},
    {k:"certClean",l:"Sertifikat Clear and Clean (CnC)",d:"Tidak ada tumpang tindih wilayah",def:true},
    {k:"amdal",l:"AMDAL / Dokumen Lingkungan",d:"Disetujui instansi berwenang",def:true},
    {k:"ppa",l:"Izin Pinjam Pakai Kawasan Hutan",d:"IPPKH bila area masuk kawasan hutan",def:false},
    {k:"dmb",l:"Kepatuhan Kuota DMO",d:"Memenuhi kewajiban batubara domestik",def:true},
  ];
  const vals=checks.map(c=>p[c.k]!==undefined?p[c.k]:c.def);
  const pass=vals.filter(Boolean).length;
  const score=parseFloat((pass/checks.length*5).toFixed(1));
  const sc=score>=4?S.green:score>=3?S.yellow:S.red;
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card title="✅ Compliance Checklist">
        {checks.map((c,i)=>{
          const checked=vals[i];
          return(
            <div key={c.k} onClick={()=>u(c.k,!checked)}
              style={{display:"flex",gap:10,padding:"10px 12px",marginBottom:8,background:S.bg4,borderRadius:8,borderLeft:`4px solid ${checked?S.green:S.red}`,cursor:"pointer"}}>
              <div style={{width:18,height:18,borderRadius:4,flexShrink:0,background:checked?S.green:"transparent",border:`1.5px solid ${checked?S.green:S.red}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff",marginTop:1}}>{checked?"✓":""}</div>
              <div>
                <div style={{fontSize:12,color:checked?S.text:S.textMuted,fontWeight:600,marginBottom:1}}>{c.l}</div>
                <div style={{fontSize:10,color:S.textFaint}}>{c.d}</div>
              </div>
            </div>
          );
        })}
      </Card>
      <div>
        <Card style={{textAlign:"center",marginBottom:12}}>
          <div style={{fontSize:11,color:S.textDim,marginBottom:8}}>Due Diligence Score</div>
          <div style={{fontSize:52,fontWeight:800,color:sc,fontFamily:"'Courier New',monospace",lineHeight:1}}>
            {score}<span style={{fontSize:20,color:S.textDim}}>/5</span>
          </div>
          <div style={{marginTop:8,fontSize:12,color:sc,fontWeight:600}}>
            {score>=4?"✅ Proceed — Strong DD":score>=3?"⚠️ Caution — Review Issues":"🚨 Red Flag — Do Not Proceed"}
          </div>
        </Card>
        <Card title="⚠️ Risk Register">
          {[
            {l:"Regulatory Risk",v:pass>=4?"Low":"Medium",c:pass>=4?S.green:S.yellow},
            {l:"Environmental Risk",v:(p.amdal!==false)?"Low":"High",c:(p.amdal!==false)?S.green:S.red},
            {l:"Title Risk",v:(p.certClean!==false)?"Low":"High",c:(p.certClean!==false)?S.green:S.red},
            {l:"Market Risk",v:"Medium",c:S.yellow},
            {l:"Operational Risk",v:"Low",c:S.green},
          ].map(r=>(
            <div key={r.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${S.border}`}}>
              <span style={{fontSize:12,color:S.textMuted}}>{r.l}</span>
              <span style={{fontSize:11,fontWeight:700,color:r.c,background:`${r.c}15`,padding:"3px 10px",borderRadius:4,fontFamily:S.fontUI,letterSpacing:0.3,fontWeight:600}}>{r.v}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── CALCULATOR WORKSPACE (9-module sidebar, Stage I style) ───────────────────
function CalculatorWorkspace({user, company, params, setParams, onSave, saveMsg, onBack, onLogout}) {
  const [mod, setMod] = useState(1);
  const [npv, setNpv] = useState(()=>calcNPV(params));
  const mp = {p:params, setP:setParams, npv, setNpv};

  const renderMod = () => {
    switch(mod) {
      case 1: return <M1 co={company} setCo={()=>{}}/>;
      case 2: return <M2 {...mp}/>;
      case 3: return <M3 {...mp}/>;
      case 4: return <M4 {...mp}/>;
      case 5: return <M5 {...mp}/>;
      case 6: return <M6 {...mp}/>;
      case 7: return <M7 {...mp}/>;
      case 8: return <M8 {...mp}/>;
      case 9: return <M9 {...mp}/>;
      default: return null;
    }
  };

  return (
    <div style={{display:"flex",height:"100vh",background:S.bg,fontFamily:S.fontUI,color:S.text,overflow:"hidden"}}>

      {/* ── SIDEBAR ── */}
      <div style={{width:216,background:S.bg2,borderRight:`1px solid ${S.border}`,display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"14px 14px 12px",borderBottom:`1px solid ${S.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <div style={{width:22,height:22,background:S.cyanBg,border:`1px solid ${S.cyanBorder}`,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>⛏</div>
            <span style={{fontSize:10,color:S.textMuted,fontFamily:S.fontMono,letterSpacing:1}}>MINING M&A</span>
          </div>
          <button onClick={onBack} style={{background:"transparent",border:"none",color:S.textDim,cursor:"pointer",fontSize:10,padding:0,marginBottom:10,display:"flex",alignItems:"center",gap:4,fontFamily:S.fontUI}}>
            ← workspace
          </button>
          <div style={{padding:"8px 10px",background:S.bg4,border:`1px solid ${S.border2}`,borderRadius:5,borderLeft:`2px solid ${S.cyan}`}}>
            <div style={{fontSize:9,color:S.textDim,textTransform:"uppercase",letterSpacing:1.2,marginBottom:2,fontFamily:S.fontUI}}>Target</div>
            <div style={{fontSize:11,fontWeight:600,color:S.text,lineHeight:1.3}}>{company.name}</div>
          </div>
        </div>
        <nav style={{flex:1,padding:"8px 6px",overflowY:"auto"}}>
          <div style={{fontSize:9,color:S.textFaint,textTransform:"uppercase",letterSpacing:2,padding:"6px 8px 8px",fontFamily:S.fontUI}}>Modules</div>
          {NAV.map(item=>{
            const active=mod===item.id;
            return(
              <button key={item.id} onClick={()=>setMod(item.id)}
                style={{display:"flex",alignItems:"center",gap:9,width:"100%",padding:"8px 10px",marginBottom:1,
                  background:active?"#5c6bff18":"transparent",border:`1px solid ${active?S.cyanBorder:"transparent"}`,
                  borderRadius:7,cursor:"pointer",textAlign:"left",transition:"all 0.12s"}}>
                <span style={{fontSize:12,flexShrink:0,opacity:active?1:0.55}}>{item.icon}</span>
                <span style={{flex:1,fontSize:11,color:active?S.cyan:S.textMuted,fontWeight:active?600:400,fontFamily:S.fontUI}}>{item.label}</span>
                <span style={{fontSize:9,color:active?S.cyanDim:S.textFaint,fontFamily:S.fontMono}}>{String(item.id).padStart(2,"0")}</span>
              </button>
            );
          })}
        </nav>
        <div style={{padding:"14px 14px",borderTop:`1px solid ${S.border}`,background:S.bg42}}>
          <div style={{fontSize:9,color:S.textDim,textTransform:"uppercase",letterSpacing:1.5,marginBottom:4,fontFamily:S.fontUI}}>Live NPV</div>
          <div style={{fontSize:20,fontWeight:700,color:npv>0?S.green:S.red,fontFamily:S.fontMono,letterSpacing:-0.5}}>{fmtM(npv)}</div>
          <div style={{fontSize:9,color:S.textFaint,marginTop:2,fontFamily:S.fontMono}}>@ spot parameters</div>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"11px 20px",borderBottom:`1px solid ${S.border}`,background:S.bg2,boxShadow:"0 1px 0 rgba(0,0,0,0.06)",boxShadow:"0 1px 0 #dde1ee",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div>
              <div style={{fontSize:14,fontWeight:600,color:S.text,letterSpacing:-0.2}}>{NAV.find(n=>n.id===mod)?.label}</div>
              <div style={{fontSize:10,color:S.textDim,marginTop:1,fontFamily:S.fontMono}}>MOD {String(mod).padStart(2,"0")}/{NAV.length} · {company.ticker||"—"}</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {saveMsg&&<span style={{fontSize:11,color:S.green,fontWeight:600,fontFamily:S.fontMono}}>{saveMsg}</span>}
            <button onClick={onSave} style={{background:S.cyan,border:"none",borderRadius:6,padding:"7px 16px",fontSize:11,fontWeight:600,color:"#ffffff",cursor:"pointer",fontFamily:S.fontUI,letterSpacing:0.3}}>Save Snapshot</button>
            <div style={{width:1,height:20,background:S.border}}/>
            <Avatar initials={user.avatar} size={28}/>
            <button onClick={onLogout} style={{background:"transparent",border:`1px solid ${S.border}`,borderRadius:5,padding:"5px 10px",color:S.textDim,fontSize:10,cursor:"pointer",fontFamily:S.fontUI}}>Sign out</button>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:20,background:S.bg}}>{renderMod()}</div>
      </div>
    </div>
  );
}

// ─── ANALYST LIST VIEW ────────────────────────────────────────────────────────
function AnalystApp({user, companies, setCompanies, onLogout}) {
  const [view, setView]       = useState("list");
  const [selCo, setSelCo]     = useState(null);
  const [extracting, setExtr] = useState(false);
  const [extracted, setExted] = useState(null);
  const [calcParams, setCP]   = useState(null);
  const [saveMsg, setSaveMsg] = useState("");

  const DEFAULT_PARAMS = {
    coalPrice:120,discRate:10,annualProd:5,mineLife:20,cashCost:24,royaltyRate:7,taxRate:22,capex:180,
    measuredMt:50,indicatedMt:40,inferredMt:20,measuredGar:5400,indicatedGar:5200,inferredGar:4900,
    recoveryRate:85,stripRatio:6,haulingDist:35,bargeDist:180,crushCost:2.5,portHandling:3.5,
    acquisitionCost:120,debtPct:60,debtCost:8,loanTenor:5,sharedInfra:12,gaConsolidation:30,procSavings:8,
    iupValid:true,certClean:true,amdal:true,ppa:false,dmb:true
  };

  function openCalc(co) { setSelCo(co); setCP(co.snapshots[0]?.params||DEFAULT_PARAMS); setView("calc"); }
  function openExtract(co) { setSelCo(co); setExted(null); setView("extract"); }

  function runExtract() {
    setExtr(true);
    setTimeout(()=>{
      setExted({ reservesMt:(Math.random()*30+40).toFixed(1), coalGar:(Math.random()*500+5000).toFixed(0),
        cashCost:(Math.random()*8+20).toFixed(1), revenue:(Math.random()*200+400).toFixed(0),
        ebitda:(Math.random()*100+200).toFixed(0), netAssets:(Math.random()*200+500).toFixed(0),
        iupValid:"Yes — expires 2034", environmental:"AMDAL approved 2023",
        confidence:(Math.random()*15+80).toFixed(0) });
      setExtr(false);
    }, 2000);
  }

  function saveSnapshot() {
    const p=calcParams, n=calcNPV(p);
    const rev=(p.coalPrice||120)*(p.annualProd||5), opex=(p.cashCost||24)*(p.annualProd||5);
    const roy=rev*(p.royaltyRate||7)/100, ebitda=rev-opex-roy;
    const dep=(p.capex||180)/(p.mineLife||20), ebit=ebitda-dep;
    const tax=Math.max(ebit*(p.taxRate||22)/100,0), fcf=ebit-tax+dep;
    const snap={
      date:new Date().toISOString().slice(0,10), analyst:user.name, params:{...p},
      npv:n, irr:parseFloat((n/(p.capex||180)*8+12).toFixed(1)),
      payback:parseFloat(((p.capex||180)/Math.max(fcf,1)).toFixed(1)),
      bearNpv:Math.round(n*0.65), bullNpv:Math.round(n*1.35),
      ddScore:parseFloat((Math.random()*1.2+3.4).toFixed(1)),
      synergy:Math.round(Math.abs(n)*0.025),
      recommendation:n>800?"proceed":n>400?"monitor":"avoid"
    };
    setCompanies(prev=>prev.map(c=>c.id===selCo.id?{...c,snapshots:[snap,...c.snapshots]}:c));
    setSaveMsg("✓ Snapshot saved!"); setTimeout(()=>setSaveMsg(""),3000);
  }

  if (view==="calc") return <CalculatorWorkspace user={user} company={selCo} params={calcParams} setParams={setCP} onSave={saveSnapshot} saveMsg={saveMsg} onBack={()=>setView("list")} onLogout={onLogout}/>;
  if (view==="extract") return <ExtractionView user={user} company={selCo} extracting={extracting} extracted={extracted} onExtract={runExtract} onOpenCalc={()=>openCalc(selCo)} onBack={()=>setView("list")} onLogout={onLogout}/>;

  return (
    <div style={{minHeight:"100vh",background:S.bg,fontFamily:S.fontUI,color:S.text}}>
      <div style={{background:S.bg2,borderBottom:`1px solid ${S.border}`,boxShadow:"0 1px 0 #dde1ee",padding:"12px 22px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{fontSize:16,color:S.cyan,fontWeight:800,fontFamily:S.fontUI,letterSpacing:-0.3,fontSize:16}}>⛏ Mining M&A</div>
          <Tag label="Analyst Workspace" color={S.blueBg} text={S.blue}/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <Avatar initials={user.avatar} size={30}/>
          <div><div style={{fontSize:12,fontWeight:600,color:S.text}}>{user.name}</div><div style={{fontSize:9,color:S.textFaint}}>{user.team}</div></div>
          <button onClick={onLogout} style={{background:"transparent",border:`1px solid ${S.border}`,borderRadius:6,padding:"5px 10px",color:S.textDim,fontSize:10,cursor:"pointer"}}>Sign out</button>
        </div>
      </div>
      <div style={{padding:22}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div>
            <div style={{fontSize:18,fontWeight:700,color:S.text,fontWeight:700,fontSize:20,letterSpacing:-0.5,marginBottom:3}}>Company Workspace</div>
            <div style={{fontSize:11,color:S.textFaint}}>AI extraction · 9-module valuation model · versioned snapshots</div>
          </div>
          <button onClick={()=>setCompanies(p=>[...p,{id:"new"+Date.now(),name:"New Target Company",ticker:"NTC",location:"—",type:"Thermal Coal",iup:"—",entityType:"—",listedOn:"—",mineralClass:"—",shareGov:0,sharePublic:100,shareForeign:0,status:"watchlist",snapshots:[]}])}
            style={{background:S.cyan,border:"none",borderRadius:6,padding:"8px 16px",fontSize:11,fontWeight:600,color:"#ffffff",cursor:"pointer",fontFamily:S.fontUI,letterSpacing:0.3}}>+ Add Target</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
          {companies.map(co=>{
            const lat=co.snapshots[0];
            return(
              <div key={co.id} style={{background:S.bg2,border:`1px solid ${S.border}`,borderRadius:8,padding:18}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:S.text,marginBottom:3}}>{co.name}</div>
                    <div style={{fontSize:10,color:S.textFaint}}>{co.location} · {co.type}</div>
                  </div>
                  <Tag label={co.status} color={co.status==="active"?S.greenBg:S.bg4} text={co.status==="active"?S.green:S.blue}/>
                </div>
                {lat?(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                    {[["NPV",fmtM(lat.npv)],["IRR",`${lat.irr}%`],["DD",`${lat.ddScore}/5`]].map(([l,v])=>(
                      <div key={l} style={{background:S.bg,borderRadius:6,padding:"7px",textAlign:"center"}}>
                        <div style={{fontSize:9,color:S.textFaint,textTransform:"uppercase",letterSpacing:0.8}}>{l}</div>
                        <div style={{fontSize:13,fontWeight:700,color:S.cyan,fontFamily:S.fontMono}}>{v}</div>
                      </div>
                    ))}
                  </div>
                ):(
                  <div style={{padding:"10px",background:S.bg4,borderRadius:4,textAlign:"center",fontSize:10,color:S.textDim,marginBottom:12,fontFamily:S.fontMono,letterSpacing:0.5}}>NO VALUATION · ADD VIA AI EXTRACT</div>
                )}
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>openExtract(co)} style={{flex:1,background:S.cyanBg,border:`1px solid ${S.cyanBorder}`,borderRadius:6,padding:"7px 10px",fontSize:11,color:S.cyan,cursor:"pointer",fontWeight:600,fontFamily:S.fontUI,letterSpacing:0.3}}>AI Extract</button>
                  <button onClick={()=>openCalc(co)} style={{flex:1,background:S.greenBg,border:`1px solid ${S.greenBorder}`,borderRadius:6,padding:"7px 10px",fontSize:11,color:S.green,cursor:"pointer",fontWeight:600,fontFamily:S.fontUI,letterSpacing:0.3}}>Calculator</button>
                </div>
                {lat&&<div style={{marginTop:8,fontSize:9,color:S.textDim,fontFamily:S.fontMono}}>{co.snapshots.length} snapshot{co.snapshots.length>1?"s":""} · {lat.date} · {lat.analyst.split(" ")[0]}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── EXTRACTION VIEW ──────────────────────────────────────────────────────────
function ExtractionView({user,company,extracting,extracted,onExtract,onOpenCalc,onBack,onLogout}) {
  return(
    <div style={{minHeight:"100vh",background:S.bg,fontFamily:S.fontUI,color:S.text}}>
      <div style={{background:S.bg2,borderBottom:`1px solid ${S.border}`,padding:"12px 20px",boxShadow:"0 1px 3px rgba(0,0,0,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={onBack} style={{background:"transparent",border:"none",color:S.textDim,cursor:"pointer",fontSize:16}}>←</button>
          <div style={{fontSize:14,fontWeight:700,color:S.cyan,fontFamily:S.fontMono,fontWeight:600,letterSpacing:0.5}}>AI Extraction Engine</div>
          <Tag label={company.name} color={S.bg4} text={S.textMuted}/>
        </div>
        <button onClick={onLogout} style={{background:"transparent",border:`1px solid ${S.border}`,borderRadius:6,padding:"5px 10px",color:S.textDim,fontSize:10,cursor:"pointer"}}>Sign out</button>
      </div>
      <div style={{maxWidth:660,margin:"0 auto",padding:24}}>
        <div style={{border:`2px dashed ${S.cyanBorder}`,borderRadius:12,padding:28,textAlign:"center",marginBottom:18,background:S.bg2}}>
          <div style={{fontSize:30,marginBottom:10}}>📄</div>
          <div style={{fontSize:13,color:S.textMuted,marginBottom:4}}>Upload documents for {company.name}</div>
          <div style={{fontSize:10,color:S.textFaint,marginBottom:16}}>Annual Report · Geological Report · IUP Certificate · P&L</div>
          <button onClick={onExtract} disabled={extracting}
            style={{background:extracting?S.bg4:S.cyan,border:`1px solid ${extracting?S.border:S.cyan}`,borderRadius:4,padding:"9px 22px",fontSize:11,fontWeight:600,color:extracting?S.textDim:S.bg,cursor:extracting?"not-allowed":"pointer",fontFamily:S.fontUI,letterSpacing:0.3}}>
            {extracting?"⏳ Extracting with AI…":"✨ Extract Data with AI"}
          </button>
        </div>
        {extracting&&<Card>{["Detecting document structure","Extracting reserve figures","Reading financial statements","Parsing regulatory data","Calculating confidence scores"].map((s,i)=><div key={i} style={{fontSize:11,color:S.textFaint,padding:"4px 0",borderBottom:`1px solid ${S.border}`}}>⚡ {s}</div>)}</Card>}
        {extracted&&(
          <Card style={{border:`1px solid ${S.greenBorder}`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
              <div style={{fontSize:13,color:S.green,fontWeight:700}}>✓ Extraction Complete</div>
              <Tag label={`${extracted.confidence}% confidence`} color={S.greenBg} text={S.green}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              {[["Total Resources",`${extracted.reservesMt} Mt`],["Average GAR",`${extracted.coalGar} kcal/kg`],["Cash Cost",`$${extracted.cashCost}/t`],["Annual Revenue",`$${extracted.revenue}M`],["EBITDA",`$${extracted.ebitda}M`],["Net Assets",`$${extracted.netAssets}M`],["IUP Status",extracted.iupValid],["Environment",extracted.environmental]].map(([k,v])=>(
                <div key={k} style={{padding:"8px 12px",background:S.bg4,borderRadius:6,display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:10,color:S.textDim}}>{k}</span>
                  <span style={{fontSize:11,color:S.text,fontWeight:600}}>{v}</span>
                </div>
              ))}
            </div>
            <button onClick={onOpenCalc} style={{width:"100%",background:S.green,border:"none",borderRadius:6,padding:"10px",fontSize:11,fontWeight:600,color:"#ffffff",cursor:"pointer",fontFamily:S.fontUI,letterSpacing:0.3}}>
              → Open in 9-Module Calculator
            </button>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── EXECUTIVE DASHBOARD — Bloomberg Terminal Aesthetic ──────────────────────
const E = {
  // Executive dashboard — bright white with strong colour accents
  bg:      "#f5f7ff",   // pale blue-white canvas
  bg2:     "#ffffff",   // panel surfaces
  bg3:     "#edf0fc",   // inset / row alternate
  bg4:     "#e2e6f8",   // deep inset
  border:  "#cdd3f0",
  border2: "#dce1f5",
  text:    "#090d28",
  muted:   "#525a80",
  faint:   "#a8b0d0",
  // Accent palette — bold and executive
  amber:   "#e67e00",   // deep gold — primary data color
  amberDim:"#b36000",
  green:   "#059652",   // confident emerald
  red:     "#dc2626",   // clear danger
  blue:    "#2563eb",   // trustworthy blue
  violet:  "#7c3aed",   // secondary accent
  mono:    "'JetBrains Mono','Fira Code','Courier New',monospace",
  ui:      "'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif",
};

function ExecKPI({label,value,sub,color=E.amber,borderColor}) {
  return (
    <div style={{background:E.bg2,border:`1px solid ${borderColor||E.border}`,borderRadius:8,padding:"14px 16px",position:"relative",overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:color,opacity:1}}/>
      <div style={{fontSize:9,color:E.muted,textTransform:"uppercase",letterSpacing:1.8,marginBottom:6,fontFamily:E.ui}}>{label}</div>
      <div style={{fontSize:22,fontWeight:700,color:color,fontFamily:E.mono,letterSpacing:-0.5,lineHeight:1}}>{value}</div>
      {sub&&<div style={{fontSize:10,color:E.muted,marginTop:5,fontFamily:E.mono}}>{sub}</div>}
    </div>
  );
}

function ExecutiveDashboard({user,companies,onLogout}) {
  const [sel,setSel]=useState(null);
  const cosD=companies.filter(c=>c.snapshots.length>0);
  const selCo=sel?companies.find(c=>c.id===sel):null, lat=selCo?.snapshots[0];
  const now = new Date().toISOString().replace("T"," ").slice(0,19)+" UTC";

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#f0f2ff 0%,#f8f7ff 100%)",fontFamily:E.ui,color:E.text,display:"flex",flexDirection:"column"}}>

      {/* ── TOPBAR ── */}
      <div style={{background:E.bg2,borderBottom:`1px solid ${E.border}`,borderTop:`3px solid ${E.blue}`,padding:"0 20px",display:"flex",justifyContent:"space-between",alignItems:"stretch",height:44,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:0}}>
          <div style={{padding:"0 16px",borderRight:`1px solid ${E.border}`,height:"100%",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:E.amber}}/>
            <span style={{fontSize:13,fontWeight:700,color:E.amber,letterSpacing:0.5,fontFamily:E.mono}}>M&A INTEL</span>
          </div>
          <div style={{padding:"0 16px",borderRight:`1px solid ${E.border}`,height:"100%",display:"flex",alignItems:"center"}}>
            <span style={{fontSize:10,color:E.muted,letterSpacing:2,textTransform:"uppercase",fontFamily:E.mono}}>Executive Terminal · Stage II</span>
          </div>
          <div style={{padding:"0 16px",height:"100%",display:"flex",alignItems:"center"}}>
            <span style={{fontSize:10,color:E.muted,fontFamily:E.mono}}>{now}</span>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12,paddingLeft:16}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:24,height:24,borderRadius:3,background:E.bg4,border:`1px solid ${E.border2}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:600,color:E.amber,fontFamily:E.mono,background:E.bg3}}>{user.avatar}</div>
            <div>
              <div style={{fontSize:11,color:E.text,fontFamily:E.ui,fontWeight:500}}>{user.name}</div>
              <div style={{fontSize:9,color:E.muted,fontFamily:E.mono,textTransform:"uppercase",letterSpacing:1}}>{user.team}</div>
            </div>
          </div>
          <div style={{width:1,height:20,background:E.border}}/>
          <button onClick={onLogout} style={{background:E.bg3,border:`1px solid ${E.border}`,borderRadius:4,padding:"5px 12px",color:E.muted,fontSize:10,cursor:"pointer",fontFamily:E.ui,letterSpacing:0.3}}>Sign out</button>
        </div>
      </div>

      <div style={{display:"flex",flex:1,overflow:"hidden",minHeight:0}}>
        {/* ── WATCHLIST PANEL ── */}
        <div style={{width:240,background:E.bg2,borderRight:`1px solid ${E.border}`,boxShadow:"2px 0 6px rgba(0,0,0,0.04)",display:"flex",flexDirection:"column",flexShrink:0}}>
          <div style={{padding:"10px 14px 8px",borderBottom:`1px solid ${E.border}`}}>
            <div style={{fontSize:9,color:E.muted,textTransform:"uppercase",letterSpacing:2,fontFamily:E.mono,fontWeight:600}}>Watchlist <span style={{color:E.faint}}>({companies.length})</span></div>
          </div>
          <div style={{flex:1,overflowY:"auto"}}>
            {companies.map(co=>{
              const l=co.snapshots[0]; const isSel=sel===co.id;
              const hasData=co.snapshots.length>0;
              return(
                <div key={co.id} onClick={()=>hasData&&setSel(co.id)}
                  style={{padding:"10px 14px",borderBottom:`1px solid ${E.border}`,background:isSel?E.bg4:"transparent",borderLeft:`3px solid ${isSel?E.blue:"transparent"}`,cursor:hasData?"pointer":"default",opacity:hasData?1:0.35,transition:"all 0.1s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:3}}>
                    <div style={{fontSize:11,fontWeight:isSel?600:400,color:isSel?E.text:E.muted,lineHeight:1.4,lineHeight:1.3,fontFamily:E.ui}}>{co.name}</div>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:9,color:E.faint,fontFamily:E.mono}}>{co.ticker} · {co.snapshots.length}v</span>
                    {l&&<span style={{fontSize:11,color:recColor(l.recommendation),fontFamily:E.mono,fontWeight:600}}>{fmtM(l.npv)}</span>}
                  </div>
                  {l&&<div style={{marginTop:4,display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:4,height:4,borderRadius:"50%",background:recColor(l.recommendation)}}/>
                    <span style={{fontSize:9,color:recColor(l.recommendation),fontFamily:E.mono,textTransform:"uppercase",letterSpacing:0.8}}>{recLabel(l.recommendation).replace("● ","")}</span>
                  </div>}
                </div>
              );
            })}
          </div>
          <div style={{padding:"10px 14px",borderTop:`1px solid ${E.border}`}}>
            <div style={{fontSize:9,color:E.faint,fontFamily:E.mono,textTransform:"uppercase",letterSpacing:1.2}}>{cosD.length} valuations active</div>
          </div>
        </div>

        {/* ── MAIN PANEL ── */}
        <div style={{flex:1,overflowY:"auto",background:E.bg3}}>
          {!selCo?(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",color:E.faint,gap:12,background:E.bg}}>
              <div style={{width:48,height:48,border:`1px solid ${E.border}`,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,opacity:0.4}}>⛏</div>
              <div style={{fontSize:12,color:E.muted,fontFamily:E.mono,textTransform:"uppercase",letterSpacing:2}}>Select target from watchlist</div>
              <div style={{fontSize:10,color:E.faint,fontFamily:E.mono}}>{cosD.length} valuations ready</div>
            </div>
          ):(
            <div style={{padding:20}}>

              {/* Company header bar */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"14px 18px",background:`linear-gradient(135deg,${E.bg2},${E.bg3})`,border:`1px solid ${E.border}`,borderRadius:8,marginBottom:16,borderLeft:`4px solid ${recColor(lat.recommendation)}`}}>
                <div>
                  <div style={{fontSize:16,fontWeight:600,color:E.text,letterSpacing:-0.3,marginBottom:3}}>{selCo.name}</div>
                  <div style={{fontSize:10,color:E.muted,fontFamily:E.mono}}>{selCo.ticker} · {selCo.location} · {selCo.type} · {selCo.iup}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"flex-end",marginBottom:3}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:recColor(lat.recommendation)}}/>
                    <span style={{fontSize:11,color:recColor(lat.recommendation),fontWeight:600,fontFamily:E.mono,textTransform:"uppercase",letterSpacing:1}}>{recLabel(lat.recommendation).replace("● ","")}</span>
                  </div>
                  <div style={{fontSize:9,color:E.muted,fontFamily:E.mono}}>DD {lat.ddScore}/5 · {lat.date}</div>
                </div>
              </div>

              {/* Hero metric row */}
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",gap:10,marginBottom:16}}>
                <ExecKPI label="Net Present Value (DCF)" value={fmtM(lat.npv)} sub={`@ ${lat.irr}% IRR · ${lat.payback}yr payback`} color={lat.npv>0?E.green:E.red} borderColor={lat.npv>0?`${E.green}33`:`${E.red}33`}/>
                <ExecKPI label="IRR" value={`${lat.irr}%`} sub="Internal rate of return" color={lat.irr>=15?E.green:lat.irr>=10?E.amber:E.red}/>
                <ExecKPI label="Payback" value={`${lat.payback}y`} sub="Capital recovery" color={E.blue}/>
                <ExecKPI label="Synergy" value={`+$${lat.synergy}M`} sub="Annual post-merger" color={E.green}/>
                <ExecKPI label="DD Score" value={`${lat.ddScore}/5`} sub="Due diligence" color={lat.ddScore>=4?E.green:lat.ddScore>=3?E.amber:E.red}/>
              </div>

              {/* Scenario strip */}
              <div style={{background:E.bg3,border:`1px solid ${E.border}`,borderRadius:8,padding:"16px 20px",marginBottom:16}}>
                <div style={{fontSize:10,color:E.muted,textTransform:"uppercase",letterSpacing:2,fontFamily:E.ui,fontWeight:600,marginBottom:14}}>Scenario Analysis</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                  {[["BEAR",lat.bearNpv,E.red,"Price -20% · DR +2%"],["BASE",lat.npv,E.amber,"Current parameters"],["BULL",lat.bullNpv,E.green,"Price +20% · DR -2%"]].map(([l,v,c,s])=>(
                    <div key={l} style={{padding:"14px 18px",background:E.bg2,borderRadius:6,borderTop:`3px solid ${c}`,border:`1px solid ${E.border}`}}>
                      <div style={{fontSize:9,color:c,textTransform:"uppercase",letterSpacing:2,fontFamily:E.mono,marginBottom:8}}>{l} CASE</div>
                      <div style={{fontSize:28,fontWeight:700,color:c,fontFamily:E.mono,letterSpacing:-1,lineHeight:1}}>{fmtM(v)}</div>
                      <div style={{fontSize:9,color:E.muted,marginTop:6,fontFamily:E.mono}}>{s}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* History + comparison row */}
              <div style={{display:"grid",gridTemplateColumns:selCo.snapshots.length>1?"1fr 1fr":"1fr",gap:12}}>
                {selCo.snapshots.length>1&&(
                  <div style={{background:E.bg2,border:`1px solid ${E.border}`,borderRadius:8,padding:"16px 18px",boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
                    <div style={{fontSize:10,color:E.muted,textTransform:"uppercase",letterSpacing:2,fontFamily:E.ui,fontWeight:600,marginBottom:14}}>Valuation History</div>
                    <table style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead><tr style={{borderBottom:`1px solid ${E.border}`}}>
                        {["Date","Analyst","NPV","Status"].map(h=><th key={h} style={{padding:"4px 8px",textAlign:"left",fontSize:9,color:E.faint,textTransform:"uppercase",letterSpacing:1,fontFamily:E.mono,fontWeight:400}}>{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {selCo.snapshots.map((snap,i)=>(
                          <tr key={i} style={{borderBottom:`1px solid ${E.border}`}}>
                            <td style={{padding:"10px 8px",fontSize:10,color:i===0?E.text:E.muted,fontFamily:E.mono}}>{snap.date}</td>
                            <td style={{padding:"8px 8px",fontSize:10,color:E.muted,fontFamily:E.ui}}>{snap.analyst}</td>
                            <td style={{padding:"8px 8px",fontSize:11,color:i===0?E.amber:E.muted,fontFamily:E.mono,fontWeight:i===0?600:400}}>{fmtM(snap.npv)}</td>
                            <td style={{padding:"8px 8px"}}><span style={{fontSize:9,color:recColor(snap.recommendation),fontFamily:E.mono,textTransform:"uppercase",letterSpacing:0.8}}>{recLabel(snap.recommendation).replace("● ","")}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {cosD.length>1&&(
                  <div style={{background:E.bg2,border:`1px solid ${E.border}`,borderRadius:8,padding:"16px 18px",boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
                    <div style={{fontSize:10,color:E.muted,textTransform:"uppercase",letterSpacing:2,fontFamily:E.ui,fontWeight:600,marginBottom:14}}>Portfolio Comparison</div>
                    {cosD.map(co=>{
                      const l=co.snapshots[0], mx=Math.max(...cosD.map(c=>c.snapshots[0]?.npv||1));
                      const pct=Math.max(l.npv/mx*100,0);
                      return(
                        <div key={co.id} style={{marginBottom:14}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                            <span style={{fontSize:10,color:co.id===sel?E.text:E.muted,fontFamily:E.ui,fontWeight:co.id===sel?500:400}}>{co.ticker}</span>
                            <div style={{display:"flex",gap:12,alignItems:"center"}}>
                              <span style={{fontSize:9,color:E.muted,fontFamily:E.mono}}>{l.irr}% IRR</span>
                              <span style={{fontSize:11,color:recColor(l.recommendation),fontFamily:E.mono,fontWeight:600}}>{fmtM(l.npv)}</span>
                            </div>
                          </div>
                          <div style={{height:6,background:E.bg4,borderRadius:3,overflow:"hidden"}}>
                            <div style={{width:`${pct}%`,height:"100%",background:recColor(l.recommendation),opacity:0.9,borderRadius:3,transition:"width 0.5s"}}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]           = useState(null);
  const [companies, setCompanies] = useState(INITIAL_COMPANIES);
  if (!user) return <LoginScreen onLogin={setUser}/>;
  if (user.role==="executive") return <ExecutiveDashboard user={user} companies={companies} onLogout={()=>setUser(null)}/>;
  return <AnalystApp user={user} companies={companies} setCompanies={setCompanies} onLogout={()=>setUser(null)}/>;
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({onLogin}) {
  const [uid,setUid]=useState("analyst1"), [pass,setPass]=useState(""), [err,setErr]=useState(""), [loading,setLoading]=useState(false);
  function go(){
    if(!pass){setErr("Password required");return;}
    if(PASSWORDS[uid]!==pass){setErr("Invalid credentials");return;}
    setLoading(true); setTimeout(()=>onLogin(USERS.find(u=>u.id===uid)),700);
  }
  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#eef1ff 0%,#f5f7ff 50%,#ede9ff 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:S.fontUI}}>
      {/* Subtle grid pattern */}
      <div style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(${S.border} 1px,transparent 1px),linear-gradient(90deg,${S.border} 1px,transparent 1px)`,backgroundSize:"40px 40px",opacity:0.6,pointerEvents:"none"}}/>

      <div style={{width:400,padding:40,position:"relative"}}>
        {/* Logo block */}
        <div style={{marginBottom:40}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
            <div style={{width:36,height:36,background:S.cyanBg,border:`1px solid ${S.cyanBorder}`,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>⛏</div>
            <div>
              <div style={{fontSize:18,color:S.text,fontWeight:700,letterSpacing:-0.3}}>Mining M&A</div>
              <div style={{fontSize:10,color:S.textDim,letterSpacing:2.5,textTransform:"uppercase",fontFamily:S.fontMono}}>Intelligence Platform</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:16}}>
            <div style={{flex:1,height:1,background:S.border}}/>
            <Tag label="Stage II · Enterprise" color={S.amberBg} text={S.amber} border={S.amberBorder}/>
            <div style={{flex:1,height:1,background:S.border}}/>
          </div>
        </div>

        {/* Card */}
        <div style={{background:S.bg3,border:`1px solid ${S.border}`,borderRadius:8,padding:28,position:"relative"}}>
          <div style={{position:"absolute",top:0,left:24,right:24,height:1,background:`linear-gradient(90deg,transparent,${S.cyan}66,transparent)`}}/>

          <div style={{marginBottom:20,fontSize:11,color:S.textMuted,letterSpacing:0.5}}>Sign in to your workspace</div>

          <div style={{marginBottom:14}}>
            <div style={{fontSize:10,color:S.textDim,textTransform:"uppercase",letterSpacing:1.2,marginBottom:6,fontFamily:S.fontUI}}>Account</div>
            <select value={uid} onChange={e=>setUid(e.target.value)}
              style={{width:"100%",background:S.bg4,border:`1px solid ${S.border}`,borderRadius:5,padding:"9px 10px",color:S.text,fontSize:12,outline:"none",fontFamily:S.fontUI}}>
              {USERS.map(u=><option key={u.id} value={u.id}>{u.name} — {u.role==="executive"?"Executive":"Analyst"}</option>)}
            </select>
          </div>

          <div style={{marginBottom:22}}>
            <div style={{fontSize:10,color:S.textDim,textTransform:"uppercase",letterSpacing:1.2,marginBottom:6,fontFamily:S.fontUI}}>Password</div>
            <input type="password" value={pass} onChange={e=>{setPass(e.target.value);setErr("");}}
              onKeyDown={e=>e.key==="Enter"&&go()} placeholder="••••••••"
              style={{width:"100%",background:S.bg4,border:`1px solid ${err?S.red:S.border}`,borderRadius:5,padding:"9px 10px",color:S.text,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:S.fontMono,letterSpacing:2}}/>
            {err&&<div style={{fontSize:10,color:S.red,marginTop:5,fontFamily:S.fontUI,letterSpacing:0.3}}>{err}</div>}
          </div>

          <button onClick={go} disabled={loading}
            style={{width:"100%",background:loading?S.bg4:S.cyan,border:`1px solid ${loading?S.border:S.cyan}`,borderRadius:5,padding:"10px",fontSize:12,fontWeight:600,color:loading?S.textDim:"#ffffff",cursor:loading?"not-allowed":"pointer",fontFamily:S.fontUI,letterSpacing:0.5,transition:"all 0.15s"}}>
            {loading ? "Authenticating…" : "Sign In →"}
          </button>

          <div style={{marginTop:20,padding:"12px 14px",background:S.bg4,borderRadius:5,border:`1px solid ${S.border2}`}}>
            <div style={{fontSize:9,color:S.textDim,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8,fontFamily:S.fontUI}}>Demo Credentials</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[["Analyst","analyst1 / team123","analyst"],["Executive","exec1 / board456","executive"]].map(([role,cred,type])=>(
                <div key={role} style={{padding:"8px 10px",background:S.bg,borderRadius:4,border:`1px solid ${S.border2}`}}>
                  <div style={{fontSize:9,color:type==="executive"?S.amber:S.cyan,textTransform:"uppercase",letterSpacing:1,marginBottom:3,fontFamily:S.fontUI}}>{role}</div>
                  <div style={{fontSize:10,color:S.textMuted,fontFamily:S.fontMono}}>{cred}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{textAlign:"center",marginTop:20,fontSize:10,color:S.textFaint,fontFamily:S.fontMono}}>
          CONFIDENTIAL · INTERNAL USE ONLY
        </div>
      </div>
    </div>
  );
}
