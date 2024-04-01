import { _decorator, Component, Label, Node, tween, Vec2, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("UIController")
export class UIController extends Component {
  @property(Node)
  public timeCounterLabel: Node = null!;

  @property(Node)
  public endCardWrapper: Node = null!;

  @property(Node)
  public winEndCard: Node = null!;

  @property(Node)
  public loseEndCard: Node = null!;

  start() {
    this.endCardWrapper.scale = new Vec3(0, 0, 0);
    this.loseEndCard.active = false;
    this.winEndCard.active = false;
  }

  update(deltaTime: number) {}

  updateCounter(time: number) {
    const timeInString = `00:${time < 10 ? `0${time}` : time}`;

    this.timeCounterLabel.getComponent(Label).string = timeInString;
  }

  showEndCard(isWin: boolean) {
    if (isWin) {
      this.winEndCard.active = true;
    } else {
      this.loseEndCard.active = true;
    }

    tween(this.endCardWrapper)
      .to(0.8, { scale: new Vec3(1, 1, 1) }, { easing: "backOut" })
      .start();
  }
}
