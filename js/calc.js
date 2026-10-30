// Shared EMI calculation logic used by all pages

function calcEMI(principal, annualRate, tenureMonths) {
  if (annualRate === 0) return principal / tenureMonths;
  const r = annualRate / 12 / 100;
  return principal * r * Math.pow(1 + r, tenureMonths) / (Math.pow(1 + r, tenureMonths) - 1);
}

function buildAmortization(principal, annualRate, tenureMonths) {
  const r = annualRate / 12 / 100;
  const emi = calcEMI(principal, annualRate, tenureMonths);
  let balance = principal;
  const rows = [];
  let totalInterest = 0;

  for (let m = 1; m <= tenureMonths; m++) {
    const interest = balance * r;
    const principalPaid = emi - interest;
    balance -= principalPaid;
    totalInterest += interest;
    rows.push({
      month: m,
      emi: emi,
      principal: principalPaid,
      interest: interest,
      balance: Math.max(0, balance)
    });
  }
  return { emi, totalInterest, rows };
}

function fmt(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function drawPie(canvasId, principal, interest) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const total = principal + interest;
  const pAngle = (principal / total) * 2 * Math.PI;
  const cx = canvas.width / 2, cy = canvas.height / 2, r = cx - 4;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Principal slice
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + pAngle);
  ctx.closePath();
  ctx.fillStyle = '#4f46e5';
  ctx.fill();

  // Interest slice
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, r, -Math.PI / 2 + pAngle, -Math.PI / 2 + 2 * Math.PI);
  ctx.closePath();
  ctx.fillStyle = '#e0e7ff';
  ctx.fill();
}

function renderTable(tbodyId, rows, showAll) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  const display = showAll ? rows : rows.filter((_, i) => i < 12);
  tbody.innerHTML = display.map(r => `
    <tr>
      <td>Month ${r.month}</td>
      <td>${fmt(r.emi)}</td>
      <td>${fmt(r.principal)}</td>
      <td>${fmt(r.interest)}</td>
      <td>${fmt(r.balance)}</td>
    </tr>`).join('');
}
