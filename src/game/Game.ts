import { Board } from './Board';
import { Piece, Position, PieceColor, Move } from '@/types';

export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate';

interface GameState {
  board: Board;
  currentTurn: PieceColor;
  capturedPieces: { white: Piece[]; black: Piece[] };
  status: GameStatus;
}

export interface SavedGame {
  board: string[][];
  currentTurn: PieceColor;
  moveHistory: Move[];
  capturedPieces: { white: string[]; black: string[] };
  status: GameStatus;
  timestamp: number;
}

export class Game {
  private board: Board;
  private currentTurn: PieceColor;
  private moveHistory: Move[];
  private capturedPieces: { white: Piece[]; black: Piece[] };
  private gameStates: GameState[];
  public status: GameStatus;

  constructor() {
    this.board = new Board();
    this.currentTurn = 'white';
    this.moveHistory = [];
    this.capturedPieces = { white: [], black: [] };
    this.gameStates = [];
    this.status = 'playing';
  }

  getBoard(): (Piece | null)[][] {
    return this.board.getBoard();
  }

  getCurrentTurn(): PieceColor {
    return this.currentTurn;
  }

  getStatus(): GameStatus {
    return this.status;
  }

  getCapturedPieces(): { white: Piece[]; black: Piece[] } {
    return this.capturedPieces;
  }

  getMoveHistory(): Move[] {
    return this.moveHistory;
  }

  isValidMove(from: Position, to: Position): boolean {
    const piece = this.board.getPiece(from);
    
    if (!piece || piece.color !== this.currentTurn) {
      return false;
    }

    if (!piece.canMove(to, this.board.getBoard())) {
      return false;
    }

    // Simulate move and check if it puts own king in check
    const boardClone = this.board.clone();
    boardClone.movePiece(from, to);
    
    if (boardClone.isInCheck(this.currentTurn)) {
      return false;
    }

    return true;
  }

  makeMove(from: Position, to: Position): boolean {
    if (!this.isValidMove(from, to)) {
      return false;
    }

    const piece = this.board.getPiece(from);
    if (!piece) return false;

    // Сохраняем текущее состояние игры перед ходом
    this.saveState();

    const capturedPiece = this.board.movePiece(from, to);

    if (capturedPiece) {
      this.capturedPieces[this.currentTurn].push(capturedPiece);
    }

    this.moveHistory.push({
      from,
      to,
      capturedPiece: capturedPiece || undefined
    });

    this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
    this.updateGameStatus();

    return true;
  }

  private saveState(): void {
    this.gameStates.push({
      board: this.board.clone(),
      currentTurn: this.currentTurn,
      capturedPieces: {
        white: [...this.capturedPieces.white.map(p => p.clone())],
        black: [...this.capturedPieces.black.map(p => p.clone())]
      },
      status: this.status
    });
  }

  canUndo(): boolean {
    return this.gameStates.length > 0;
  }

  undo(): boolean {
    if (!this.canUndo()) {
      return false;
    }

    const previousState = this.gameStates.pop()!;
    
    this.board = previousState.board;
    this.currentTurn = previousState.currentTurn;
    this.capturedPieces = previousState.capturedPieces;
    this.status = previousState.status;
    
    // Удаляем последний ход из истории
    this.moveHistory.pop();

    return true;
  }

  private updateGameStatus(): void {
    if (this.board.isInCheck(this.currentTurn)) {
      if (this.hasNoLegalMoves()) {
        this.status = 'checkmate';
      } else {
        this.status = 'check';
      }
    } else if (this.hasNoLegalMoves()) {
      this.status = 'stalemate';
    } else {
      this.status = 'playing';
    }
  }

  private hasNoLegalMoves(): boolean {
    const pieces = this.board.getAllPiecesOfColor(this.currentTurn);
    
    for (const piece of pieces) {
      const validMoves = piece.getValidMoves(this.board.getBoard());
      
      for (const move of validMoves) {
        if (this.isValidMove(piece.position, move)) {
          return false;
        }
      }
    }

    return true;
  }

  getValidMovesForPiece(position: Position): Position[] {
    const piece = this.board.getPiece(position);
    if (!piece || piece.color !== this.currentTurn) {
      return [];
    }

    const allMoves = piece.getValidMoves(this.board.getBoard());
    return allMoves.filter(move => this.isValidMove(position, move));
  }

  reset(): void {
    this.board = new Board();
    this.currentTurn = 'white';
    this.moveHistory = [];
    this.capturedPieces = { white: [], black: [] };
    this.gameStates = [];
    this.status = 'playing';
  }

  saveGame(): SavedGame {
    const board = this.board.getBoard();
    const savedBoard: string[][] = [];
    
    for (let row = 0; row < 8; row++) {
      savedBoard[row] = [];
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          savedBoard[row][col] = JSON.stringify({
            type: piece.type,
            color: piece.color,
            hasMoved: piece.hasMoved,
            position: piece.position
          });
        } else {
          savedBoard[row][col] = '';
        }
      }
    }

    return {
      board: savedBoard,
      currentTurn: this.currentTurn,
      moveHistory: this.moveHistory,
      capturedPieces: {
        white: this.capturedPieces.white.map(p => JSON.stringify({
          type: p.type,
          color: p.color,
          position: p.position
        })),
        black: this.capturedPieces.black.map(p => JSON.stringify({
          type: p.type,
          color: p.color,
          position: p.position
        }))
      },
      status: this.status,
      timestamp: Date.now()
    };
  }

  loadGame(savedGame: SavedGame): void {
    // Загрузка будет реализована через полный reset и восстановление ходов
    // Это более надежный способ восстановления состояния
    this.reset();
    this.currentTurn = savedGame.currentTurn;
    this.moveHistory = savedGame.moveHistory;
    this.status = savedGame.status;
    
    // Восстанавливаем доску
    const board = this.board.getBoard();
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (savedGame.board[row][col]) {
          const pieceData = JSON.parse(savedGame.board[row][col]);
          const piece = this.createPieceFromData(pieceData);
          if (piece) {
            board[row][col] = piece;
          }
        } else {
          board[row][col] = null;
        }
      }
    }

    // Восстанавливаем взятые фигуры
    this.capturedPieces.white = savedGame.capturedPieces.white.map(p => {
      const pieceData = JSON.parse(p);
      return this.createPieceFromData(pieceData)!;
    });
    
    this.capturedPieces.black = savedGame.capturedPieces.black.map(p => {
      const pieceData = JSON.parse(p);
      return this.createPieceFromData(pieceData)!;
    });
  }

  private createPieceFromData(data: any): Piece | null {
    const { type, color, position, hasMoved } = data;
    
    // Импортируем классы фигур
    const { Pawn } = require('@/pieces/Pawn');
    const { Rook } = require('@/pieces/Rook');
    const { Knight } = require('@/pieces/Knight');
    const { Bishop } = require('@/pieces/Bishop');
    const { Queen } = require('@/pieces/Queen');
    const { King } = require('@/pieces/King');

    let piece: Piece | null = null;

    switch (type) {
      case 'pawn':
        piece = new Pawn(color, position, hasMoved);
        break;
      case 'rook':
        piece = new Rook(color, position, hasMoved);
        break;
      case 'knight':
        piece = new Knight(color, position, hasMoved);
        break;
      case 'bishop':
        piece = new Bishop(color, position, hasMoved);
        break;
      case 'queen':
        piece = new Queen(color, position, hasMoved);
        break;
      case 'king':
        piece = new King(color, position, hasMoved);
        break;
    }

    return piece;
  }
}

