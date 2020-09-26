const express = require('express')
const app = express()
const port = 3000
const config = require('./config/key')
const { User } = require('./models/User');
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');

//application/x-www-form-urlencoded
app.use(bodyparser.urlencoded({extended: true}));
//application.json
app.use(bodyparser.json());
app.use(cookieParser());

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

app.post('/login', (req, res) => {

    //요청된 이메일을 데이터베이스에서 있는지 찾는다.
    User.findOne({ email: req.body.email }, (err, user) => {
        if(!user) {
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }
        //요청한 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호 인지 확인
    
        user.comparePassword(req.body.password, (err, isMatch) => {
            
            if(!isMatch)
                return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다. "});
    
            //비밀번호 까지 맞다면 포큰을 생성하기.
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err);
    
                // 토큰을 저장한다. --> 어디에? --> 쿠키, 로컬스토리지
                res.cookie("x_auth", user.token)
                .status(200)
                .json({ loginSuccess: true, userID: user._id});
            });

        });

    });

});
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})