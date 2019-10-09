// representa a instancia do express
module.exports = app => {
    const save = (req , res) => {
        res.send('user save')
    }
    
    return { save }
}