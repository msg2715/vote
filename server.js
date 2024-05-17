const express = require('express')
const app = express()
const cookieParser = require("cookie-parser")

app.use(express.json()); // JSON 형태의 요청 본문을 파싱
app.use(express.urlencoded({ extended: true })); // URL-encoded 형태의 요청 본문을 파싱
app.use(cookieParser())

const { MongoClient } = require('mongodb')

const cron = require('node-cron');

app.set('view engine', 'ejs')
app.use(express.static("./public"))

// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// db연결 & 서버실행
let db, client
const url = 'mongodb+srv://voteadmin:vote4519@cluster0.tt2bt5b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
new MongoClient(url).connect().then((client)=>{ 
    console.log('DB연결성공')
    db = client.db('web')
    app.listen(8080, ()=>{
        console.log('http://localhost:8080 실행중')
    })
}).catch((err)=>{
    console.log(err)
})


// 라우트 정의
app.get('/', async(req, res)=>{
    const userNickname = req.cookies.userNickname || null
    let voteInfo = await db.collection('post').find().sort({date: -1}).toArray()

    res.render('index', { userNickname: userNickname, voteInfo: voteInfo })
})

app.post('/vote', async (req, res) => {
    const userNickname = req.cookies.userNickname || null

    if (!userNickname) { // 로그인이 되어있는지 여부
        res.send('<script>alert("로그인을 해야 사용할 수 있는 기능입니다!"); location.href="/login";</script>')
    } else {

        const collection = db.collection('post');
        let voteed = await collection.findOne({ voteUser: userNickname })
        const voteId = req.body.voteId;
        const itemIndex = req.body.itemIndex;
        const documentIndex = req.body.documentIndex;
        
        if (voteed) { // 이미 투표를 했는지 여부
            let index = Number(voteed.voteUser.indexOf(userNickname));
            console.log(Number(itemIndex), index)
            if (Number(itemIndex) != index) { // 이미 투표하고있지만 다른 항목을 투표하는경우 -> 투표 옮기기

                await collection.update(
                    { "voteContent": index },
                    { 'voteContent.$': itemIndex }
                );

            } else { // 이미 투표했지만 같은 항목을 투표하는 경우 -> 투표 취소

                await collection.updateOne(
                    { _id: new ObjectId(voteId) },
                    {
                        $inc: { total: -1 },
                        // $pull: { voteUser: userNickname, voteContent: index }
                    }
                );

            }
        } else { // 투표를 한적이 없다

            const { ObjectId } = require('mongodb');
            await collection.updateOne(
                { _id: new ObjectId(voteId) },
                {
                    $inc: { [`votes.${itemIndex}`]: 1, "total": 1 },
                    $push: { "voteUser": userNickname, "voteContent": itemIndex }
                }
            );
        }

        const update = await collection.findOne({ _id: new ObjectId(voteId) });

        res.send({ update: update, documentIndex: documentIndex, userNickname: userNickname });

    }
        }
);

app.get('/closed', (req, res)=>{
    const userNickname = req.cookies.userNickname || null
    res.render('search', { userNickname: userNickname })
})

app.get('/make', (req, res)=>{
    const userNickname = req.cookies.userNickname || null
    if (!userNickname) {
        res.send('<script>alert("로그인을 해야 사용할 수 있는 기능입니다!"); location.href="/login";</script>')
    } else {
        res.render('make', { userNickname: userNickname })
    }
})

app.get('/login', (req, res)=>{
    res.render('login')
})

app.post('/login', async(req, res) => {
    let userinfo = await db.collection('user').findOne({ userId: req.body.id })
    if (!userinfo) {
        res.send('<script>alert("아이디 또는 비밀번호가 틀렸습니다."); location.href="/login";</script>')
    }else{
        if(userinfo.pw == req.body.password){
            res.cookie('userNickname', userinfo.nickname, { maxAge: 60000*60, path: '/' })
            res.send('<script>alert("로그인 성공!"); location.href="/";</script>')
        }else{
            res.send('<script>alert("아이디 또는 비밀번호가 틀렸습니다."); location.href="/login";</script>')
        }
    }
})

app.get('/signup', (req, res)=>{
    res.render('signup')
})

app.post('/signup', async(req, res)=>{
    let userId = await db.collection('user').findOne({ userId: req.body.id })
    let userNickname = await db.collection('user').findOne({ nickname: req.body.nickname })
    if (userId || userNickname) {
        if (userId) {
            res.send('<script>alert("이미 있는 아이디입니다."); location.href="/signup";</script>')
        } else{
            res.send('<script>alert("이미 있는 닉네임입니다."); location.href="/signup";</script>')
        }
    }else{
        db.collection('user').insertOne({
            userId : req.body.id,
            pw : req.body.pw,
            nickname: req.body.nickname
        })
        res.send('<script>alert("회원가입 완료!"); location.href="/";</script>')
    }
})

app.get('/logout', (req, res) => {
    res.clearCookie('userNickname', { path: '/' }).redirect('/')
})

app.post('/upload', (req, res) => {
    const userNickname = req.cookies.userNickname || null

    if (!userNickname) {
        return res.send('<script>alert("로그인이 필요합니다."); location.href="/login";</script>')
    }

    
    const VOTEITEM = []; // 투표 항목마다 내용
    const VOTES = []; // 투표 항목마다 몇표를 받았는지
    
    for (let i = 1; i <= 5; i+=1) {
        const voteItemName = `vote${i}`;
        if (req.body[voteItemName]) {
            VOTEITEM.push(req.body[voteItemName]);
            VOTES.push(0);
        }
    }

    db.collection('post').insertOne({
        nickname : userNickname, // 투표를 올린 유저의 닉네임
        content : req.body.content, // 투표의 제목같은 내용적는 곳
        voteItem: VOTEITEM, // 투표의 항목들s
        votes: VOTES, // 항목마다 받은 투표 순
        total: 0, // 투표를 한 유저의 수
        voteUser: [], // 투표를 한 유저
        voteContent: [], // 투표를 한 유저가 어떤 항목에 투표했는지
        date: Date.now()
    })
    res.send('<script>alert("업로드 완료!"); location.href="/";</script>')


})


// post에 있는 3일이 지난 데이터를 closed 컬렉션으로 이동
async function moveData() {
    try {
        const source = db.collection("post");
        const target = db.collection("closed");

        const threeDaysAgo = new Date(new Date().getTime() - (3 * 24 * 60 * 60 * 1000)); // 지금으로부터 3일전 날짜 계산
        const query = { "date": { $lt: threeDaysAgo } };
        const documentsToMove = await source.find(query).toArray(); // date 값이 3일보다 이전인 문서를 찾는다.

        if (documentsToMove.length > 0) {
            await target.insertMany(documentsToMove);
            await source.deleteMany(query);
        }
    } finally {
        return
    }
}


cron.schedule('0 * * * * *', () => {
    moveData();
});