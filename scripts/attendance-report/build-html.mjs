/**
 * Builds a self-contained interactive HTML attendance report
 * styled to match the MentorBridge app theme.
 */

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function buildHtmlReport({
  generatedAt,
  meetings,
  mandatoryCount,
  nonMandatoryCount,
  students,
}) {
  const payload = students.map((s) => ({
    id: s.id,
    name: s.full_name,
    email: s.email,
    department: s.department ?? '—',
    domain: s.domain_interest ?? '—',
    active: s.is_active !== false,
    allMeetings: s.stats.allMeetings,
    total: s.stats.total,
    nonMandatory: s.stats.nonMandatory,
    present: s.stats.present,
    absent: s.stats.absent,
    permission: s.stats.permission,
    presentRate: s.stats.presentRate,
    absentRate: s.stats.absentRate,
    permissionRate: s.stats.permissionRate,
    presentMeetings: s.presentMeetings,
    absentMeetings: s.absentMeetings,
    permissionMeetings: s.permissionMeetings,
    nonMandatoryMeetings: s.nonMandatoryMeetings,
  }))

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>MentorBridge Attendance Report</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg: #faf7fb;
      --card: #ffffff;
      --text: #171717;
      --muted: #6b7280;
      --border: #efe4ec;
      --primary: #d53f8c;
      --primary-soft: #fce7f3;
      --secondary: #00c5fa;
      --secondary-soft: #e0f7fe;
      --present: #16a34a;
      --present-soft: #dcfce7;
      --absent: #dc2626;
      --absent-soft: #fee2e2;
      --permission: #ca8a04;
      --permission-soft: #fef9c3;
      --optional: #0284c7;
      --optional-soft: #e0f2fe;
      --shadow: 0 1px 2px rgb(213 63 140 / 0.06), 0 10px 28px rgb(15 23 42 / 0.06);
      --radius: 14px;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, system-ui, sans-serif;
      color: var(--text);
      background:
        radial-gradient(900px 420px at 0% -10%, rgb(213 63 140 / 0.14), transparent 60%),
        radial-gradient(700px 380px at 100% 0%, rgb(0 197 250 / 0.16), transparent 55%),
        linear-gradient(180deg, #fff 0%, var(--bg) 280px);
      min-height: 100vh;
    }
    .wrap { max-width: none; width: 100%; margin: 0; padding: 20px 16px 64px; }

    .hero {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 18px;
      align-items: flex-end;
      margin-bottom: 22px;
      padding: 22px 24px;
      border: 1px solid rgb(213 63 140 / 0.14);
      border-radius: 20px;
      background:
        linear-gradient(135deg, rgb(255 255 255 / 0.92), rgb(252 231 243 / 0.55) 45%, rgb(224 247 254 / 0.5));
      box-shadow: var(--shadow);
      backdrop-filter: blur(8px);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-mark {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: grid;
      place-items: center;
      color: #fff;
      font-weight: 800;
      font-size: 1.05rem;
      letter-spacing: -0.04em;
      background: linear-gradient(145deg, var(--primary), #9d174d 70%, var(--secondary));
      box-shadow: 0 8px 20px rgb(213 63 140 / 0.35);
    }
    .brand h1 {
      margin: 0;
      font-size: clamp(1.35rem, 2.4vw, 1.85rem);
      letter-spacing: -0.03em;
      background: linear-gradient(90deg, var(--primary), #be185d 55%, #0891b2);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .brand p { margin: 4px 0 0; color: var(--muted); font-size: 0.9rem; }
    .hero-meta {
      text-align: right;
      color: var(--muted);
      font-size: 0.82rem;
    }
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 8px;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--primary);
      background: var(--primary-soft);
      border: 1px solid rgb(213 63 140 / 0.18);
    }
    .pill::before {
      content: "";
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--secondary);
      box-shadow: 0 0 0 3px rgb(0 197 250 / 0.25);
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 12px;
      margin-bottom: 18px;
    }
    .stat {
      position: relative;
      overflow: hidden;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 16px 16px 14px;
      box-shadow: var(--shadow);
    }
    .stat::before {
      content: "";
      position: absolute;
      inset: 0 auto 0 0;
      width: 4px;
      background: linear-gradient(180deg, var(--primary), var(--secondary));
    }
    .stat.mandatory::before { background: var(--primary); }
    .stat.optional::before { background: var(--secondary); }
    .stat.students::before { background: #8b5cf6; }
    .stat .label { color: var(--muted); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
    .stat .value { font-size: 1.7rem; font-weight: 800; margin-top: 6px; letter-spacing: -0.03em; color: var(--text); }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 14px;
      align-items: center;
      padding: 12px;
      border-radius: 16px;
      background: rgb(255 255 255 / 0.75);
      border: 1px solid var(--border);
      box-shadow: var(--shadow);
    }
    .toolbar input, .toolbar select {
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 10px 12px;
      font: inherit;
      background: #fff;
      color: var(--text);
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .toolbar input:focus, .toolbar select:focus {
      border-color: rgb(213 63 140 / 0.45);
      box-shadow: 0 0 0 3px rgb(213 63 140 / 0.12);
    }
    .toolbar input { min-width: min(340px, 100%); flex: 1; }

    .table-shell {
      overflow: auto;
      border-radius: 18px;
      border: 1px solid var(--border);
      background: var(--card);
      box-shadow: var(--shadow);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 100%;
    }
    th, td {
      padding: 12px 12px;
      border-bottom: 1px solid rgb(239 228 236 / 0.9);
      text-align: left;
      vertical-align: middle;
      font-size: 0.9rem;
    }
    th {
      background: linear-gradient(180deg, #fff7fb, #f8fafc);
      color: #7a5a6d;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      position: sticky;
      top: 0;
      z-index: 1;
      white-space: nowrap;
    }
    tr:last-child td { border-bottom: 0; }
    tbody tr { transition: background 0.15s; }
    tbody tr:nth-child(even) td { background: rgb(252 231 243 / 0.18); }
    tbody tr:hover td { background: rgb(224 247 254 / 0.45); }
    .idx { color: var(--muted); font-variant-numeric: tabular-nums; font-weight: 600; }
    .name { font-weight: 700; letter-spacing: -0.01em; }
    .sub { color: var(--muted); font-size: 0.78rem; margin-top: 2px; }
    .domain-pill {
      display: inline-flex;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #0e7490;
      background: var(--secondary-soft);
      border: 1px solid rgb(0 197 250 / 0.25);
      white-space: nowrap;
    }
    .badge {
      display: inline-flex;
      margin-top: 6px;
      border-radius: 999px;
      padding: 2px 8px;
      font-size: 0.68rem;
      font-weight: 700;
      border: 1px solid rgb(220 38 38 / 0.25);
      color: var(--absent);
      background: var(--absent-soft);
    }
    button.chip {
      border: 1px solid transparent;
      border-radius: 999px;
      padding: 5px 11px;
      font: inherit;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    button.chip:hover, button.chip:focus-visible {
      outline: none;
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgb(15 23 42 / 0.1);
    }
    button.chip.meetings { color: var(--primary); background: var(--primary-soft); border-color: rgb(213 63 140 / 0.2); }
    button.chip.optional { color: var(--optional); background: var(--optional-soft); border-color: rgb(2 132 199 / 0.2); }
    button.chip.present { color: var(--present); background: var(--present-soft); border-color: rgb(22 163 74 / 0.2); }
    button.chip.absent { color: var(--absent); background: var(--absent-soft); border-color: rgb(220 38 38 / 0.2); }
    button.chip.permission { color: #a16207; background: var(--permission-soft); border-color: rgb(202 138 4 / 0.25); }
    .rate-cell { min-width: 78px; }
    .rate {
      display: flex;
      align-items: center;
      gap: 8px;
      font-variant-numeric: tabular-nums;
      font-weight: 700;
      font-size: 0.82rem;
    }
    .rate-bar {
      flex: 1;
      height: 6px;
      border-radius: 999px;
      background: #f1f5f9;
      overflow: hidden;
      min-width: 42px;
    }
    .rate-bar > span {
      display: block;
      height: 100%;
      border-radius: inherit;
    }
    .rate.present { color: var(--present); }
    .rate.present .rate-bar > span { background: linear-gradient(90deg, #4ade80, var(--present)); }
    .rate.absent { color: var(--absent); }
    .rate.absent .rate-bar > span { background: linear-gradient(90deg, #f87171, var(--absent)); }
    .rate.permission { color: #a16207; }
    .rate.permission .rate-bar > span { background: linear-gradient(90deg, #facc15, #ca8a04); }

    dialog {
      border: 0;
      border-radius: 20px;
      padding: 0;
      width: min(680px, calc(100vw - 24px));
      box-shadow: 0 24px 60px rgb(213 63 140 / 0.2);
      background: #fff;
    }
    dialog::backdrop {
      background: linear-gradient(145deg, rgb(213 63 140 / 0.28), rgb(0 197 250 / 0.22));
      backdrop-filter: blur(3px);
    }
    .dialog-head {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: start;
      padding: 18px 18px 14px;
      border-bottom: 1px solid var(--border);
      background: linear-gradient(135deg, #fff7fb, #ecfeff);
    }
    .dialog-head h2 { margin: 0; font-size: 1.1rem; color: var(--primary); }
    .dialog-body { padding: 14px 18px 18px; max-height: min(60vh, 480px); overflow: auto; }
    .close {
      border: 0;
      width: 32px;
      height: 32px;
      border-radius: 10px;
      background: rgb(213 63 140 / 0.08);
      font-size: 1.15rem;
      cursor: pointer;
      color: var(--primary);
    }
    .meeting-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
    .meeting-list li {
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px 14px;
      background: linear-gradient(135deg, #fff, #f8fafc);
    }
    .meeting-title { font-weight: 700; }
    .meeting-meta { color: var(--muted); font-size: 0.85rem; margin-top: 4px; }
    .empty { color: var(--muted); margin: 8px 0; text-align: center; padding: 24px; }
    footer {
      margin-top: 18px;
      color: var(--muted);
      font-size: 0.8rem;
      line-height: 1.5;
      padding: 14px 16px;
      border-radius: 14px;
      background: rgb(255 255 255 / 0.7);
      border: 1px solid var(--border);
    }
    @media print {
      body { background: #fff; }
      .toolbar, .close, .hero { box-shadow: none; }
      button.chip { box-shadow: none; }
      .table-shell { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <header class="hero">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true">MB</div>
        <div>
          <h1>MentorBridge Attendance Report</h1>
          <p>Complete student meeting &amp; attendance overview</p>
        </div>
      </div>
      <div class="hero-meta">
        <div>Generated ${escapeHtml(generatedAt)}</div>
        <div class="pill">From start through now</div>
      </div>
    </header>

    <div class="stats">
      <div class="stat"><div class="label">All meetings</div><div class="value">${meetings.length}</div></div>
      <div class="stat mandatory"><div class="label">Mandatory</div><div class="value">${mandatoryCount}</div></div>
      <div class="stat optional"><div class="label">Non-mandatory</div><div class="value">${nonMandatoryCount}</div></div>
      <div class="stat students"><div class="label">Students</div><div class="value">${students.length}</div></div>
    </div>

    <div class="toolbar">
      <input id="search" type="search" placeholder="Search student, email, domain…" />
      <select id="statusFilter">
        <option value="all">All students</option>
        <option value="active">Active only</option>
        <option value="inactive">Inactive only</option>
      </select>
    </div>

    <div class="table-shell">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Student</th>
            <th>Domain</th>
            <th>Meetings</th>
            <th>Non-mandatory</th>
            <th>Mandatory</th>
            <th>Present</th>
            <th>Absent</th>
            <th>Permission</th>
            <th>Present %</th>
            <th>Absent %</th>
            <th>Permission %</th>
          </tr>
        </thead>
        <tbody id="rows"></tbody>
      </table>
    </div>

    <footer>
      Click any count to open meeting details (title, date, conducted by).
      Meetings = mandatory + non-mandatory for that student (audience match).
      Present / Absent / Permission rates are based on mandatory meetings only — kept separate, never combined.
    </footer>
  </div>

  <dialog id="detailDialog">
    <div class="dialog-head">
      <div>
        <h2 id="dialogTitle">Details</h2>
        <p class="sub" id="dialogSub"></p>
      </div>
      <button class="close" type="button" id="dialogClose" aria-label="Close">×</button>
    </div>
    <div class="dialog-body" id="dialogBody"></div>
  </dialog>

  <script>
    const DATA = ${JSON.stringify(payload)};

    const rowsEl = document.getElementById('rows');
    const searchEl = document.getElementById('search');
    const statusEl = document.getElementById('statusFilter');
    const dialog = document.getElementById('detailDialog');
    const dialogTitle = document.getElementById('dialogTitle');
    const dialogSub = document.getElementById('dialogSub');
    const dialogBody = document.getElementById('dialogBody');

    function meetingList(meetings, emptyLabel) {
      if (!meetings.length) return '<p class="empty">' + emptyLabel + '</p>';
      return '<ul class="meeting-list">' + meetings.map((m) => {
        const date = m.meeting_date || '';
        const start = (m.start_time || '').slice(0, 5);
        const end = (m.end_time || '').slice(0, 5);
        return '<li><div class="meeting-title">' + escapeHtml(m.title) + '</div>' +
          '<div class="meeting-meta">' + escapeHtml(date) +
          (start ? ' · ' + escapeHtml(start) + '–' + escapeHtml(end) : '') +
          ' · Conducted by <strong>' + escapeHtml(m.handled_by) + '</strong></div></li>';
      }).join('') + '</ul>';
    }

    function escapeHtml(value) {
      return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
    }

    function rateCell(kind, value) {
      const width = Math.max(0, Math.min(100, Number(value) || 0));
      return '<div class="rate-cell"><div class="rate ' + kind + '"><span>' + width + '%</span>' +
        '<div class="rate-bar" aria-hidden="true"><span style="width:' + width + '%"></span></div></div></div>';
    }

    function openDetails(student, kind) {
      const map = {
        meetings: {
          title: 'All meetings',
          list: [...student.presentMeetings, ...student.absentMeetings, ...student.permissionMeetings, ...student.nonMandatoryMeetings]
            .sort((a, b) => (a.meeting_date || '').localeCompare(b.meeting_date || '') || String(a.start_time || '').localeCompare(String(b.start_time || ''))),
          empty: 'No meetings for this student.',
        },
        present: { title: 'Present meetings', list: student.presentMeetings, empty: 'No present records.' },
        absent: { title: 'Absent meetings', list: student.absentMeetings, empty: 'No absent records.' },
        permission: { title: 'Permission meetings', list: student.permissionMeetings, empty: 'No permission records.' },
        optional: { title: 'Non-mandatory meetings', list: student.nonMandatoryMeetings, empty: 'No non-mandatory meetings.' },
      };
      const info = map[kind];
      dialogTitle.textContent = info.title + ' · ' + student.name;
      dialogSub.textContent = student.email + ' · ' + info.list.length + ' meeting(s)';
      dialogBody.innerHTML = meetingList(info.list, info.empty);
      dialog.showModal();
    }

    function render() {
      const q = searchEl.value.trim().toLowerCase();
      const status = statusEl.value;
      const filtered = DATA.filter((s) => {
        if (status === 'active' && !s.active) return false;
        if (status === 'inactive' && s.active) return false;
        if (!q) return true;
        return [s.name, s.email, s.domain, s.department].join(' ').toLowerCase().includes(q);
      });

      rowsEl.innerHTML = filtered.map((s, i) => \`
        <tr>
          <td class="idx">\${i + 1}</td>
          <td>
            <div class="name">\${escapeHtml(s.name)}</div>
            <div class="sub">\${escapeHtml(s.email)}</div>
            \${s.active ? '' : '<span class="badge">Inactive</span>'}
          </td>
          <td><span class="domain-pill">\${escapeHtml(s.domain)}</span></td>
          <td><button class="chip meetings" data-id="\${s.id}" data-kind="meetings" title="View all meetings">\${s.allMeetings}</button></td>
          <td><button class="chip optional" data-id="\${s.id}" data-kind="optional" title="View non-mandatory meetings">\${s.nonMandatory}</button></td>
          <td>\${s.total}</td>
          <td><button class="chip present" data-id="\${s.id}" data-kind="present" title="View present meetings">\${s.present}</button></td>
          <td><button class="chip absent" data-id="\${s.id}" data-kind="absent" title="View absent meetings">\${s.absent}</button></td>
          <td><button class="chip permission" data-id="\${s.id}" data-kind="permission" title="View permission meetings">\${s.permission}</button></td>
          <td>\${rateCell('present', s.presentRate)}</td>
          <td>\${rateCell('absent', s.absentRate)}</td>
          <td>\${rateCell('permission', s.permissionRate)}</td>
        </tr>
      \`).join('') || '<tr><td colspan="12" class="empty">No students match your filters.</td></tr>';
    }

    rowsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('button.chip');
      if (!btn) return;
      const student = DATA.find((s) => s.id === btn.dataset.id);
      if (!student) return;
      openDetails(student, btn.dataset.kind);
    });

    document.getElementById('dialogClose').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close();
    });
    searchEl.addEventListener('input', render);
    statusEl.addEventListener('change', render);
    render();
  </script>
</body>
</html>`
}
