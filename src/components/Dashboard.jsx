import { useState } from "react";
import { C, FF, ROLES, AUDIT_ACTIONS, getCur, getAmt, getTitle, fmtAmt, fmtDate } from "../constants";
import { Badge, Av, IBox } from "./Primitives";

export default function Dashboard({ requests, staff, currentUser, notifications }) {
const canAll = currentUser.role !== ROLES.INITIATOR;
  const vis = canAll ? requests : requests.filter(r => r.initiatorId === currentUser.id);
  const pending         = vis.filter(r => r.status === "Pending").length;
  const pendingApproval = vis.filter(r => r.status === "Pending Approval").length;
  const approved        = vis.filter(r => r.status === "Approved").length;
  const processed       = vis.filter(r => r.status === "Processed").length;
  const totalAED = vis.filter(r => r.status === "Processed" && getCur(r) === "AED").reduce((s, r) => s + getAmt(r), 0);
  const myNotifs = notifications[currentUser.id] || [];

  const [insight, setInsight] = useState("");
  const [aiLoad, setAiLoad]   = useState(false);

  const ask = async (q) => {
  setAiLoad(true);
  setInsight("");
  try {
    const sum = vis.map(r => `${getTitle(r)}|${getAmt(r)} ${getCur(r)}|${r.status}|${r.type}`).join("\n");
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 700,
        system: `Financial analyst for Alpha HAS Finance Portal. Concise, professional. No markdown headers. User: ${currentUser.name} (${currentUser.role}).`,
        messages: [
          {
            role: "user",
            content: `Data:\n${sum}\n\nQuestion: ${q}`,
          },
        ],
      }),
    });
    const d = await res.json();
    setInsight(d.content?.[0]?.text || "No response.");
  } catch (e) {
    setInsight("Connection error.");
  }
  setAiLoad(false);
};
      const d = await res.json();
      setInsight(d.content?.[0]?.text || "No response.");
    } catch (e) { setInsight("Connection error."); }
    setAiLoad(false);
  };

  const CARDS = {
    [ROLES.SUPER]:        [{ l:"Total Requests", v:vis.length, c:C.accent }, { l:"Pending Approval", v:pending + pendingApproval, c:C.warning }, { l:"Approved", v:approved, c:"#0369a1" }, { l:"Processed (AED)", v:totalAED.toLocaleString(), c:C.success }],
    [ROLES.ACCOUNTANT]:   [{ l:"Awaiting Payment", v:approved, c:C.warning }, { l:"Processed", v:processed, c:C.success }, { l:"Pending Review", v:pending, c:"#0369a1" }, { l:"Total", v:vis.length, c:C.accent }],
    [ROLES.HOUSE_MANAGER]:[{ l:"Home Staff", v:staff.filter(s => s.staffType === "home" && s.active !== false).length, c:C.accent }, { l:"Home Payroll", v:staff.filter(s => s.staffType === "home" && s.active !== false).reduce((s, e) => s + e.baseSalary, 0).toLocaleString() + " AED", c:C.warning }, { l:"My Requests", v:vis.length, c:"#0369a1" }, { l:"Pending", v:pending, c:C.danger }],
    [ROLES.INITIATOR]:    [{ l:"My Requests", v:vis.length, c:C.accent }, { l:"Pending", v:pending, c:C.warning }, { l:"Approved", v:approved, c:"#0369a1" }, { l:"Processed", v:processed, c:C.success }],
    [ROLES.PENDING]:      [{ l:"Status", v:"Pending", c:C.g400 }, { l:"Access", v:"None", c:C.g400 }, { l:"", v:"", c:C.g400 }, { l:"", v:"", c:C.g400 }],
  };

  const quickActions = currentUser.role === ROLES.SUPER ? [
    pending > 0          && { label:`${pending} pending approval`,         color:C.warning },
    approved > 0         && { label:`${approved} awaiting processing`,     color:"#0369a1" },
    pendingApproval > 0  && { label:`${pendingApproval} new employee review`, color:C.purple },
  ].filter(Boolean) : [];

  return (
    <div>
      {myNotifs.slice().reverse().slice(0, 3).map((n, i) => (
        <div key={i} style={{ background:C.accentL, border:`1px solid ${C.accent}30`, borderRadius:8, padding:"9px 14px", marginBottom:6, fontSize:13, color:C.accent, display:"flex", alignItems:"center", gap:8, fontFamily:FF }}>
          <span style={{ fontWeight:600 }}>Update:</span>{n.message}
          <span style={{ marginLeft:"auto", color:C.g400, fontSize:11 }}>{fmtDate(n.at)}</span>
        </div>
      ))}

      {quickActions.length > 0 && (
        <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
          {quickActions.map((a, i) => (
            <div key={i} style={{ background:"#fff", border:`1px solid ${a.color}30`, borderRadius:10, padding:"10px 16px", display:"flex", alignItems:"center", gap:10, flex:1, minWidth:180 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:a.color, flexShrink:0 }} />
              <span style={{ fontSize:13, color:a.color, fontWeight:500, fontFamily:FF }}>{a.label}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ background:`linear-gradient(135deg,${C.accentL},#fdf5ff)`, border:`1px solid ${C.g200}`, borderRadius:12, padding:18, marginBottom:22 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
          <span style={{ color:C.brand, fontSize:15 }}>*</span>
          <span style={{ fontWeight:600, fontSize:14, color:C.brand, fontFamily:FF }}>AI Finance Assistant</span>
          <span style={{ marginLeft:"auto", fontSize:11, color:C.brand, background:C.accentL, padding:"2px 8px", borderRadius:10, fontFamily:FF }}>Claude</span>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:10 }}>
          {["Summarize pending payments", "Flag high-value risks", "Suggest cost optimizations", "Spending by location"].map(q => (
            <button key={q} onClick={() => ask(q)} style={{ background:"#fff", border:`1px solid ${C.g200}`, borderRadius:20, padding:"5px 12px", fontSize:12, color:C.brand, cursor:"pointer", fontFamily:FF }}>{q}</button>
          ))}
        </div>
        {aiLoad   && <div style={{ color:C.brand, fontSize:13, fontFamily:FF }}>Analyzing...</div>}
        {insight  && <div style={{ fontSize:13, color:C.g700, lineHeight:1.6, whiteSpace:"pre-wrap", background:"#fff", borderRadius:8, padding:12, border:`1px solid ${C.g200}`, fontFamily:FF }}>{insight}</div>}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:22 }}>
        {(CARDS[currentUser.role] || CARDS[ROLES.INITIATOR]).map(x => (
          <div key={x.l} style={{ background:"#fff", border:`1px solid ${C.g200}`, borderRadius:12, padding:"14px 18px" }}>
            <div style={{ fontSize:11, color:C.g400, marginBottom:3, fontFamily:FF }}>{x.l}</div>
            <div style={{ fontSize:22, fontWeight:700, color:x.c, fontFamily:FF }}>{x.v}</div>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize:14, fontWeight:600, color:C.g800, marginBottom:10, fontFamily:FF }}>Recent Activity</h3>
      {[...vis].reverse().slice(0, 6).map(r => (
        <div key={r.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 14px", background:C.g50, borderRadius:8, marginBottom:6, fontSize:13 }}>
          <span style={{ fontWeight:500, color:C.g800, fontFamily:FF }}>{getTitle(r)}</span>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <span style={{ color:C.g500, fontFamily:FF }}>{fmtAmt(getAmt(r), getCur(r))}</span>
            <Badge status={r.status} />
          </div>
        </div>
      ))}
    </div>
  );
}