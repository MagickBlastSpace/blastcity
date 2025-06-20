import { _decorator, Component, Node, Label, assetManager, SpriteFrame, Sprite, Button } from 'cc';
import { CollectionCardData } from '../../data/CollectionData';
import { Localization } from '../../utils/Localization';
const { ccclass, property } = _decorator;

@ccclass('UICollectionCard')
export class UICollectionCard extends Component {

    @property(Label)
    name_: Label = null;
    @property(Label)
    nameDuplicate: Label = null;

    @property(Sprite)
    starsImg: Sprite = null;

    @property([SpriteFrame])
    star_blocks: SpriteFrame[] = [];
    @property([SpriteFrame])
    star_actives: SpriteFrame[] = [];

    @property(Sprite)
    cardShirt: Sprite = null;

    @property(SpriteFrame)
    card_block: SpriteFrame = null;
    @property(SpriteFrame)
    card_active: SpriteFrame = null;

    @property(SpriteFrame)
    card_block_gold: SpriteFrame = null;
    @property(SpriteFrame)
    card_active_gold: SpriteFrame = null;

    @property(Node)
    unlocked: Node = null;

    @property(Label)
    duplicates: Label = null;

    @property(Sprite)
    image: Sprite = null;
    @property(Sprite)
    copyImg: Sprite = null;

    @property(Node)
    copy: Node = null;

    @property(Button)
    sendBtn: Button = null;

    @property(Node)
    newMarker: Node = null;

    private collectionId: string;
    private data: CollectionCardData;
    private isCollected: boolean;
    private duplicatesCount: number;

    
    start() {
        this.sendBtn.node.on(Button.EventType.CLICK, this.onSendBtnClick, this);
    }
    
    init(collectionId: string, data: CollectionCardData, isCollected: boolean, duplicates: number) {
        this.collectionId = collectionId;
        this.data = data;
        this.isCollected = isCollected;
        this.duplicatesCount = duplicates;

        let nameString = Localization.instance.getLabelByKey("collection_data." + collectionId + "_" + data.id);
        this.name_.string = nameString;
        this.nameDuplicate.string = nameString;

        this.starsImg.spriteFrame = isCollected ? this.star_actives[data.stars - 1] : this.star_blocks[data.stars - 1];

        this.unlocked.active = isCollected;

        if(isCollected && data.type === "gold") {
            this.cardShirt.spriteFrame = this.card_active_gold;
        }
        else if(!isCollected && data.type === "gold") {
            this.cardShirt.spriteFrame = this.card_block_gold;
        }
        else if(isCollected) {
            this.cardShirt.spriteFrame = this.card_active;
        }
        else {
            this.cardShirt.spriteFrame = this.card_block;
        }

        this.duplicates.string = "+" + duplicates;

        assetManager.loadBundle(collectionId, (err, bundle) => {
            if (err) {
                console.error(`Failed to load bundle: ` + collectionId, err);
                return;
            }

            console.log(`Successfully loaded bundle: ` + collectionId);

            bundle.load(data.id + "/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    console.error(`Failed to load prefab: ` + data.id, err);
                    return;
                }

                console.log(`Successfully loaded prefab: ` + data.id);

                this.image.spriteFrame = spriteFrame;
            });
        });

        this.copy.active = duplicates > 0;

        if(duplicates <= 0) {
            return;
        }

        const parts = collectionId.split("_");
        const colNum = parts[parts.length - 1];

        assetManager.loadBundle("copy", (err, bundle) => {
            if (err) {
                console.error(`Failed to load bundle: copy`, err);
                return;
            }

            console.log(`Successfully loaded bundle: copy`);

            bundle.load("card_copy_" + colNum + "/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    console.error(`Failed to load prefab: ` + "card_copy_" + colNum, err);
                    return;
                }

                console.log(`Successfully loaded prefab: ` + "card_copy_" + colNum);

                this.copyImg.spriteFrame = spriteFrame;
            });
        });
    }


    setNewMarker(isActive: boolean) {
        this.newMarker.active = isActive;
    }


    onSendBtnClick() {
        this.node.emit("send", this.collectionId, this.data, this.isCollected, this.duplicatesCount);
    }
}


