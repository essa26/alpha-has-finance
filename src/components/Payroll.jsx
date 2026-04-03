import { useState } from "react";
import { C, FF, ROLES, AUDIT_ACTIONS, PAY_METHODS, calcLeave, tenure, fmtDate, fmtAmt, curMonth } from "../constants";
import { Btn, Av, IBox, Modal, Inp, Sel, Dvd, G2 } from "./Primitives";

export function StaffEditModal({ s, idx, onSave, onClose, month }) {
const [f, setF] = useState({ ...s });
  const set = (k, v) => setF(p => ({ ...p, [k]:v }));
  const [dd, setDd] = useState({ desc:"", amount:"" });
  const mDeds = f.deductions.filter(d => d.month === month);
  const gross = f.baseSalary + f.housingAllowance + f.transportAllowance + f.otherAllowance + f.bonus;
  const totalDed = mDeds.reduce((a, d) => a + d.amount, 0);

  return (
    <Modal title={`Edit - ${s.name}`} onClose={onClose} width={700}>
      <Dvd label="Employee Info" />
      <G2>
        <Inp label="Full Name" value={f.name} onChange={e => set("name", e.target.value)} />
        <Inp label="Designation" value={f.designation} onChange={e => set("designation", e.target.value)} />
        <Inp label="Bank IBAN" value={f.iban} onChange={e => set("iban", e.target.value)} />
        <Inp label="Joining Date" type="date" value={f.joiningDate} onChange={e => set("joiningDate", e.target.value)} />
        <Sel label="Payment Method" value={f.paymentMethod} onChange={e => set("paymentMethod", e.target.value)} options={PAY_METHODS} />
        <Sel label="Staff Type" value={f.staffType || "home"} onChange={e => set("staffType", e.target.value)} options={[{ value:"home", label:"Home Staff" }, { value:"corporate", label:"Corporate Staff" }]} />
      </G2>
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:C.g50, borderRadius:8, marginBottom:12 }}>
        <input type="checkbox" id="sa" checked={f.active !== false} onChange={e => set("active", e.target.checked)} />
        <label htmlFor="sa" style={{ fontSize:14, cursor:"pointer", fontWeight:500, fontFamily:FF }}>Employee Active</label>
        {f.active === false && <span style={{ marginLeft:"auto", background:C.dangerL, color:C.danger, borderRadius:20, padding:"2px 10px", fontSize:12, fontFamily:FF }}>Inactive</span>}
      </div>
      <Dvd label="Salary and Allowances (AED)" />
      <G2>
        <Inp label="Base Salary" type="number" value={f.baseSalary} onChange={e => set("baseSalary", Number(e.target.value))} />
        <Inp label="Housing Allowance" type="number" value={f.housingAllowance} onChange={e => set("housingAllowance", Number(e.target.value))} />
        <Inp label="Transport Allowance" type="number" value={f.transportAllowance} onChange={e => set("transportAllowance", Number(e.target.value))} />
        <Inp label="Other Allowance" type="number" value={f.otherAllowance} onChange={e => set("otherAllowance", Number(e.target.value))} />
        <Inp label="Bonus" type="number" value={f.bonus} onChange={e => set("bonus", Number(e.target.value))} />
      </G2>
      <Dvd label={`This Month Deductions (${month})`} />
      {mDeds.map((d, j) => (
        <div key={j} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, fontSize:13, fontFamily:FF }}>
          <span style={{ flex:1, color:C.danger }}>-{d.amount.toLocaleString()} - {d.desc}</span>
          <button onClick={() => set("deductions", f.deductions.filter(x => x !== d))} style={{ background:"none", border:"none", color:C.g400, cursor:"pointer", fontSize:16 }}>x</button>
        </div>
      ))}
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        <input placeholder="Description" value={dd.desc} onChange={e => setDd(p => ({ ...p, desc:e.target.value }))} style={{ flex:2, padding:"6px 10px", border:`1px solid ${C.g300}`, borderRadius:6, fontSize:13, fontFamily:FF }} />
        <input placeholder="Amount" type="number" value={dd.amount} onChange={e => setDd(p => ({ ...p, amount:e.target.value }))} style={{ flex:1, padding:"6px 10px", border:`1px solid ${C.g300}`, borderRadius:6, fontSize:13, fontFamily:FF }} />
        <Btn variant="danger" onClick={() => { if (!dd.desc || !dd.amount) return; set("deductions", [...f.deductions, { desc:dd.desc, amount:Number(dd.amount), month }]); setDd({ desc:"", amount:"" }); }}>+ Add</Btn>
      </div>
      <IBox color={C.success} bg={C.successL}>
        Gross: <strong>{gross.toLocaleString()} AED</strong> — Deductions: <strong style={{ color:C.danger }}>-{totalDed.toLocaleString()} AED</strong> — Net: <strong style={{ color:C.success }}>{(gross - totalDed).toLocaleString()} AED</strong>
      </IBox>
      <div style={{ display:"flex", gap:10 }}>
        <Btn variant="primary" onClick={() => onSave(idx, f)} style={{ flex:1, padding:"10px 0", fontWeight:600 }}>Save Changes</Btn>
        <Btn onClick={onClose} style={{ padding:"10px 20px" }}>Cancel</Btn>
      </div>
    </Modal>
  );
}

export default function Payroll({ staff, onUpdateStaff, currentUser, pendingNewStaff, onApproveNewStaff, onRejectNewStaff, addAudit, onAddEmployee }) {
  // paste the full Payroll function body from the artifactconst isSuper = currentUser.role === ROLES.SUPER;
  const isAcct  = currentUser.role === ROLES.ACCOUNTANT;
  const [editIdx, setEditIdx]   = useState(null);
  const [staffTab, setStaffTab] = useState("home");
  const [justAdded, setJustAdded] = useState(null);
  const [lockedMonths, setLockedMonths] = useState({});
  const month = curMonth();
  const isLocked = lockedMonths[`${staffTab}_${month}`];

  const mDeds = s => s.deductions.filter(d => d.month === month);
  const canSeeCorp = isSuper || isAcct;
  const canSeeHome = isSuper || isAcct || currentUser.role === ROLES.HOUSE_MANAGER;

  const vis = staff.filter(s => s.staffType === "home" ? canSeeHome : canSeeCorp);
  const tabStaff   = vis.filter(s => s.staffType === staffTab && s.active !== false);
  const inactiveS  = vis.filter(s => s.staffType === staffTab && s.active === false);
  const availTabs  = canSeeCorp ? ["home", "corporate"] : ["home"];

  const totalGross = tabStaff.reduce((s, e) => s + e.baseSalary + e.housingAllowance + e.transportAllowance + e.otherAllowance + e.bonus, 0);
  const totalDeds  = tabStaff.reduce((s, e) => s + mDeds(e).reduce((a, d) => a + d.amount, 0), 0);

  const saveStaff = (idx, form) => { const u = [...staff]; u[idx] = form; onUpdateStaff(u); addAudit(AUDIT_ACTIONS.UPDATE_STAFF, `Updated ${form.name}`); setEditIdx(null); };

  const handleApprove = req => {
    onApproveNewStaff(req);
    setJustAdded(req.newName);
    setStaffTab(req.newStaffType || "home");
    setTimeout(() => setJustAdded(null), 4000);
  };

  const toggleLock = () => {
    const key = `${staffTab}_${month}`;
    if (!isLocked && !window.confirm(`Lock ${staffTab} payroll for ${month}?`)) return;
    setLockedMonths(l => ({ ...l, [key]:!l[key] }));
    if (!isLocked) addAudit(AUDIT_ACTIONS.LOCK_PAYROLL, `Locked ${staffTab} payroll for ${month}`);
  };

  const exportCSV = () => {
    const rows = [
      ["Name","Designation","IBAN","Joining Date","Staff Type","Base Salary","Housing","Transport","Other","Bonus","Deductions","Net","Payment Method"],
      ...tabStaff.map(s => {
        const d = mDeds(s).reduce((a, x) => a + x.amount, 0);
        const n = s.baseSalary + s.housingAllowance + s.transportAllowance + s.otherAllowance + s.bonus - d;
        return [s.name, s.designation, s.iban || "", s.joiningDate, s.staffType, s.baseSalary, s.housingAllowance, s.transportAllowance, s.otherAllowance, s.bonus, d, n, s.paymentMethod];
      }),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type:"text/csv" })); a.download = `payroll_${staffTab}_${month}.csv`; a.click();
  };

  const TH = ({ c, r }) => <th style={{ padding:"9px 12px", fontSize:11, fontWeight:600, color:C.g600, textAlign:r ? "right" : "left", borderBottom:`1px solid ${C.g200}`, whiteSpace:"nowrap", background:C.g50, fontFamily:FF }}>{c}</th>;
  const TD = ({ children, right, bold, color }) => <td style={{ padding:"9px 12px", fontSize:13, textAlign:right ? "right" : "left", fontWeight:bold ? 600 : 400, color:color || C.g800, verticalAlign:"top", fontFamily:FF }}>{children}</td>;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, flexWrap:"wrap", gap:10 }}>
        <h2 style={{ margin:0, fontSize:18, fontWeight:600, color:C.g800, fontFamily:FF }}>Monthly Payroll — {new Date().toLocaleDateString("en-GB", { month:"long", year:"numeric" })}</h2>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
           <Btn onClick={exportCSV} style={{ fontSize:12, padding:"6px 12px" }}>Export CSV</Btn>
           <Btn variant={isLocked ? "danger" : "default"} onClick={toggleLock} style={{ fontSize:12, padding:"6px 12px" }}>{isLocked ? "Unlock Month" : "Lock Month"}</Btn>
           <Btn variant="primary" onClick={onAddEmployee}>+ Add Employee</Btn>
        </div>
      </div>

      {isLocked && <IBox color={C.warning} bg={C.warningL}>Payroll for {month} is locked. Unlock to make changes.</IBox>}
      {justAdded && <div style={{ background:C.successL, border:`1px solid ${C.success}40`, borderRadius:10, padding:"10px 16px", marginBottom:16, fontSize:13, color:C.success, fontFamily:FF }}><strong>Done!</strong> {justAdded} has been added to {staffTab} payroll.</div>}

      <div style={{ display:"flex", gap:0, marginBottom:20, borderBottom:`1px solid ${C.g200}` }}>
        {availTabs.map(t => (
          <button key={t} onClick={() => setStaffTab(t)} style={{ background:"none", border:"none", borderBottom:`2px solid ${staffTab === t ? C.accent : "transparent"}`, padding:"8px 20px", fontSize:14, fontWeight:staffTab === t ? 600 : 400, color:staffTab === t ? C.accent : C.g500, cursor:"pointer", marginBottom:-1, display:"flex", alignItems:"center", gap:8, fontFamily:FF }}>
            {t === "home" ? "Home Staff" : "Corporate Staff"}
            <span style={{ background:staffTab === t ? C.accentL : C.g100, color:staffTab === t ? C.accent : C.g500, borderRadius:20, padding:"1px 8px", fontSize:12 }}>
              {vis.filter(s => s.staffType === t && s.active !== false).length}
            </span>
          </button>
        ))}
        {!canSeeCorp && <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", fontSize:12, color:C.g400, fontFamily:FF }}>Corporate restricted to Accountants and Super Users</div>}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {[
          { l:`${staffTab === "home" ? "Home" : "Corporate"} Active Staff`, v:tabStaff.length, c:C.accent },
          { l:"Total Gross", v:totalGross.toLocaleString() + " AED", c:C.warning },
          { l:"This Month Deductions", v:"-" + totalDeds.toLocaleString() + " AED", c:C.danger },
          { l:"Net Payout", v:(totalGross - totalDeds).toLocaleString() + " AED", c:C.success },
        ].map(x => (
          <div key={x.l} style={{ background:"#fff", border:`1px solid ${C.g200}`, borderRadius:12, padding:"12px 16px" }}>
            <div style={{ fontSize:11, color:C.g400, marginBottom:3, fontFamily:FF }}>{x.l}</div>
            <div style={{ fontSize:18, fontWeight:700, color:x.c, fontFamily:FF }}>{x.v}</div>
          </div>
        ))}
      </div>

      {pendingNewStaff.length > 0 && isSuper && (
        <div style={{ marginBottom:20 }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:C.purple, marginBottom:10, fontFamily:FF }}>Pending New Employee Approvals</h3>
          {pendingNewStaff.map(req => (
            <div key={req.id} style={{ background:C.purpleL, border:`1px solid ${C.purple}30`, borderRadius:10, padding:"12px 16px", marginBottom:8, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:14, fontFamily:FF }}>{req.newName}</div>
                <div style={{ fontSize:12, color:C.g600, fontFamily:FF }}>{req.newDesignation} — {fmtAmt(req.newBaseSalary)} base — {req.newStaffType || "home"} staff — by {req.initiatorName}</div>
              </div>
              <Btn variant="success" onClick={() => handleApprove(req)}>Approve and Add</Btn>
              <Btn variant="danger" onClick={() => onRejectNewStaff(req.id)}>Reject</Btn>
            </div>
          ))}
        </div>
      )}

      {!isSuper && <IBox color={C.warning} bg={C.warningL}>Payroll editing is restricted to Super Users only.</IBox>}
      {editIdx !== null && <StaffEditModal s={staff[editIdx]} idx={editIdx} onSave={saveStaff} onClose={() => setEditIdx(null)} month={month} />}

      <div style={{ overflowX:"auto", borderRadius:12, border:`1px solid ${C.g200}` }}>
        <table style={{ width:"100%", borderCollapse:"collapse", minWidth:1150 }}>
          <thead>
            <tr>
              <TH c="Name" /><TH c="Designation" /><TH c="IBAN" /><TH c="Joining Date" />
              <TH c="Days Active" r /><TH c="Leave Accrued" r /><TH c="Base Salary" r />
              <TH c="Allowances" r /><TH c="Bonus" r />
              <TH c={`Deductions (${new Date().toLocaleDateString("en-GB", { month:"short" })})`} r />
              <TH c="Net Payout" r /><TH c="Payment" />
              <TH c="" />
            </tr>
          </thead>
          <tbody>
            {tabStaff.map((s, i) => {
              const ri = staff.indexOf(s);
              const { daysActive, leaveAccrued, leaveNote } = calcLeave(s.joiningDate);
              const allow = s.housingAllowance + s.transportAllowance + s.otherAllowance;
              const md = mDeds(s).reduce((a, d) => a + d.amount, 0);
              const net = s.baseSalary + allow + s.bonus - md;
              return (
                <tr key={s.id} style={{ borderBottom:`1px solid ${C.g100}`, background:i % 2 ? "#fff" : C.g50 }}>
                  <TD><div style={{ display:"flex", alignItems:"center", gap:8 }}><Av initials={s.name.split(" ").map(n => n[0]).join("")} size={28} /><span style={{ fontWeight:500 }}>{s.name}</span></div></TD>
                  <TD><span style={{ background:C.accentL, color:C.accent, borderRadius:20, padding:"2px 8px", fontSize:11, fontFamily:FF }}>{s.designation}</span></TD>
                  <TD><span style={{ fontFamily:"monospace", fontSize:12, color:C.g500 }}>{s.iban ? s.iban.slice(0, 6) + "..." + s.iban.slice(-4) : "--"}</span></TD>
                  <TD><div style={{ fontSize:13 }}>{fmtDate(s.joiningDate)}</div><div style={{ fontSize:11, color:C.g400 }}>{tenure(s.joiningDate)}</div></TD>
                  <TD right>{daysActive.toLocaleString()}</TD>
                  <TD right><div style={{ color:C.success, fontWeight:500 }}>{leaveAccrued}d</div><div style={{ fontSize:10, color:C.g400 }}>{leaveNote}</div></TD>
                  <TD right bold>{s.baseSalary.toLocaleString()}</TD>
                  <TD right><div>{allow.toLocaleString()}</div><div style={{ fontSize:10, color:C.g400 }}>H:{s.housingAllowance} T:{s.transportAllowance} O:{s.otherAllowance}</div></TD>
                  <TD right color={s.bonus > 0 ? C.success : C.g400}>{s.bonus > 0 ? "+" + s.bonus.toLocaleString() : "--"}</TD>
                  <TD right>{md > 0 ? <div><span style={{ color:C.danger, fontWeight:500 }}>-{md.toLocaleString()}</span>{mDeds(s).map((d, j) => <div key={j} style={{ fontSize:10, color:C.g400 }}>{d.desc}</div>)}</div> : <span style={{ color:C.g400 }}>--</span>}</TD>
                  <TD right><span style={{ fontWeight:700, fontSize:14, color:net >= s.baseSalary ? C.success : C.danger }}>{net.toLocaleString()}</span><div style={{ fontSize:11, color:C.g400 }}>AED</div></TD>
                  <TD><span style={{ background:C.g100, color:C.g700, borderRadius:20, padding:"2px 8px", fontSize:11, whiteSpace:"nowrap", fontFamily:FF }}>{s.paymentMethod}</span></TD>
                  <td style={{ padding:"9px 12px" }}>{!isLocked && <Btn onClick={() => setEditIdx(ri)} style={{ fontSize:12, padding:"4px 10px" }}>Edit</Btn>}</td>
                </tr>
              );
            })}
            {tabStaff.length === 0 && <tr><td colSpan={isSuper ? 13 : 12} style={{ padding:32, textAlign:"center", color:C.g400, fontFamily:FF }}>No active {staffTab} staff.</td></tr>}
          </tbody>
          <tfoot>
            <tr style={{ borderTop:`2px solid ${C.g200}`, background:C.g100 }}>
              <td colSpan={6} style={{ padding:"10px 12px", fontWeight:600, fontSize:13, color:C.g700, fontFamily:FF }}>Totals — {tabStaff.length} active {staffTab} staff</td>
              <td style={{ padding:"10px 12px", textAlign:"right", fontWeight:700, fontFamily:FF }}>{tabStaff.reduce((s, e) => s + e.baseSalary, 0).toLocaleString()}</td>
              <td style={{ padding:"10px 12px", textAlign:"right", fontWeight:700, fontFamily:FF }}>{tabStaff.reduce((s, e) => s + e.housingAllowance + e.transportAllowance + e.otherAllowance, 0).toLocaleString()}</td>
              <td style={{ padding:"10px 12px", textAlign:"right", fontWeight:700, color:C.success, fontFamily:FF }}>{tabStaff.reduce((s, e) => s + e.bonus, 0).toLocaleString()}</td>
              <td style={{ padding:"10px 12px", textAlign:"right", fontWeight:700, color:C.danger, fontFamily:FF }}>-{totalDeds.toLocaleString()}</td>
              <td style={{ padding:"10px 12px", textAlign:"right", fontWeight:700, fontSize:15, color:C.success, fontFamily:FF }}>{(totalGross - totalDeds).toLocaleString()}</td>
              <td colSpan={isSuper ? 2 : 1} />
            </tr>
          </tfoot>
        </table>
      </div>

      {inactiveS.length > 0 && isSuper && (
        <div style={{ marginTop:24 }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:C.g500, marginBottom:10, fontFamily:FF }}>Inactive / Terminated ({inactiveS.length})</h3>
          {inactiveS.map(s => {
            const ri = staff.indexOf(s);
            return (
              <div key={s.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:"#fff", border:`1px solid ${C.g200}`, borderRadius:10, marginBottom:8, opacity:0.7 }}>
                <Av initials={s.name.split(" ").map(n => n[0]).join("")} size={32} color={C.g400} />
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:500, fontSize:13, fontFamily:FF }}>{s.name}</div>
                  <div style={{ fontSize:12, color:C.g400, fontFamily:FF }}>{s.designation}</div>
                </div>
                <span style={{ background:C.dangerL, color:C.danger, borderRadius:20, padding:"2px 10px", fontSize:12, fontFamily:FF }}>Inactive</span>
                <Btn onClick={() => setEditIdx(ri)} style={{ fontSize:12, padding:"4px 10px" }}>Reactivate</Btn>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );}