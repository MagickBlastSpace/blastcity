import { _decorator, Component, Node } from 'cc';
import { UIEventMagicCauldronItem } from './UIEventMagicCauldronItem';
const { ccclass, property } = _decorator;

@ccclass('UIEventMagicCauldronHistoryShelf')
export class UIEventMagicCauldronHistoryShelf extends Component {

    @property([UIEventMagicCauldronItem])
    items: UIEventMagicCauldronItem[] = [];
    
    refresh(pool: string[], hints: string[]) {
        let poolSize = pool.length;

        for(let i = 0; i < this.items.length; i++) {
            this.items[i].node.active = i < poolSize;

            let color = i < hints.length ? hints[i] : "undefined";
            this.items[i].refresh(color);

            this.items[i].setIndicator(color !== "undefined");

            if(color === "undefined") {
                let hintColor = pool[i];

                this.items[i].setColor(hintColor);
            }
        }
    }
}


