var mailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var handlebars = require('handlebars');
var path = require('path');
var fs = require('fs');

var mailOptions = {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 25,
    auth: {
        user: process.env.EMAIL_USER || "adherencepill@gmail.com",
        pass: process.env.EMAIL_PASSWORD || "adherencepill!"
    }
};

var transporter = mailer.createTransport(smtpTransport(mailOptions));

function getTemplate(templateFile, callback) {
    console.log(templateFile);
    templateFile = path.join(__dirname, templateFile);
    fs.readFile(templateFile, 'utf8', function (err, template) {
        if (!err) {
            console.log('read file success');
            return callback.success(template);
        } else {
            console.log('cannot read the template file');
            return callback.error(err);
        }
    });
}

function sendEmail(data, info, callback) {
    getTemplate(info.templateFile, {
        success: function success(template) {
            var source = template;
            var template = handlebars.compile(source);
            handlebars.registerHelper('link', function(host, type, token, email, firstname) {
                return new handlebars.SafeString(host + type +'?key=' + token + '&email=' + email +'&firstname=' + firstname);
            });
            console.log(info.type);
            var htmlInfo = {
                host: "http://localhost:5000",
                type: info.type,
                token: info.token,
                email: info.email,
                firstname: info.firstname,

            };
            var html = template(htmlInfo);
            console.log(html);
            data.html = html;
            transporter.sendMail(data, function(error) {
                if (error) {
                    return callback.error(error);
                } else {
                    return callback.success();
                }
            });
        },
        error: function error(error) {
            return callback.error(error);
        }
    })
}

exports.forgetPassword = function(email, token, firstname, callback) {
    var from = process.env.EMAIL_USER;
    var to = email;
    var subject = "Reset your password at Adherence Pill";
    var data = {
        from: from,
        to: to,
        subject: subject,
        html: ""
    };
    var info = {
        token: token,
        email: email,
        firstname: firstname,
        templateFile: '../views/resetPassword.ejs',
        type:"/account/newPassword"
    }
    sendEmail(data, info, {
        success: function success() {
            return callback.success();
        },
        error: function error(error) {
            return callback.error(error);
        }
    });
};

exports.activateEmail = function(email, token, firstname, callback) {
    var from = process.env.EMAIL_USER;
    var to = email;
    var subject = "Activate your account at Adherence Pill";
    var data = {
        from: from,
        to: to,
        subject: subject,
        html: ""
    };
    var info = {
        token: token,
        email: email,
        firstname: firstname,
        templateFile: '../views/activateAccount.ejs',
        type: "/account/email"
    }
    sendEmail(data, info, {
        success: function success() {
            return callback.success();
        },
        error: function error(error) {
            return callback.error(error);
        }
    });
};