import { useState } from "react";
import { C, FF, ROLES, ROLE_ORDER, ROLE_COLORS, AUDIT_ACTIONS, gid, fmtDate } from "../constants";
import { Av, RoleBadge, Modal, Inp, Sel, Btn, IBox } from "./Primitives";

export default function UserMgmt({ users, onUpdateUsers, currentUser, invites, onUpdateInvites, addAudit, profileRequests, onHandleProfile }) {
const [tab, setTab]           = useState("users");
  const [editUser, setEditUser] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inv, setInv]           = useState({ email:"", role:ROLES.INITIATOR });
  const [showPE, setShowPE]     = useState(false);
  const [pForm, setPForm]       = useState({ name:currentUser.name, phone:currentUser.phone || "" });
  const isSuper = currentUser.role === ROLES.SUPER;
  const pendingCount = profileRequests.filter(p => p.status === "pending").length;

  const sendInvite = () => {
    if (!inv.email) return alert("Email required");
    const e = { id:gid("inv"), email:inv.email, role:inv.role, sentAt:new Date().toISOString().slice(0, 10), status:"pending" };
    onUpdateInvites([...invites, e]);
    addAudit(AUDIT_ACTIONS.INVITE_USER, `Invited ${inv.email} as ${inv.role}`);
    setShowInvite(false); setInv({ email:"", role:ROLES.INITIATOR });
    alert(`Invitation sent to ${inv.email} (simulated)`);
  };

  const saveEdit = (uid, role, active) => {
    if (uid === currentUser.id && role === ROLES.PENDING) return alert("You cannot assign the Pending role to your own account.");
    onUpdateUsers(users.map(u => u.id === uid ? { ...u, role, active } : u));
    addAudit(AUDIT_ACTIONS.UPDATE_USER_ROLE, `User ${uid} -> ${role}, active: ${active}`);
    setEditUser(null);
  };

  const delUser = (uid) => {
    if (uid === currentUser.id) return alert("You cannot delete your own account.");
    if (!window.confirm("Delete this user permanently?")) return;
    onUpdateUsers(users.filter(u => u.id !== uid));
    addAudit(AUDIT_ACTIONS.DELETE_USER, `Deleted user ${uid}`);
  };

  const submitProfile = () => {
    onHandleProfile({ type:"request", payload:{ id:gid("pr"), userId:currentUser.id, userName:currentUser.name, requestedName:pForm.name, requestedPhone:pForm.phone, submittedAt:new Date().toISOString(), status:"pending" } });
    addAudit(AUDIT_ACTIONS.REQUEST_PROFILE_CHANGE, `${currentUser.name} requested profile update`);
    setShowPE(false); alert("Profile change submitted for admin review.");
  };

  const availTabs = isSuper ? ["users","invites","profile_requests"] : ["my_profile"];
  const tabLabel = { users:"Users", invites:"Invitations", profile_requests:`Profile Requests${pendingCount > 0 ? ` (${pendingCount})` : ""}`, my_profile:"My Profile" };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <h2 style={{ margin:0, fontSize:18, fontWeight:600, color:C.g800, fontFamily:FF }}>User Management</h2>
        <div style={{ display:"flex", gap:8 }}>
          {!isSuper && <Btn onClick={() => setShowPE(true)}>Request Profile Change</Btn>}
          {isSuper  && <Btn variant="primary" onClick={() => setShowInvite(true)}>+ Invite User</Btn>}
        </div>
      </div>

      {showPE && (
        <Modal title="Request Profile Update" onClose={() => setShowPE(false)} width={440}>
          <IBox color={C.accent}>Changes require Super User approval.</IBox>
          <Inp label="Display Name" value={pForm.name}  onChange={e => setPForm(p => ({ ...p, name:e.target.value }))} />
          <Inp label="Phone"        value={pForm.phone} onChange={e => setPForm(p => ({ ...p, phone:e.target.value }))} />
          <div style={{ display:"flex", gap:10 }}>
            <Btn variant="primary" onClick={submitProfile} style={{ flex:1 }}>Submit for Approval</Btn>
            <Btn onClick={() => setShowPE(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {showInvite && (
        <Modal title="Invite New User" onClose={() => setShowInvite(false)} width={440}>
          <Inp label="Email Address" type="email" value={inv.email} onChange={e => setInv(p => ({ ...p, email:e.target.value }))} />
          <Sel label="Pre-authorized Role" value={inv.role} onChange={e => setInv(p => ({ ...p, role:e.target.value }))} options={Object.values(ROLES).filter(r => r !== ROLES.PENDING)} />
          <IBox color={C.accent}>User assigned this role on first login.</IBox>
          <div style={{ display:"flex", gap:10 }}>
            <Btn variant="primary" onClick={sendInvite} style={{ flex:1 }}>Send Invitation</Btn>
            <Btn onClick={() => setShowInvite(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {editUser && (
        <Modal title={`Edit - ${editUser.name}`} onClose={() => setEditUser(null)} width={440}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16, padding:"12px 14px", background:C.g50, borderRadius:10 }}>
            <Av initials={editUser.avatar} size={44} color={ROLE_COLORS[editUser.role] || C.accent} />
            <div>
              <div style={{ fontWeight:600, fontSize:15, fontFamily:FF }}>{editUser.name}</div>
              <div style={{ fontSize:13, color:C.g500, fontFamily:FF }}>{editUser.email}</div>
            </div>
          </div>
          {editUser.id === currentUser.id && <IBox color={C.warning} bg={C.warningL}>You cannot assign the Pending role to your own account.</IBox>}
          <Sel label="Role" value={editUser.role} onChange={e => setEditUser(p => ({ ...p, role:e.target.value }))} options={editUser.id === currentUser.id ? ROLE_ORDER.filter(r => r !== ROLES.PENDING) : ROLE_ORDER} />
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:C.g50, borderRadius:8, marginBottom:14 }}>
            <input type="checkbox" id="ua" checked={editUser.active} onChange={e => setEditUser(p => ({ ...p, active:e.target.checked }))} />
            <label htmlFor="ua" style={{ fontSize:14, cursor:"pointer", fontFamily:FF }}>Account Active</label>
          </div>
          {!editUser.active && <IBox color={C.warning} bg={C.warningL}>Deactivated users cannot log in.</IBox>}
          <div style={{ display:"flex", gap:10 }}>
            <Btn variant="primary" onClick={() => saveEdit(editUser.id, editUser.role, editUser.active)} style={{ flex:1 }}>Save Changes</Btn>
            <Btn onClick={() => setEditUser(null)}>Cancel</Btn>
          </div>
        </Modal>
      )}

      <div style={{ display:"flex", gap:4, marginBottom:18, borderBottom:`1px solid ${C.g200}` }}>
        {availTabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background:"none", border:"none", borderBottom:`2px solid ${tab === t ? C.accent : "transparent"}`, padding:"8px 14px", fontSize:13, color:tab === t ? C.accent : C.g600, cursor:"pointer", fontWeight:tab === t ? 600 : 400, marginBottom:-1, fontFamily:FF }}>
            {tabLabel[t]}
          </button>
        ))}
      </div>

      {tab === "users" && isSuper && (
        <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:0, background:"#fff", border:`1px solid ${C.g200}`, borderRadius:12, overflow:"hidden" }}>
          <thead><tr style={{ background:C.g50 }}>{["User","Role","Status","Phone","Actions"].map(h => <th key={h} style={{ padding:"10px 14px", fontSize:12, fontWeight:600, color:C.g600, textAlign:"left", borderBottom:`1px solid ${C.g200}`, fontFamily:FF }}>{h}</th>)}</tr></thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} style={{ borderBottom:i < users.length - 1 ? `1px solid ${C.g100}` : "none" }}>
                <td style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Av initials={u.avatar} size={34} color={ROLE_COLORS[u.role] || C.g400} />
                    <div>
                      <div style={{ fontWeight:500, fontSize:14, fontFamily:FF }}>{u.name}{u.id === currentUser.id && <span style={{ fontSize:11, color:C.g400, marginLeft:6 }}>(you)</span>}</div>
                      <div style={{ fontSize:12, color:C.g400, fontFamily:FF }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding:"12px 14px" }}><RoleBadge role={u.role} /></td>
                <td style={{ padding:"12px 14px" }}><span style={{ background:u.active ? C.successL : C.dangerL, color:u.active ? C.success : C.danger, borderRadius:20, padding:"2px 10px", fontSize:12, fontFamily:FF }}>{u.active ? "Active" : "Inactive"}</span></td>
                <td style={{ padding:"12px 14px", fontSize:13, color:C.g600, fontFamily:FF }}>{u.phone || "--"}</td>
                <td style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", gap:6 }}>
                    {u.id !== currentUser.id && <Btn onClick={() => setEditUser({ ...u })}>Edit</Btn>}
                    {u.id !== currentUser.id && <Btn variant="danger" onClick={() => delUser(u.id)}>Delete</Btn>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "invites" && isSuper && (
        invites.length === 0
          ? <div style={{ textAlign:"center", padding:40, color:C.g400, fontFamily:FF }}>No invitations sent.</div>
          : (
            <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:0, background:"#fff", border:`1px solid ${C.g200}`, borderRadius:12, overflow:"hidden" }}>
              <thead><tr style={{ background:C.g50 }}>{["Email","Role","Sent","Status","Actions"].map(h => <th key={h} style={{ padding:"10px 14px", fontSize:12, fontWeight:600, color:C.g600, textAlign:"left", borderBottom:`1px solid ${C.g200}`, fontFamily:FF }}>{h}</th>)}</tr></thead>
              <tbody>
                {invites.map((inv, i) => (
                  <tr key={inv.id} style={{ borderBottom:i < invites.length - 1 ? `1px solid ${C.g100}` : "none" }}>
                    <td style={{ padding:"12px 14px", fontSize:14, fontFamily:FF }}>{inv.email}</td>
                    <td style={{ padding:"12px 14px" }}><RoleBadge role={inv.role} /></td>
                    <td style={{ padding:"12px 14px", fontSize:13, color:C.g500, fontFamily:FF }}>{fmtDate(inv.sentAt)}</td>
                    <td style={{ padding:"12px 14px" }}><span style={{ background:inv.status === "pending" ? C.warningL : C.successL, color:inv.status === "pending" ? C.warning : C.success, borderRadius:20, padding:"2px 10px", fontSize:12, fontFamily:FF }}>{inv.status === "pending" ? "Pending" : "Accepted"}</span></td>
                    <td style={{ padding:"12px 14px" }}>
                      <div style={{ display:"flex", gap:6 }}>
                        <Btn style={{ fontSize:12, padding:"4px 10px" }} onClick={() => alert(`Invitation resent to ${inv.email} (simulated)`)}>Resend</Btn>
                        <Btn variant="danger" style={{ fontSize:12, padding:"4px 10px" }} onClick={() => onUpdateInvites(invites.filter(x => x.id !== inv.id))}>Revoke</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
      )}

      {tab === "profile_requests" && isSuper && (
        profileRequests.length === 0
          ? <div style={{ textAlign:"center", padding:40, color:C.g400, fontFamily:FF }}>No profile change requests.</div>
          : profileRequests.map(pr => (
            <div key={pr.id} style={{ background:"#fff", border:`1px solid ${C.g200}`, borderRadius:12, padding:"14px 16px", marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:14, marginBottom:4, fontFamily:FF }}>{pr.userName} — Profile Change</div>
                  <div style={{ fontSize:13, color:C.g600, fontFamily:FF }}>Name: <strong>{pr.requestedName}</strong> — Phone: <strong>{pr.requestedPhone || "--"}</strong></div>
                  <div style={{ fontSize:12, color:C.g400, marginTop:3, fontFamily:FF }}>{fmtDate(pr.submittedAt.slice(0, 10))}</div>
                </div>
                {pr.status === "pending"
                  ? (
                    <div style={{ display:"flex", gap:8 }}>
                      <Btn variant="success" onClick={() => { onHandleProfile({ type:"approve", payload:pr }); addAudit(AUDIT_ACTIONS.APPROVE_PROFILE, `Approved for ${pr.userName}`); }}>Approve</Btn>
                      <Btn variant="danger"  onClick={() => { onHandleProfile({ type:"reject",  payload:pr }); addAudit(AUDIT_ACTIONS.REJECT_PROFILE,  `Rejected for ${pr.userName}`); }}>Reject</Btn>
                    </div>
                  )
                  : <span style={{ background:pr.status === "approved" ? C.successL : C.dangerL, color:pr.status === "approved" ? C.success : C.danger, borderRadius:20, padding:"3px 12px", fontSize:12, fontFamily:FF }}>{pr.status}</span>
                }
              </div>
            </div>
          ))
      )}

      {tab === "my_profile" && (
        <div style={{ maxWidth:480 }}>
          <div style={{ background:"#fff", border:`1px solid ${C.g200}`, borderRadius:12, padding:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18 }}>
              <Av initials={currentUser.avatar} size={56} color={ROLE_COLORS[currentUser.role] || C.accent} />
              <div>
                <div style={{ fontWeight:700, fontSize:18, fontFamily:FF }}>{currentUser.name}</div>
                <div style={{ fontSize:14, color:C.g500, fontFamily:FF }}>{currentUser.email}</div>
                <div style={{ marginTop:4 }}><RoleBadge role={currentUser.role} /></div>
              </div>
            </div>
            {[{ l:"Phone", v:currentUser.phone || "--" }, { l:"Status", v:"Active" }, { l:"Role", v:currentUser.role }].map(r => (
              <div key={r.l} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${C.g100}`, fontSize:14, fontFamily:FF }}>
                <span style={{ color:C.g500 }}>{r.l}</span>
                <span style={{ fontWeight:500 }}>{r.v}</span>
              </div>
            ))}
            <div style={{ marginTop:16 }}><Btn onClick={() => setShowPE(true)}>Request Profile Change</Btn></div>
          </div>
          {currentUser.role === ROLES.PENDING && (
            <div style={{ marginTop:16, background:C.warningL, border:`1px solid ${C.warning}30`, borderRadius:12, padding:16, textAlign:"center" }}>
              <div style={{ fontSize:14, color:C.warning, fontWeight:600, marginBottom:6, fontFamily:FF }}>Account Pending Activation</div>
              <a href="mailto:essa@alpha.com" style={{ color:C.accent, fontSize:13, fontWeight:500, fontFamily:FF }}>Contact your administrator</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}