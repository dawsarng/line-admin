/**
 * ระบบประเมินพนักงาน — Backend (Google Apps Script)
 * ------------------------------------------------------------------
 * กันซ้ำ 2 ชั้น:
 *   1) โทเคน (t)     : 1 ลิงก์ ประเมินได้ครั้งเดียว
 *   2) LINE User ID  : 1 คน ประเมินพนักงานคนเดิมซ้ำได้ "เมื่อผ่านไปแล้ว 24 ชั่วโมง"
 *
 * doPost                        = บันทึกผล (ตรวจซ้ำก่อนบันทึก)
 * doGet                         = ส่งข้อมูลให้หน้าสรุปผล
 * doGet ?check=โทเคน            = โทเคนนี้ถูกใช้แล้วหรือยัง
 * doGet ?checkUser=UID&emp=ชื่อ = คนนี้เพิ่งประเมินพนักงานคนนี้ภายใน 24 ชม.หรือยัง
 *
 * ติดตั้ง: ส่วนขยาย → Apps Script → วางโค้ดนี้ → Deploy เป็น Web app
 *          (Execute as: Me | Who has access: Anyone) → เอา URL ไปใส่ API_URL
 */

const SHEET_ID   = '1sA_y-vYPWIM6V87oSqQmCEdBG0muHssZdhu262UN2sQ';
const SHEET_NAME = 'ผลประเมิน';

// ระยะเวลาที่ต้องรอก่อนประเมินคนเดิมซ้ำได้ (ชั่วโมง) — แก้ตัวเลขนี้เพื่อเปลี่ยนช่วงเวลา
const COOLDOWN_HOURS = 12;
const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;

const HEADERS = [
  'เวลา', 'พนักงาน',
  'ความสุภาพ', 'ความรวดเร็ว', 'ความรู้ความชำนาญ', 'การแก้ปัญหา', 'ความประทับใจโดยรวม',
  'คะแนนเฉลี่ย', 'ความเห็น', 'โทเคน', 'LINE User ID'
];
const TIME_COL  = 1;    // A = เวลา
const EMP_COL   = 2;    // B = พนักงาน
const TOKEN_COL = 10;   // J = โทเคน
const USER_COL  = 11;   // K = LINE User ID

function getSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

/** โทเคนนี้ถูกใช้ไปแล้วหรือยัง */
function isTokenUsed(token) {
  if (!token) return false;
  const sh = getSheet(), last = sh.getLastRow();
  if (last < 2) return false;
  const col = sh.getRange(2, TOKEN_COL, last - 1, 1).getValues();
  for (let i = 0; i < col.length; i++) if (String(col[i][0]) === String(token)) return true;
  return false;
}

/** ผู้ใช้คนนี้ "เพิ่งประเมิน" พนักงานคนนี้ภายในช่วง 24 ชม.หรือยัง */
function userRecentlyDone(userId, employee) {
  if (!userId) return false;
  const sh = getSheet(), last = sh.getLastRow();
  if (last < 2) return false;
  const rows = sh.getRange(2, 1, last - 1, USER_COL).getValues();   // อ่าน A..K
  const now = Date.now();
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const uid = r[USER_COL - 1];
    const emp = r[EMP_COL - 1];
    if (String(uid) === String(userId) && String(emp) === String(employee)) {
      const t  = r[TIME_COL - 1];
      const ts = (t instanceof Date) ? t.getTime() : new Date(t).getTime();
      if (!isNaN(ts) && (now - ts) < COOLDOWN_MS) return true;   // ยังไม่ครบ 24 ชม.
    }
  }
  return false;
}

/** บันทึกผลประเมิน */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const d = JSON.parse(e.postData.contents);

    if (d.token && isTokenUsed(d.token))                    return jsonOut({ ok: false, reason: 'used' });
    if (d.userId && userRecentlyDone(d.userId, d.employee)) return jsonOut({ ok: false, reason: 'duplicate_user' });

    getSheet().appendRow([
      new Date(),
      d.employee || '',
      d.courtesy, d.speed, d.knowledge, d.solving, d.overall,
      d.average,
      d.comment || '',
      d.token  || '',
      d.userId || ''
    ]);
    return jsonOut({ ok: true });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

/** ส่งข้อมูล / ตรวจซ้ำ */
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.check)     return jsonOut({ ok: true, used: isTokenUsed(p.check) });
  if (p.checkUser) return jsonOut({ ok: true, done: userRecentlyDone(p.checkUser, p.emp || '') });

  const values = getSheet().getDataRange().getValues();
  const rows = values.slice(1).map(function (r) {
    return {
      time: r[0], employee: r[1],
      courtesy: r[2], speed: r[3], knowledge: r[4], solving: r[5], overall: r[6],
      average: r[7], comment: r[8]
    };
  });
  return jsonOut({ ok: true, rows: rows });
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
