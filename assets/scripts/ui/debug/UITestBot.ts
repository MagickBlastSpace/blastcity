import { _decorator, Component, Node, Button, EditBox } from 'cc';
import { TestBot } from '../../utils/TestBot';
const { ccclass, property } = _decorator;

@ccclass('UITestBot')
export class UITestBot extends Component {

    @property(Button)
    botBtn: Button = null;
    @property(Button)
    stopBtn: Button = null;

    @property(TestBot)
    bot: TestBot = null;

    @property(EditBox)
    startLevel_input: EditBox = null;
    @property(EditBox)
    endLevel_input: EditBox = null;
    @property(EditBox)
    iterations_input: EditBox = null;


    start() {
        this.botBtn.node.on(Button.EventType.CLICK, this.activateBot, this);
        this.stopBtn.node.on(Button.EventType.CLICK, this.stopBot, this);

        this.startLevel_input.string = "1";
        this.endLevel_input.string = "100";
        this.iterations_input.string = "1";
    }


    activateBot() {
        let startLevel = parseInt(this.startLevel_input.string);
        let endLevel = parseInt(this.endLevel_input.string);
        let iterations = parseInt(this.iterations_input.string);

        if(isNaN(startLevel)) {
            startLevel = 1;
        }

        if(isNaN(endLevel)) {
            endLevel = 100;
        }

        if(isNaN(iterations)) {
            iterations = 1;
        }

        this.bot.activateBot(startLevel - 1, endLevel, iterations);
    }

    stopBot() {
        this.bot.stopBot();
    }
}


