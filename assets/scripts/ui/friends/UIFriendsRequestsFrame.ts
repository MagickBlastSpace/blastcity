declare const gamepush: any;

import {
    _decorator,
    Button,
    Node,
    instantiate,
    Prefab,
    ScrollView,
    Widget,
    view,
    UITransform,
    Size
} from 'cc';

import { UIFrameBase } from '../UIFrameBase';
import { UIFriendsRequestItem } from './UIFriendsRequestItem';
import { UserData } from '../../data/UserData';

const { ccclass, property } = _decorator;

@ccclass('UIFriendsRequestsFrame')
export class UIFriendsRequestsFrame extends UIFrameBase {

    @property(Button)
    closeBtn: Button = null;

    @property(ScrollView)
    requestsScroll: ScrollView = null;

    @property(Prefab)
    requestPrefab: Prefab = null;

    @property([UIFriendsRequestItem])
    requests: UIFriendsRequestItem[] = [];

    // @property(Node)
    // recommendationsLabel: Node = null;

    // @property(Node)
    // recommendationsScroll: Node = null;

    private cachedRequests: any[] = [];

    private isDataLoaded: boolean = false;
    private isLoading: boolean = false;

    private preloadPromise: Promise<void> = null;


    start() {
        if (this.closeBtn) {
            this.closeBtn.node.on(
                Button.EventType.CLICK,
                this.onCloseBtnClick,
                this
            );
        }

        gamepush.channels.on('event:message', (message) => {
            if (
                message.target === 'FEED' &&
                message.tags?.includes('friend_request')
            ) {
                const alreadyCached =
                    this.cachedRequests.some(
                        item => item?.id === message?.id
                    );

                if(!alreadyCached) {
                    this.cachedRequests.unshift(message);
                }

                this.isDataLoaded = true;

                if(this.node.activeInHierarchy) {
                    this.renderCachedRequests();
                }
            }
        });
    }


    show() {
        super.show();

        this.fixRequestsScrollWidget();

        if(this.isDataLoaded) {
            this.renderCachedRequests();
            return;
        }

        void this.loadAndShow();
    }


    hide() {
        super.hide();
    }


    async refresh() {
        await this.preload(true);

        if(this.node.activeInHierarchy) {
            this.renderCachedRequests();
        }
    }


    onCloseBtnClick() {
        this.hide();
    }


    private clearRequests() {
        for (let i = this.requests.length - 1; i >= 0; i--) {
            if (this.requests[i]?.node) {
                this.requests[i].node.destroy();
            }
        }

        this.requests = [];
    }


    public async preload(
        force: boolean = false
    ): Promise<void> {

        if(this.isDataLoaded && !force) {
            console.log(
                "[FRIEND REQUESTS] Background data already loaded"
            );
            return;
        }

        if(this.preloadPromise) {
            await this.preloadPromise;

            if(!force) {
                return;
            }
        }

        this.preloadPromise = this.performPreload();

        try {
            await this.preloadPromise;
        }
        finally {
            this.preloadPromise = null;
        }
    }


    private async performPreload(): Promise<void> {
        if(this.isLoading) {
            return;
        }

        this.isLoading = true;

        console.log(
            "[FRIEND REQUESTS] Background DATA preload started"
        );

        try {
            const response =
                await gamepush.channels.fetchFeedMessages({
                    playerId:
                        UserData.instance.getPlayerId(),
                    tags: ['friend_request'],
                    limit: 100,
                    offset: 0,
                });

            this.cachedRequests =
                response?.items ?? [];

            this.isDataLoaded = true;

            console.log(
                "[FRIEND REQUESTS] Background DATA preload finished. Count: " +
                this.cachedRequests.length
            );
        }
        catch(error) {
            console.error(
                "[FRIEND REQUESTS] Background preload failed:",
                error
            );

            this.isDataLoaded = false;
        }
        finally {
            this.isLoading = false;
        }
    }


    private async loadAndShow() {
        await this.preload();

        if(
            !this.node.activeInHierarchy ||
            !this.isDataLoaded
        ) {
            return;
        }

        this.renderCachedRequests();
    }


    private renderCachedRequests() {
        this.clearRequests();

        for(let i = 0; i < this.cachedRequests.length; i++) {
            this.spawnRequestItem(
                this.cachedRequests[i]
            );
        }

        // mock для визуального тестирования
        if(this.cachedRequests.length === 0) {
            this.spawnMockRequest();
        }
    }

    private updateItemSize(itemNode: Node) {
        const transform =
            itemNode.getComponent(UITransform);

        if(!transform) {
            return;
        }

        const visibleSize =
            view.getVisibleSize();

        const ratio =
            visibleSize.width /
            visibleSize.height;

        if(ratio < 1.5) {
            transform.setContentSize(
                new Size(1660, 250)
            );

            return;
        }

        const x =
            0.125 * visibleSize.height;

        const containerWidth =
            7.32 * x;

        const containerHeight =
            0.85 * x;

        transform.setContentSize(
            new Size(
                containerWidth,
                containerHeight
            )
        );
    }


    private fixRequestsScrollWidget() {
        if (!this.requestsScroll) {
            return;
        }

        const scrollNode =
            this.requestsScroll.node;

        const requestsNode =
            scrollNode.parent;

        if (!requestsNode) {
            return;
        }

        const widget =
            scrollNode.getComponent(Widget);

        if (!widget) {
            return;
        }

        widget.target = requestsNode;

        widget.isAlignHorizontalCenter = false;
        widget.isAlignVerticalCenter = false;

        widget.isAlignLeft = true;
        widget.isAlignRight = true;
        widget.isAlignTop = true;
        widget.isAlignBottom = true;

        widget.isAbsoluteLeft = true;
        widget.isAbsoluteRight = true;
        widget.isAbsoluteTop = true;
        widget.isAbsoluteBottom = true;

        widget.left = 0;
        widget.right = 0;
        widget.top = 0;
        widget.bottom = 0;

        widget.updateAlignment();
    }

    private spawnMockRequest() {
        const mockMessage = {
            id: -1,
            player: {
                id: -1,
                name: 'MapМарка',
            },
        };

        this.spawnRequestItem(
            mockMessage,
            true
        );
    }


    spawnRequestItem(
        message: any,
        isMock: boolean = false
    ) {
        if (!this.requestPrefab) {
            console.error(
                '[FRIEND REQUESTS] requestPrefab is not assigned'
            );
            return;
        }

        if (!this.requestsScroll) {
            console.error(
                '[FRIEND REQUESTS] requestsScroll is not assigned'
            );
            return;
        }

        const content =
            this.requestsScroll.content;

        if (!content) {
            console.error(
                '[FRIEND REQUESTS] requestsScroll.content is not assigned'
            );
            return;
        }

        const itemNode =
            instantiate(this.requestPrefab);

        content.addChild(itemNode);

        this.updateItemSize(itemNode);

        const item =
            itemNode.getComponent(
                UIFriendsRequestItem
            );

        if (!item) {
            console.error(
                '[FRIEND REQUESTS] UIFriendsRequestItem not found on prefab'
            );

            itemNode.destroy();
            return;
        }

        this.requests.push(item);

        item.init(
            message,
            isMock
        );

        this.requestsScroll.scrollToTop(0);
    }
}