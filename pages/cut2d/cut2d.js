
import {
    stock1DbyLen,
    stock1DByWeight
} from "../../api/apis";
import Toast from 'tdesign-miniprogram/toast/index';

Page({
    data: {
        backTopTheme: 'round',
        backTopText: '顶部',
        solutionCol: {
            columns: [{
                key: 'length',
                title: '长度'
            },{
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
                    title: '宽度'
                },
                {
                    key: 'effect_weight',
                    title: '重量'
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
            length:"",
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