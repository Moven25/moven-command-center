// src/components/LoadDocsPanel.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { listDocsForLoad, saveDocForLoad, deleteDoc, getDoc } from "../utils/docsStore";

const DOC_TYPES = ["Rate Con", "BOL", "POD", "Invoice", "Lumper", "Other"];

function fmtBytes(bytes = 0) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function fmtWhen(ms) {
  if (!ms) return "—";
  const d = new Date(ms);
  return d.toLocaleString([], { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function LoadDocsPanel({ loadId }) {
  const [docs, setDocs] = useState([]);
  const [busy, setBusy] = useState(false);
  const fileInputs = useRef({});

  const byType = useMemo(() => {
    const map = {};
    DOC_TYPES.forEach((t) => (map[t] = []));
    docs.forEach((d) => {
      const t = DOC_TYPES.includes(d.type) ? d.type : "Other";
      map[t].push(d);
    });
    return map;
  }, [docs]);

  async function refresh() {
    if (!loadId) return setDocs([]);
    const rows = await listDocsForLoad(loadId);
    setDocs(rows);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadId]);

  function openPicker(type) {
    const el = fileInputs.current[type];
    if (el) el.click();
  }

  async function onPickFile(type, e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-upload same file
    if (!file || !loadId) return;

    setBusy(true);
    try {
      await saveDocForLoad(loadId, type, file);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function onDownload(docId) {
    setBusy(true);
    try {
      const row = await getDoc(docId);
      if (!row?.blob) return;

      const url = URL.createObjectURL(row.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = row.name || "document";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(docId) {
    if (!docId) return;
    const ok = window.confirm("Delete this document?");
    if (!ok) return;
    setBusy(true);
    try {
      await deleteDoc(docId);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!loadId) {
    return <div className="loadcmd__detailEmpty">Select a load to manage documents.</div>;
  }

  return (
    <div className="loadcmd__docs">
      <div className="loadcmd__docsHeader">
        <div>
          <div className="loadcmd__docsTitle">Documents</div>
          <div className="loadcmd__docsSub">
            Upload + download Rate Con, BOL, POD, Invoice, and more. {busy ? "Working…" : ""}
          </div>
        </div>
      </div>

      {DOC_TYPES.map((type) => (
        <div key={type} className="loadcmd__docsBlock">
          <div className="loadcmd__docsBlockTop">
            <div className="loadcmd__docsType">{type}</div>

            <div>
              <input
                ref={(el) => (fileInputs.current[type] = el)}
                type="file"
                style={{ display: "none" }}
                onChange={(e) => onPickFile(type, e)}
              />
              <button className="command-shell__btn command-shell__btn--primary" type="button" onClick={() => openPicker(type)}>
                Upload {type}
              </button>
            </div>
          </div>

          {byType[type]?.length ? (
            <div className="loadcmd__docsList">
              {byType[type].map((d) => (
                <div key={d.id} className="loadcmd__docsRow">
                  <div className="loadcmd__docsMeta">
                    <div className="loadcmd__docsName">{d.name}</div>
                    <div className="loadcmd__docsSubMeta">
                      {fmtBytes(d.size)} · {fmtWhen(d.uploadedAt)}
                    </div>
                  </div>

                  <div className="loadcmd__docsActions">
                    <button className="command-shell__btn" type="button" onClick={() => onDownload(d.id)}>
                      Download
                    </button>
                    <button className="command-shell__btn" type="button" onClick={() => onDelete(d.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="loadcmd__docsEmpty">No {type} uploaded yet.</div>
          )}
        </div>
      ))}

      <div className="loadcmd__docsFoot">
        Stored locally in your browser (IndexedDB). Next step later: connect this to Zoho / S3 so documents sync across devices.
      </div>
    </div>
  );
}
