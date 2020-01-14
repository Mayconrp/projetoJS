// gerar o token
const { authSecret } = require('../.env')
// gerar o token
const jwt = require('jwt-simple')
const bcrypt = require('bcrypt-nodejs')

module.exports = app => {

    const signin = async (req, res) => {
        try {
             // validar email se veio no corpo da requisição
            if(!req.body.email) {
                return res.status(400).send('Informe usuário e senha! ')
            }

            //busca dado do usuário da requisição no banco
            const user = await app.db('users')
                .where({ email: req.body.email }).first()

            if (!user) return res.status(400).send('Usuário não encontrado! ')

            // compara senha criptografada
            const isMatch = bcrypt.compareSync(req.body.password, user.password)
            if (!isMatch) return res.status(401).send('Email/senha inválidos!')

            const now = Math.floor(Date.now() / 1000)

            const payload = {
                id: user.id,
                name: user.name,
                email: user.email,
                admin: user.admin,
                iat: now,
                exp: now + (60 * 60 * 24 )
            }

            res.json({
                ...payload,
                token: jwt.encode(payload, authSecret)
            })
        
        } catch (error) {
            return res.status(401).send('Algo deu errado: '+ error)
        }

       
    }

    const validateToken = async (req, res) => {
        const userData = req.body || null

        try {
            if(userData){
                const token = jwt.decode(userData.token, authSecret)
                if(new Date(token.exp * 1000) > new Date()){
                    return res.send(true)
                }
            }
        } catch (e) {
            // problema com o token
        }

        res.send(false)
    }

    return { signin, validateToken }

}
