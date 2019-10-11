const bcrypt = require('bcrypt-nodejs')

// representa a instancia do express
module.exports = app => {
    const {existsOrErros , notExistsOrError , equalsOrError} = app.api.validation

    // funcao arrow para encriptografar a senha
    const encryptPassword = password => {
        const salt = bcrypt.genSaltSync(10)
        // gera o hash da senha
        return bcrypt.hashSync(password , salt)
    }

    const save = async (req , res ) => {
        // json pelo corpo na requisisao
        const user = {...req.body}
        if(req.params.id) user.id = req.params.id        

        try {
            existsOrErros(user.name , 'Nome não informado' )
            existsOrErros(user.email , 'E-mail não informado' )
            existsOrErros(user.password , 'Senha não informado' )
            existsOrErros(user.confirmPassword , 'Confirmação de senha inválida' )
            existsOrErros(user.password === user.confirmPassword , 'Senhas não conferem' )

            // db via knex
            const userFromDB = await app.db('users')
                .where({email: user.email}).first()
            if(!user.id){
                //se não existir ok se existir usuario ele gera o erro 
                notExistsOrError(userFromDB , 'Usuário já cadastrado')
            }

        } catch (msg) {
            return res.status(400).send(msg)
        }

        user.password = encryptPassword(user.password)
        delete user.confirmPassword

        if(user.id){
            // persiste atualiza dados se o id existir - update
            app.db('users')
                .update(user)
                .where({id : user.id})
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
                console.log("")
                console.log("atualizando o usuário " + "id: " + user.id + " nome: " + user.name)
                console.log("")
        }else{
            // inclui user se o id não existir            
            app.db('users')
                .insert(user)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
                console.log("")
                console.log("novo usuário nome: " + user.name)
                console.log("")
        }
    }

// pegar todos os usuarios do sistema
    const get = (req, res) => {
        app.db('users')
            .select('id' , 'name' , 'email' , 'admin')
            .then(users => res.json(users))
            .catch(err => res.status(500).send(err))

    }

    return { save , get }
}