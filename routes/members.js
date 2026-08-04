const express = require('express');
const initialMembers = require('../fixtures/members.json');

// ⚠️ 寫作業前先 `npm start` 打開 http://localhost:3000/docs 看 Swagger UI 的規格。
// 💡 /* 作答區 ... */ 是答題提示區，取消註解後填入你的程式碼。

// ───────────────────────────────────────────────────────────
// TODO 任務一：初始化 state + 內部 helpers
// ───────────────────────────────────────────────────────────

// 1. 複製 initialMembers，不直接改外部陣列
/* 作答區*/
const members = [...initialMembers];

// 2. 下一個新增會員要使用的 id
/* 作答區*/
const lastMember = members[members.length - 1];
//用let因為nextId會隨著新增會員而改變
let nextId = lastMember.id + 1;


// 3. 兩個內部 helper 函式

// 函式一：filterByQuery(list, query)：
// - 依據 query.level 篩選，沒帶就回全部
// - 任務二的 GET / 會使用到這個函式
/* 作答區*/
function filterByQuery(list, query) {
    //如果沒帶query.level->回傳全部會員list
    if (!query.level) {
        return list;
    }
    //如果有帶query.level->回傳符合條件的會員list
    //第二個return: list.filter()=>{return;} -> 會回傳只包含符合條件的元素的新陣列，並return給filter函式
    //第一個return: return list.filetr((){};) -> 再將filter函式回傳的新陣列回傳給filterByQuery函式
    //因為箭頭函式只有一行，可以省略 {return}
    //可寫成: return list.filter((member) => member.level === query.level);
    //但不可寫成 return list.filter((member) => { member.level === query.level; });
    //因為有{}就代表這是一個函式區塊，所以不能沒有return，會回傳undefined，導致filter函式回傳空陣列
    return list.filter((member) => { return member.level === query.level; });
}


// 函式二：validateBody(body)
// - 驗證 body 有沒有 name、level 欄位，要擋 null / undefined / {}
// - 驗證通過 → { valid: true }
// - 驗證失敗 → { valid: false, error: '缺 name 或 level' }
// - 任務三的 POST / 會使用到這個函式
/* 作答區*/
function validateBody(body) {
    //檢查 body 是否為 null 或 undefined
    if (!body) {
        return { valid: false, error: '缺 name 或 level' };
    }
    // 檢查是否缺少 name 或 level 欄位(包含空物件 {} 的情況)
    if (!body.name || !body.level) {
        return { valid: false, error: '缺 name 或 level' };
    }
    //驗證正確
    return { valid: true };
}



const router = express.Router();
// 此 router 掛在 app.js 的 '/members'，以下路由皆帶此前綴。舉例來說：
// - router.get('/') → GET /members
// - router.get('/:id') → GET /members/:id

// ───────────────────────────────────────────────────────────
// TODO 任務二：GET / 和 GET /:id
// ───────────────────────────────────────────────────────────

// GET /
// - 輸入：req.query.level 可帶 'VIP' | 'normal'（選填）
// - 輸出：200 + [{ id, name, level }, ...]
// - 提示：filterByQuery(members, req.query)
/* 作答區*/
// get不可大寫，因這是express api的設定
// Express Router 提供的方法名稱都是小寫，例如：get、post、put、delete
router.get('/', (req, res) => {
    const filteredMembers = filterByQuery(members, req.query);
    return res.status(200).json(filteredMembers);
});

// GET /:id
// - 輸入：req.params.id（string，需使用 Number() 轉換）
// - 輸出：200 + { id, name, level }，或 404 + { error: '會員不存在' }（找不到時）
// - 提示：members.find，找不到時結果是 undefined
/* 作答區*/
router.get('/:id', (req, res) => {
    // Express 的 req.params 來源是 URL，因此所有參數值都是字串（String），
    // 若需要與數字比較或做數值運算，需先使用 Number() 轉型。
    const id = Number(req.params.id);
    //找唯一值，所以find比filter更適合
    // find找到後立刻停止
    // callback回傳true或false，true -> find() 立即停止並回傳該元素，false -> find() 繼續尋找下一個元素
    const member = members.find((member) => member.id === id);
    //find找不到時會回傳undefined，所以要判斷是否為undefined
    // if (member === undefined) {} 也可寫成 if (!member) {}
    if (member === undefined) {
        return res.status(404).json({ error: '會員不存在' });
    }
    //找得到回傳會員資料
    return res.status(200).json(member);
});

// ───────────────────────────────────────────────────────────
// TODO 任務三：POST /
// ───────────────────────────────────────────────────────────

// POST /
// - 輸入：body = { name: string, level: 'VIP' | 'normal' }
// - 輸出：201 + 新會員物件（id 自動配），或 400 + { error: '缺 name 或 level' }（驗證失敗）
// - 提示：validateBody(req.body) 驗證；通過後用 spread 將 req.body 的欄位與 nextId 自動遞增的 id 合為新物件，push 進 members
// - 範例：POST /members body { name: '阿文', level: 'VIP' } → 201 { id: 5, name: '阿文', level: 'VIP' }
/* 作答區
router.METHOD('PATH', (req, res) => { ... });
*/

// ───────────────────────────────────────────────────────────
// TODO 任務四：PUT /:id 和 DELETE /:id
// ───────────────────────────────────────────────────────────

// PUT /:id
// - 輸入：req.params.id（string，需 Number() 轉換）、body（部分欄位，例如只傳 { level: 'normal' }）
// - 輸出：200 + merge 後的會員，或 404 + { error: '會員不存在' }（找不到時）
// - 提示：members.findIndex 找索引，-1 回應 404；找到索引則使用 spread 合併 members[idx] 與 req.body（req.body 需注意順序來覆蓋舊欄位），最後將結果存回 members[idx]
// - 範例：PUT /members/1 body { level: 'normal' } → 200 { id: 1, name: '小華', level: 'normal' }（name 被保留）
/* 作答區
router.METHOD('PATH', (req, res) => { ... });
*/

// DELETE /:id
// - 輸入：req.params.id（string，需 Number() 轉換）
// - 輸出：204（無 body），或 404 + { error: '會員不存在' }（找不到時）
// - 提示：members.findIndex 找索引，-1 回應 404；找到索引則 splice 移除，再設定 status 204 並以 .end() 結束回應（204 不帶 body）
/* 作答區
router.METHOD('PATH', (req, res) => { ... });
*/

module.exports = router;
