/**
 * Clase base para todos los jugadores.
 * @param {Paddle} paddle Paddle controlada por el jugador.
 * @param {Paddle} opponent Paddle del oponente.
 * @param {Environment} environment Entorno.
 * @param {number} sensibility Sensibilidad al moviviento.
 */
var BasePlayer = function(paddle, opponent, environment, sensibility){
    
    var board = environment.board; // Referencia al tablero.
    var ball = environment.ball; // Referencia a la pelota.

    this.sensibility = sensibility || 20;

    this.memory = []; // Memoria para almacenar las jugadas.
    this.max_memory = 1000000; // Limite máximo a la memoria.

    /**
     * Elige una opción a ejecutar en función del estado del entorno. Esta es
     * la función básica que tendrar que implementar las clases hijas. En este
     * caso elige una acción random.
     * @param {*} state Estado del entorno.
     * @return Número 0, 1, 2, 3, 4.
     */
    this.choose_action = function(state){
        return Math.floor(Math.random() * 5);
    }

    /**
     * Obtiene un array con el estado del entorno.
     * @return Array con el estado del entorno.
     */
    this.get_state = function(){
        // Para que el problema sea simétrico y un jugador pueda aprender del
        // jugador oponente cogemos un estado simétrico en función de la 
        // orientación de cada jugador.
        if(paddle.orientation == 1){
            return [
                paddle.x, paddle.y, paddle.x_0, paddle.y_0,
                opponent.x, opponent.y, opponent.x_0, opponent.y_0,
                ball.x, ball.y, ball.x_0, ball.y_0
            ]
        } else {
            var w = environment.board.width;
            return [
                w - paddle.x, paddle.y, w - paddle.x_0, paddle.y_0,
                w - opponent.x, opponent.y, w - opponent.x_0, opponent.y_0,
                w -ball.x, ball.y, w - ball.x_0, ball.y_0
            ]
        }
    }

    /**
     * Guarda el estado del juego antes de realizar una acción.
     * @param {number} action Acción realizada.
     */
    this.snap_shot = function(action){
        var state = this.get_state(); // Obtengo el estado para guardarlo
        // Recompensa del estado anterior.
        var reward = paddle.orientation * environment.reward;
        // Almacenamos en memoria
        this.memory.push({state: state, action: action, reward: reward});
        if (this.memory.length > this.max_memory) this.memory.shift();
    }

    /**
     * Ejecuta una acción sobre el entorno en función del estado del mismo.
     */
    this.perform_action = function(){

        var state = this.get_state(); // Obtiene el estado.
        // Elige una acción en función del estado del entorno.
        var action = this.choose_action(state);
        // Guarda el estado y la acción para entrenar.
        this.snap_shot(action);
        
        // Ejecución de la acción.

        // Nos movemos hacia abajo o hacia arriba.
        if(action == 1) paddle.move(0, this.sensibility);
        if(action == 2) paddle.move(0, -this.sensibility);

        // Nos movemos a derecha o a izquierda.
        if(action == 3) paddle.move(paddle.orientation * this.sensibility, 0);
        if(action == 4) paddle.move(-paddle.orientation * this.sensibility, 0);
        
    }

}


/**
 * Jugador humano, los inputs se reciben a través del teclado. Hereda de la
 * clase BasePlayer.
 * @param {Paddle} paddle Paddle controlada por el jugador.
 * @param {Paddle} opponent Paddle del oponente.
 * @param {Environment} environment Entorno.
 * @param {number} sensibility Sensibilidad al moviviento.
 */
var HumanPlayer = function(paddle, opponent, environment, sensibility){
    
    // Instanciamos clase base.
    var base = new BasePlayer(paddle, opponent, environment, sensibility);
    
    // Inicialmente la acción seleccionada es 0 (quedarse quieto).
    var selected_action = 0; 

    // Añadimos dos eventos. Cuando se pulsa una tecla se elige la acción 
    // asociada a la misma. Cuando se levanta se elige la acción 0.
    document.addEventListener('keydown', function(key){
        if (key.keyCode === 38) selected_action = 2;
        if (key.keyCode === 40) selected_action = 1;
        //if (key.keyCode === 37) selected_action = 4;
        //if (key.keyCode === 39) selected_action = 3;
    })
    document.addEventListener('keyup', function(key){
        selected_action = 0;
    })

    /**
     * Sobrecarga del método de la clase base para que elija la acción del 
     * input del teclado.
     * @param state Estado del tablero.
     * @return Entero que representa el estado.
     */
    base.choose_action = function(state){
        return selected_action;
    }

    return base; // Devolvemos la clase base modificada.
}

var AIPlayer = function(paddle, opponent, environment, sensibility){

    var base = new BasePlayer(paddle, opponent, environment, sensibility);

    base.choose_action = function(state){
        return Math.floor(Math.random() * 3);
    }

    return base;
}
