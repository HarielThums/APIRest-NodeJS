const express = require('express')
const User = require('../models/User')
const router = express.Router()
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth.json')
const mailer = require('../../modules/mailer')

function generateToken(params = {}){
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400, // token expira a cada 24 horas
    }) // segredo criado com hash md5 armazenado no json em config.
}

router.post('/register', async (req,res) => {
    const { email } = req.body

    try {
        if ( await User.findOne({ email }))
            return res.status(400).send({ error: 'User already exists' })

        const user = await User.create(req.body)

        user.password = undefined // para a senha não voltar no corpo da requisição

        return res.send({
            user,
            token: generateToken({ id: user.id }),
        })
    } catch( err ) {
        return res.status(400). send({ error: 'Registration failed'})
    }
})

router.post('/authenticate', async (req,res) => {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password') // necessario dar select na passwor, pois definimos no db que o campo pass seria select false

    if (!user)
        return res.status(400).send({ error: 'User not found'})

    if (!await bcrypt.compare(password, user.password)) // comparando senha que o user está tentando com a que está armazenada no db
        return res.status(400).send({error: 'Invalid password'})

    user.password = undefined // para a senha não voltar no corpo da requisição

    res.send({ 
        user,
        token: generateToken({ id: user.id }),
    }) // caso não haja nenhum erro, será permitido o login.
})

// Recuperação de senha

router.post('/forgot_password', async (req,res) => {
    const { email } = req.body
    try {
        const user = await User.findOne({ email })

        if (!user)
            return res.status(400).send({ error: 'User not found'})

        const token = crypto.randomBytes(20).toString('hex') // gerando token hex que será enviado via email

        const now = new Date()
        now.setHours(now.getHours() + 1) // Definindo tempo de 1 hora para limitar duração do token 

        await User.findByIdAndUpdate(user.id, {
            '$set': { // set indica quais campos serão alterados
                passwordResetToken: token,
                passwordResetExpires: now
            }
        })

        mailer.sendMail({
            to: email,
            from: 'hariel@hotmail.com',
            template: 'auth/forgot_password',
            context: { token },
        }, (err) => {
            if (err)
                return res.status(400).send({ error: 'Cannot send forgot password email' })
            
            return res.send()
        })


    } catch (err) {
        res.status(400).send({ error: 'Erro on forgot password, try again' })
    }

router.post('/reset_password', async (req,res) => {
    const { email, token, password } = req.body
    try {
        const user = await User.findOne({ email })
            .select('+passwordResetToken passwordResetExpired') // tem que ser requisitado pois esses campos estão com select false no database
        
        if (!user)
            return res.status(400).send({ error: 'User not found'})

        if (token !== user.passwordResetToken)
            return res.status(400).send({ error: 'Token invalid'})

        const now = new Date()
        if (now > user.passwordResetExpires)
            return res.status(400).send({ error: 'Token expired, generete a new one'})

        //Se todas as validações estiverem ok, basta enviar a nova senha;
        user.password = password

        await user.save();
        
        res.send()

    } catch (err) {
        res.status(400).send({ error: 'Cannot reset password, try again' })
    }
})

})
module.exports = app => app.use('/auth', router) // passando o auth para o (app)