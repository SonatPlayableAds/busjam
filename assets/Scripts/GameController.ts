import {
  _decorator,
  Camera,
  CCString,
  Component,
  EventTouch,
  geometry,
  Input,
  input,
  Material,
  Node,
  PhysicsSystem,
  Texture2D,
} from "cc";
import { SlotGroupController } from "./SlotGroupController";
import { StickmanGroupController } from "./StickmanGroupController";
import { WallGroupController } from "./WallGroupController";
import { AudioController } from "./AudioController";
import { BusGroupController } from "./BusGroupController";
import { NODE_NAME } from "./helper/Constants";
import { UIController } from "./UIController";
import { StickmanController } from "./StickmanController";
const { ccclass, property } = _decorator;

@ccclass("GameController")
export class GameController extends Component {
  @property({ type: Camera })
  public cameraComponent: Camera = null!;

  @property(CCString)
  public map: string = "";

  @property(UIController)
  public uiController: UIController = null!;

  @property(BusGroupController)
  public busGroup: BusGroupController = null!;

  @property(StickmanGroupController)
  public stickmanGroup: StickmanGroupController = null!;

  @property(SlotGroupController)
  public slotController: SlotGroupController = null!;

  @property(WallGroupController)
  public wallGroup: WallGroupController = null!;

  @property(AudioController)
  public audioController: AudioController = null!;

  @property([Material])
  public busMtl: Material[] = [];

  @property([Material])
  public stickmanMtl: Material[] = [];

  private _activatedMap: number[][] = [[]];
  private _ray: geometry.Ray = new geometry.Ray();
  private _queueStickman: Node[] = [];
  private _limitedTime: number = 0;
  private _startCounting: boolean = false;
  private _isGameOver: boolean = false;

  start() {
    this.loadMap();

    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  update(deltaTime: number) {
    if (!this.slotController.hasEmptySlot() && !this._isGameOver) {
      this.gameOver(false);
    }

    if (this._startCounting && !this._isGameOver) {
      this._limitedTime -= deltaTime;
      const timer = Math.round(this._limitedTime);
      this.uiController.updateCounter(timer);

      if (timer <= 0) {
        this._startCounting = false;
        this.gameOver(false);
      }
    }
  }

  loadMap() {
    const mapObject = JSON.parse(this.map);
    const { width, height, time, buses, stickmans, slots } = mapObject;
    this._limitedTime = time;

    this.slotController.spawnSlots(slots);
    this._activatedMap = this.stickmanGroup.spawnStickmans(
      width,
      height,
      stickmans,
      this.stickmanMtl
    );
    this.busGroup.spawnBuses(buses, this.busMtl);
    this.wallGroup.spawnWalls(width, height, stickmans);
  }

  onTouchStart(event: EventTouch) {
    this._startCounting = true;
    this.cameraComponent.screenPointToRay(
      event.getLocationX(),
      event.getLocationY(),
      this._ray
    );

    if (PhysicsSystem.instance.raycast(this._ray)) {
      const raycastResults = PhysicsSystem.instance.raycastResults;

      if (raycastResults.length >= 1) {
        const rayCastToStickman = raycastResults.find((result) => {
          return result.collider.node.name === NODE_NAME.STICKMAN;
        });

        if (rayCastToStickman) {
          const stickman = rayCastToStickman.collider.node;
          const availableSlotIndex =
            this.slotController.availableSlots.findIndex((slot) => slot);
          const slot = this.slotController.slots[availableSlotIndex];

          const toQueueStickman = this.stickmanGroup.actionStickman(
            stickman,
            this._activatedMap,
            this.audioController,
            this.busGroup.getCurrentBusColor(),
            slot
          );

          if (toQueueStickman) {
            this.slotController.availableSlots[availableSlotIndex] = false;
            this._queueStickman.push(toQueueStickman);
          }
        }
      }
    }
  }

  onTouchEnd(event: EventTouch) {}

  activePointOfMap(x: number, y: number) {
    this._activatedMap[y][x] = 0;
  }

  newBusArrived(busColor: string) {
    console.log("new bus arrived", busColor);

    const onQueueStickman = [];
    for (let i = 0; i < this._queueStickman.length; i++) {
      const stickman = this._queueStickman[i];
      if (
        stickman.getComponent(StickmanController).stickmanColor === busColor
      ) {
        onQueueStickman.push(stickman);
        if (onQueueStickman.length === 3) {
          break;
        }
      }
    }

    onQueueStickman.forEach((stickman) => {
      const stickmanController = stickman.getComponent(StickmanController);
      stickmanController.fromQueueToBus(this.busGroup);
    });
  }

  gameOver(isWin: boolean) {
    this._isGameOver = true;

    this.uiController.showEndCard(isWin);
  }

  download() {}
}
