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
  public _numberOfStickmanOnBus: number = 0;

  private _toOriginVector: Vec3 = new Vec3();
  private _cheerCounterTime: number = 2;
  private _happyCounterTime: number = 2.5;

  start() {}

  update(deltaTime: number) {
    this._cheerCounterTime += deltaTime;
    this._happyCounterTime += deltaTime;
    if (this._cheerCounterTime >= 4) {
      this._cheerCounterTime = 0;
      this.randomCheerStickman();
    }
    if (this._happyCounterTime >= 4) {
      this._happyCounterTime = 0;
      this.randomHappyStickman();
    }
  }

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
    availableSlotIndex: number,
    availableSlot: Node
  ): { toQueueStickman: Node | null; rightMove: boolean } {
    const stickmanController = stickman.getComponent(StickmanController);
    const shortestPath = stickmanController.findShortestPath(activatedMap);
    stickmanController._animationController.setValue("Cheer", false);
    stickmanController._animationController.setValue("Happy", false);

    if (shortestPath === undefined || shortestPath.length === 0) {
      // audioController.playAudio("error");
      return { toQueueStickman: null, rightMove: false };
    }

    this.removeStickman(stickman);

    // active the stickman point
    activatedMap[stickmanController.matrixPos.y][
      stickmanController.matrixPos.x
    ] = 0;

    if (shortestPath.length === 1) {
      if (
        this.canRunToBus(
          currentBusColor === stickmanController.stickmanColor,
          this.busGroupController
        )
      ) {
        stickmanController.runToBus(this.busGroupController);
        return { toQueueStickman: null, rightMove: true };
      } else {
        stickmanController.runToSlot(availableSlot, availableSlotIndex);
        return { toQueueStickman: stickman, rightMove: true };
      }
    } else {
      const isOnBus = stickmanController.runAlongPath(
        shortestPath,
        this._toOriginVector,
        this.canRunToBus(
          currentBusColor === stickmanController.stickmanColor,
          this.busGroupController
        ),
        this.busGroupController,
        availableSlotIndex,
        availableSlot
      );

      if (isOnBus) {
        return { toQueueStickman: null, rightMove: true };
      } else {
        return { toQueueStickman: stickman, rightMove: true };
      }
    }
  }

  removeStickman(stickman: Node) {
    const index = this.stickmans.findIndex((item) => {
      return item.uuid === stickman.uuid;
    });

    this.stickmans.splice(index, 1);
  }

  randomCheerStickman() {
    this.stickmans.forEach((stickman) => {
      const stickmanCtl = stickman.getComponent(StickmanController);
      const random = Math.random();
      if (random < 0.5 && stickmanCtl.doNothing) {
        stickmanCtl.cheer();
      }
    });
  }

  randomHappyStickman() {
    this.stickmans.forEach((stickman) => {
      const stickmanCtl = stickman.getComponent(StickmanController);
      if (Math.random() < 0.2 && stickman && stickmanCtl.doNothing) {
        stickmanCtl.happy();
      }
    });
  }

  canRunToBus(sameColor: boolean, busGroupController: BusGroupController) {
    const flag = sameColor && this._numberOfStickmanOnBus < 3;
    if (flag) this._numberOfStickmanOnBus += 1;
    return flag;
  }
}
