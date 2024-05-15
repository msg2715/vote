const express = require('express')
const app = express()
const cookieParser = require("cookie-parser")

app.use(express.json()); // JSON 형태의 요청 본문을 파싱
app.use(express.urlencoded({ extended: true })); // URL-encoded 형태의 요청 본문을 파싱
app.use(cookieParser())

const { MongoClient } = require('mongodb')

app.set('view engine', 'ejs')
app.use(express.static("./public"))

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// db연결 & 서버실행
let db
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
    let voteInfo = await db.collection('post').find().toArray()
    const userNickname = req.cookies.userNickname || null
    res.render('index', { userNickname: userNickname, voteInfo: voteInfo })
})

app.get('/search', (req, res)=>{
    const userNickname = req.cookies.userNickname || null
    res.render('search', { userNickname: userNickname })
})

app.get('/make', (req, res)=>{
    const userNickname = req.cookies.userNickname || null
    if (!userNickname) {
        res.send('<script>alert("로그인을 해야 사용할 수 있는 기능입니다!."); location.href="/login";</script>')
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

    
    const VOTEITEM = [];
    
    for (let i = 1; i <= 5; i+=1) {
        const voteItemName = `vote${i}`;
        if (req.body[voteItemName]) {
            VOTEITEM.push(req.body[voteItemName]);
        }
    }

    db.collection('post').insertOne({
        nickname : userNickname,
        content : req.body.content,
        voteItem: VOTEITEM
    })
    res.send('<script>alert("업로드 완료!"); location.href="/";</script>')


})