import { Board } from './Board';
import { Piece, Position, PieceColor, Move } from '@/types';

export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate';

export class Game {
  private board: Board;
  private currentTurn: PieceColor;
  private moveHistory: Move[];
  private capturedPieces: { white: Piece[]; black: Piece[] };
  public status: GameStatus;

  constructor() {
    this.board = new Board();
    this.currentTurn = 'white';
    this.moveHistory = [];
    this.capturedPieces = { white: [], black: [] };
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
    this.status = 'playing';
  }
}

