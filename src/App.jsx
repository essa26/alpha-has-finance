import { useState, useEffect, useCallback } from "react";
import {
  ROLES, ROLE_COLORS, AUDIT_ACTIONS, INIT_USERS, INIT_STAFF, INIT_REQS, INIT_INVITES,
  C, FF, gid, mkAudit, getTitle, fmtAmt, curMonth,
} from "./constants";
import { Modal } from "./components/Primitives";
import Dashboard    from "./components/Dashboard";
import ReqsView     from "./components/ReqsView";
import Payroll      from "./components/Payroll";
import Reports      from "./components/Reports";
import AuditLog     from "./components/AuditLog";
import UserMgmt     from "./components/UserMgmt";
import ReqForm      from "./components/RequestForm";
import DirectAddForm from "./components/DirectAddForm";
import { Av, RoleBadge } from "./components/Primitives";

export default function App() {
const [currentUser, setCurrentUser]       = useState(INIT_USERS[0]);
  const [users, setUsers]                   = useState(INIT_USERS);
  const [requests, setRequests]             = useState(INIT_REQS);
  const [staff, setStaff]                   = useState(INIT_STAFF);
  const [invites, setInvites]               = useState(INIT_INVITES);
  const [auditLog, setAuditLog]             = useState([]);
  const [profileRequests, setProfileRequests] = useState([]);
  const [activeTab, setActiveTab]           = useState("dashboard");
  const [showNew, setShowNew]               = useState(false);
  const [showAddEmp, setShowAddEmp]         = useState(false);
  const [notifications, setNotifications]   = useState({});

  const addAudit = useCallback((action, details = "") => {
    setAuditLog(l => [...l, mkAudit(action, currentUser, details)]);
  }, [currentUser]);

  const addNotif = useCallback((uid, message) => {
    setNotifications(n => ({ ...n, [uid]:[...(n[uid] || []), { message, at:new Date().toISOString().slice(0, 10) }] }));
  }, []);

useEffect(() => {
  const u = users.find(x => x.id === currentUser.id);
  if (u && (u.role !== currentUser.role || u.name !== currentUser.name)) setCurrentUser(u);
}, [users, currentUser.id, currentUser.name, currentUser.role]);

  const pendingNewStaff  = requests.filter(r => r.type === "Salary" && r.salarySubType === "new_employee" && r.status === "Pending Approval");
  const pendingProfiles  = profileRequests.filter(p => p.status === "pending").length;
  const isPending        = currentUser.role === ROLES.PENDING;
  const showPayrollTab   = [ROLES.SUPER, ROLES.HOUSE_MANAGER, ROLES.ACCOUNTANT].includes(currentUser.role);
  const myNotifCount     = (notifications[currentUser.id] || []).length;

  const tabs = [
    { id:"dashboard", label:"Dashboard" },
    ...(!isPending ? [{ id:"requests", label:currentUser.role === ROLES.ACCOUNTANT ? "Queue" : "Requests" }] : []),
    ...(showPayrollTab ? [{ id:"payroll", label:"Payroll" }] : []),
    ...(currentUser.role === ROLES.SUPER ? [{ id:"reports", label:"Reports" }] : []),
    { id:"users", label:"My Profile" },
    ...(currentUser.role === ROLES.SUPER ? [{ id:"audit", label:"Audit Log" }] : []),
  ];

  const updateReq = (id, d) => setRequests(r => r.map(x => x.id === id ? { ...x, ...d } : x));
  const deleteReq = (id)    => setRequests(r => r.filter(x => x.id !== id));

  const addReq = (data) => {
    const isSal  = data.type === "Salary";
    const isNew  = isSal && data.salarySubType === "new_employee";
    const isReim = isSal && data.salarySubType === "reimbursement";
    const title    = isNew ? `New Employee: ${data.newName}` : isReim ? `Reimbursement: ${data.reimburseDesc || "Staff"}` : data.title;
    const amount   = isReim ? data.reimburseAmount : isNew ? data.newBaseSalary : data.amount;
    const currency = isReim ? data.reimburseCurrency : data.currency || "AED";
    setRequests(r => [...r, { ...data, id:gid(), title, amount, currency, initiatorId:currentUser.id, initiatorName:currentUser.name, createdAt:new Date().toISOString().slice(0, 10), proofFiles:data.proofFiles || [], approvalFiles:data.approvalFiles || [], processingHistory:[], comments:[], status:isNew ? "Pending Approval" : "Pending" }]);
    addAudit(AUDIT_ACTIONS.CREATE_REQUEST, `"${title}" (${fmtAmt(amount, currency)})`);
  };

  const bulkApprove = (ids) => {
    setRequests(r => r.map(x => ids.includes(x.id) ? { ...x, status:"Approved" } : x));
    addAudit(AUDIT_ACTIONS.APPROVE_REQUEST, `Bulk approved ${ids.length} requests`);
    ids.forEach(id => {
      const r = requests.find(x => x.id === id);
      if (r && r.initiatorId !== currentUser.id) addNotif(r.initiatorId, `Your request "${getTitle(r)}" has been approved.`);
    });
  };

  const approveReimb = (req) => {
    if (!req.staffRef) return;
    setStaff(s => s.map(emp => emp.id === req.staffRef
      ? { ...emp, deductions:[...emp.deductions, { desc:`Reimbursement: ${req.reimburseDesc || ""}`, amount:Number(req.reimburseAmount) || 0, month:curMonth() }] }
      : emp
    ));
  };

  const handleUpdate = (id, d) => {
    const req = requests.find(r => r.id === id);
    if (req && d.status === "Approved" && req.type === "Salary" && req.salarySubType === "reimbursement") {
      approveReimb(req);
    }
    updateReq(id, d);
  };

  const approveNewStaff = (req) => {
    setStaff(s => [...s, { id:gid("s"), name:req.newName, designation:req.newDesignation, iban:req.newIban || "", joiningDate:req.newJoiningDate || new Date().toISOString().slice(0, 10), baseSalary:Number(req.newBaseSalary || 0), housingAllowance:Number(req.newHousing || 0), transportAllowance:Number(req.newTransport || 0), otherAllowance:Number(req.newOther || 0), currency:"AED", deductions:[], bonus:Number(req.newBonus || 0), paymentMethod:req.newPayMethod || "Bank Transfer (WPS)", active:true, staffType:req.newStaffType || "home" }]);
    updateReq(req.id, { status:"Approved", processedDate:new Date().toISOString().slice(0, 10) });
    addAudit(AUDIT_ACTIONS.APPROVE_NEW_STAFF, `${req.newName} added to ${req.newStaffType || "home"} payroll`);
    addNotif(req.initiatorId, `New employee "${req.newName}" approved and added to payroll.`);
  };

  const directAddEmp = (data) => {
    setStaff(s => [...s, { id:gid("s"), name:data.newName, designation:data.newDesignation, iban:data.newIban || "", joiningDate:data.newJoiningDate, baseSalary:Number(data.newBaseSalary || 0), housingAllowance:Number(data.newHousing || 0), transportAllowance:Number(data.newTransport || 0), otherAllowance:Number(data.newOther || 0), currency:"AED", deductions:[], bonus:Number(data.newBonus || 0), paymentMethod:data.newPayMethod || "Bank Transfer (WPS)", active:true, staffType:data.newStaffType || "home" }]);
    addAudit(AUDIT_ACTIONS.APPROVE_NEW_STAFF, `${data.newName} directly added by Super User`);
    setShowAddEmp(false);
  };

  const handleProfile = ({ type, payload }) => {
    if (type === "request") {
      setProfileRequests(p => [...p, payload]);
    } else if (type === "approve") {
      setProfileRequests(p => p.map(x => x.id === payload.id ? { ...x, status:"approved" } : x));
      setUsers(u => u.map(x => x.id === payload.userId ? { ...x, name:payload.requestedName, phone:payload.requestedPhone } : x));
      addNotif(payload.userId, "Your profile change has been approved.");
    } else {
      setProfileRequests(p => p.map(x => x.id === payload.id ? { ...x, status:"rejected" } : x));
      addNotif(payload.userId, "Your profile change request was not approved.");
    }
  };

  return (
    <div style={{ fontFamily:FF, minHeight:"100vh", background:"#faf7fb" }}>
      {showNew && (
        <Modal title="New Payment Request" onClose={() => setShowNew(false)}>
          <ReqForm currentUser={currentUser} staff={staff} onClose={() => setShowNew(false)} onSubmit={d => { addReq(d); setShowNew(false); setActiveTab(d.type === "Salary" ? "payroll" : "requests"); }} />
        </Modal>
      )}
      {showAddEmp && (
        <Modal title="Add Employee Directly" onClose={() => setShowAddEmp(false)}>
          <DirectAddForm onSubmit={directAddEmp} onClose={() => setShowAddEmp(false)} />
        </Modal>
      )}

      {/* Header */}
      <div style={{ background:C.primary, padding:"0 20px", display:"flex", alignItems:"center", height:58, position:"sticky", top:0, zIndex:100, borderBottom:"1px solid rgba(236,223,240,0.12)" }}>
        <div style={{ marginRight:32, flexShrink:0, display:"flex", flexDirection:"column", justifyContent:"center" }}>
          <div style={{ fontFamily:FF, fontSize:20, fontWeight:500, color:"#ecdff0", letterSpacing:"0.02em", lineHeight:1.1 }}>Alpha HAS</div>
          <div style={{ fontFamily:FF, fontSize:10, fontWeight:300, color:"rgba(236,223,240,0.45)", letterSpacing:"0.25em", marginTop:2 }}>FINANCE PORTAL</div>
        </div>
        <div style={{ display:"flex", gap:2, flex:1, overflow:"auto" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ background:activeTab === t.id ? "rgba(236,223,240,0.15)" : "none", color:activeTab === t.id ? "#ecdff0" : "rgba(236,223,240,0.55)", border:"none", borderBottom:activeTab === t.id ? "2px solid #ecdff0" : "2px solid transparent", borderRadius:0, padding:"6px 16px", fontSize:13, cursor:"pointer", fontWeight:activeTab === t.id ? 600 : 400, whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:5, height:58, boxSizing:"border-box", fontFamily:FF }}>
              {t.label}
              {t.id === "payroll"    && pendingNewStaff.length > 0 && currentUser.role === ROLES.SUPER && <span style={{ background:"#ecdff0", color:C.primary, borderRadius:10, padding:"1px 6px", fontSize:10, fontWeight:700 }}>{pendingNewStaff.length}</span>}
              {t.id === "users"      && pendingProfiles > 0 && currentUser.role === ROLES.SUPER        && <span style={{ background:C.warning, color:"#fff", borderRadius:10, padding:"1px 6px", fontSize:10 }}>{pendingProfiles}</span>}
              {t.id === "audit"      && auditLog.length > 0                                            && <span style={{ background:"rgba(236,223,240,0.25)", color:"#ecdff0", borderRadius:10, padding:"1px 6px", fontSize:10 }}>{auditLog.length}</span>}
              {t.id === "dashboard"  && myNotifCount > 0 && currentUser.role !== ROLES.SUPER           && <span style={{ background:"#ef4444", color:"#fff", borderRadius:10, padding:"1px 6px", fontSize:10 }}>{myNotifCount}</span>}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginLeft:14 }}>
          <select value={currentUser.id} onChange={e => { const u = users.find(x => x.id === e.target.value); if (u) { setCurrentUser(u); setActiveTab("dashboard"); } }} style={{ background:"rgba(236,223,240,0.12)", color:"#ecdff0", border:"1px solid rgba(236,223,240,0.25)", borderRadius:8, padding:"5px 10px", fontSize:12, cursor:"pointer", fontFamily:FF }}>
            {users.map(u => <option key={u.id} value={u.id} style={{ background:"#3d0040", color:"#ecdff0" }}>{u.name} ({u.role.split(" ")[0]})</option>)}
          </select>
          <Av initials={currentUser.avatar} size={30} color={ROLE_COLORS[currentUser.role] || C.accent} />
        </div>
      </div>

      {/* Role banner */}
      <div style={{ background:"#fff", borderBottom:`1px solid ${C.g200}`, padding:"7px 20px", display:"flex", alignItems:"center", gap:10, fontSize:13 }}>
        <strong style={{ color:C.g800, fontFamily:FF }}>{currentUser.name}</strong>
        <RoleBadge role={currentUser.role} />
        {isPending && <span style={{ background:"#fff8e1", color:C.warning, borderRadius:20, padding:"2px 10px", fontSize:12, border:`1px solid ${C.warning}40`, fontFamily:FF }}>Account pending activation</span>}
        <span style={{ color:C.g300, marginLeft:4 }}>|</span>
        <span style={{ fontSize:12, color:C.g400, fontFamily:FF }}>Switch roles via dropdown to preview access levels</span>
      </div>

      {isPending ? (
        <div style={{ maxWidth:500, margin:"60px auto", textAlign:"center", padding:32 }}>
          <div style={{ fontSize:40, marginBottom:16 }}>⌛</div>
          <h2 style={{ fontSize:20, fontWeight:600, color:C.g800, marginBottom:8, fontFamily:FF }}>Account Pending Activation</h2>
          <p style={{ fontSize:15, color:C.g600, lineHeight:1.6, fontFamily:FF }}>Your account is awaiting role assignment by a Super User.</p>
          <div style={{ marginTop:12 }}><a href="mailto:essa@alpha.com" style={{ color:C.accent, fontWeight:500, fontFamily:FF, fontSize:14 }}>Contact your administrator</a></div>
          <div style={{ marginTop:16 }}><RoleBadge role={ROLES.PENDING} /></div>
        </div>
      ) : (
        <div style={{ maxWidth:1220, margin:"0 auto", padding:"24px 18px" }}>
          {activeTab === "dashboard" && <Dashboard requests={requests} staff={staff} currentUser={currentUser} notifications={notifications} />}
          {activeTab === "requests"  && <ReqsView requests={requests} onUpdate={handleUpdate} onDelete={deleteReq} onNew={() => setShowNew(true)} onBulkApprove={bulkApprove} currentUser={currentUser} staff={staff} addAudit={addAudit} onNotify={addNotif} />}
          {activeTab === "payroll"   && <Payroll staff={staff} onUpdateStaff={setStaff} currentUser={currentUser} pendingNewStaff={pendingNewStaff} onApproveNewStaff={approveNewStaff} onRejectNewStaff={id => handleUpdate(id, { status:"Cancelled" })} addAudit={addAudit} onAddEmployee={() => setShowAddEmp(true)} />}
          {activeTab === "reports"   && <Reports requests={requests} staff={staff} currentUser={currentUser} />}
          {activeTab === "users"     && <UserMgmt users={users} onUpdateUsers={setUsers} currentUser={currentUser} invites={invites} onUpdateInvites={setInvites} addAudit={addAudit} profileRequests={profileRequests} onHandleProfile={handleProfile} />}
          {activeTab === "audit"     && <AuditLog logs={auditLog} />}
        </div>
      )}
    </div>
  );
}