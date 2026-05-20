import { db } from "./db";
import crypto from "crypto";

const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

// ---- User ----
export function findUserByPhone(phone: string) {
  return db.prepare("SELECT * FROM User WHERE phone = ?").get(phone) as any;
}
export function createUser(data: { phone: string; name?: string; passwordHash?: string }) {
  const id = uid();
  db.prepare("INSERT INTO User (id,phone,phoneVerified,name,passwordHash) VALUES (?,?,1,?,?)").run(
    id, data.phone, data.name || `用户${data.phone.slice(-4)}`, data.passwordHash || null
  );
  return db.prepare("SELECT * FROM User WHERE id = ?").get(id) as any;
}
export function findUserById(id: string) {
  return db.prepare("SELECT id,phone,name,avatarUrl,createdAt FROM User WHERE id=?").get(id) as any;
}

// ---- Subscription ----
export function getSubscription(userId: string) {
  return db.prepare("SELECT * FROM Subscription WHERE userId=?").get(userId) as any;
}
export function createFreeSubscription(userId: string) {
  db.prepare("INSERT INTO Subscription (id,userId,tier) VALUES (?,?,'free')").run(uid(), userId);
}

// ---- Refresh Token ----
export function createRefreshToken(userId: string, token: string, device?: string) {
  db.prepare("INSERT INTO RefreshToken (id,userId,token,device,expiresAt) VALUES (?,?,?,?,?)").run(
    uid(), userId, token, device || null,
    new Date(Date.now() + 30 * 86400000).toISOString()
  );
}
export function findRefreshToken(token: string) {
  return db.prepare("SELECT * FROM RefreshToken WHERE token=?").get(token) as any;
}
export function deleteRefreshToken(token: string) {
  db.prepare("DELETE FROM RefreshToken WHERE token=?").run(token);
}
export function deleteUserRefreshTokens(userId: string) {
  db.prepare("DELETE FROM RefreshToken WHERE userId=?").run(userId);
}

// ---- Trip ----
export function findUserTrips(userId: string) {
  return db.prepare(
    `SELECT t.*, (SELECT COUNT(*) FROM ItineraryItem WHERE tripId=t.id) as itemCount
     FROM Trip t WHERE t.userId=? ORDER BY t.updatedAt DESC`
  ).all(userId) as any[];
}
export function findTrip(id: string, userId?: string) {
  const q = userId
    ? "SELECT * FROM Trip WHERE id=? AND userId=?"
    : "SELECT * FROM Trip WHERE id=?";
  return userId ? db.prepare(q).get(id, userId) as any : db.prepare(q).get(id) as any;
}
export function createTrip(data: { userId: string; title: string; description?: string; destination?: string; coverImage?: string; startDate?: string; endDate?: string; lat?: number; lng?: number }) {
  const id = uid();
  db.prepare(
    `INSERT INTO Trip (id,userId,title,description,destination,coverImage,startDate,endDate,lat,lng)
     VALUES (?,?,?,?,?,?,?,?,?,?)`
  ).run(id, data.userId, data.title, data.description || null, data.destination || null,
    data.coverImage || null, data.startDate || null, data.endDate || null, data.lat || null, data.lng || null);
  return db.prepare("SELECT * FROM Trip WHERE id=?").get(id) as any;
}
export function updateTrip(id: string, data: Record<string, any>) {
  const sets: string[] = [];
  const vals: any[] = [];
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) { sets.push(`${k}=?`); vals.push(v); }
  }
  if (sets.length === 0) return;
  vals.push(id);
  db.prepare(`UPDATE Trip SET ${sets.join(",")} WHERE id=?`).run(...vals);
}
export function deleteTrip(id: string) {
  db.prepare("DELETE FROM Trip WHERE id=?").run(id);
}
export function countUserTrips(userId: string) {
  return (db.prepare("SELECT COUNT(*) as c FROM Trip WHERE userId=?").get(userId) as any)?.c || 0;
}

// ---- Itinerary Items ----
export function findTripItems(tripId: string) {
  return db.prepare(
    "SELECT * FROM ItineraryItem WHERE tripId=? ORDER BY dayNumber ASC, orderIndex ASC"
  ).all(tripId) as any[];
}
export function createItem(data: { tripId: string; dayNumber: number; type: string; title: string; startTime?: string; endTime?: string; locationName?: string; bookingRef?: string; notes?: string }) {
  const id = uid();
  const last = db.prepare(
    "SELECT orderIndex FROM ItineraryItem WHERE tripId=? AND dayNumber=? ORDER BY orderIndex DESC LIMIT 1"
  ).get(data.tripId, data.dayNumber) as any;
  const orderIndex = (last?.orderIndex ?? -1) + 1;
  db.prepare(
    `INSERT INTO ItineraryItem (id,tripId,dayNumber,type,title,startTime,endTime,locationName,bookingRef,notes,orderIndex)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`
  ).run(id, data.tripId, data.dayNumber, data.type, data.title, data.startTime || null,
    data.endTime || null, data.locationName || null, data.bookingRef || null, data.notes || null, orderIndex);
  return db.prepare("SELECT * FROM ItineraryItem WHERE id=?").get(id) as any;
}
export function updateItem(id: string, data: Record<string, any>) {
  const sets: string[] = [];
  const vals: any[] = [];
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) { sets.push(`${k}=?`); vals.push(v); }
  }
  if (sets.length === 0) return;
  vals.push(id);
  sets.push("updatedAt=?");
  vals.push(now());
  db.prepare(`UPDATE ItineraryItem SET ${sets.join(",")} WHERE id=?`).run(...vals);
}
export function deleteItem(id: string) {
  db.prepare("DELETE FROM ItineraryItem WHERE id=?").run(id);
}
export function countTripItems(tripId: string) {
  return (db.prepare("SELECT COUNT(*) as c FROM ItineraryItem WHERE tripId=?").get(tripId) as any)?.c || 0;
}
export function findItemOwner(itemId: string, tripId: string): string | null {
  const r = db.prepare(
    "SELECT t.userId FROM ItineraryItem i JOIN Trip t ON i.tripId=t.id WHERE i.id=? AND i.tripId=?"
  ).get(itemId, tripId) as any;
  return r?.userId || null;
}

// ---- Share ----
export function findTripByShareToken(token: string) {
  return db.prepare("SELECT * FROM Trip WHERE shareToken=? AND isPublic=1").get(token) as any;
}
export function setShareToken(tripId: string, token: string) {
  db.prepare("UPDATE Trip SET shareToken=?, isPublic=1 WHERE id=?").run(token, tripId);
}
export function disableShare(tripId: string) {
  db.prepare("UPDATE Trip SET isPublic=0 WHERE id=?").run(tripId);
}

// ---- Documents ----
export function findTripDocuments(tripId: string) {
  return db.prepare("SELECT * FROM Document WHERE tripId=? ORDER BY createdAt DESC").all(tripId) as any[];
}
export function createDocument(data: { tripId: string; name: string; fileUrl: string; fileType: string; category?: string; itineraryItemId?: string }) {
  const id = uid();
  db.prepare("INSERT INTO Document (id,tripId,name,fileUrl,fileType,category,itineraryItemId) VALUES (?,?,?,?,?,?,?)").run(
    id, data.tripId, data.name, data.fileUrl, data.fileType, data.category || "other", data.itineraryItemId || null
  );
  return db.prepare("SELECT * FROM Document WHERE id=?").get(id) as any;
}
export function deleteDocument(id: string) {
  db.prepare("DELETE FROM Document WHERE id=?").run(id);
}
export function totalUserStorage(userId: string): number {
  const r = db.prepare(
    "SELECT COALESCE(SUM(d.fileSize),0) as total FROM Document d JOIN Trip t ON d.tripId=t.id WHERE t.userId=?"
  ).get(userId) as any;
  return r?.total || 0;
}

// ---- CheckLists ----
export function findTripChecklists(tripId: string) {
  return db.prepare("SELECT * FROM Checklist WHERE tripId=?").all(tripId) as any[];
}
export function findChecklistItems(checklistId: string) {
  return db.prepare("SELECT * FROM ChecklistItem WHERE checklistId=? ORDER BY orderIndex").all(checklistId) as any[];
}
export function createChecklist(tripId: string, title: string, items: { content: string }[]) {
  const cid = uid();
  db.prepare("INSERT INTO Checklist (id,tripId,title) VALUES (?,?,?)").run(cid, tripId, title);
  items.forEach((item, i) => {
    db.prepare("INSERT INTO ChecklistItem (id,checklistId,content,orderIndex) VALUES (?,?,?,?)").run(uid(), cid, item.content, i);
  });
  return cid;
}

// ---- Expenses ----
export function findTripExpenses(tripId: string) {
  return db.prepare("SELECT * FROM Expense WHERE tripId=? ORDER BY date DESC").all(tripId) as any[];
}

// ---- Payment ----
export function createPaymentOrder(data: { userId: string; tier: string; period: string; amount: number }) {
  const id = uid();
  db.prepare("INSERT INTO PaymentOrder (id,userId,tier,period,amount) VALUES (?,?,?,?,?)").run(
    id, data.userId, data.tier, data.period, data.amount
  );
  return id;
}
export function markOrderPaid(orderId: string, tradeNo: string) {
  db.prepare("UPDATE PaymentOrder SET status='paid', tradeNo=?, paidAt=? WHERE id=?").run(tradeNo, now(), orderId);
  const order = db.prepare("SELECT * FROM PaymentOrder WHERE id=?").get(orderId) as any;
  if (!order) return;
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + (order.period === "yearly" ? 12 : 1));
  const sub = db.prepare("SELECT id FROM Subscription WHERE userId=?").get(order.userId) as any;
  if (sub) {
    db.prepare("UPDATE Subscription SET tier=?, startDate=?, endDate=?, orderId=? WHERE userId=?").run(
      order.tier, now(), endDate.toISOString(), orderId, order.userId
    );
  } else {
    db.prepare("INSERT INTO Subscription (id,userId,tier,startDate,endDate,orderId) VALUES (?,?,?,?,?)").run(
      uid(), order.userId, order.tier, now(), endDate.toISOString(), orderId
    );
  }
}

// ---- Admin ----
export function listUsers(limit = 50) {
  return db.prepare(
    "SELECT u.id,u.phone,u.name,u.createdAt,s.tier,s.endDate FROM User u LEFT JOIN Subscription s ON u.id=s.userId ORDER BY u.createdAt DESC LIMIT ?"
  ).all(limit) as any[];
}
export function listOrders(limit = 50) {
  return db.prepare("SELECT * FROM PaymentOrder ORDER BY createdAt DESC LIMIT ?").all(limit) as any[];
}
export function countPaidOrders() {
  return (db.prepare("SELECT COUNT(*) as c FROM PaymentOrder WHERE status='paid'").get() as any)?.c || 0;
}
export function countUsers() {
  return (db.prepare("SELECT COUNT(*) as c FROM User").get() as any)?.c || 0;
}
export function countByTier(tier: string) {
  return (db.prepare("SELECT COUNT(*) as c FROM Subscription WHERE tier=?").get(tier) as any)?.c || 0;
}
export function totalRevenue() {
  return (db.prepare("SELECT COALESCE(SUM(amount),0) as total FROM PaymentOrder WHERE status='paid'").get() as any)?.total || 0;
}
