import { _decorator, Node, UITransform, Vec3, view, Widget } from 'cc';
import { UIAdaptivityBase } from '../UIAdaptivityBase';

const { ccclass } = _decorator;

type NodeSnapshot = {
    width: number;
    height: number;
    position: Vec3;
    scale: Vec3;
};

type CardProfile = { width: number; height: number };

/** Runtime-only geometry for the explicit liveops-card-adaptivity scope. */
@ccclass('UIEventLiveopsCardAdaptivity')
export class UIEventLiveopsCardAdaptivity extends UIAdaptivityBase {
    public static readonly supportedCards = new Set([
        'TeamTreasure', 'BalloonRise', 'ClanGift', 'EndlessTreasure',
        'HiddenTemple', 'KingLeague', 'KingsCup', 'TeamBattle', 'TroyanHorse',
        'Lightning', 'RocketFever', 'TreasureAphrodite',
    ]);

    private readonly snapshots = new Map<Node, NodeSnapshot>();
    private cardRoot: Node | null = null;
    private content: Node | null = null;
    private profile: CardProfile | null = null;
    private originalContentParent: Node | null = null;
    private originalContentSiblingIndex = 0;
    private runtimeScaleRoot: Node | null = null;
    private skyRaceStartLayoutActive = false;
    private skyRaceFrameWidget: Widget | null = null;
    private skyRaceFrameWidgetWasEnabled = false;

    onLoad() {
        if (this.node.name === 'SkyRace') return;
        this.prepareCardRoot();
    }

    start() {
        this.refresh();
    }

    onEnable() {
        this.refresh();
    }

    public refresh() {
        if (this.node.name === 'SkyRace' && !this.skyRaceStartLayoutActive) return;
        if (!this.cardRoot || !this.content || !this.profile) return;
        const visibleSize = view.getVisibleSize();
        if (visibleSize.width <= 0 || visibleSize.height <= 0) return;

        const scale = this.getStandardScale(visibleSize.width, visibleSize.height);
        const cappedHeight = Math.min(this.getProfileHeight(), visibleSize.height * 0.9 / scale);
        this.resizeContainer(this.content, this.profile.width, cappedHeight);
        // Do not depend on ResolutionManager recognizing a derived component:
        // all covered cards use their own runtime scale root.
        this.node.setScale(1, 1, 1);
        this.cardRoot.setScale(scale, scale, 1);
        this.centerCardAtOrigin(scale);

        if (this.node.name === 'TeamTreasure') this.restoreTeamTreasureInfoScale();
        if (this.node.name === 'Lightning') this.layoutLightningState();
    }

    private prepareCardRoot() {
        if (this.cardRoot) return;
        this.snapshots.clear();
        this.capture(this.node);
        const content = this.findContentNode();
        this.profile = this.getProfile();
        if (!content || !this.profile) return;
        this.content = content;

        if (this.node.name === 'SkyRace') {
            this.skyRaceFrameWidget = content.getComponent(Widget);
            this.skyRaceFrameWidgetWasEnabled = this.skyRaceFrameWidget?.enabled ?? false;
            if (this.skyRaceFrameWidget) this.skyRaceFrameWidget.enabled = false;
        }

        if (this.node.name === 'TeamTreasure') {
            this.cardRoot = this.node.getChildByName('CardScaleRoot');
            // Saved root Scale Y is 1.1; the runtime card uses a uniform root.
            this.node.setScale(1, 1, 1);
        } else {
            this.cardRoot = this.createScaleRoot(content);
        }

        this.capture(this.content);
        this.capture(this.cardRoot);
        if (this.node.name === 'TeamTreasure') this.capture(this.node.getChildByName('Info'));

    }

    private findContentNode(): Node | null {
        if (this.node.name === 'RocketFever' || this.node.name === 'TreasureAphrodite') {
            return this.node.getChildByName('Portrait');
        }
        if (this.node.name === 'TeamTreasure') {
            return this.node.getChildByName('CardScaleRoot')?.getChildByName('Frame') ?? null;
        }
        return this.node.getChildByName('Frame');
    }

    private createScaleRoot(content: Node): Node {
        const siblingIndex = content.getSiblingIndex();
        this.originalContentParent = content.parent;
        this.originalContentSiblingIndex = siblingIndex;
        const root = new Node('LiveopsCardScaleRoot');
        root.addComponent(UITransform);
        this.node.addChild(root);
        root.setSiblingIndex(siblingIndex);
        root.setPosition(Vec3.ZERO);
        root.addChild(content);
        this.runtimeScaleRoot = root;
        return root;
    }

    /** Applies the shared card layout only to SkyRace's pre-start Frame. */
    public setSkyRaceStartLayout(active: boolean) {
        if (this.node.name !== 'SkyRace') return;
        if (active) {
            this.skyRaceStartLayoutActive = true;
            this.prepareCardRoot();
            this.refresh();
            return;
        }

        this.skyRaceStartLayoutActive = false;
        this.restoreOriginalLayout();
    }

    private getProfile(): CardProfile | null {
        switch (this.node.name) {
            case 'Lightning': return { width: 1560, height: 2160 };
            case 'SkyRace': return { width: 1560, height: 2160 };
            case 'RocketFever':
            case 'TreasureAphrodite': return { width: 1560, height: 2644 };
            case 'TeamTreasure':
            case 'BalloonRise':
            case 'ClanGift':
            case 'EndlessTreasure':
            case 'HiddenTemple':
            case 'KingLeague':
            case 'KingsCup':
            case 'TeamBattle':
            case 'TroyanHorse': return { width: 1560, height: 2160 };
            default: return null;
        }
    }

    private getStandardScale(width: number, height: number): number {
        if (width < height) {
            const phone = width / height < 0.65;
            return Math.min((phone ? 0.94 : 0.72) * width / 1560, 0.78 * height / 1960);
        }
        return Math.min(0.58 * width / 1560, 0.8 * height / 1960);
    }

    private getProfileHeight(): number {
        if (this.node.name === 'Lightning' && this.content?.getChildByName('FrameGame')?.active) return 2760;
        return this.profile?.height ?? 1960;
    }

    private resizeContainer(container: Node, width: number, height: number) {
        const source = this.capture(container);
        const transform = container.getComponent(UITransform);
        if (!transform) return;
        transform.setContentSize(width, height);

        for (const child of container.children) {
            const childSource = this.capture(child);
            child.setPosition(
                childSource.position.x * width / source.width,
                childSource.position.y * height / source.height,
                childSource.position.z,
            );
        }
    }

    private centerCardAtOrigin(scale: number) {
        if (!this.cardRoot || !this.content) return;
        this.cardRoot.setPosition(
            -this.content.position.x * scale,
            -this.content.position.y * scale,
            0,
        );
    }

    private layoutLightningState() {
        const game = this.content?.getChildByName('FrameGame');
        if (!game?.active || !this.cardRoot) return;
        const height = Math.min(2760, view.getVisibleSize().height * 0.9 / this.cardRoot.scale.x);
        this.resizeContainer(game, 1560, height);
    }

    private restoreTeamTreasureInfoScale() {
        const info = this.node.getChildByName('Info');
        const source = info && this.snapshots.get(info);
        if (!info || !source) return;
        // Info is outside CardScaleRoot, so preserve its former world geometry.
        info.setScale(source.scale.x, source.scale.y * 1.1, source.scale.z);
    }

    private restoreOriginalLayout() {
        if (!this.cardRoot || !this.content) return;

        if (this.runtimeScaleRoot && this.originalContentParent) {
            this.originalContentParent.addChild(this.content);
            this.content.setSiblingIndex(this.originalContentSiblingIndex);
        }

        for (const [node, source] of this.snapshots) {
            if (node === this.runtimeScaleRoot) continue;
            const transform = node.getComponent(UITransform);
            if (transform) transform.setContentSize(source.width, source.height);
            node.setPosition(source.position);
            node.setScale(source.scale);
        }

        this.runtimeScaleRoot?.destroy();
        if (this.skyRaceFrameWidget) {
            this.skyRaceFrameWidget.enabled = this.skyRaceFrameWidgetWasEnabled;
        }
        this.runtimeScaleRoot = null;
        this.cardRoot = null;
        this.content = null;
        this.profile = null;
        this.originalContentParent = null;
        this.skyRaceFrameWidget = null;
    }

    private capture(node: Node | null): NodeSnapshot {
        if (!node) return { width: 1, height: 1, position: new Vec3(), scale: new Vec3(1, 1, 1) };
        const old = this.snapshots.get(node);
        if (old) return old;
        const transform = node.getComponent(UITransform);
        const source = {
            width: transform?.contentSize.width ?? 1,
            height: transform?.contentSize.height ?? 1,
            position: node.position.clone(),
            scale: node.scale.clone(),
        };
        this.snapshots.set(node, source);
        return source;
    }
}
