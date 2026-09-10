import { _decorator, Node, Button, Prefab, instantiate, EditBox, Label  } from 'cc';
import { UIFrameBase } from '../UIFrameBase';
import { UIClanItem } from './UIClanItem';
import { ClanData } from '../../data/ClanData';
const { ccclass, property } = _decorator;

@ccclass('UIClansSearchFrame')
export class UIClansSearchFrame extends UIFrameBase {

    @property(Prefab)
    itemPrefab: Prefab = null;
    @property(Node)
    itemsLayout: Node = null;
    @property([UIClanItem])
    items: UIClanItem[] = [];

    @property(Button)
    searchBtn: Button = null;

    @property(EditBox)
    searchInput: EditBox = null;

    @property(Node)
    suitableClansBlock: Node = null;

    @property(Node)
    suitableClansHint: Node = null;

    private data: ClanData[] = [];
    
    private onSearchTextChanged() {
        const hasText = this.searchInput.string.trim().length > 0;

        this.suitableClansBlock.active = !hasText;

        if (hasText) {
            this.suitableClansHint.active = false;
        } else {
            this.clearSearchResults();

            const hintLabel = this.suitableClansHint.getComponent(Label);

            if (hintLabel) {
                hintLabel.string = "Подобрать подходящие для вас кланы";
            }

            this.suitableClansHint.active = true;
        }
    }

    private clearSearchResults() {
        for (let i = 0; i < this.items.length; i++) {
            this.items[i].node.active = false;
        }
    }

    start() {
        this.searchBtn.node.on(Button.EventType.CLICK, this.searchClans, this);

        this.searchInput.node.on(
            EditBox.EventType.TEXT_CHANGED,
            this.onSearchTextChanged,
            this
        );

        this.onSearchTextChanged();
    }

    refresh(data: ClanData[]) {
        this.data = data;
    }

    searchClans() {
        const searchText = this.searchInput.string.trim();

        const matchingClans = searchText !== ""
            ? this.findClansBySubstring(searchText)
            : this.findSuitableClans();

        this.clearSearchResults();

        if (searchText !== "" && matchingClans.length === 0) {
            const hintLabel = this.suitableClansHint.getComponent(Label);

            if (hintLabel) {
                hintLabel.string = `Клан с названием "${searchText}" не найден`;
            }

            this.suitableClansHint.active = true;

            return;
        }

        this.suitableClansHint.active = false;

        for (let i = 0; i < matchingClans.length; i++) {
            if (i >= this.items.length) {
                this.spawnItem();
            }

            this.items[i].node.active = true;
            this.items[i].init(matchingClans[i]);
        }
    }


    spawnItem() {
        const itemNode = instantiate(this.itemPrefab);

        itemNode.on("show_info", (data) => this.showClanInfo(data));

        this.itemsLayout.addChild(itemNode);

        let item = itemNode.getComponent(UIClanItem);

        this.items.push(item);
    }

    showClanInfo(data: ClanData) {
        this.node.emit("show_info", data);
    }


    private findClansBySubstring(substring: string): ClanData[] {
        return this.data.filter(clan => clan.clanName.includes(substring));
    }

    private findSuitableClans(): ClanData[] {
        return this.data.filter(clan => clan.isPrivate === false);
    }
}


