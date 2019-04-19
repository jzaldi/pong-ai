/**
 * Clase que representa una pala.
 * @param {number} x Posición x del centro de la pala.
 * @param {number} y Posición y del centro de la pala.
 * @param {number} orientation Orientación. 1 a la derecha -1 a la izquierda.
 * @param {number} length Longitud de la pala.
 * @param {number} width Anchura de la pala.
 */
var Paddle = function(x, y, orientation, length, width){

    this.x = x;
    this.y = y;
    
    this.x_0 = x;
    this.y_0 = y;

    this.orientation = orientation;
    this.length = length;
    this.width = width;

    /**
     * Mueve la pala.
     * @param dx Movimiento en la dirección x.
     * @param dy Movimiento en la dirección y.
     */
    this.move = function(dx, dy){
        this.x_0 = this.x;
        this.y_0 = this.y;
        this.x += dx;
        this.y += dy;
    }

    /**
     * Chequea si la bola se encuentra dentro de la anchura de la pala.
     * @param {Ball} ball Objeto Ball.
     */
    this.is_within_x = function(ball){
        return ball.x < this.x + this.width / 2 
            && ball.x > this.x - this.width / 2;
    }
    
    /**
     * Chequea si la bola se encuentra dentro de la longitud de la pala.
     * @param {Ball} ball Objeto Ball.
     */
    this.is_within_y = function(ball){
        return ball.y < this.y + this.length / 2 
            && ball.y > this.y - this.length / 2;
    }

    /**
     * Chequea si la bola ha chocado con la pala y, en caso de que haya chocado,
     * le cambia la dirección.
     * @param {Ball} ball Objeto Ball.
     * @returns 0 si no ha chocado, -1 si ha chocado por atras, 1 si ha chocado
     * por delante.
     */
    this.interact = function(ball){
        if(this.is_within_x(ball) && this.is_within_y(ball)){
            ball.x = this.x;
            ball.ux = -ball.ux;
            return (Math.sign(ball.ux) == this.orientation)? this.orientation: 0;
        }
        return 0;
    }

}

/**
 * Clase que representa la pelota.
 * @param {number} x Posicion x del centro de la pelota.
 * @param {number} y Posición y del centro de la pelota.
 * @param {number} width Anchura y altura de la pelota.
 */
var Ball = function(x, y, width, ux, uy){

    this.x = x; // Posicion x actual
    this.y = y; // Posicion y actual

    this.x_0 = x; // Posicion x en el ts anterior.
    this.y_0 = y; // Posicon y en el ts anterior.

    this.width = width; // Anchura de la pelota.

    this.ux = 1; // Velocidad en la dirección x.
    this.uy = 1; // Velocidad en la dirección y.
    
    /**
     * Actualiza la posicion de la pelota en función de su velocidad.
     * @param k Coeficiente que representa el incremento de tiempo.
     */
    this.update = function(k){
        var alpha = k || 1;
        this.x_0 = this.x;
        this.y_0 = this.y;
        this.x += alpha * this.ux;
        this.y += alpha * this.uy;
    }

}

/**
 * Representa el tablero de juego.
 * @param {number} width Anchura del tablero de juego. 
 * @param {number} height Altura del tablero de juego. 
 */
var Board = function(width, height){
    
    this.width = width; // Anchura del tablero de juego.
    this.height = height; // Altura del tablero de juego.

    /**
     * Calcula la interacción del tablero con las palas y las pelotas.
     * @param {Ball} ball Pelota de juego.
     * @param {Paddle} paddle_left Pala de la izquierda.
     * @param {Paddle} paddle_right Pala de la derecha.
     */
    this.interact = function(ball, paddle_left, paddle_right){
        this.interact_paddle(paddle_left);
        this.interact_paddle(paddle_right);
        return this.interact_ball(ball);
    }

    /**
     * Interacción del tablero con la pelota.
     * @param {Ball} ball Pelota.
     * @returns -1 si ha chocado a la derecha, +1 si ha chocado a la izquierda.
     */
    this.interact_ball = function(ball){
        var value = 0;
        if(ball.x > this.width){
            ball.x = this.width; 
            ball.ux = -ball.ux;
            value = 1;
        }
        if(ball.x < 0){
            ball.x = 0; 
            ball.ux = -ball.ux;
            value = -1;
        }
        if(ball.y > this.height){
            ball.y = this.height; 
            ball.uy = -ball.uy;
        }
        if(ball.y < 0){
            ball.y = 0; 
            ball.uy = -ball.uy;
        }
        return value;
    }

    /**
     * Interacción pala-tablero.
     * @param {Paddle} paddle Pala.
     */
    this.interact_paddle = function(paddle){
        var value = 0;
        if(paddle.y + paddle.length / 2 > this.height){
            paddle.y = this.height - paddle.length / 2;
        }
        if(paddle.y - paddle.length / 2 < 0){
            paddle.y = paddle.length / 2;
        }
        if(paddle.x + paddle.width / 2 > this.width){
            paddle.x = this.width - paddle.width / 2;
        }
        if(paddle.x - paddle.width / 2 < 0){
            paddle.x = paddle.width / 2;
        }
    }

}


/**
 * Representa el entorno que relaciona los elementos.
 * @param {number} width 
 * @param {number} height 
 */
var Environment = function(width, height, ball_speed, paddle_sensibility){
    
    ball_speed = ball_speed || 8;
    paddle_sensibility = paddle_sensibility || 20;
    // Instancio los elementos del entorno.
    this.board = new Board(width, height);
    this.ball = new Ball(width * 0.5, height * 0.5, height * 0.015);
    this.paddle_left = new Paddle(0.05 * width, 0.5 * height, 1, 
        0.2 * height, width * 0.01);
    this.paddle_right = new Paddle(width * (1 - 0.05), 0.5 * height, -1, 
        0.2 * height, width * 0.01);

    this.reward = 0; // Representa la recompensa que dió la acción anterior.

    /**
     * Ejecuta un paso temporal.
     * @returns Boolean indicando si el episodio ha terminado.
     */
    this.time_step = function(){
        this.ball.update(ball_speed);
        var reward =  this.board.interact(
            this.ball, this.paddle_left, this.paddle_right);
        this.reward = reward;
        this.paddle_left.interact(this.ball);
        this.paddle_right.interact(this.ball);
        return reward != 0;
    }

    /**
     * Resetea el entorno a su estado inicial. Usado cuando termina una partida.
     */
    this.reset = function(){
        
        this.ball.x = this.ball.x_0 = width * 0.5;
        this.ball.y = this.ball.y_0 = height * 0.5;
        this.ball.ux = (Math.random() > 0.5)? 1 : -1;
        this.ball.uy = (Math.random() > 0.5)? 1 : -1;;

        this.paddle_left.y = this.paddle_left.y_0 = height * 0.5;
        this.paddle_right.y = this.paddle_right.y_0 = height * 0.5;
        
        this.reward = 0;
    }

}
