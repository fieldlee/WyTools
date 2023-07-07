// pages/cut1d/cut1d.js

import {
    stock1DbyLen,
    stock1DByWeight
} from "../../api/apis";

Page({
    data: {
        backTopTheme: 'round',
        backTopText: '顶部',
        solutionCol: {
            columns: [{
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
                    title: '有效宽度'
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
                    key: 'wirst_width',
                    title: '损耗宽度'
                },
                {
                    key: 'wirst_weight',
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
                width: "",
                quantity: "",
                weight: ""
            }, ],
            parents: [{
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
        this.clearDraw();
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
    calcuStockByLen(e) {
        this.setData({
            "cutRules": true
        })
        let prepareData = this.prepareDataToSend1DForRule();
        stock1DbyLen(prepareData).then(response => {
            console.log(response);
            if (response.code == 0) {
                response.data.solutions.forEach((sol) => {
                    if (sol.sub_child_solver.length > 0) {
                        sol.sub_child_solver.forEach((rule) => {
                            rule.width = rule.width / 1000;
                        })
                    }
                    // 计算浪费宽度
                    let worstWidth = 0;
                    sol.solutions.solutions.forEach((sud_sol) => {
                        worstWidth += parseFloat(sud_sol.un_used);
                    });
                    sol.worstWidth = (worstWidth / 1000) + parseFloat(this.data.side);
                });
                if (response.data.solutions.length == 0) {
                    wx.showToast({
                        title: "无有效结果，请重试",
                        mask: true,
                        icon: "error"
                    });
                    return
                }
                this.setData({
                    "mode_data.childs_for_select": response.data.solutions
                });
                console.log(this.data.mode_data.childs_for_select);
                this.displayResult(response);
                return
            }
            wx.showToast({
                title: "计算有误请重试",
                mask: true,
                icon: "error"
            });
        }).catch(err => {
            console.log("err");
            console.log(err);
        });
    },
    calcuStockByWeight(e) {
        this.setData({
            "cutRules": false
        })
        console.log(e);
        let prepareData = this.prepareDataToSend1DForWeight();
        stock1DByWeight(prepareData).then(res => {
            console.log(res);
        }).catch(err => {
            console.log(err);
        });
    },
    prepareDataToSend1DForRule() {
        let newChilds = [];
        this.data.mode_data.childs.forEach((child) => {
            if (isNaN(parseInt(parseFloat(child.width))) == true) {
                wx.showToast({
                    title: "分条数据有误",
                    mask: true,
                    icon: "error"
                });
                return
            }
            newChilds.push({
                "width": parseInt(parseFloat(child.width) * 1000)
            });
        });

        let newParents = [];
        this.data.mode_data.parents.forEach((parent) => {
            if (isNaN(parseInt(parseFloat(parent.width))) == true) {
                wx.showToast({
                    title: "母卷数据有误",
                    mask: true,
                    icon: "error"
                });
                return
            }

            let worst_weight = Math.round((parseFloat(this.data.side) / parseFloat(parent.width)) * (parseFloat(parent.weight) * 1000));
            newParents.push({
                "quantity": parseInt(parent.quantity),
                "width": parseInt(parseFloat(parent.width) * 1000),
                "weight": parseInt(parseFloat(parent.weight) * 1000 - worst_weight)
            });
        });

        return {
            child_rolls: newChilds,
            parent_rolls: newParents,
            side: parseInt(parseFloat(this.data.cutWidth) * 1000),
            out_side: parseInt(parseFloat(this.data.side) * 1000),
            seed: Math.round(Math.random() * 10),
            percent: this.data.percent,
        };
    },
    prepareDataToSend1DForWeight: function () {
        let newChilds = [];
        this.data.mode_data.childs.forEach((child) => {
            newChilds.push({
                "quantity": parseInt(child.quantity),
                "width": parseInt(parseFloat(child.width) * 1000)
            });
        });

        let newParents = [];
        this.data.mode_data.parents.forEach((parent) => {
            let worst_weight = Math.round((parseFloat(this.data.side) / parseFloat(parent.width)) * (parseFloat(parent.weight) * 1000));
            newParents.push({
                "quantity": parseInt(parent.quantity),
                "width": parseFloat(parent.width) * 1000,
                "weight": parseInt(parseFloat(parent.weight) * 1000 - worst_weight)
            });
        });

        return {
            child_rolls: newChilds,
            parent_rolls: newParents,
            side: parseInt(parseFloat(this.data.cutWidth) * 1000),
            out_side: parseInt(parseFloat(this.data.side) * 1000),
            seed: Math.round(Math.random() * 10)
        };
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
    sortBigRolls: function (bigRolls) {
        bigRolls = bigRolls.sort(function (a, b) {
            return a[0] - b[0];
        });
        for (let i = 0; i < bigRolls.length; i++) {
            // 计算子卷的个数和重量
            let unique_arr = Array.from(new Set(bigRolls[i][1]));
            let for_each_unique_arr = Array.from(new Set(bigRolls[i][1]));
            for_each_unique_arr.forEach((j, index_j) => {
                let num = 0;
                let weight = 0;
                bigRolls[i][1].forEach((k, index_k) => {
                    if (j == k) {
                        num += 1;
                        weight += bigRolls[i][3][index_k];
                    }
                })
                unique_arr[index_j] = j + "*" + num + "/" + Math.round(parseFloat(weight) * 1000) / 1000;
            })
            bigRolls[i][3] = unique_arr;
            // 排序
            let smallRolls = bigRolls[i][1];
            smallRolls = smallRolls.sort(function (a, b) {
                return a - b;
            });
            bigRolls[i][1] = smallRolls;
        }
        return bigRolls;
    },
    getPercentageUtilization: function (unusedWidth, list_length) {
        let parentWidth = unusedWidth;
        list_length.forEach((n) => {
            parentWidth += n;
        });
        let usedWidth = Math.abs(parentWidth - unusedWidth);
        let percentage = (usedWidth * 100) / parentWidth;

        percentage *= 100; // preserve 2 digits after decimal
        percentage = Math.round(percentage); // remove the decimal part
        percentage /= 100; // back to original percentage

        return percentage;
    },
    displayResult(response) {
        if (response.data && response.data.status_name) {
            if (response.data.status_name == "Error") {
                wx.showToast({
                    title: "计算错误请重试",
                    mask: true,
                    icon: "error"
                });
                return
            }
        }
        this.data.mode_data.result = response;
        if (this.data.mode_data.result && this.data.mode_data.result.status_name) {
            this.setData({
                "mode_data.result.statusName": this.data.mode_data.result.status_name.toLowerCase()
            })
        }

        if (this.data.cutRules == false) {
            let rolls = [];
            this.data.mode_data.result.data.solutions.forEach((soluton) => {
                let subs = [];
                soluton.subs.forEach((s) => {
                    subs.push(Math.round(parseFloat(s)) / 1000);
                });

                let subs_weight = [];
                soluton.sub_weights.forEach((s) => {
                    subs_weight.push(Math.round(parseFloat(s)) / 1000);
                });
                let all_len = Math.round(parseFloat(soluton.parent_length)) / 1000;
                let all_weight = Math.round(parseFloat(soluton.parent_weight)) / 1000;
                rolls.push([parseFloat(soluton.un_used / 1000), subs, parseFloat(soluton.un_used_weight / 1000), subs_weight, all_len, all_weight]);
            });
            this.setData({
                "mode_data.result.solutions": rolls
            });

            let child_index = 0;
            this.data.mode_data.result.data.sub_weights.forEach((weight) => {
                this.data.mode_data.childs[child_index].weight = parseFloat(weight / 1000);
                child_index += 1;
            });
        } else {
            let rolls = [];
            this.data.mode_data.result.data.solutions.forEach((soluton) => {
                let subs = [];
                soluton.solutions.solutions.forEach((item) => {
                    item.subs.forEach((s) => {
                        subs.push(Math.round(parseFloat(s)) / 1000);
                    });
                });
                let subs_weight = [];

                soluton.solutions.solutions.forEach((item) => {
                    item.sub_weights.forEach((s) => {
                        subs_weight.push(Math.round(parseFloat(s)) / 1000);
                    });
                });
                rolls.push([parseFloat(soluton.un_used / 1000), subs, parseFloat(soluton.un_used_weight / 1000), subs_weight]);
            });
            this.setData({
                "mode_data.result.solutions": rolls
            });
        }
    },
    draw1d() {
        const query = wx.createSelectorQuery()
        query.select('#myCanvas')
            .fields({
                node: true,
                size: true
            })
            .exec((res) => {
                const canvas = res[0].node
                const ctx = canvas.getContext('2d')
                ctx.clearRect(0, 0, canvas.width, canvas.height); //清空画布
                const dpr = wx.getSystemInfoSync().pixelRatio
                canvas.width = res[0].width * dpr
                canvas.height = res[0].height * dpr
                ctx.scale(dpr, dpr)
                const unSortedBigRolls = this.data.mode_data.result.solutions;
                const bigRolls = this.sortBigRolls(unSortedBigRolls);
                const colorDict = this.getColorDict();
                let parentWidth = this.data.mode_data.parents[0].width;
                this.data.mode_data.parents.forEach((item) => {
                    if (item.width > parentWidth) {
                        parentWidth = item.width;
                    }
                });
                console.log(colorDict)
                console.log(this.data.mode_data.result)
                //     let graphWidth = canvas.width;
                //     let xScale = d3
                //     .scaleLinear()
                //     .domain([0, parentWidth])
                //     .range([0, graphWidth]);
                // let yScale = d3
                //     .scaleBand()
                //     .domain(d3.range(bigRolls.length))
                //     // .range([0, 20 * bigRolls.length])
                //     .range([0, 100]);
                //     ctx.fillRect(0, 0, canvas.width, canvas.height)
            })

    },
    clearDraw() {
        const query = wx.createSelectorQuery()
        query.select('#myCanvas')
            .fields({
                node: true,
                size: true
            })
            .exec((res) => {
                const canvas = res[0].node;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            })
    },
    selectSol(e) {
        let idx = parseInt(e.currentTarget.dataset.idx);
        let selectdChild = this.data.mode_data.childs_for_select[idx];
        console.log(selectdChild);
        this.setData({
            "mode_data.result": {
                "data": {
                    "solutions": null,
                    "sub_weights": null
                }
            },
            "mode_data.result.data.solutions": this.data.mode_data.childs_for_select[idx].solutions.solutions,
            "mode_data.result.data.sub_weights": this.data.mode_data.childs_for_select[idx].solutions.sub_weights
        });
        let rolls = [];
        this.data.mode_data.result.data.solutions.forEach((soluton) => {
            let subs = [];
            soluton.subs.forEach((s) => {
                subs.push(Math.round(parseFloat(s)) / 1000);
            });
            let subs_weight = [];
            soluton.sub_weights.forEach((s) => {
                subs_weight.push(Math.round(parseFloat(s)) / 1000);
            });
            let all_len = Math.round(parseFloat(soluton.parent_length)) / 1000;
            let all_weight = Math.round(parseFloat(soluton.parent_weight)) / 1000;
            rolls.push([parseFloat(soluton.un_used / 1000), subs, parseFloat(soluton.un_used_weight / 1000), subs_weight, all_len, all_weight]);
        });
        this.setData({
            "mode_data.result.solutions": rolls
        });
        //计算显示
        let result_data = [];
        let index = 0;
        console.log(this.data.mode_data.result.solutions);
        this.data.mode_data.result.solutions.forEach((sol) => {
            index = index + 1;
            let result = {
                "index": index,
                "effect_width": sol[4],
                "effect_weight": sol[5],
                "use_precent": this.getPercentageUtilization(sol[0], sol[1]) + "%",
                "wirst_width": sol[0],
                "wirst_weight": sol[2],
                "detail": sol[3].join(',')
            };
            result_data.push(result);
        });
        this.setData({
            "resultCol.data": result_data
        });
        console.log(this.data.resultCol.data);
    },
    methods: {

    },
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