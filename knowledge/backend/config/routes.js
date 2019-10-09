module.exports = app => {
    app.route('/users')
    // consign facilita no carregamento estrutura

    //metodo post
        .post(app.api.user.save)
    // criado em user.js
        .get(app.api.user.get)

    app.route('/users/:id')
        .put(app.api.user.save)
}