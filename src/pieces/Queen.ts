import { Piece, Position, PieceColor } from '@/types';

export class Queen extends Piece {
  constructor(color: PieceColor, position: Position, hasMoved: boolean = false) {
    super(color, 'queen', position, hasMoved);
  }

  getValidMoves(board: (Piece | null)[][]): Position[] {
    const moves: Position[] = [];
    const directions = [
      { row: -1, col: 0 },   // up
      { row: 1, col: 0 },    // down
      { row: 0, col: -1 },   // left
      { row: 0, col: 1 },    // right
      { row: -1, col: -1 },  // up-left
      { row: -1, col: 1 },   // up-right
      { row: 1, col: -1 },   // down-left
      { row: 1, col: 1 }     // down-right
    ];

    for (const dir of directions) {
      let currentRow = this.position.row + dir.row;
      let currentCol = this.position.col + dir.col;

      while (this.isValidPosition({ row: currentRow, col: currentCol })) {
        const targetPos: Position = { row: currentRow, col: currentCol };
        
        if (this.isEmptySquare(targetPos, board)) {
          moves.push(targetPos);
        } else if (this.isEnemyPiece(targetPos, board)) {
          moves.push(targetPos);
          break;
        } else {
          break;
        }

        currentRow += dir.row;
        currentCol += dir.col;
      }
    }

    return moves;
  }

  clone(): Queen {
    return new Queen(this.color, { ...this.position }, this.hasMoved);
  }
}

