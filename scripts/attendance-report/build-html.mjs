/**
 * Builds a self-contained interactive HTML attendance report.
 */

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function buildHtmlReport({ generatedAt, meetings, students }) {
  const totalMeetings = meetings.length
  const payload = students.map((s) => ({
    id: s.id,
    name: s.full_name,
    email: s.email,
    department: s.department ?? '—',
    domain: s.domain_interest ?? '—',
    active: s.is_active !== false,
    total: s.stats.total,
    present: s.stats.present,
    absent: s.stats.absent,
    permission: s.stats.permission,
    presentRate: s.stats.presentRate,
    attendedRate: s.stats.attendedRate,
    presentMeetings: s.presentMeetings,
    absentMeetings: s.absentMeetings,
    permissionMeetings: s.permissionMeetings,
  }))

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>MentorBridge Attendance Report</title>
  <style>
    :root {
      --bg: #f7f8fa;
      --card: #ffffff;
      --text: #1a1a1a;
      --muted: #667085;
      --border: #e5e7eb;
      --primary: #d53f8c;
      --present: #15803d;
      --absent: #b91c1c;
      --permission: #a16207;
      --shadow: 0 1px 2px rgb(0 0 0 / 0.06), 0 8px 24px rgb(0 0 0 / 0.04);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", system-ui, sans-serif;
      color: var(--text);
      background: linear-gradient(180deg, #fff 0%, var(--bg) 220px);
    }
    .wrap { max-width: 1200px; margin: 0 auto; padding: 28px 20px 64px; }
    header h1 { margin: 0 0 6px; font-size: 1.75rem; }
    header p { margin: 0; color: var(--muted); }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 12px;
      margin: 24px 0;
    }
    .stat {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px 16px;
      box-shadow: var(--shadow);
    }
    .stat .label { color: var(--muted); font-size: 0.8rem; }
    .stat .value { font-size: 1.5rem; font-weight: 700; margin-top: 4px; }
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 14px;
      align-items: center;
    }
    .toolbar input, .toolbar select {
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 12px;
      font: inherit;
      background: #fff;
    }
    .toolbar input { min-width: min(320px, 100%); flex: 1; }
    table {
      width: 100%;
      border-collapse: collapse;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: var(--shadow);
    }
    th, td {
      padding: 10px 12px;
      border-bottom: 1px solid var(--border);
      text-align: left;
      vertical-align: top;
      font-size: 0.92rem;
    }
    th {
      background: #fafafa;
      color: var(--muted);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      position: sticky;
      top: 0;
      z-index: 1;
    }
    tr:last-child td { border-bottom: 0; }
    tr:hover td { background: #fcfcfd; }
    .name { font-weight: 600; }
    .sub { color: var(--muted); font-size: 0.8rem; }
    .badge {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 2px 8px;
      font-size: 0.72rem;
      font-weight: 600;
      border: 1px solid var(--border);
      color: var(--muted);
    }
    .badge.inactive { color: var(--absent); border-color: color-mix(in srgb, var(--absent) 30%, white); background: color-mix(in srgb, var(--absent) 8%, white); }
    button.chip {
      border: 1px solid var(--border);
      background: #fff;
      border-radius: 999px;
      padding: 4px 10px;
      font: inherit;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: 0.15s ease;
    }
    button.chip:hover, button.chip:focus-visible {
      outline: none;
      transform: translateY(-1px);
      box-shadow: var(--shadow);
    }
    button.chip.present { color: var(--present); border-color: color-mix(in srgb, var(--present) 35%, white); background: color-mix(in srgb, var(--present) 8%, white); }
    button.chip.absent { color: var(--absent); border-color: color-mix(in srgb, var(--absent) 35%, white); background: color-mix(in srgb, var(--absent) 8%, white); }
    button.chip.permission { color: var(--permission); border-color: color-mix(in srgb, var(--permission) 35%, white); background: color-mix(in srgb, var(--permission) 8%, white); }
    .rate { font-variant-numeric: tabular-nums; color: var(--muted); }
    dialog {
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 0;
      width: min(640px, calc(100vw - 24px));
      box-shadow: 0 20px 50px rgb(0 0 0 / 0.18);
    }
    dialog::backdrop { background: rgb(15 23 42 / 0.45); }
    .dialog-head {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: start;
      padding: 18px 18px 12px;
      border-bottom: 1px solid var(--border);
    }
    .dialog-head h2 { margin: 0; font-size: 1.1rem; }
    .dialog-body { padding: 14px 18px 18px; max-height: min(60vh, 480px); overflow: auto; }
    .close {
      border: 0;
      background: transparent;
      font-size: 1.2rem;
      cursor: pointer;
      color: var(--muted);
    }
    .meeting-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
    .meeting-list li {
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 10px 12px;
      background: #fafafa;
    }
    .meeting-title { font-weight: 600; }
    .meeting-meta { color: var(--muted); font-size: 0.85rem; margin-top: 4px; }
    .empty { color: var(--muted); margin: 8px 0; }
    footer { margin-top: 18px; color: var(--muted); font-size: 0.8rem; }
    @media print {
      body { background: #fff; }
      .toolbar, .close { display: none !important; }
      button.chip { box-shadow: none; }
      table { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <h1>MentorBridge Attendance Report</h1>
      <p>All meetings from the start of records through now · Generated ${escapeHtml(generatedAt)}</p>
    </header>

    <div class="stats">
      <div class="stat"><div class="label">Meetings (attendance tracked)</div><div class="value">${totalMeetings}</div></div>
      <div class="stat"><div class="label">Students</div><div class="value">${students.length}</div></div>
      <div class="stat"><div class="label">Marked present (all)</div><div class="value">${students.reduce((n, s) => n + s.stats.present, 0)}</div></div>
      <div class="stat"><div class="label">Marked absent (all)</div><div class="value">${students.reduce((n, s) => n + s.stats.absent, 0)}</div></div>
    </div>

    <div class="toolbar">
      <input id="search" type="search" placeholder="Search student, email, domain…" />
      <select id="statusFilter">
        <option value="all">All students</option>
        <option value="active">Active only</option>
        <option value="inactive">Inactive only</option>
      </select>
    </div>

    <div style="overflow:auto;">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Student</th>
            <th>Domain</th>
            <th>Total</th>
            <th>Present</th>
            <th>Absent</th>
            <th>Permission</th>
            <th>Present %</th>
            <th>Attended %</th>
          </tr>
        </thead>
        <tbody id="rows"></tbody>
      </table>
    </div>

    <footer>
      Click Present / Absent / Permission to see which meetings and who conducted them.
      Total = meetings this student was expected to attend (audience match) with attendance tracked.
      Unmarked expected meetings count as Absent.
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

    function openDetails(student, kind) {
      const map = {
        present: { title: 'Present meetings', list: student.presentMeetings, empty: 'No present records.' },
        absent: { title: 'Absent meetings', list: student.absentMeetings, empty: 'No absent records.' },
        permission: { title: 'Permission meetings', list: student.permissionMeetings, empty: 'No permission records.' },
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
          <td>\${i + 1}</td>
          <td>
            <div class="name">\${escapeHtml(s.name)}</div>
            <div class="sub">\${escapeHtml(s.email)}</div>
            \${s.active ? '' : '<span class="badge inactive">Inactive</span>'}
          </td>
          <td>\${escapeHtml(s.domain)}</td>
          <td>\${s.total}</td>
          <td><button class="chip present" data-id="\${s.id}" data-kind="present" title="View present meetings">\${s.present}</button></td>
          <td><button class="chip absent" data-id="\${s.id}" data-kind="absent" title="View absent meetings">\${s.absent}</button></td>
          <td><button class="chip permission" data-id="\${s.id}" data-kind="permission" title="View permission meetings">\${s.permission}</button></td>
          <td class="rate">\${s.presentRate}%</td>
          <td class="rate">\${s.attendedRate}%</td>
        </tr>
      \`).join('') || '<tr><td colspan="9" class="empty">No students match your filters.</td></tr>';
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
