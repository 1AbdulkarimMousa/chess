function chessApp() {
    return {
        p1: [
            { name: 'P1 pawn1',   position: 'a2', symbol: '♙', type: 'pawn' },
            { name: 'P1 pawn2',   position: 'b2', symbol: '♙', type: 'pawn' },
            { name: 'P1 pawn3',   position: 'c2', symbol: '♙', type: 'pawn' },
            { name: 'P1 pawn4',   position: 'd2', symbol: '♙', type: 'pawn' },
            { name: 'P1 pawn5',   position: 'e2', symbol: '♙', type: 'pawn' },
            { name: 'P1 pawn6',   position: 'f2', symbol: '♙', type: 'pawn' },
            { name: 'P1 pawn7',   position: 'g2', symbol: '♙', type: 'pawn' },
            { name: 'P1 pawn8',   position: 'h2', symbol: '♙', type: 'pawn' },
            { name: 'P1 rook1',   position: 'a1', symbol: '♖', type: 'rook' },
            { name: 'P1 knight1', position: 'b1', symbol: '♘', type: 'knight' },
            { name: 'P1 bishop1', position: 'c1', symbol: '♗', type: 'bishop' },
            { name: 'P1 queen',   position: 'd1', symbol: '♕', type: 'queen' },
            { name: 'P1 king',    position: 'e1', symbol: '♔', type: 'king' },
            { name: 'P1 bishop2', position: 'f1', symbol: '♗', type: 'bishop' },
            { name: 'P1 knight2', position: 'g1', symbol: '♘', type: 'knight' },
            { name: 'P1 rook2',   position: 'h1', symbol: '♖', type: 'rook' }
        ],
        p2: [
            { name: 'P2 pawn1',   position: 'a7', symbol: '♟', type: 'pawn' },
            { name: 'P2 pawn2',   position: 'b7', symbol: '♟', type: 'pawn' },
            { name: 'P2 pawn3',   position: 'c7', symbol: '♟', type: 'pawn' },
            { name: 'P2 pawn4',   position: 'd7', symbol: '♟', type: 'pawn' },
            { name: 'P2 pawn5',   position: 'e7', symbol: '♟', type: 'pawn' },
            { name: 'P2 pawn6',   position: 'f7', symbol: '♟', type: 'pawn' },
            { name: 'P2 pawn7',   position: 'g7', symbol: '♟', type: 'pawn' },
            { name: 'P2 pawn8',   position: 'h7', symbol: '♟', type: 'pawn' },
            { name: 'P2 rook1',   position: 'a8', symbol: '♜', type: 'rook' },
            { name: 'P2 knight1', position: 'b8', symbol: '♞', type: 'knight' },
            { name: 'P2 bishop1', position: 'c8', symbol: '♝', type: 'bishop' },
            { name: 'P2 queen',   position: 'd8', symbol: '♛', type: 'queen' },
            { name: 'P2 king',    position: 'e8', symbol: '♚', type: 'king' },
            { name: 'P2 bishop2', position: 'f8', symbol: '♝', type: 'bishop' },
            { name: 'P2 knight2', position: 'g8', symbol: '♞', type: 'knight' },
            { name: 'P2 rook2',   position: 'h8', symbol: '♜', type: 'rook' }
        ],
        history: '',
        moveInput: '',
        tokens: [],

        scanMove() {
            this.tokens = [];
            for (let i = 0; i < this.moveInput.length; i++) {
                let c = this.moveInput[i];
                if (c === ' ') continue;

                if ('KQBNR'.includes(c)) {
                    this.tokens.push({ type: 'PIECE', value: c });
                } else if (c >= 'a' && c <= 'h') {
                    this.tokens.push({ type: 'FILE', value: c });
                } else if (c >= '1' && c <= '8') {
                    this.tokens.push({ type: 'RANK', value: c });
                } else if (c === 'x') {
                    this.tokens.push({ type: 'CAPTURE', value: c });
                } else if (c === '+') {
                    this.tokens.push({ type: 'CHECK', value: c });
                } else if (c === '#') {
                    this.tokens.push({ type: 'CHECKMATE', value: c });
                }
            }
            this.tokens.push({ type: 'END', value: '' });

            this.processMove();
        },

       parseMove() {
        this.pos = 0;
        lookahead = this.peek();
        if(lookahead.type == "PIECE"){
            return this.parsePieceMove();
        }
        else if(lookahead.TYPE == "FILE"){
            return this.parsePawnMove();
        }
        else throw new Error("Invalid move: " + lookahead.type);
       },

       parsePieceMove() {
        piece = this.consume("PIECE").value;
        square = this.parseSquare();
        capture = null;
        if(this.peek().type == "CHECK" || this.peek().type == "CHECKMATE"){
            check = this.consume(this.peek().type).value;
        }
        this.consume("END");
        return {type: "PieceMove", piece, square, capture, check}
       },

       parsePawnMove() {
        file = null; capture = null;
        if (this.peek().type == "FILE" && this.peek(1).type == "CAPTURE") {
            file = this.consume("FILE").value;
            capture = this.consume("CAPTURE").value;
        }
        square = this.parseSquare(); check = null;
        if(this.peek().type == "CHECK" || this.peek.type == "CHECKMAKE") {
            check = this.consume(this.peek().type).value;
        }
        this.consume("END");
        return { type : "PawnMove", file, square, capture, check};
       },

       parseSquare() {
        file = this.consume("FILE").value;
        rank = this.consume("RANK").value;
        return {file, rank};
       },

       peek() {
        return this.tokens[this.post];
       },

       consume(expectedType){
        token = this.tokens[this.post];
        if(!token || token.type != expectedType) {
            throw new Error(`Expected ${expectedType}, got ${token?.type}`);
        }
        this.post++;
        return token;
       }
    }
}
