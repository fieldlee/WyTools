import {
    stock2DByArea,
    stock2DByWeight
} from "../../api/apis";

Page({
    data: {
        backTopTheme: 'round',
        backTopText: '顶部',
        solutionCol: {
            columns: [{
                key: 'length',
                title: '长度'
            }, {
                key: 'width',
                title: '宽度'
            }, {
                key: 'quantity',
                title: '数量'
            }]
        },
        
        resultCol: {
            columns: [{
                    key: 'index',
                    title: '#',
                    width: 30
                }, {
                    key: 'effect_width',
                    title: '有效面积'
                },
                {
                    key: 'effect_weight',
                    title: '有效重量'
                },
                {
                    key: 'use_precent',
                    title: '使用率'
                },
                {
                    key: 'worst_width',
                    title: '损耗宽度'
                },
                {
                    key: 'worst_weight',
                    title: '损耗重量'
                },
                {
                    key: 'detail',
                    title: '明细(规格*数量/重量)',
                    width: 500
                }
            ],
            data: []
        },
        mode_data: {
            childs: [{
                length: "",
                width: "",
                quantity: "",
                weight: ""
            }, ],
            parents: [{
                length: "",
                width: "",
                quantity: "",
                weight: ""
            }],
            result: null,
            childs_for_select: null,
        },
        cutRules: true,
        cutWidth: 0,
        side: 0,
        percent: 99.0,
        colors: [
            "#f1c40f", // Sun Flower
            "#1abc9c", // Torquise
            "#f39c12", // Orange
            "#2ecc71", // Emerald
            "#27ae60", // Nephritis
            "#e67e22", // Carrot
            "#d35400", // Pumpkin
            "#16a085", // Green Sea
            "#3498db", // Peter River
            "#2980b9", // Belize Hole
            "#e74c3c", // Alizarin
            "#c0392b", // Pomegranate
            "#9b59b6", // Amethyst
            "#8e44ad", // Wisteria
            "#ecf0f1", // Clouds
            '#bdc3c7', // Silver
            '#95a5a6', // Concrete <- Clouds & Silver are close
            '#34495e', // West Asphalt <- don't use because it is very close to Midnight blue
            '#2c3e50', // Midnight Blue <- use for wasted part
        ],
        wasteColor: "#7f8c8d",
    },
    parentAdd(e) {
        this.data.mode_data.parents.push({
            length: "",
            width: "",
            quantity: "",
            weight: ""
        });
        this.setData({
            "mode_data.parents": this.data.mode_data.parents
        })
    },
    onToTop(e) {
        console.log('backToTop', e);
    },
    parentReduce(e) {
        console.log(e);
        if (this.data.mode_data.parents.length > 1) {
            const index = this.data.mode_data.parents.length - 1;
            this.data.mode_data.parents.splice(index, 1);
            this.setData({
                "mode_data.parents": this.data.mode_data.parents
            })
        }

    },
    childAdd(e) {
        this.data.mode_data.childs.push({
            length: "",
            width: "",
            quantity: "",
            weight: ""
        });
        this.setData({
            "mode_data.childs": this.data.mode_data.childs
        })
    },
    childReduce(e) {
        if (this.data.mode_data.childs.length > 1) {
            const index = this.data.mode_data.childs.length - 1;
            this.data.mode_data.childs.splice(index, 1);
            this.setData({
                "mode_data.childs": this.data.mode_data.childs
            })
        }
    },
    handleInputChange(e) {
        // 取出实时的变量值
        let value = e.detail.value;
        let fieldName = e.target.dataset.fieldName;
        this.setData({
            [`${fieldName}`]: value
        });
    },
    getColorDict: function () {
        const bigRolls = this.data.mode_data.result.solutions;
        let uniqueSmallRollsSet = new Set([]);
        for (let i = 0; i < bigRolls.length; i++) {
            const smallRolls = bigRolls[i][1];
            smallRolls.forEach((roll) => {
                uniqueSmallRollsSet.add(roll);
            });
        }

        let uniqueSmallRolls = Array.from(uniqueSmallRollsSet);
        let colorDict = {};

        for (let i = 0; i < uniqueSmallRolls.length; i++) {
            colorDict[uniqueSmallRolls[i]] = this.data.colors[i % this.data.colors.length];
        }
        return colorDict;
    },
    prepareDataToSend2DForRule: function () {
        let newParents = [];
        this.data.mode_data.parents.forEach((parent) => {
            newParents.push({
                "quantity": parseInt(parent.quantity),
                "width": parseFloat(parent.width) * 1000,
                "length": parseFloat(parent.length) * 1000,
                "weight": parseInt(parseFloat(parent.weight) * 1000)
            });
        });
        let newChilds = [];
        this.data.mode_data.childs.forEach((child) => {
            newChilds.push({
                "width": parseInt(parseFloat(child.width) * 1000),
                "length": parseInt(parseFloat(child.length) * 1000)
            });
        });
        return {
            child_areas: newChilds,
            parent_areas: newParents,
            side: parseInt(parseFloat(this.data.cutWidth) * 1000),
            seed: Math.round(Math.random() * 10),
            percent: this.data.percent,
        };
    },
    prepareDataToSend2DForWeight: function (typeCut) {
        let newParents = [];
        let allWeight = 0;
        let allArea = 0;
        let subsArea = 0;
        this.data.mode_data.parents.forEach((parent) => {
            allArea += parseFloat(parent.width) * parseFloat(parent.length) * parseInt(parent.quantity);
            allWeight += parseFloat(parent.weight) * parseInt(parent.quantity);
            newParents.push({
                "quantity": parseInt(parent.quantity),
                "width": parseFloat(parent.width) * 1000,
                "length": parseFloat(parent.length) * 1000,
                "weight": parseInt(parseFloat(parent.weight) * 1000)
            });
        });
        let unitWeight = allWeight / allArea;
        let newChilds = [];
        this.data.mode_data.childs.forEach((child) => {
            let area = parseFloat(child.width) * parseFloat(child.length);
            if (typeCut == "weight") {
                let quantity = parseInt(parseFloat(child.weight) / (area * unitWeight));
                child.quantity = quantity;
            }
            subsArea += area * child.quantity;
            newChilds.push({
                "quantity": parseInt(child.quantity),
                "width": parseInt(parseFloat(child.width) * 1000),
                "length": parseInt(parseFloat(child.length) * 1000)
            });
        });

        if (subsArea >= allArea) {
            wx.showToast({
                title: '分块总面积大于母板面积',
                icon: "error",
                mask: true,
            })
            return false;
        }

        return {
            child_areas: newChilds,
            parent_areas: newParents,
            side: parseInt(parseFloat(this.data.cutWidth) * 1000),
            seed: Math.round(Math.random() * 10),
            percent: parseFloat(this.data.percent),
        };
    },
    sendCutRule: function () {
        this.setData({
            "mode_data.result": null,
            "mode_data.childs_for_select": [],
            "cutRules": false
        });
        // 检查母板的输入参数
        for (let index = 0; index < this.data.mode_data.parents.length; index++) {
            const element = this.data.mode_data.parents[index];
            if ((element.length == null || element.length == 0) || (element.width == null || element.width == 0) || (element.weight == null || element.weight == 0) || (element.quantity == null || element.quantity == 0)) {
                wx.showToast({
                    title: "请输入母板长宽",
                    mask: true,
                    icon: "error"
                });
                return;
            }
        }
        for (let index = 0; index < this.data.mode_data.childs.length; index++) {
            const element = this.data.mode_data.childs[index];
            if ((element.length == null || element.length == 0) || (element.width == null || element.width == 0)) {
                wx.showToast({
                    title: "请输入分块的长宽",
                    mask: true,
                    icon: "error"
                });
                return;
            }
        }

        if (this.data.percent < 90 || this.data.percent > 100) {
            wx.showToast({
                title: "最低使用率大于90%",
                mask: true,
                icon: "error"
            });
        }
        const dataToSend = this.prepareDataToSend2DForRule();
        if (dataToSend == false) {
            return
        }
        console.log(dataToSend);
        wx.showLoading({
            title: '计算中...',
            icon: "loading",
            mask: true,
        });
        stock2DByArea(dataToSend)
            .then((response) => {
                console.log(response);
                wx.hideLoading();
                if (response.code == 0) {
                    if (response.data.solutions.length == 0) {
                        wx.showToast({
                            title: "无有效的方案，请重试",
                            mask: true,
                            icon: "error"
                        });
                        return
                    } else {
                        response.data.solutions.forEach((sol) => {
                            sol.sub_child_solver.forEach((sub) => {
                                sub.width = sub.width / 1000;
                                sub.length = sub.length / 1000;
                            });
                        });
                        this.setData({
                            "mode_data.childs_for_select": response.data.solutions
                        });
                        console.log(this.data.mode_data.childs_for_select);
                    }
                    return
                }
                wx.showToast({
                    title: "计算错误请重试",
                    mask: true,
                    icon: "error"
                });
                return
            })
            .catch((error) => {
                console.log(error);
                wx.hideLoading();
            });
    },
    sendCutSheet: function (e) {
        console.log(e);
        let typeCut = e.currentTarget.dataset.typecut;
        console.log("typeCut", typeCut);
        this.setData({
            "mode_data.result": null,
            "mode_data.childs_for_select": [],
            "cutRules": false
        });
        for (let index = 0; index < this.data.mode_data.parents.length; index++) {
            const element = this.data.mode_data.parents[index];
            if ((element.length == null || element.length == 0) || (element.width == null || element.width == 0) || (element.weight == null || element.weight == 0) || (element.quantity == null || element.quantity == 0)) {
                wx.showToast({
                    title: "请输入母板长宽",
                    mask: true,
                    icon: "error"
                });
                return
            }
        }
        for (let index = 0; index < this.data.mode_data.childs.length; index++) {
            const element = this.data.mode_data.childs[index];
            if ((element.length == null || element.length == 0) || (element.width == null || element.width == 0)) {

                wx.showToast({
                    title: "请输入分块长度",
                    mask: true,
                    icon: "error"
                });
                return;
            }
            if (typeCut == "weight") {
                if (element.weight == null || element.weight == 0) {
                    wx.showToast({
                        title: "请输入分块重量",
                        mask: true,
                        icon: "error"
                    });
                    return;
                }
            }
            if (typeCut == "quantity") {
                if (element.quantity == null || element.quantity == 0) {
                    wx.showToast({
                        title: "请输入分块数量",
                        mask: true,
                        icon: "error"
                    });
                    return;
                }
            }
        }
        const dataToSend = this.prepareDataToSend2DForWeight(typeCut);
        if (dataToSend == false) {
            return
        }
        console.log(dataToSend);
        wx.showLoading({
            title: '计算中...',
            icon: "loading",
            mask: true
        });
        stock2DByWeight(dataToSend)
            .then((response) => {
                console.log(response);
                wx.hideLoading();
                if (response.code == 0) {
                    this.setData({
                        "mode_data.result": response
                    })
                    if (response.data.solutions.length == 0) {
                        wx.showToast({
                            title: "无有效的方案，请重试",
                            mask: true,
                            icon: "error"
                        });
                        return
                    } else {
                        this.displayResult();
                        return
                    }
                }
            })
            .catch((error) => {
                console.log(error);
                wx.hideLoading();
            });
    },
    selectSol(e){
        let idx = parseInt(e.currentTarget.dataset.idx);
        let selectdChild = this.data.mode_data.childs_for_select[idx];
        let child_list = [];
      for (let index = 0; index < selectdChild.sub_child_solver.length; index++) {
        const ele = selectdChild.sub_child_solver[index];
        let child = this.data.mode_data.childs[index];
        child.quantity = ele.quantity;
        child_list.push(child);
      }
      this.setData({
          "mode_data.childs":child_list
      })

      this.setData({
          "rule_selectd_index":idx,
          "mode_data.result":{ "data": { "solutions": null, "sub_weights": null } },
          "mode_data.result.data.solutions":this.data.mode_data.childs_for_select[idx].solutions.solutions
      });
      this.displayResult()
    },
    getRound: function (v, isArea) {
        if (isArea) {
            return Math.round(Math.round(parseFloat(v)) / 1000) / 1000;
        }
        return Math.round(parseFloat(v)) / 1000;
    },
    displayResult: function () {
        let rolls = [];
        this.data.mode_data.result.data.solutions.forEach((soluton) => {
            let subs = [];
            let subs_list = [];
            let unit_value = 1000;
            soluton.subs.forEach((item) => {
                let has = false;
                subs_list.forEach((sub) => {
                    if (sub.area == this.getRound(item.width, false) * this.getRound(item.length, false)) {
                        let w = (this.getRound(item.width, false) * this.getRound(item.length, false) / this.getRound(soluton.used_area, true)) * this.getRound(soluton.used_weight, false);
                        sub.number += 1;
                        sub.weight += Math.round(w * unit_value) / unit_value;
                        has = true;
                    }
                });

                if (has == false) {
                    let w = (this.getRound(item.width, false) * this.getRound(item.length, false) / this.getRound(soluton.used_area, true)) * this.getRound(soluton.used_weight, false);
                    subs_list.push({
                        "area": this.getRound(item.width, false) * this.getRound(item.length, false),
                        "key": this.getRound(item.length, false) + "X" + this.getRound(item.width, false),
                        "number": 1,
                        "weight": Math.round(w * unit_value) / unit_value
                    });
                }

                let tmpItem = {
                    x1: this.getRound(item.x, false),
                    y1: this.getRound(item.y, false),
                    x2: this.getRound(item.x, false) + this.getRound(item.width, false),
                    y2: this.getRound(item.y, false) + this.getRound(item.length, false),
                }
                subs.push(tmpItem);
            });
            let list_str = [];
            subs_list.forEach((s) => {
                list_str.push(s.key + "*" + s.number + "/" + Math.round(parseFloat(s.weight) * unit_value) / unit_value);
            });
            soluton.subs_list = list_str;
            rolls.push(subs);
        });
        this.setData({
            "mode_data.result.solutions": rolls
        })
        console.log("rolls", rolls);
        this.draw2d();
    },
    draw2d: function () {
        // clear old drawing
        this.clearTheDrawing();
        if (!this.data.mode_data.result) {
            return;
        }
        // setColor
        let childItems = []
        this.data.mode_data.childs.forEach((item) => {
            let j = Math.round(Math.random() * this.data.colors.length)
            item.color = this.data.colors[j];
            childItems.push(item);
        });
        // index,effect_width,effect_weight,use_precent,worst_width,worst_weight,detail
        let result_data = [];
        console.log("this.data.mode_data.result",this.data.mode_data.result);
        const solutions = this.data.mode_data.result.solutions;
        for (let i = 0; i < solutions.length; i++) {
            this.drawRect(solutions[i], i + 1);
        }
        const data_solutions = this.data.mode_data.result.data.solutions;
        for (let i = 0; i < data_solutions.length; i++) {
            console.log("data_solutions[i]",data_solutions[i]);
            let resultinfo = {
                "index" : i+1,
                "effect_width": parseInt(data_solutions[i].used_area) /1000/1000,
                "effect_weight" : parseInt(data_solutions[i].used_weight) /1000,
                "use_precent" : parseInt(parseFloat(data_solutions[i].used_area/(data_solutions[i].unused_area+data_solutions[i].used_area))*10000)/100 +"%",
                "worst_width" : parseInt(data_solutions[i].unused_area) /1000 / 1000 ,
                "worst_weight": parseInt(data_solutions[i].unused_weight) /1000,
                "detail" : data_solutions[i].subs_list.join(','),
            };
            result_data.push(resultinfo)
        }
        this.setData({
            "mode_data.childs": childItems,
            "resultCol.data":result_data
        });
        
        
    },
    drawRect: function (sol, index) {
        const parentWidth = parseFloat(this.data.mode_data.parents[index - 1].width);
        const parentHeight = parseFloat(this.data.mode_data.parents[index - 1].length);
        // create svg element:
        let canvas_id = "#myCanvas" + index;
        console.log("canvas_id", canvas_id);
        const query = wx.createSelectorQuery()
        query.select(canvas_id)
            .fields({
                node: true,
                size: true
            })
            .exec((res) => {
                const canvas = res[0].node;
                const ctx = canvas.getContext('2d');
                canvas.width = res[0].width;
                canvas.height = res[0].height;
                // ctx.scale(dpr, dpr);
                ctx.clearRect(0, 0, canvas.width, canvas.height); //清空画布
                ctx.fillStyle = "#7f8c8d";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                let xScale = canvas.width / parentWidth;
                let yScale = canvas.height / parentHeight;

                for (let j = 0; j < sol.length; j++) {
                    const rect = sol[j];
                    let x1 = parseFloat(rect.x1);
                    let y1 = parseFloat(rect.y1);
                    let x2 = parseFloat(rect.x2);
                    let y2 = parseFloat(rect.y2);
                    let tmpColor = "";
                    this.data.mode_data.childs.forEach((item) => {
                        if (((parseInt(item.width) == parseInt(y2 - y1)) && (parseInt(item.length) == parseInt(x2 - x1))) ||
                            ((parseInt(item.width) == parseInt(x2 - x1)) && (parseInt(item.length) == parseInt(y2 - y1)))) {
                            if (tmpColor == "") {
                                tmpColor = item.color;
                            }
                        }
                    });
                    let w = (x2 - x1) * xScale;
                    let h = (y2 - y1) * yScale;
                    x1 = x1 * xScale + 1;
                    y1 = y1 * yScale + 1;
                    ctx.fillStyle = tmpColor;
                    // console.log("tmpColor",tmpColor,"rect",x1, y1, w, h);
                    ctx.fillRect(x1, y1, w, h);
                }
            });
        return;
    },
    clearTheDrawing: function () {
        const query = wx.createSelectorQuery()
        query.select('#myCanvas1')
            .fields({
                node: true,
                size: true
            })
            .exec((res) => {
                const canvas = res[0].node;
                const ctx = canvas.getContext('2d');
                canvas.width = res[0].width
                canvas.height = res[0].height
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            });
        query.select('#myCanvas2')
            .fields({
                node: true,
                size: true
            })
            .exec((res) => {
                const canvas = res[0].node;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            });
        query.select('#myCanvas3')
            .fields({
                node: true,
                size: true
            })
            .exec((res) => {
                const canvas = res[0].node;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            });
        query.select('#myCanvas4')
            .fields({
                node: true,
                size: true
            })
            .exec((res) => {
                const canvas = res[0].node;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            });
    },
    methods: {},
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})