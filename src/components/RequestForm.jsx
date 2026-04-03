import { useState } from "react";
import { C, FF, ROLES, NON_SAL_TYPES, LOCATIONS, CURRENCIES, FREQUENCIES, SOURCE_ACCOUNTS } from "../constants";
import { Sel, Inp, Txt, G2, IBox, Btn, FileUpload, Dvd, EmpFields } from "./Primitives";

export default function ReqForm({ onSubmit, onClose, currentUser, editData, staff }) {
const isHM = currentUser.role === ROLES.HOUSE_MANAGER;
  const canSalary = [ROLES.SUPER, ROLES.ACCOUNTANT, ROLES.HOUSE_MANAGER].includes(currentUser.role);
  const availTypes = canSalary ? ["Salary", ...NON_SAL_TYPES] : NON_SAL_TYPES;
  const blank = {
    type: canSalary ? "Salary" : "Construction",
    salarySubType:"reimbursement", staffRef:"", reimburseDesc:"", reimburseAmount:"", reimburseCurrency:"AED",
    newName:"", newDesignation:"", newIban:"", newJoiningDate:"", newBaseSalary:"",
    newHousing:"0", newTransport:"0", newOther:"0", newBonus:"0", newPayMethod:"Bank Transfer (WPS)", newStaffType:"home",
    title:"", description:"", amount:"", currency:"AED", location:LOCATIONS[0],
    isRecurring:false, frequency:"Monthly", approvalFiles:[], proofFiles:[], sourceAccount:"", status:"Pending",
  };
  const [f, setF] = useState(editData ? { ...blank, ...editData } : blank);
  const set = (k, v) => setF(p => ({ ...p, [k]:v }));
  const isSal = f.type === "Salary";
  const isReim = isSal && f.salarySubType === "reimbursement";
  const isNew = isSal && f.salarySubType === "new_employee";
  const canSrc = currentUser.role === ROLES.ACCOUNTANT || currentUser.role === ROLES.SUPER;
  const gross = [f.newBaseSalary, f.newHousing, f.newTransport, f.newOther, f.newBonus].reduce((a, v) => a + (Number(v) || 0), 0);

  const submit = () => {
    if (isReim) {
      if (!f.staffRef) return alert("Select a staff member.");
      if (!f.reimburseAmount) return alert("Enter amount.");
    } else if (isNew) {
      if (!f.newName || !f.newDesignation || !f.newBaseSalary) return alert("Name, designation and base salary required.");
      if (!f.newJoiningDate) return alert("Joining date is required.");
    } else {
      if (!f.title || !f.amount) return alert("Title and amount required.");
    }
    onSubmit(f);
  };

  return (
    <div>
      <Sel label="Payment Type" value={f.type} onChange={e => set("type", e.target.value)} options={availTypes} />
      {isSal && (
        <>
          <div style={{ display:"flex", gap:10, marginBottom:14 }}>
            {[["reimbursement","Staff Reimbursement"], ["new_employee","Add New Employee"]].map(([v, l]) => (
              <button key={v} onClick={() => set("salarySubType", v)} style={{ flex:1, padding:"9px 0", borderRadius:8, border:`2px solid ${f.salarySubType === v ? C.accent : C.g200}`, background:f.salarySubType === v ? C.accentL : "#fff", color:f.salarySubType === v ? C.accent : C.g600, fontWeight:f.salarySubType === v ? 600 : 400, cursor:"pointer", fontSize:13, fontFamily:FF }}>
                {l}
              </button>
            ))}
          </div>
          {isReim && (
            <>
              <Sel label="Staff Member" value={f.staffRef} onChange={e => set("staffRef", e.target.value)} options={[{ value:"", label:"-- Select --" }, ...staff.map(s => ({ value:s.id, label:`${s.name} (${s.designation})` }))]} />
              <Txt label="Description" value={f.reimburseDesc} onChange={e => set("reimburseDesc", e.target.value)} placeholder="e.g. Overtime, advance..." />
              <G2>
                <Inp label="Amount" type="number" value={f.reimburseAmount} onChange={e => set("reimburseAmount", e.target.value)} />
                <Sel label="Currency" value={f.reimburseCurrency} onChange={e => set("reimburseCurrency", e.target.value)} options={CURRENCIES} />
              </G2>
              <FileUpload label="Supporting Documents" files={f.approvalFiles} onAdd={v => set("approvalFiles", [...f.approvalFiles, v])} />
              <IBox color={C.purple}>Payroll will be updated only after Super User approval.</IBox>
            </>
          )}
          {isNew && (
            <>
              <EmpFields f={f} set={set} restrictToHome={isHM} />
              {gross > 0 && <IBox color={C.success} bg={C.successL}>Gross: <strong>{gross.toLocaleString()} AED</strong></IBox>}
              <FileUpload label="Contract / Documents" files={f.approvalFiles} onAdd={v => set("approvalFiles", [...f.approvalFiles, v])} />
              <IBox color={C.purple}>Requires Super User approval before being added to payroll.</IBox>
            </>
          )}
        </>
      )}
      {!isSal && (
        <>
          <Inp label="Title *" value={f.title} onChange={e => set("title", e.target.value)} />
          <Txt label="Description" value={f.description} onChange={e => set("description", e.target.value)} />
          <G2>
            <Inp label="Amount *" type="number" value={f.amount} onChange={e => set("amount", e.target.value)} />
            <Sel label="Currency" value={f.currency} onChange={e => set("currency", e.target.value)} options={CURRENCIES} />
            <Sel label="Location" value={f.location} onChange={e => set("location", e.target.value)} options={LOCATIONS} />
          </G2>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12, padding:"8px 12px", background:C.g50, borderRadius:8 }}>
            <input type="checkbox" id="rec" checked={f.isRecurring} onChange={e => set("isRecurring", e.target.checked)} />
            <label htmlFor="rec" style={{ fontSize:14, color:C.g700, cursor:"pointer", fontFamily:FF }}>Mark as Recurring</label>
            {f.isRecurring && (
              <select value={f.frequency} onChange={e => set("frequency", e.target.value)} style={{ marginLeft:"auto", padding:"5px 10px", border:`1px solid ${C.g300}`, borderRadius:6, fontSize:13, background:"#fff", fontFamily:FF }}>
                {FREQUENCIES.map(v => <option key={v}>{v}</option>)}
              </select>
            )}
          </div>
          <FileUpload label="Approval Documents" files={f.approvalFiles} onAdd={v => set("approvalFiles", [...f.approvalFiles, v])} />
          {canSrc && (
            <>
              <Sel label="Source Bank Account" value={f.sourceAccount} onChange={e => set("sourceAccount", e.target.value)} options={[{ value:"", label:"-- Select Account --" }, ...SOURCE_ACCOUNTS]} />
              <FileUpload label="Proof of Payment" files={f.proofFiles} onAdd={v => set("proofFiles", [...f.proofFiles, v])} />
            </>
          )}
        </>
      )}
      <div style={{ display:"flex", gap:10, marginTop:16 }}>
        <Btn variant="primary" onClick={submit} style={{ flex:1, padding:"10px 0", fontSize:14, fontWeight:600 }}>{editData ? "Update Request" : "Submit Request"}</Btn>
        <Btn onClick={onClose} style={{ padding:"10px 20px" }}>Cancel</Btn>
      </div>
    </div>
  );
}