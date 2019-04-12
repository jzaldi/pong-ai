/**
 * Representa un juego de Pong.
 * @param {number} width Anchura del tablero.
 * @param {number} height Altura del tablero.
 */
var Game = function(width, height){

    // Instanciamos el entorno.
    this.environment = new Environment(width, height);
    
    // Cogemos referencias a las palas para asignarlas a los jugadores.
    paddle_left = this.environment.paddle_left;
    paddle_right = this.environment.paddle_right;

    // Instanciamos a los jugadores.
    this.player_1 = new HumanPlayer(paddle_left, paddle_right, this.environment);
    this.player_2 = new AIPlayer(paddle_right, paddle_left, this.environment);

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
    }

}