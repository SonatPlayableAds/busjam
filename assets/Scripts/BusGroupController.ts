import {
  _decorator,
  Component,
  instantiate,
  Material,
  Node,
  Prefab,
  Texture2D,
  tween,
  Vec3,
} from "cc";
import { BusController } from "./BusController";
import { PLAYER_COLOR } from "./helper/Constants";
import { GameController } from "./GameController";
import { AudioController } from "./AudioController";
const { ccclass, property } = _decorator;

const BUS_DISTANCE = 6.3;

@ccclass("BusGroupController")
export class BusGroupController extends Component {
  @property(AudioController)
  public audioController: AudioController = null!;

  @property(Prefab)
  public busPrefab: Prefab = null!;

  @property([Node])
  public buses: Node[] = [];

  public movingBus: boolean = false;

  private _currentBus: Node;

  start() {}

  update(deltaTime: number) {
    if (this.buses.length === 0) return;

    const canRun = this._currentBus
      .getComponent(BusController)
      .checkRunCondition();

    if (canRun) {
      this._currentBus.getComponent(BusController).runAway();
      this.buses.shift();
      this._currentBus = this.buses[0];

      const gameController = this.node.parent
        .getChildByName("GameController")
        .getComponent(GameController);

      this.shiftBuses(gameController);
    }
  }

  spawnBuses(buses: number[], busMaterials: Material[]) {
    buses.forEach((bus, index) => {
      const busPos = new Vec3(-index * BUS_DISTANCE, 0, 0);
      const busMapIndex = bus - 1;
      const currentBusMtl = busMaterials[busMapIndex];

      const newBus = instantiate(this.busPrefab);
      if (index === 0) this._currentBus = newBus;

      this.node.addChild(newBus);

      newBus.setPosition(busPos);
      newBus.getComponent(BusController).applyBusMtl(currentBusMtl);
      newBus.getComponent(BusController).busColor = PLAYER_COLOR[busMapIndex];

      this.buses.push(newBus);
    });
  }

  getCurrentBusColor() {
    return this._currentBus.getComponent(BusController).busColor;
  }

  onStickmanEnterBus(stickman: Node) {
    this._currentBus.getComponent(BusController).onStickmanEnter(stickman);
  }

  shiftBuses(gameController: GameController) {
    this.audioController.playBeepSfx();
    this.audioController.playBusRunSfx();
    this.movingBus = true;

    this.buses.forEach((bus, index) => {
      const busTween = tween(bus)
        .delay(0.5)
        .to(0.8, { position: new Vec3(-index * BUS_DISTANCE, 0, 0) });

      if (index === this.buses.length - 1) {
        busTween.call(() => {
          gameController.newBusArrived(
            this._currentBus.getComponent(BusController).busColor
          );
          this.movingBus = false;
        });
      }

      busTween.union().start();
    });
  }

  getNextBusColor() {
    return this.buses[1].getComponent(BusController).busColor;
  }

  getNumberOfStickman(): number {
    return this._currentBus
      .getComponent(BusController)
      .getNumberOfStickmanOnBus();
  }

  pushStickmanFromQueueToBus(stickmans: Node[]) {
    this._currentBus.getComponent(BusController).pushStickmanToBus(stickmans);
  }
}
