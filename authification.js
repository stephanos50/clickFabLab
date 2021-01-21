
const LocalStrategy = require("passport-local").Strategy;
const {User, Role, Permission} = require("./models/User");
const passport = require("passport");

exports.initialiser = function (){
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findByPk(username);
        if (user && (await user.validPassword(password))) {
          done(null, user);
        } else {
          return done(null, false, { message: "Incorrect email or password" });
        }
      } catch (error) {
        done(error);
      }
    })
  );
  passport.serializeUser((user, done) => {
    done(null, user.username);
  });

  passport.deserializeUser(async (username, done) => {
    try {
      const user = await User.findByPk(username, {
        include: { all: true, nested: true },
      });
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

}


