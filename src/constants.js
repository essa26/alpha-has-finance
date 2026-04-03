export const ROLES = { SUPER:"Super User", ACCOUNTANT:"Accountant", HOUSE_MANAGER:"House Manager", INITIATOR:"Initiator", PENDING:"Pending" };
export const ROLE_ORDER = [ROLES.SUPER, ROLES.ACCOUNTANT, ROLES.HOUSE_MANAGER, ROLES.INITIATOR, ROLES.PENDING];
export const ROLE_COLORS = { [ROLES.SUPER]:"#6b0075", [ROLES.ACCOUNTANT]:"#0369a1", [ROLES.HOUSE_MANAGER]:"#059669", [ROLES.INITIATOR]:"#374151", [ROLES.PENDING]:"#9ca3af" };
export const LOCATIONS = ["UAE","UK","EU","USA","Other (Expenses)","Other (Travel)"];
export const CURRENCIES = ["AED","USD","GBP","EUR","KWD"];
export const SOURCE_ACCOUNTS = [
  "Essa - Mashreq","Essa - ADCB","Essa - ENBD","Essa - Barclays",
  "Amira - ENBD","Amira - ADCB","Amira - Mashreq",
  "AHAS Capital - JPM","Amira - Citi",
  "Alpha HAS - Emirates NBD","Alpha HAS - ADCB","Alpha HAS - Barclays","Alpha HAS - UBS","Alpha HAS - NBK",
];
export const NON_SAL_TYPES = [
  "Construction","Renovation","Purchase","Maintenance & Repairs","Utilities",
  "Groceries & Provisions","Cleaning Services","Security Services","Landscaping",
  "Travel & Accommodation","Dining & Entertainment","Health & Medical",
  "Legal Fees","Consultancy Fees","Vehicle & Transport","IT & Technology",
  "Subscriptions","Gifts & Donations","Education","Insurance",
];
export const ALL_TYPES = [...NON_SAL_TYPES, "Salary"];
export const FREQUENCIES = ["Weekly","Monthly","Quarterly","Annually"];
export const PAY_METHODS = ["Bank Transfer (WPS)","Bank Transfer (Non-WPS)","Cash","Cheque"];
export const CLOSED = ["Processed","Cancelled","Rejected"];
export const FF = "'DM Sans', sans-serif";

export const STATUS_META = {
  Pending:           { bg:"#fffbeb", text:"#92400e", border:"#fcd34d" },
  Approved:          { bg:"#eff6ff", text:"#1e40af", border:"#93c5fd" },
  Processed:         { bg:"#f0fdf4", text:"#166534", border:"#86efac" },
  Cancelled:         { bg:"#fef2f2", text:"#991b1b", border:"#fca5a5" },
  Rejected:          { bg:"#fef2f2", text:"#991b1b", border:"#fca5a5" },
  "Pending Approval":{ bg:"#fdf4ff", text:"#6b21a8", border:"#d8b4fe" },
};

export const C = {
  accent:"#6b0075", accentL:"#f5eaf7", success:"#16a34a", successL:"#f0fdf4",
  warning:"#d97706", warningL:"#fffbeb", danger:"#dc2626", dangerL:"#fef2f2",
  purple:"#6b0075", purpleL:"#f5eaf7",
  g50:"#faf7fb", g100:"#f2eaf4", g200:"#e4d4e8", g300:"#c9a8d0",
  g400:"#9e78a8", g500:"#7a5a84", g600:"#5c3d66", g700:"#3d2248", g800:"#260133",
  primary:"#3d0040", brand:"#6b0075", brandLight:"#ecdff0",
};

export const AUDIT_ACTIONS = {
  CREATE_REQUEST:"Create Request", UPDATE_REQUEST:"Update Request", DELETE_REQUEST:"Delete Request",
  APPROVE_REQUEST:"Approve Request", REJECT_REQUEST:"Reject Request", PROCESS_REQUEST:"Process Request",
  CANCEL_REQUEST:"Cancel Request", UPDATE_USER_ROLE:"Update User Role", DELETE_USER:"Delete User",
  INVITE_USER:"Invite User", APPROVE_NEW_STAFF:"Approve New Staff", REJECT_NEW_STAFF:"Reject New Staff",
  UPDATE_STAFF:"Update Staff", APPROVE_PROFILE:"Approve Profile Change", REJECT_PROFILE:"Reject Profile Change",
  REQUEST_PROFILE_CHANGE:"Request Profile Change", ADD_COMMENT:"Add Comment", LOCK_PAYROLL:"Lock Payroll",
};

export const INIT_USERS = [
  { id:"u1", name:"Essa Al-Qattan",  email:"essa@alpha.com",   role:ROLES.SUPER,         avatar:"EA", active:true,  phone:"+971 50 000 0001" },
  { id:"u2", name:"Sarah Finance",   email:"sarah@alpha.com",  role:ROLES.ACCOUNTANT,    avatar:"SF", active:true,  phone:"+971 50 000 0002" },
  { id:"u3", name:"Mohammed HM",     email:"mo@alpha.com",     role:ROLES.HOUSE_MANAGER, avatar:"MH", active:true,  phone:"+971 50 000 0003" },
  { id:"u4", name:"Layla Initiator", email:"layla@alpha.com",  role:ROLES.INITIATOR,     avatar:"LI", active:true,  phone:"+971 50 000 0004" },
  { id:"u5", name:"Pending User",    email:"new@alpha.com",    role:ROLES.PENDING,       avatar:"PU", active:false, phone:"" },
];

export const INIT_STAFF = [
  { id:"s1", name:"Ahmad Hassan",       designation:"Head Butler",    iban:"AE070331234567890123456", joiningDate:"2021-03-15", baseSalary:12000, housingAllowance:2000, transportAllowance:500,  otherAllowance:0,   currency:"AED", deductions:[], bonus:0,    paymentMethod:"Bank Transfer (WPS)",     active:true, staffType:"home" },
  { id:"s2", name:"Maria Santos",       designation:"Head Chef",      iban:"AE120441234567890123456", joiningDate:"2020-07-01", baseSalary:9500,  housingAllowance:1500, transportAllowance:500,  otherAllowance:300, currency:"AED", deductions:[], bonus:500,  paymentMethod:"Bank Transfer (WPS)",     active:true, staffType:"home" },
  { id:"s3", name:"James Park",         designation:"Driver",         iban:"AE550551234567890123456", joiningDate:"2022-11-20", baseSalary:6000,  housingAllowance:1000, transportAllowance:800,  otherAllowance:0,   currency:"AED", deductions:[{desc:"Late arrival",amount:300,month:"2025-04"}], bonus:0, paymentMethod:"Bank Transfer (Non-WPS)", active:true, staffType:"home" },
  { id:"s4", name:"Fatima Al-Ali",      designation:"Housekeeper",    iban:"AE340661234567890123456", joiningDate:"2023-01-10", baseSalary:5500,  housingAllowance:1000, transportAllowance:300,  otherAllowance:0,   currency:"AED", deductions:[], bonus:200,  paymentMethod:"Cash",                    active:true, staffType:"home" },
  { id:"s5", name:"Khalid Al-Mansoori", designation:"COO",            iban:"AE180221234567890123456", joiningDate:"2022-01-01", baseSalary:55000, housingAllowance:8000, transportAllowance:2000, otherAllowance:0,   currency:"AED", deductions:[], bonus:5000, paymentMethod:"Bank Transfer (WPS)",     active:true, staffType:"corporate" },
  { id:"s6", name:"Noor Al-Rashidi",    designation:"Finance Manager", iban:"AE290331234567890123456", joiningDate:"2022-06-15", baseSalary:32000, housingAllowance:5000, transportAllowance:1500, otherAllowance:500, currency:"AED", deductions:[], bonus:2000, paymentMethod:"Bank Transfer (WPS)",     active:true, staffType:"corporate" },
  { id:"s7", name:"Tariq Hassan",       designation:"Legal Counsel",  iban:"AE410441234567890123456", joiningDate:"2023-03-01", baseSalary:28000, housingAllowance:4500, transportAllowance:1000, otherAllowance:0,   currency:"AED", deductions:[], bonus:1500, paymentMethod:"Bank Transfer (Non-WPS)", active:true, staffType:"corporate" },
];

export const INIT_REQS = [
  { id:"req001", title:"Monthly Villa Maintenance",   amount:15000,  currency:"AED", status:"Pending",   initiatorId:"u4", initiatorName:"Layla Initiator", location:"UAE", type:"Maintenance & Repairs", isRecurring:true,  frequency:"Monthly",   approvalFiles:[], proofFiles:[], sourceAccount:"", processedDate:"", processingHistory:[], createdAt:"2025-04-01", salarySubType:"", staffRef:"", comments:[] },
  { id:"req002", title:"Luxury Furniture Purchase",   amount:48500,  currency:"AED", status:"Approved",  initiatorId:"u4", initiatorName:"Layla Initiator", location:"UAE", type:"Purchase",              isRecurring:false, frequency:"",          approvalFiles:[], proofFiles:[], sourceAccount:"", processedDate:"", processingHistory:[], createdAt:"2025-03-28", salarySubType:"", staffRef:"", comments:[] },
  { id:"req003", title:"Construction Phase 2 - Pool", amount:225000, currency:"AED", status:"Processed", initiatorId:"u2", initiatorName:"Sarah Finance",   location:"UAE", type:"Construction",          isRecurring:false, frequency:"",          approvalFiles:[], proofFiles:["Receipt.pdf"], sourceAccount:"AHAS Capital - JPM", processedDate:"2025-03-25", processingHistory:[{date:"2025-03-25",account:"AHAS Capital - JPM",by:"Sarah Finance"}], createdAt:"2025-03-20", salarySubType:"", staffRef:"", comments:[] },
  { id:"req004", title:"London Apartment Utilities",  amount:3200,   currency:"GBP", status:"Pending",   initiatorId:"u4", initiatorName:"Layla Initiator", location:"UK",  type:"Utilities",             isRecurring:true,  frequency:"Quarterly", approvalFiles:[], proofFiles:[], sourceAccount:"", processedDate:"", processingHistory:[], createdAt:"2025-04-01", salarySubType:"", staffRef:"", comments:[] },
];

export const INIT_INVITES = [
  { id:"inv1", email:"finance2@alpha.com", role:ROLES.ACCOUNTANT, sentAt:"2025-04-01", status:"pending" },
];

export let _rid = 400;
export const gid = (p = "r") => `${p}_${_rid++}`;

export function mkAudit(action, actor, details = "") {
  return { id:gid("a"), action, actor:actor.name, actorId:actor.id, actorRole:actor.role, details, timestamp:new Date().toISOString() };
}

export function calcLeave(d) {
  if (!d) return { daysActive:0, leaveAccrued:0, leaveNote:"--" };
  const ms = new Date() - new Date(d);
  const da = Math.max(0, Math.floor(ms / 86400000));
  const y = da / 365.25;
  return {
    daysActive: da,
    leaveAccrued: y < 1 ? parseFloat((y * 24).toFixed(1)) : parseFloat((y * 30).toFixed(1)),
    leaveNote: y < 1 ? "2 days/month (<1yr)" : "30 days/year (1yr+)",
  };
}

export function tenure(d) {
  if (!d) return "--";
  const ms = new Date() - new Date(d);
  const y = Math.floor(ms / (365.25 * 86400000));
  const m = Math.floor((ms % (365.25 * 86400000)) / (30.44 * 86400000));
  return y > 0 ? `${y}y ${m}m` : `${m}m`;
}

export function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "--";
}
export function fmtAmt(v, cur = "AED") { return `${Number(v || 0).toLocaleString()} ${cur}`; }
export function curMonth() { return new Date().toISOString().slice(0, 7); }
export function getAmt(r) { return Number(r.amount || r.reimburseAmount || r.newBaseSalary || 0); }
export function getCur(r) { return r.currency || r.reimburseCurrency || "AED"; }
export function getTitle(r) { return r.title || r.newName || r.staffName || "Payroll Entry"; }
export function toB64(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res({ name:file.name, size:file.size, data:reader.result, uploadedAt:new Date().toISOString() });
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}