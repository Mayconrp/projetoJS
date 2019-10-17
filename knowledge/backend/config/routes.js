module.exports = app => {
    app.route('/users')
    // consign facilita no carregamento estrutura
    //metodo post
        .post(app.api.user.save)
        .get(app.api.user.get)

    app.route('/users/:id')
        .put(app.api.user.save)
        .get(app.api.user.getById)


    app.route('/categories')
        .get(app.api.category.get)
        .post(app.api.category.save)

    // cuidado na ordem das rotas

    app.route('/categories/tree')
        .get(app.api.category.getTree) 

    app.route('/categories/:id')
        .get(app.api.category.getById)
        .put(app.api.category.save)
        .delete(app.api.category.remove)

    app.route('/articles')
        .get(app.api.article.get)
        .post(app.api.article.save)

    app.route('/articles/:id')
        .get(app.api.article.getById)
        .put(app.api.article.save)
        .delete(app.api.article.remove)

        // pegues os artigos de tal categoria
    app.route('/categories/:id/articles')
        .get(app.api.article.getByCategory)

}