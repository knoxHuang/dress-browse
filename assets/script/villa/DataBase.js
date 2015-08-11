//  存放项目需要的变量/数据/对象
var DataBata = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        // 用户钱包
        this.usercc = 0;
        // 是否可以保存
        this.hasCanSave = false;
        // 当前楼层ID
        this.floorId = 0;
        // 当前mark
        this.mark = '';
        // 当前房间UID
        this.house_uid = 0;
        // 当前房间ID
        this.room_id = 0;
        // 当前房间名称
        this.room_name = '';
        // 默认房间地板资源
        this.default_diban = '';
        // 默认房间墙壁资源
        this.default_beijing = '';
        // 当前装扮的套装
        this.curDressSuit = {
            // 套装ID
            suit_id: 0,
            // 套装小图
            suit_icon: null,
            // 背包ID
            pack_id: 0,
            // 套装名称
            suit_name: '',
            // 套装来自哪里，1.背包 2.商城
            suit_from: 1,
            // 套装价格
            price: 0,
            // 折扣
            discount: 1,
            // 套装列表
            funrnitureList: []
        };
        // 背景与地面的默认图片
        this.background = null;
        this.ground = null;
        // 初始化场景子元素
        this.defaultScreenChilds = null;
        // 保存所有图片
        this.loadImageList = {};
        //
        this.familyList = null;
        this.familyGo = null;
    },
    // 载入时
    onLoad: function () {
        // 载入控件
        this.loadControls();
        if (!this.netWorkMgr.getToKenValue()) {
            this.toKenTipWin.active = true;
            return;
        }
        // 初始化房间
        var sendData = {};
        if(this.globalData && this.globalData.sendData){
            sendData = this.globalData.sendData;
            this.globalData.sendData = null;
        }
        else {
            sendData = {
                mark: '',
                house_uid: 0
            };
        }
        var self = this;
        self.loadTips.openTips('初始化场景，请稍后...');
        self.intoRoom(sendData, function () {
            // 这里因为是为了保持默认的背景跟地板的图片
            self.saveDefaultData();
            self.loadTips.closeTips();

            if (self.globalData) {
                if (self.globalData.gotoType === 2) {
                    self.updateCharacters();
                    self.characters.entity.active = true;
                }
                else {
                    self.mainMenuMgr.onHouseDressEvent();
                }
            }
        });
    },

    updateCharacters: function () {
        // 屋主数据
        var self = this;
        if (self.familyList.length > 0) {
            self.characters.entity.active = true;
            var host = self.familyList[0];
            var host_url = host.figure_url;
            var host_name = host.user_name;
            self.loadImage(host_url, function (error, image) {
                self.characters.setHost(image, host_name);
            });
        }
        // 家人数据
        if (self.familyList.length > 1) {
            var family = self.familyList[1];
            var family_url = family.figure_url;
            var family_name = family.relation_name + " " + family.user_name;
            self.loadImage(family_url, function (error, image) {
                if(self.familyGo){
                    self.characters.updateFamily(self.familyGo, image, family_name);
                }
                else{
                    self.familyGo = self.characters.addFamily(image, family_name);
                }
            });
        }
    },

    // 保存初始化数据（表示需要进行装扮）
    saveDefaultData: function () {
        this.background.saveDefaultSprite();
        this.ground.saveDefaultSprite();
        this.defaultScreenChilds = this.room.getChildren();
    },
    // 载入控件
    loadControls: function () {
        // 背景
        var ent = Fire.Entity.find('/Room/background');
        this.bgRender = ent.getComponent(Fire.SpriteRenderer);
        this.background = ent.getComponent('Furniture');
        // 地板
        ent = Fire.Entity.find('/Room/ground');
        this.ground = ent.getComponent('Furniture');
        // 房间头节点
        this.room = Fire.Entity.find('/Room');
        // 家具模板
        this.tempFurniture = this.entity.find('Furniture');
        // 平面图模板
        this.tempPlan = this.entity.find('plan');
        // 网络连接
        this.netWorkMgr = this.entity.getComponent('NetworkMgr');
        // 主菜单
        ent = Fire.Entity.find('/Menu_Main');
        this.mainMenuMgr = ent.getComponent('MainMenuMgr');
        // 其他菜单
        ent = Fire.Entity.find('/Menu_Other/Menu_Floor');
        this.floorMenu = ent.getComponent('FloorMenuMgr');
        // 重新请求服务器窗口
        ent = Fire.Entity.find('/Win_NetWork');
        this.netWorkWin = ent.getComponent('NewWorkWindow');
        // 没有用户信息的提示窗口
        this.toKenTipWin = Fire.Entity.find('/Win_TokenTip');
        // 平面图
        ent = Fire.Entity.find('/Win_SwitchRoom');
        this.switchRoomWin = ent.getComponent('SwitchRoomWindow');
        // 加载提示
        ent = Fire.Entity.find('/Tips_load');
        this.loadTips = ent.getComponent('TipLoad');
        // 温馨提示窗口
        ent = Fire.Entity.find('/Tips_window');
        this.tipsWindow = ent.getComponent('TipsWindow');
        //
        ent = Fire.Entity.find('/Characters');
        this.characters = ent.getComponent('Characters');
        //
        ent = Fire.Entity.find('/GlobalData');
        if (ent) {
            this.globalData = ent.getComponent("GlobalData");
        }
    },
    // 下载图片
    loadImage: function (url, callback) {
        var self = this;
        if (self.loadImageList[url]) {
            var image = self.loadImageList[url];
            if (callback) {
                callback(null, image);
            }
            return;
        }
        //self.loadTips.openTips('加载图片中，请稍后...');
        Fire.ImageLoader(url, function (error, image) {
            if (callback) {
                callback(error, image);
            }
            //self.loadTips.closeTips();
            if (image) {
                self.loadImageList[url] = image;
            }
        });
    },
    // 是否需要购买
    hasPay: function () {
        var children = this.room.getChildren();
        for(var i = 0; i < children.length; ++i) {
            var ent = children[i];
            var furniture = ent.getComponent('Furniture');
            if (furniture.price > 0) {
                return true;
            }
        }
        var dressSuit = this.curDressSuit;
        if (dressSuit.price > 0) {
            return true;
        }
        return false;
    },
    // 是否改变了背景与地面的材质
    hasSaveRoom: function () {
        var children = this.room.getChildren();
        if (children.length > 2) {
            return true;
        }
        if (this.background.imageUrl !== this.default_beijing ||
            this.ground.imageUrl !== this.default_diban ) {
            return true;
        }
        return false;
    },
    // 清空场景
    resetScreen: function (callback) {
        var children = this.room.getChildren();
        for (var i = 2; i < children.length; i++) {
            children[i].destroy();
        }
        if (callback) {
            callback();
        }
    },
    // 删除套装
    removeSuit: function () {
        var dressList = this.curDressSuit.funrnitureList;
        if (dressList) {
            for (var i = 0; i < dressList.length; ++i) {
                var com = dressList[i];
                if (com.props_type > 2) {
                    var ent = com.entity;
                    ent.destroy();
                }
            }
        }
        this.curDressSuit = {
            // 套装ID
            suit_id: 0,
            // 套装名称
            suit_name: '',
            // 背包ID
            pack_id: 0,
            // 套装小图
            suit_icon: null,
            // 套装来自哪里，1.背包 2.商城
            suit_from: 1,
            // 套装价格
            price: 0,
            // 折扣
            discount: 1,
            // 家具列表
            funrnitureList: []
        };
    },
    // 保存装扮
    saveRoom: function (callback) {
        var self = this;
        var sendData = {
            suit_id: self.curDressSuit.suit_id,
            suit_from: self.curDressSuit.suit_from,
            dataList: []
        };
        var data = {
            prod_id: 0,
            pack_id: 0,
            prod_uid: 0,
            pos: '',
            rotaion: 0,
            scale: '',
            suit_id: 0
        };
        var children = this.room.getChildren();
        for (var i = 0; i < children.length; i++) {
            var ent = children[i];
            var furniture = ent.getComponent('Furniture');
            data = {
                prod_id: furniture.props_id,
                pack_id: furniture.pack_id,
                prod_uid: furniture.props_uid,
                pos: ent.transform.x + ":" + ent.transform.y,
                rotation: ent.transform.rotation,
                scale: ent.transform.scaleX + ":" + ent.transform.scaleY,
                suit_id: furniture.suit_id
            };
            sendData.dataList.push(data);
        }
        self.netWorkMgr.RequestSaveRoom(sendData, function (serverData) {
            if (serverData.status === 10000) {
                if (callback) {
                    callback(serverData.usercc);
                }
            }
            else {
                self.tipsWindow.openTipsWindow(serverData.desc);
            }
        });
    },
    // 创建家具到场景中
    createFurnitureToScreen: function (dressList, callback) {
        var self = this;
        if (dressList.length === 0 && callback) {
            callback();
            return;
        }
        var index = 0;
        dressList.forEach(function (dress) {
            var entity = null, furniture = null;
            var propsType = parseInt(dress.propsType);
            if (propsType === 1) {
                entity = self.room.find('background');
                furniture = entity.getComponent('Furniture');
                furniture.setFurnitureData(dress, true);
                self.loadTips.openTips('创建图片中，请稍后...');
                self.loadImage(furniture.imageUrl, function (error, image) {
                    self.loadTips.closeTips();
                    if (error) {
                        console.log(error);
                        return;
                    }
                    var bigSprite = new Fire.Sprite(image);
                    furniture.setSprite(bigSprite);
                });
            }
            else if (propsType === 2) {
                entity = self.room.find('ground');
                furniture = entity.getComponent('Furniture');
                furniture.setFurnitureData(dress, true);
                self.loadTips.openTips('创建图片中，请稍后...');
                self.loadImage(furniture.imageUrl, function (error, image) {
                    self.loadTips.closeTips();
                    if (error) {
                        console.log(error);
                        return;
                    }
                    var bigSprite = new Fire.Sprite(image);
                    furniture.setSprite(bigSprite);
                });
            }
            else {
                entity = Fire.instantiate(self.tempFurniture);
                entity.active = true;
                entity.parent = self.room;
                entity.name = dress.propsName;
                // 设置坐标
                var newVec2 = new Fire.Vec2();
                var str = dress.pos.split(":");
                newVec2.x = parseFloat(str[0]);
                newVec2.y = parseFloat(str[1]);
                entity.transform.position = newVec2;
                // 设置角度
                entity.transform.rotation = dress.rotation;
                // 设置大小
                str = dress.scale.split(":");
                newVec2.x = parseFloat(str[0]);
                newVec2.y = parseFloat(str[1]);
                entity.transform.scale = newVec2;
                furniture = entity.getComponent('Furniture');
                furniture.setFurnitureData(dress);
            }
            // 存储套装家具
            if (furniture.suit_id === self.curDressSuit.suit_id) {
                self.curDressSuit.funrnitureList.push(furniture);
            }
        });
        if (callback) {
            callback();
        }
    },
    // 进入房间
    intoRoom: function (sendData, callback) {
        var self = this;
        self.netWorkMgr.RequestIntoHomeData(sendData, function (serverData) {
            if (serverData.status !== 10000) {
                self.tipsWindow.openTipsWindow(serverData.desc);
                if (callback) {
                    callback();
                }
                return ;
            }
            self.floorId = serverData.floorId;
            self.mark = serverData.mark;
            self.house_uid = serverData.house_uid;
            self.room_id = serverData.room_id;
            self.room_name = serverData.room_name;
            self.default_diban = serverData.default_diban;
            self.default_beijing = serverData.default_beijing;
            self.mainMenuMgr.refreshCurHomeType(self.room_name);
            self.mainMenuMgr.refreshCurVillaName(serverData.villa_name);

            self.characters.entity.active = false;
            self.familyList = serverData.family;

            // 获取套装信息
            self.curDressSuit = {
                // 套装ID
                suit_id: parseInt(serverData.suit_id),
                // 背包ID
                pack_id: 0,
                // 套装小图
                suit_icon: null,
                // 套装名称
                suit_name: '',
                // 套装来自哪里，1.背包 2.商城
                suit_from: 1,
                // 套装价格
                price: 0,
                // 折扣
                discount: 1,
                // 套装列表
                funrnitureList: []
            };
            // 清空场景
            self.resetScreen();
            // 创建家具到场景中
            self.createFurnitureToScreen(serverData.dressList, callback);
        });
    }
});
