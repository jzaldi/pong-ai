/**
 * Clase básica para representar un juego de pong.
 * @param {number} width Anchura del tablero.
 * @param {number} height Altura del tablero.
 */
var Game = function(width, height){

    // Instanciamos el entorno.
    this.environment = new Environment(width, height);

    this.running = false; // Indica si el juego está corriendo.
    
    // Cogemos referencias a las palas para asignarlas a los jugadores.
    paddle_left = this.environment.paddle_left;
    paddle_right = this.environment.paddle_right;

    this.score = 0; // Almacena la puntuación del juego.

    /**
     * Ejecuta un paso temporal en el que los jugadores realizan una acción y
     * actualiza la puntuación del juego.
     */
    this.step = function(){

        this.player_1.perform_action();
        this.player_2.perform_action();
        this.environment.time_step();
        this.score += this.environment.reward;

        if(this.environment.reward != 0) this.reset();

    }

    /**
     * Resetea el entorno y los jugadores.
     */
    this.reset = function(){
        this.player_1.perform_action();
        this.player_2.perform_action();
        this.environment.reset();
        this.stop();
        this.player_1.train(this.player_2, 50);
        this.player_2.train(this.player_1, 50);
    }
    
}

/**
 * Representa un juego interactivo con un jugador humano y otro IA.
 * @param {number} width Anchura del tablero. 
 * @param {number} height Altura del tablero.
 * @param {*} canvas Canvas sobre el que se pinta el juego.
 */
var InteractiveGame = function(width, height, canvas){

    // Instancia un nuevo juego.
    var game = new Game(width, height);

    // Instancio los jugadores.
    game.player_1 = new HumanPlayer(paddle_left, paddle_right, game.environment);
    game.player_2 = new AIPlayer(paddle_right, paddle_left, game.environment);

    game.running = false; // Esta el juego activo?
    game.interval = null; // Id del intervalo que corre el juego.

    // Instancia el objeto encargado de renderizar el juego.
    var renderer = new Renderer(game, canvas);
    // Pinta el juego en su estado inicial.
    renderer.render();

    /**
     * Reanuda el juego.
     */
    game.start = function(){
        clearInterval(game.interval);
        game.running = true;
        game.interval = setInterval(function(){
            game.step();
            renderer.render();
        }, 16);
    }

    /**
     * Pausa el juego.
     */
    game.stop = function(){
        clearInterval(game.interval);
        game.running = false;
        game.interval = setInterval(function(){
            renderer.render();
            if(game.player_1.ready && game.player_2.ready) game.start();
        }, 16)
    }

    // Evento encargado de parar o reanudar el juego si se pulsa la barra 
    // espaciadora.
    //document.addEventListener('keydown', function(key){
    //    if(key.keyCode == 32) (game.running)? game.stop(): game.start();
    //})
    game.stop();
    // Devuelvo la instancia del juego.
    return game;
}