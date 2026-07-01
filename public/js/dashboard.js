// Dashboard logic for Mi Fitness
(function() {
  'use strict';

  let DASH = null;

  function pct(v, max) { return Math.min(100, Math.max(0, (v / max) * 100)); }
  function fmtHrs(mins) {
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    return h + 'h ' + (m < 10 ? '0' : '') + m + 'm';
  }

  function renderOverview() {
    var c = document.getElementById('dash-overview');
    if (!c || !DASH) return;
    var sleep = DASH.sleep.daily || [];
    var latest = sleep[sleep.length - 1] || {};
    var steps = DASH.activity.steps || [];
    var latestSteps = steps[steps.length - 1] || {};
    var hr = DASH.heart_rate.resting || [];
    var latestHR = hr[hr.length - 1] || {};

    var html = '<div class="dash-grid">';
    html += '<div class="dash-card"><h3>Last Night Sleep</h3><div class="val">' + fmtHrs((latest.deep_min||0) + (latest.light_min||0) + (latest.rem_min||0)) + '</div><div class="sub">' + (latest.efficiency||0) + '% efficiency</div></div>';
    html += '<div class="dash-card"><h3>Steps Today</h3><div class="val">' + ((latestSteps.total_steps||0)).toLocaleString() + '</div><div class="sub">Goal: ' + (latestSteps.goal_steps||'--') + '</div></div>';
    html += '<div class="dash-card"><h3>Resting HR</h3><div class="val">' + (latestHR.bpm||'--') + ' bpm</div><div class="sub">7-day avg: ' + (hr.length ? Math.round(hr.slice(-7).reduce(function(a,b){return a+(b.bpm||0);},0) / Math.min(7,hr.length)) + ' bpm' : '--') + '</div></div>';
    html += '<div class="dash-card"><h3>HRV (Sleep)</h3><div class="val">' + (latest.hrv_median||'--') + ' ms</div><div class="sub">Std: ' + (latest.hrv_std||0) + ' ms</div></div>';
    html += '</div>';
    c.innerHTML = html;
  }

  function renderSleep() {
    var c = document.getElementById('dash-sleep');
    if (!c || !DASH) return;
    var sleep = DASH.sleep.daily || [];
    if (!sleep.length) { c.innerHTML = '<p style="color:#666">No sleep data</p>'; return; }

    var maxDur = 1;
    sleep.forEach(function(s) {
      var total = (s.deep_min||0) + (s.light_min||0) + (s.rem_min||0) + (s.awake_min||0);
      if (total > maxDur) maxDur = total;
    });

    var html = '<div class="dash-card"><h3>Sleep Duration (hours)</h3>';
    sleep.slice(-14).forEach(function(s) {
      var total = (s.deep_min||0) + (s.light_min||0) + (s.rem_min||0) + (s.awake_min||0);
      var w = pct(total, maxDur);
      var d = pct(s.deep_min||0, total || 1);
      var l = pct(s.light_min||0, total || 1);
      var r = pct(s.rem_min||0, total || 1);
      html += '<div class="bar-row"><span class="bar-label">' + s.date.slice(5) + '</span><div class="bar-track" style="width:' + w + '%"><div class="bar-seg bar-deep" style="width:' + d + '%"></div><div class="bar-seg bar-light" style="width:' + l + '%"></div><div class="bar-seg bar-rem" style="width:' + r + '%"></div></div><span class="bar-val">' + (total/60).toFixed(1) + 'h</span></div>';
    });
    html += '</div>';

    html += '<div class="dash-card"><h3>Sleep Stages (Last 7 Days)</h3>';
    sleep.slice(-7).reverse().forEach(function(s) {
      var total = (s.deep_min||0) + (s.light_min||0) + (s.rem_min||0) + (s.awake_min||0);
      var dp = pct(s.deep_min||0, total || 1);
      var lp = pct(s.light_min||0, total || 1);
      var rp = pct(s.rem_min||0, total || 1);
      var ap = pct(s.awake_min||0, total || 1);
      html += '<div class="sleep-stage-row">';
      html += '<div style="display:flex;justify-content:space-between;font-size:11px;color:#888;margin-bottom:4px"><span>' + s.date + '</span><span>' + fmtHrs((s.deep_min||0)+(s.light_min||0)+(s.rem_min||0)) + ' &middot; ' + (s.efficiency||0) + '% eff</span></div>';
      html += '<div class="sleep-bar"><div class="sleep-deep" style="width:' + dp + '%"></div><div class="sleep-light" style="width:' + lp + '%"></div><div class="sleep-rem" style="width:' + rp + '%"></div><div class="sleep-awake" style="width:' + ap + '%"></div></div>';
      html += '<div class="sleep-timeline"><span>Deep ' + fmtHrs(s.deep_min||0) + '</span><span>Light ' + fmtHrs(s.light_min||0) + '</span><span>REM ' + fmtHrs(s.rem_min||0) + '</span><span>Awake ' + fmtHrs(s.awake_min||0) + '</span></div>';
      html += '</div>';
    });
    html += '</div>';
    c.innerHTML = html;
  }

  function renderHeart() {
    var c = document.getElementById('dash-heart');
    if (!c || !DASH) return;
    var resting = DASH.heart_rate.resting || [];
    if (!resting.length) { c.innerHTML = '<p style="color:#666">No data</p>'; return; }

    var minBpm = Math.min.apply(null, resting.map(function(r){return r.bpm;})) - 5;
    var maxBpm = Math.max.apply(null, resting.map(function(r){return r.bpm;})) + 5;

    var html = '<div class="dash-card"><h3>Resting Heart Rate (bpm)</h3><div class="dot-chart">';
    resting.slice(-14).forEach(function(r) {
      var y = 100 - pct(r.bpm - minBpm, maxBpm - minBpm);
      html += '<div class="dot-group"><div class="dot-vert" style="bottom:' + y + '%" title="' + r.bpm + ' bpm"></div><span class="dot-label">' + r.date.slice(5) + '</span></div>';
    });
    html += '</div></div>';

    html += '<div class="dash-card"><h3>Recent Readings</h3>';
    resting.slice(-7).reverse().forEach(function(r) {
      html += '<div class="stat-row"><span class="lbl">' + r.date + '</span><span class="val">' + r.bpm + ' bpm</span></div>';
    });
    html += '</div>';
    c.innerHTML = html;
  }

  function renderActivity() {
    var c = document.getElementById('dash-activity');
    if (!c || !DASH) return;
    var steps = DASH.activity.steps || [];
    if (!steps.length) { c.innerHTML = '<p style="color:#666">No data</p>'; return; }

    var maxSteps = 1;
    steps.forEach(function(s) { if ((s.total_steps||0) > maxSteps) maxSteps = s.total_steps||0; });

    var html = '<div class="dash-card"><h3>Daily Steps</h3>';
    steps.slice(-14).forEach(function(s) {
      var w = pct(s.total_steps || 0, maxSteps);
      html += '<div class="bar-row"><span class="bar-label">' + s.date.slice(5) + '</span><div class="bar-track" style="width:' + w + '%"><div class="bar-seg bar-steps" style="width:100%"></div></div><span class="bar-val">' + ((s.total_steps||0)).toLocaleString() + '</span></div>';
    });
    html += '</div>';

    var cal = DASH.activity.calories || [];
    var maxCal = 1;
    cal.forEach(function(c2) { if ((c2.total_calories||0) > maxCal) maxCal = c2.total_calories||0; });

    html += '<div class="dash-card"><h3>Daily Calories</h3>';
    cal.slice(-14).forEach(function(c2) {
      var w = pct(c2.total_calories || 0, maxCal);
      html += '<div class="bar-row"><span class="bar-label">' + c2.date.slice(5) + '</span><div class="bar-track" style="width:' + w + '%"><div class="bar-seg bar-cal" style="width:100%"></div></div><span class="bar-val">' + (c2.total_calories||0) + ' cal</span></div>';
    });
    html += '</div>';
    c.innerHTML = html;
  }

  function renderHealth() {
    var c = document.getElementById('dash-health');
    if (!c || !DASH) return;
    var spo2 = DASH.health.spo2 || [];
    var stress = DASH.health.stress || [];

    var html = '';
    if (spo2.length) {
      html += '<div class="dash-card"><h3>Blood Oxygen (SpO2 %)</h3>';
      spo2.slice(-14).forEach(function(s) {
        var v = s.avg_spo2 || s.value || 0;
        var color = v >= 95 ? '#4caf50' : v >= 90 ? '#ff9800' : '#f44336';
        html += '<div class="bar-row"><span class="bar-label">' + s.date.slice(5) + '</span><div class="bar-track" style="width:' + pct(v, 100) + '%"><div class="bar-seg" style="width:100%;background:' + color + '"></div></div><span class="bar-val">' + v + '%</span></div>';
      });
      html += '</div>';
    }
    if (stress.length) {
      html += '<div class="dash-card"><h3>Stress Level</h3>';
      stress.slice(-14).forEach(function(s) {
        var v = s.avg_stress || s.value || 0;
        var color = v < 30 ? '#4caf50' : v < 50 ? '#ff9800' : '#f44336';
        html += '<div class="bar-row"><span class="bar-label">' + s.date.slice(5) + '</span><div class="bar-track" style="width:' + pct(v, 100) + '%"><div class="bar-seg" style="width:100%;background:' + color + '"></div></div><span class="bar-val">' + v + '</span></div>';
      });
      html += '</div>';
    }
    c.innerHTML = html;
  }

  // Initialize when DOM is ready
  function init() {
    fetch('/data/dashboard.json')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        DASH = data;
        renderOverview();
        renderSleep();
        renderHeart();
        renderActivity();
        renderHealth();
      })
      .catch(function(e) { console.error('Dashboard load error:', e); });
  }

  // Tab switching
  document.addEventListener('DOMContentLoaded', function() {
    // Activate first dash tab
    var firstTab = document.querySelector('.dash-tab');
    var firstContent = document.querySelector('.dash-content');
    if (firstTab) firstTab.classList.add('active');
    if (firstContent) firstContent.classList.add('active');

    // Main tab switching
    document.querySelectorAll('.fit-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        document.querySelectorAll('.fit-tab').forEach(function(t) { t.classList.remove('active'); });
        document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
        tab.classList.add('active');
        var content = document.getElementById('tab-' + tab.dataset.tab);
        if (content) content.classList.add('active');
        if (tab.dataset.tab === 'walks') {
          setTimeout(function() { if (window.map) window.map.invalidateSize(); }, 50);
        }
      });
    });

    // Dash tab switching
    document.querySelectorAll('.dash-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        document.querySelectorAll('.dash-tab').forEach(function(t) { t.classList.remove('active'); });
        document.querySelectorAll('.dash-content').forEach(function(c) { c.classList.remove('active'); });
        tab.classList.add('active');
        var content = document.getElementById('dash-' + tab.dataset.dtab);
        if (content) content.classList.add('active');
      });
    });

    init();
  });
})();
