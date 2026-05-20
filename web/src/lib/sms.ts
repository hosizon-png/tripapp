import { db } from "./db";
import crypto from "crypto";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendSmsCode(params: {
  phone: string;
  type: string;
  ip?: string;
}): Promise<{ success: boolean; message: string }> {
  const { phone, type, ip } = params;

  if (ip) {
    const hourAgo = new Date(Date.now() - 3600000).toISOString();
    const r = db.prepare("SELECT COUNT(*) as c FROM SmsCode WHERE ip=? AND createdAt>=?").get(ip, hourAgo) as any;
    if (r?.c >= 5) return { success: false, message: "发送过于频繁，请稍后再试" };
  }

  const dayAgo = new Date(Date.now() - 86400000).toISOString();
  const pr = db.prepare("SELECT COUNT(*) as c FROM SmsCode WHERE phone=? AND createdAt>=?").get(phone, dayAgo) as any;
  if (pr?.c >= 10) return { success: false, message: "今日发送次数已达上限" };

  const minAgo = new Date(Date.now() - 60000).toISOString();
  if (db.prepare("SELECT id FROM SmsCode WHERE phone=? AND createdAt>=? LIMIT 1").get(phone, minAgo)) {
    return { success: false, message: "请60秒后再试" };
  }

  const code = generateCode();
  console.log(`[SMS] Code ${code} -> ${phone}`);

  db.prepare("INSERT INTO SmsCode (id,phone,code,type,ip,expiresAt) VALUES (?,?,?,?,?,?)").run(
    crypto.randomUUID(), phone, code, type, ip || null,
    new Date(Date.now() + 300000).toISOString()
  );
  return { success: true, message: "验证码已发送" };
}

export async function verifySmsCode(phone: string, code: string, type: string) {
  const now = new Date().toISOString();
  const record = db.prepare(
    "SELECT id FROM SmsCode WHERE phone=? AND code=? AND type=? AND used=0 AND expiresAt>=? ORDER BY createdAt DESC LIMIT 1"
  ).get(phone, code, type, now) as any;

  if (!record) return { success: false, message: "验证码无效或已过期" };
  db.prepare("UPDATE SmsCode SET used=1 WHERE id=?").run(record.id);
  return { success: true, message: "验证成功" };
}
