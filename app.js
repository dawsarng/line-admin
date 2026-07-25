/* ===== ฟังก์ชันช่วยเหลือที่ใช้ร่วมกันทุกหน้า ===== */
const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const initial = n => (n || '').replace(/^(คุณ|พี่|น้อง)/, '').trim().charAt(0) || (n || '?').charAt(0);

function starStr(v){ const f = Math.round(v); return '★★★★★'.slice(0, f) + '☆☆☆☆☆'.slice(0, 5 - f); }

function timeAgo(t){
  const d = Math.floor((Date.now() - t) / 864e5);
  if (isNaN(d)) return '';
  if (d <= 0) return 'วันนี้';
  if (d === 1) return 'เมื่อวาน';
  return d + ' วันก่อน';
}

function escapeHtml(s){
  return (s || '').toString().replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

function toast(msg){
  const el = $('#toast'); if (!el) return;
  el.textContent = msg; el.classList.add('show');
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 1900);
}
