const queries = require('./queries')
module.exports = app => {

    const { existsOrError } = app.api.validation

    const save = (req, res) => {
        const article = { ...req.body }
        if(req.params.id) article.id = req.params.id

        try {
            existsOrError(article.name, 'Nome não informado.')
            existsOrError(article.description, 'Descrição não informada.')
            existsOrError(article.categoryId, 'Categoria não informada.')
            existsOrError(article.userId, 'Autor não informado.')
            existsOrError(article.content, 'Conteúdo não informado.') 

        }catch(msg) {
            res.status(400).send(msg)
        }

        // se existir artigo vai ser update
        if(article.id){
            app.db('articles')
                .update(article)
                .where({ id: article.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))

        } else {
            app.db('articles')
                .insert(article)
                .then( _ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }

    }

    const remove = async (req, res) => {
        try {
            const rowsDeleted = await app.db('articles')
                .where({ id: req.params.id }).del()

            try {
                // se o id existir só deleta, se não existir mostra a mensagem 
                existsOrError(rowsDeleted, 'Artigo não encontrado.')  // erro 400 pq passou um id não encontrado              
            } catch (msg) {
                return res.status(400).send(msg)
            }

            res.status(204).send()
        } catch (msg) {
            res.status(500).send(msg)
        }

    }

    const limit = 10 // usado na paginação
    const get = async (req, res) => { 
        // espero receber a pagina, caso não esteja setado exiba a pagina 1
        const page = req.query.page || 1

        const result = await app.db('articles').count('id').first()

        const count = parseInt(result.count)

        app.db('articles')
            .select('id', 'name', 'description')
            .limit(limit).offset(page * limit - limit) // calcula os 10 registros que no caso é o limite
            .then(articles => res.json({ data: articles, count, limit }))
            .catch(err => res.status(500).send(err))
    }

    const getById = (req, res) => {
        app.db('articles')
            .where({ id: req.params.id })
            .first()
            .then(article => {
                article.content = article.content.toString()
                return res.json(article)
            })
            .catch(err => res.status(400).send(err))
    }

    const getByCategory = async (req, res) => {
        //pegar todos artigos da categoria informada e os filhos
        const categoryId = req.params.id

        const page = req.query.page  || 1
        // referenciando as queries.js passando o id da categoria obtido através da requisição
        const categories = await app.db.raw(queries.categoryWithChildren, categoryId)
        // extrair ids ou seja array de ids
        const ids = categories.rows.map(c => c.id)

        //querie 
        app.db({a: 'articles', u: 'users' })
            .select('a.id', 'a.name', 'a.description', 'a.imgUrl', {author: 'u.name'})
            .limit(limit).offset(page * limit - limit)
            .whereRaw('?? = ??', ['u.id', 'a.userId'])
            // whereIn dentro de ids definidos in 1,2,3
            .whereIn('categoryId', ids)
            .orderBy('a.id', 'desc')
            .then(articles => res.json(articles))
            .catch(err => res.status(500).send(err))


    }

    return { save, remove, get, getById, getByCategory }

}