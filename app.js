function chessCompiler() {
    return {
        // ==========================================
        // PHASE 1: DATA STRUCTURES & INITIALIZATION
        // ==========================================
        
        // BOARD STATE
        from: null,
        to: null,
        line: '',
        history: '',
        currentPlayer: 'p1',
        predictedMoves: [],
        gameOver: false,
        gameResult: '',
        
        // PIECE ARRAYS
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

        // LEXICAL ANALYSIS VARIABLES
        letters: [],
        where: 0,

        // ==========================================
        // PHASE 2: LEXICAL ANALYSIS (TOKENIZATION)
        // ==========================================
        
        breakIntoLetters() {
            console.log("PHASE 2: LEXICAL ANALYSIS - Breaking into tokens");
            this.letters = [];
            
            for (let i = 0; i < this.line.length; i++) {
                let letter = this.line[i];
                
                if (letter === ' ') {
                    continue; // Skip whitespace
                }
                
                // TOKEN CLASSIFICATION
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
                    throw new Error("LEXICAL ERROR: Unknown token '" + letter + "'");
                }
            }
            
            console.log("Tokens found:", this.letters);
        },

        // ==========================================
        // PHASE 3: SYNTAX ANALYSIS (PARSING)
        // ==========================================
        
        figureOutMove() {
            console.log("PHASE 3: SYNTAX ANALYSIS - Parsing move structure");
            this.where = 0; // Reset parser position
            
            if (this.letters.length === 0) {
                throw new Error("SYNTAX ERROR: Empty move");
            }
            
            let first = this.letters[0];
            
            if (first.type === 'PIECE') {
                return this.parsePieceMove();
            } else if (first.type === 'COLUMN') {
                return this.parsePawnMove();
            } else {
                throw new Error("SYNTAX ERROR: Move must start with piece or column");
            }
        },

        parsePieceMove() {
            let piece = this.consumeToken('PIECE');
            let target = this.parseSquare();
            
            return {
                type: 'piece',
                piece: piece,
                target: target
            };
        },

        parsePawnMove() {
            let captureColumn = null;
            
            // Check for capture notation like "exd5"
            if (this.where + 1 < this.letters.length && this.letters[this.where + 1].type === 'CAPTURE') {
                captureColumn = this.consumeToken('COLUMN');
                this.consumeToken('CAPTURE');
            }
            
            let target = this.parseSquare();
            
            return {
                type: 'pawn',
                captureColumn: captureColumn,
                target: target
            };
        },

        parseSquare() {
            let column = this.consumeToken('COLUMN');
            let row = this.consumeToken('ROW');
            return column + row;
        },

        consumeToken(expectedType) {
            if (this.where >= this.letters.length) {
                throw new Error("SYNTAX ERROR: Unexpected end of input, expected " + expectedType);
            }
            
            let current = this.letters[this.where];
            if (current.type !== expectedType) {
                throw new Error("SYNTAX ERROR: Expected " + expectedType + " but got " + current.type);
            }
            
            this.where++;
            return current.letter;
        },

        // ==========================================
        // PHASE 4: SEMANTIC ANALYSIS
        // ==========================================
        
        findChessPiece(moveInfo) {
            console.log("PHASE 4: SEMANTIC ANALYSIS - Finding target piece");
            
            let myPieces = (this.currentPlayer === 'p1') ? this.p1 : this.p2;
            
            if (moveInfo.type === 'piece') {
                return this.findSpecificPiece(myPieces, moveInfo.piece, moveInfo.target);
            } else {
                return this.findPawnForMove(myPieces, moveInfo);
            }
        },

        findSpecificPiece(myPieces, pieceType, target) {
            let pieceMap = {
                'K': 'king', 'Q': 'queen', 'R': 'rook', 
                'B': 'bishop', 'N': 'knight'
            };
            
            let targetPieceType = pieceMap[pieceType];
            let candidates = [];
            
            // Find all pieces of this type
            for (let piece of myPieces) {
                if (piece.type === targetPieceType) {
                    candidates.push(piece);
                }
            }
            
            if (candidates.length === 0) {
                throw new Error("SEMANTIC ERROR: No " + targetPieceType + " found");
            }
            
            // Filter by pieces that can legally move to target
            let legalCandidates = [];
            for (let piece of candidates) {
                try {
                    this.validateMove(piece, target);
                    legalCandidates.push(piece);
                } catch (error) {
                    // This piece can't make the move
                }
            }
            
            if (legalCandidates.length === 0) {
                throw new Error("SEMANTIC ERROR: No " + targetPieceType + " can move to " + target);
            }
            
            if (legalCandidates.length > 1) {
                throw new Error("SEMANTIC ERROR: Ambiguous move - multiple " + targetPieceType + "s can move to " + target);
            }
            
            return legalCandidates[0];
        },

        findPawnForMove(myPieces, moveInfo) {
            let candidates = [];
            
            for (let piece of myPieces) {
                if (piece.type !== 'pawn') continue;
                
                if (moveInfo.captureColumn) {
                    // Capture move - pawn must be on capture column
                    if (piece.position[0] === moveInfo.captureColumn) {
                        candidates.push(piece);
                    }
                } else {
                    // Normal move - pawn must be on same file as target
                    if (piece.position[0] === moveInfo.target[0]) {
                        candidates.push(piece);
                    }
                }
            }
            
            if (candidates.length === 0) {
                throw new Error("SEMANTIC ERROR: No pawn can make this move");
            }
            
            // Filter by legal moves
            let legalCandidates = [];
            for (let piece of candidates) {
                try {
                    this.validateMove(piece, moveInfo.target);
                    legalCandidates.push(piece);
                } catch (error) {
                    // This pawn can't make the move
                }
            }
            
            if (legalCandidates.length === 0) {
                throw new Error("SEMANTIC ERROR: No pawn can legally move to " + moveInfo.target);
            }
            
            if (legalCandidates.length > 1) {
                throw new Error("SEMANTIC ERROR: Ambiguous pawn move");
            }
            
            return legalCandidates[0];
        },

        // ==========================================
        // PHASE 5: MOVE VALIDATION
        // ==========================================
        
        validateMove(piece, target) {
            console.log("PHASE 5: MOVE VALIDATION - Checking legality");
            
            // Basic target validation
            this.validateTarget(target);
            
            // Piece movement pattern validation
            if (!this.canPieceMoveThere(piece, target)) {
                throw new Error("MOVE ERROR: " + piece.type + " cannot move to " + target);
            }
            
            // Path obstruction validation
            if (!this.isPathEmpty(piece, target)) {
                throw new Error("MOVE ERROR: Path blocked to " + target);
            }
            
            // Own piece capture prevention
            let pieceAtTarget = this.whatPieceIsAt(target);
            if (pieceAtTarget && this.isMyPiece(pieceAtTarget)) {
                throw new Error("MOVE ERROR: Cannot capture your own piece at " + target);
            }
            
            // King safety validation
            if (this.wouldMoveLeaveKingInCheck(piece, target)) {
                throw new Error("MOVE ERROR: This move would leave your king in check!");
            }
            
            console.log("✅ Move validation passed");
        },

        validateTarget(target) {
            if (target.length !== 2) {
                throw new Error("MOVE ERROR: Invalid target square format");
            }
            
            let column = target[0];
            let row = target[1];
            
            if (column < 'a' || column > 'h' || row < '1' || row > '8') {
                throw new Error("MOVE ERROR: Target square " + target + " is off the board");
            }
        },

        // ==========================================
        // PHASE 6: PIECE MOVEMENT RULES
        // ==========================================
        
        canPieceMoveThere(piece, target) {
            let from = piece.position;
            let fromCol = from[0].charCodeAt(0) - 97;
            let fromRow = parseInt(from[1]) - 1;
            let toCol = target[0].charCodeAt(0) - 97;
            let toRow = parseInt(target[1]) - 1;
            
            let colDiff = Math.abs(toCol - fromCol);
            let rowDiff = Math.abs(toRow - fromRow);
            
            switch (piece.type) {
                case 'pawn':
                    return this.validatePawnMove(piece, from, target, fromCol, fromRow, toCol, toRow);
                case 'rook':
                    return (colDiff === 0 || rowDiff === 0);
                case 'bishop':
                    return (colDiff === rowDiff);
                case 'queen':
                    return (colDiff === 0 || rowDiff === 0 || colDiff === rowDiff);
                case 'knight':
                    return ((colDiff === 2 && rowDiff === 1) || (colDiff === 1 && rowDiff === 2));
                case 'king':
                    return (colDiff <= 1 && rowDiff <= 1 && (colDiff + rowDiff > 0));
                default:
                    return false;
            }
        },

        validatePawnMove(piece, from, to, fromCol, fromRow, toCol, toRow) {
            let isPlayer1 = this.p1.includes(piece);
            let direction = isPlayer1 ? 1 : -1;
            let startRow = isPlayer1 ? 1 : 6;
            
            let colDiff = Math.abs(toCol - fromCol);
            let rowDiff = toRow - fromRow;
            let pieceAtTarget = this.whatPieceIsAt(to);
            
            // Forward movement
            if (colDiff === 0 && !pieceAtTarget) {
                if (rowDiff === direction) return true; // One square
                if (rowDiff === 2 * direction && fromRow === startRow) return true; // Two squares from start
            }
            
            // Diagonal capture
            if (colDiff === 1 && rowDiff === direction && pieceAtTarget) {
                return !this.isMyPiece(pieceAtTarget);
            }
            
            return false;
        },

        isPathEmpty(piece, target) {
            if (piece.type === 'knight' || piece.type === 'king') {
                return true; // These pieces jump/move one square
            }
            
            let from = piece.position;
            let fromCol = from[0].charCodeAt(0) - 97;
            let fromRow = parseInt(from[1]) - 1;
            let toCol = target[0].charCodeAt(0) - 97;
            let toRow = parseInt(target[1]) - 1;
            
            let colStep = Math.sign(toCol - fromCol);
            let rowStep = Math.sign(toRow - fromRow);
            
            let checkCol = fromCol + colStep;
            let checkRow = fromRow + rowStep;
            
            while (checkCol !== toCol || checkRow !== toRow) {
                let checkSquare = String.fromCharCode(97 + checkCol) + (checkRow + 1);
                if (this.whatPieceIsAt(checkSquare)) {
                    return false;
                }
                checkCol += colStep;
                checkRow += rowStep;
            }
            
            return true;
        },

        // ==========================================
        // PHASE 7: KING SAFETY ANALYSIS
        // ==========================================
        
        wouldMoveLeaveKingInCheck(piece, target) {
            // Save current state
            let originalPosition = piece.position;
            let capturedPiece = this.whatPieceIsAt(target);
            let capturedFrom = null;
            
            // Simulate move
            piece.position = target;
            if (capturedPiece) {
                if (this.p1.includes(capturedPiece)) {
                    capturedFrom = 'p1';
                    this.p1 = this.p1.filter(p => p !== capturedPiece);
                } else {
                    capturedFrom = 'p2';
                    this.p2 = this.p2.filter(p => p !== capturedPiece);
                }
            }
            
            // Check if my king would be in check
            let myPieces = (this.currentPlayer === 'p1') ? this.p1 : this.p2;
            let myKing = myPieces.find(p => p.type === 'king');
            let wouldBeInCheck = false;
            
            if (myKing) {
                let opponentPieces = (this.currentPlayer === 'p1') ? this.p2 : this.p1;
                
                for (let opponentPiece of opponentPieces) {
                    if (this.canPieceMoveThere(opponentPiece, myKing.position) && 
                        this.isPathEmpty(opponentPiece, myKing.position)) {
                        wouldBeInCheck = true;
                        break;
                    }
                }
            }
            
            // Restore state
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

        // ==========================================
        // PHASE 8: GAME STATE ANALYSIS
        // ==========================================
        
        checkForGameEnd() {
            console.log("PHASE 8: GAME STATE ANALYSIS - Checking for game end");
            
            let currentPieces = (this.currentPlayer === 'p1') ? this.p1 : this.p2;
            let legalMoves = [];
            
            // Find all legal moves for current player
            for (let piece of currentPieces) {
                let pieceMoves = this.findAllLegalMovesForPiece(piece);
                legalMoves = legalMoves.concat(pieceMoves);
            }
            
            console.log(`Found ${legalMoves.length} legal moves for ${this.currentPlayer}`);
            
            if (legalMoves.length === 0) {
                // No legal moves - either checkmate or stalemate
                let inCheck = this.isCurrentPlayerInCheck();
                
                if (inCheck) {
                    this.gameOver = true;
                    this.gameResult = `CHECKMATE! ${this.currentPlayer === 'p1' ? 'Player 2' : 'Player 1'} wins!`;
                    alert(this.gameResult);
                    this.history += `\n=== GAME OVER ===\n${this.gameResult}\n`;
                } else {
                    this.gameOver = true;
                    this.gameResult = "STALEMATE! The game is a draw.";
                    alert(this.gameResult);
                    this.history += `\n=== GAME OVER ===\n${this.gameResult}\n`;
                }
                
                return true;
            }
            
            return false;
        },

        findAllLegalMovesForPiece(piece) {
            let legalMoves = [];
            const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
            const rows = [1, 2, 3, 4, 5, 6, 7, 8];
            
            for (let col of columns) {
                for (let row of rows) {
                    let targetSquare = col + row;
                    
                    if (targetSquare === piece.position) continue;
                    
                    try {
                        this.validateMove(piece, targetSquare);
                        legalMoves.push({
                            piece: piece,
                            target: targetSquare
                        });
                    } catch (error) {
                        // Move is illegal, skip it
                    }
                }
            }
            
            return legalMoves;
        },

        isCurrentPlayerInCheck() {
            let myPieces = (this.currentPlayer === 'p1') ? this.p1 : this.p2;
            let myKing = myPieces.find(p => p.type === 'king');
            
            if (!myKing) return false;
            
            let opponentPieces = (this.currentPlayer === 'p1') ? this.p2 : this.p1;
            
            for (let piece of opponentPieces) {
                if (this.canPieceMoveThere(piece, myKing.position) && 
                    this.isPathEmpty(piece, myKing.position)) {
                    return true;
                }
            }
            
            return false;
        },

        // ==========================================
        // PHASE 9: MOVE EXECUTION
        // ==========================================
        
        executeMove(piece, target) {
            console.log("PHASE 9: MOVE EXECUTION");
            
            // Capture handling
            const capturedPiece = this.whatPieceIsAt(target);
            if (capturedPiece && capturedPiece !== piece) {
                if (this.p1.includes(capturedPiece)) {
                    this.p1 = this.p1.filter(p => p !== capturedPiece);
                } else {
                    this.p2 = this.p2.filter(p => p !== capturedPiece);
                }
                console.log(`Captured: ${capturedPiece.name}`);
            }
            
            // Move piece
            let from = piece.position;
            piece.position = target;
            
            // Generate notation
            let notation = this.generateChessNotation(piece, from, target);
            
            // Switch turns
            this.currentPlayer = this.currentPlayer === 'p1' ? 'p2' : 'p1';
            
            // Check for check
            let checkStatus = this.checkForOpponentInCheck();
            if (checkStatus.inCheck) {
                notation += "+";
                // Don't alert immediately - check for game end first
            }
            
            // Check for game end
            if (!this.checkForGameEnd() && checkStatus.inCheck) {
                alert(`CHECK! ${checkStatus.player} king is in check and must move!`);
            }
            
            return notation;
        },

        checkForOpponentInCheck() {
            // Find opponent's king (current player switched already)
            let opponentPieces = (this.currentPlayer === 'p1') ? this.p2 : this.p1;
            let opponentKing = opponentPieces.find(p => p.type === 'king');
            
            if (!opponentKing) {
                return { inCheck: false, player: null };
            }
            
            // Check if any of the previous player's pieces can attack opponent king
            let attackingPieces = (this.currentPlayer === 'p1') ? this.p1 : this.p2;
            
            for (let piece of attackingPieces) {
                if (this.canPieceMoveThere(piece, opponentKing.position) && 
                    this.isPathEmpty(piece, opponentKing.position)) {
                    
                    let playerName = (this.currentPlayer === 'p1') ? 'Player 2' : 'Player 1';
                    return { inCheck: true, player: playerName };
                }
            }
            
            return { inCheck: false, player: null };
        },

        // ==========================================
        // PHASE 10: MOVE PREDICTION & UI
        // ==========================================
        
        predictMoves(piece) {
            console.log("PHASE 10: MOVE PREDICTION");
            this.predictedMoves = [];
            
            const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
            const rows = [1, 2, 3, 4, 5, 6, 7, 8];
            
            for (let col of columns) {
                for (let row of rows) {
                    let targetSquare = col + row;
                    
                    if (targetSquare === piece.position) continue;
                    
                    try {
                        this.validateMove(piece, targetSquare);
                        
                        let pieceAtTarget = this.whatPieceIsAt(targetSquare);
                        let isCapture = pieceAtTarget && !this.isMyPiece(pieceAtTarget);
                        
                        this.predictedMoves.push({
                            square: targetSquare,
                            isCapture: isCapture
                        });
                        
                    } catch (error) {
                        // Move is illegal
                    }
                }
            }
            
            console.log(`Predicted ${this.predictedMoves.length} legal moves`);
        },

        isPredictedMove(square) {
            return this.predictedMoves.some(move => move.square === square);
        },

        isPredictedCapture(square) {
            return this.predictedMoves.some(move => move.square === square && move.isCapture);
        },

        clearPredictions() {
            this.predictedMoves = [];
        },

        // ==========================================
        // MAIN COMPILER ENTRY POINTS
        // ==========================================
        
        scanMove() {
            if (this.gameOver) {
                alert("Game is over! " + this.gameResult);
                return;
            }
            
            try {
                console.log("=== CHESS MOVE COMPILER STARTED ===");
                console.log("Input: " + this.line);
                
                // PHASE 2: Lexical Analysis
                this.breakIntoLetters();
                
                // PHASE 3: Syntax Analysis
                let moveInfo = this.figureOutMove();
                
                // PHASE 4: Semantic Analysis
                let piece = this.findChessPiece(moveInfo);
                
                // PHASE 5: Move Validation
                this.validateMove(piece, moveInfo.target);
                
                // PHASE 9: Move Execution
                let notation = this.executeMove(piece, moveInfo.target);
                
                this.history += `Text Move: ${this.line} → ${notation}\n`;
                this.line = '';
                this.clearPredictions();
                
                console.log("=== CHESS MOVE COMPILER COMPLETED ===");
                
            } catch (error) {
                alert("COMPILER ERROR: " + error.message);
                this.history += `Error: ${this.line} - ${error.message}\n`;
                console.log("=== CHESS MOVE COMPILER FAILED ===");
            }
        },

        selectTile(position) {
            if (this.gameOver) {
                alert("Game is over! " + this.gameResult);
                return;
            }
            
            if (this.from) {
                // Second click - try to move
                const piece = this.whatPieceIsAt(this.from);
                if (piece && position !== this.from) {
                    const isMyPiece = this.isMyPiece(piece);
                    if (isMyPiece) {
                        try {
                            this.validateMove(piece, position);
                            
                            let startPosition = this.from;
                            let notation = this.executeMove(piece, position);
                            
                            this.history += `Mouse Move: ${piece.name} ${startPosition} → ${position} (${notation})\n`;
                            console.log(`Mouse move executed: ${notation}`);
                            
                        } catch (error) {
                            alert(`Illegal Move: ${error.message}`);
                            this.history += `Illegal Move: ${piece.name} ${this.from} → ${position} - ${error.message}\n`;
                        }
                    } else {
                        alert(`It's ${this.currentPlayer === 'p1' ? 'Player 1' : 'Player 2'}'s turn!`);
                    }
                }
                this.from = null;
                this.clearPredictions();
            } else {
                // First click - select piece
                const piece = this.whatPieceIsAt(position);
                if (piece && this.isMyPiece(piece)) {
                    this.from = position;
                    this.predictMoves(piece);
                    console.log(`Selected: ${piece.name} at ${position}`);
                    this.history += `Selected: ${piece.name} at ${position}\n`;
                } else if (piece) {
                    alert(`It's ${this.currentPlayer === 'p1' ? 'Player 1' : 'Player 2'}'s turn!`);
                }
            }
        },

        // ==========================================
        // UTILITY FUNCTIONS
        // ==========================================
        
        tileSymbol(position) {
            const piece = this.whatPieceIsAt(position);
            return piece ? piece.symbol : '';
        },
        
        whatPieceIsAt(square) {
            for (let piece of this.p1) {
                if (piece.position === square) return piece;
            }
            for (let piece of this.p2) {
                if (piece.position === square) return piece;
            }
            return null;
        },

        isMyPiece(piece) {
            if (this.currentPlayer === 'p1') {
                return this.p1.includes(piece);
            } else {
                return this.p2.includes(piece);
            }
        },

        generateChessNotation(piece, from, to) {
            if (piece.type === 'pawn') {
                let capturedPiece = this.whatPieceIsAt(to);
                if (capturedPiece && !this.isMyPiece(capturedPiece)) {
                    return from[0] + "x" + to; // e.g., "exd5"
                } else {
                    return to; // e.g., "e4"
                }
            } else {
                let pieceSymbol = piece.type[0].toUpperCase(); // K, Q, R, B, N
                let capturedPiece = this.whatPieceIsAt(to);
                
                if (capturedPiece && !this.isMyPiece(capturedPiece)) {
                    return pieceSymbol + "x" + to; // e.g., "Nxf7"
                } else {
                    return pieceSymbol + to; // e.g., "Nf3"
                }
            }
        },

        // Legacy move function for compatibility
        move(item, to) {
            this.executeMove(item, to);
        }
    }
}