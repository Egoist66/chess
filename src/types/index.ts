export type PieceColor = 'white' | 'black';
export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  capturedPiece?: Piece;
  isEnPassant?: boolean;
  isCastling?: boolean;
  promotedTo?: PieceType;
}

export abstract class Piece {
  constructor(
    public color: PieceColor,
    public type: PieceType,
    public position: Position,
    public hasMoved: boolean = false
  ) {}

  abstract getValidMoves(board: (Piece | null)[][]): Position[];
  
  abstract clone(): Piece;

  canMove(to: Position, board: (Piece | null)[][]): boolean {
    const validMoves = this.getValidMoves(board);
    return validMoves.some(move => move.row === to.row && move.col === to.col);
  }

  isValidPosition(pos: Position): boolean {
    return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
  }

  isEmptySquare(pos: Position, board: (Piece | null)[][]): boolean {
    return this.isValidPosition(pos) && board[pos.row][pos.col] === null;
  }

  isEnemyPiece(pos: Position, board: (Piece | null)[][]): boolean {
    if (!this.isValidPosition(pos)) return false;
    const piece = board[pos.row][pos.col];
    return piece !== null && piece.color !== this.color;
  }

  getSymbol(): string {
    const symbols: Record<PieceType, { white: string; black: string }> = {
      king: { white: '♔', black: '♚' },
      queen: { white: '♕', black: '♛' },
      rook: { white: '♖', black: '♜' },
      bishop: { white: '♗', black: '♝' },
      knight: { white: '♘', black: '♞' },
      pawn: { white: '♙', black: '♟' }
    };
    return symbols[this.type][this.color];
  }
}

