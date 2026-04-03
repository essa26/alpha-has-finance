import { useState, useEffect } from "react";
import { C, FF, SOURCE_ACCOUNTS, getCur, getAmt, getTitle, fmtAmt } from "../constants";
import { Modal, Sel, Btn, FileUpload } from "./Primitives";
import { fetchFxRate } from "../lib/fx";

export default function ProcessModal({ req, onProcess, onClose }) {
const [src, setSrc]         = useState(req.sourceAccount || "");
  const [pf, setPf]           = useState(req.proofFiles || []);
  const [fxRate, setFxRate]   = useState(req.fxRate || null);
  const [fxLoading, setFxLoading] = useState(false);
  const [fxError, setFxError] = useState("");
  const currency = getCur(req);
  const isAED = currency === "AED";
  const amt = getAmt(req);
  const aedEquiv = fxRate ? Math.round(amt * fxRate * 100) / 100 : null;

  const loadFx = async () => {
    setFxLoading(true); setFxError("");
    const rate = await fetchFxRate(currency);
    if (rate) { setFxRate(rate); }
    else { setFxError("Could not fetch live rate. Please enter manually."); }
    setFxLoading(false);
  };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { if (!isAED && !fxRate) loadFx(); }, []);

  const go = () => {
    if (!src) return alert("Select a Source Bank Account.");
    if (!isAED && !fxRate) return alert("FX rate to AED is required before processing.");
    onProcess(req.id, src, pf, fxRate, aedEquiv);
    onClose();
  };

  return (
    <Modal title="Process Payment" onClose={onClose} width={500}>
      <div style={{ background:C.g50, borderRadius:8, padding:"10px 14px", marginBottom:14, fontSize:13, fontFamily:FF }}>
        <div style={{ fontWeight:600, color:C.g800, marginBottom:2 }}>{getTitle(req)}</div>
        <div style={{ color:C.g600 }}>{fmtAmt(amt, currency)}</div>
      </div>

      {!isAED && (
        <div style={{ background:"#fff", border:`1px solid ${C.g200}`, borderRadius:10, padding:"14px 16px", marginBottom:14 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.g700, marginBottom:10, fontFamily:FF }}>FX Rate Capture — {currency} to AED</div>
          <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
            <div style={{ flex:1 }}>
              <label style={{ display:"block", fontSize:12, color:C.g600, marginBottom:4, fontFamily:FF }}>1 {currency} = ? AED</label>
              <input
                type="number"
                step="0.0001"
                value={fxRate || ""}
                onChange={e => setFxRate(Number(e.target.value) || null)}
                placeholder="e.g. 4.6729"
                style={{ width:"100%", padding:"8px 12px", border:`1px solid ${C.g300}`, borderRadius:8, fontSize:14, fontFamily:FF, boxSizing:"border-box" }}
              />
            </div>
            <Btn onClick={loadFx} style={{ padding:"8px 14px", fontSize:12, marginBottom:0, whiteSpace:"nowrap" }}>
              {fxLoading ? "Fetching..." : "Get Live Rate"}
            </Btn>
          </div>
          {fxError && <div style={{ fontSize:12, color:C.danger, marginTop:6, fontFamily:FF }}>{fxError}</div>}
          {fxRate && aedEquiv && (
            <div style={{ marginTop:10, background:C.successL, border:`1px solid ${C.success}30`, borderRadius:8, padding:"8px 12px", fontSize:13, fontFamily:FF }}>
              <span style={{ color:C.g600 }}>AED Equivalent: </span>
              <strong style={{ color:C.success }}>{aedEquiv.toLocaleString()} AED</strong>
              <span style={{ color:C.g400, marginLeft:8, fontSize:11 }}>at rate {fxRate} · {new Date().toLocaleDateString("en-GB")}</span>
            </div>
          )}
        </div>
      )}

      <Sel label="Source Bank Account *" value={src} onChange={e => setSrc(e.target.value)} options={[{ value:"", label:"-- Select Account --" }, ...SOURCE_ACCOUNTS]} />
      <FileUpload label="Proof of Payment" files={pf} onAdd={f => setPf(p => [...p, f])} />
      <div style={{ display:"flex", gap:10, marginTop:4 }}>
        <Btn variant="primary" onClick={go} style={{ flex:1, padding:"10px 0", fontWeight:600 }}>Confirm Processed</Btn>
        <Btn onClick={onClose} style={{ padding:"10px 20px" }}>Cancel</Btn>
      </div>
    </Modal>
  );
}