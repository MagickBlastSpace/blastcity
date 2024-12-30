import { _decorator, Component, Node } from 'cc';
import { UIEventMagicCauldronItem } from './UIEventMagicCauldronItem';
const { ccclass, property } = _decorator;

@ccclass('UIEventMagicCauldronHistoryShelf')
export class UIEventMagicCauldronHistoryShelf extends Component {

    @property([UIEventMagicCauldronItem])
    items: UIEventMagicCauldronItem[] = [];
    
    refresh(pool: string[], hints: string[]) {
        let poolSize = pool.length;

        let poolIterationIndex = 0;

        for(let i = 0; i < this.items.length; i++) {
            this.items[i].node.active = i < poolSize;

            let color = i < hints.length ? hints[i] : "undefined";
            this.items[i].refresh(color);

            this.items[i].setIndicator(color !== "undefined");

            if(color === "undefined") {
                let hintColor = pool[poolIterationIndex];
                for(let j = poolIterationIndex; j < pool.length; j++) {
                    if(hints.includes(hintColor)) {
                        poolIterationIndex = poolIterationIndex + 1;

                        hintColor = pool[poolIterationIndex];
                    }
                }
                this.items[i].setColor(hintColor);

                poolIterationIndex = poolIterationIndex + 1;
            }
        }
    }
}


