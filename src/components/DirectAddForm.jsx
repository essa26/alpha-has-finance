import { useState } from "react";
import { C } from "../constants";
import { IBox, Btn } from "./Primitives";
import { EmpFields } from "./Primitives"; // already exported from Primitives

export default function DirectAddForm({ onSubmit, onClose }) {
const blank = { newName:"", newDesignation:"", newIban:"", newJoiningDate:"", newPayMethod:"Bank Transfer (WPS)", newStaffType:"home", newBaseSalary:"", newHousing:"0", newTransport:"0", newOther:"0", newBonus:"0" };
  const [f, setF] = useState(blank);
  const set = (k, v) => setF(p => ({ ...p, [k]:v }));
  const gross = [f.newBaseSalary, f.newHousing, f.newTransport, f.newOther, f.newBonus].reduce((a, v) => a + (Number(v) || 0), 0);
  const submit = () => {
    if (!f.newName || !f.newDesignation || !f.newBaseSalary) return alert("Name, designation and base salary are required.");
    if (!f.newJoiningDate) return alert("Joining date is required.");
    onSubmit(f);
  };
  return (
    <div>
      <IBox color={C.success} bg={C.successL}>Employee added directly to payroll without approval queue.</IBox>
      <EmpFields f={f} set={set} />
      {gross > 0 && <IBox color={C.success} bg={C.successL}>Gross Monthly Package: <strong>{gross.toLocaleString()} AED</strong></IBox>}
      <div style={{ display:"flex", gap:10, marginTop:16 }}>
        <Btn variant="primary" onClick={submit} style={{ flex:1, padding:"10px 0", fontWeight:600 }}>Add to Payroll</Btn>
        <Btn onClick={onClose} style={{ padding:"10px 20px" }}>Cancel</Btn>
      </div>
    </div>
  );
}