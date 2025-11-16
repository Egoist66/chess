import { Piece, Position, PieceColor } from '@/types';

export class Knight extends Piece {
  constructor(color: PieceColor, position: Position, hasMoved: boolean = false) {
    super(color, 'knight', position, hasMoved);
  }

  getValidMoves(board: (Piece | null)[][]): Position[] {
    const moves: Position[] = [];
    const knightMoves = [
      { row: -2, col: -1 },
      { row: -2, col: 1 },
      { row: -1, col: -2 },
      { row: -1, col: 2 },
      { row: 1, col: -2 },
      { row: 1, col: 2 },
      { row: 2, col: -1 },
      { row: 2, col: 1 }
    ];

    for (const move of knightMoves) {
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

    return moves;
  }

  clone(): Knight {
    return new Knight(this.color, { ...this.position }, this.hasMoved);
  }
}

