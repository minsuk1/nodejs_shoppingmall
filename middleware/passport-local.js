const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passwordHash = require('../helpers/passwordHash');
const models = require('../models');

passport.serializeUser(  (user, done) => {
    console.log('serializeUser');
    done(null, user);
});

passport.deserializeUser(  (user, done) => {
    console.log('deserializeUser');
    done(null, user);
});


passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField : 'password',
    passReqToCallback : true
}, 
    async ( req , username , password, done) => {

        // 조회
        const user = await models.User.findOne({
            where: {
                username,
                password : passwordHash(password),
            },
            attributes: { exclude: ['password'] }
        });

        // 유저에서 조회되지 않을시
        if(!user){
            return done(null, false, 
                { message: '일치하는 아이디 패스워드가 존재하지 않습니다.' });


        // 이메일 인증이 되지 않을시
        }else if(user.status == "이메일미인증"){
            return done(null, false, { message: '이메일 인증을 진행해주세요.' });

        // 유저에서 조회 되면 세션등록쪽으로 데이터를 넘김
        }else{
            return done(null, user.dataValues );
        }
        
    }
));

module.exports = passport;