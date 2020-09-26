const express = require('express')
const app = express()
const port = 3000
const config = require('./config/key')
const { User } = require('./models/User');
const bodyparser = require('body-parser');

//application/x-www-form-urlencoded
app.use(bodyparser.urlencoded({extended: true}));

//application.json
app.use(bodyparser.json());

const mongoose_account = require('./private/mongoose_account.json');
const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/register', (req, res) => {
    
    //회원 가입 할때 필요한 정보들을 client에서 가져오면
    // 그것들을 데이터 베이스에 넣어준다.
    
    const user = new User(req.body);

    user.save((err, userInfo) => {
        if(err) return res.json({ success: false, error: err});
        //성공했다는 표시
        return res.status(200).json({
            success: true
        });
    });
    
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})