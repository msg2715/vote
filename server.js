const express = require('express')
const app = express()

app.set('view engine', 'ejs')
app.use(express.static("./public"))

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

app.get('/singup', (req, res)=>{
    res.render('singup')
})


// 서버실행
app.listen(8080, ()=>{
    console.log('http://localhost:8080 실행중')
})