const mongoose = require('mongoose')
const autoIncrement = require('mongoose-auto-increment2');
var connection = mongoose.createConnection("mongodb://localhost/NOS");
autoIncrement.initialize(connection);
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')
const utils = require('../../util')

//创建UserShema
const adminSchema = new Schema({
    username: {
        unique: true,
        require: true,
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
adminSchema.plugin(autoIncrement.plugin, {
    model: 'Admin',
    field: 'adminId',
    startAt: 1,
    incrementBy: 1,
});

adminSchema.pre('save', function(next) {
    // 加密模块
    bcrypt.genSalt(utils.SALT_WORK_FACTOR, (err, salt) => {
        if (err) return next(err)
        bcrypt.hash(this.password, salt, (err, hash) => {
            if (err) return next(err)
            this.password = hash
            next()
        })
    })
})

adminSchema.methods = {
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
module.exports = mongoose.model('Admin', adminSchema);