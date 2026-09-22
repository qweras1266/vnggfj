(function() {
  const state = {
    data: [],
    filterCat: "全部",
    keyword: "",
    current: null
  };

  // ---- 主题切换 ----
  function initTheme() {
    const saved = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", saved);
    document.getElementById("themeToggle").textContent = saved === "dark" ? "☀️" : "🌙";
  }
  document.getElementById("themeToggle").addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme");
    const next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    document.getElementById("themeToggle").textContent = next === "dark" ? "☀️" : "🌙";
  });

  // ---- 加载数据 ----
  async function loadData() {
    try {
      const res = await fetch("./data/data.json?_=" + Date.now());
      if (!res.ok) throw new Error("data.json 加载失败: " + res.status);
      state.data = await res.json();
      document.getElementById("lastUpdate").textContent = state.data.lastUpdate || "-";
      render();
    } catch (e) {
      document.getElementById("cardGrid").innerHTML =
        `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">⚠️</div><div class="empty-title">数据加载失败</div><div class="empty-desc">${e.message}</div></div>`;
    }
  }

  // ---- 筛选 ----
  function filter() {
    let list = state.data.items || [];
    if (state.filterCat !== "全部") {
      list = list.filter(it => it["category"] && it["category"].includes(state.filterCat));
    }
    if (state.keyword.trim()) {
      const kw = state.keyword.trim().toLowerCase();
      list = list.filter(it => {
        return Object.values(it).some(v =>
          String(v).toLowerCase().includes(kw)
        );
      });
    }
    return list;
  }

  // ---- 渲染卡片 ----
  function render() {
    const list = filter();
    const grid = document.getElementById("cardGrid");
    document.getElementById("totalCount").textContent = list.length;
    if (!list.length) {
      grid.innerHTML = "";
      document.getElementById("emptyState").style.display = "";
      return;
    }
    document.getElementById("emptyState").style.display = "none";

    grid.innerHTML = list.map((it, idx) => {
      const ratingHtml = it.rating ? `<div class="rating">⭐ ${it.rating}</div>` : "";
      const viewsHtml = it.views ? `<div class="views">👁 ${Number(it.views).toLocaleString()}</div>` : "";
      const tagsArr = it.tags ? it.tags : [];
      const catHtml = it["category"] ? `<span class="card-cat">${it["category"]}</span>` : "";
      // 标签/风味/特色
      const extras = (it.flavor ? it.flavor.split(/[,，/、]/).slice(0,3) : [])
        .concat(it.theme ? it.theme.split(/[,，/、]/).slice(0,3) : [])
        .concat(it.stars ? [it.stars.split("/")[0]] : []);
      const allTags = [...tagsArr, ...extras].slice(0, 4);
      return `<article class="card" data-idx="${it.title}">
        ${catHtml}
        <h3 class="card-title">${escapeHtml(it.title)}</h3>
        <p class="card-desc">${escapeHtml(it.desc || it.content || it.story || it.facts || "")}</p>
        ${allTags.length ? `<div class="card-tags">${allTags.map(t=>`<span class="tag">${escapeHtml(String(t).trim())}</span>`).join("")}</div>`:""}
        <div class="card-footer">
          ${ratingHtml || `<span class="tag">查看详情 →</span>`}
          ${viewsHtml}
        </div>
      </article>`;
    }).join("");

    // 绑定详情
    grid.querySelectorAll(".card").forEach(card => {
      card.addEventListener("click", () => {
        const title = card.getAttribute("data-idx");
        const item = list.find(x => x.title === title);
        if (item) showDetail(item);
      });
    });
  }

  // ---- 详情弹窗 ----
  function showDetail(it) {
    const body = document.getElementById("modalBody");
    let kvHtml = `<div class="detail-kv">`;
    const ignoreKeys = new Set(["title","desc","tags","steps","features","obs_guide","practice","brew","content","facts","itinerary","tips","storage","obs_guide","myth","myth_tip","gear","songs","key_points","bad_ex","good_ex","material","materials","story","guide","care","value","specs","origin","season","appearance","meaning","gift","gift_scene","roast","flavor","price","chef","author","dynasty","artist","style","difficulty","time","age","target","best_view","hemisphere","level","views"]);
    Object.keys(it).forEach(k => {
      if (ignoreKeys.has(k)) return;
      const v = it[k];
      if (v === null || v === undefined || v === "") return;
      const label = k;
      kvHtml += `<div class="kv-item"><span class="kv-key">${label}</span><span class="kv-value">${escapeHtml(String(v))}</span></div>`;
    });
    kvHtml += `</div>`;

    let sections = "";
    // 重要大段落字段
    const bigFields = [
      ["desc","简介"],
      ["content","内容节选"],
      ["story","故事内容"],
      ["brew","冲煮/冲泡方法"],
      ["steps","详细步骤"],
      ["features","特色亮点"],
      ["practice","练习方案"],
      ["itinerary","行程安排"],
      ["key_points","核心要点"],
      ["bad_ex","❌ 错误示范"],
      ["good_ex","✅ 正确示范"],
      ["songs","曲目进度"],
      ["value","市场参考价"],
      ["specs","规格参数"],
      ["facts","科普知识"],
      ["obs_guide","观测/观察指南"],
      ["tips","贴心小贴士"],
      ["guide","阅读指南"],
      ["storage","存储保存方法"],
      ["myth","神话/历史背景"],
      ["care","养护要点"],
      ["appearance","外观特征"],
      ["meaning","花语含义"],
      ["gift","送礼场景"],
      ["origin","产地介绍"],
      ["season","最佳时节"],
      ["dynasty","年代"],
      ["artist","作者/书法家"],
      ["style","风格/流派"],
      ["age","适合年龄"],
      ["target","适用人群"],
      ["level","难度等级"],
      ["gear","必备器材"],
      ["difficulty","难度"],
      ["time","制作耗时"],
      ["materials","所需材料"],
      ["material","材料清单"],
      ["best_view","最佳观测时间"],
      ["hemisphere","观测区域"],
      ["price","价格"],
      ["chef","作者"],
      ["author","作者"],
      ["views","浏览量"],
      ["roast","烘焙度"],
      ["flavor","风味描述"],
      ["rating","评分"]
    ];
    bigFields.forEach(([k,label]) => {
      if (it[k] !== undefined && it[k] !== null && String(it[k]).trim() !== "") {
        let v = String(it[k]).trim();
        if (k === "views") v = Number(it[k]).toLocaleString() + " 次";
        if (k === "rating") v = "⭐ " + it[k] + " / 5.0";
        sections += `<div class="detail-section"><div class="section-title">${label}</div><div class="section-content">${escapeHtml(v)}</div></div>`;
      }
    });

    // 优/缺点字段检测
    const pros = it.pros ? `<div class="pros"><div class="pros-title">✅ 优点</div>${escapeHtml(it.pros)}</div>` : "";
    const cons = it.cons ? `<div class="cons"><div class="cons-title">❌ 不足</div>${escapeHtml(it.cons)}</div>` : "";
    const prosConsHtml = (pros || cons) ? `<div class="pros-cons">${pros}${cons}</div>` : "";

    const ratingBig = it.rating ? `<div class="detail-rating-bar"><div class="detail-rating-big">${it.rating}<small>/ 5.0</small></div>${it.views?`<span>👁 ${Number(it.views).toLocaleString()} 浏览</span>`:""}</div>` : (it.views?`<div class="detail-rating-bar"><span>👁 ${Number(it.views).toLocaleString()} 浏览</span></div>`:"");

    body.innerHTML = `<div class="detail-header">
      ${ratingBig}
      <h2 class="detail-title">${escapeHtml(it.title)}</h2>
      ${it["category"] ? `<span class="card-cat">${escapeHtml(it["category"])}</span>` : ""}
    </div>
    ${kvHtml}
    ${prosConsHtml}
    ${sections}`;

    document.getElementById("detailModal").style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  // ---- 关闭 ----
  function closeModal() {
    document.getElementById("detailModal").style.display = "none";
    document.body.style.overflow = "";
  }
  window.closeModal = closeModal;
  window.openDetail = function() { /* 占位 */ };
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

  // ---- 分类点击 ----
  document.querySelectorAll(".cat-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.filterCat = btn.dataset.cat;
      render();
    });
  });

  // ---- 搜索防抖 ----
  let searchTimer;
  document.getElementById("searchInput").addEventListener("input", e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.keyword = e.target.value;
      render();
    }, 200);
  });

  function escapeHtml(s) {
    if (s === null || s === undefined) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // ---- 启动 ----
  initTheme();
  loadData();
})();
