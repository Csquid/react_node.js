// process.env.NODE_ENV는 환경 변수
// 만약 develop mode에 있을때는 development 라고 뜨고 Deploy(배포) 후에는 production 이라고 나옴

if(process.env.NODE_ENV == 'production') {
    module.exports = require('./prod');
} else {
    module.exports = require('./dev');
}