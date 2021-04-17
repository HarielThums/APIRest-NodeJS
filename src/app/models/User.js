const mongoose = require('../../database')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        unique: true,
        require: true,
        lowercase: true
    },
    password: {
        type: String,
        require: true,
        select: false // pra quando for buscado usuarios, essa informação não vir junto.
    },
    passwordResetToken: { // guardando o token para recuperação de senha
        type: String,
        select: false,
    },
    passwordResetExpires: { // guardando tempo para experirar token de recuperação
        type: Date,
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})
// Função do mongoose que permite executar funções antes de salvar.
UserSchema.pre('save', async function(next) {
    const hash = await bcrypt.hash(this.password, 10) // numero de round de encriptação ( 10 )
    this.password = hash

    next()
})

const User = mongoose.model('User', UserSchema)

module.exports = User