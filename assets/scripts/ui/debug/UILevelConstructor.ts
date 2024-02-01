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

    @property(Field)
    field: Field = null;


    start() {
        this.pasteBtn.node.on(Button.EventType.CLICK, this.onPasteBtnClick, this);
        this.playBtn.node.on(Button.EventType.CLICK, this.onPlayBtnClick, this);

        this.superDiscoOnBtn.node.on(Button.EventType.CLICK, this.onSuperDiscoOnBtnClick, this);
        this.superDiscoOffBtn.node.on(Button.EventType.CLICK, this.onSuperDiscoOffBtnClick, this);
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
}


