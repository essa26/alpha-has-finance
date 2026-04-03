import { useState } from "react";
import { C, FF, ROLES, LOCATIONS, getCur, getAmt, getTitle, fmtDate, curMonth } from "../constants";
import { Btn, Inp, Sel, Badge, BarChart } from "./Primitives";

export default function Reports({ requests, staff, currentUser }) {
const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]     = useState("");
  const [statusF, setStatusF]   = useState("All");
  const [typeF, setTypeF]       = useState("All");
  const [showPayroll, setShowPayroll] = useState(false);
  const canAll = currentUser.role !== ROLES.INITIATOR;

  const preset = (p) => {
    const now = new Date();
    const pad = n => String(n).padStart(2, "0");
    const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    if (p === "month")   { setDateFrom(fmt(new Date(now.getFullYear(), now.getMonth(), 1))); setDateTo(fmt(now)); }
    else if (p === "quarter") { setDateFrom(fmt(new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1))); setDateTo(fmt(now)); }
    else if (p === "year") { setDateFrom(`${now.getFullYear()}-01-01`); setDateTo(fmt(now)); }
    else { setDateFrom(""); setDateTo(""); }
  };

  const filtered = requests
    .filter(r => canAll || r.initiatorId === currentUser.id)
    .filter(r => statusF === "All" || r.status === statusF)
    .filter(r => typeF   === "All" || r.type   === typeF)
    .filter(r => !dateFrom || r.createdAt >= dateFrom)
    .filter(r => !dateTo   || r.createdAt <= dateTo);

  const byCurrency = {};
  filtered.forEach(r => { const cur = getCur(r); byCurrency[cur] = (byCurrency[cur] || 0) + getAmt(r); });
  const ALL_TYPES = ["Construction","Renovation","Purchase","Maintenance & Repairs","Utilities","Groceries & Provisions","Cleaning Services","Security Services","Landscaping","Travel & Accommodation","Dining & Entertainment","Health & Medical","Legal Fees","Consultancy Fees","Vehicle & Transport","IT & Technology","Subscriptions","Gifts & Donations","Education","Insurance","Salary"];

  const byType = ALL_TYPES.map(t => ({
    type: t,
    count: filtered.filter(r => r.type === t).length,
    amt:   filtered.filter(r => r.type === t && getCur(r) === "AED").reduce((s, r) => s + getAmt(r), 0),
  })).filter(x => x.count > 0 || x.amt > 0);
  const byStatus = Object.fromEntries(["Pending","Approved","Processed","Cancelled","Rejected"].map(s => [s, filtered.filter(r => r.status === s).length]));
  const byLoc = LOCATIONS.map(l => ({ loc:l, amt:filtered.filter(r => r.location === l && getCur(r) === "AED").reduce((s, r) => s + getAmt(r), 0) })).filter(x => x.amt > 0);

  const exportReqCSV = () => {
    const rows = [["ID","Title","Type","Amount","Currency","AED Equiv.","FX Rate","Status","Initiator","Location","Date","Source","Processed"],
      ...filtered.map(r => [r.id, getTitle(r), r.type, getAmt(r), getCur(r), r.aedEquivalent || (getCur(r) === "AED" ? getAmt(r) : ""), r.fxRate || "", r.status, r.initiatorName, r.location || "", r.createdAt || "", r.sourceAccount || "", r.processedDate || ""])];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type:"text/csv" })); a.download = `requests_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  };

  const exportPayCSV = () => {
    const m = curMonth();
    const all = staff.filter(s => s.active !== false);
    const rows = [["Name","Type","Base","Housing","Transport","Other","Bonus","Deductions","Net"],
      ...all.map(s => { const d = s.deductions.filter(x => x.month === m).reduce((a, x) => a + x.amount, 0); const n = s.baseSalary + s.housingAllowance + s.transportAllowance + s.otherAllowance + s.bonus - d; return [s.name, s.staffType, s.baseSalary, s.housingAllowance, s.transportAllowance, s.otherAllowance, s.bonus, d, n]; })];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type:"text/csv" })); a.download = `payroll_${m}.csv`; a.click();
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, flexWrap:"wrap", gap:10 }}>
        <h2 style={{ margin:0, fontSize:18, fontWeight:600, color:C.g800, fontFamily:FF }}>Reports and Analytics</h2>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <Btn onClick={() => setShowPayroll(!showPayroll)} style={{ fontSize:12, padding:"6px 12px" }}>{showPayroll ? "Hide Payroll" : "Show Payroll Data"}</Btn>
          <Btn onClick={exportPayCSV} style={{ fontSize:12, padding:"6px 12px" }}>Export Payroll CSV</Btn>
          <Btn variant="success" onClick={exportReqCSV}>Export Requests CSV ({filtered.length})</Btn>
        </div>
      </div>

      <div style={{ background:"#fff", border:`1px solid ${C.g200}`, borderRadius:12, padding:"14px 16px", marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <span style={{ fontSize:13, fontWeight:600, color:C.g600, fontFamily:FF }}>Filter Data</span>
          <div style={{ display:"flex", gap:6 }}>
            {[["month","This Month"], ["quarter","This Quarter"], ["year","This Year"], ["all","All Time"]].map(([k, l]) => (
              <button key={k} onClick={() => preset(k)} style={{ background:C.g100, color:C.g600, border:"none", borderRadius:6, padding:"4px 10px", fontSize:12, cursor:"pointer", fontFamily:FF }}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:12 }}>
          <Inp label="Date From" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <Inp label="Date To"   type="date" value={dateTo}   onChange={e => setDateTo(e.target.value)} />
          <Sel label="Status" value={statusF} onChange={e => setStatusF(e.target.value)} options={["All","Pending","Approved","Processed","Cancelled","Rejected"]} />
          <Sel label="Type" value={typeF} onChange={e => setTypeF(e.target.value)} options={["All", ...ALL_TYPES]} />
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {[{ l:"Total Requests", v:filtered.length, c:C.accent }, { l:"Processed", v:byStatus.Processed || 0, c:C.success }, { l:"Pending", v:byStatus.Pending || 0, c:C.warning }, { l:"Rejected", v:byStatus.Rejected || 0, c:C.danger }].map(x => (
          <div key={x.l} style={{ background:"#fff", border:`1px solid ${C.g200}`, borderRadius:12, padding:"12px 16px" }}>
            <div style={{ fontSize:11, color:C.g400, marginBottom:3, fontFamily:FF }}>{x.l}</div>
            <div style={{ fontSize:20, fontWeight:700, color:x.c, fontFamily:FF }}>{x.v}</div>
          </div>
        ))}
      </div>

      <div style={{ background:"#fff", border:`1px solid ${C.g200}`, borderRadius:12, padding:"14px 16px", marginBottom:20 }}>
        <div style={{ fontSize:13, fontWeight:600, color:C.g700, marginBottom:6, fontFamily:FF }}>Spend by Currency (original amounts)</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
          {Object.entries(byCurrency).length === 0
            ? <span style={{ color:C.g400, fontSize:13, fontFamily:FF }}>No data</span>
            : Object.entries(byCurrency).map(([cur, amt]) => (
              <div key={cur} style={{ background:C.g50, borderRadius:8, padding:"10px 16px", minWidth:110 }}>
                <div style={{ fontSize:11, color:C.g500, fontFamily:FF }}>{cur}</div>
                <div style={{ fontWeight:700, fontSize:18, color:C.g800, fontFamily:FF }}>{amt.toLocaleString()}</div>
              </div>
            ))}
        </div>
      </div>

      <div style={{ background:"#fff", border:`1px solid ${C.g200}`, borderRadius:12, padding:"16px 18px", marginBottom:20 }}>
        <div style={{ fontSize:13, fontWeight:600, color:C.g700, marginBottom:12, fontFamily:FF }}>Spend by Type — AED equivalent (incl. FX converted amounts)</div>
        <BarChart data={byType} />
      </div>

      {byLoc.length > 0 && (
        <div style={{ background:"#fff", border:`1px solid ${C.g200}`, borderRadius:12, padding:"14px 16px", marginBottom:20 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.g700, marginBottom:10, fontFamily:FF }}>Spend by Location (AED)</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
            {byLoc.map(x => (
              <div key={x.loc} style={{ background:C.g50, borderRadius:8, padding:"10px 14px", minWidth:110 }}>
                <div style={{ fontSize:12, color:C.g500, fontFamily:FF }}>{x.loc}</div>
                <div style={{ fontWeight:700, fontSize:16, color:C.g800, fontFamily:FF }}>{x.amt.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showPayroll && (
        <div style={{ background:"#fff", border:`1px solid ${C.g200}`, borderRadius:12, padding:"14px 16px", marginBottom:20 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.g700, marginBottom:10, fontFamily:FF }}>Payroll Snapshot — {curMonth()}</div>
          {["home","corporate"].map(type => {
            const s = staff.filter(x => x.staffType === type && x.active !== false);
            const m = curMonth();
            const gross = s.reduce((a, e) => a + e.baseSalary + e.housingAllowance + e.transportAllowance + e.otherAllowance + e.bonus, 0);
            const deds  = s.reduce((a, e) => a + e.deductions.filter(d => d.month === m).reduce((x, d) => x + d.amount, 0), 0);
            return (
              <div key={type} style={{ display:"flex", alignItems:"center", gap:16, padding:"10px 0", borderBottom:`1px solid ${C.g100}`, fontSize:14, fontFamily:FF }}>
                <span style={{ fontWeight:500, color:C.g800, minWidth:140, textTransform:"capitalize" }}>{type} Staff ({s.length})</span>
                <span style={{ color:C.g600 }}>Gross: <strong>{gross.toLocaleString()} AED</strong></span>
                <span style={{ color:C.danger }}>Deductions: <strong>-{deds.toLocaleString()} AED</strong></span>
                <span style={{ color:C.success }}>Net: <strong>{(gross - deds).toLocaleString()} AED</strong></span>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ overflowX:"auto", borderRadius:12, border:`1px solid ${C.g200}` }}>
        <table style={{ width:"100%", borderCollapse:"collapse", minWidth:900 }}>
          <thead>
            <tr style={{ background:C.g50 }}>
              {["Title","Type","Amount","Currency","AED Equiv.","FX Rate","Status","Initiator","Location","Date","Source"].map(h => (
                <th key={h} style={{ padding:"9px 12px", fontSize:11, fontWeight:600, color:C.g600, textAlign:"left", borderBottom:`1px solid ${C.g200}`, whiteSpace:"nowrap", fontFamily:FF }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={9} style={{ padding:32, textAlign:"center", color:C.g400, fontFamily:FF }}>No records match the filters.</td></tr>
              : filtered.map((r, i) => (
                <tr key={r.id} style={{ borderBottom:`1px solid ${C.g100}`, background:i % 2 ? "#fff" : C.g50 }}>
                  <td style={{ padding:"9px 12px", fontSize:13, fontWeight:500, color:C.g800, fontFamily:FF }}>{getTitle(r)}</td>
                  <td style={{ padding:"9px 12px", fontSize:12, color:C.g600, fontFamily:FF }}>{r.type}</td>
                  <td style={{ padding:"9px 12px", fontSize:13, fontWeight:500, fontFamily:FF }}>{getAmt(r).toLocaleString()}</td>
                  <td style={{ padding:"9px 12px", fontSize:12, color:C.g500, fontFamily:FF }}>{getCur(r)}</td>
                  <td style={{ padding:"9px 12px", fontSize:13, fontFamily:FF }}>
                    {getCur(r) === "AED"
                      ? <span style={{ color:C.g400 }}>—</span>
                      : r.aedEquivalent
                        ? <span style={{ color:C.success, fontWeight:500 }}>{r.aedEquivalent.toLocaleString()}</span>
                        : <span style={{ color:C.warning, fontSize:11 }}>Pending FX</span>}
                  </td>
                  <td style={{ padding:"9px 12px", fontSize:12, color:C.g500, fontFamily:FF }}>
                    {r.fxRate && getCur(r) !== "AED" ? r.fxRate : "—"}
                  </td>
                  <td style={{ padding:"9px 12px" }}><Badge status={r.status} /></td>
                  <td style={{ padding:"9px 12px", fontSize:13, color:C.g600, fontFamily:FF }}>{r.initiatorName}</td>
                  <td style={{ padding:"9px 12px", fontSize:12, color:C.g600, fontFamily:FF }}>{r.location || "--"}</td>
                  <td style={{ padding:"9px 12px", fontSize:12, color:C.g500, fontFamily:FF }}>{fmtDate(r.createdAt)}</td>
                  <td style={{ padding:"9px 12px", fontSize:12, color:C.g600, fontFamily:FF }}>{r.sourceAccount || "--"}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}