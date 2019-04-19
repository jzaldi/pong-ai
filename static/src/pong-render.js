/**
 * Se encarga del renderizado de un juego en un canvas de html.
 * @param {Game} game Clase game de pong.
 * @param {*} canvas Canvas de html. 
 */
var Renderer = function(game, canvas){

    // Referencia al contexto del canvas.
    this.context = canvas.getContext('2d'); 
    
    // Referencia al entorno del canvas.
    this.environment = game.environment;

    // Estilo por defecto del juego.
    this.style = {
        background_color: '#6a7991',
        line_color: '#eeeeee',
        line_width: 10,
        paddle_color: '#eeeeee',
        ball_color: '#eeeeee',
        score_font: '30px Courier New',
        score_color: '#eeeeee',
        state_font: '30px Courier New',
        state_color: '#eeeeee',
    }

    /**
     * Función principal que pinta todos los elementos del juego.
     */
    this.render = function(){
        this.render_board();
        this.render_ball();
        this.render_paddles();
        this.render_score();
        this.render_state();
    }

    /**
     * Pinta el tablero.
     */
    this.render_board = function(){
        var board = this.environment.board;
        this.context.fillStyle = this.style.background_color;
        this.context.fillRect(0, 0, board.width, board.height);
        this.render_board_line();
    }

    /**
     * Pinta la linea divisoria del campo que no vale para absolutamente nada
     * pero hace que sea menos soso.
     */
    this.render_board_line = function(){
        
        var board = this.environment.board;

        this.context.beginPath();
		this.context.setLineDash([7, 15]);
		this.context.moveTo((board.width / 2), 0.85 * board.height);
		this.context.lineTo((board.width / 2), 0.15 * board.height);
		this.context.lineWidth = this.style.line_width;
		this.context.strokeStyle = this.style.line_color;
		this.context.stroke();
    }

    /**
     * Pinta las palas.
     */
    this.render_paddles = function(){
        this.context.fillStyle = this.style.paddle_color;
        var paddles = [
            this.environment.paddle_left, 
            this.environment.paddle_right
        ];
        for (var i in paddles){
            var p = paddles[i];
            this.context.fillRect(p.x - p.width / 2, p.y - p.length / 2, 
                p.width, p.length);
        }
    }

    /**
     * Pinta la pelota.
     */
    this.render_ball = function(){
        this.context.fillStyle = this.style.ball_color;
        var ball = this.environment.ball;
        var ctx = this.context;
        //this.context.fillRect(ball.x - ball.width / 2, ball.y - ball.width / 2,
        //    ball.width, ball.width);
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.width / 2, 0, 2 * Math.PI);
        ctx.fill()
    }

    /**
     * Pinta la puntuación.
     */
    this.render_score = function(){
        var board = game.environment.board;

        this.context.font = this.style.score_font;
        this.context.fillStyle = this.style.score_color;

        var winner = (game.score > 0)? "P1" : (game.score < 0)? "P2" : "Draw";
        var msg = "Score: " + Math.abs(game.score).toString() + " " + winner;
        var txt_size = this.context.measureText(msg);

        this.context.fillText(msg, 
            0.5 * board.width - txt_size.width / 2, 
            0.08 * board.height
        );
    }

    /**
     * Pinta el mensaje de continuar si el juego está parado.
     */
    this.render_state = function(){
        if(game.running) return;

        var p1 = game.player_1;
        var p2 = game.player_2;


        var board = game.environment.board;
        this.context.font = this.style.state_font;
        this.context.fillStyle = this.style.state_color;
        
        this.render_player(p1, 0.25 * board.width)
        this.render_player(p2, 0.75 * board.width)
    }

    this.render_player = function(p1, offset){
        var board = game.environment.board;
        var waiting_msg = (p1.class == "Human")? "Press spacebar to continue":
            "Training...";
        var msg = (p1.ready)? "Ready": waiting_msg;
        var txt_size = this.context.measureText(msg);
        this.context.fillText(
            msg, 
            offset - txt_size.width / 2, 
            0.25 * board.height
        );
    }

}