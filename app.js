function chessCompiler() {
    return {
        // BOARD DATA
        from: null,
        to: null,
        line: '',
        history: '',
        currentPlayer: 'p1',
        predictedMoves: [], // New: store predicted moves
        
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

        // COMPILER VARIABLES
        letters: [],  // Store the letters we find
        where: 0,     // Which letter we're looking at

        // NEW: Predict all legal moves for a piece
        predictMoves(piece) {
            console.log(`Predicting moves for ${piece.name} at ${piece.position}`);
            this.predictedMoves = [];
            
            // Generate all possible squares
            const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
            const rows = [1, 2, 3, 4, 5, 6, 7, 8];
            
            for (let col of columns) {
                for (let row of rows) {
                    let targetSquare = col + row;
                    
                    // Skip the piece's current position
                    if (targetSquare === piece.position) continue;
                    
                    try {
                        // Check if this move would be legal
                        this.checkIfMoveIsOk(piece, targetSquare);
                        
                        // If we get here, the move is legal
                        let pieceAtTarget = this.whatPieceIsAt(targetSquare);
                        let isCapture = pieceAtTarget && !this.isMyPiece(pieceAtTarget);
                        
                        this.predictedMoves.push({
                            square: targetSquare,
                            isCapture: isCapture
                        });
                        
                    } catch (error) {
                        // Move is not legal, skip it
                    }
                }
            }
            
            console.log(`Found ${this.predictedMoves.length} legal moves:`, this.predictedMoves);
        },

        // NEW: Check if a square is a predicted move
        isPredictedMove(square) {
            return this.predictedMoves.some(move => move.square === square);
        },

        // NEW: Check if a square is a predicted capture
        isPredictedCapture(square) {
            return this.predictedMoves.some(move => move.square === square && move.isCapture);
        },

        // NEW: Clear predictions
        clearPredictions() {
            this.predictedMoves = [];
        },

        // MAIN FUNCTION - This is what gets called
        scanMove() {
            try {
                console.log("=== STARTING TO READ MOVE: " + this.line + " ===");
                
                // STEP 1: Break the text into letters
                this.breakIntoLetters();
                
                // STEP 2: Figure out what the letters mean
                let moveInfo = this.figureOutMove();
                
                // STEP 3: Find the chess piece
                let piece = this.findChessPiece(moveInfo);
                
                // STEP 4: Check if move is legal
                this.checkIfMoveIsOk(piece, moveInfo.target);
                
                // STEP 5: Move the piece
                this.move(piece, moveInfo.target);
                
                this.history += `Move: ${this.line}\n`;
                this.line = '';
                
            } catch (error) {
                alert("ERROR: " + error.message);
                this.history += `Error: ${this.line} - ${error.message}\n`;
            }
        },

        // STEP 1: Break text into letters
        breakIntoLetters() {
            console.log("STEP 1: Breaking into letters");
            this.letters = [];
            
            for (let i = 0; i < this.line.length; i++) {
                let letter = this.line[i];
                
                if (letter === ' ') {
                    continue; // Skip spaces
                }
                
                // Check what type of letter this is
                if (letter === 'K' || letter === 'Q' || letter === 'R' || letter === 'B' || letter === 'N') {
                    this.letters.push({ type: 'PIECE', letter: letter });
                } 
                else if (letter >= 'a' && letter <= 'h') {
                    this.letters.push({ type: 'COLUMN', letter: letter });
                } 
                else if (letter >= '1' && letter <= '8') {
                    this.letters.push({ type: 'ROW', letter: letter });
                } 
                else if (letter === 'x') {
                    this.letters.push({ type: 'CAPTURE', letter: letter });
                } 
                else if (letter === '+') {
                    this.letters.push({ type: 'CHECK', letter: letter });
                } 
                else if (letter === '#') {
                    this.letters.push({ type: 'CHECKMATE', letter: letter });
                } 
                else {
                    throw new Error("I don't understand this letter: " + letter);
                }
            }
            
            console.log("Letters I found:", this.letters);
        },

        // STEP 2: Figure out what the move means
        figureOutMove() {
            console.log("STEP 2: Figuring out what the move means");
            this.where = 0; // Start at the beginning
            
            let first = this.letters[0];
            
            if (first.type === 'PIECE') {
                // This is like "Nf3" - piece move
                return this.readPieceMove();
            } else if (first.type === 'COLUMN') {
                // This is like "e4" - pawn move
                return this.readPawnMove();
            } else {
                throw new Error("Move must start with piece or column");
            }
        },

        // Read piece moves like "Nf3"
        readPieceMove() {
            let piece = this.getNextLetter('PIECE');
            let target = this.readSquare();
            
            return {
                type: 'piece',
                piece: piece,
                target: target
            };
        },

        // Read pawn moves like "e4" or "exd5"
        readPawnMove() {
            let captureColumn = null;
            
            // Check if this is a capture like "exd5"
            if (this.where + 1 < this.letters.length && this.letters[this.where + 1].type === 'CAPTURE') {
                captureColumn = this.getNextLetter('COLUMN');
                this.getNextLetter('CAPTURE'); // Skip the 'x'
            }
            
            let target = this.readSquare();
            
            return {
                type: 'pawn',
                captureColumn: captureColumn,
                target: target
            };
        },

        // Read a square like "f3"
        readSquare() {
            let column = this.getNextLetter('COLUMN');
            let row = this.getNextLetter('ROW');
            return column + row;
        },

        // Get the next letter of a specific type
        getNextLetter(expectedType) {
            if (this.where >= this.letters.length) {
                throw new Error("Ran out of letters, expected " + expectedType);
            }
            
            let current = this.letters[this.where];
            if (current.type !== expectedType) {
                throw new Error("Expected " + expectedType + " but got " + current.type);
            }
            
            this.where++;
            return current.letter;
        },

        // STEP 3: Find which chess piece should move
        findChessPiece(moveInfo) {
            console.log("STEP 3: Finding chess piece");
            
            let myPieces = (this.currentPlayer === 'p1') ? this.p1 : this.p2;
            
            if (moveInfo.type === 'piece') {
                return this.findSpecificPiece(myPieces, moveInfo.piece, moveInfo.target);
            } else {
                return this.findPawn(myPieces, moveInfo);
            }
        },

        // Find a specific piece like knight or queen
        findSpecificPiece(myPieces, pieceType, target) {
            let pieceMap = {
                'K': 'king', 'Q': 'queen', 'R': 'rook', 
                'B': 'bishop', 'N': 'knight'
            };
            
            let looking_for = pieceMap[pieceType];
            let found = [];
            
            // Find all pieces of this type
            for (let i = 0; i < myPieces.length; i++) {
                if (myPieces[i].type === looking_for) {
                    found.push(myPieces[i]);
                }
            }
            
            if (found.length === 0) {
                throw new Error("I can't find any " + looking_for);
            }
            
            // Check which ones can actually move there
            let canMove = [];
            for (let i = 0; i < found.length; i++) {
                if (this.canPieceMoveThere(found[i], target)) {
                    canMove.push(found[i]);
                }
            }
            
            if (canMove.length === 0) {
                throw new Error("No " + looking_for + " can move to " + target);
            }
            
            if (canMove.length > 1) {
                throw new Error("Too many " + looking_for + "s can move to " + target);
            }
            
            return canMove[0];
        },

        // Find a pawn
        findPawn(myPieces, moveInfo) {
            let found = [];
            
            // Find pawns that could make this move
            for (let i = 0; i < myPieces.length; i++) {
                let piece = myPieces[i];
                if (piece.type !== 'pawn') continue;
                
                if (moveInfo.captureColumn) {
                    // Capturing pawn - must be on the right column
                    if (piece.position[0] === moveInfo.captureColumn) {
                        found.push(piece);
                    }
                } else {
                    // Normal pawn move - must be on same column as target
                    if (piece.position[0] === moveInfo.target[0]) {
                        found.push(piece);
                    }
                }
            }
            
            if (found.length === 0) {
                throw new Error("I can't find a pawn for this move");
            }
            
            // Check which ones can actually move there
            let canMove = [];
            for (let i = 0; i < found.length; i++) {
                if (this.canPieceMoveThere(found[i], moveInfo.target)) {
                    canMove.push(found[i]);
                }
            }
            
            if (canMove.length === 0) {
                throw new Error("No pawn can move to " + moveInfo.target);
            }
            
            if (canMove.length > 1) {
                throw new Error("Too many pawns can move to " + moveInfo.target);
            }
            
            return canMove[0];
        },

        // STEP 4: Check if the move is legal
        checkIfMoveIsOk(piece, target) {
            console.log("STEP 4: Checking if move is legal");
            
            // Check if target square exists
            if (target.length !== 2) {
                throw new Error("Bad target square: " + target);
            }
            
            let column = target[0];
            let row = target[1];
            
            if (column < 'a' || column > 'h' || row < '1' || row > '8') {
                throw new Error("Target square doesn't exist: " + target);
            }
            
            // Check if trying to capture own piece FIRST (most important check!)
            let pieceAtTarget = this.whatPieceIsAt(target);
            if (pieceAtTarget && this.isMyPiece(pieceAtTarget)) {
                console.log("BLOCKED: Trying to capture own piece " + pieceAtTarget.name + " at " + target);
                throw new Error("ILLEGAL: Cannot capture your own piece at " + target);
            }
            
            // Check if piece can move in that pattern
            if (!this.canPieceMoveThere(piece, target)) {
                throw new Error(piece.type + " cannot move to " + target);
            }
            
            // Check if path is blocked
            if (!this.isPathEmpty(piece, target)) {
                throw new Error("Path is blocked to " + target);
            }
            
            // NEW: Check if this move would leave your own king in check
            if (this.wouldMoveLeaveKingInCheck(piece, target)) {
                throw new Error("ILLEGAL: This move would leave your king in check!");
            }
            
            console.log("✅ Move is legal!");
        },

        // NEW: Check if a move would leave your own king in check
        wouldMoveLeaveKingInCheck(piece, target) {
            console.log(`Checking if moving ${piece.name} to ${target} would leave king in check`);
            
            // Save the current state
            let originalPosition = piece.position;
            let capturedPiece = this.whatPieceIsAt(target);
            let capturedFrom = null;
            
            // Temporarily make the move
            piece.position = target;
            if (capturedPiece) {
                // Remove captured piece temporarily
                if (this.p1.includes(capturedPiece)) {
                    capturedFrom = 'p1';
                    this.p1 = this.p1.filter(p => p !== capturedPiece);
                } else {
                    capturedFrom = 'p2';
                    this.p2 = this.p2.filter(p => p !== capturedPiece);
                }
            }
            
            // Find my king
            let myPieces = (this.currentPlayer === 'p1') ? this.p1 : this.p2;
            let myKing = null;
            for (let i = 0; i < myPieces.length; i++) {
                if (myPieces[i].type === 'king') {
                    myKing = myPieces[i];
                    break;
                }
            }
            
            let wouldBeInCheck = false;
            
            if (myKing) {
                // Check if any opponent piece can attack my king
                let opponentPieces = (this.currentPlayer === 'p1') ? this.p2 : this.p1;
                
                for (let i = 0; i < opponentPieces.length; i++) {
                    let opponentPiece = opponentPieces[i];
                    if (this.canPieceMoveThere(opponentPiece, myKing.position) && 
                        this.isPathEmpty(opponentPiece, myKing.position)) {
                        console.log(`${opponentPiece.name} would attack king at ${myKing.position}`);
                        wouldBeInCheck = true;
                        break;
                    }
                }
            }
            
            // Restore the original state
            piece.position = originalPosition;
            if (capturedPiece) {
                if (capturedFrom === 'p1') {
                    this.p1.push(capturedPiece);
                } else {
                    this.p2.push(capturedPiece);
                }
            }
            
            return wouldBeInCheck;
        },

        // Check if a piece can move to a target (ignoring other pieces)
        canPieceMoveThere(piece, target) {
            let from = piece.position;
            let fromCol = from[0].charCodeAt(0) - 97; // a=0, b=1, etc
            let fromRow = parseInt(from[1]) - 1;      // 1=0, 2=1, etc
            let toCol = target[0].charCodeAt(0) - 97;
            let toRow = parseInt(target[1]) - 1;
            
            let colDiff = Math.abs(toCol - fromCol);
            let rowDiff = Math.abs(toRow - fromRow);
            
            if (piece.type === 'pawn') {
                return this.canPawnMoveThere(piece, from, target, fromCol, fromRow, toCol, toRow);
            } else if (piece.type === 'rook') {
                return (colDiff === 0 || rowDiff === 0); // Straight lines only
            } else if (piece.type === 'bishop') {
                return (colDiff === rowDiff); // Diagonal only
            } else if (piece.type === 'queen') {
                return (colDiff === 0 || rowDiff === 0 || colDiff === rowDiff); // Rook + Bishop
            } else if (piece.type === 'knight') {
                return ((colDiff === 2 && rowDiff === 1) || (colDiff === 1 && rowDiff === 2)); // L-shape
            } else if (piece.type === 'king') {
                return (colDiff <= 1 && rowDiff <= 1 && (colDiff + rowDiff > 0)); // One square any direction
            }
            
            return false;
        },

        // Special pawn movement rules
        canPawnMoveThere(piece, from, to, fromCol, fromRow, toCol, toRow) {
            let isPlayer1 = this.p1.includes(piece);
            let direction = isPlayer1 ? 1 : -1; // Player 1 goes up, Player 2 goes down
            let startRow = isPlayer1 ? 1 : 6;   // Starting row (0-indexed)
            
            let colDiff = Math.abs(toCol - fromCol);
            let rowDiff = toRow - fromRow;
            let pieceAtTarget = this.whatPieceIsAt(to);
            
            // Moving forward
            if (colDiff === 0 && !pieceAtTarget) {
                if (rowDiff === direction) {
                    return true; // One square forward
                }
                if (rowDiff === 2 * direction && fromRow === startRow) {
                    return true; // Two squares from start
                }
            }
            
            // Capturing diagonally
            if (colDiff === 1 && rowDiff === direction && pieceAtTarget) {
                return !this.isMyPiece(pieceAtTarget); // Can capture enemy piece
            }
            
            return false;
        },

        // Check if path between two squares is empty
        isPathEmpty(piece, target) {
            // Knights and kings don't need to check path
            if (piece.type === 'knight' || piece.type === 'king') {
                return true;
            }
            
            let from = piece.position;
            let fromCol = from[0].charCodeAt(0) - 97;
            let fromRow = parseInt(from[1]) - 1;
            let toCol = target[0].charCodeAt(0) - 97;
            let toRow = parseInt(target[1]) - 1;
            
            let colStep = 0;
            let rowStep = 0;
            
            if (toCol > fromCol) colStep = 1;
            if (toCol < fromCol) colStep = -1;
            if (toRow > fromRow) rowStep = 1;
            if (toRow < fromRow) rowStep = -1;
            
            let checkCol = fromCol + colStep;
            let checkRow = fromRow + rowStep;
            
            // Check each square along the path
            while (checkCol !== toCol || checkRow !== toRow) {
                let checkSquare = String.fromCharCode(97 + checkCol) + (checkRow + 1);
                if (this.whatPieceIsAt(checkSquare)) {
                    console.log("Path blocked at " + checkSquare);
                    return false;
                }
                checkCol += colStep;
                checkRow += rowStep;
            }
            
            return true;
        },

        // What piece is at a square?
        whatPieceIsAt(square) {
            for (let i = 0; i < this.p1.length; i++) {
                if (this.p1[i].position === square) {
                    return this.p1[i];
                }
            }
            for (let i = 0; i < this.p2.length; i++) {
                if (this.p2[i].position === square) {
                    return this.p2[i];
                }
            }
            return null;
        },

        // Is this piece mine?
        isMyPiece(piece) {
            let isMine = false;
            
            if (this.currentPlayer === 'p1') {
                isMine = this.p1.includes(piece);
            } else {
                isMine = this.p2.includes(piece);
            }
            
            console.log(`Checking if ${piece.name} belongs to ${this.currentPlayer}: ${isMine}`);
            return isMine;
        },

        // EXISTING GAME FUNCTIONS
        move(item, to) {
            // Check if there's a piece to capture
            const capturedPiece = this.p1.find(p => p.position === to) || this.p2.find(p => p.position === to);
            if (capturedPiece && capturedPiece !== item) {
                if (this.p1.includes(capturedPiece)) {
                    this.p1 = this.p1.filter(p => p !== capturedPiece);
                } else {
                    this.p2 = this.p2.filter(p => p !== capturedPiece);
                }
            }
            
            item.position = to;
            this.from = null;
            this.to = null;
            this.clearPredictions(); // Clear predictions after move
            this.currentPlayer = this.currentPlayer === 'p1' ? 'p2' : 'p1';
        },
        
        tileSymbol(position) {
            const piece = this.p1.find(p => p.position === position) || this.p2.find(p => p.position === position);
            return piece ? piece.symbol : '';
        },
        
        selectTile(position) {
            if (this.from) {
                const piece = this.p1.find(p => p.position === this.from) || this.p2.find(p => p.position === this.from);
                if (piece && position !== this.from) {
                    const isP1Piece = this.p1.includes(piece);
                    if ((isP1Piece && this.currentPlayer === 'p1') || (!isP1Piece && this.currentPlayer === 'p2')) {
                        
                        // Check if the move is legal before executing
                        try {
                            this.checkIfMoveIsOk(piece, position);
                            
                            // Store the starting position before it gets cleared
                            let startPosition = this.from;
                            
                            // Execute the move
                            this.to = position;
                            this.move(piece, this.to);
                            
                            // Generate chess notation for this move 
                            let chessNotation = this.generateChessNotation(piece, startPosition, position);
                            
                            // Check if move puts opponent in check 
                            let checkStatus = this.checkForCheck();
                            if (checkStatus.inCheck) {
                                chessNotation += "+";
                                alert(`CHECK! ${checkStatus.player} king is in check and must move!`);
                            }
                            
                            // Record in history with both formats 
                            this.history += `Mouse Move: ${piece.name} from ${startPosition} to ${position} (${chessNotation})\n`;
                            console.log(`Mouse move: ${piece.name} ${startPosition} -> ${position} = ${chessNotation}`);
                            
                        } catch (error) {
                            alert(`Illegal Move: ${error.message}`);
                            this.history += `Illegal Mouse Move: ${piece.name} ${this.from} to ${position} - ${error.message}\n`;
                        }
                        
                    } else {
                        this.from = null;
                        this.clearPredictions();
                        alert(`It's ${this.currentPlayer === 'p1' ? 'Player 1' : 'Player 2'}'s turn!`);
                    }
                } else {
                    this.from = null;
                    this.clearPredictions();
                }
            } else {
                const piece = this.p1.find(p => p.position === position) || this.p2.find(p => p.position === position);
                if (piece) {
                    const isP1Piece = this.p1.includes(piece);
                    if ((isP1Piece && this.currentPlayer === 'p1') || (!isP1Piece && this.currentPlayer === 'p2')) {
                        this.from = position;
                        this.predictMoves(piece); // NEW: Predict moves when selecting a piece
                        console.log(`Selected piece: ${piece.name} at ${position}`);
                        this.history += `Selected: ${piece.name} at ${position}\n`;
                    } else {
                        alert(`It's ${this.currentPlayer === 'p1' ? 'Player 1' : 'Player 2'}'s turn!`);
                    }
                }
            }
        },

        // Generate chess notation for a move 
        generateChessNotation(piece, from, to) {
            if (piece.type === 'pawn') {
                // Check if it's a capture
                let capturedPiece = this.whatPieceIsAt(to);
                if (capturedPiece && !this.isMyPiece(capturedPiece)) {
                    return from[0] + "x" + to; // Like "exd5"
                } else {
                    return to; // Like "e4"
                }
            } else {
                // Piece moves
                let pieceSymbol = piece.type[0].toUpperCase(); // K, Q, R, B, N
                let capturedPiece = this.whatPieceIsAt(to);
                
                if (capturedPiece && !this.isMyPiece(capturedPiece)) {
                    return pieceSymbol + "x" + to; // Like "Nxf7"
                } else {
                    return pieceSymbol + to; // Like "Nf3"
                }
            }
        },

        // Check if current move puts opponent in check 
        checkForCheck() {
            // Find the opponent's king (AFTER the turn has switched)
            let opponentPieces = (this.currentPlayer === 'p1') ? this.p2 : this.p1;
            let opponentKing = null;
            
            for (let i = 0; i < opponentPieces.length; i++) {
                if (opponentPieces[i].type === 'king') {
                    opponentKing = opponentPieces[i];
                    break;
                }
            }
            
            if (!opponentKing) {
                return { inCheck: false, player: null };
            }
            
            // Check if any of my pieces (the player who just moved) can attack the opponent's king
            let myPieces = (this.currentPlayer === 'p1') ? this.p1 : this.p2;
            
            for (let i = 0; i < myPieces.length; i++) {
                let piece = myPieces[i];
                if (this.canPieceMoveThere(piece, opponentKing.position) && 
                    this.isPathEmpty(piece, opponentKing.position)) {
                    
                    let playerName = (this.currentPlayer === 'p1') ? 'Player 2' : 'Player 1';
                    return { inCheck: true, player: playerName };
                }
            }
            
            return { inCheck: false, player: null };
        },
    }
}