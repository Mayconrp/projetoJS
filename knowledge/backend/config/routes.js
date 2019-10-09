module.exports = app => {
    app.route('/users')
    // consign facilita no carregamento estrutura
        .post(app.api.user.save)
}