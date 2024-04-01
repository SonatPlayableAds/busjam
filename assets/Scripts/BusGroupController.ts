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
const { ccclass, property } = _decorator;

const BUS_DISTANCE = 6.3;

@ccclass("BusGroupController")
export class BusGroupController extends Component {
  @property(Prefab)
  public busPrefab: Prefab = null!;

  @property([Node])
  public buses: Node[] = [];

  private _currentBus: Node;

  start() {}

  update(deltaTime: number) {
    const canRun = this._currentBus
      .getComponent(BusController)
      .checkRunCondition();
    if (canRun) {
      this._currentBus.getComponent(BusController).runAway();
      this.buses.shift();
      this._currentBus = this.buses[0];
      this.shiftBuses();
    }
  }

  spawnBuses(buses: number[], busMaterials: Material[]) {
    buses.forEach((bus, index) => {
      const busPos = new Vec3(-index * BUS_DISTANCE, 0, 0);
      const currentBusMtl = busMaterials[bus];

      const newBus = instantiate(this.busPrefab);
      if (index === 0) this._currentBus = newBus;

      this.node.addChild(newBus);

      newBus.setPosition(busPos);
      newBus.getComponent(BusController).applyBusMtl(currentBusMtl);
      newBus.getComponent(BusController).busColor = PLAYER_COLOR[bus];

      this.buses.push(newBus);
    });
  }

  getCurrentBusColor() {
    return this._currentBus.getComponent(BusController).busColor;
  }

  onStickmanEnterBus(stickman: Node) {
    const canRunAway = this._currentBus
      .getComponent(BusController)
      .onStickmanEnter(stickman);
  }

  shiftBuses() {
    this.buses.forEach((bus, index) => {
      tween(bus)
        .to(0.8, { position: new Vec3(-index * BUS_DISTANCE, 0, 0) })
        .start();
    });
  }
}
