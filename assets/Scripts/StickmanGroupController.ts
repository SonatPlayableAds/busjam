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
import { helper } from "./helper/Helper";
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

  @property(Node)
  public tutHand: Node = null!;

  public _numberOfStickmanOnBus: number = 0;

  private _toOriginVector: Vec3 = new Vec3();
  private _cheerCounterTime: number = 2;
  private _happyCounterTime: number = 2.5;

  start() {}

  update(deltaTime: number) {
    // this._cheerCounterTime += deltaTime;
    this._happyCounterTime += deltaTime;
    // if (this._cheerCounterTime >= 4) {
    //   this._cheerCounterTime = 0;
    //   this.randomCheerStickman();
    // }
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
    this._numberOfStickmanOnBus = 0;
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
          const stickmanPos = new Vec3(x, 0, y).subtract(this._toOriginVector);
          this.spawnFootBrick(stickmanPos);

          if (map[y][x] === 0) {
            activatedMap[y][x] = 0;
            continue;
          }

          activatedMap[y][x] = 1;
          const stickmanMapIndex = map[y][x] - 1;
          const newStickman = instantiate(this.stickmanPrefab);

          const currentMtl = stickmanMaterials[stickmanMapIndex];
          this.node.addChild(newStickman);

          newStickman.getComponent(StickmanController).applyMtl(currentMtl);
          newStickman.getComponent(StickmanController).setMatrixPos(x, y);
          newStickman.getComponent(StickmanController).stickmanColor =
            PLAYER_COLOR[stickmanMapIndex];

          newStickman.setPosition(stickmanPos);

          this.stickmans.push(newStickman);
        }
      }
    }

    return activatedMap;
  }

  spawnFootBrick(position: Vec3) {
    const footBrick = instantiate(this.footBrickPrefab);
    this.node.addChild(footBrick);
    footBrick.setPosition(position);
    footBrick.setScale(new Vec3(0.88, 0.88, 0.88));
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

  playTut(activatedMap: number[][]) {
    const canPickStickman = this.findCanPickStickmanPos(activatedMap);

    if (canPickStickman) {
      const stickmanPos = canPickStickman.node.position;
      this.tutHand.setPosition(
        new Vec3(stickmanPos.x + 0.7, 0, stickmanPos.z + 1.1)
      );
      this.tutHand.active = true;
    }
  }

  findCanPickStickmanPos(activatedMap: number[][]): StickmanController | null {
    const reversedMap = helper.revertMatrix(activatedMap);

    for (let i = 0; i < this.stickmans.length; i++) {
      const stickman = this.stickmans[i];
      const stickmanController = stickman.getComponent(StickmanController);
      const stickmanPos = stickmanController.matrixPos;
      if (
        helper.isGoodPoint(reversedMap, {
          x: stickmanPos.x,
          y: stickmanPos.y,
        }) &&
        stickmanController.stickmanColor ===
          this.busGroupController.getCurrentBusColor()
      ) {
        return stickmanController;
      }
    }

    return null;
  }

  activateStickmansStroke(activatedMap: number[][], strokeMtl: Material[]) {
    this.stickmans.forEach((stickman) => {
      const stickmanController = stickman.getComponent(StickmanController);
      const validPath = stickmanController.findShortestPath(activatedMap);

      if (validPath === undefined || validPath.length === 0) {
        return;
      } else {
        stickmanController.applyMtl(
          strokeMtl[PLAYER_COLOR[stickmanController.stickmanColor]]
        );
      }
    });
  }

  hideTutHand() {
    this.tutHand.active = false;
  }

  canRunToBus(sameColor: boolean, busGroupController: BusGroupController) {
    const flag = sameColor && this._numberOfStickmanOnBus < 3;
    if (flag) this._numberOfStickmanOnBus += 1;
    return flag;
  }

  isCurrentBusFilled() {
    return this._numberOfStickmanOnBus >= 3;
  }

  resetStickmanOnBus() {
    this._numberOfStickmanOnBus = 0;
  }

  removeStickmans() {
    this.stickmans.forEach((stickman) => {
      stickman.removeFromParent();
      stickman.destroy();
    });

    this.stickmans = [];
  }
}
