module.exports = app => {
    function existsOrError(value , msg){
    // mostra mensagem se tiver erro ou seja valor vazio , throw lanca o erro
        if(!value) throw msg    
        if(Array.isArray(value) && value.length === 0) throw msg
        // verifica se a string esta vazia
        if(typeof value === 'string' && !value.trim()) throw msg
    }
    
    function notExistsOrError(value , msg) {
        try {
            existsOrError(value , msg)
        } catch(msg){
            return
        }
        throw msg
    }
    
    function equalsOrError(valueA , valueB , msg){
        if(valueA !== valueB) throw msg
    }

    return { existsOrError , notExistsOrError , equalsOrError}
}