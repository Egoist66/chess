import { Piece, Position, PieceColor } from '@/types';

export class King extends Piece {
  constructor(color: PieceColor, position: Position, hasMoved: boolean = false) {
    super(color, 'king', position, hasMoved);
  }

  getValidMoves(board: (Piece | null)[][]): Position[] {
    const moves: Position[] = [];
    const kingMoves = [
      { row: -1, col: -1 },
      { row: -1, col: 0 },
      { row: -1, col: 1 },
      { row: 0, col: -1 },
      { row: 0, col: 1 },
      { row: 1, col: -1 },
      { row: 1, col: 0 },
      { row: 1, col: 1 }
    ];

    for (const move of kingMoves) {
      const targetPos: Position = {
        row: this.position.row + move.row,
        col: this.position.col + move.col
      };

      if (this.isValidPosition(targetPos)) {
        if (this.isEmptySquare(targetPos, board) || this.isEnemyPiece(targetPos, board)) {
          moves.push(targetPos);
        }
      }
    }

    // Castling (упрощенная версия, проверяем только что король и ладья не двигались)
    if (!this.hasMoved) {
      // Kingside castling
      const kingsideRook = board[this.position.row][7];
      if (kingsideRook?.type === 'rook' && !kingsideRook.hasMoved &&
          this.isEmptySquare({ row: this.position.row, col: 5 }, board) &&
          this.isEmptySquare({ row: this.position.row, col: 6 }, board)) {
        moves.push({ row: this.position.row, col: 6 });
      }

      // Queenside castling
      const queensideRook = board[this.position.row][0];
      if (queensideRook?.type === 'rook' && !queensideRook.hasMoved &&
          this.isEmptySquare({ row: this.position.row, col: 1 }, board) &&
          this.isEmptySquare({ row: this.position.row, col: 2 }, board) &&
          this.isEmptySquare({ row: this.position.row, col: 3 }, board)) {
        moves.push({ row: this.position.row, col: 2 });
      }
    }

    return moves;
  }

  clone(): King {
    return new King(this.color, { ...this.position }, this.hasMoved);
  }
}

