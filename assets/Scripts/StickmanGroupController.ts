import {
  _decorator,
  Component,
  instantiate,
  Material,
  Node,
  Prefab,
  Texture2D,
  Vec3,
} from "cc";
import { StickmanController } from "./StickmanController";
import { AudioController } from "./AudioController";
import { PLAYER_COLOR } from "./helper/Constants";
import { BusGroupController } from "./BusGroupController";
const { ccclass, property } = _decorator;

@ccclass("StickmanGroupController")
export class StickmanGroupController extends Component {
  @property(Prefab)
  public stickmanPrefab: Prefab = null!;

  @property(BusGroupController)
  public busGroupController: BusGroupController = null!;

  @property(Prefab)
  public footBrickPrefab: Prefab = null!;

  @property([Node])
  public stickmans: Node[] = [];

  private _toOriginVector: Vec3 = new Vec3();

  start() {}

  update(deltaTime: number) {}

  spawnStickmans(
    width: number,
    height: number,
    map: number[][],
    stickmanMaterials: Material[]
  ) {
    this._toOriginVector = new Vec3(width / 2 - 0.5, 0, 0);
    const activatedMap: number[][] = [[]];
    for (let i = 0; i < height; i++) {
      activatedMap[i] = [];
      for (let j = 0; j < width; j++) {
        activatedMap[i][j] = 0;
      }
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (map[y][x] === undefined) {
          break;
        }

        if (map[y][x] <= -1) {
          activatedMap[y][x] = 1;
          continue;
        } else {
          activatedMap[y][x] = 1;
          const newStickman = instantiate(this.stickmanPrefab);
          const footBrick = instantiate(this.footBrickPrefab);
          const currentMtl = stickmanMaterials[map[y][x]];
          this.node.addChild(newStickman);
          this.node.addChild(footBrick);

          newStickman.getComponent(StickmanController).applyMtl(currentMtl);
          newStickman.getComponent(StickmanController).setMatrixPos(x, y);
          newStickman.getComponent(StickmanController).stickmanColor =
            PLAYER_COLOR[map[y][x]];
          const stickmanPos = new Vec3(x, 0, y).subtract(this._toOriginVector);

          newStickman.setPosition(stickmanPos);
          footBrick.setPosition(stickmanPos);
          footBrick.setScale(new Vec3(0.88, 0.88, 0.88));

          this.stickmans.push(newStickman);
        }
      }
    }

    return activatedMap;
  }

  actionStickman(
    stickman: Node,
    activatedMap: number[][],
    audioController: AudioController,
    currentBusColor: string,
    availableSlot: Node
  ): Node | null {
    const stickmanController = stickman.getComponent(StickmanController);
    const shortestPath = stickmanController.findShortestPath(activatedMap);

    if (shortestPath === undefined || shortestPath.length === 0) {
      // audioController.playAudio("error");
      return;
    }

    // active the stickman point
    activatedMap[stickmanController.matrixPos.y][
      stickmanController.matrixPos.x
    ] = 0;

    stickmanController.runAlongPath(
      shortestPath,
      this._toOriginVector,
      currentBusColor === stickmanController.stickmanColor,
      this.busGroupController,
      availableSlot
    );

    if (shortestPath.length === 1) {
      if (currentBusColor === stickmanController.stickmanColor) {
        stickmanController.runToBus(this.busGroupController);
        return null;
      } else {
        stickmanController.runToSlot(availableSlot);
        return stickman;
      }
    } else {
      if (currentBusColor === stickmanController.stickmanColor) {
        return null;
      } else {
        // stickmanController.runToSlot(availableSlot);
        return stickman;
      }
    }
  }
}
