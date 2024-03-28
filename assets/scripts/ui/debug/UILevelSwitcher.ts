import { _decorator, Component, Node, Prefab, instantiate, Button } from 'cc';
import { Field } from '../../game/Field';
import { GameData, LevelData } from '../../data/GameData';
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

    private itemsCounter: number = 0;


    start() {
        this.itemsCounter = 1;

        GameData.instance.node.on("level_data", (level) => this.spawnItem(level));
    }
    
    spawnItems() {
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

    spawnItem(levelData: LevelData) {
        const item = instantiate(this.levelItemPrefab);
        this.levelItemsContainer.addChild(item);
        const level = item.getComponent('UILevelSwitcherItem');

        levelData.id = this.itemsCounter;
        level.init(levelData);
        this.items.push(level);

        item.on("click", (levelData) => {
            this.field.spawnInitialBoard(levelData);
        });

        this.itemsCounter++;
    }
}


