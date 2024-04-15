import {
  _decorator,
  animation,
  BoxCollider,
  CCString,
  Collider,
  Component,
  ICollisionEvent,
  Material,
  Node,
  SkinnedMeshRenderer,
  Texture2D,
  TriggerCallback,
  tween,
  Vec3,
} from "cc";
import { BUS_SEAT } from "./helper/Constants";
import { StickmanController } from "./StickmanController";
const { ccclass, property } = _decorator;

@ccclass("BusController")
export class BusController extends Component {
  @property(CCString)
  public busColor: string = "";

  private availableSeats: number = 0;

  private _animationController = null;
  private _stickmansOnBus: Node[] = [];

  start() {
    this._animationController = this.getComponent(
      animation.AnimationController
    );

    let collider = this.node.getComponent(Collider);
    collider.on(
      "onCollisionEnter",
      (event) => {
        this.openDoor();
      },
      this
    );
  }

  update(deltaTime: number) {}

  applyBusMtl(mtl: Material) {
    const bus = this.node.getChildByName("Car");
    const meshRenderer = bus.getComponent(SkinnedMeshRenderer);
    meshRenderer.setMaterial(mtl, 0);
  }

  openDoor() {
    this._animationController.setValue("Open", true);

    this.scheduleOnce(() => {
      this._animationController.setValue("Open", false);
    }, 0.1);
  }

  onStickmanEnter(stickman: Node, audioController: any) {
    stickman.setParent(this.node);
    stickman
      .getComponent(animation.AnimationController)
      .setValue("SittingIdle", true);
    stickman.setPosition(BUS_SEAT[this._stickmansOnBus.length]);
    stickman.setRotationFromEuler(new Vec3(0, 90, 0));
    this._stickmansOnBus.push(stickman);

    audioController.playPopSfx();
    tween(stickman)
      .to(0.3, { scale: new Vec3(0.036, 0.036, 0.036) })
      .union()
      .start();
  }

  runAway() {
    const destination = new Vec3(27, 0, 0);
    tween(this.node)
      .delay(0.5)
      .to(2.5, { position: destination })
      .call(() => {
        this.node.destroy();
      })
      .start();
  }

  updateSeats() {
    this.availableSeats += 1;
  }

  checkRunCondition() {
    return this._stickmansOnBus.length === 3;
  }

  getNumberOfStickmanOnBus() {
    return this._stickmansOnBus.length;
  }

  pushStickmanToBus(stickmans: Node[]) {
    return this._stickmansOnBus.push(...stickmans);
  }
}
