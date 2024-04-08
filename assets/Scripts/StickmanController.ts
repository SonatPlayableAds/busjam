import {
  _decorator,
  animation,
  CCFloat,
  CCString,
  Component,
  easing,
  Material,
  Node,
  Quat,
  SkinnedMeshRenderer,
  Texture2D,
  tween,
  Vec2,
  Vec3,
} from "cc";
import { GameController } from "./GameController";
import aStarHelper, { Point } from "./helper/AStar";
import { helper, Helper } from "./helper/Helper";
import { BusGroupController } from "./BusGroupController";
import { BUS_POS } from "./helper/Constants";
const { ccclass, property } = _decorator;

export interface Move {
  destination: Point;
  rotation: number;
}

const RUN_THROUGH_TIME = 0.1;

@ccclass("StickmanController")
export class StickmanController extends Component {
  @property(Vec2)
  public matrixPos: Vec2;

  @property(CCString)
  public stickmanColor: string = "";

  @property(BusGroupController)
  public busGroupController: BusGroupController = null;

  public slotIndex: number = -1;
  public doNothing = true;
  public canPick: boolean = true;

  public shouldRunToBus: boolean = false;

  public _animationController: animation.AnimationController = null;
  public onSlot: boolean = false;

  start() {
    this._animationController = this.getComponent(
      animation.AnimationController
    );

    this.node.setRotationFromEuler(new Vec3(0, 180, 0));
  }

  update(deltaTime: number) {}

  applyMtl(mtl: Material) {
    const char = this.node.getChildByName("Char");
    const meshRenderer = char.getComponent(SkinnedMeshRenderer);
    meshRenderer.setMaterial(mtl, 0);
  }

  setMatrixPos(x: number, y: number) {
    this.matrixPos = new Vec2(x, y);
  }

  actionStickman() {}

  findShortestPath(activatedMap: number[][]): Vec2[] {
    if (this.matrixPos.y === 0) {
      return [this.matrixPos];
    }

    if (this.matrixPos.y === activatedMap.length - 1) {
      if (
        this.matrixPos.x === 0 &&
        activatedMap[this.matrixPos.y - 1][this.matrixPos.x] === 1 &&
        activatedMap[this.matrixPos.y][this.matrixPos.x + 1] === 1
      ) {
        return [];
      } else if (
        this.matrixPos.x === activatedMap[0].length - 1 &&
        activatedMap[this.matrixPos.y - 1][this.matrixPos.x] === 1 &&
        activatedMap[this.matrixPos.y][this.matrixPos.x - 1] === 1
      ) {
        return [];
      } else {
        if (
          activatedMap[this.matrixPos.y][this.matrixPos.x - 1] === 1 &&
          activatedMap[this.matrixPos.y][this.matrixPos.x + 1] === 1 &&
          activatedMap[this.matrixPos.y - 1][this.matrixPos.x] === 1
        ) {
          return [];
        }
      }
    } else if (this.matrixPos.x === 0) {
      if (
        activatedMap[this.matrixPos.y][this.matrixPos.x + 1] === 1 &&
        activatedMap[this.matrixPos.y - 1][this.matrixPos.x] === 1 &&
        activatedMap[this.matrixPos.y + 1][this.matrixPos.x] === 1
      ) {
        return [];
      }
    } else if (this.matrixPos.x === activatedMap[0].length - 1) {
      if (
        activatedMap[this.matrixPos.y][this.matrixPos.x - 1] === 1 &&
        activatedMap[this.matrixPos.y - 1][this.matrixPos.x] === 1 &&
        activatedMap[this.matrixPos.y + 1][this.matrixPos.x] === 1
      ) {
        return [];
      }
    } else {
      if (
        activatedMap[this.matrixPos.y][this.matrixPos.x - 1] === 1 &&
        activatedMap[this.matrixPos.y][this.matrixPos.x + 1] === 1 &&
        activatedMap[this.matrixPos.y - 1][this.matrixPos.x] === 1 &&
        activatedMap[this.matrixPos.y + 1][this.matrixPos.x] === 1
      ) {
        return [];
      }
    }

    const width = activatedMap[0].length;
    const revertedXYOrder = helper.revertMatrix(activatedMap);
    const listOfPath: Vec2[][] = [];

    for (let i = 0; i < width; i++) {
      if (revertedXYOrder[i][0] === 0) {
        const startPoint: Point = { x: this.matrixPos.x, y: this.matrixPos.y };
        const endPoint: Point = { x: i, y: 0 };

        const path = aStarHelper.aStar(revertedXYOrder, startPoint, endPoint);
        if (path) {
          const convertedPath: Vec2[] = path.map(
            (point) => new Vec2(point.x, point.y)
          );
          listOfPath.push(convertedPath);
        }
      }
    }

    if (listOfPath.length > 0) {
      let pathLength = listOfPath[0].length;
      let shortestPath = listOfPath[0];

      for (let i = 1; i < listOfPath.length; i++) {
        if (listOfPath[i].length < pathLength) {
          pathLength = listOfPath[i].length;
          shortestPath = listOfPath[i];
        }
      }

      return shortestPath;
    }
  }

  runAlongPath(
    path: Vec2[],
    toOriginVector: Vec3,
    canRunToBus: boolean,
    busGroupController: BusGroupController,
    availableSlotIndex: number,
    slot?: Node
  ): boolean {
    if (path.length === 1) {
      return;
    }

    if (!canRunToBus) {
      this.slotIndex = availableSlotIndex;
    }

    const moves = helper.calculateMoves(path);
    const movesTween = tween(this.node);
    const prevPoint = new Vec3(this.matrixPos.x, 0, this.matrixPos.y);
    this.node.setRotationFromEuler(new Vec3(0, moves[0].rotation, 0));
    this._animationController.setValue("Running", true);
    this.doNothing = false;

    moves.forEach((move, index) => {
      const endPoint = new Vec3(move.destination.x, 0, move.destination.y);
      const distance = Vec3.distance(prevPoint, endPoint);
      const rotation = new Quat();
      endPoint.subtract(toOriginVector);

      Quat.fromEuler(rotation, 0, move.rotation, 0);
      movesTween
        .to(0.1, { rotation: rotation })
        .to(
          RUN_THROUGH_TIME * distance,
          {
            position: endPoint,
          },
          {
            easing: "sineIn",
            onComplete: () => {
              // this._animationController.setValue("Running", false);
            },
          }
        )
        .call(() => {
          if (index + 1 < moves.length - 1)
            this.node.setRotationFromEuler(
              new Vec3(0, moves[index + 1].rotation, 0)
            );
        });
    });
    movesTween.call(() => {
      if (canRunToBus) {
        this.runToBus(busGroupController);
      } else {
        this.runToSlot(slot, availableSlotIndex);
      }
    });
    movesTween.union().start();

    return canRunToBus;
  }

  fromQueueToBus(busGroupController: BusGroupController) {
    const busDestination = BUS_POS;
    this._animationController.setValue("Running", true);

    const fromQueueToBusTween = tween(this.node)
      .to(
        0.5,
        {
          position: busDestination,
        },
        { easing: "sineIn" }
      )
      .to(
        0.2,
        { scale: new Vec3(0.036, 0.036, 0.036) },
        {
          easing: "sineIn",
          onComplete: () => {
            this._animationController.setValue("Running", false);
          },
        }
      )
      .call(() => {
        busGroupController.onStickmanEnterBus(this.node);
      })
      .union()
      .start();
  }

  runToBus(busGroupCtl: BusGroupController) {
    const rotationToBus = helper.getRotationToBus(
      this.node.getWorldPosition(),
      busGroupCtl.node.getWorldPosition()
    );
    // const runningTrigger = this._animationController.getValue("Running");
    this._animationController.setValue("Running", true);
    const runToBusTween = tween(this.node)
      .to(0.1, { rotation: rotationToBus })
      .to(
        0.8,
        {
          position: BUS_POS,
        },
        { easing: "sineIn" }
      )
      .to(
        0.2,
        { scale: new Vec3(0, 0, 0) },
        {
          easing: "sineIn",
          onComplete: () => {
            this._animationController.setValue("Running", false);
          },
        }
      )
      .call(() => {
        busGroupCtl.onStickmanEnterBus(this.node);
      })
      .union()
      .start();
  }

  runToSlot(slot: Node, availableSlotIndex: number) {
    const slotWorldPos = slot.getWorldPosition();
    this._animationController.setValue("Running", true);
    this._animationController.setValue("Cheer", false);
    this.slotIndex = availableSlotIndex;

    const runToSlotTween = tween(this.node)
      .to(
        0.5,
        {
          worldPosition: slotWorldPos,
        },
        {
          easing: "sineIn",
          onComplete: () => {
            this._animationController.setValue("Running", false);
            this.onSlot = true;
          },
        }
      )
      .union()
      .start();
  }

  cheer() {
    this.doNothing = false;
    this._animationController.setValue("Cheer", true);
    this.scheduleOnce(() => {
      this._animationController.setValue("Cheer", false);
      this.doNothing = true;
    }, 3);
  }

  happy() {
    this.doNothing = false;
    this._animationController.setValue("Happy", true);
    this.scheduleOnce(() => {
      this._animationController.setValue("Happy", false);
    }, 3);
  }
}
