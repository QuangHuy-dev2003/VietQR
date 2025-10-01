## VietQR MBBANK – QR chuyển khoản tự động (HTML/CSS/JS thuần)

Một trang web siêu nhẹ cho phép tạo mã VietQR chuyển khoản. Người dùng nhập số tiền và nội dung, bấm "Tạo mã" để hiển thị QR, có thể tải ảnh PNG hoặc copy ảnh vào clipboard.

### Tính năng chính

- **Ngân hàng mặc định**: MBBANK – TK `091890889999` – Chủ TK `DAO QUANG HUY`.
- **Chuẩn hóa dữ liệu**:
  - Số tiền: hiển thị phân tách 1,000 khi gõ; khi gửi là số thuần (không dấu).
  - Nội dung: khi gõ vẫn giữ khoảng trắng; khi tạo mã sẽ bỏ dấu, chỉ chữ/số/khoảng trắng, gộp nhiều khoảng trắng, trim, chuyển lowercase.
- **Sinh ảnh VietQR** dùng API render của `api.vietqr.io` theo template `compact2`.
- **Hành động nhanh**: Tải PNG hoặc Copy ảnh vào clipboard.
- **UI/UX**: Bố cục đẹp, tối ưu responsive cho mobile; BEM cho CSS.

### Cấu trúc thư mục

```text
CODEQR/
├─ index.html
├─ scripts/
│  └─ app.js
└─ styles/
   ├─ root.css
   └─ index-page.css
```

### Cách chạy

- Mở trực tiếp file `index.html` trong trình duyệt là dùng được.
- Không cần cài đặt build tool hay server.

### Hướng dẫn thay thông tin ngân hàng/tài khoản

Mở file `scripts/app.js` và chỉnh các hằng số sau ở đầu file:

```js
// scripts/app.js
const BANK_BIN = "970422"; // BIN ngân hàng (MBBANK mặc định)
const ACCOUNT_NO = "091890889999"; // Số tài khoản
const ACCOUNT_NAME = "DAO QUANG HUY"; // Chủ tài khoản (IN HOA khuyến nghị)
const ACQUIRER = "vietqr"; // Không đổi
const TEMPLATE = "compact2"; // Template ảnh (compact2/revamp/...)
```

- Để đổi sang ngân hàng khác, thay `BANK_BIN` tương ứng. Danh sách BIN bạn có thể tham khảo tại trang VietQR. Ví dụ: `Vietcombank = 970436`, `Techcombank = 970407`, `VPBank = 970432`, ...
- Sửa `ACCOUNT_NO` và `ACCOUNT_NAME` theo tài khoản cần nhận.

### Cách hoạt động (tóm tắt)

- Ứng dụng dựng URL ảnh theo chuẩn VietQR: `https://api.vietqr.io/image/{BIN}-{ACCOUNT}-{ACQUIRER}-{TEMPLATE}.png?amount=...&addInfo=...&accountName=...`
- Ảnh được tải về và vẽ lên `canvas` để:
  - Cho phép tải PNG.
  - Cho phép copy vào clipboard (nếu trình duyệt hỗ trợ `ClipboardItem`).

### Tùy chỉnh giao diện

- Màu sắc, biến design token: `styles/root.css`.
- Bố cục trang và form (BEM): `styles/index-page.css`.
- Nếu muốn căn lại nút, chỉnh khối `qr-form__actions`.

### Ghi chú

- Nếu trình duyệt không hỗ trợ copy ảnh qua Clipboard API, phần mềm sẽ hiển thị thông báo và bạn dùng nút Tải ảnh thay thế.
- Template `compact2` cho ảnh gọn, có logo ngân hàng; bạn có thể thử các template khác của VietQR bằng cách đổi `TEMPLATE`.

### Triển khai

- Có thể deploy tĩnh lên GitHub Pages, Netlify, Vercel... vì dự án chỉ là HTML/CSS/JS thuần.

---

Nếu bạn cần mở rộng (đa ngân hàng, đổi chủ đề màu, thêm preset nội dung...), hãy tạo issue/nhờ mình hỗ trợ.
