// VietQR generator for MBBANK - DAO QUANG HUY
// Pure JS, uses qrcode library for QR rendering

(function () {
  "use strict";

  // Bank config
  const ACCOUNT_NAME = "DAO QUANG HUY";
  const BANKS = {
    MBBANK: { bin: "970422", label: "MBBANK" },
  };
  const ACQUIRER = "vietqr";
  const TEMPLATE = "compact2"; // visual template on api.vietqr.io

  // Elements
  const formEl = document.getElementById("qrForm");
  const amountEl = document.getElementById("amount");
  const contentEl = document.getElementById("content");
  const bankSelectEl = document.getElementById("bankSelect");
  const accountSelectEl = document.getElementById("accountSelect");
  const previewEl = document.getElementById("qrPreview");
  const toolsEl = document.getElementById("qrTools");
  const generateBtn = document.getElementById("generateBtn");
  const resetBtn = document.getElementById("resetBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const copyBtn = document.getElementById("copyBtn");
  const summaryTextEl = document.getElementById("summaryText");
  const footerBankEl = document.getElementById("footerBank");
  const footerAccountEl = document.getElementById("footerAccount");

  // Helpers
  function normalizeAmount(raw) {
    if (!raw) return "";
    const onlyDigits = String(raw).replace(/[^0-9]/g, "");
    // Remove leading zeros
    return onlyDigits.replace(/^0+(?!$)/, "");
  }

  function formatAmountDisplay(digits) {
    if (!digits) return "";
    // Use comma separators as requested (e.g., 10000 -> 10,000)
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Live sanitize: keep spaces while typing (do not trim or lowercase)
  function sanitizeContentLive(raw) {
    if (!raw) return "";
    const noAccent = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const ascii = noAccent.replace(/[^A-Za-z0-9 ]/g, "");
    // Collapse multiple spaces but keep leading/trailing to let user see the space
    return ascii.replace(/ {2,}/g, " ");
  }

  // Final normalize for submit: trim edges, giữ nguyên chữ hoa/thường
  function normalizeContentForSubmit(raw) {
    if (!raw) return "";
    const noAccent = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const ascii = noAccent.replace(/[^A-Za-z0-9 ]/g, "");
    return ascii.replace(/\s+/g, " ").trim();
  }

  function buildVietQrApiUrl(amount, description) {
    const bankCode = bankSelectEl.value || "MBBANK";
    const bin = BANKS[bankCode]?.bin || BANKS.MBBANK.bin;
    const accountNo = accountSelectEl.value;
    // Using vietqr public render API: https://api.vietqr.io/image/<BIN>-<ACCOUNT>?amount=..&addInfo=..&accountName=..
    const base = `https://api.vietqr.io/image/${bin}-${accountNo}-${ACQUIRER}-${TEMPLATE}.png`;
    const params = new URLSearchParams();
    if (amount) params.set("amount", amount);
    if (description) params.set("addInfo", description);
    params.set("accountName", ACCOUNT_NAME);
    return `${base}?${params.toString()}`;
  }

  function updateSummaryAndFooter() {
    const bankCode = bankSelectEl.value || "MBBANK";
    const accountNo = accountSelectEl.value;
    const bankLabel = BANKS[bankCode]?.label || bankCode;
    if (summaryTextEl) {
      summaryTextEl.textContent = `${bankLabel} • ${ACCOUNT_NAME} • ${accountNo}`;
    }
    if (footerBankEl) {
      footerBankEl.textContent = `Chuẩn VietQR • ${bankLabel}`;
    }
    if (footerAccountEl) {
      footerAccountEl.textContent = `Tài khoản: ${accountNo} • Chủ TK: ${ACCOUNT_NAME}`;
    }
    // Update default download name to reflect selection
    const fileName = `vietqr-${bankCode.toLowerCase()}-${accountNo}.png`;
    downloadBtn.setAttribute("download", fileName);
  }

  async function loadImageAsCanvas(url, size = 512) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = size;
        canvas.height = size;
        // cover fit
        const ratio = Math.max(size / img.width, size / img.height);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const dx = Math.round((size - w) / 2);
        const dy = Math.round((size - h) / 2);
        // background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, dx, dy, w, h);
        resolve(canvas);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  function clearPreview() {
    previewEl.innerHTML = "";
  }

  function showPlaceholder() {
    previewEl.innerHTML = `
      <div class="qr-preview__placeholder">
        <div class="qr-preview__badge">VietQR</div>
        <p class="qr-preview__text">Mã QR sẽ xuất hiện tại đây</p>
      </div>`;
    toolsEl.hidden = true;
  }

  async function renderQrImage(url) {
    clearPreview();
    const canvas = await loadImageAsCanvas(url, 640);
    canvas.style.maxWidth = "100%";
    canvas.style.borderRadius = "12px";
    previewEl.appendChild(canvas);
    // Prepare tools
    downloadBtn.href = canvas.toDataURL("image/png");
    toolsEl.hidden = false;
  }

  async function copyOrShareCanvas(canvas) {
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    if (!blob) throw new Error("toBlob failed");

    // 1) Try Clipboard API (desktop Chrome/Edge/Android Chrome mới)
    try {
      if (window.ClipboardItem && navigator.clipboard?.write) {
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        return { method: "clipboard" };
      }
      throw new Error("Clipboard image not supported");
    } catch (_) {
      // 2) Try Web Share API (iOS/Android: chia sẻ sang Ảnh/Tệp/Zalo…)
      try {
        const file = new File([blob], "vietqr.png", { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: "VietQR" });
          return { method: "share" };
        }
        throw new Error("Web Share not supported");
      } catch (_) {
        // 3) Fallback mở tab mới cho người dùng nhấn giữ để lưu/copy
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        return { method: "open" };
      }
    }
  }

  // Events
  amountEl.addEventListener("input", () => {
    const normalized = normalizeAmount(amountEl.value);
    amountEl.value = formatAmountDisplay(normalized);
  });

  contentEl.addEventListener("input", () => {
    const live = sanitizeContentLive(contentEl.value);
    contentEl.value = live;
  });

  resetBtn.addEventListener("click", () => {
    amountEl.value = "";
    contentEl.value = "";
    showPlaceholder();
  });

  bankSelectEl.addEventListener("change", () => {
    updateSummaryAndFooter();
  });

  accountSelectEl.addEventListener("change", () => {
    updateSummaryAndFooter();
  });

  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    generateBtn.disabled = true;
    try {
      const amount = normalizeAmount(amountEl.value);
      const description = normalizeContentForSubmit(contentEl.value);
      const apiUrl = buildVietQrApiUrl(amount, description);
      await renderQrImage(apiUrl);
    } catch (err) {
      console.error(err);
      showPlaceholder();
      alert("Không thể tạo ảnh VietQR. Vui lòng thử lại.");
    } finally {
      generateBtn.disabled = false;
    }
  });

  copyBtn.addEventListener("click", async () => {
    const canvas = previewEl.querySelector("canvas");
    if (!canvas) return;
    try {
      const result = await copyOrShareCanvas(canvas);
      if (result.method === "clipboard") {
        copyBtn.textContent = "Đã copy";
        setTimeout(() => (copyBtn.textContent = "Copy ảnh"), 1200);
      } else if (result.method === "share") {
        // Không cần đổi label sau khi share
      } else {
        // Đã mở tab mới
      }
    } catch (e) {
      console.error(e);
      alert("Không thể sao chép/chia sẻ ảnh. Hãy dùng nút Tải ảnh.");
    }
  });

  // Init
  // Ensure defaults (MBBANK + 231003999999) are reflected in UI
  if (bankSelectEl) bankSelectEl.value = "MBBANK";
  if (accountSelectEl) accountSelectEl.value = "231003999999";
  updateSummaryAndFooter();
  showPlaceholder();
})();
