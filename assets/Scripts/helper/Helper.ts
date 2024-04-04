import { Quat, Vec2, Vec3 } from "cc";
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

  isGoodPoint(matrix: number[][], point: { x: number; y: number }): boolean {
    // if (point.y === 0) {
    //   return true;
    // }

    const directions = [
      [-1, 0],
      [0, -1],
      [1, 0],
      [0, 1],
    ]; // Up, Left, Down, Right

    for (const [dx, dy] of directions) {
      const newX = point.x + dx;
      const newY = point.y + dy;

      if (
        newX >= 0 &&
        newX < matrix.length &&
        newY >= 0 &&
        newY < matrix[0].length
      ) {
        if (matrix[newX][newY] === 0) {
          return true;
        }
      }
    }

    return false;
  }

  getRotationToBus(stickmanPos: Vec3, busPos: Vec3): Quat {
    const vec1 = new Vec2(busPos.x - stickmanPos.x, busPos.z - stickmanPos.z);
    const vec2 = new Vec2(0, 1);

    const angle = vec1.angle(vec2);

    return Quat.fromEuler(new Quat(), 0, (angle / Math.PI + 1) * 180, 0);
  }
}

export const helper = new Helper();
