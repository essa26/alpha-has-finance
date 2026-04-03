import { useRef } from "react";
import { C, FF, STATUS_META, ROLE_COLORS, PAY_METHODS, toB64 } from "../constants";

export function Badge({ status }) {  
    const c = STATUS_META[status] || STATUS_META.Pending;
  return (
    <span style={{ background:c.bg, color:c.text, border:`1px solid ${c.border}`, borderRadius:20, padding:"2px 10px", fontSize:12, fontWeight:500, whiteSpace:"nowrap", fontFamily:FF }}>
      {status}
    </span>
  );
}
export function RoleBadge({ role }) { 
  const col = ROLE_COLORS[role] || C.g500;
  return (
    <span style={{ background:col+"18", color:col, border:`1px solid ${col}30`, borderRadius:20, padding:"2px 10px", fontSize:12, fontWeight:500, fontFamily:FF }}>
      {role}
    </span>
  ); 
}
export function Av({ initials, size = 36, color = C.accent }) { 
    return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:color, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:600, fontSize:size*0.34, flexShrink:0, fontFamily:FF }}>
      {initials}
    </div>
  ); 
}
export function Modal({ title, onClose, children, width = 660 }) { 
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(61,0,64,0.55)", zIndex:1000, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"28px 16px", overflowY:"auto" }}>
      <div style={{ background:"#fff", borderRadius:14, width:"100%", maxWidth:width, boxShadow:"0 24px 64px rgba(61,0,64,0.22)", fontFamily:FF }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 22px", borderBottom:`1px solid ${C.g200}` }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:600, color:C.g800, fontFamily:FF }}>{title}</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:22, color:C.g400 }}>x</button>
        </div>
        <div style={{ padding:22 }}>{children}</div>
      </div>
    </div>
  ); 
}
export function Inp({ label, hint, ...p }) { 
    return (
    <div style={{ marginBottom:12 }}>
      {label && <label style={{ display:"block", fontSize:13, fontWeight:500, color:C.g700, marginBottom:4, fontFamily:FF }}>{label}</label>}
      <input {...p} style={{ width:"100%", padding:"8px 12px", border:`1px solid ${C.g300}`, borderRadius:8, fontSize:14, color:C.g800, boxSizing:"border-box", fontFamily:FF, ...(p.style || {}) }} />
      {hint && <div style={{ fontSize:11, color:C.g400, marginTop:3, fontFamily:FF }}>{hint}</div>}
    </div>
  ); 
}
export function Sel({ label, options, ...p }) { 
    return (
    <div style={{ marginBottom:12 }}>
      {label && <label style={{ display:"block", fontSize:13, fontWeight:500, color:C.g700, marginBottom:4, fontFamily:FF }}>{label}</label>}
      <select {...p} style={{ width:"100%", padding:"8px 12px", border:`1px solid ${C.g300}`, borderRadius:8, fontSize:14, color:C.g800, background:"#fff", boxSizing:"border-box", fontFamily:FF }}>
        {options.map(o => <option key={o.value != null ? o.value : o} value={o.value != null ? o.value : o}>{o.label != null ? o.label : o}</option>)}
      </select>
    </div>
  ); 
}
export function Txt({ label, ...p }) { 
    return (
    <div style={{ marginBottom:12 }}>
      {label && <label style={{ display:"block", fontSize:13, fontWeight:500, color:C.g700, marginBottom:4, fontFamily:FF }}>{label}</label>}
      <textarea {...p} style={{ width:"100%", padding:"8px 12px", border:`1px solid ${C.g300}`, borderRadius:8, fontSize:14, color:C.g800, resize:"vertical", minHeight:68, boxSizing:"border-box", fontFamily:FF }} />
    </div>
  ); 
}
export function G2({ children, cols = "1fr 1fr" }) {
    return <div style={{ display:"grid", gridTemplateColumns:cols, gap:12 }}>{children}</div>; 
}
export function Dvd({ label }) {
    return <div style={{ fontSize:11, fontWeight:600, color:C.g400, textTransform:"uppercase", letterSpacing:".07em", margin:"16px 0 10px", borderBottom:`1px solid ${C.g200}`, paddingBottom:6, fontFamily:FF }}>{label}</div>; 
}
export function IBox({ color = C.accent, bg, children }) {
    return <div style={{ background:bg || color + "12", border:`1px solid ${color}30`, borderRadius:8, padding:"8px 12px", fontSize:12, color, marginBottom:12, fontFamily:FF }}>{children}</div>; 
}
export function Btn({ children, variant = "default", onClick, style: s = {}, ...p }) {
  const vs = {
    default: { background:C.g100, color:C.g700, border:`1px solid ${C.g200}` },
    primary: { background:C.accent, color:"#fff", border:"none" },
    success: { background:C.success, color:"#fff", border:"none" },
    danger:  { background:C.dangerL, color:C.danger, border:`1px solid ${C.danger}30` },
    ghost:   { background:"transparent", color:C.accent, border:`1px solid ${C.accent}40` },
  };
  return (
    <button onClick={onClick} {...p} style={{ ...vs[variant], borderRadius:8, padding:"7px 14px", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:FF, ...s }}>
      {children}
    </button>
  );
}
export function Confirm({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(61,0,64,0.5)", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"#fff", borderRadius:12, padding:24, maxWidth:380, width:"100%", fontFamily:FF }}>
        <p style={{ fontSize:15, color:C.g800, marginBottom:20, lineHeight:1.5 }}>{message}</p>
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
          <Btn onClick={onCancel}>Cancel</Btn>
          <Btn variant="danger" onClick={onConfirm}>Confirm</Btn>
        </div>
      </div>
    </div>
  );
}
export function FileUpload({ label, files, onAdd, maxKB = 700 }) {
  const ref = useRef();
  const go = async (e) => {
    for (const f of Array.from(e.target.files || [])) {
      if (f.size > maxKB * 1024) { alert(`${f.name} exceeds ${maxKB}KB`); continue; }
      onAdd(await toB64(f));
    }
    e.target.value = "";
  };
  return (
    <div style={{ marginBottom:12 }}>
      {label && <label style={{ display:"block", fontSize:13, fontWeight:500, color:C.g700, marginBottom:4, fontFamily:FF }}>{label} <span style={{ fontSize:11, color:C.g400 }}>max {maxKB}KB</span></label>}
      <div style={{ border:`1px dashed ${C.g300}`, borderRadius:8, padding:"8px 12px", background:C.g50 }}>
        <input type="file" ref={ref} onChange={go} multiple accept=".pdf,.jpg,.jpeg,.png" style={{ display:"none" }} />
        <Btn onClick={() => ref.current.click()} style={{ fontSize:12, padding:"4px 12px" }}>+ Attach File</Btn>
        {files.map((f, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:6, marginTop:6, fontSize:12, color:C.g600, fontFamily:FF }}>
            <span style={{ color:C.accent }}>@</span>
            <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.name || f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
export function BarChart({ data }) {
  const W = 560, H = 200;
  const PAD = { top:20, right:20, bottom:44, left:64 };
  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;
  const maxAmt = Math.max(...data.map(d => d.amt), 1);
  const maxCnt = Math.max(...data.map(d => d.count), 1);
  const bw = Math.floor(iw / data.length) - 14;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", fontFamily:FF }}>
      {[0, 0.25, 0.5, 0.75, 1].map(f => {
        const y = PAD.top + ih * (1 - f);
        return (
          <g key={f}>
            <line x1={PAD.left} x2={PAD.left + iw} y1={y} y2={y} stroke="#e4d4e8" strokeWidth="1" />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#9e78a8">{Math.round(maxAmt * f / 1000)}k</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const x = PAD.left + i * (iw / data.length) + 7;
        const cx = x + bw / 2;
        const ah = d.amt > 0 ? Math.max(2, Math.round((d.amt / maxAmt) * ih)) : 0;
        const ch = d.count > 0 ? Math.max(2, Math.round((d.count / maxCnt) * ih * 0.4)) : 0;
        return (
          <g key={d.type}>
            <rect x={x} y={PAD.top + ih - ah} width={bw} height={ah} fill="rgba(107,0,117,0.75)" rx="3" />
            <rect x={x + bw * 0.25} y={PAD.top + ih - ch} width={bw * 0.5} height={ch} fill="rgba(107,0,117,0.25)" rx="2" />
            <text x={cx} y={H - PAD.bottom + 14} textAnchor="middle" fontSize="10" fill="#7a5a84">
              {d.type.length > 8 ? d.type.slice(0, 7) + "…" : d.type}
            </text>
            {d.count > 0 && <text x={cx} y={PAD.top + ih - ah - 4} textAnchor="middle" fontSize="9" fill="#6b0075">{d.count}</text>}
          </g>
        );
      })}
      <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={PAD.top + ih} stroke="#c9a8d0" strokeWidth="1" />
      <line x1={PAD.left} x2={PAD.left + iw} y1={PAD.top + ih} y2={PAD.top + ih} stroke="#c9a8d0" strokeWidth="1" />
      <rect x={PAD.left} y={4} width={10} height={8} fill="rgba(107,0,117,0.75)" rx="1" />
      <text x={PAD.left + 14} y={11} fontSize="10" fill="#7a5a84">AED Amount</text>
      <rect x={PAD.left + 90} y={4} width={10} height={8} fill="rgba(107,0,117,0.25)" rx="1" />
      <text x={PAD.left + 104} y={11} fontSize="10" fill="#7a5a84">Count</text>
    </svg>
  );
}
export function EmpFields({ f, set, restrictToHome = false }) {
  return (
    <>
      <Dvd label="Employee Details" />
      <G2>
        <Inp label="Full Name *" value={f.newName} onChange={e => set("newName", e.target.value)} />
        <Inp label="Designation *" value={f.newDesignation} onChange={e => set("newDesignation", e.target.value)} />
        <Inp label="Bank IBAN" value={f.newIban} onChange={e => set("newIban", e.target.value)} placeholder="AE070331234567890123456" />
        <Inp label="Joining Date *" type="date" value={f.newJoiningDate} onChange={e => set("newJoiningDate", e.target.value)} />
        <Sel label="Payment Method" value={f.newPayMethod} onChange={e => set("newPayMethod", e.target.value)} options={PAY_METHODS} />
        {restrictToHome
          ? <div style={{ marginBottom:12 }}><label style={{ display:"block", fontSize:13, fontWeight:500, color:C.g700, marginBottom:4, fontFamily:FF }}>Staff Type</label><div style={{ padding:"8px 12px", border:`1px solid ${C.g300}`, borderRadius:8, fontSize:14, color:C.g500, background:C.g50, fontFamily:FF }}>Home Staff (fixed)</div></div>
          : <Sel label="Staff Type" value={f.newStaffType || "home"} onChange={e => set("newStaffType", e.target.value)} options={[{ value:"home", label:"Home Staff" }, { value:"corporate", label:"Corporate Staff" }]} />
        }
      </G2>
      <Dvd label="Salary and Allowances (AED)" />
      <G2>
        <Inp label="Base Salary *" type="number" value={f.newBaseSalary} onChange={e => set("newBaseSalary", e.target.value)} />
        <Inp label="Housing Allowance" type="number" value={f.newHousing} onChange={e => set("newHousing", e.target.value)} />
        <Inp label="Transport Allowance" type="number" value={f.newTransport} onChange={e => set("newTransport", e.target.value)} />
        <Inp label="Other Allowance" type="number" value={f.newOther} onChange={e => set("newOther", e.target.value)} />
        <Inp label="Bonus" type="number" value={f.newBonus} onChange={e => set("newBonus", e.target.value)} />
      </G2>
    </>
  );
}