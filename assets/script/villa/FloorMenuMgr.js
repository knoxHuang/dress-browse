var Comp = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this.floorDataList = [];
        this.floorList = [];
        this.floorIndex = 0;
        this.hasMouseDowning = false;
        this.drodownListBg = null;
    },
    // 属性
    properties: {
        btn_downUp: {
            default: null,
            type: Fire.UIButton
        },
        drodownList: {
            default: null,
            type: Fire.Entity
        },
        tips: {
            default: null,
            type: Fire.Entity
        }
    },
    // 显示下拉列表
    onShowListEvent: function (event) {
        if (!this.tips.active) {
            return;
        }
        if (this.hasMouseDowning) {
            this.hasMouseDowning = false;
            return;
        }
        this.drodownList.active = !this.drodownList.active;
    },

    // 进入房屋
    onGoToHouse: function (_mark) {
        var sendData = {
            house_uid: 0,
            floor_id: 0,
            mark: _mark
        };
        this.dataBase.switchRoomWin.openWindow(1, sendData);
    },

    // 鼠标按下
    onMouseDownEvent: function (event) {
        if (this.drodownList.active && this.floorList.indexOf(event.target) === -1) {
            this.hasMouseDowning = true;
            this.drodownList.active = false;
        }
    },
    //
    initFloorMenu: function () {
        var self = this;
        self.btn_downUp.setText("第1层");

        for(var i = 0, len = self.floorList.length; i < len; ++i ) {
            self.floorList[i].active = false;
        }

        self.dataBase.netWorkMgr.RequestFloorList(function (serverData) {
            console.log(serverData);
            var count = serverData.list.myfloor.length;
            //self.tips.active = count > 1;
            self.drodownListBg.customHeight = count * 60;
            for(var i = 0, len = serverData.list.myfloor.length; i < len; ++i ) {
                var floor = serverData.list.myfloor[i];
                if (floor.is_default === "1") {
                    self.btn_downUp.setText("第"+ floor.storey_id +"层");
                }
                if (self.floorList.length > i) {
                    var flootEnt = self.floorList[i];
                    var btn = flootEnt.getComponent(Fire.UIButton);
                    btn.setText("第"+ floor.storey_id +"层");
                    flootEnt.active = true;
                }
                self.floorDataList.push(floor);
            }
        });
    },
    // 选择类型
    onSelectTypeEvent: function (event) {
        this.drodownList.active = false;
        this.floorIndex = parseInt(event.target.name) ;
        this.btn_downUp.setText("第" + (this.floorIndex + 1) + "层");

        if (this.floorDataList.length > this.floorIndex && this.floorDataList[this.floorIndex] != null) {
            this.onGoToHouse(this.floorDataList[this.floorIndex].mark)
        }
    },
    // 初始化下拉列表
    refreshDropDownList: function () {
        var children = this.drodownList.getChildren();
        for(var i = 0, len = children.length; i < len; ++i ) {
            var ent = children[i];
            ent.transform.position = new Fire.Vec2(0, -28 - i * 50 );
            var btn = ent.getComponent(Fire.UIButton);
            btn.setText("第" + i + 1 + "层");
            btn.onClick = this.onSelectTypeEvent.bind(this);
            btn.entity.active = false;
            this.floorList.push(ent);
        }
    },

    // 开始
    start: function () {
        var gameDataEnt = Fire.Entity.find('/DataBase');
        this.dataBase = gameDataEnt.getComponent('DataBase');
        //
        this.btn_downUp.onClick = this.onShowListEvent.bind(this);
        this.bindMouseDownEvent = this.onMouseDownEvent.bind(this);
        Fire.Input.on('mousedown', this.bindMouseDownEvent);
        //
        this.drodownListBg = this.drodownList.getComponent(Fire.SpriteRenderer);
        //
        this.refreshDropDownList();
        //
        this.initFloorMenu();
    },
    onDestroy: function() {
        Fire.Input.off('mousedown', this.bindMouseDownEvent);
    }
});
