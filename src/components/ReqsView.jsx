import { useState } from "react";
import { C, FF, ROLES, getAmt, getTitle } from "../constants";
import { Btn } from "./Primitives";
import ReqCard from "./RequestCard";


export default function ReqsView({ requests, onUpdate, onDelete, onNew, onBulkApprove, currentUser, staff, addAudit, onNotify }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [amtMin, setAmtMin] = useState("");
  const [amtMax, setAmtMax] = useState("");
  const [dateF, setDateF] = useState("");
  const [selected, setSelected] = useState(new Set());
  const canAll = currentUser.role !== ROLES.INITIATOR;
  const isSuper = currentUser.role === ROLES.SUPER;

  const visible = requests
    .filter(r => canAll || r.initiatorId === currentUser.id)
    .filter(r => filter === "All" || r.status === filter)
    .filter(r => getTitle(r).toLowerCase().includes(search.toLowerCase()))
    .filter(r => !amtMin || getAmt(r) >= Number(amtMin))
    .filter(r => !amtMax || getAmt(r) <= Number(amtMax))
    .filter(r => !dateF  || r.createdAt >= dateF);

  const cnt = s => requests.filter(r => (canAll || r.initiatorId === currentUser.id) && r.status === s).length;
  const pendingVis = visible.filter(r => r.status === "Pending");
  const allSelPending = pendingVis.length > 0 && pendingVis.every(r => selected.has(r.id));

  const toggleSel = id => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelected(s => { const n = new Set(s); allSelPending ? pendingVis.forEach(r => n.delete(r.id)) : pendingVis.forEach(r => n.add(r.id)); return n; });

  const bulkApprove = () => {
    const ids = [...selected].filter(id => requests.find(r => r.id === id && r.status === "Pending"));
    if (!ids.length) return alert("No pending requests selected.");
    if (!window.confirm(`Approve ${ids.length} request(s)?`)) return;
    onBulkApprove(ids);
    setSelected(new Set());
  };

  const FILTERS = [
    { key:"All", label:"All" },
    { key:"Pending", label:"Pending Approval" },
    { key:"Pending Approval", label:"New Employee Review" },
    { key:"Approved", label:"Approved" },
    { key:"Processed", label:"Processed" },
    { key:"Rejected", label:"Rejected" },
    { key:"Cancelled", label:"Cancelled" },
  ];

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, flexWrap:"wrap", gap:10 }}>
        <h2 style={{ margin:0, fontSize:18, fontWeight:600, color:C.g800, fontFamily:FF }}>
          {currentUser.role === ROLES.ACCOUNTANT ? "Processing Queue" : currentUser.role === ROLES.INITIATOR ? "My Requests" : "All Payment Requests"}
        </h2>
        <div style={{ display:"flex", gap:8 }}>
          {isSuper && selected.size > 0 && <Btn variant="success" onClick={bulkApprove}>Approve Selected ({selected.size})</Btn>}
          {currentUser.role !== ROLES.PENDING && <Btn variant="primary" onClick={onNew}>+ New Request</Btn>}
        </div>
      </div>

      <div style={{ background:"#fff", border:`1px solid ${C.g200}`, borderRadius:10, padding:"12px 14px", marginBottom:14, display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title..." style={{ flex:2, minWidth:140, padding:"7px 10px", border:`1px solid ${C.g300}`, borderRadius:8, fontSize:13, fontFamily:FF }} />
        <input type="number" value={amtMin} onChange={e => setAmtMin(e.target.value)} placeholder="Min amount" style={{ flex:1, minWidth:90, padding:"7px 10px", border:`1px solid ${C.g300}`, borderRadius:8, fontSize:13, fontFamily:FF }} />
        <input type="number" value={amtMax} onChange={e => setAmtMax(e.target.value)} placeholder="Max amount" style={{ flex:1, minWidth:90, padding:"7px 10px", border:`1px solid ${C.g300}`, borderRadius:8, fontSize:13, fontFamily:FF }} />
        <input type="date" value={dateF} onChange={e => setDateF(e.target.value)} style={{ flex:1, minWidth:120, padding:"7px 10px", border:`1px solid ${C.g300}`, borderRadius:8, fontSize:13, fontFamily:FF }} />
        {(search || amtMin || amtMax || dateF) && <Btn onClick={() => { setSearch(""); setAmtMin(""); setAmtMax(""); setDateF(""); }} style={{ padding:"7px 12px", fontSize:12 }}>Clear</Btn>}
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
        {FILTERS.map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)} style={{ background:filter === key ? C.accent : C.g100, color:filter === key ? "#fff" : C.g600, border:"none", borderRadius:20, padding:"5px 12px", fontSize:12, cursor:"pointer", fontWeight:filter === key ? 600 : 400, fontFamily:FF }}>
            {label}{key !== "All" && ` (${cnt(key)})`}
          </button>
        ))}
      </div>

      {isSuper && filter === "Pending" && pendingVis.length > 0 && (
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:C.accentL, borderRadius:8, marginBottom:10, fontSize:13, fontFamily:FF }}>
          <input type="checkbox" checked={allSelPending} onChange={toggleAll} />
          <span style={{ color:C.accent, fontWeight:500 }}>Select all {pendingVis.length} pending for bulk approval</span>
        </div>
      )}

      {visible.length === 0
        ? <div style={{ textAlign:"center", padding:48, color:C.g400, background:C.g50, borderRadius:12, fontFamily:FF }}>No requests found.</div>
        : visible.map(r => (
          <div key={r.id} style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
            {isSuper && r.status === "Pending" && (
              <div style={{ paddingTop:16 }}>
                <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSel(r.id)} />
              </div>
            )}
            <div style={{ flex:1 }}>
              <ReqCard req={r} currentUser={currentUser} onUpdate={onUpdate} onDelete={onDelete} staff={staff} addAudit={addAudit} onNotify={onNotify} />
            </div>
          </div>
        ))
      }
    </div>
  );
}