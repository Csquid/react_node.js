const express = require('express');
const app = express();
const port = 3000;
const config = require('./config/key');

const { auth } = require('./middleware/auth');
const { User } = require('./models/User');

const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');

//application/x-www-form-urlencoded
app.use(bodyparser.urlencoded({extended: true}));
//application.json
app.use(bodyparser.json());
app.use(cookieParser());

const mongoose = require('mongoose');

// connect mongo db
mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
        .then(() => console.log('MongoDB Connected...'))
        .catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/api/users/register', (req, res) => {
    
    /*
        회원 가입 할때 필요한 정보들을 client에서 가져오면
        그것들을 데이터 베이스에 넣어준다.
    */
    
    // console.log("const user = new User(req.body);");
    //이 과정에서 User안에 있는 userSchema 안에 유저의 데이터가 다 들어가게 됨.
    const user = new User(req.body);
    // console.log("user.name: " + user.name);

    // user.save가 실행되기 전에 plaintext password(평문 텍스트 )
    user.save((err, userInfo) => {
        if(err) return res.json({ success: false, error: err});
        //성공했다는 표시
        return res.status(200).json({
            success: true,
            result: userInfo
        });
    });
    
});

app.post('/api/users/login', (req, res) => {

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

// role 1 어드민 role 2 특정 부서 어드민
// role 0 -> 일반유저 role 0이 아니면 관리자

app.get('/api/users/auth', auth, (req, res) => {
    //여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication 이 True 라는 말.
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})