import { _decorator, Component, Node, Label, Button, assetManager, SpriteFrame, Sprite } from 'cc';
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

    @property(Sprite)
    image: Sprite = null;

    private data: CollectionData;


    start() {
        this.clickBtn.node.on(Button.EventType.CLICK, this.onClickBtnClick, this);
    }

    
    refresh(data: CollectionData, progress: number) {
        this.name_.string = data.name_;

        this.progress.string = progress + "/" + data.cards.length;

        this.data = data;

        assetManager.loadBundle("covers", (err, bundle) => {
            if (err) {
                console.error(`Failed to load bundle: covers`, err);
                return;
            }

            console.log(`Successfully loaded bundle: covers"`);

            bundle.load(data.id + "/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    console.error(`Failed to load prefab: ` + data.id, err);
                    return;
                }

                console.log(`Successfully loaded prefab: ` + data.id);

                this.image.spriteFrame = spriteFrame;
            });
        });
    }


    onClickBtnClick() {
        this.node.emit("click", this.data);
    }
}


