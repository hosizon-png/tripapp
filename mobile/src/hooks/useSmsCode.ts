import { useState, useCallback } from "react";
import { apiRequest } from "@/lib/api";

export function useSmsCode() {
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");

  const sendCode = useCallback(async (phone: string, type: "login" | "register") => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError("请输入正确的手机号");
      return false;
    }
    setError("");
    try {
      await apiRequest("/api/auth/send-sms", {
        method: "POST", body: { phone, type }, requireAuth: false,
      });
      setCountdown(60);
      const t = setInterval(() => setCountdown((c) => {
        if (c <= 1) { clearInterval(t); return 0; }
        return c - 1;
      }), 1000);
      return true;
    } catch (e: any) {
      setError(e.message || "发送失败");
      return false;
    }
  }, []);

  return { countdown, error, setError, sendCode };
}
