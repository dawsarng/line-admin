/* =====================================================================
   ⚙️  ตั้งค่าระบบ  —  แก้แค่ไฟล์นี้ไฟล์เดียว
   ===================================================================== */
const CONFIG = {

  // (1) URL ของ Apps Script Web App ที่ deploy แล้ว (ลงท้ายด้วย /exec)
  API_URL: 'https://script.google.com/macros/s/AKfycbw2sNjm14-XIlQ2lXfU8VvHuLsKT45s1vJKtz0Z_Lq6nizb61V7SiEmEV70L9fg8O4XSw/exec',

  // (2) LIFF ID ของ "หน้าฟอร์ม" (form.html)  — ใช้ดึง LINE User ID เพื่อกันคนเดิมประเมินซ้ำ
  //     สร้างใน LINE Developers Console โดยตั้ง Endpoint URL = FORM_BASE_URL ด้านล่าง
  //     ถ้าเว้นว่าง '' = ไม่กันระดับบุคคล (กันได้แค่ระดับลิงก์ด้วยโทเคน)
  FORM_LIFF_ID: '2010274275-wNnbtQ9v',

  // (3) URL ของหน้าฟอร์มลูกค้า (ใช้เป็น Endpoint ของ LIFF และเป็นลิงก์สำรอง)
  FORM_BASE_URL: 'https://dawsarng.github.io/line-admin/form.html',

  // (4) รหัสผ่านเข้าหน้าสรุปผล (dashboard) — เว้นว่าง '' = ไม่ต้องใส่รหัส
  DASHBOARD_PASSCODE: '',

  // (5) รายชื่อพนักงาน
  EMPLOYEES: ['น้องแนน', 'พี่โอ๊ต', 'คุณมิ้นท์'],

  // (6) หัวข้อที่ให้คะแนน (key ต้องตรงกับใน Code.gs)
  CATEGORIES: [
    { key:'courtesy',  label:'ความสุภาพ / มารยาท' },
    { key:'speed',     label:'ความรวดเร็ว' },
    { key:'knowledge', label:'ความรู้ความชำนาญ' },
    { key:'solving',   label:'การแก้ปัญหา' },
    { key:'overall',   label:'ความประทับใจโดยรวม' },
  ],
};
