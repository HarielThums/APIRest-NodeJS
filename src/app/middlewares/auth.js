const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth.json')

module.exports = (req,res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader)
        return res.status(401).send({ error: 'No token provided' })
    
    // bearer seguido do hash ( esse é o formato esperado do token )
    const parts = authHeader.split(' ')
    if (!parts.length === 2)
        return res.status(401).send({ error: 'Token error' })
    
    // scheme deve receber o bearer, e o token o restante
    const [ scheme, token ] = parts

    // utilizando regex para verificar o bearer
    if (!/^Bearer$/.test(scheme))
        return res.status(401).send({ error: 'Token malformatted' })
    
    jwt.verify(token, authConfig.secret, (err, decoded) => { // erro se houver, ou decoded que é o id do user, caso de certo!
        if (err)
            return res.status(401).send({ error: 'Token invalid' })

        req.userId = decoded.id // id é necessario pois será acessado pelos outros controllers
        return next() // se chegou aqui, todas as validações foram feitas
    })
}