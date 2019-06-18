const mongoose = require('mongoose')
const autoIncrement = require('mongoose-auto-increment2');
var connection = mongoose.createConnection("mongodb://localhost/NOS");
autoIncrement.initialize(connection);
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')
const SALT_WORK_FACTOR = 10

//创建UserShema
const userSchema = new Schema({
    userName: {
        unique: true,
        type: String
    },
    password: String,
    createAt: {
        type: Date,
        default: Date.now()
    },
    lastLoginAt: {
        type: Date,
        default: Date.now()
    }
})
// 自增 ID 插件配置
userSchema.plugin(autoIncrement.plugin, {
    model: 'User',
    field: 'userId',
    startAt: 1,
    incrementBy: 1,
});

userSchema.pre('save', function (next) {
    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
        if (err) return next(err)
        bcrypt.hash(this.password, salt, (err, hash) => {
            if (err) return next(err)
            this.password = hash
            next()
        })
    })
})

userSchema.methods = {
    comparePassword: (_password, password) => {
        return new Promise((resolve, reject) => {
            bcrypt.compare(_password, password, (err, isMatch) => {
                if (!err) resolve(isMatch)
                else reject(err)
            })
        })
    }
}


//发布模型
module.exports = mongoose.model('User', userSchema);