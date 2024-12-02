import { _decorator, Component, Node, Label } from 'cc';
import { CollectionCardData } from '../../data/CollectionData';
const { ccclass, property } = _decorator;

@ccclass('UICollectionCard')
export class UICollectionCard extends Component {

    @property(Label)
    name_: Label = null;
    @property(Label)
    nameDuplicate: Label = null;

    @property([Node])
    stars: Node[] = [];

    @property(Node)
    unlocked: Node = null;

    @property(Label)
    duplicates: Label = null;

    
    init(data: CollectionCardData, isCollected: boolean, duplicates: number) {
        this.name_.string = data.name_;
        this.nameDuplicate.string = data.name_;

        for(let i = 0; i < this.stars.length; i++) {
            this.stars[i].active = i < data.stars;
        }

        this.unlocked.active = isCollected;

        this.duplicates.string = "+" + duplicates;
    }
}


