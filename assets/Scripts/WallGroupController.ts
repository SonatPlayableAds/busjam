import {
  _decorator,
  Component,
  instantiate,
  Node,
  Prefab,
  Vec2,
  Vec3,
} from "cc";
const { ccclass, property } = _decorator;

enum WALL_TYPE {
  WALL_BRICK,
  EDGE_BRICK,
  CORNER_OUT,
  U_CORNER,
}

@ccclass("WallGroupController")
export class WallGroupController extends Component {
  @property([Prefab])
  public wallPrefabs: Prefab[] = [];

  private _wallWidth: number = 20;
  private _wallHeight: number = 20;

  start() {}

  update(deltaTime: number) {}

  spawnWalls(width: number, height: number, stickmanMap: number[][]) {
    this.spawnInsideWalls(width, height, stickmanMap);
    this.spawnOutsideWalls(width, height, stickmanMap);
  }

  spawnInsideWalls(width: number, height: number, stickmanMap: number[][]) {
    const toOriginVector = new Vec3(width / 2 - 0.5, 0, 0);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (stickmanMap[y][x] >= 0) {
          continue;
        } else {
          const { type, rotation } = this.getWallType(stickmanMap[y][x]);
          const wallPrefab = this.wallPrefabs[type];
          const wallNode = instantiate(wallPrefab);
          this.node.addChild(wallNode);
          const position = new Vec3(x, 0, y);
          wallNode.setPosition(position.subtract(toOriginVector));
          wallNode.setRotationFromEuler(0, rotation, 0);
        }
      }
    }
  }

  getWallType(wall: number): { type: WALL_TYPE; rotation: number } {
    const result = { type: WALL_TYPE.WALL_BRICK, rotation: 0 };

    if (wall < -1 && wall >= -5) {
      result.type = WALL_TYPE.CORNER_OUT;
      switch (wall) {
        case -2:
          result.rotation = 180;
          break;
        case -3:
          result.rotation = 90;
          break;
        case -5:
          result.rotation = -90;
          break;
      }
    } else if (wall < -5 && wall >= -9) {
      result.type = WALL_TYPE.U_CORNER;
      switch (wall) {
        case -6:
          result.rotation = 180;
          break;
        case -7:
          result.rotation = 90;
          break;
        case -9:
          result.rotation = -90;
          break;
      }
    } else if (wall < -9 && wall >= -11) {
      result.type = WALL_TYPE.EDGE_BRICK;
      switch (wall) {
        case -10:
          result.rotation = 90;
          break;
      }
    }

    return result;
  }

  // getWallType(
  //   x: number,
  //   y: number,
  //   stickmanMap: number[][]
  // ): Record<string, WALL_TYPE> {
  //   let wallTypes: Record<string, WALL_TYPE> = {
  //     topLeft: WALL_TYPE.WALL_BRICK,
  //     topRight: WALL_TYPE.WALL_BRICK,
  //     bottomRight: WALL_TYPE.WALL_BRICK,
  //     bottomLeft: WALL_TYPE.WALL_BRICK,
  //   };

  //   const left = new Vec2(x - 1, y);
  //   const top = new Vec2(x, y - 1);
  //   const right = new Vec2(x + 1, y);
  //   const bottom = new Vec2(x, y + 1);
  //   const topRight = new Vec2(x + 1, y - 1);
  //   const topLeft = new Vec2(x - 1, y - 1);
  //   const bottomRight = new Vec2(x + 1, y + 1);
  //   const bottomLeft = new Vec2(x - 1, y + 1);

  //   Object.keys(wallTypes).forEach((type) => {
  //     switch (type) {
  //       case "topLeft": {
  //         // Top Left
  //         if (
  //           stickmanMap[top.x][top.y] === -1 &&
  //           stickmanMap[left.x][left.y] === -1 &&
  //           stickmanMap[topLeft.x][topLeft.y] === -1
  //         ) {
  //           wallTypes[type] = WALL_TYPE.WALL_BRICK;
  //         } else if (
  //           stickmanMap[top.x][top.y] === -1 &&
  //           stickmanMap[left.x][left.y] === -1 &&
  //           stickmanMap[topLeft.x][topLeft.y] !== -1
  //         ) {
  //           wallTypes[type] = WALL_TYPE.CORNER_OUT;
  //         } else if (
  //           stickmanMap[top.x][top.y] === -1 &&
  //           stickmanMap[left.x][left.y] !== -1 &&
  //           stickmanMap[topLeft.x][topLeft.y] === -1
  //         ) {
  //           wallTypes[type] = WALL_TYPE.EDGE_BRICK;
  //         } else if (
  //           stickmanMap[top.x][top.y] !== -1 &&
  //           stickmanMap[left.x][left.y] === -1 &&
  //           stickmanMap[topLeft.x][topLeft.y] === -1
  //         ) {
  //         } else if (
  //           stickmanMap[top.x][top.y] === -1 &&
  //           stickmanMap[left.x][left.y] !== -1 &&
  //           stickmanMap[topLeft.x][topLeft.y] !== -1
  //         ) {
  //         }
  //         break;
  //       }
  //       case "topRight": {
  //         // Top Right
  //         break;
  //       }
  //       case "bottomRight": {
  //         // Bottom Right
  //         break;
  //       }
  //       case "bottomLeft": {
  //         // Bottom Left
  //         break;
  //       }
  //     }
  //   });

  //   return wallTypes;
  // }

  spawnOutsideWalls(width: number, height: number, stickmanMap: number[][]) {}
}