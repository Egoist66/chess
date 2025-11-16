import { Piece, Position, PieceColor } from '@/types';
import { Pawn } from '@/pieces/Pawn';
import { Rook } from '@/pieces/Rook';
import { Knight } from '@/pieces/Knight';
import { Bishop } from '@/pieces/Bishop';
import { Queen } from '@/pieces/Queen';
import { King } from '@/pieces/King';

export class Board {
  private board: (Piece | null)[][];

  constructor() {
    this.board = this.initializeBoard();
  }

  private initializeBoard(): (Piece | null)[][] {
    const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

    // Расставляем черные фигуры
    board[0][0] = new Rook('black', { row: 0, col: 0 });
    board[0][1] = new Knight('black', { row: 0, col: 1 });
    board[0][2] = new Bishop('black', { row: 0, col: 2 });
    board[0][3] = new Queen('black', { row: 0, col: 3 });
    board[0][4] = new King('black', { row: 0, col: 4 });
    board[0][5] = new Bishop('black', { row: 0, col: 5 });
    board[0][6] = new Knight('black', { row: 0, col: 6 });
    board[0][7] = new Rook('black', { row: 0, col: 7 });

    for (let col = 0; col < 8; col++) {
      board[1][col] = new Pawn('black', { row: 1, col });
    }

    // Расставляем белые фигуры
    for (let col = 0; col < 8; col++) {
      board[6][col] = new Pawn('white', { row: 6, col });
    }

    board[7][0] = new Rook('white', { row: 7, col: 0 });
    board[7][1] = new Knight('white', { row: 7, col: 1 });
    board[7][2] = new Bishop('white', { row: 7, col: 2 });
    board[7][3] = new Queen('white', { row: 7, col: 3 });
    board[7][4] = new King('white', { row: 7, col: 4 });
    board[7][5] = new Bishop('white', { row: 7, col: 5 });
    board[7][6] = new Knight('white', { row: 7, col: 6 });
    board[7][7] = new Rook('white', { row: 7, col: 7 });

    return board;
  }

  getBoard(): (Piece | null)[][] {
    return this.board;
  }

  getPiece(position: Position): Piece | null {
    return this.board[position.row][position.col];
  }

  setPiece(position: Position, piece: Piece | null): void {
    this.board[position.row][position.col] = piece;
    if (piece) {
      piece.position = position;
    }
  }

  movePiece(from: Position, to: Position): Piece | null {
    const piece = this.getPiece(from);
    if (!piece) return null;

    const capturedPiece = this.getPiece(to);

    // Handle castling
    if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
      // Kingside castling
      if (to.col === 6) {
        const rook = this.getPiece({ row: from.row, col: 7 });
        if (rook) {
          this.setPiece({ row: from.row, col: 7 }, null);
          this.setPiece({ row: from.row, col: 5 }, rook);
          rook.hasMoved = true;
        }
      }
      // Queenside castling
      else if (to.col === 2) {
        const rook = this.getPiece({ row: from.row, col: 0 });
        if (rook) {
          this.setPiece({ row: from.row, col: 0 }, null);
          this.setPiece({ row: from.row, col: 3 }, rook);
          rook.hasMoved = true;
        }
      }
    }

    // Handle en passant
    if (piece.type === 'pawn' && from.col !== to.col && !capturedPiece) {
      const enPassantRow = piece.color === 'white' ? to.row + 1 : to.row - 1;
      const capturedPawn = this.getPiece({ row: enPassantRow, col: to.col });
      if (capturedPawn) {
        this.setPiece({ row: enPassantRow, col: to.col }, null);
      }
    }

    this.setPiece(from, null);
    this.setPiece(to, piece);
    piece.hasMoved = true;

    // Handle pawn promotion
    if (piece.type === 'pawn' && (to.row === 0 || to.row === 7)) {
      const queen = new Queen(piece.color, to, true);
      this.setPiece(to, queen);
    }

    return capturedPiece;
  }

  isInCheck(color: PieceColor): boolean {
    const kingPosition = this.findKing(color);
    if (!kingPosition) return false;

    const opponentColor: PieceColor = color === 'white' ? 'black' : 'white';

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.color === opponentColor) {
          const validMoves = piece.getValidMoves(this.board);
          if (validMoves.some(move => move.row === kingPosition.row && move.col === kingPosition.col)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private findKing(color: PieceColor): Position | null {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.type === 'king' && piece.color === color) {
          return { row, col };
        }
      }
    }
    return null;
  }

  clone(): Board {
    const newBoard = new Board();
    newBoard.board = Array(8).fill(null).map(() => Array(8).fill(null));

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece) {
          newBoard.board[row][col] = piece.clone();
        }
      }
    }

    return newBoard;
  }

  getAllPiecesOfColor(color: PieceColor): Piece[] {
    const pieces: Piece[] = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.color === color) {
          pieces.push(piece);
        }
      }
    }
    return pieces;
  }
}

