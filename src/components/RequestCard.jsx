import { useState } from "react";
import { C, FF, ROLES, CLOSED, AUDIT_ACTIONS, getCur, getAmt, getTitle, fmtAmt, fmtDate } from "../constants";
import { Badge, Btn, Confirm } from "./Primitives";
import { Modal } from "./Primitives";
import ReqForm from "./RequestForm";
import ProcessModal from "./ProcessModal";

export default function ReqCard({ req, currentUser, onUpdate, onDelete, staff, addAudit, onNotify }) {
  // paste the full function body from the artifact
}