const mongoose = require('mongoose');
//Salt를 이용해서 비밀번호를 암호화 해야 함.
//10자리인 salt(소금) 를 만들어서 암호화 한다
const saltRounds = 10;                          
//bcrypt: 비밀번호를 암호화 하는것
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: { //토큰 유효기간
        type: Number
    }
});

//저장을 하기 전에 무언가를 하는 함수
userSchema.pre('save', function( next ) {
    let user = this;
    
    // 유저의 패스워드가 변경이 될때만 실행
    if(user.isModified('password')) {

        console.log('inside')
        // console.log(user);
    
        //비밀번호를 암호화 시킨다.
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if(err) return next(err);
            //user.password == plaintext Password (일반 텍스트 패스워드)
            bcrypt.hash(user.password, salt, function(err, hash) {
                if(err) return next(err);
    
                //일반 텍스트 패스워드를 해쉬된 패스워드로 바꿔준다.
                user.password = hash;
                next();

                console.log("break");
            });
        });

    } else {        // 만약 패스워드를 바꾸는게 아니라면 바로 나올수있게
        next();
    }

});
//이게 다 끝나면 register touter - user.save가 진행이 됨

userSchema.methods.comparePassword = function(plainPassword, cb) {
    //plainPassword 1234567     암호화된 비밀번호: $2b$10$pDkBoI2WbCc7eL4QwRNdXOPqwiUpCGlug5uW1uofIIftuVQ2RURv
    bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
        if(err) return cb(err);
        
        cb(null, isMatch);
    })
}

userSchema.methods.generateToken = function(cb) {

    let user = this;

    //jsonwebtoken을 이용해서 token 생성하기
    let token = jwt.sign(user._id.toHexString(), 'secretToken')
    //user._id + 'secretToken' = token
    // ->
    // 'secretToken' -> user._id

    user.token = token;
    user.save(function(err, user) {
        if(err) return cb(err);

        cb(null, user);
    })
}

userSchema.statics.findByToken = function (token, cb) {
    let user = this;

    // user.id + 'secretToken'
    // 토큰을 decode 한다.

    jwt.verify(token, 'secretToken', function(err, decoded) {
        //유저 아이디를 이용해서 유저를 찾은 다음에
        //클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인

        user.findOne({"_id": decoded, "token": token}, function(err, user) {
            if(err) return cb(err);

            cb(null, user);
        })
    })
}
const User = mongoose.model('User', userSchema);

module.exports = { User }