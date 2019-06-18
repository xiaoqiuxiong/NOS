// 判断方法
module.exports = {
    // 项目名称
    appName: '不老书生',
    // jwt秘钥
    secret: 'xiaoqiuxiong',
    // 密码加盐强度
    SALT_WORK_FACTOR: 10,
    // 判断数据是否有值
    isEmpty: function(obj) {
        if (typeof obj == "undefined" || obj == null || obj == "") {
            return false;
        } else {
            return true;
        }
    }
}