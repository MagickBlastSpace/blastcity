import { _decorator, Component, Node, EditBox, Button } from 'cc';
import { Field } from '../../game/Field';
import { GameData, LevelData } from '../../data/GameData';
import { UIStartFrame } from '../start/UIStartFrame';
import { SaveData } from '../../data/SaveData';
import { Statistics } from '../../data/Statistics';
import { UserData } from '../../data/UserData';
const { ccclass, property } = _decorator;

@ccclass('UILevelConstructor')
export class UILevelConstructor extends Component {
    @property(EditBox)
    inputField: EditBox = null;

    @property(Button)
    pasteBtn: Button = null;
    @property(Button)
    playBtn: Button = null;

    @property(Button)
    superDiscoOnBtn: Button = null;
    @property(Button)
    superDiscoOffBtn: Button = null;

    @property(Button)
    clearLevelSaveBtn: Button = null;
    @property(Button)
    clearGlobalSaveBtn: Button = null;
    @property(Button)
    showLevelStatsBtn: Button = null;

    @property(Button)
    showMatrixBtn: Button = null;

    @property(Field)
    field: Field = null;

    @property(UIStartFrame)
    startFrame: UIStartFrame = null;


    start() {
        this.pasteBtn.node.on(Button.EventType.CLICK, this.onPasteBtnClick, this);
        this.playBtn.node.on(Button.EventType.CLICK, this.onPlayBtnClick, this);

        this.superDiscoOnBtn.node.on(Button.EventType.CLICK, this.onSuperDiscoOnBtnClick, this);
        this.superDiscoOffBtn.node.on(Button.EventType.CLICK, this.onSuperDiscoOffBtnClick, this);

        this.clearLevelSaveBtn.node.on(Button.EventType.CLICK, this.clearLevelSave, this);
        this.clearGlobalSaveBtn.node.on(Button.EventType.CLICK, this.clearGlobalSave, this);
        this.showLevelStatsBtn.node.on(Button.EventType.CLICK, this.showLevelStats, this);

        this.showMatrixBtn.node.on(Button.EventType.CLICK, this.onShowMatrixBtnClick, this);
    }


    onPasteBtnClick() {
        cc.systemEvent.emit(cc.SystemEvent.EventType.CLIPBOARD_PASTE);
        const clipboardContent = cc.Clipboard.getString();
        
        if (this.inputField) {
            this.inputField.string = clipboardContent;
        }

        console.log('Pasted from clipboard:', clipboardContent)
    }

    onPlayBtnClick() {
        try {
            this.field.unloadAssets();
            
            const levelData = LevelData.fromJSON(this.inputField.string);
            
            this.field.spawnInitialBoard(levelData);

            this.startFrame.hide();
        }
        catch (error) {
            this.inputField.string = error;

            let levelsCount = GameData.instance.levels.length;

            this.scheduleOnce(() => {
                this.field.spawnInitialBoard(GameData.instance.levels[UserData.instance.getProgress() % levelsCount]);
            }, 0.5);
        }
    }

    onSuperDiscoOnBtnClick() {
        this.field.setSuperDiscoballMode(true);
    }

    onSuperDiscoOffBtnClick() {
        this.field.setSuperDiscoballMode(false);
    }

    onShowMatrixBtnClick() {
        this.inputField.string = this.readMatrix(this.field.getTilesArray());
    }

    clearLevelSave() {
        SaveData.instance.clearLevelProgress();

        SaveData.instance.clearUserData(); //to rm
    }

    clearGlobalSave() {
        SaveData.instance.clearUserData();

        SaveData.instance.clearLevelProgress(); //to rm
    }

    showLevelStats() {
        let stats = Statistics.instance.loadLevelStat(UserData.instance.getProgress());

        if(!stats) {
            this.inputField.string = "No stats found";
            return;
        }

        this.inputField.string = "Level " + stats.levelId + " Statistics: \n";
        this.inputField.string += "Red tiles destroyed: " + stats.redDestroyed + "\n";
        this.inputField.string += "Rockets destroyed: " + stats.rocketsDestroyed + "\n";
        this.inputField.string += "Destroyed by discoball: " + stats.destroyedByDiscoball + "\n";
        this.inputField.string += "Fails: " + stats.fails + "\n";
    }


    readMatrix(tiles: Node[][]): string {
        const numRows: number = tiles.length;
        const numCols: number = tiles.length > 0 ? tiles[0].length : 0;

        let matrixString = "";

        for(let i = 0; i < numRows; i++) {
            for(let j = 0; j < numCols; j++) {

                if(tiles[i][j] === undefined) {
                    matrixString += "undefined --- ";
                    continue;
                }

                if(tiles[i][j] === null) {
                    matrixString += "null --- ";
                    continue;
                }

                const tile = tiles[i][j];
                let tileComponent = tile.getComponent("TileBase");

                if(tileComponent.isEmptyTile()) {
                    matrixString += "empty --- ";
                    continue;
                }

                matrixString += tileComponent.getTileType() + " --- ";
            }

            matrixString += "\n";
        }

        return matrixString;
    }
}


