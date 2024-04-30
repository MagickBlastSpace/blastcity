import { _decorator, Component, Node, Button } from 'cc';
import { TestBot } from '../../utils/TestBot';
const { ccclass, property } = _decorator;

@ccclass('UITestBot')
export class UITestBot extends Component {

    @property(Button)
    botBtn: Button = null;

    @property(TestBot)
    bot: TestBot = null;


    start() {
        this.botBtn.node.on(Button.EventType.CLICK, this.activateBot, this);
    }


    activateBot() {
        this.bot.activateBot();
    }
}


