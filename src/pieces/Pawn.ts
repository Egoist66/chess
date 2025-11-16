import { Piece, Position, PieceColor } from '@/types';

export class Pawn extends Piece {
  constructor(color: PieceColor, position: Position, hasMoved: boolean = false) {
    super(color, 'pawn', position, hasMoved);
  }

  getValidMoves(board: (Piece | null)[][]): Position[] {
    const moves: Position[] = [];
    const direction = this.color === 'white' ? -1 : 1;
    const startRow = this.color === 'white' ? 6 : 1;

    // Move forward one square
    const oneForward: Position = { row: this.position.row + direction, col: this.position.col };
    if (this.isEmptySquare(oneForward, board)) {
      moves.push(oneForward);

      // Move forward two squares from starting position
      if (this.position.row === startRow) {
        const twoForward: Position = { row: this.position.row + 2 * direction, col: this.position.col };
        if (this.isEmptySquare(twoForward, board)) {
          moves.push(twoForward);
        }
      }
    }

    // Capture diagonally
    const captureLeft: Position = { row: this.position.row + direction, col: this.position.col - 1 };
    const captureRight: Position = { row: this.position.row + direction, col: this.position.col + 1 };

    if (this.isEnemyPiece(captureLeft, board)) {
      moves.push(captureLeft);
    }
    if (this.isEnemyPiece(captureRight, board)) {
      moves.push(captureRight);
    }

    // En passant
    if ((this.color === 'white' && this.position.row === 3) || 
        (this.color === 'black' && this.position.row === 4)) {
      const leftPiece = board[this.position.row][this.position.col - 1];
      const rightPiece = board[this.position.row][this.position.col + 1];
      
      if (leftPiece?.type === 'pawn' && leftPiece.color !== this.color) {
        moves.push(captureLeft);
      }
      if (rightPiece?.type === 'pawn' && rightPiece.color !== this.color) {
        moves.push(captureRight);
      }
    }

    return moves;
  }

  clone(): Pawn {
    return new Pawn(this.color, { ...this.position }, this.hasMoved);
  }
}

