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

    @property(Field)
    field: Field = null;


    start() {
        this.pasteBtn.node.on(Button.EventType.CLICK, this.onPasteBtnClick, this);
        this.playBtn.node.on(Button.EventType.CLICK, this.onPlayBtnClick, this);
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
}


