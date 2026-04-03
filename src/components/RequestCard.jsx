import { useState } from "react";
import { C, FF, ROLES, CLOSED, AUDIT_ACTIONS, getCur, getAmt, getTitle, fmtAmt, fmtDate, gid } from "../constants";
import { Badge, Btn, Confirm, Modal } from "./Primitives";
import ReqForm from "./RequestForm";
import ProcessModal from "./ProcessModal";

export default function ReqCard({ req, currentUser, onUpdate, onDelete, staff, addAudit, onNotify }) {
const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [comment, setComment] = useState("");

  const isOwner = req.initiatorId === currentUser.id;
  const isSuper = currentUser.role === ROLES.SUPER;
  const isAcct  = currentUser.role === ROLES.ACCOUNTANT;
  const isClosed = CLOSED.includes(req.status);

  const canEdit    = !isClosed && (isSuper || (isOwner && req.status === "Pending"));
  const canApprove = isSuper && (req.status === "Pending" || req.status === "Pending Approval");
  const canReject  = isSuper && (req.status === "Pending" || req.status === "Approved");
  const canProcess = (isAcct || isSuper) && (req.status === "Approved" || (req.isRecurring && req.status === "Processed"));
  const canCancel  = !isClosed && (isSuper || isOwner);
  const dispTitle  = getTitle(req);

  const act = (status, extra = {}) => {
    onUpdate(req.id, { status, ...extra });
    const am = { Approved:AUDIT_ACTIONS.APPROVE_REQUEST, Rejected:AUDIT_ACTIONS.REJECT_REQUEST, Processed:AUDIT_ACTIONS.PROCESS_REQUEST, Cancelled:AUDIT_ACTIONS.CANCEL_REQUEST };
    addAudit(am[status] || AUDIT_ACTIONS.UPDATE_REQUEST, `"${dispTitle}" -> ${status}`);
    if (onNotify && req.initiatorId !== currentUser.id) {
      onNotify(req.initiatorId, `Your request "${dispTitle}" has been ${status.toLowerCase()}.`);
    }
  };

  const handleProcess = (id, src, pf, fxRate, aedEquiv) => {
    const h = { date:new Date().toISOString().slice(0, 10), account:src, by:currentUser.name, fxRate, aedEquiv };
    onUpdate(id, {
      status:"Processed", sourceAccount:src, proofFiles:pf,
      processedDate:new Date().toISOString().slice(0, 10),
      fxRate: fxRate || 1,
      aedEquivalent: aedEquiv || getAmt(req),
      processingHistory:[...(req.processingHistory || []), h],
    });
    addAudit(AUDIT_ACTIONS.PROCESS_REQUEST, `"${dispTitle}" via ${src}${fxRate && getCur(req) !== "AED" ? ` @ ${fxRate} ${getCur(req)}/AED` : ""}`);
    if (onNotify && req.initiatorId !== currentUser.id) {
      onNotify(req.initiatorId, `Your request "${dispTitle}" was processed via ${src}.`);
    }
  };

  const addComment = () => {
    if (!comment.trim()) return;
    const c = { id:gid("c"), text:comment.trim(), author:currentUser.name, role:currentUser.role, at:new Date().toISOString() };
    onUpdate(req.id, { comments:[...(req.comments || []), c] });
    addAudit(AUDIT_ACTIONS.ADD_COMMENT, `Comment on "${dispTitle}"`);
    setComment("");
  };

  return (
    <>
      {confirm && <Confirm message={confirm.msg} onConfirm={() => { confirm.fn(); setConfirm(null); }} onCancel={() => setConfirm(null)} />}
      {editing && (
        <Modal title="Edit Request" onClose={() => setEditing(false)}>
          <ReqForm currentUser={currentUser} editData={req} staff={staff} onClose={() => setEditing(false)}
            onSubmit={d => { onUpdate(req.id, d); addAudit(AUDIT_ACTIONS.UPDATE_REQUEST, `"${dispTitle}"`); setEditing(false); }} />
        </Modal>
      )}
      {processing && <ProcessModal req={req} onProcess={handleProcess} onClose={() => setProcessing(false)} />}

      <div style={{ background:"#fff", border:`1px solid ${C.g200}`, borderRadius:12, marginBottom:10, overflow:"hidden", fontFamily:FF }}>
        <div style={{ padding:"12px 16px", display:"flex", alignItems:"center", gap:12, cursor:"pointer" }} onClick={() => setOpen(!open)}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              <span style={{ fontWeight:600, fontSize:14, color:C.g800 }}>{dispTitle}</span>
              <Badge status={req.status} />
              {req.isRecurring && <span style={{ background:C.accentL, color:C.accent, fontSize:11, padding:"2px 8px", borderRadius:10, border:`1px solid ${C.accent}30` }}>Recurring {req.frequency}</span>}
              {req.type === "Salary" && req.salarySubType && <span style={{ background:C.purpleL, color:C.purple, fontSize:11, padding:"2px 8px", borderRadius:10 }}>{req.salarySubType === "new_employee" ? "New Employee" : "Reimbursement"}</span>}
              {(req.comments || []).length > 0 && <span style={{ background:C.g100, color:C.g500, fontSize:11, padding:"2px 8px", borderRadius:10 }}>{req.comments.length} comment{req.comments.length > 1 ? "s" : ""}</span>}
            </div>
            <div style={{ display:"flex", gap:14, marginTop:3, fontSize:12, color:C.g500, flexWrap:"wrap" }}>
              <span>{req.location || "Payroll"}</span>
              <span>{req.type}</span>
              <strong style={{ color:C.g800 }}>{fmtAmt(getAmt(req), getCur(req))}</strong>
              <span>By {req.initiatorName}</span>
              <span style={{ color:C.g400 }}>{fmtDate(req.createdAt)}</span>
            </div>
          </div>
          <span style={{ color:C.g400, fontSize:11 }}>{open ? "v" : ">"}</span>
        </div>

        {open && (
          <div style={{ padding:"0 16px 14px", borderTop:`1px solid ${C.g100}` }}>
            {req.description && <p style={{ fontSize:13, color:C.g600, margin:"10px 0" }}>{req.description}</p>}
            {req.type === "Salary" && req.salarySubType === "new_employee" && (
              <div style={{ background:C.purpleL, border:`1px solid ${C.purple}30`, borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:10 }}>
                <strong style={{ color:C.purple }}>New Employee:</strong> {req.newName} - {req.newDesignation} - {fmtAmt(req.newBaseSalary)} base ({req.newStaffType || "home"} staff)
              </div>
            )}
            {req.type === "Salary" && req.salarySubType === "reimbursement" && (
              <div style={{ background:C.purpleL, border:`1px solid ${C.purple}30`, borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:10, color:C.purple }}>
                Reimbursement for: {staff.find(s => s.id === req.staffRef)?.name || req.staffRef} - {req.reimburseDesc}
              </div>
            )}
            {(req.approvalFiles?.length > 0 || req.proofFiles?.length > 0) && (
              <div style={{ display:"flex", gap:20, fontSize:12, marginBottom:8 }}>
                {req.approvalFiles?.length > 0 && <div>{req.approvalFiles.map((f, i) => <div key={i} style={{ color:C.accent }}>@ {f.name || f}</div>)}</div>}
                {req.proofFiles?.length > 0 && <div>{req.proofFiles.map((f, i) => <div key={i} style={{ color:C.success }}>@ {f.name || f}</div>)}</div>}
              </div>
            )}
            {req.sourceAccount && (
              <div style={{ fontSize:12, color:C.g600, marginBottom:4, fontFamily:FF }}>
                Source: <strong>{req.sourceAccount}</strong>
                {req.fxRate && getCur(req) !== "AED" && (
                  <span style={{ marginLeft:10, background:C.successL, color:C.success, borderRadius:10, padding:"1px 8px", fontSize:11 }}>
                    {getCur(req)}/AED @ {req.fxRate} = <strong>{(req.aedEquivalent || 0).toLocaleString()} AED</strong>
                  </span>
                )}
              </div>
            )}
            {req.processingHistory?.length > 0 && (
              <div style={{ marginBottom:8 }}>
                <div style={{ fontSize:11, fontWeight:600, color:C.g500, marginBottom:4 }}>Processing History</div>
                {req.processingHistory.map((h, i) => (
                  <div key={i} style={{ fontSize:11, color:C.g500, fontFamily:FF }}>
                    {fmtDate(h.date)} — {h.account} — by {h.by}
                    {h.fxRate && h.aedEquiv && <span style={{ color:C.success, marginLeft:6 }}>@ {h.fxRate} = {h.aedEquiv.toLocaleString()} AED</span>}
                  </div>
                ))}
              </div>
            )}
            {(req.comments || []).length > 0 && (
              <div style={{ marginTop:12, marginBottom:8 }}>
                <div style={{ fontSize:12, fontWeight:600, color:C.g600, marginBottom:6 }}>Comments</div>
                {req.comments.map(c => (
                  <div key={c.id} style={{ background:C.g50, borderRadius:8, padding:"8px 10px", marginBottom:6, fontSize:12 }}>
                    <span style={{ fontWeight:600, color:C.g700 }}>{c.author}</span>
                    <span style={{ color:C.g400, marginLeft:6 }}>{fmtDate(c.at.slice(0, 10))}</span>
                    <div style={{ color:C.g700, marginTop:3 }}>{c.text}</div>
                  </div>
                ))}
              </div>
            )}
            {!isClosed && (
              <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                <input value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === "Enter" && addComment()} placeholder="Add a comment..." style={{ flex:1, padding:"7px 10px", border:`1px solid ${C.g300}`, borderRadius:8, fontSize:13, fontFamily:FF }} />
                <Btn onClick={addComment} style={{ padding:"7px 12px", fontSize:12 }}>Post</Btn>
              </div>
            )}
            <div style={{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" }}>
              {canEdit    && <Btn onClick={() => setEditing(true)}>Edit</Btn>}
              {canApprove && <Btn variant="success" onClick={() => act("Approved")}>Approve</Btn>}
              {canReject  && <Btn variant="danger" onClick={() => setConfirm({ msg:`Reject "${dispTitle}"?`, fn:() => act("Rejected") })}>Reject</Btn>}
              {canProcess && <Btn variant="primary" onClick={() => setProcessing(true)}>{req.isRecurring && req.status === "Processed" ? "Process Again" : "Mark as Processed"}</Btn>}
              {canCancel  && <Btn variant="danger" onClick={() => setConfirm({ msg:`Cancel "${dispTitle}"?`, fn:() => act("Cancelled") })}>Cancel</Btn>}
              {isSuper && !isClosed && <Btn variant="danger" onClick={() => setConfirm({ msg:`Delete "${dispTitle}" permanently?`, fn:() => { onDelete(req.id); addAudit(AUDIT_ACTIONS.DELETE_REQUEST, `"${dispTitle}"`); setOpen(false); } })}>Delete</Btn>}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

