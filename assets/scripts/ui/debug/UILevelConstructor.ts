import { _decorator, Component, Node, EditBox, Button } from 'cc';
import { Field } from '../../game/Field';
import { LevelData } from '../../data/GameData';
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
    showMatrixBtn: Button = null;

    @property(Field)
    field: Field = null;


    start() {
        this.pasteBtn.node.on(Button.EventType.CLICK, this.onPasteBtnClick, this);
        this.playBtn.node.on(Button.EventType.CLICK, this.onPlayBtnClick, this);

        this.superDiscoOnBtn.node.on(Button.EventType.CLICK, this.onSuperDiscoOnBtnClick, this);
        this.superDiscoOffBtn.node.on(Button.EventType.CLICK, this.onSuperDiscoOffBtnClick, this);

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
            const levelData = LevelData.fromJSON(this.inputField.string);
            this.field.spawnInitialBoard(levelData);
        }
        catch (error) {
            this.inputField.string = error;
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


