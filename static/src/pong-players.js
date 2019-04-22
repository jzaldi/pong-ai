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

    this.class = "Base";
    this.ready = true; // Indica si el jugador está listo para empezar a jugar.

    this.sensibility = sensibility || 20;

    this.memory = []; // Memoria para almacenar las jugadas.
    this.max_memory = 1000000; // Limite máximo a la memoria para que no casque.

    

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
        var w = environment.board.width;
        var h = environment.board.height;
        // Para que el problema sea simétrico y un jugador pueda aprender del
        // jugador oponente cogemos un estado simétrico en función de la 
        // orientación de cada jugador.
        if(paddle.orientation == 1){
            return [
                paddle.x / w, paddle.y / h , paddle.x_0 / w, paddle.y_0 / h,
                opponent.x / w, opponent.y / h, opponent.x_0 / w, opponent.y_0 / h,
                ball.x / w, ball.y / h, ball.x_0 / w, ball.y_0 / h
            ]
        } else {
            return [
                (w - paddle.x) / w, paddle.y / h, (w - paddle.x_0) / w, paddle.y_0 / h,
                (w - opponent.x) / w, opponent.y / h, (w - opponent.x_0) / w, opponent.y_0 / h,
                (w - ball.x) / w, ball.y / h, (w - ball.x_0) / w, ball.y_0 / h
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
        var reward = this.get_reward();
        // Propagamos la recompensa si es distinta de cero.
        if(reward != 0) this.propagate_reward(reward);
        // Almacenamos en memoria
        this.memory.push({state: state, action: action, reward: reward, value: 0});
        if (this.memory.length > this.max_memory) this.memory.shift();
    }

    this.get_reward = function(){
        //return paddle.orientation * environment.reward;
        var reward = paddle.orientation * environment.reward;
        //if (Math.sign(environment.ball.ux) != Math.sign(paddle.orientation)) 
            reward += -Math.abs(paddle.y - ball.y) / board.height;
        return  reward;
    }

    /**
     * Propaga la recompensa hacia atrás en el tiempo con un coeficiente.
     */
    this.propagate_reward = function(reward){ 
        for(var i = this.memory.length - 1, exp = 0; i >= 0 && exp <= 500; i--, exp++){
            this.memory[i].value += reward * Math.pow(0.8, exp);
        }     
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


    this.train = function(p1, epochs){
        this.ready = false;
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

    base.class = "Human";
    base.ready = false; // Por defecto no está prepardo.
    
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

    // Evento encargado de parar o reanudar el juego si se pulsa la barra 
    // espaciadora.
    document.addEventListener('keydown', function(key){
        console.log("Press");
        if(key.keyCode == 32) base.ready = true;
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

/**
 * Agente de RL.
 * @param {Paddle} paddle Paddle controlada por el jugador.
 * @param {Paddle} opponent Paddle del oponente.
 * @param {Environment} environment Entorno.
 * @param {number} sensibility Sensibilidad al moviviento.
 */
var AIPlayer = function(paddle, opponent, environment, sensibility){

    var base = new BasePlayer(paddle, opponent, environment, sensibility);
    base.class = "AI"

    var model = tf.sequential();
    model.add(tf.layers.dense({inputShape: 15, units: 64, useBias: true, activation: 'tanh'}));
    model.add(tf.layers.dense({units: 32, useBias: true, activation: 'tanh'}));
    model.add(tf.layers.dense({units: 1, useBias: true}));
    model.compile({
        optimizer: tf.train.adam(1e-2),
        loss: tf.losses.meanSquaredError,
        metrics: ['mse'],
    });

    // Probabilidad de que elija una acción al azar.
    base.epsilon = 0.2;

    /**
     * Elige una acción al azar.
     */
    var choose_random = function(){
        return Math.floor(Math.random() * 3);
    }
    
    /**
     * Elige una acción basado en su red neuronal.
     * @param {*} state Estado del entorno.
     */
    base.choose_action = function(state){
        values = []; // Forward propagation para cada una de las acciones.
        for(var action = 0; action < 3; action++){
            var x = tf.tensor2d(state.concat(one_hot(action)), [1, state.length + 3]);
            values.push(model.predict(x).dataSync()[0]);
        }
        // Devuelvo la acción con mayor valor.
        if(Math.random() < base.epsilon) return choose_random();
        var a =  values.indexOf(Math.max(...values));
        console.log(values);
        return a;
    }

    var one_hot = function(a){
        var v = [];
        for(var i = 0; i < 3; ++i) v.push((a == i)? 1: 0);
        return v;
    }

    base.train = function(p1, num_epochs){
        console.log("Starting training...");
        base.epsilon /= 1.1;
        base.ready = false;
        var x = base.memory.map(m => m.state.concat(one_hot(m.action)))
            .concat(p1.memory.map(m => m.state.concat(one_hot(m.action))));
        var y = base.memory.map(m => m.value)
            .concat(p1.memory.map(m => m.value));
        var n = x.length;
        x = tf.tensor2d(x, [x.length, x[0].length]);
        y = tf.tensor1d(y);
        console.log(y);
        model.fit(x, y, {
            batchSize: n,
            epochs: num_epochs || 10,
            shuffle: true
        }).then(function(result){
            console.log(result.history.loss);
            base.ready = true;
        })
    }

    return base;
}
