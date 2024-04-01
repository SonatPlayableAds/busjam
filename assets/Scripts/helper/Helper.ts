import { Vec2 } from "cc";
import { Move } from "../StickmanController";

export class Helper {
  calculateMoves(path: Vec2[]): Move[] {
    const moves: Move[] = [];
    const reducedMoves: Move[] = [];

    for (let i = 0; i < path.length - 1; i++) {
      const currentPoint = path[i];
      const nextPoint = path[i + 1];

      const dx = nextPoint.x - currentPoint.x;
      const dy = nextPoint.y - currentPoint.y;

      let rotation: number;

      if (dx === 0 && dy === 1) {
        rotation = 0; // Move Down
      } else if (dx === 0 && dy === -1) {
        rotation = 180; // Move Up
      } else if (dx === 1 && dy === 0) {
        rotation = 90; // Move Right
      } else if (dx === -1 && dy === 0) {
        rotation = -90; // Move Left
      } else {
        throw new Error(`Invalid move from ${currentPoint} to ${nextPoint}`);
      }

      moves.push({ destination: nextPoint, rotation });
    }

    moves.forEach((move, index) => {
      if (index === 0) return;

      if (move.rotation === moves[index - 1].rotation) {
        return;
      } else {
        reducedMoves.push(moves[index - 1]);
      }
    });

    reducedMoves.push(moves[moves.length - 1]);

    return reducedMoves;
  }

  revertMatrix(matrix: number[][]): number[][] {
    const revertedMatrix: number[][] = [];

    for (let x = 0; x < matrix[0].length; x++) {
      const newRow: number[] = [];
      for (let y = 0; y < matrix.length; y++) {
        newRow.push(matrix[y][x]);
      }
      revertedMatrix.push(newRow);
    }

    return revertedMatrix;
  }
}

export const helper = new Helper();
