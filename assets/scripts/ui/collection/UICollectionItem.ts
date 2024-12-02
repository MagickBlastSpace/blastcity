import { _decorator, Component, Node, Label, Button } from 'cc';
import { CollectionData } from '../../data/CollectionData';
const { ccclass, property } = _decorator;

@ccclass('UICollectionItem')
export class UICollectionItem extends Component {

    @property(Label)
    name_: Label = null;

    @property(Label)
    progress: Label = null;

    @property(Button)
    clickBtn: Button = null;

    private data: CollectionData;


    start() {
        this.clickBtn.node.on(Button.EventType.CLICK, this.onClickBtnClick, this);
    }

    
    refresh(data: CollectionData, progress: number) {
        this.name_.string = data.name_;

        this.progress.string = progress + "/" + data.cards.length;

        this.data = data;
    }


    onClickBtnClick() {
        this.node.emit("click", this.data);
    }
}


