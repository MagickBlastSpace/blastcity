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
    @property(Node)
    scrollView: Node = null;

    @property(Field)
    field: Field = null;

    @property(Button)
    showBtn: Button = null;

    private items: [UILevelSwitcherItem] = [];

    private itemsCounter: number = 0;


    start() {
        this.itemsCounter = 1;

        this.showBtn.node.on(Button.EventType.CLICK, this.onShowBtnClick, this);

        GameData.instance.node.on("level_data", (level) => this.spawnItem(level));

        this.scrollView.active = false;
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
                this.scrollView.active = false;
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
            this.scrollView.active = false;
        });

        this.itemsCounter++;
    }


    onShowBtnClick() {
        this.scrollView.active = !this.scrollView.active;
    }
}


