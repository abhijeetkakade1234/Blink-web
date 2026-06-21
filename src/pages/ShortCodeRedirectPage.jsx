import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { getApiBaseUrl } from "../api/urlApi";

export default function ShortCodeRedirectPage() {
  const { code } = useParams();

  useEffect(() => {
    if (!code) return;
    window.location.replace(`${getApiBaseUrl()}/${code}`);
  }, [code]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb] px-6 text-center">
      <div>
        <div className="text-2xl font-semibold text-slate-900">Redirecting...</div>
        <p className="mt-3 text-sm text-slate-500">Taking you to the original destination.</p>
      </div>
    </div>
  );
}
