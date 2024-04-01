export interface Point {
  x: number;
  y: number;
}

class PathNode {
  f: number;
  g: number;
  h: number;
  position: Point;
  parent: PathNode | null;

  constructor(position: Point, parent: PathNode | null = null) {
    this.position = position;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.parent = parent;
  }
}

class AStar {
  aStar(matrix: number[][], start: Point, end: Point): Point[] | null {
    const isValid = (point: Point): boolean => {
      return (
        point.x >= 0 &&
        point.x < matrix.length &&
        point.y >= 0 &&
        point.y < matrix[0].length
      );
    };

    const isWalkable = (point: Point): boolean => {
      return matrix[point.x][point.y] === 0; // Assuming 0 represents walkable cells
    };

    const calculateHeuristic = (point: Point, target: Point): number => {
      return Math.abs(point.x - target.x) + Math.abs(point.y - target.y);
    };

    const getNeighbors = (point: Point): Point[] => {
      const neighbors: Point[] = [];
      const directions = [
        [-1, 0],
        [0, -1],
        [1, 0],
        [0, 1],
      ]; // Up, Left, Down, Right

      for (const [dx, dy] of directions) {
        const neighbor = { x: point.x + dx, y: point.y + dy };
        if (isValid(neighbor) && isWalkable(neighbor)) {
          neighbors.push(neighbor);
        }
      }
      return neighbors;
    };

    const startNode = new PathNode(start);
    const endNode = new PathNode(end);
    const openList: PathNode[] = [startNode];
    const closedList: PathNode[] = [];

    while (openList.length > 0) {
      let currentNode = openList[0];
      let currentIndex = 0;

      for (let i = 1; i < openList.length; i++) {
        if (openList[i].f < currentNode.f) {
          currentNode = openList[i];
          currentIndex = i;
        }
      }

      openList.splice(currentIndex, 1);
      closedList.push(currentNode);

      if (
        currentNode.position.x === endNode.position.x &&
        currentNode.position.y === endNode.position.y
      ) {
        const path: Point[] = [];
        let current: PathNode | null = currentNode;
        while (current !== null) {
          path.unshift(current.position);
          current = current.parent;
        }
        return path;
      }

      const neighbors = getNeighbors(currentNode.position);
      for (const neighbor of neighbors) {
        const newNode = new PathNode(neighbor, currentNode);
        if (
          closedList.some(
            (node) =>
              node.position.x === newNode.position.x &&
              node.position.y === newNode.position.y
          )
        ) {
          continue;
        }

        newNode.g = currentNode.g + 1;
        newNode.h = calculateHeuristic(newNode.position, endNode.position);
        newNode.f = newNode.g + newNode.h;

        if (
          openList.some(
            (node) =>
              node.position.x === newNode.position.x &&
              node.position.y === newNode.position.y &&
              node.g < newNode.g
          )
        ) {
          continue;
        }

        openList.push(newNode);
      }
    }

    return null; // No path found
  }
}

const aStarHelper = new AStar();
export default aStarHelper;
