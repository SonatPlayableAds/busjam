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
  screen,
  Size,
  Texture2D,
  Vec3,
  view,
} from "cc";
import { SlotGroupController } from "./SlotGroupController";
import { StickmanGroupController } from "./StickmanGroupController";
import { WallGroupController } from "./WallGroupController";
import { AudioController } from "./AudioController";
import { BusGroupController } from "./BusGroupController";
import { NODE_NAME } from "./helper/Constants";
import { UIController } from "./UIController";
import { StickmanController } from "./StickmanController";
import playableHelper from "./helper/PlayableHelper";
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
  public stickmanMtl: Material[] = [];

  @property([Material])
  public busMtl: Material[] = [];

  private _activatedMap: number[][] = [[]];
  private _ray: geometry.Ray = new geometry.Ray();
  private _queueStickman: Node[] = [];
  private _limitedTime: number = 0;
  private _startCounting: boolean = false;
  private _isGameOver: boolean = false;
  private _isGoodMove: boolean = false;
  private _playedAlarm: boolean = false;
  private _nonInteractTime: number = 0;
  private _playedTut: boolean = false;

  start() {
    const androidUrl =
      "https://play.google.com/store/apps/details?id=bus.matching.sort.jam.puzzle.brain.stickman";
    const iosUrl =
      "https://apps.apple.com/ae/app/bus-escape-3d-jam-puzzle/id6480099401";

    playableHelper.setStoreUrl(iosUrl, androidUrl);

    const visible: Size = screen.windowSize;
    this.updateWarnField();

    this.loadMap();
    this.stickmanGroup.playTut(this._activatedMap);
    playableHelper.gameStart();

    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  update(deltaTime: number) {
    if (!this.slotController.hasEmptySlot() && !this._isGameOver) {
      this.gameOver(false);
    }

    if (this._startCounting && !this._isGameOver) {
      this._nonInteractTime += deltaTime;

      this._limitedTime -= deltaTime;
      const timer = Math.round(this._limitedTime);
      this.uiController.updateCounter(timer);

      if (timer <= 10 && !this._playedAlarm) {
        this._playedAlarm = true;
        // this.audioController.playAlarmSfx();
        // this.uiController.playWarning();
      }

      if (timer <= 0) {
        this._startCounting = false;
        this.gameOver(false);
      }

      if (this._nonInteractTime >= 3 && !this._playedTut) {
        this._playedTut = true;
        this.stickmanGroup.playTut(this._activatedMap);
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
    this.busGroup.spawnBuses(buses, this.stickmanMtl);
    this.wallGroup.spawnWalls(width, height, stickmans);
  }

  onTouchStart(event: EventTouch) {
    this._nonInteractTime = 0;
    if (this.busGroup.movingBus || this._isGameOver) {
      return;
    }
    this._startCounting = true;
    this.deactivateTutorial();
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
          const stickmanComponent = stickman.getComponent(StickmanController);

          if (!stickmanComponent.canPick) {
            return;
          }

          const availableSlotIndex =
            this.slotController.availableSlots.findIndex((slot) => slot);
          const slot = this.slotController.slots[availableSlotIndex];

          const { toQueueStickman, rightMove } =
            this.stickmanGroup.actionStickman(
              stickman,
              this._activatedMap,
              this.audioController,
              this.busGroup.getCurrentBusColor(),
              availableSlotIndex,
              slot
            );

          if (rightMove) stickmanComponent.canPick = false;

          this.playPickStickmanAudio(rightMove, stickman);

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
    this.filterStickmanList();
    this.stickmanGroup._numberOfStickmanOnBus = 0;
    if (this._queueStickman.length === 0) {
      return;
    }

    const availableOnQueueStickman = [];
    const slotIndex = [];

    for (let i = 0; i < this._queueStickman.length; i++) {
      const stickman = this._queueStickman[i];
      if (
        stickman.getComponent(StickmanController).stickmanColor === busColor &&
        stickman.name === "Stickman"
      ) {
        slotIndex.push(i);
        availableOnQueueStickman.push(stickman);
        if (availableOnQueueStickman.length === 3) {
          break;
        }
      }
    }

    if (availableOnQueueStickman.length > 0) {
      let lengthCounter = 0;
      this._queueStickman = this._queueStickman.filter((stickman, index) => {
        if (
          stickman.name === "Stickman" &&
          lengthCounter < 3 &&
          stickman.getComponent(StickmanController).stickmanColor === busColor
        ) {
          lengthCounter++;
          this.slotController.availableSlots[
            stickman.getComponent(StickmanController).slotIndex
          ] = true;
          return false;
        }

        return true;
      });

      this.stickmanGroup._numberOfStickmanOnBus +=
        availableOnQueueStickman.length;

      availableOnQueueStickman.forEach((stickman) => {
        const stickmanController = stickman.getComponent(StickmanController);
        stickmanController.fromQueueToBus(this.busGroup);
      });
    }
  }

  playPickStickmanAudio(isRightMove: boolean, stickman: Node) {
    if (isRightMove) {
      this.audioController.playTapSfx();
      // this.audioController.playYeahSfx();
      if (
        this.busGroup.getCurrentBusColor() ===
        stickman.getComponent(StickmanController).stickmanColor
      ) {
        if (this._isGoodMove) {
          this.uiController.popPraiseText();
        }
        this._isGoodMove = true;
      } else {
        this._isGoodMove = false;
      }
    } else {
      this.audioController.playUhohSfx();
    }
  }

  filterStickmanList() {
    this._queueStickman = this._queueStickman.filter((stickman) => {
      return stickman.name === "Stickman";
    });
  }

  updateWarnField() {
    const windowSize = screen.windowSize;
    const pixelRatio = screen.devicePixelRatio;

    const realWidth = windowSize.width / pixelRatio;
    const realHeight = windowSize.height / pixelRatio;

    this.uiController.updateWarnField(realWidth, realHeight);
  }

  gameOver(isWin: boolean) {
    this._isGameOver = true;
    playableHelper.gameEnd();
    this.uiController.showEndCard(isWin);
    this.audioController.playLoseSfx();

    input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  deactivateTutorial() {
    this._playedTut = false;
    this.uiController.hideTutorial();
    this.stickmanGroup.hideTutHand();
  }

  download() {
    playableHelper.redirect();
  }
}
