import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("SlotGroupController")
export class SlotGroupController extends Component {
  @property(Prefab)
  public slotPrefab: Prefab = null!;

  public slots: Node[] = [];

  public availableSlots: boolean[] = [];

  start() {}

  update(deltaTime: number) {}

  spawnSlots(numberOfSlots: number) {
    const subtractSlotVector = new Vec3(numberOfSlots / 2 - 0.5, 0, 0);

    for (let i = 0; i < numberOfSlots; i++) {
      const slot = this.createSlot();
      const slotPosition = new Vec3(i, 0, 0).subtract(subtractSlotVector);
      slot.setPosition(slotPosition);

      this.slots.push(slot);
      this.availableSlots[i] = true;
    }
  }

  createSlot(): Node {
    const slot = instantiate(this.slotPrefab);
    this.node.addChild(slot);
    return slot;
  }

  hasEmptySlot(): boolean {
    return this.availableSlots.some((slot) => slot);
  }
}
