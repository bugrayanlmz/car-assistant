import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function FileItem({ file }) {
  const isOk = file.durum === "ok";
  const isErr = file.durum === "err";
  
  const icon = isOk ? <CheckCircle2 size={14} /> : isErr ? <AlertCircle size={14} /> : <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />;
  const label = isOk ? file.bilgi : isErr ? "error" : "…";

  return (
    <div className="file-item">
      <span className="file-icon" style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
      <span className="file-name">{file.isim}</span>
      <span className={`file-status ${file.durum}`}>{label}</span>
    </div>
  );
}
