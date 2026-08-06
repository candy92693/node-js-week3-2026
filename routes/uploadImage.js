const express = require('express');
const fs = require('node:fs');
const { formidable } = require('formidable');

// ⚠️ 寫作業前先 `npm start` 打開 http://localhost:3000/docs 看 Swagger UI 的規格。
// 💡 /* 作答區 ... */ 是答題提示區，取消註解後填入你的程式碼。

const uploadDir = process.env.UPLOAD_DIR || '/tmp/uploads';
const maxFileSize = (Number(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024;

fs.mkdirSync(uploadDir, { recursive: true });

const router = express.Router();

// ───────────────────────────────────────────────────────────
// TODO 任務五：POST /
//   （實際 URL 是 /uploadImage，因為 app.js 把這個 router 掛在 '/uploadImage'）
// ───────────────────────────────────────────────────────────

// POST /
// - 輸入：multipart/form-data，field 名稱 `image`
// - 輸出：200 + { filename: file.originalFilename, sizeKB: Math.round(file.size / 1024), savedPath: file.filepath }，或 400 + { error: 'No file uploaded' }（沒帶 image）
// - 提示：建立 formidable 實例（uploadDir、keepExtensions: true、maxFileSize），用 form.parse(req, (err, fields, files) => { ... }) 解析，其中 err 不為 null 時回 500 + { error: err.message }
// - 注意：formidable v3 的 files.image 為陣列，需以 Array.isArray 判斷並取 [0]
/* 作答區*/
router.post('/', (req, res) => {
    const form = formidable({
        uploadDir,
        keepExtensions: true,
        maxFileSize,
    });
    //req是參數，交給 formidable 解析的 HTTP Request
    //(err, fields, files) => {}：解析完成後執行的 callback function，fields放文字欄位，files是檔案欄位
    form.parse(req, (err, fields, files) => {
        // 若解析過程發生錯誤（err 不為 null），回傳 500
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        //沒有image欄位，回400
        if (!files.image) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        // Formidable v3 預設會回傳陣列，但為了兼容不同版本或不同 API 設計，
        // 仍先使用 Array.isArray() 判斷型別。
        // 若是陣列就取第一個元素，否則直接使用files.image
        // 防禦性寫法，讓程式在未來面對不同版本或不同回傳格式時，也能正常運作
        // 這種賦予一個值的條件判斷可以用三元運算子寫法
        const file = Array.isArray(files.image) ? files.image[0] : files.image;
        //回傳檔案資訊，檔案大小轉成 KB 並四捨五入
        return res.status(200).json({
            filename: file.originalFilename,
            sizeKB: Math.round(file.size / 1024),
            savedPath: file.filepath,
        });
    });
});

module.exports = router;
