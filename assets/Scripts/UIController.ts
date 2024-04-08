import {
  _decorator,
  Component,
  Label,
  Node,
  tween,
  Vec2,
  Vec3,
  Animation,
  UITransform,
} from "cc";
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

  @property(Node)
  public warn: Node = null!;

  @property(Node)
  public tutorial: Node = null!;

  @property(Node)
  public praseText: Node = null!;

  @property(Node)
  public playBtn: Node = null!;

  private _isHideTutorial = false;

  start() {
    this.endCardWrapper.scale = new Vec3(0, 0, 0);
    this.loseEndCard.active = false;
    this.winEndCard.active = false;
  }

  update(deltaTime: number) {}

  hidePlayBtn() {
    this.playBtn.active = false;
  }

  updateCounter(time: number) {
    const timeInString = `00:${time < 10 ? `0${time}` : time}`;

    this.timeCounterLabel.getComponent(Label).string = timeInString;
  }

  popPraiseText() {
    const praiseTexts = ["Great!", "Cool!", "Amazing!", "Nice!", "Perfect!"];
    const randomIndex = Math.floor(Math.random() * praiseTexts.length);
    const text = praiseTexts[randomIndex];

    this.praseText.getComponent(Label).string = text;
    tween(this.praseText)
      .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: "backOut" })
      .delay(0.2)
      .to(0.2, { scale: new Vec3(0, 0, 0) })
      .union()
      .start();
  }

  playWarning() {
    const anim = this.warn.getComponent(Animation);
    anim.play("warn");
  }

  hideTutorial() {
    if (this._isHideTutorial) return;
    this.tutorial.active = false;
    this._isHideTutorial = true;
  }

  showEndCard(isWin: boolean) {
    this.hidePlayBtn();
    if (isWin) {
      this.winEndCard.active = true;
    } else {
      this.loseEndCard.active = true;
    }

    tween(this.endCardWrapper)
      // .delay(0.5)
      .to(0.8, { scale: new Vec3(1, 1, 1) }, { easing: "backOut" })
      .union()
      .start();
  }

  updateWarnField(realWidth: number, realHeight: number) {
    // const topNode = this.warn.getChildByName("Top")!;
    // const bottomNode = this.warn.getChildByName("Bot")!;
    const leftNode = this.warn.getChildByName("Left")!;
    const rightNode = this.warn.getChildByName("Right")!;

    if (leftNode && rightNode) {
      // topNode.setPosition(
      //   0,
      //   realHeight / 2 +
      //     topNode.getComponent(UITransform).contentSize.height / 2 -
      //     70,
      //   0
      // );
      // bottomNode.setPosition(
      //   0,
      //   -realHeight / 2 -
      //     bottomNode.getComponent(UITransform).contentSize.height / 2 +
      //     70,
      //   0
      // );
      leftNode.setPosition(
        -realWidth / 2 -
          leftNode.getComponent(UITransform).contentSize.width / 2 +
          70,
        0,
        0
      );
      rightNode.setPosition(
        realWidth / 2 +
          leftNode.getComponent(UITransform).contentSize.width / 2 -
          70,
        0,
        0
      );
    }
  }
}
