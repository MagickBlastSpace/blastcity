import { _decorator, Component, Node, Prefab, instantiate, Button } from 'cc';
import { Field } from '../../game/Field';
import { GameData } from '../../data/GameData';
import { UILevelSwitcherItem } from './UILevelSwitcherItem';
const { ccclass, property } = _decorator;

@ccclass('UILevelSwitcher')
export class UILevelSwitcher extends Component {
    @property(Prefab)
    levelItemPrefab: Prefab = null;

    @property(Node)
    levelItemsContainer: Node = null;

    @property(Field)
    field: Field = null;

    private items: [UILevelSwitcherItem] = [];


    start() {
        for(let i = 0; i < GameData.instance.levels.length; i++) {
            const data = GameData.instance.levels[i];
            const item = instantiate(this.levelItemPrefab);
            this.levelItemsContainer.addChild(item);
            const level = item.getComponent('UILevelSwitcherItem');
            level.init(data);
            this.items.push(level);

            item.on("click", (levelData) => {
                this.field.spawnInitialBoard(levelData);
            });
        }
    }
}


