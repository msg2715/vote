const express = require('express')
const app = express()

app.use(express.json()); // JSON 형태의 요청 본문을 파싱
app.use(express.urlencoded({ extended: true })); // URL-encoded 형태의 요청 본문을 파싱

const { MongoClient } = require('mongodb')

app.set('view engine', 'ejs')
app.use(express.static("./public"))


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
app.get('/', (req, res)=>{
    res.render('index')
})

app.get('/search', (req, res)=>{
    res.render('search')
})

app.get('/make', (req, res)=>{
    res.render('make')
})

app.get('/login', (req, res)=>{
    res.render('login')
})

app.post('/login', async(req, res) => {
    let id = await db.collection('user').findOne({ userId: req.body.id })
    console.log(id)
    if (!id) {
        return cb(null, false, { message: '아이디 또는 비밀번호가 틀렸습니다.' })
    }else{
        if(result.pw == req.body.password){
            res.redirect('/')
        }else{
            alert("아이디 또는 비밀번호가 틀렸습니다.")
        }
    }
})

app.get('/signup', (req, res)=>{
    res.render('signup')
})

app.post('/signup', (req, res)=>{
    db.collection('user').insertOne({
        userId : req.body.id,
        pw : req.body.pw,
        nickname: req.body.nickname
    })
    alert("회원가입 완료!")
})
