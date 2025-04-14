import { _decorator, Component, Node, Button } from 'cc';
import { EventRewardData } from '../../../data/EventData';
import { UIRewardInfo } from '../../UIRewardInfo';
const { ccclass, property } = _decorator;

@ccclass('UIEventEndlessTreasureItem')
export class UIEventEndlessTreasureItem extends Component {

    @property(Node)
    complete: Node = null;
    @property(Node)
    blocked: Node = null;

    @property(Button)
    clickBtn: Button = null;
    @property(Button)
    buyBtn: Button = null;

    @property(UIRewardInfo)
    rewardsInfo: UIRewardInfo;

    private index: number = 0;
    private isAvailable: boolean = false;


    start() {
        this.clickBtn.node.on(Button.EventType.CLICK, this.onClickBtnClick, this);
        this.buyBtn.node.on(Button.EventType.CLICK, this.onClickBtnClick, this);
    }
    
    
    init(idx: number) {
        this.index = idx;
    }

    
    refresh(data: EventRewardData, step: number, isPayable: boolean) {
        let isComplete = step > this.index;
        this.isAvailable = step === this.index;
        let isBlocked = step < this.index;

        this.complete.active = isComplete;
        this.blocked.active = isBlocked;

        this.rewardsInfo.init(data);

        this.buyBtn.node.active = isPayable;
    }


    onClickBtnClick() {
        if(this.isAvailable) {
            this.node.emit("buy");
        }
    }
}


