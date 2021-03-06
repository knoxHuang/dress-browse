var DataBase = require('DataBase');
// 主菜单管理类
var MainMenuMgr = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        // 菜单列表
        this._menuList = [];
    },
    // 属性
    properties: {
        margin: new Fire.Vec2(),
        // 当前房间名称
        homeType: {
            default: null,
            type: Fire.Text
        },
        // 当前别墅名称
        villaName: {
            default: null,
            type: Fire.Text
        }
    },
    // 切换房间
    _onChangeRoomEvent: function () {
        console.log('切换房间');
        var self = this;
        var sendData = {
            house_uid: 0,
            floor_id: 0,
            mark: this.dataBase.mark
        };
        self.dataBase.switchRoomWin.openWindow(0, sendData);
    },
    // 返回室外
    _onGoToOutDoorEvent: function () {
        console.log('返回室外');
        Fire.Engine.loadScene('launch');
    },
    // 获取菜单按钮并且绑定事件
    _initMenu: function () {
        var self = this;
        var children = this.entity.getChildren();
        self._menuList = [];
        children.forEach(function (ent) {
            // 绑定按钮事件
            var btn = ent.getComponent('UIButton');
            if (! btn) {
                return;
            }
            if (ent.name === "1") {
                btn.onClick = self._onChangeRoomEvent.bind(self);
            }
            else if (ent.name === "2") {
                btn.onClick = self._onGoToOutDoorEvent.bind(self);
            }
            self._menuList.push(btn);
        });
    },
    // 更新当前房间类型
    refreshCurHomeType: function (homeType) {
        this.homeType.text = "当前:" + homeType;
    },
    // 更新当前别墅名称
    refreshCurVillaName: function (text) {
        if (this.villaName.text === text){
            return;
        }
        this.villaName.text = text || "";
    },
    onLoad: function () {
        // 常用的变量/数据
        var ent = Fire.Entity.find('/DataBase');
        this.dataBase = ent.getComponent('DataBase');
        // 页面大小发生变化的时候会调用这个事件
        var self = this;
        Fire.Screen.on('resize', function () {
            var width = self.documentElement.clientWidth;
            var height = self.documentElement.clientHeight;
            if (width < height) {
                self.dataBase.tipsWindow.openTipsWindow('横屏效果更好!');
            }
            else {
                self.dataBase.tipsWindow.closeTips();
            }
        });
        var documentElement = document.documentElement;
        var width = documentElement.clientWidth;
        var height = documentElement.clientHeight;
        this.documentElement = documentElement;
        if (width < height) {
            this.dataBase.tipsWindow.openWindow('横屏效果更好!');
        }
    },
    // 开始
    start: function () {
        // 获取菜单按钮并且绑定事件
        this._initMenu();

        Fire.Engine.preloadScene('launch');
    },
    // 更新
    update: function () {
        // 匹配UI分辨率
        //var camera = Fire.Camera.main;
        //var bgWorldBounds = this.dataBase.bgRender.getWorldBounds();
        //var bgLeftTopWorldPos = new Fire.Vec2(bgWorldBounds.xMin, bgWorldBounds.yMax);
        //var bgleftTop = camera.worldToScreen(bgLeftTopWorldPos);
        //var screenPos = new Fire.Vec2(bgleftTop.x, bgleftTop.y);
        //var worldPos = camera.screenToWorld(screenPos);
        //this.entity.transform.worldPosition = worldPos;
        // 匹配UI分辨率
        var camera = Fire.Camera.main;
        var screenSize = Fire.Screen.size.mul(camera.size / Fire.Screen.height);
        var newPos = Fire.v2(-screenSize.x / 2 + this.margin.x, screenSize.y / 2 - this.margin.y);
        this.entity.transform.position = newPos;
    }
});
