import { useState } from "react";
import { C, FF, AUDIT_ACTIONS } from "../constants";
import { Btn, IBox } from "./Primitives";

export default function AuditLog({ logs }) {
const [search, setSearch]   = useState("");
  const [actionF, setActionF] = useState("All");
  const filtered = logs
    .filter(l => actionF === "All" || l.action === actionF)
    .filter(l => l.actor.toLowerCase().includes(search.toLowerCase()) || l.details.toLowerCase().includes(search.toLowerCase()));

  const aColors = { CREATE_REQUEST:C.accent, UPDATE_REQUEST:C.warning, DELETE_REQUEST:C.danger, APPROVE_REQUEST:C.success, REJECT_REQUEST:C.danger, PROCESS_REQUEST:C.success, CANCEL_REQUEST:C.g500, UPDATE_USER_ROLE:C.purple, DELETE_USER:C.danger, INVITE_USER:C.accent, APPROVE_NEW_STAFF:C.success, REJECT_NEW_STAFF:C.danger, UPDATE_STAFF:C.warning, APPROVE_PROFILE:C.success, REJECT_PROFILE:C.danger, REQUEST_PROFILE_CHANGE:C.g500, ADD_COMMENT:C.g400, LOCK_PAYROLL:C.warning };

  const exportCSV = () => {
    const rows = [["Timestamp","Action","Actor","Role","Details"], ...[...filtered].reverse().map(l => [l.timestamp, AUDIT_ACTIONS[l.action] || l.action, l.actor, l.actorRole, l.details])];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type:"text/csv" })); a.download = `audit_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <h2 style={{ margin:0, fontSize:18, fontWeight:600, color:C.g800, fontFamily:FF }}>Audit Log</h2>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <span style={{ fontSize:13, color:C.g400, fontFamily:FF }}>{logs.length} entries this session</span>
          {logs.length > 0 && <Btn variant="ghost" onClick={exportCSV} style={{ fontSize:12, padding:"5px 12px" }}>Export CSV</Btn>}
        </div>
      </div>
      <IBox color={C.warning} bg={C.warningL}>Session-scoped. In production with Firebase all entries are persisted and tamper-evident.</IBox>
      <div style={{ display:"flex", gap:10, marginBottom:16, alignItems:"center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search actor or details..." style={{ flex:1, padding:"7px 12px", border:`1px solid ${C.g300}`, borderRadius:8, fontSize:13, fontFamily:FF }} />
        <select value={actionF} onChange={e => setActionF(e.target.value)} style={{ padding:"7px 12px", border:`1px solid ${C.g300}`, borderRadius:8, fontSize:13, color:C.g800, background:"#fff", minWidth:180, fontFamily:FF }}>
          <option value="All">All Actions</option>
          {Object.entries(AUDIT_ACTIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      {filtered.length === 0
        ? <div style={{ textAlign:"center", padding:40, color:C.g400, background:C.g50, borderRadius:12, fontFamily:FF }}>No entries found.</div>
        : (
          <div style={{ border:`1px solid ${C.g200}`, borderRadius:12, overflow:"hidden" }}>
            {[...filtered].reverse().map((l, i) => (
              <div key={l.id} style={{ display:"flex", alignItems:"flex-start", gap:14, padding:"12px 16px", background:i % 2 ? "#fff" : C.g50, borderBottom:i < filtered.length - 1 ? `1px solid ${C.g100}` : "none" }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:aColors[l.action] || C.g400, marginTop:5, flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                    <span style={{ fontWeight:600, fontSize:13, color:aColors[l.action] || C.g700, fontFamily:FF }}>{AUDIT_ACTIONS[l.action] || l.action}</span>
                    <span style={{ fontSize:12, color:C.g500, fontFamily:FF }}>by <strong>{l.actor}</strong> ({l.actorRole})</span>
                  </div>
                  {l.details && <div style={{ fontSize:12, color:C.g600, marginTop:2, fontFamily:FF }}>{l.details}</div>}
                </div>
                <div style={{ fontSize:11, color:C.g400, whiteSpace:"nowrap", flexShrink:0, fontFamily:FF }}>{new Date(l.timestamp).toLocaleString("en-GB", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" })}</div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}