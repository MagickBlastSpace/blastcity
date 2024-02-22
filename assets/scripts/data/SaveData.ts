import { _decorator, Component, Node } from 'cc';
import { UserData } from './UserData';
const { ccclass, property } = _decorator;

@ccclass('SaveData')
export class SaveData extends Component {

    public static instance: SaveData = null;


    onLoad() {
        SaveData.instance = this;
    }

    //UserData
    saveUserData() {
        let userData = {
            progress: UserData.instance.getProgress(),
            gold: UserData.instance.getResource("gold")
        };
        
        cc.sys.localStorage.setItem('userData', JSON.stringify(userData));
    }


    loadUserData() {
        var userData = JSON.parse(cc.sys.localStorage.getItem('userData'));

        if (userData) {
            UserData.instance.setProgress(userData.progress);
            UserData.instance.setResource("gold", userData.gold);
        } else {
            console.log("No saved user data found");
        }

        console.log("emit user data");

        this.node.emit("user_data");
    }


    //Level Progress Data



    //Statistics Data
}


