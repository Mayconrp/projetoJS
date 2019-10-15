module.exports = app => {

    const {existsOrError , NotExistsOrError} = app.api.validation

        // salvar categoria
        const save  = (req , res) => {
            const category = { ...req.body}
            if(req.params.id) category.id = req.params.id 

            try {
                existsOrError(category.name , 'Nome não informado')
            } catch (msg) {
                return res.status(400).send(msg)
            }

            if(category.id){
                app.db('categories')
                    .update(category)
                    .where({id : category.id})
                    .then(_ => res.status(204).send())
                    .catch(err => res.status(500).send(err))
            }else {
                app.db('categories')
                    .insert(category)
                    .then(_ => res.status(204).send())
                    .catch(err => res.status(500).send(err))
            }
        }

        // apagar categoria
        const remove = async (req , res) => {
            try {
                existsOrError(req.params.id , 'Codigo da categoria não informado.')

                // fazendo consulta no banco de dados com await
                const subcategory = await app.db('categories')
                    .where({ parentId : req.params.id })                    
                NotExistsOrError(subcategory , 'Não foi possível excluir, categoria possui subcategorias.')

                const articles = await app.db('articles')
                    .where({categoryId : req.params.id})
                NotExistsOrError(articles , 'Não foi possível excluir, categoria possui artigos.')

                rowsDeleted = await app.db('categories')
                    .where({ id : req.params.id}).del()
                existsOrError(rowsDeleted, 'Categoria não foi encontrada')

                res.status(204).send()

            } catch (msg) {
                res.status(400).send(msg)
                return 
            }
        }
        // receber e retornar uma lista de categorias , monta o path da lista
        // faz o filtro do parent que esta retornando
        const withPath = categories => {
            const getParent = (categories, parentId) => {
                let parent = categories.filter(parent => parent.id === parentId)
                // operador ternário
                return parent.length ? parent[0] : null
            }

            const categoriesWithPath = categories.map(category => {
                let path = category.name
                let parent = getParent(categories, category.parentId)

                //percorre e monta a lista de parentes da categoria, se houver um pai 
                while(parent) {
                    path = `${parent.name} > ${path}`
                    parent = getParent(categories, parent.parentId)
                }

                return { ...category, path }
            })

            categoriesWithPath.sort((a , b) => {
                if(a.path > b.path) return -1
                if(a.path < b.path) return 1
                return 0 
            })

            return categoriesWithPath
        }

        const get = (req , res) => {
            app.db('categories')
                // retornar o atributo de categorias com um resultado a mais
                .then(categories => res.json(withPath(categories)))
                // se der erro
                .catch(err => res.status(500).send(err))
       } 

       const getById = (req , res) => {
            app.db('categories')
                .where({ id: req.params.id })
                .first()
                .then(category => res.json(category))
                .catch(err => res.status(500).send(err))
        
       }

    return {save, remove, get, getById}

    
}