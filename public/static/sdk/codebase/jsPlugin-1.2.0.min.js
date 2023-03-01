(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.JSPlugin = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _tool = __webpack_require__(1);

	var _streamClient = __webpack_require__(2);

	var _JSPlaySDKInterface = __webpack_require__(14);

	var _storage = __webpack_require__(15);

	var _ESCanvas = __webpack_require__(16);

	var _jquery = __webpack_require__(17);

	var _jquery2 = _interopRequireDefault(_jquery);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * @synopsis 插件类
	 *
	 * @param options [IN] ： 插件初始化配置对象
	 *
	 * @note [ADD]新建 by zhangwenkai
	 * @note [Mod]框架重构 by fengzhongjian
	 */

	var JSPlugin = function () {
	    if (typeof Symbol === "undefined") {
	        return;
	    }
	    var that = null;
	    // 常量
	    var ERRORRETURN = -1; //返回失败
	    var TRUERETURN = 0; //返回成功

	    var DECODE_ALL = 0; //解码所有帧
	    var DECODE_VODEO_KEYFRAME = 1; //只解码I帧
	    var MEDIAHEADLENGTH = 40; //媒体头长度
	    var PLAYCTRLRECBUFFER = 1024 * 1024 * 4;

	    //错误码
	    //取流
	    var ERROR_STREAM_TRANS = 1001; //码流传输过程异常
	    var ERROR_STREAM_PLAYBACK_END = 1002; //回放结束
	    var CONNECTION_CLOSED = 1003; //连接被动断开
	    //播放
	    var ERROR_VIDEO_CODING = 2001; //视频编码格式不支持
	    var ERROR_CAPTURE_MEMORY = 2002; //内存不足，抓图失败
	    //存储
	    //const ERROR_MAX_FILE_SIZE = 3001;     //文件大小超限

	    //初始化取流库
	    var oStreamClient = new _streamClient.StreamClient(); //1.0-websockt取流版本号, 0-秘钥套件
	    //初始化转封装库
	    var oStorageManager = null;
	    //jsplugin对象
	    var oJSPlugin = null;

	    //私有成员变量，用Symbol模拟成员变量
	    var OPTIONS = Symbol("OPTIONS"); //构造函数对象参数
	    var CURRENTPLAYRATE = Symbol("CURRENTPLAYRATE"); //当前回放倍速
	    var CURRENTSOUNDWND = Symbol("CURRENTSOUNDWND"); //当前声音开启的窗口索引
	    var MAXWNDNUM = Symbol("MAXWNDNUM"); //最大窗口数目
	    var WNDSTATUSLIST = Symbol("MAXWNDNUM"); //窗口状态列表
	    var DRAWCANVAS = Symbol("DRAWCANVAS"); //视频叠加绘制画布
	    var SHAPEID = Symbol("SHAPEID"); //记录绘制图形的ID
	    var WINDOWFULL = Symbol("WINDOWFULL"); //窗口是否全屏
	    var SINGLEWINDOW = Symbol("SINGLEWINDOW"); //窗口是否全屏
	    var FILETMP = Symbol("FILETMP"); //临时文件
	    var STATUSTMP = Symbol("STATUSTMP"); //临时状态
	    var UPGRADESTATUSURL = Symbol("UPGRADESTATUSURL"); //升级状态url
	    var CURWNDINDEX = Symbol("CURWNDINDEX"); //当前窗口索引
	    var CALLBACKFUNCTION = Symbol("CALLBACKFUNCTION"); //回调函数

	    //监听浏览器标签切换、最小化
	    function listenBrowserVisibility() {
	        document.addEventListener("visibilitychange", function () {
	            if (document.hidden) {
	                for (var i = 0; i < 16; i++) {
	                    if (that[WNDSTATUSLIST][i] && that[WNDSTATUSLIST][i].bLoad) {
	                        that[WNDSTATUSLIST][i].oPlayCtrl.PlayM4_IsVisible(false); //如果tab不在active状态，设置到播放库，不解码
	                    }
	                }
	            } else {
	                for (var _i = 0; _i < 16; _i++) {
	                    if (that[WNDSTATUSLIST][_i] && that[WNDSTATUSLIST][_i].bLoad) {
	                        that[WNDSTATUSLIST][_i].oPlayCtrl.PlayM4_IsVisible(true);
	                    }
	                }
	            }
	        }, false);
	    }

	    //创建插件播放窗口
	    function createWindows(iWidth, iHeight) {
	        if (iWidth && iHeight) {
	            that[OPTIONS].iWidth = iWidth;
	            that[OPTIONS].iHeight = iHeight;
            }
            oJSPlugin = (0, _jquery2.default)("#" + that[OPTIONS].szId);
            iWidth =  that[OPTIONS].iWidth;
            iHeight =  that[OPTIONS].iHeight; 
            try{
                if(that[OPTIONS].iHeight.indexOf("%")>0){
                    iHeight=  oJSPlugin.height() * (that[OPTIONS].iHeight.replace("%",""))/100; 
                }
                if(that[OPTIONS].iWidth.indexOf("%")>0){
                    iWidth=  oJSPlugin.width() * (that[OPTIONS].iWidth.replace("%",""))/100; 
                }
            }catch(e){

            }

	        //计算单个窗口宽高且修正
	        var iFixWidth = iWidth % that[OPTIONS].iCurrentSplit;
	        var iFixHeight = iHeight % that[OPTIONS].iCurrentSplit;
	        var iPerWidth = (iWidth - iFixWidth - that[OPTIONS].iCurrentSplit * 2) / that[OPTIONS].iCurrentSplit;
	        var iPerHeight = (iHeight- iFixHeight - that[OPTIONS].iCurrentSplit * 2) / that[OPTIONS].iCurrentSplit;
	        var iWndWidth = (iWidth - iFixWidth) / that[OPTIONS].iCurrentSplit;
	        var iWndHeight = (iHeight - iFixHeight) / that[OPTIONS].iCurrentSplit;
	        var iType = that[OPTIONS].iCurrentSplit;
	     
	        //构造页面dom
	        var szHtml = '<div class="parent-wnd" style="overflow:hidden;width:100%; height:100%; position: relative;">';
	        for (var i = 0; i < that[MAXWNDNUM]; i++) {

	            iWidth = iPerWidth + (i % iType === iType - 1 ? iFixWidth : 0);
	            iHeight = iPerHeight + (i + iType >= Math.pow(iType, 2) ? iFixHeight : 0);
	            var iPlayWndWidth = iWndWidth + (i % iType === iType - 1 ? iFixWidth : 0);
	            var iPlayWndHeight = iWndHeight + (i + iType >= Math.pow(iType, 2) ? iFixHeight : 0);
	            szHtml += '<div style="float:left; background-color: ' + that[OPTIONS].oStyle.background + '; position: relative; width: ' + iPlayWndWidth + 'px; height: ' + iPlayWndHeight + 'px;">' + '<canvas id="canvas' + i + '" class="play-window" style="border:1px solid ' + that[OPTIONS].oStyle.border + ';" wid="' + i + '" width="' + iWidth + '" height="' + iHeight + '"></canvas>' + '<canvas id="canvas_draw' + i + '"  class="draw-window" style="position:absolute; top:0; left:0;" wid="' + i + '" width=' + iPlayWndWidth + ' height=' + iPlayWndHeight + '></canvas>' + '</div>';
	        }
	        szHtml += "</div>";
	        oJSPlugin.html(szHtml);
	        oJSPlugin.find(".parent-wnd").eq(0).children().eq(0).find(".play-window").eq(0).css("border", "1px solid " + that[OPTIONS].oStyle.borderSelect); //默认选中第一个窗口
	    }

	    //事件回调初始化
	    function initCallbackEvent() {
	        //插件相关事件回调
	        that.EventCallback = function () {
	            return {
	                loadEventHandler: function loadEventHandler() {
	                    window.loadEventHandler && window.loadEventHandler();
	                },
	                zoomEventResponse: function zoomEventResponse() /*iMode, aPoint*/{//电子放大回调
	                    /*if (iMode === 1) {
	                        let szXml = "";
	                        window.ZoomInfoCallback && window.ZoomInfoCallback(szXml);
	                    }*/
	                },
	                windowEventSelect: function windowEventSelect(iWndIndex) {
	                    //插件选中窗口回调
	                    if (that[CURWNDINDEX] === iWndIndex) {
	                        return;
	                    }
	                    that[CURWNDINDEX] = iWndIndex;
	                    if (that[WNDSTATUSLIST][iWndIndex].bEZoom || that[WNDSTATUSLIST][iWndIndex].b3DZoom) {
	                        (0, _jquery2.default)(".draw-window").unbind();
	                        that[DRAWCANVAS].setDrawStatus(false);
	                        that[DRAWCANVAS] = null;
	                        that[DRAWCANVAS] = new _ESCanvas.ESCanvas("canvas_draw" + iWndIndex);
	                        that[DRAWCANVAS].setShapeType("Rect");
	                        that[DRAWCANVAS].setDrawStyle("#ff0000", "", 0);
	                        if (that[WNDSTATUSLIST][iWndIndex].bEZoom) {
	                            that[DRAWCANVAS].setDrawStatus(true, function (oRECT) {
	                                if (oRECT.startPos && oRECT.endPos) {
	                                    if (oRECT.startPos[0] > oRECT.endPos[0]) {
	                                        that[WNDSTATUSLIST][iWndIndex].oPlayCtrl.PlayM4_SetDisplayRegion(null, false);
	                                    } else {
	                                        that[WNDSTATUSLIST][iWndIndex].oPlayCtrl.PlayM4_SetDisplayRegion({
	                                            left: oRECT.startPos[0],
	                                            top: oRECT.startPos[1],
	                                            right: oRECT.endPos[0],
	                                            bottom: oRECT.endPos[1]
	                                        }, true);
	                                    }
	                                }
	                            });
	                        } else if (that[WNDSTATUSLIST][iWndIndex].b3DZoom) {
	                            that[DRAWCANVAS].setDrawStatus(true, function (oRECT) {
	                                that[CALLBACKFUNCTION](oRECT);
	                            });
	                        }
	                    }
	                    window.GetSelectWndInfo && window.GetSelectWndInfo(iWndIndex); //todo暂时先返回窗口号
	                },
	                pluginErrorHandler: function pluginErrorHandler(iWndIndex, iErrorCode, oError) {
	                    //插件错误回调
	                    window.PluginEventHandler && window.PluginEventHandler(iWndIndex, iErrorCode, oError);
	                },
	                windowEventOver: function windowEventOver(iWndIndex) {
	                    window.windowEventOver && window.windowEventOver(iWndIndex);
	                },
	                windowEventOut: function windowEventOut(iWndIndex) {
	                    window.windowEventOut && window.windowEventOut(iWndIndex);
	                },
	                windowEventUp: function windowEventUp(iWndIndex) {
	                    window.windowEventUp && window.windowEventUp(iWndIndex);
	                },
	                windowFullCcreenChange: function windowFullCcreenChange(bFull) {
	                    window.windowFullCcreenChange && window.windowFullCcreenChange(bFull);
	                },
	                firstFrameDisplay: function firstFrameDisplay(iWndIndex) {
	                    window.firstFrameDisplay && window.firstFrameDisplay(iWndIndex);
	                },
	                performanceLack: function performanceLack() {
	                    window.performanceLack && window.performanceLack();
	                }
	            };
	        }();
	    }

	    //事件初始化
	    function initEvent() {
	        //事件回调初始化
	        initCallbackEvent();
	        oJSPlugin.find(".parent-wnd").eq(0).children().each(function (i) {
	            var self = this;
	            (0, _jquery2.default)(self).unbind().bind("mousedown", function () {
	                oJSPlugin.find(".parent-wnd").eq(0).find(".play-window").css("border", "1px solid " + that[OPTIONS].oStyle.border);
	                oJSPlugin.find(".parent-wnd").eq(0).children().eq(i).find(".play-window").eq(0).css("border", "1px solid " + that[OPTIONS].oStyle.borderSelect);
	                that.EventCallback.windowEventSelect(parseInt(oJSPlugin.find(".parent-wnd").eq(0).children().eq(i).find(".play-window").eq(0).attr("wid"), 10));
	            });
	            (0, _jquery2.default)(self).bind("mouseover", function (e) {
	                that.EventCallback.windowEventOver(i);
	                e.stopPropagation();
	            });
	            (0, _jquery2.default)(self).bind("mouseout", function (e) {
	                that.EventCallback.windowEventOut(i);
	                e.stopPropagation();
	            });
	            (0, _jquery2.default)(self).bind("mouseup", function () {
	                that.EventCallback.windowEventUp(i);
	                //e.stopPropagation();  //防止mouseup事件无法冒泡
	            });
	            (0, _jquery2.default)(self).bind("dblclick", function (e) {
	                if (!that[WNDSTATUSLIST][that[CURWNDINDEX]].bPlay) {
	                    return;
	                }
	                var bFullscreen = document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen || false;
	                var element = (0, _jquery2.default)(self).get(0);
	                // if (!bFullscreen) { //多画面全屏有问题，暂时屏蔽
	                //     if (element.requestFullScreen) {
	                //         element.requestFullScreen();
	                //     } else if (element.webkitRequestFullScreen) {
	                //         element.webkitRequestFullScreen();
	                //     } else if (element.mozRequestFullScreen) {
	                //         element.mozRequestFullScreen();
	                //     }
	                //     that[SINGLEWINDOW] = (0, _jquery2.default)(self);
	                // } else {
	                //     if (oJSPlugin.find(".parent-wnd").eq(0).width() === (0, _jquery2.default)(window).width()) {
	                //         return;
	                //     }
	                //     if (document.exitFullscreen) {
	                //         document.exitFullscreen();
	                //     } else if (document.webkitCancelFullScreen) {
	                //         document.webkitCancelFullScreen();
	                //     } else if (document.mozCancelFullScreen) {
	                //         document.mozCancelFullScreen();
	                //     }
	                // }
	                e.stopPropagation();
	            });
	        });
	        //监听全屏变化事件
	        if (typeof document.fullScreen !== "undefined") {
	            document.addEventListener("fullscreenchange", function () {
	                var bFullscreen = document.fullscreen || false;
	                that.EventCallback.windowFullCcreenChange(bFullscreen);
	            });
	        } else if (typeof document.webkitIsFullScreen !== "undefined") {
	            document.addEventListener("webkitfullscreenchange", function () {
	                var bFullscreen = document.webkitIsFullScreen || false;
	                that.EventCallback.windowFullCcreenChange(bFullscreen);
	            });
	        } else if (typeof document.mozFullScreen !== "undefined") {
	            document.addEventListener("mozfullscreenchange", function () {
	                var bFullscreen = document.mozFullScreen || false;
	                that.EventCallback.windowFullCcreenChange(bFullscreen);
	            });
	        }
	    }

	    //更新窗口
	    function updateWnd() {
           	        var iLen = oJSPlugin.find(".parent-wnd").eq(0).children().length;
            var iHeight = that[OPTIONS].iHeight;
            var iWidth = that[OPTIONS].iWidth;
            try{
                oJSPlugin = (0, _jquery2.default)("#" + that[OPTIONS].szId);
                if(iHeight.indexOf("%")>0){
                    iHeight=  oJSPlugin.height() * (iHeight.replace("%",""))/100; 
                }
                if(iWidth.indexOf("%")>0){
                    iWidth=  oJSPlugin.width() * (iWidth.replace("%",""))/100; 
                }
            }catch(e){

            }
	        var iFixWidth = iWidth % that[OPTIONS].iCurrentSplit;
	        var iFixHeight = iHeight % that[OPTIONS].iCurrentSplit;
	        var iPerWidth = (iWidth - iFixWidth - that[OPTIONS].iCurrentSplit * 2) / that[OPTIONS].iCurrentSplit;
	        var iPerHeight = (iHeight - iFixHeight - that[OPTIONS].iCurrentSplit * 2) / that[OPTIONS].iCurrentSplit;
	        var iWndWidth = (iWidth - iFixWidth) / that[OPTIONS].iCurrentSplit;
	        var iWndHeight = (iHeight - iFixHeight) / that[OPTIONS].iCurrentSplit;
	        var iType = that[OPTIONS].iCurrentSplit;
	        for (var i = 0; i < iLen; i++) {
	            var iWidth = iPerWidth + (i % iType === iType - 1 ? iFixWidth : 0);
	            var iHeight = iPerHeight + (i + iType >= Math.pow(iType, 2) ? iFixHeight : 0);
	            var iPlayWndWidth = iWndWidth + (i % iType === iType - 1 ? iFixWidth : 0);
	            var iPlayWndHeight = iWndHeight + (i + iType >= Math.pow(iType, 2) ? iFixHeight : 0);
	            oJSPlugin.find(".parent-wnd").eq(0).children().eq(i).width(iPlayWndWidth);
	            oJSPlugin.find(".parent-wnd").eq(0).children().eq(i).height(iPlayWndHeight);
	            oJSPlugin.find(".parent-wnd").eq(0).children().eq(i).find(".draw-window").attr("width", iPlayWndWidth);
	            oJSPlugin.find(".parent-wnd").eq(0).children().eq(i).find(".draw-window").attr("height", iPlayWndHeight);
	            oJSPlugin.find(".parent-wnd").eq(0).children().eq(i).find(".play-window").attr("width", iWidth);
	            oJSPlugin.find(".parent-wnd").eq(0).children().eq(i).find(".play-window").attr("height", iHeight);
	        }
	        oJSPlugin.find(".parent-wnd").eq(that[CURWNDINDEX]).find(".play-window").css("border", "1px solid " + that[OPTIONS].oStyle.border);
	        oJSPlugin.find(".parent-wnd").eq(that[CURWNDINDEX]).children().eq(0).find(".play-window").eq(0).css("border", "1px solid " + that[OPTIONS].oStyle.borderSelect); //默认选中第一个窗口
	    }

	    //创建播放库worker回调
	    function cbPlayCtrlCallback(szUrl, oParams, iWndNum, szStartTime, szStopTime, resolve, reject) {
	        if (!(0, _jquery2.default)("#" + that[WNDSTATUSLIST][iWndNum].windowID).length) {
	            return;
	        }
	        var bPlayback = false;
	        if (szStartTime && szStopTime) {
	            bPlayback = true;
	        }
	        that[WNDSTATUSLIST][iWndNum].bLoad = true;
	        oStreamClient.openStream(szUrl, oParams, function (data) {
	            if (data.bHead && !that[WNDSTATUSLIST][iWndNum].bPlay) {
	                //判断是否开启预览，用于初始化播放库，回放跳片段是会返回媒体头，不能只判断是否为媒体头
	                that[WNDSTATUSLIST][iWndNum].bPlay = true;
	                that[WNDSTATUSLIST][iWndNum].aHead = new Uint8Array(data.buf);
	                that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_OpenStream(data.buf, MEDIAHEADLENGTH, 1024 * 1024 * 2);
	                if (that[WNDSTATUSLIST][iWndNum].szSecretKey !== "") {
	                    that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_SetSecretKey(1, that[WNDSTATUSLIST][iWndNum].szSecretKey, 128);
	                    that[WNDSTATUSLIST][iWndNum].szSecretKey = "";
	                }
	                if (that[WNDSTATUSLIST][iWndNum].aHead[8] === 4) {
	                    that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_SetStreamOpenMode(0); //设置取流模式   0实时流 1文件流
	                } else {
	                    that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_SetStreamOpenMode(1); //设置取流模式   0实时流 1文件流
	                }
	                that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_SetInputBufSize(PLAYCTRLRECBUFFER);
	                that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_Play(that[WNDSTATUSLIST][iWndNum].windowID);
	            } else {
	                var aBuffer = new Uint8Array(data.buf); //拷贝一份数据进行使用
	                var iBufferLen = that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_GetInputBufSize();
	                var iYUVBufferLen = that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_GetYUVBufSize();
	                if (iYUVBufferLen === 2 && !that[WNDSTATUSLIST][iWndNum].bFirstFrame) {
	                    //渲染yuv的buffer为2才开始绘制
	                    that[WNDSTATUSLIST][iWndNum].bFirstFrame = true;
	                    that.EventCallback.firstFrameDisplay(iWndNum);
	                }
	                var iDecodeType = that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_GetDecodeFrameType();
	                if (iBufferLen > PLAYCTRLRECBUFFER * 0.5 && iBufferLen < PLAYCTRLRECBUFFER * 0.8 && that[WNDSTATUSLIST][iWndNum].iRate === 1) {
	                    if (iDecodeType !== DECODE_VODEO_KEYFRAME && !that[WNDSTATUSLIST][iWndNum].bFrameForward) {
	                        that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_SetDecodeFrameType(DECODE_VODEO_KEYFRAME);
	                        that.EventCallback.performanceLack();
	                    }
	                } else if (iBufferLen >= PLAYCTRLRECBUFFER * 0.8) {
	                    aBuffer = new Uint8Array([0x01, 0x02, 0x03, 0x04]); //超出解码缓冲阈值，停止送流
	                }
	                if (iYUVBufferLen > 10 && iYUVBufferLen < 15 && !that[WNDSTATUSLIST][iWndNum].bFrameForward) {
	                    if (iDecodeType !== DECODE_VODEO_KEYFRAME) {
	                        that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_SetDecodeFrameType(DECODE_VODEO_KEYFRAME);
	                        that.EventCallback.performanceLack();
	                    }
	                } else if (iYUVBufferLen > 15) {
	                    aBuffer = new Uint8Array([0x01, 0x02, 0x03, 0x04]); //超出渲染缓冲阈值，停止送流
	                }
	                if (iYUVBufferLen < 10 && iBufferLen < PLAYCTRLRECBUFFER * 0.5) {
	                    if (iDecodeType !== DECODE_ALL && that[WNDSTATUSLIST][iWndNum].iRate === 1) {
	                        that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_SetDecodeFrameType(DECODE_ALL);
	                    }
	                }
	                if (data.statusString) {
	                    that.EventCallback.pluginErrorHandler(iWndNum, ERROR_STREAM_TRANS, data);
	                } else if (data.type && data.type === "exception") {
	                    that.EventCallback.pluginErrorHandler(iWndNum, ERROR_STREAM_PLAYBACK_END, data);
	                } else {
	                    that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_InputData(aBuffer, aBuffer.length);
	                }
	                aBuffer = null;
	            }
	            if (that[WNDSTATUSLIST][iWndNum].szStorageUUID) {
	                //存在存储ID 则发送数据
	                oStorageManager.inputData(that[WNDSTATUSLIST][iWndNum].szStorageUUID, data.buf);
	            }
	            data = null;
	        }, function () {
	            if (that[WNDSTATUSLIST][iWndNum].bPlay) {
	                that.EventCallback.pluginErrorHandler(iWndNum, CONNECTION_CLOSED);
	                that[WNDSTATUSLIST][iWndNum].bPlay = false;
	                that[WNDSTATUSLIST][iWndNum].bFrameForward = false;
	                that[WNDSTATUSLIST][iWndNum].iRate = 1;
	                if (that[WNDSTATUSLIST][iWndNum].oPlayCtrl) {
	                    that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_Stop();
	                    that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_CloseStream();
	                }
	            }
	        }).then(function (id) {
	            //websocket onopen事件触发
	            that[WNDSTATUSLIST][iWndNum].szStreamUUID = id; //保存取流ID
	            oStreamClient.startPlay(id, szStartTime, szStopTime).then(function () {
	                if (bPlayback) {
	                    that[WNDSTATUSLIST][iWndNum].szPlayType = "playback";
	                    //that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_SetStreamOpenMode(1);  //设置取流模式   0实时流 1文件流
	                    //回放初始设置调整为正常取流速度 设置正常1倍倍率
	                    that[WNDSTATUSLIST][iWndNum].iRate = 1;
	                    that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_PlayRate(that[WNDSTATUSLIST][iWndNum].iRate);
	                } else {
	                    that[WNDSTATUSLIST][iWndNum].szPlayType = "realplay";
	                    //that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_SetStreamOpenMode(0);  //设置取流模式   0实时流 1文件流
	                }
	                resolve();
	            }, function (oError) {
	                //预览取流失败
	                reject(oError);
	            });
	        }, function (oError) {
	            //websocekt 未进入onopen
	            //开启流失败
	            reject(oError);
	        });
	    }

	    //JSDecoder类

	    var JSDecoder = function () {
	        function JSDecoder(options) {
	            _classCallCheck(this, JSDecoder);

	            that = this;
	            //默认参数对象
	            var defaults = {
	                szId: "playWnd", //jsplugin插件对应的界面ID
	                iType: 1,
	                iWidth: 400, //jsplugin宽
	                iHeight: 300, //jsplugin高
	                iMaxSplit: 4, //最大支持分割数
	                iCurrentSplit: 2, //当前分割数
	                szBasePath: "./" //基础路径
	            };
	            this[OPTIONS] = Object.assign(defaults, options); //合并参数
	            var oStyle = {
	                border: "#343434",
	                borderSelect: "#FFCC00",
	                background: "#4C4B4B"
	            };
	            oStyle = Object.assign(oStyle, options.oStyle); //合并样式参数
	            this[OPTIONS].oStyle = oStyle;
	            if (this[OPTIONS].iCurrentSplit > this[OPTIONS].iMaxSplit) {
	                this[OPTIONS].iCurrentSplit = this[OPTIONS].iMaxSplit;
	            }
	            this[CURRENTPLAYRATE] = 1; //单帧之前的倍率
	            this[CURRENTSOUNDWND] = -1; //-1表示当前无窗口开启声音
	            this[MAXWNDNUM] = this[OPTIONS].iMaxSplit * this[OPTIONS].iMaxSplit; //最大窗口数目
	            this[SHAPEID] = ""; //记录绘制图形的id
	            this[WINDOWFULL] = false;
	            this[SINGLEWINDOW] = null;
	            this[FILETMP] = null; //临时文件
	            this[STATUSTMP] = ""; //临时状态
	            this[UPGRADESTATUSURL] = ""; //升级状态url
	            this[CURWNDINDEX] = -1; //当前窗口索引

	            this[CALLBACKFUNCTION] = null; //回调函数

	            //初始化转封装库
	            oStorageManager = new _storage.StorageManager(this[OPTIONS].szBasePath + "/transform");
	            //获取jsplugin对象
	            oJSPlugin = (0, _jquery2.default)("#" + that[OPTIONS].szId);
	            //窗口状态列表
	            this[WNDSTATUSLIST] = [];
	            for (var i = 0; i < this[MAXWNDNUM]; i++) {
	                this[WNDSTATUSLIST][i] = {};
	                this[WNDSTATUSLIST][i].bSelect = false; //窗口是否被选中
	                this[WNDSTATUSLIST][i].bPlay = false; //当前窗口是否在播放状态
                    this[WNDSTATUSLIST][i].bRecord = false; //当前窗口是否在录像状态
                    this[WNDSTATUSLIST][i].bPause = false;
	                this[WNDSTATUSLIST][i].oPlayCtrl = null; //当前窗口绑定的播放库对象
	                this[WNDSTATUSLIST][i].szPlayType = ""; //当前窗口播放类型, realplay/playback
	                this[WNDSTATUSLIST][i].szStorageUUID = ""; //对应窗口存储UUID
	                this[WNDSTATUSLIST][i].szStreamUUID = ""; //对应窗口码流UUID
	                this[WNDSTATUSLIST][i].aHead = []; //当前窗口码流对应的媒体头信息
	                this[WNDSTATUSLIST][i].bLoad = false; //当前窗口js播放库是否已加载
	                this[WNDSTATUSLIST][i].windowID = "canvas" + i; //当前窗口对应的canvas id
	                this[WNDSTATUSLIST][i].drawID = "canvas_draw" + i; //叠加在视频上的画布id
	                this[WNDSTATUSLIST][i].iRate = 1; //当前创建播放倍率
	                this[WNDSTATUSLIST][i].bEZoom = false;
	                this[WNDSTATUSLIST][i].b3DZoom = false;
	                this[WNDSTATUSLIST][i].szSecretKey = ""; //设置秘钥
	                this[WNDSTATUSLIST][i].bFrameForward = false; //单帧
	                this[WNDSTATUSLIST][i].iDecodeType = DECODE_ALL;
	                this[WNDSTATUSLIST][i].bFirstFrame = false;
	            }
	            //监听浏览器视图是否可见
	            listenBrowserVisibility();
	            //创建插件窗口
	            createWindows();
	            //视频叠加绘制画布初始化
	            this[DRAWCANVAS] = new _ESCanvas.ESCanvas("canvas_draw0");
	            if (this[OPTIONS].iType === 0) {
	                (0, _jquery2.default)("#" + that[OPTIONS].szId).hide();
	            }
	            //事件初始化
	            initEvent();
	            that.EventCallback.windowEventSelect(0);
	        }
	        /**
	         * @synopsis 改变窗口类型
	         *
	         * @param {number} iWndType 窗口类型
	         *
	         * @returns {none} 无
	         */


	        _createClass(JSDecoder, [{
	            key: "JS_ArrangeWindow",
	            value: function JS_ArrangeWindow(iWndType) {
	                if (iWndType < that[OPTIONS].iMaxSplit) {
	                    that[OPTIONS].iCurrentSplit = iWndType;
	                } else {
	                    that[OPTIONS].iCurrentSplit = that[OPTIONS].iMaxSplit;
	                }
	                //解决firefox切换画面分割有画面残留的问题;
	                if (_tool.oTool.isFirefox()) {
	                    for (var i = 0; i < that[OPTIONS].iMaxSplit * that[OPTIONS].iMaxSplit; i++) {
	                        if (that[WNDSTATUSLIST][i].oPlayCtrl) {
	                            that[WNDSTATUSLIST][i].oPlayCtrl.PlayM4_ClearCanvas();
	                        }
	                    }
	                }
	                updateWnd();
	                that.EventCallback.windowEventSelect(0);
	            }
	            /**
	             * @synopsis 设置解密秘钥
	             *
	             * @param {number} iWndNum [IN]: 窗口索引
	             * @param {string} szSecretKey [IN]: 秘钥
	             *
	             * @returns {number} 0--成功， -1--失败
	             */

	        }, {
	            key: "JS_SetSecretKey",
	            value: function JS_SetSecretKey(iWndNum, szSecretKey) {
	                if (iWndNum < 0) {
	                    return -1;
	                }
	                if (szSecretKey === "" || typeof szSecretKey === "undefined") {
	                    return -1;
	                }
	                this[WNDSTATUSLIST][iWndNum].szSecretKey = szSecretKey;
	                return 0;
	            }

	            /**
	             * @synopsis 开启回放或预览
	             *
	             * @param {string} szUrl 播放地址
	             * @param {object} oParams 取流参数信息
	             * @param {number} iWndNum 窗口号
	             * @param {string} szStartTime 回放开始时间
	             * @param {string} szStopTime 回放结束时间
	             *
	             * @returns {none} 无
	             */

	        }, {
	            key: "JS_Play",
	            value: function JS_Play(szUrl, oParams, iWndNum, szStartTime, szStopTime) {
	                var oPromise = new Promise(function (resolve, reject) {
	                    if (iWndNum < 0 || iWndNum > that[MAXWNDNUM] - 1) {
	                        //判断窗口号
	                        reject();
	                        return;
	                    }
	                    if (that[WNDSTATUSLIST][iWndNum].bFrameForward) {
	                        //单帧
	                        reject();
	                        return;
	                    }
	                    if (that[WNDSTATUSLIST][iWndNum].bPlay) {
	                        //后续预览回放需要考虑全面
	                        that.JS_Stop(iWndNum);
	                        //reject();
	                        //return;
	                    }
	                    that[WNDSTATUSLIST][iWndNum].bFirstFrame = false;
	                    that[WNDSTATUSLIST][iWndNum].iDecodeType = DECODE_ALL;
	                    //判断当前窗口播放库worker是否已创建
	                    if (that[WNDSTATUSLIST][iWndNum].oPlayCtrl) {
	                        cbPlayCtrlCallback(szUrl, oParams, iWndNum, szStartTime, szStopTime, resolve, reject);
	                    } else {
	                        that[WNDSTATUSLIST][iWndNum].oPlayCtrl = new _JSPlaySDKInterface.JSPlayCtrl(that[OPTIONS].szBasePath + "/playctrl/", function (oParam) {
	                            if (oParam.cmd === "loaded" && !that[WNDSTATUSLIST][iWndNum].bLoad) {
	                                cbPlayCtrlCallback(szUrl, oParams, iWndNum, szStartTime, szStopTime, resolve, reject);
	                            } else if (oParam.cmd === "OnebyOne") {
                                    if (!oParam.status) {
                                        //console.log("oParam.status"+ oParam.status)
	                                    //暂停取流
                                        if (!that[WNDSTATUSLIST][iWndNum].bPause) {
                                            oStreamClient.pause(that[WNDSTATUSLIST][iWndNum].szStreamUUID);
                                            that[WNDSTATUSLIST][iWndNum].bPause = true;
                                        }
	                                } else {
                                        //console.log("oParam.status"+ oParam.status)
	                                     //恢复取流
                                        if (that[WNDSTATUSLIST][iWndNum].bPause) {
                                            oStreamClient.resume(that[WNDSTATUSLIST][iWndNum].szStreamUUID);
                                            that[WNDSTATUSLIST][iWndNum].bPause = false;
                                        }
	                                }
	                            } else if (oParam.cmd === "GetFrameData") {
	                                that.EventCallback.pluginErrorHandler(iWndNum, ERROR_VIDEO_CODING);
	                            }
	                        }, iWndNum);
	                    }
	                });
	                return oPromise;
	            }
	            /**
	             * @synopsis 定位回放
	             *
	             * @param {number} iWndNum 窗口号
	             * @param {string} szStartTime 定位开始时间
	             * @param {string} szStopTime 定位结束时间
	             *
	             * @returns {none} 无
	             */

	        }, {
	            key: "JS_Seek",
	            value: function JS_Seek(iWndNum, szStartTime, szStopTime) {
	                var oPromise = new Promise(function (resolve, reject) {
	                    if (iWndNum < 0 || iWndNum > that[MAXWNDNUM] - 1) {
	                        //判断窗口号
	                        reject();
	                        return;
	                    }
	                    if (!that[WNDSTATUSLIST][iWndNum].bPlay) {
	                        //后续预览回放需要考虑全面
	                        reject();
	                        return;
	                    }
	                    oStreamClient.seek(that[WNDSTATUSLIST][iWndNum].szStreamUUID, szStartTime, szStopTime).then(function () {
	                        resolve();
	                    }, function (oError) {
	                        reject(oError);
	                    });
	                });
	                return oPromise;
	            }

	            /**
	             * @synopsis 获取播放库版本
	             * @returns {string} 播放库版本号
	             */

	        }, {
	            key: "JS_GetSdkVersion",
	            value: function JS_GetSdkVersion() {
	                return that[WNDSTATUSLIST][0].oPlayCtrl.PlayM4_GetSdkVersion();
	            }

	            /**
	             * @synopsis 销毁worker
	             * @returns {none} 无
	             */

	        }, {
	            key: "JS_DestroyWorker",
	            value: function JS_DestroyWorker() {
	                that[WNDSTATUSLIST].forEach(function (obj) {
	                    if (obj.bPlay) {
	                        obj.oPlayCtrl.PlayM4_CloseStream();
	                    }
	                    if (obj.oPlayCtrl) {
	                        obj.oPlayCtrl.PlayM4_Destroy();
	                        obj.oPlayCtrl = null;
	                        obj.bLoad = false;
	                    }
	                });
	            }

	            /**
	             * @synopsis 停止播放或预览
	             *
	             * @param {number} iWndNum 窗口号
	             *
	             * @returns {none} 无
	             */

	        }, {
	            key: "JS_Stop",
	            value: function JS_Stop(iWndNum) {
	                var oPromise = new Promise(function (resolve, reject) {
	                    if (iWndNum < 0 || iWndNum > that[MAXWNDNUM] - 1) {
	                        //判断窗口号
	                        reject();
	                        return;
	                    }
	                    if (that[WNDSTATUSLIST][iWndNum].szStorageUUID) {
	                        //正在录像，先关闭录像进行下载
	                        that.JS_StopSave(iWndNum);
	                    }
	                    if (that[WNDSTATUSLIST][iWndNum].bEZoom) {
	                        that.JS_DisableZoom(iWndNum);
	                    }
	                    if (that[CURRENTSOUNDWND] === iWndNum) {
	                        that[CURRENTSOUNDWND] = -1;
	                    }
	                    oStreamClient.stop(that[WNDSTATUSLIST][iWndNum].szStreamUUID).then(function () {
	                        that[WNDSTATUSLIST][iWndNum].bPlay = false;
	                        that[WNDSTATUSLIST][iWndNum].bFrameForward = false;
	                        that[WNDSTATUSLIST][iWndNum].iRate = 1;
	                        if (that[WNDSTATUSLIST][iWndNum].oPlayCtrl) {
	                            that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_Stop();
	                            that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_CloseStream();
	                        }
	                        setTimeout(function () {
	                            resolve();
	                        }, 500);
	                    }, function () {
	                        setTimeout(function () {
	                            reject();
	                        }, 500);
	                    });
	                });
	                return oPromise;
	            }

	            /**
	             * @synopsis 暂停
	             *
	             * @param {number} iWndNum 窗口号
	             *
	             * @returns {none} 无
	             */

	        }, {
	            key: "JS_Pause",
	            value: function JS_Pause(iWndNum) {
	                var oPromise = new Promise(function (resolve, reject) {
	                    if (iWndNum < 0 || iWndNum > that[MAXWNDNUM] - 1) {
	                        //判断窗口号
	                        reject();
	                        return;
	                    }
	                    if (!that[WNDSTATUSLIST][iWndNum].bPlay) {
	                        //后续预览回放需要考虑全面
	                        reject();
	                        return;
	                    }
	                    if (that[WNDSTATUSLIST][iWndNum].bFrameForward) {
	                        //单帧时不能暂停
	                        reject();
	                        return;
	                    }
	                    //暂停取流
	                    oStreamClient.pause(that[WNDSTATUSLIST][iWndNum].szStreamUUID).then(function () {
                            that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_Pause(true);
                            that[WNDSTATUSLIST][iWndNum].bPause = true;
	                        resolve();
	                    }, function (oError) {
	                        reject(oError);
	                    });
	                });
	                return oPromise;
	            }

	            /**
	             * @synopsis 恢复
	             *
	             * @param {number} iWndNum 窗口号
	             *
	             * @returns {none} 无
	             */

	        }, {
	            key: "JS_Resume",
	            value: function JS_Resume(iWndNum) {
	                var oPromise = new Promise(function (resolve, reject) {
	                    if (iWndNum < 0 || iWndNum > that[MAXWNDNUM] - 1) {
	                        //判断窗口号
	                        reject();
	                        return;
	                    }
	                    if (!that[WNDSTATUSLIST][iWndNum].bPlay) {
	                        //后续预览回放需要考虑全面
	                        reject();
	                        return;
	                    }
	                    //恢复取流
	                    oStreamClient.resume(that[WNDSTATUSLIST][iWndNum].szStreamUUID).then(function () {
	                        if (that[CURRENTPLAYRATE] !== 1) {
	                            that[WNDSTATUSLIST][iWndNum].iRate = that[CURRENTPLAYRATE];
	                            oStreamClient.setPlayRate(that[WNDSTATUSLIST][iWndNum].szStreamUUID, that[WNDSTATUSLIST][iWndNum].iRate);
	                            that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_PlayRate(that[WNDSTATUSLIST][iWndNum].iRate);
	                            if (that[CURRENTPLAYRATE] > 1) {
	                                that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_SetDecodeFrameType(DECODE_VODEO_KEYFRAME);
	                            } else {
	                                that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_SetDecodeFrameType(DECODE_ALL);
	                            }
	                        }
	                        if (that[WNDSTATUSLIST][iWndNum].bFrameForward) {
	                            that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_Play(that[WNDSTATUSLIST][iWndNum].windowID);
	                            that[WNDSTATUSLIST][iWndNum].bFrameForward = false;
	                        } else {
	                            that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_Pause(false); //TODO 添加标识参数
                            }
                            that[WNDSTATUSLIST][iWndNum].bPause = false;
	                        resolve();
	                    }, function (oError) {
	                        reject(oError);
	                    });
	                });
	                return oPromise;
	            }

	            /**
	             * @synopsis 慢放
	             *
	             * @param {number} iWndNum 窗口号
	             *
	             * @returns {none} 无
	             */

	        }, {
	            key: "JS_Slow",
	            value: function JS_Slow(iWndNum) {
	                var oPromise = new Promise(function (resolve, reject) {
	                    if (iWndNum < 0 || iWndNum > that[MAXWNDNUM] - 1) {
	                        //判断窗口号
	                        reject();
	                        return;
	                    }
	                    if (!that[WNDSTATUSLIST][iWndNum].bPlay) {
	                        //后续预览回放需要考虑全面
	                        reject();
	                        return;
	                    }
	                    if (that[WNDSTATUSLIST][iWndNum].szPlayType !== "playback") {
	                        reject();
	                        return;
	                    }
	                    if (that[WNDSTATUSLIST][iWndNum].iRate === -8) {
	                        reject();
	                        return;
	                    }
	                    if (that[WNDSTATUSLIST][iWndNum].bFrameForward) {
	                        //单帧
	                        reject();
	                        return;
	                    }
	                    if (that[WNDSTATUSLIST][iWndNum].iRate < 0 && that[WNDSTATUSLIST][iWndNum].iRate > -8) {
	                        that[WNDSTATUSLIST][iWndNum].iRate *= 2;
	                    }
	                    if (that[WNDSTATUSLIST][iWndNum].iRate === 1) {
	                        that[WNDSTATUSLIST][iWndNum].iRate *= -2;
	                    }
	                    if (that[WNDSTATUSLIST][iWndNum].iRate > 1) {
	                        that[WNDSTATUSLIST][iWndNum].iRate /= 2;
	                    }
	                    oStreamClient.setPlayRate(that[WNDSTATUSLIST][iWndNum].szStreamUUID, that[WNDSTATUSLIST][iWndNum].iRate).then(function () {
	                        if (that[WNDSTATUSLIST][iWndNum].iRate < 2) {
	                            //判断倍速  如果小于0全解  大于0只解I帧
	                            that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_SetDecodeFrameType(DECODE_ALL);
	                        } else {
	                            that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_SetDecodeFrameType(DECODE_VODEO_KEYFRAME);
	                            that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_SetIFrameDecInterval(0);
	                        }
	                        that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_PlayRate(that[WNDSTATUSLIST][iWndNum].iRate);
	                        resolve();
	                    }, function (oError) {
	                        reject(oError);
	                    });
	                });
	                return oPromise;
	            }

	            /**
	             * @synopsis 快放
	             *
	             * @param {number} iWndNum 窗口号
	             *
	             * @returns {none} 无
	             */

	        }, {
	            key: "JS_Fast",
	            value: function JS_Fast(iWndNum) {
	                var oPromise = new Promise(function (resolve, reject) {
	                    if (iWndNum < 0 || iWndNum > that[MAXWNDNUM] - 1) {
	                        //判断窗口号
	                        reject();
	                        return;
	                    }
	                    if (!that[WNDSTATUSLIST][iWndNum].bPlay) {
	                        //后续预览回放需要考虑全面
	                        reject();
	                        return;
	                    }
	                    if (that[WNDSTATUSLIST][iWndNum].szPlayType !== "playback") {
	                        reject();
	                        return;
	                    }
	                    if (that[WNDSTATUSLIST][iWndNum].bFrameForward) {
	                        //单帧
	                        reject();
	                        return;
	                    }
	                    if (that[WNDSTATUSLIST][iWndNum].iRate === 8) {
	                        reject();
	                        return;
	                    }
	                    if (that[WNDSTATUSLIST][iWndNum].iRate === -2) {
	                        that[WNDSTATUSLIST][iWndNum].iRate = 1;
	                    } else if (that[WNDSTATUSLIST][iWndNum].iRate < -2) {
	                        that[WNDSTATUSLIST][iWndNum].iRate /= 2;
	                    } else if (that[WNDSTATUSLIST][iWndNum].iRate > 0 && that[WNDSTATUSLIST][iWndNum].iRate < 8) {
	                        that[WNDSTATUSLIST][iWndNum].iRate *= 2;
	                    }
	                    oStreamClient.setPlayRate(that[WNDSTATUSLIST][iWndNum].szStreamUUID, that[WNDSTATUSLIST][iWndNum].iRate).then(function () {
	                        if (that[WNDSTATUSLIST][iWndNum].iRate < 2) {
	                            //判断倍速  如果小于2全解  大于等于2只解I帧
	                            that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_SetDecodeFrameType(DECODE_ALL);
	                        } else {
	                            that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_SetDecodeFrameType(DECODE_VODEO_KEYFRAME);
	                            if (that[WNDSTATUSLIST][iWndNum].iRate === 8) {
	                                that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_SetIFrameDecInterval(2);
	                            } else {
	                                that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_SetIFrameDecInterval(0);
	                            }
	                        }
	                        that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_PlayRate(that[WNDSTATUSLIST][iWndNum].iRate);
	                        resolve();
	                    }, function (oError) {
	                        reject(oError);
	                    });
	                });
	                return oPromise;
	            }
	            /**
	             * @synopsis 透传
	             *
	             * @param {number} iWndNum 窗口号
	             * @param {string} szCmd 透传的命令码
	             *
	             * @returns {none} 无
	             */

	        }, {
	            key: "JS_Transmission",
	            value: function JS_Transmission(iWndNum, szCmd) {
	                var oPromise = new Promise(function (resolve, reject) {
	                    if (iWndNum < 0 || iWndNum > that[MAXWNDNUM] - 1) {
	                        //判断窗口号
	                        reject();
	                        return;
	                    }
	                    if (!that[WNDSTATUSLIST][iWndNum].szStreamUUID) {
	                        reject();
	                        return;
	                    }
	                    //暂停取流
	                    oStreamClient.transmission(that[WNDSTATUSLIST][iWndNum].szStreamUUID, szCmd).then(function (oResponse) {
	                        resolve(oResponse);
	                    }, function (oError) {
	                        reject(oError);
	                    });
	                });
	                return oPromise;
	            }

	            /**
	             * @synopsis 单帧播放
	             *
	             * @param {number} iWndNum 窗口号
	             *
	             * @returns {none} 无
	             */

	        }, {
	            key: "JS_FrameForward",
	            value: function JS_FrameForward(iWndNum) {
	                var oPromise = new Promise(function (resolve, reject) {
	                    if (iWndNum < 0 || iWndNum > that[MAXWNDNUM] - 1) {
	                        //判断窗口号
	                        reject();
	                        return;
	                    }
	                    if (!that[WNDSTATUSLIST][iWndNum].bPlay) {
	                        //后续预览回放需要考虑全面
	                        reject();
	                        return;
	                    }
	                    if (that[WNDSTATUSLIST][iWndNum].iRate !== 1) {
	                        that[WNDSTATUSLIST][iWndNum].iRate = 1;
	                        that[CURRENTPLAYRATE] = that[WNDSTATUSLIST][iWndNum].iRate;
	                        oStreamClient.setPlayRate(that[WNDSTATUSLIST][iWndNum].szStreamUUID, that[WNDSTATUSLIST][iWndNum].iRate).then(function () {
	                            that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_PlayRate(that[WNDSTATUSLIST][iWndNum].iRate);
	                            that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_SetDecodeFrameType(DECODE_ALL);
	                            that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_OneByOne();
	                            that[WNDSTATUSLIST][iWndNum].bFrameForward = true;
	                        }, function (oError) {
	                            reject(oError);
	                        });
	                    } else {
	                        that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_PlayRate(that[WNDSTATUSLIST][iWndNum].iRate);
	                        that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_SetDecodeFrameType(DECODE_ALL);
	                        that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_OneByOne();
	                        that[WNDSTATUSLIST][iWndNum].bFrameForward = true;
	                    }
	                    resolve();
	                });
	                return oPromise;
	            }

	            /**
	             * @synopsis 获取osd时间
	             *
	             * @param {number} iWndNum 窗口号
	             *
	             * @returns {none} 无
	             */

	        }, {
	            key: "JS_GetOSDTime",
	            value: function JS_GetOSDTime(iWndNum) {
	                var oPromise = new Promise(function (resolve, reject) {
	                    if (iWndNum < 0 || iWndNum > that[MAXWNDNUM] - 1) {
	                        //判断窗口号
	                        reject(ERRORRETURN);
	                        return;
	                    }
	                    if (!that[WNDSTATUSLIST][iWndNum].bPlay) {
	                        //后续预览回放需要考虑全面
	                        reject(ERRORRETURN);
	                        return;
	                    }
	                    var iRet = that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_GetOSDTime(function (szTime) {
	                        var iTime = Date.parse(szTime.replace(/-/g, " ")) / 1000;
	                        resolve(iTime);
	                    });
	                    if (iRet !== 0) {
	                        reject(ERRORRETURN);
	                        return;
	                    }
	                });
	                return oPromise;
	            }

	            /**
	             * @synopsis 开启声音
	             *
	             * @param {number} iWndNum 窗口号
	             *
	             * @returns {none} 无
	             */

	        }, {
	            key: "JS_OpenSound",
	            value: function JS_OpenSound(iWndNum) {
	                if (iWndNum < 0 || iWndNum > that[MAXWNDNUM] - 1) {
	                    //判断窗口号
	                    return ERRORRETURN;
	                }
	                if (!that[WNDSTATUSLIST][iWndNum].bPlay) {
	                    //后续预览回放需要考虑全面
	                    return ERRORRETURN;
	                }
	                if (that[CURRENTSOUNDWND] === iWndNum) {
	                    //点击的窗口已开启声音  无效操作
	                    return ERRORRETURN;
	                }
	                if (that[CURRENTSOUNDWND] !== -1) {
	                    that[WNDSTATUSLIST][that[CURRENTSOUNDWND]].oPlayCtrl.PlayM4_StopSound(); //先关闭原先开启的声音
	                }
	                if (that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_PlaySound(iWndNum) !== 0) {
	                    return ERRORRETURN;
	                }
	                that[CURRENTSOUNDWND] = iWndNum;
	                return TRUERETURN;
	            }

	            /**
	             * @synopsis 获取音量
	             *
	             * @param {number} iWndNum 窗口号
	             * @param {function} cb 获取音量回调
	             *
	             * @returns {none} 无
	             */

	        }, {
	            key: "JS_GetVolume",
	            value: function JS_GetVolume(iWndNum, cb) {
	                that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_GetVolume(function (iVolume) {
	                    cb(iVolume);
	                });
	            }

	            /**
	             * @synopsis 设置音量
	             *
	             * @param {number} iWndNum 窗口号
	             * @param {number} iVolume 需要设置的音量
	             *
	             * @returns {none} 无
	             */

	        }, {
	            key: "JS_SetVolume",
	            value: function JS_SetVolume(iWndNum, iVolume) {
	                if (that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_SetVolume(iVolume) !== 0) {
	                    return ERRORRETURN;
	                }
	                return TRUERETURN;
	            }

	            /**
	             * @synopsis 关闭声音
	             *
	             * @param {number} iWndNum 窗口号
	             *
	             * @returns {none} 无
	             */

	        }, {
	            key: "JS_CloseSound",
	            value: function JS_CloseSound() {
	                var iWndNum = that[CURRENTSOUNDWND];
	                if (iWndNum < 0 || iWndNum > that[MAXWNDNUM] - 1) {
	                    //判断窗口号
	                    return ERRORRETURN;
	                }
	                if (!that[WNDSTATUSLIST][iWndNum].bPlay) {
	                    //后续预览回放需要考虑全面
	                    return ERRORRETURN;
	                }
	                if (that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_StopSound() !== 0) {
	                    return ERRORRETURN;
	                }
	                that[CURRENTSOUNDWND] = -1;
	                return TRUERETURN;
	            }

	            /**
	             * @synopsis 打开电子放大
	             *
	             * @param {number} iWndNum 窗口号
	             * @param {objcet} oRECT 坐标对象{left:0,top:0,right:0,bottom:0}
	             *
	             * @returns {none} 无
	             */

	        }, {
	            key: "JS_EnableZoom",
	            value: function JS_EnableZoom(iWndNum) {
	                if (iWndNum < 0 || iWndNum > that[MAXWNDNUM] - 1) {
	                    //判断窗口号
	                    return ERRORRETURN;
	                }
	                if (!that[WNDSTATUSLIST][iWndNum].bPlay) {
	                    //后续预览回放需要考虑全面
	                    return ERRORRETURN;
	                }
	                (0, _jquery2.default)(".draw-window").unbind();
	                this[DRAWCANVAS] = new _ESCanvas.ESCanvas("canvas_draw" + iWndNum);
	                this[DRAWCANVAS].setShapeType("Rect");
	                this[DRAWCANVAS].setDrawStyle("#ff0000", "", 0);
	                this[DRAWCANVAS].setDrawStatus(true, function (oRECT) {
	                    if (oRECT.startPos && oRECT.endPos) {
	                        if (oRECT.startPos[0] > oRECT.endPos[0]) {
	                            that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_SetDisplayRegion(null, false);
	                        } else {
	                            that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_SetDisplayRegion({
	                                left: oRECT.startPos[0],
	                                top: oRECT.startPos[1],
	                                right: oRECT.endPos[0],
	                                bottom: oRECT.endPos[1]
	                            }, true);
	                        }
	                    }
	                });
	                that[WNDSTATUSLIST][iWndNum].bEZoom = true;
	                return TRUERETURN;
	            }

	            /**
	             * @synopsis 关闭电子放大
	             *
	             * @param {number} iWndNum 窗口号
	             *
	             * @returns {none} 无
	             */

	        }, {
	            key: "JS_DisableZoom",
	            value: function JS_DisableZoom(iWndNum) {
	                if (iWndNum < 0 || iWndNum > that[MAXWNDNUM] - 1) {
	                    //判断窗口号
	                    return ERRORRETURN;
	                }
	                if (!that[WNDSTATUSLIST][iWndNum].bPlay) {
	                    //后续预览回放需要考虑全面
	                    return ERRORRETURN;
	                }
	                this[DRAWCANVAS].setDrawStatus(false);
	                if (this[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_SetDisplayRegion(null, false) !== 0) {
	                    return ERRORRETURN;
	                }
	                this[WNDSTATUSLIST][iWndNum].bEZoom = false;
	                return TRUERETURN;
	            }

	            /**
	             * @synopsis 打开3D放大
	             *
	             * @param {number} iWndNum 窗口号
	             * @param {function} fCallback 回调函数
	             *
	             * @returns {none} 无
	             */

	        }, {
	            key: "JS_Enable3DZoom",
	            value: function JS_Enable3DZoom(iWndNum, fCallback) {
	                if (iWndNum < 0 || iWndNum > that[MAXWNDNUM] - 1) {
	                    //判断窗口号
	                    return ERRORRETURN;
	                }
	                if (!that[WNDSTATUSLIST][iWndNum].bPlay) {
	                    //后续预览回放需要考虑全面
	                    return ERRORRETURN;
	                }
	                (0, _jquery2.default)(".draw-window").unbind();
	                this[CALLBACKFUNCTION] = fCallback;
	                this[DRAWCANVAS] = new _ESCanvas.ESCanvas("canvas_draw" + iWndNum);
	                this[DRAWCANVAS].setShapeType("Rect");
	                this[DRAWCANVAS].setDrawStyle("#ff0000", "", 0);
	                this[DRAWCANVAS].setDrawStatus(true, function (oRECT) {
	                    fCallback(oRECT);
	                });
	                that[WNDSTATUSLIST][iWndNum].b3DZoom = true;
	                return TRUERETURN;
	            }

	            /**
	             * @synopsis 关闭3D放大
	             *
	             * @param {number} iWndNum 窗口号
	             *
	             * @returns {none} 无
	             */

	        }, {
	            key: "JS_Disable3DZoom",
	            value: function JS_Disable3DZoom(iWndNum) {
	                if (iWndNum < 0 || iWndNum > that[MAXWNDNUM] - 1) {
	                    //判断窗口号
	                    return ERRORRETURN;
	                }
	                if (!that[WNDSTATUSLIST][iWndNum].bPlay) {
	                    //后续预览回放需要考虑全面
	                    return ERRORRETURN;
	                }
	                this[DRAWCANVAS].setDrawStatus(false);
	                this[WNDSTATUSLIST][iWndNum].b3DZoom = false;
	                return TRUERETURN;
	            }

	            /**
	             * @synopsis 抓图
	             *
	             * @param {number} iWndNum 窗口号
	             * @param {string} szName 抓图类型
	             * @param {string} szType 文件名称
	             *
	             * @returns {none} 无
	             */

            }, 
            {
	            key: "JS_CapturePictureData",
	            value: function JS_CapturePictureData(iWndNum) {
	                var oPromise = new Promise(function (resolve, reject) {
	                    if (iWndNum < 0 || iWndNum > that[MAXWNDNUM] - 1) {
	                        //判断窗口号
	                        reject();
	                        return;
	                    }
	                    if (!that[WNDSTATUSLIST][iWndNum].bPlay) {
	                        //后续预览回放需要考虑全面
	                        reject();
	                        return;
	                    }
	                    that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_GetBMP(function (oData) {
                            if (oData === 6) {
                                reject(ERROR_CAPTURE_MEMORY);
                            } else {
                                resolve(oData);
                                //  var oBlob = oData;
                                // if (!(oData instanceof Blob || oData instanceof File)) {
                                //     oBlob = new Blob([oData]);
                                // }
                                //  var image = new Image(); 
                                //         image.addEventListener("load", function (evt) {
                                //             URL.revokeObjectURL(evt.target.src);
                                //             document.body.appendChild(image);
                                // resolve(oData);
                                //  });
                                // image.src = URL.createObjectURL(oBlob); 
                            }
                        });
	                });
	                return oPromise;
	            }

	            /**
	             * @synopsis 关闭所有预览
	             *
	             * @param {number} iWndNum 窗口号
	             *
	             * @returns {none} 无
	             */

	        },
            {
	            key: "JS_CapturePicture",
	            value: function JS_CapturePicture(iWndNum, szName, szType) {
	                var oPromise = new Promise(function (resolve, reject) {
	                    if (iWndNum < 0 || iWndNum > that[MAXWNDNUM] - 1) {
	                        //判断窗口号
	                        reject();
	                        return;
	                    }
	                    if (!that[WNDSTATUSLIST][iWndNum].bPlay) {
	                        //后续预览回放需要考虑全面
	                        reject();
	                        return;
	                    }
	                    if (!szType) {
	                        szType = "JPEG";
	                    }
	                    if (szType === "BMP") {
	                        that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_GetBMP(function (aData) {
	                            if (aData === 6) {
	                                reject(ERROR_CAPTURE_MEMORY);
	                            } else {
	                                _tool.oTool.downloadFile(aData, szName + ".BMP");
	                                resolve();
	                            }
	                        });
	                    } else if (szType === "JPEG") {
	                        that[WNDSTATUSLIST][iWndNum].oPlayCtrl.PlayM4_GetJPEG(function (aData) {
	                            if (aData === 6) {
	                                reject(ERROR_CAPTURE_MEMORY);
	                            } else {
	                                _tool.oTool.downloadFile(aData, szName + ".jpeg");
	                                resolve();
	                            }
	                        });
	                    }
	                });
	                return oPromise;
	            }

	            /**
	             * @synopsis 关闭所有预览
	             *
	             * @param {number} iWndNum 窗口号
	             *
	             * @returns {none} 无
	             */

	        }, {
	            key: "JS_StopRealPlayAll",
	            value: function JS_StopRealPlayAll() {
	                //停止所有取流
	                oStreamClient.stopAll();
	                that[WNDSTATUSLIST].forEach(function (obj, index) {
	                    if (obj.bPlay) {
	                        if (obj.szStorageUUID) {
	                            //正在录像，先关闭录像进行下载
	                            that.JS_StopSave(index);
	                        }
	                        if (obj.bEZoom) {
	                            that.JS_DisableZoom(index);
	                        }
	                        obj.oPlayCtrl.PlayM4_Stop();
	                        obj.oPlayCtrl.PlayM4_CloseStream();
	                    }
	                    obj.bPlay = false;
	                });
	                that[CURRENTSOUNDWND] = -1;
	            }

	            /**
	             * @synopsis 开始录像
	             *
	             * @param {number} iWndNum 窗口号
	             * @param {string} szFileName 文件名
	             *
	             * @returns {none} 无
	             */

	        }, {
	            key: "JS_StartSave",
	            value: function JS_StartSave(iWndNum, szFileName) {
	                var oPromise = new Promise(function (resolve, reject) {
	                    if (iWndNum < 0 || iWndNum > that[MAXWNDNUM] - 1) {
	                        //判断窗口号
	                        reject();
	                        return;
	                    }
	                    if (!that[WNDSTATUSLIST][iWndNum].bPlay) {
	                        //后续预览回放需要考虑全面
	                        reject();
	                        return;
	                    }
	                    if (szFileName.indexOf(".mp4") < 0) {
	                        szFileName = szFileName + ".mp4";
	                    }
	                    var aData = that[WNDSTATUSLIST][iWndNum].aHead;
	                    var iType = 0;
	                    if (that[WNDSTATUSLIST][iWndNum].szPlayType === "playback") {
	                        iType = 1;
	                    }
	                    oStorageManager.startRecord(szFileName, aData, 2, iType, {
	                        cbEventHandler: function cbEventHandler(iErrorType) {
	                            that.EventCallback.pluginErrorHandler(iWndNum, iErrorType);
	                        }
	                    }).then(function (szUUID) {
	                        that[WNDSTATUSLIST][iWndNum].szStorageUUID = szUUID;
	                        resolve();
	                    }, function () {
	                        reject();
	                    });
	                });
	                return oPromise;
	            }

	            /**
	             * @synopsis 开始录像
	             *
	             * @param {number} iWndNum 窗口号
	             *
	             * @returns {none} 无
	             */

	        }, {
	            key: "JS_StopSave",
	            value: function JS_StopSave(iWndNum) {
	                var oPromise = new Promise(function (resolve, reject) {
	                    if (!that[WNDSTATUSLIST][iWndNum].szStorageUUID) {
	                        //存在存储ID 则发送数据
	                        reject();
	                        return;
	                    }
	                    oStorageManager.stopRecord(that[WNDSTATUSLIST][iWndNum].szStorageUUID).then(function () {
	                        that[WNDSTATUSLIST][iWndNum].szStorageUUID = ""; //关闭录像  删除存储ID
	                        resolve();
	                    }, function (iError) {
	                        reject(iError);
	                    });
	                });
	                return oPromise;
	            }
	        }, {
	            key: "JS_GetLocalConfig",
	            value: function JS_GetLocalConfig() {
	                return "";
	            }
	        }, {
	            key: "JS_SetLocalConfig",
	            value: function JS_SetLocalConfig() /*szXml*/{
	                return true;
	            }
	            /*绘图接口,json格式 ---------------------------------------------------- begin*/

	        }, {
	            key: "JS_SetGridInfo",
	            value: function JS_SetGridInfo(oGrid) {
	                /*
	                    oGrid = {
	                        style: {
	                            drawColor: "#ff0000"
	                        },
	                        gridColNum: 22,
	                        gridRowNum: 18,
	                        gridMap: "0000000000000000000000000001c00001c01fe1c01fe1c01fe1c01fe1c01fe0001fe0001fe000000000000f80000000000000000000"
	                    }
	                */
	                if (oGrid === null || typeof oGrid === 'undefined') {
	                    return -1;
	                }
	                var szDrawColor = "#ff0000";
	                if (oGrid.style && oGrid.style.drawColor) {
	                    szDrawColor = oGrid.style.drawColor;
	                }
	                this[DRAWCANVAS].setDrawStyle(szDrawColor);
	                this[DRAWCANVAS].setShapesInfoByType("Grid", [{
	                    szGridMap: oGrid.gridMap,
	                    iGridColNum: oGrid.gridColNum,
	                    iGridRowNum: oGrid.gridRowNum
	                }]);
	                return 0;
	            }
	        }, {
	            key: "JS_GetGridInfo",
	            value: function JS_GetGridInfo() {
	                if (!this[DRAWCANVAS]) {
	                    return {};
	                }
	                var oShape = this[DRAWCANVAS].getShapesInfoByType("Grid")[0];
	                if (!oShape) {
	                    return {
	                        iGridRowNum: 18,
	                        iGridColNum: 22,
	                        szGridMap: ""
	                    };
	                }
	                return {
	                    gridColNum: oShape.iGridColNum,
	                    gridRowNum: oShape.iGridRowNum,
	                    gridMap: oShape.szGridMap
	                };
	            }
	        }, {
	            key: "JS_SetDrawShapeInfo",
	            value: function JS_SetDrawShapeInfo(szType, oInfo) {
	                if (typeof szType === "undefined" || szType === "") {
	                    return -1;
	                }
	                this[DRAWCANVAS].setShapeType(szType);
	                if (oInfo.style) {
	                    this[DRAWCANVAS].setDrawStyle(oInfo.style.szDrawColor || "", oInfo.style.szFillColor || "", oInfo.style.iTranslucent || 0);
	                }
	                if (oInfo.iMaxShapeSupport && oInfo.iMaxShapeSupport > 0) {
	                    this[DRAWCANVAS].setMaxShapeSupport(oInfo.iMaxShapeSupport);
	                }
	                this[DRAWCANVAS].setCurrentShapeInfo({
                        szId: oInfo.id,
                        szTips: oInfo.tips,
                        iMinClosed: 3,
                        iMaxPointNum: oInfo.iMaxPointSupport,
                        iPolygonType: 1,
                        szDrawColor: oInfo.style.szDrawColor || "",
                        szFillColor: oInfo.style.szFillColor || "",
                        iTranslucent: oInfo.style.iTranslucent || 0
                    });
	            }
	        }, {
	            key: "JS_SetPolygonInfo",
	            value: function JS_SetPolygonInfo(aPolygons) {
	                // to do
	                /*aPolygons = [{
	                      iEditType: iEditType,
	                      aPoint: aPoint,
	                      bClosed: bClosed,
	                      szTips: szTips,
	                      style: {
	                          szDrawColor: szDrawColor,
	                          szFillColor: szFillColor,
	                          iTranslucent: iTranslucent
	                      }
	                  }]
	                */
	                if (typeof aPolygons === "undefined" || !aPolygons.length) {
	                    return -1;
	                }
	                var aShapesInfo = [];
	                if (aPolygons.length > 0) {
	                    for (var i = 0, iLen = aPolygons.length; i < iLen; i++) {
	                        var aPoint = aPolygons[i].aPoint;
	                        if (aPoint.length > 0) {
	                            aShapesInfo.push(aPolygons[i]);
	                        }
	                    }
	                }
	                if (aShapesInfo.length > 0) {
	                    this[DRAWCANVAS].setShapesInfoByType("Polygon", aShapesInfo);
	                    return 0;
	                }
	                return -1;
	            }
	        }, {
	            key: "JS_GetPolygonInfo",
	            value: function JS_GetPolygonInfo() {
	                var aShapesInfo = [];
	                var aShapes = this[DRAWCANVAS].getShapesInfoByType("Polygon");
	                for (var i = 0, iLen = aShapes.length; i < iLen; i++) {
	                    var oShape = aShapes[i];
	                    var oPolygon = {
	                        aPoint: oShape.aPoint,
	                        bClosed: oShape.bClosed,
                            szTips: oShape.szTips,
                            id:oShape.szId,
                            szDrawColor:oShape.szDrawColor
	                    };
	                    aShapesInfo.push(oPolygon);
	                }
	                return aShapesInfo;
	            }
	        }, {
	            key: "JS_SetLineInfo",
	            value: function JS_SetLineInfo(aLines) {
	                // to do
	                /*aLines = [{
	                    iLineType: iLineType,
	                    aPoint: aPoint,
	                    szTips: szTips,
	                    iDirection: iDirection,
	                    style: {
	                        szDrawColor: szDrawColor
	                    }
	                  }]
	                */
	                if (typeof aLines === "undefined" || !aLines.length) {
	                    return -1;
	                }
	                var aShapesInfo = [];
	                if (aLines.length > 0) {
	                    for (var i = 0, iLen = aLines.length; i < iLen; i++) {
	                        var aPoint = aLines[i].aPoint;
	                        if (aPoint.length > 0) {
	                            aShapesInfo.push(aLines[i]);
	                        }
	                    }
	                }
	                if (aShapesInfo.length > 0) {
	                    this[DRAWCANVAS].setShapesInfoByType("Line", aShapesInfo);
	                    return 0;
	                }
	                return -1;
	            }
	        }, {
	            key: "JS_GetLineInfo",
	            value: function JS_GetLineInfo() {
	                var aShapesInfo = [];
	                var aShapes = this[DRAWCANVAS].getShapesInfoByType("Line");
	                for (var i = 0, iLen = aShapes.length; i < iLen; i++) {
	                    var oShape = aShapes[i];
	                    var oLine = {
	                        iLineType: oShape.iLineType,
	                        aPoint: oShape.aPoint,
	                        szTips: oShape.szTips
	                    };
	                    aShapesInfo.push(oLine);
	                }
	                return aShapesInfo;
	            }
	        }, {
	            key: "JS_SetRectInfo",
	            value: function JS_SetRectInfo(aRects) {
	                /*aRects = [{
	                      iEditType: iEditType,
	                      aPoint: aPoint,
	                      szTips: szTips,
	                      style: {
	                          szDrawColor: szDrawColor,
	                          szFillColor: szFillColor,
	                          iTranslucent: iTranslucent
	                      }
	                  }]
	                */
	                if (typeof aRects === "undefined" || !aRects.length) {
	                    return -1;
	                }
	                var aShapesInfo = [];
	                if (aRects.length > 0) {
	                    for (var i = 0, iLen = aRects.length; i < iLen; i++) {
	                        var aPoint = aRects[i].aPoint;
	                        if (aPoint.length > 0) {
	                            aShapesInfo.push(aRects[i]);
	                        }
	                    }
	                }
	                if (aShapesInfo.length > 0) {
	                    this[DRAWCANVAS].setShapesInfoByType("Rect", aShapesInfo);
	                    return 0;
	                }
	                return -1;
	            }
	        }, {
	            key: "JS_GetRectInfo",
	            value: function JS_GetRectInfo() {
	                var aShapesInfo = [];
	                var aShapes = this[DRAWCANVAS].getShapesInfoByType("Rect");
	                for (var i = 0, iLen = aShapes.length; i < iLen; i++) {
	                    var oShape = aShapes[i];
	                    var oRect = {
	                        aPoint: oShape.aPoint,
	                        szTips: oShape.szTips
	                    };
	                    aShapesInfo.push(oRect);
	                }
	                return aShapesInfo;
	            }
	            /*绘图接口,json格式 --- end*/

	        }, {
	            key: "JS_SetRegionInfo",
	            value: function JS_SetRegionInfo(szXml) {
	                var _this = this;

	                this[DRAWCANVAS].clearAllShape();
	                var oXmlDoc = _tool.oTool.parseXmlFromStr(szXml);
	                this[DRAWCANVAS].setDrawStyle("#ff0000", "#343434", 0.3);
	                if ((0, _jquery2.default)(oXmlDoc).find("DetectionRegionInfo").length > 0) {
	                    (function () {
	                        _this[DRAWCANVAS].setShapeType("Rect");
	                        var iMax = parseInt((0, _jquery2.default)(oXmlDoc).find("MaxRegionNum").eq(0).text(), 10);
	                        _this[DRAWCANVAS].setMaxShapeSupport(iMax);
	                        _this[DRAWCANVAS].m_szDisplayMode = (0, _jquery2.default)(oXmlDoc).find("DisplayMode").eq(0).text();
	                        _this[DRAWCANVAS].m_szVideoFormat = (0, _jquery2.default)(oXmlDoc).find("videoFormat").eq(0).text();
	                        _this[DRAWCANVAS].m_iHorizontalResolution = parseInt((0, _jquery2.default)(oXmlDoc).find("HorizontalResolution").eq(0).text(), 10);
	                        _this[DRAWCANVAS].m_iVerticalResolution = parseInt((0, _jquery2.default)(oXmlDoc).find("VerticalResolution").eq(0).text(), 10);
	                        var aShapesInfo = [];
	                        (0, _jquery2.default)(oXmlDoc).find("DetectionRegion").each(function () {
	                            var aPoint = [];
	                            for (var j = 0, iLen = (0, _jquery2.default)(this).find("positionX").length; j < iLen; j++) {
	                                var iPointX = Math.round((0, _jquery2.default)(this).find("positionX").eq(j).text()) * that[DRAWCANVAS].m_iCanvasWidth / that[DRAWCANVAS].m_iHorizontalResolution;
	                                var iPointY = (that[DRAWCANVAS].m_iVerticalResolution - Math.round((0, _jquery2.default)(this).find("positionY").eq(j).text())) * that[DRAWCANVAS].m_iCanvasHeight / that[DRAWCANVAS].m_iVerticalResolution;
	                                aPoint.push([iPointX, iPointY]);
	                            }
	                            if (aPoint.length > 0 && !(aPoint[0][0] === 0 && aPoint[1][0] === 0 && aPoint[2][0] === 0 && aPoint[3][0] === 0)) {
	                                aShapesInfo.push({
	                                    aPoint: aPoint,
	                                    iEditType: that[DRAWCANVAS].m_szDisplayMode === "transparent" ? 1 : 0
	                                });
	                            }
	                        });
	                        _this[DRAWCANVAS].setShapesInfoByType("Rect", aShapesInfo);
	                    })();
	                } else if ((0, _jquery2.default)(oXmlDoc).find("MoveDetection").length > 0) {
	                    this[DRAWCANVAS].setShapeType("Grid");
	                    var iGridColNum = parseInt((0, _jquery2.default)(oXmlDoc).find("columnGranularity").eq(0).text(), 10);
	                    var iGridRowNum = parseInt((0, _jquery2.default)(oXmlDoc).find("rowGranularity").eq(0).text(), 10);
	                    var szGridMap = (0, _jquery2.default)(oXmlDoc).find("gridMap").eq(0).text();
	                    this[DRAWCANVAS].setShapesInfoByType("Grid", [{
	                        szGridMap: szGridMap,
	                        iGridColNum: iGridColNum,
	                        iGridRowNum: iGridRowNum
	                    }]);
	                }
	                return 0;
	            }
	        }, {
	            key: "JS_GetRegionInfo",
	            value: function JS_GetRegionInfo() {
	                if (!this[DRAWCANVAS]) {
	                    return "";
	                }
	                var szShapeType = this[DRAWCANVAS].getShapeType();
	                var szXml = '<?xml version="1.0" encoding="utf-8"?>';
	                if (szShapeType === "Rect") {
	                    szXml += '<DetectionRegionInfo>';
	                    szXml += '<videoFormat>' + this[DRAWCANVAS].m_szVideoFormat + '</videoFormat><RegionType>roi</RegionType>';
	                    szXml += '<ROI><HorizontalResolution>' + this[DRAWCANVAS].m_iHorizontalResolution + '</HorizontalResolution><VerticalResolution>' + this[DRAWCANVAS].m_iVerticalResolution + '</VerticalResolution></ROI>';
	                    szXml += '<DisplayMode>' + this[DRAWCANVAS].m_szDisplayMode + '</DisplayMode><MaxRegionNum>' + this[DRAWCANVAS].getMaxShapeSupport() + '</MaxRegionNum>';
	                    szXml += '<DetectionRegionList>';
	                    var aShapes = this[DRAWCANVAS].getShapesInfoByType("Rect");
	                    for (var i = 0, len = aShapes.length; i < len; i++) {
	                        var aPoint = aShapes[i].aPoint;
	                        szXml += '<DetectionRegion><RegionCoordinatesList>';
	                        szXml += '<RegionCoordinates><positionX>' + Math.round(aPoint[3][0] * this[DRAWCANVAS].m_iHorizontalResolution / this[DRAWCANVAS].m_iCanvasWidth) + '</positionX><positionY>' + (this[DRAWCANVAS].m_iVerticalResolution - Math.round(aPoint[3][1] * this[DRAWCANVAS].m_iVerticalResolution / this[DRAWCANVAS].m_iCanvasHeight)) + '</positionY></RegionCoordinates>';
	                        szXml += '<RegionCoordinates><positionX>' + Math.round(aPoint[2][0] * this[DRAWCANVAS].m_iHorizontalResolution / this[DRAWCANVAS].m_iCanvasWidth) + '</positionX><positionY>' + (this[DRAWCANVAS].m_iVerticalResolution - Math.round(aPoint[2][1] * this[DRAWCANVAS].m_iVerticalResolution / this[DRAWCANVAS].m_iCanvasHeight)) + '</positionY></RegionCoordinates>';
	                        szXml += '<RegionCoordinates><positionX>' + Math.round(aPoint[1][0] * this[DRAWCANVAS].m_iHorizontalResolution / this[DRAWCANVAS].m_iCanvasWidth) + '</positionX><positionY>' + (this[DRAWCANVAS].m_iVerticalResolution - Math.round(aPoint[1][1] * this[DRAWCANVAS].m_iVerticalResolution / this[DRAWCANVAS].m_iCanvasHeight)) + '</positionY></RegionCoordinates>';
	                        szXml += '<RegionCoordinates><positionX>' + Math.round(aPoint[0][0] * this[DRAWCANVAS].m_iHorizontalResolution / this[DRAWCANVAS].m_iCanvasWidth) + '</positionX><positionY>' + (this[DRAWCANVAS].m_iVerticalResolution - Math.round(aPoint[0][1] * this[DRAWCANVAS].m_iVerticalResolution / this[DRAWCANVAS].m_iCanvasHeight)) + '</positionY></RegionCoordinates>';
	                        szXml += '</RegionCoordinatesList></DetectionRegion>';
	                    }
	                    szXml += '</DetectionRegionList>';
	                    szXml += '</DetectionRegionInfo>';
	                } else if (szShapeType === "Grid") {
	                    var oShape = this[DRAWCANVAS].getShapesInfoByType("Grid")[0];
	                    if (!oShape) {
	                        oShape = {
	                            iGridRowNum: 18,
	                            iGridColNum: 22,
	                            szGridMap: ""
	                        };
	                    }
	                    szXml += '<MoveDetection><videoFormat>PAL</videoFormat><RegionType>grid</RegionType>';
	                    szXml += '<Grid><rowGranularity>' + oShape.iGridRowNum + '</rowGranularity><columnGranularity>' + oShape.iGridColNum + '</columnGranularity></Grid>';
	                    szXml += '<DisplayMode>transparent</DisplayMode>';
	                    szXml += '<gridMap>' + oShape.szGridMap + '</gridMap></MoveDetection>';
	                }
	                return szXml;
	            }
	        }, {
	            key: "JS_SetDrawStatus",
	            value: function JS_SetDrawStatus(bDraw) {
	                if (!this[DRAWCANVAS]) {
	                    return -1;
	                }
	                this[DRAWCANVAS].setDrawStatus(bDraw);
	                return 0;
	            }
	        }, {
	            key: "JS_ClearRegion",
	            value: function JS_ClearRegion() {
	                if (!this[DRAWCANVAS]) {
	                    return -1;
	                }
	                this[DRAWCANVAS].clearAllShape();
	                return 0;
	            }
	        }, {
	            key: "JS_GetTextOverlay",
	            value: function JS_GetTextOverlay() {
	                if (!this[DRAWCANVAS]) {
	                    return "";
	                }
	                var szXml = '<?xml version="1.0" encoding="utf-8"?>';
	                szXml += '<OSD>';
	                szXml += '<videoResolutionWidth>' + this[DRAWCANVAS].m_iHorizontalResolution + '</videoResolutionWidth>';
	                szXml += '<videoResolutionHeight>' + this[DRAWCANVAS].m_iVerticalResolution + '</videoResolutionHeight>';
	                var szOverlayDate = "";
	                var szOverlayChName = "";
	                var szOverlayText = "";
	                var aShapes = this[DRAWCANVAS].getShapesInfoByType("RectOSD");
	                for (var i = 0, len = aShapes.length; i < len; i++) {
	                    var oOSD = aShapes[i];
	                    var szPositionX = Math.round(oOSD.iPositionX * this[DRAWCANVAS].m_iHorizontalResolution / this[DRAWCANVAS].m_iCanvasWidth);
	                    var szPositionY = Math.round(oOSD.iPositionY * this[DRAWCANVAS].m_iVerticalResolution / this[DRAWCANVAS].m_iCanvasHeight);
	                    if (oOSD.szOSDType === "overlay-date") {
	                        szOverlayDate += '<DateTimeOverlay><Type>' + oOSD.szDateStyle + '</Type>';
	                        szOverlayDate += '<clockType>' + oOSD.szClockType + '</clockType>';
	                        szOverlayDate += '<displayWeek>' + oOSD.szDisplayWeek + '</displayWeek>';
	                        szOverlayDate += '<enabled>' + oOSD.szEnabled + '</enabled>';
	                        szOverlayDate += '<positionX>' + szPositionX + '</positionX><positionY>' + szPositionY + '</positionY></DateTimeOverlay>';
	                    } else if (oOSD.szOSDType === "overlay-ch") {
	                        szOverlayChName += '<channelNameOverlay><enabled>' + oOSD.szEnabled + '</enabled>';
	                        szOverlayChName += '<ChannelName>' + oOSD.szText + '</ChannelName>';
	                        szOverlayChName += '<positionX>' + szPositionX + '</positionX><positionY>' + szPositionY + '</positionY></channelNameOverlay>';
	                    } else if (oOSD.szOSDType === "overlay-text") {
	                        szOverlayText += '<TextOverlay><id>' + oOSD.szId + '</id><enabled>' + oOSD.szEnabled + '</enabled>';
	                        szOverlayText += '<displayText>' + oOSD.szText + '</displayText>';
	                        szOverlayText += '<positionX>' + szPositionX + '</positionX><positionY>' + szPositionY + '</positionY></TextOverlay>';
	                    }
	                }
	                szXml += szOverlayDate;
	                szXml += szOverlayChName;
	                szXml += "<TextOverlayList>";
	                szXml += szOverlayText;
	                szXml += "</TextOverlayList>";
	                szXml += '</OSD>';
	                return szXml;
	            }
	        }, {
	            key: "JS_SetTextOverlay",
	            value: function JS_SetTextOverlay(szXml) {
	                this[DRAWCANVAS].setMaxShapeSupport(20);
	                var oXmlDoc = _tool.oTool.parseXmlFromStr(szXml);
	                this[DRAWCANVAS].clearShapeByType("RectOSD");
	                if ((0, _jquery2.default)(oXmlDoc).find("OSD").length > 0) {
	                    this[DRAWCANVAS].setDrawStyle("#ff0000", "#343434", 0.7);
	                    this[DRAWCANVAS].m_iHorizontalResolution = parseInt((0, _jquery2.default)(oXmlDoc).find("videoResolutionWidth").eq(0).text(), 10);
	                    this[DRAWCANVAS].m_iVerticalResolution = parseInt((0, _jquery2.default)(oXmlDoc).find("videoResolutionHeight").eq(0).text(), 10);
	                    if ((0, _jquery2.default)(oXmlDoc).find("channelNameOverlay").length > 0) {
	                        var oChannelNameOverlay = (0, _jquery2.default)(oXmlDoc).find("channelNameOverlay").eq(0);
	                        var szText = (0, _jquery2.default)(oChannelNameOverlay).find("ChannelName").eq(0).text();
	                        var szEnabled = (0, _jquery2.default)(oChannelNameOverlay).find("enabled").eq(0).text();
	                        var iStartX = Math.round((0, _jquery2.default)(oChannelNameOverlay).find("positionX").eq(0).text()) * this[DRAWCANVAS].m_iCanvasWidth / this[DRAWCANVAS].m_iHorizontalResolution;
	                        var iStartY = Math.round((0, _jquery2.default)(oChannelNameOverlay).find("positionY").eq(0).text()) * this[DRAWCANVAS].m_iCanvasHeight / this[DRAWCANVAS].m_iVerticalResolution;
	                        this[DRAWCANVAS].addOSDShape(szText, szEnabled, iStartX, iStartY, {
	                            szOSDType: "overlay-ch"
	                        });
	                    }
	                    if ((0, _jquery2.default)(oXmlDoc).find("DateTimeOverlay").length > 0) {
	                        var oDateTimeOverlay = (0, _jquery2.default)(oXmlDoc).find("DateTimeOverlay").eq(0);
	                        var _szEnabled = (0, _jquery2.default)(oDateTimeOverlay).find("enabled").eq(0).text();
	                        var szDateStyle = (0, _jquery2.default)(oDateTimeOverlay).find("Type").eq(0).text() || (0, _jquery2.default)(oDateTimeOverlay).find("type").eq(0).text();
	                        var szDisplayWeek = (0, _jquery2.default)(oDateTimeOverlay).find("displayWeek").eq(0).text();
	                        var szClockType = (0, _jquery2.default)(oDateTimeOverlay).find("clockType").eq(0).text();
	                        var _szText = "";
	                        var szWeek = "";
	                        var aWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	                        var date = new Date();
	                        if (szDisplayWeek === "true") {
	                            szWeek = aWeek[date.getDay()];
	                        }
	                        if (szClockType === "24hour") {
	                            szClockType = "";
	                        } else {
	                            szClockType = "AM/PM";
	                        }
	                        switch (szDateStyle) {
	                            case "0":
	                                _szText = "YYYY-MM-DD " + szWeek + " hh:mm:ss " + szClockType;
	                                break;
	                            case "1":
	                                _szText = "MM-DD-YYYY " + szWeek + " hh:mm:ss " + szClockType;
	                                break;
	                            case "2":
	                                _szText = "CHR-YYYY-MM-DD " + szWeek + " hh:mm:ss " + szClockType;
	                                break;
	                            case "3":
	                                _szText = "CHR-MM-DD-YYYY " + szWeek + " hh:mm:ss " + szClockType;
	                                break;
	                            case "4":
	                                _szText = "DD-MM-YYYY " + szWeek + " hh:mm:ss " + szClockType;
	                                break;
	                            case "5":
	                                _szText = "CHR-DD-MM-YYYY " + szWeek + " hh:mm:ss " + szClockType;
	                                break;
	                            default:
	                                break;
	                        }
	                        var _iStartX = Math.round((0, _jquery2.default)(oDateTimeOverlay).find("positionX").eq(0).text()) * this[DRAWCANVAS].m_iCanvasWidth / this[DRAWCANVAS].m_iHorizontalResolution;
	                        var _iStartY = Math.round((0, _jquery2.default)(oDateTimeOverlay).find("positionY").eq(0).text()) * this[DRAWCANVAS].m_iCanvasHeight / this[DRAWCANVAS].m_iVerticalResolution;
	                        this[DRAWCANVAS].addOSDShape(_szText, _szEnabled, _iStartX, _iStartY, {
	                            szOSDType: "overlay-date",
	                            szDateStyle: szDateStyle,
	                            szDisplayWeek: szDisplayWeek,
	                            szClockType: szClockType
	                        });
	                    }
	                    if ((0, _jquery2.default)(oXmlDoc).find("TextOverlayList").length > 0) {
	                        (0, _jquery2.default)(oXmlDoc).find("TextOverlayList").eq(0).find("TextOverlay").each(function () {
	                            var szText = (0, _jquery2.default)(this).find("displayText").eq(0).text();
	                            var szEnabled = (0, _jquery2.default)(this).find("enabled").eq(0).text();
	                            var szId = (0, _jquery2.default)(this).find("id").eq(0).text();
	                            var iStartX = Math.round((0, _jquery2.default)(this).find("positionX").eq(0).text()) * that[DRAWCANVAS].m_iCanvasWidth / that[DRAWCANVAS].m_iHorizontalResolution;
	                            var iStartY = Math.round((0, _jquery2.default)(this).find("positionY").eq(0).text()) * that[DRAWCANVAS].m_iCanvasHeight / that[DRAWCANVAS].m_iVerticalResolution;
	                            that[DRAWCANVAS].addOSDShape(szText, szEnabled, iStartX, iStartY, {
	                                szOSDType: "overlay-text",
	                                szId: szId
	                            });
	                        });
	                    }
	                }
	                return 0;
	            }
	        }, {
	            key: "JS_ClearSnapInfo",
	            value: function JS_ClearSnapInfo(iMode) {
	                if (!this[DRAWCANVAS]) {
	                    return -1;
	                }
	                if (iMode === 0) {
	                    this[DRAWCANVAS].clearShapeByType("Rect");
	                } else if (iMode === 1) {
	                    this[DRAWCANVAS].clearShapeByType("Polygon");
	                } else if (iMode === 2) {
	                    this[DRAWCANVAS].clearShapeByType("Line");
	                } else if (iMode === 3) {
	                    this[DRAWCANVAS].clearShapeByType("Rect");
	                    this[DRAWCANVAS].clearShapeByType("Polygon");
	                } else {
	                    this[DRAWCANVAS].clearAllShape();
	                }
	                return 0;
	            }
	        }, {
	            key: "JS_ClearTargetPolygon",
	            value: function JS_ClearTargetPolygon(szXml) {
	                var oXmlDoc = _tool.oTool.parseXmlFromStr(szXml);
	                var aShapes = this[DRAWCANVAS].getAllShapesInfo();
	                var iShapesLen = aShapes.length;
	                if (iShapesLen > 0) {
	                    for (var i = 0; i < iShapesLen; i++) {
	                        var szId = (0, _jquery2.default)(oXmlDoc).find("id").eq(0).text();
	                        if (aShapes[i].szType === "Polygon") {
	                            if (aShapes[i].szId === szId) {
	                                this[DRAWCANVAS].deleteShape(i);
	                                break;
	                            }
	                        }
	                    }
	                }
	            }
	        }, {
	            key: "JS_SetSnapPolygonInfo",
	            value: function JS_SetSnapPolygonInfo(szXml) {
	                this[DRAWCANVAS].setShapeType("Polygon");
	                this[DRAWCANVAS].setMaxShapeSupport(20);
	                this[DRAWCANVAS].setDrawStyle("#FFFF00", "#FFFF00", 0.1);
	                var oXmlDoc = _tool.oTool.parseXmlFromStr(szXml);
	                var aShapes = this[DRAWCANVAS].getAllShapesInfo();
	                var iShapesLen = aShapes.length;
	                if (iShapesLen > 0) {
	                    for (var i = 0; i < iShapesLen; i++) {
	                        var szId = (0, _jquery2.default)(oXmlDoc).find("id").eq(0).text();
	                        if (aShapes[i].szType === "Polygon") {
	                            if (aShapes[i].szId === szId) {
	                                this[DRAWCANVAS].deleteShape(i);
	                                break;
	                            }
	                        }
	                    }
	                }
	                var aShapesInfo = [];
	                if ((0, _jquery2.default)(oXmlDoc).find("SnapPolygonList").length > 0) {
	                    (0, _jquery2.default)(oXmlDoc).find("SnapPolygonList").eq(0).find("SnapPolygon").each(function () {
	                        var szId = (0, _jquery2.default)(oXmlDoc).find("id").eq(0).text();
	                        var iPolygonType = parseInt((0, _jquery2.default)(oXmlDoc).find("polygonType").eq(0).text() || "1", 10);
	                        var szTips = (0, _jquery2.default)(oXmlDoc).find("Tips").eq(0).text() || (0, _jquery2.default)(oXmlDoc).find("tips").eq(0).text();
	                        var iMinClosed = parseInt((0, _jquery2.default)(oXmlDoc).find("MinClosed").eq(0).text(), 10);
	                        var iMaxPointNum = parseInt((0, _jquery2.default)(oXmlDoc).find("PointNumMax").eq(0).text(), 10);
	                        var iEditType = parseInt((0, _jquery2.default)(oXmlDoc).find("EditType").eq(0).text(), 10) || 0;
	                        var bClosed = (0, _jquery2.default)(oXmlDoc).find("isClosed").eq(0).text() === "true";
	                        var szDrawColor = 'rgb(' + (0, _jquery2.default)(oXmlDoc).find("r").eq(0).text() + ', ' + (0, _jquery2.default)(oXmlDoc).find("g").eq(0).text() + ', ' + (0, _jquery2.default)(oXmlDoc).find("b").eq(0).text() + ')';
	                        var szFillColor = szDrawColor;
	                        var iTranslucent = 0.1;
	                        var aPoint = [];
	                        (0, _jquery2.default)(oXmlDoc).find("pointList").eq(0).find("point").each(function (j) {
	                            aPoint[j] = [];
	                            aPoint[j][0] = Math.round((0, _jquery2.default)(this).find("x").eq(0).text() * that[DRAWCANVAS].m_iCanvasWidth);
	                            aPoint[j][1] = Math.round((0, _jquery2.default)(this).find("y").eq(0).text() * that[DRAWCANVAS].m_iCanvasHeight);
	                        });
	                        if (aPoint.length > 0) {
	                            aShapesInfo.push({
	                                szId: szId,
	                                iPolygonType: iPolygonType,
	                                iMinClosed: iMinClosed,
	                                iMaxPointNum: iMaxPointNum,
	                                iEditType: iEditType,
	                                aPoint: aPoint,
	                                bClosed: bClosed,
	                                szTips: szTips,
	                                szDrawColor: szDrawColor,
	                                szFillColor: szFillColor,
	                                iTranslucent: iTranslucent
	                            });
	                            that[DRAWCANVAS].setDrawStatus(false);
	                        } else {
	                            that[DRAWCANVAS].setCurrentShapeInfo({
	                                szId: szId,
	                                szTips: szTips,
	                                iMinClosed: iMinClosed,
	                                iMaxPointNum: iMaxPointNum,
	                                iPolygonType: iPolygonType,
	                                szDrawColor: szDrawColor,
	                                szFillColor: szFillColor,
	                                iTranslucent: iTranslucent
	                            });
	                            that[DRAWCANVAS].setDrawStatus(true);
	                        }
	                    });
	                }
	                if (aShapesInfo.length > 0) {
	                    this[DRAWCANVAS].setShapesInfoByType("Polygon", aShapesInfo);
	                }
	                return 0;
	            }
	        }, {
	            key: "JS_GetSnapPolygonInfo",
	            value: function JS_GetSnapPolygonInfo() {
	                var szXml = "<?xml version='1.0' encoding='utf-8'?><SnapPolygonList>";
	                var aShapes = this[DRAWCANVAS].getShapesInfoByType("Polygon");
	                for (var i = 0, iLen = aShapes.length; i < iLen; i++) {
	                    var oShape = aShapes[i];
	                    szXml += "<SnapPolygon>";
	                    szXml += "<id>" + oShape.szId + "</id>";
	                    szXml += "<polygonType>" + oShape.iPolygonType + "</polygonType>";
	                    szXml += "<color>";
	                    var aColor = oShape.szDrawColor.substring(4, oShape.szDrawColor.length - 1).split(",");
	                    szXml += "<r>" + aColor[0] + "</r>";
	                    szXml += "<g>" + aColor[1] + "</g>";
	                    szXml += "<b>" + aColor[2] + "</b>";
	                    szXml += "</color>";
	                    szXml += "<tips>" + oShape.szTips + "</tips>";
	                    szXml += "<isClosed>" + oShape.bClosed + "</isClosed>";
	                    var aPoint = oShape.aPoint;
	                    szXml += "<pointList>";
	                    for (var j = 0, iLenPoint = aPoint.length; j < iLenPoint; j++) {
	                        szXml += "<point><x>" + (aPoint[j][0] / this[DRAWCANVAS].m_iCanvasWidth).toFixed(6) + "</x><y>" + (aPoint[j][1] / this[DRAWCANVAS].m_iCanvasHeight).toFixed(6) + "</y></point>";
	                    }
	                    szXml += "</pointList>";
	                    szXml += "</SnapPolygon>";
	                }
	                szXml += "</SnapPolygonList>";
	                return szXml;
	            }
	        }, {
	            key: "JS_SetSnapDrawMode",
	            value: function JS_SetSnapDrawMode() /*iType, iMode*/{
	                if (!this[DRAWCANVAS]) {
	                    return -1;
	                }
	                this[DRAWCANVAS].setDrawMutiShapeOneTime(false);
	                return 0;
	            }
	        }, {
	            key: "JS_SetSnapLineInfo",
	            value: function JS_SetSnapLineInfo(szXml) {
	                this[DRAWCANVAS].setShapeType("Line");
	                this[DRAWCANVAS].setMaxShapeSupport(20);
	                this[DRAWCANVAS].setDrawStyle("#FFFF00", "#FFFF00", 0.1);
	                var oXmlDoc = _tool.oTool.parseXmlFromStr(szXml);
	                var aShapes = this[DRAWCANVAS].getAllShapesInfo();
	                var iShapesLen = aShapes.length;
	                if (iShapesLen > 0) {
	                    for (var i = 0; i < iShapesLen; i++) {
	                        var szId = (0, _jquery2.default)(oXmlDoc).find("id").eq(0).text();
	                        if (aShapes[i].szType === "Line") {
	                            if (aShapes[i].szId === szId) {
	                                this[DRAWCANVAS].deleteShape(i);
	                                break;
	                            }
	                        }
	                    }
	                }
	                var aShapesInfo = [];
	                if ((0, _jquery2.default)(oXmlDoc).find("SnapLineList").length > 0) {
	                    (0, _jquery2.default)(oXmlDoc).find("SnapLineList").eq(0).find("SnapLine").each(function () {
	                        var szId = (0, _jquery2.default)(oXmlDoc).find("id").eq(0).text();
	                        var iLineType = parseInt((0, _jquery2.default)(oXmlDoc).find("LineTypeEx").eq(0).text(), 10);
	                        var iDirection = parseInt((0, _jquery2.default)(oXmlDoc).find("CustomType").text(), 10) || parseInt((0, _jquery2.default)(oXmlDoc).find("LineType").text(), 10);
	                        var iArrowType = parseInt((0, _jquery2.default)(oXmlDoc).find("ArrowType").text(), 10) || 0;
	                        var szTips = (0, _jquery2.default)(oXmlDoc).find("Tips").eq(0).text() || (0, _jquery2.default)(oXmlDoc).find("tips").eq(0).text();
	                        var szDrawColor = 'rgb(' + (0, _jquery2.default)(oXmlDoc).find("r").eq(0).text() + ', ' + (0, _jquery2.default)(oXmlDoc).find("g").eq(0).text() + ', ' + (0, _jquery2.default)(oXmlDoc).find("b").eq(0).text() + ')';
	                        var aPoint = [];
	                        aPoint[0] = [];
	                        aPoint[1] = [];
	                        aPoint[0][0] = Math.round((0, _jquery2.default)(oXmlDoc).find("StartPos").eq(0).find("x").eq(0).text() * that[DRAWCANVAS].m_iCanvasWidth);
	                        aPoint[0][1] = Math.round((0, _jquery2.default)(oXmlDoc).find("StartPos").eq(0).find("y").eq(0).text() * that[DRAWCANVAS].m_iCanvasHeight);
	                        aPoint[1][0] = Math.round((0, _jquery2.default)(oXmlDoc).find("EndPos").eq(0).find("x").eq(0).text() * that[DRAWCANVAS].m_iCanvasWidth);
	                        aPoint[1][1] = Math.round((0, _jquery2.default)(oXmlDoc).find("EndPos").eq(0).find("y").eq(0).text() * that[DRAWCANVAS].m_iCanvasHeight);
	                        if (aPoint.length > 0) {
	                            aShapesInfo.push({
	                                szId: szId,
	                                iLineType: iLineType,
	                                aPoint: aPoint,
	                                szTips: szTips,
	                                iDirection: iDirection,
	                                iArrowType: iArrowType,
	                                szDrawColor: szDrawColor
	                            });
	                            that[DRAWCANVAS].setDrawStatus(false);
	                        }
	                    });
	                }
	                if (aShapesInfo.length > 0) {
	                    this[DRAWCANVAS].setShapesInfoByType("Line", aShapesInfo);
	                }
	                return 0;
	            }
	        }, {
	            key: "JS_GetSnapLineInfo",
	            value: function JS_GetSnapLineInfo() {
	                var szXml = "<?xml version='1.0' encoding='utf-8'?><SnapLineList>";
	                var aShapes = this[DRAWCANVAS].getShapesInfoByType("Line");
	                for (var i = 0, iLen = aShapes.length; i < iLen; i++) {
	                    szXml += "<SnapLine>";
	                    szXml += "<id>" + aShapes[i].szId + "</id>";
	                    szXml += "<LineTypeEx>" + aShapes[i].iLineType + "</LineTypeEx>";
	                    szXml += "<CustomType>0</CustomType><MoveChange>0</MoveChange><ArrowType>" + aShapes[i].iArrowType + "</ArrowType>";
	                    szXml += "<tips>" + aShapes[i].szTips + "</tips>";
	                    var aPoint = aShapes[i].aPoint;
	                    szXml += "<StartPos><x>" + (aPoint[0][0] / that[DRAWCANVAS].m_iCanvasWidth).toFixed(6) + "</x><y>" + (aPoint[0][1] / that[DRAWCANVAS].m_iCanvasHeight).toFixed(6) + "</y></StartPos>";
	                    szXml += "<EndPos><x>" + (aPoint[1][0] / that[DRAWCANVAS].m_iCanvasWidth).toFixed(6) + "</x><y>" + (aPoint[1][1] / that[DRAWCANVAS].m_iCanvasHeight).toFixed(6) + "</y></EndPos>";
	                    szXml += "<LineSelected>false</LineSelected>";
	                    if (aShapes[i].aCrossArrowPoint.length > 0) {
	                        szXml += "<PDCArrow><Sp_x>" + (aShapes[i].aCrossArrowPoint[0][0] / that[DRAWCANVAS].m_iCanvasWidth).toFixed(6) + "</Sp_x>";
	                        szXml += "<Sp_y>" + (aShapes[i].aCrossArrowPoint[0][1] / that[DRAWCANVAS].m_iCanvasWidth).toFixed(6) + "</Sp_y>";
	                        szXml += "<Ep_x>" + (aShapes[i].aCrossArrowPoint[1][0] / that[DRAWCANVAS].m_iCanvasWidth).toFixed(6) + "</Ep_x>";
	                        szXml += "<Ep_y>" + (aShapes[i].aCrossArrowPoint[1][1] / that[DRAWCANVAS].m_iCanvasWidth).toFixed(6) + "</Ep_y></PDCArrow>";
	                    }
	                    szXml += "<PDCShowMark>false</PDCShowMark>";
	                    var szR = aShapes[i].szDrawColor.split(",")[0].split("(")[1];
	                    var szG = aShapes[i].szDrawColor.split(",")[1];
	                    var szB = aShapes[i].szDrawColor.split(",")[2].split(")")[0];
	                    szXml += "<color><r>" + (szR || "255") + "</r><g>" + (szG || "255") + "</g><b>" + (szB || "0") + "</b></color>";
	                    szXml += "</SnapLine>";
	                }
	                szXml += "</SnapLineList>";
	                return szXml;
	            }
	        }, {
	            key: "JS_FullScreenDisplay",
	            value: function JS_FullScreenDisplay(bFullScreen) {
	                if (bFullScreen) {
	                    this[WINDOWFULL] = bFullScreen;
	                    var element = (0, _jquery2.default)("#" + that[OPTIONS].szId).get(0);
	                    if (element.requestFullScreen) {
	                        element.requestFullScreen();
	                    } else if (element.webkitRequestFullScreen) {
	                        element.webkitRequestFullScreen();
	                    } else if (element.mozRequestFullScreen) {
	                        element.mozRequestFullScreen();
	                    }
	                }
	            }
	        }, {
	            key: "JS_FullScreenSingle",
	            value: function JS_FullScreenSingle(iWnd) {
	                if (!that[WNDSTATUSLIST][iWnd].bPlay) {
	                    return;
	                }
	                var bFullscreen = document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen || false;
	                var element = oJSPlugin.find(".parent-wnd").eq(0).children().eq(iWnd).children().eq(0).get(0);
	                if (!bFullscreen) {
	                    if (element.requestFullScreen) {
	                        element.requestFullScreen();
	                    } else if (element.webkitRequestFullScreen) {
	                        element.webkitRequestFullScreen();
	                    } else if (element.mozRequestFullScreen) {
	                        element.mozRequestFullScreen();
	                    }
	                    that[SINGLEWINDOW] = oJSPlugin.find(".parent-wnd").eq(0).children().eq(iWnd).children().eq(0);
	                } else {
	                    if (oJSPlugin.find(".parent-wnd").eq(0).width() === (0, _jquery2.default)(window).width()) {
	                        //插件全屏时单窗口全屏无效
	                        return;
	                    }
	                    if (document.exitFullscreen) {
	                        document.exitFullscreen();
	                    } else if (document.webkitCancelFullScreen) {
	                        document.webkitCancelFullScreen();
	                    } else if (document.mozCancelFullScreen) {
	                        document.mozCancelFullScreen();
	                    }
	                }
	            }
	        }, {
	            key: "JS_StartDownload",
	            value: function JS_StartDownload(szURL, szNamePwd, szFileName, szDownXml) {
	                var szPlaybackURI = (0, _jquery2.default)(_tool.oTool.parseXmlFromStr(szDownXml)).find("playbackURI").eq(0).text();
	                var szDownloadUrl = szURL + "?playbackURI=" + szPlaybackURI;
	                var szFileFormat = ".mp4";
	                if (szURL.indexOf("picture/Streaming/tracks") > 0) {
	                    szDownloadUrl = szURL;
	                    szFileFormat = ".jpg";
	                }
	                var iFileNameStartIndex = szDownloadUrl.indexOf("&name=") + 6;
	                var iFileNameEndIndex = szDownloadUrl.indexOf("&size=");
	                szFileName = szDownloadUrl.substring(iFileNameStartIndex, iFileNameEndIndex);
	                (0, _jquery2.default)("body").append('<a id="jsplugin_download_a" href="' + szDownloadUrl + '" download=' + szFileName + szFileFormat + '><li id="jsplugin_download_li"></li></a>');
	                (0, _jquery2.default)("#jsplugin_download_li").trigger("click");
	                (0, _jquery2.default)("#jsplugin_download_a").remove();
	                return 0;
	            }
	        }, {
	            key: "JS_Resize",
	            value: function JS_Resize(iWidth, iHeight) {
                    try{
                        oJSPlugin = (0, _jquery2.default)("#" + that[OPTIONS].szId);
                        if(iHeight.indexOf("%")>0){
                            iHeight=  oJSPlugin.height() * (iHeight.replace("%",""))/100; 
                        }
                        if(iWidth.indexOf("%")>0){
                            iWidth=  oJSPlugin.width() * (iWidth.replace("%",""))/100; 
                        }
                    }catch(e){
        
                    }
	                if (this[WINDOWFULL]) {
	                    iWidth = (0, _jquery2.default)(window).width();
	                    iHeight = (0, _jquery2.default)(window).height();
	                    (0, _jquery2.default)("#" + this[OPTIONS].szId).css({
	                        width: iWidth,
	                        height: iHeight
	                    });
	                    this[WINDOWFULL] = false;
	                } else {
	                    (0, _jquery2.default)("#" + this[OPTIONS].szId).css({
	                        width: iWidth,
	                        height: iHeight
	                    });
	                }
	                this[OPTIONS].iWidth = iWidth;
	                this[OPTIONS].iHeight = iHeight;
	                //解决firefox全屏切换有画面残留的问题;
	                if (_tool.oTool.isFirefox()) {
	                    for (var i = 0; i < that[OPTIONS].iMaxSplit * that[OPTIONS].iMaxSplit; i++) {
	                        if (that[WNDSTATUSLIST][i].oPlayCtrl) {
	                            that[WNDSTATUSLIST][i].oPlayCtrl.PlayM4_ClearCanvas();
	                        }
	                    }
	                }
	                updateWnd();
	                if (that[SINGLEWINDOW]) {
	                    iWidth = (0, _jquery2.default)(window).width();
	                    iHeight = (0, _jquery2.default)(window).height();
	                    that[SINGLEWINDOW].css({
	                        width: iWidth,
	                        height: iHeight
	                    });
	                    that[SINGLEWINDOW].find("canvas").attr("width", iWidth - 2);
	                    that[SINGLEWINDOW].find("canvas").attr("height", iHeight - 2);
	                    that[SINGLEWINDOW] = null;
	                }
	                this[DRAWCANVAS].resizeCanvas();
	                this[DRAWCANVAS].canvasRedraw();
	            }
	        }, {
	            key: "JS_WndCreate",
	            value: function JS_WndCreate(iType, iWidth, iHeight) {
	                createWindows(iWidth, iHeight);
	                this[DRAWCANVAS].updateCanvas("canvas_draw0");
	                this[DRAWCANVAS].clearAllShape();
	                if (iType === 0) {
	                    (0, _jquery2.default)("#" + this[OPTIONS].szId).hide();
	                } else {
	                    (0, _jquery2.default)("#" + this[OPTIONS].szId).show();
	                }
	                that.EventCallback.windowEventSelect(0);
	            }
	        }, {
	            key: "JS_ExportDeviceConfig",
	            value: function JS_ExportDeviceConfig(szExportURL /*, szNamePwd, szFileName, iReserve*/) {
	                (0, _jquery2.default)("body").append('<a id="jsplugin_download_a" href="' + szExportURL + '"><li id="jsplugin_download_li"></li></a>');
	                (0, _jquery2.default)("#jsplugin_download_li").trigger("click");
	                (0, _jquery2.default)("#jsplugin_download_a").remove();
	                return 0;
	            }
	        }, {
	            key: "JS_OpenFileBrowser",
	            value: function JS_OpenFileBrowser(iSelectMode, szFileType) {
                    　var dtd =(0, _jquery2.default).Deferred(); 
                    that[FILETMP] = null;
                    var filename = "";
	                var input = window.document.createElement('input');
	                input.type = "file";
	                if (szFileType.toLowerCase() === "bmp") {
	                    input.accept = "image/bmp";
	                }
	                if (iSelectMode === 0) {
	                    input.setAttribute("webkitdirectory", "");
	                }
	                input.addEventListener('change', function () {
	                    if (iSelectMode === 1) {
	                        that[FILETMP] = input.files[0];
	                        filename = input.files[0].name;
	                    } else if (iSelectMode === 0) {
	                        that[FILETMP] = input.files;
                        }
                        dtd.resolve(filename);
	                });
	                var click = document.createEvent("MouseEvents");
	                click.initEvent("click", true, true);
                    input.dispatchEvent(click);
                    　return dtd;
	            }
	        }, {
	            key: "JS_UploadFile",
	            value: function JS_UploadFile(szUploadUrl, szNamePwd, szFilePath, szStrReserve /*, iReserve*/) {
	                var iRet = 0;
	                var xhr = new XMLHttpRequest();
	                xhr.onreadystatechange = function () {
	                    if (xhr.readyState === 4) {
	                        if (xhr.status !== 200) {
	                            iRet = -1;
	                        }
	                    }
	                };
	                xhr.open('put', szUploadUrl, false);
	                xhr.setRequestHeader("Content-Type", szStrReserve);
	                xhr.send(that[FILETMP]);
	                return iRet;
	            }
	        }, {
	            key: "JS_StartAsynUpload",
	            value: function JS_StartAsynUpload(szImportURL /*, szStatusUrl, szNamePwd, szFileName, iReserve*/) {
	                var xhr = new XMLHttpRequest();
	                xhr.onreadystatechange = function () {
	                    if (xhr.readyState === 4) {
	                        that[STATUSTMP] = xhr.responseText;
	                    }
	                };
	                xhr.open('put', szImportURL, true);
	                xhr.send(that[FILETMP]);
	                return 0;
	            }
	        }, {
	            key: "JS_StopAsynUpload",
	            value: function JS_StopAsynUpload() {
	                that[FILETMP] = null;
	                that[STATUSTMP] = "";
	            }
	        }, {
	            key: "JS_GetUploadErrorInfo",
	            value: function JS_GetUploadErrorInfo() {
	                if (typeof that[STATUSTMP] === "string" && that[STATUSTMP].length > 0) {
	                    return that[STATUSTMP];
	                }
	                return "";
	            }
	        }, {
	            key: "JS_StartUpgradeEx",
	            value: function JS_StartUpgradeEx(szUpgradeURL, szStatusURL /*, szNamePwd, szFileName, szUpgradeFlag, szReserve*/) {
	                var oPromise = new Promise(function (resolve, reject) {
	                    if (!szUpgradeURL) {
	                        reject();
	                        return ERRORRETURN;
	                    }
	                    if (!szStatusURL) {
	                        reject();
	                        return ERRORRETURN;
	                    }
	                    that[STATUSTMP] = 0;
	                    var xhr = new XMLHttpRequest();
	                    xhr.onreadystatechange = function () {
	                        if (xhr.readyState === 4) {
	                            if (xhr.status === 200) {
	                                that[STATUSTMP] = 100;
	                                resolve();
	                            } else {
	                                that[STATUSTMP] = 1;
	                                var oXmlDoc = _tool.oTool.parseXmlFromStr(xhr.responseText);
	                                if ((0, _jquery2.default)(oXmlDoc).find("subStatusCode").text() === "lowPrivilege") {
	                                    reject(403);
	                                } else {
	                                    reject();
	                                }
	                            }
	                        }
	                    };
	                    xhr.open('put', szUpgradeURL, true);
	                    xhr.send(that[FILETMP]);
	                    that[UPGRADESTATUSURL] = szStatusURL;
	                    setTimeout(function () {
	                        resolve();
	                    }, 3000);
	                });
	                return oPromise;
	            }
	        }, {
	            key: "JS_UpgradeStatus",
	            value: function JS_UpgradeStatus() {
	                if (that[STATUSTMP] === 100) {
	                    return 0;
	                }
	                return that[STATUSTMP];
	            }
	        }, {
	            key: "JS_UpgradeProgress",
	            value: function JS_UpgradeProgress() {
	                var iProgress = 0;
	                var xhr = new XMLHttpRequest();
	                xhr.onreadystatechange = function () {
	                    if (xhr.readyState === 4) {
	                        if (xhr.status === 200) {
	                            iProgress = parseInt((0, _jquery2.default)(_tool.oTool.parseXmlFromStr(xhr.responseText)).find("percent").text(), 10);
	                        }
	                    }
	                };
	                xhr.open('get', that[UPGRADESTATUSURL], false);
	                xhr.send(null);
	                if (that[STATUSTMP] === 100) {
	                    return 100;
	                }
	                return iProgress;
	            }
	        }, {
	            key: "JS_StopUpgrade",
	            value: function JS_StopUpgrade() {
	                that[FILETMP] = null;
	                return 0;
	            }
	        }, {
	            key: "JS_ExportDeviceLog",
	            value: function JS_ExportDeviceLog(szXml, szFileName /*, iFileType*/) {
	                szFileName = "Log.txt";
	                var aResults = []; //存储所有日志
	                var aLoglist_all = []; //转化成二位数组
	                aResults = aResults.concat((0, _jquery2.default)(szXml).find('searchMatchItem').toArray());
	                for (var i = 0; i < aResults.length; i++) {
	                    aLoglist_all[i] = [];
	                    aLoglist_all[i][0] = (0, _jquery2.default)(aResults[i]).find('logtime').text().replace("T", " ").replace("Z", "");
	                    aLoglist_all[i][1] = (0, _jquery2.default)(aResults[i]).find('majortype').text();
	                    aLoglist_all[i][2] = (0, _jquery2.default)(aResults[i]).find('minortype').text();
	                    aLoglist_all[i][3] = (0, _jquery2.default)(aResults[i]).find('channelid').text();
	                    aLoglist_all[i][4] = (0, _jquery2.default)(aResults[i]).find('userName').text();
	                    aLoglist_all[i][5] = (0, _jquery2.default)(aResults[i]).find('remoteaddress').text();
	                }
	                var textLog = []; //数组中转化为长字符串
	                function creatItem(str) {
	                    //字符串中插入空格
	                    textLog.push(str);
	                    var a = str.slice("");
	                    if (/^[\u4e00-\u9fa5]/.test(str)) {
	                        for (var _i2 = 0; _i2 < 30 - a.length * 2; _i2++) {
	                            textLog.push(" ");
	                        }
	                    } else {
	                        for (var _i3 = 0; _i3 < 30 - a.length; _i3++) {
	                            textLog.push(" ");
	                        }
	                    }
	                }
	                //创建表头
	                creatItem(" ");
	                creatItem((0, _jquery2.default)(szXml).find('laLogTime').text());
	                creatItem((0, _jquery2.default)(szXml).find('laLogMajorType').text());
	                creatItem((0, _jquery2.default)(szXml).find('laLogMinorType').text());
	                creatItem((0, _jquery2.default)(szXml).find('laLogChannel').text());
	                creatItem((0, _jquery2.default)(szXml).find('laLogRemoteUser').text());
	                creatItem((0, _jquery2.default)(szXml).find('laLogRemoteIP').text());
	                textLog.push("\r\n");
	                for (var _i4 = 0; _i4 < aLoglist_all.length; _i4++) {
	                    var num = (_i4 + 1).toString();
	                    creatItem(num);
	                    for (var j = 0; j < 6; j++) {
	                        creatItem(aLoglist_all[_i4][j]);
	                    }
	                    textLog.push("\r\n");
	                }
	                textLog = textLog.join("");
	                var blob = new Blob([textLog], { type: "text/plain" });
	                var url = (window.URL || window.webkitURL).createObjectURL(blob);
	                var link = window.document.createElement('a');
	                link.href = url;
	                link.download = szFileName;
	                var click = document.createEvent("MouseEvents");
	                click.initEvent("click", true, true);
	                link.dispatchEvent(click);
	            }
	        }, {
	            key: "JS_GetWndContainer",
	            value: function JS_GetWndContainer(iWndIndex) {
	                if (iWndIndex < 0 || typeof iWndIndex === 'undefined' || iWndIndex === null) {
	                    return -1;
	                }
	                return oJSPlugin.find(".parent-wnd").eq(0).children().eq(iWndIndex)[0];
	            }
	        }, {
	            key: "JS_GetWndStatus",
	            value: function JS_GetWndStatus(iWndIndex) {
	                if (iWndIndex < 0 || typeof iWndIndex === 'undefined' || iWndIndex === null) {
	                    return -1;
	                }
	                var oWndState = {
	                    bPlay: this[WNDSTATUSLIST][iWndIndex].bPlay,
	                    bSound: this[CURRENTSOUNDWND] === iWndIndex,
	                    bSelect: this[WNDSTATUSLIST][iWndIndex].bSelect,
	                    iRate: this[WNDSTATUSLIST][iWndIndex].iRate
	                };
	                return oWndState;
	            }
	        }, {
	            key: "JS_SelectWnd",
	            value: function JS_SelectWnd(iWndIndex) {
	                oJSPlugin.find(".parent-wnd").eq(0).children().eq(iWndIndex).mousedown();
	            }
	        }]);

	        return JSDecoder;
	    }();

	    return JSDecoder;
	}();

	exports.JSPlugin = JSPlugin;

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Tool = function () {
	    function Tool() {
	        _classCallCheck(this, Tool);

	        //to do
	        this._keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	    }

	    _createClass(Tool, [{
	        key: "$",
	        value: function $(strExpr) {
	            var idExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/;
	            var classExpr = /^(?:\s*(<[\w\W]+>)[^>]*|.([\w-]*))$/;
	            if (idExpr.test(strExpr)) {
	                var idMatch = idExpr.exec(strExpr);
	                return document.getElementById(idMatch[2]);
	            } else if (classExpr.test(strExpr)) {
	                var classMatch = classExpr.exec(strExpr);
	                var allElement = document.getElementsByTagName("*");
	                var ClassMatch = [];
	                for (var i = 0, l = allElement.length; i < l; i++) {
	                    if (allElement[i].className.match(new RegExp("(\\s|^)" + classMatch[2] + "(\\s|$)"))) {
	                        ClassMatch.push(allElement[i]);
	                    }
	                }
	                return ClassMatch;
	            }
	        }

	        /**
	         * @synopsis 时间日期格式化
	         *
	         * @param {objcet} oDate 时间
	         * @param {string} fmt 格式 yyyy-MM-dd
	         *
	         * @returns {string} 格式化后的时间
	         */

	    }, {
	        key: "dateFormat",
	        value: function dateFormat(oDate, fmt) {
	            var o = {
	                "M+": oDate.getMonth() + 1, //月份
	                "d+": oDate.getDate(), //日
	                "h+": oDate.getHours(), //小时
	                "m+": oDate.getMinutes(), //分
	                "s+": oDate.getSeconds(), //秒
	                "q+": Math.floor((oDate.getMonth() + 3) / 3), //季度
	                "S": oDate.getMilliseconds() //毫秒
	            };
	            if (/(y+)/.test(fmt)) {
	                fmt = fmt.replace(RegExp.$1, (oDate.getFullYear() + "").substr(4 - RegExp.$1.length));
	            }
	            for (var k in o) {
	                if (new RegExp("(" + k + ")").test(fmt)) {
	                    fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
	                }
	            }
	            return fmt;
	        }

	        /**
	         * @synopsis 下载文件
	         *
	         * @param {object} oData 数据 File对象或者Blob对象或者ArrayBuffer对象
	         * @param {string} szName 下载文件名
	         * @returns {none} 无返回
	         */

	    }, {
	        key: "downloadFile",
	        value: function downloadFile(oData, szName) {
	            var oBlob = oData;
	            if (!(oData instanceof Blob || oData instanceof File)) {
	                oBlob = new Blob([oData]);
	            }
	            var szFileUrl = window.URL.createObjectURL(oBlob);
	            var oLink = window.document.createElement("a");
	            oLink.href = szFileUrl;
	            oLink.download = szName;

	            var oClick = document.createEvent("MouseEvents");
	            oClick.initEvent("click", true, true);
	            oLink.dispatchEvent(oClick);
	        }
	        //创建xml DOM对象

	    }, {
	        key: "createxmlDoc",
	        value: function createxmlDoc() {
	            var xmlDoc;
	            var aVersions = ["MSXML2.DOMDocument", "MSXML2.DOMDocument.5.0", "MSXML2.DOMDocument.4.0", "MSXML2.DOMDocument.3.0", "Microsoft.XmlDom"];
	            for (var i = 0, len = aVersions.length; i < len; i++) {
	                try {
	                    xmlDoc = new ActiveXObject(aVersions[i]);
	                    break;
	                } catch (e) {
	                    xmlDoc = document.implementation.createDocument("", "", null);
	                    break;
	                }
	            }
	            xmlDoc.async = "false";
	            return xmlDoc;
	        }
	        //从xml字符串中解析xml

	    }, {
	        key: "parseXmlFromStr",
	        value: function parseXmlFromStr(szXml) {
	            if (null === szXml || '' === szXml) {
	                return null;
	            }
	            var xmlDoc = this.createxmlDoc();
	            if (navigator.appName === "Netscape" || navigator.appName === "Opera") {
	                var oParser = new DOMParser();
	                xmlDoc = oParser.parseFromString(szXml, "text/xml");
	            } else {
	                xmlDoc.loadXML(szXml);
	            }
	            return xmlDoc;
	        }
	        // public method for encoding

	    }, {
	        key: "encode",
	        value: function encode(input) {
	            var output = "";
	            var chr1;
	            var chr2;
	            var chr3;
	            var enc1;
	            var enc2;
	            var enc3;
	            var enc4;
	            var i = 0;
	            input = this._utf8_encode(input);
	            while (i < input.length) {
	                chr1 = input.charCodeAt(i++);
	                chr2 = input.charCodeAt(i++);
	                chr3 = input.charCodeAt(i++);
	                enc1 = chr1 >> 2;
	                enc2 = (chr1 & 3) << 4 | chr2 >> 4;
	                enc3 = (chr2 & 15) << 2 | chr3 >> 6;
	                enc4 = chr3 & 63;
	                if (isNaN(chr2)) {
	                    enc3 = enc4 = 64;
	                } else if (isNaN(chr3)) {
	                    enc4 = 64;
	                }
	                output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
	            }
	            return output;
	        }
	        // public method for decoding

	    }, {
	        key: "decode",
	        value: function decode(input) {
	            var output = "";
	            var chr1;
	            var chr2;
	            var chr3;
	            var enc1;
	            var enc2;
	            var enc3;
	            var enc4;
	            var i = 0;
	            input = input.replace(/[^A-Za-z0-9+/=]/g, "");
	            while (i < input.length) {
	                enc1 = this._keyStr.indexOf(input.charAt(i++));
	                enc2 = this._keyStr.indexOf(input.charAt(i++));
	                enc3 = this._keyStr.indexOf(input.charAt(i++));
	                enc4 = this._keyStr.indexOf(input.charAt(i++));
	                chr1 = enc1 << 2 | enc2 >> 4;
	                chr2 = (enc2 & 15) << 4 | enc3 >> 2;
	                chr3 = (enc3 & 3) << 6 | enc4;
	                output = output + String.fromCharCode(chr1);
	                if (enc3 !== 64) {
	                    output = output + String.fromCharCode(chr2);
	                }
	                if (enc4 !== 64) {
	                    output = output + String.fromCharCode(chr3);
	                }
	            }
	            output = this._utf8_decode(output);
	            return output;
	        }
	        // private method for UTF-8 encoding

	    }, {
	        key: "_utf8_encode",
	        value: function _utf8_encode(string) {
	            string = string.replace(/\r\n/g, "\n");
	            var utftext = "";
	            for (var n = 0; n < string.length; n++) {
	                var c = string.charCodeAt(n);
	                if (c < 128) {
	                    utftext += String.fromCharCode(c);
	                } else if (c > 127 && c < 2048) {
	                    utftext += String.fromCharCode(c >> 6 | 192);
	                    utftext += String.fromCharCode(c & 63 | 128);
	                } else {
	                    utftext += String.fromCharCode(c >> 12 | 224);
	                    utftext += String.fromCharCode(c >> 6 & 63 | 128);
	                    utftext += String.fromCharCode(c & 63 | 128);
	                }
	            }
	            return utftext;
	        }
	        // private method for UTF-8 decoding

	    }, {
	        key: "_utf8_decode",
	        value: function _utf8_decode(utftext) {
	            var string = "";
	            var i = 0;
	            var c = 0;
	            //var c1 = 0;
	            var c2 = 0;
	            while (i < utftext.length) {
	                c = utftext.charCodeAt(i);
	                if (c < 128) {
	                    string += String.fromCharCode(c);
	                    i++;
	                } else if (c > 191 && c < 224) {
	                    c2 = utftext.charCodeAt(i + 1);
	                    string += String.fromCharCode((c & 31) << 6 | c2 & 63);
	                    i += 2;
	                } else {
	                    c2 = utftext.charCodeAt(i + 1);
	                    var c3 = utftext.charCodeAt(i + 2);
	                    string += String.fromCharCode((c & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
	                    i += 3;
	                }
	            }
	            return string;
	        }
	    }, {
	        key: "isFirefox",
	        value: function isFirefox() {
	            var bRet = false;
	            var szUserAgent = navigator.userAgent.toLowerCase();
	            var szBrowserVersion = "";
	            var iBrowserVersion = -1;
	            if (szUserAgent.match(/firefox\/([\d.]+)/)) {
	                szBrowserVersion = szUserAgent.match(/firefox\/([\d.]+)/)[1];
	                iBrowserVersion = parseInt(szBrowserVersion.split(".")[0], 10);
	                if (iBrowserVersion > -1) {
	                    bRet = true;
	                }
	            }
	            return bRet;
	        }
	    }]);

	    return Tool;
	}();

	var oTool = exports.oTool = new Tool();

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.StreamClient = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); //定制设备直连取流
	//设备直连取流
	//流媒体取流


	var _uuid = __webpack_require__(3);

	var _uuid2 = _interopRequireDefault(_uuid);

	var _directDeviceCustom = __webpack_require__(8);

	var _directDevice = __webpack_require__(9);

	var _liveMedia = __webpack_require__(10);

	var _localService = __webpack_require__(13);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	//本地服务取流

	/**
	 * @synopsis 取流类
	 *
	 * @note [ADD][2017-01-03]新建 by fengzhongjian
	 *
	 */
	var StreamClient = function () {
	    if (typeof Symbol === "undefined") {
	        return;
	    }
	    var WEBSOCKET = Symbol("WEBSOCKET");
	    var GETINDEX = Symbol("GETINDEX");
	    var PROTOCOLVERSION = Symbol("PROTOCOLVERSION");
	    var CIPHERSUITES = Symbol("CIPHERSUITES");

	    var oDirectDeviceCustom = new _directDeviceCustom.DirectDeviceCustom(); //定制设备直连取流
	    var oDirectDevice = new _directDevice.DirectDevice(); //设备直连取流
	    var oLiveMedia = new _liveMedia.LiveMedia(); //流媒体取流
	    var oLocalService = new _localService.LocalService(); //本地服务取流

	    var WebsocketClient = function () {
	        function WebsocketClient() {
	            _classCallCheck(this, WebsocketClient);

	            this[PROTOCOLVERSION] = "0.1"; //协议版本
	            this[CIPHERSUITES] = 0; //秘钥套件
	            this[WEBSOCKET] = []; //websocket对象列表
	            this.ERRORS = {//错误码
	            };
	            //openstream后保存当前通道号和当前码流类型
	            this[GETINDEX] = function (id) {
	                var iIndex = -1;
	                for (var i = 0, iLen = this[WEBSOCKET].length; i < iLen; i++) {
	                    if (this[WEBSOCKET][i].id === id) {
	                        iIndex = i;
	                        break;
	                    }
	                }
	                return iIndex;
	            };
	        }
	        /**
	         * @synopsis 开流, 此时设备的流还没有发出来
	           * @param {string} szUrl 取流路径，如ws://hostname:port/channel
	           * @param {object} oParams 取流需要涉及的相关参数
	           * @param {function} cbMessage 消息回调函数
	           * @param {function} cbClose 失败回调
	           * @returns {objcet} 返回Promise对象
	         */


	        _createClass(WebsocketClient, [{
	            key: 'openStream',
	            value: function openStream(szUrl, oParams, cbMessage, cbClose) {
	                var that = this;
	                var aUrl = szUrl.split(":"); //szUrl格式为ws://ip:port/channel/stream或wss://ip:port/channel/stream
	                var szProtocol = aUrl[0];
	                var szHostname = aUrl[1].split("//")[1];
	                var iPort = Math.floor(aUrl[2].split("/")[0]);
	                                    oParams = oParams || {};
                    var szSessionID = oParams.sessionID || oParams.session || "";
                    var iCurChannel = Math.floor(aUrl[2].split("/")[1] / 100); //通道号
	                var iCurStream = Math.floor(aUrl[2].split("/")[1] % 100) - 1; //码流类型
                    if(oParams.token){
                        var szToken = oParams.token || oParams.session || "";
                        szSessionID = szToken;
                        if(szUrl.indexOf('?')>-1){
                            iCurChannel=Math.floor(aUrl[2].split("?")[0].split("/")[1] / 100);
                            iCurStream = Math.floor(aUrl[2].split("?")[0].split("/")[1] % 100) - 1;
                            szUrl = szProtocol + "://" + szHostname + ":" + iPort + "/?"+aUrl[2].split("?")[1]+":"+aUrl[3]+ "&version=" + that[PROTOCOLVERSION] + "&cipherSuites=" + that[CIPHERSUITES] + "&token=" + szToken;
                        }
                        else{
                            szUrl = szProtocol + "://" + szHostname + ":" + iPort + "/?version=" + that[PROTOCOLVERSION] + "&cipherSuites=" + that[CIPHERSUITES] + "&token=" + szToken;
                        }
                    }
                    else{
                        if(szUrl.indexOf('?')>-1){
                            iCurChannel=Math.floor(aUrl[2].split("?")[0].split("/")[1] / 100);
                            iCurStream = Math.floor(aUrl[2].split("?")[0].split("/")[1] % 100) - 1;
                            szUrl = szProtocol + "://" + szHostname + ":" + iPort + "/?"+ aUrl[2].split("?")[1]+":"+aUrl[3] + "&version=" + that[PROTOCOLVERSION] + "&cipherSuites=" + that[CIPHERSUITES] + "&sessionID=" + szSessionID;
                        }
                        else{
                            szUrl = szProtocol + "://" + szHostname + ":" + iPort + "/?version=" + that[PROTOCOLVERSION] + "&cipherSuites=" + that[CIPHERSUITES] + "&sessionID=" + szSessionID;
                        }
                    }
                    var oWebsocket = new window.WebSocket(szUrl);
	                oWebsocket.binaryType = "arraybuffer";
	                var szId = _uuid2.default.v4(); //取流uuid，由于区分每条取流连接
	                // var iCurChannel = Math.floor(aUrl[2].split("/")[1] / 100); //通道号
	                // var iCurStream = Math.floor(aUrl[2].split("/")[1] % 100) - 1; //码流类型
	                if (iCurChannel === 0) {
	                    //表示零通道
	                    iCurStream = 0;
	                }
	                var promise = new Promise(function (resolve, reject) {
	                    oWebsocket.onopen = function () {
	                        if (!oParams.playURL && !oParams.sessionID && !oParams.token && !oParams.deviceSerial) {
	                            //定制设备取流，open就表示成功，因为没有命令码返回
	                            that[WEBSOCKET].push(oDirectDeviceCustom.createClientObject(oWebsocket, szId, iCurChannel, iCurStream));
	                            resolve(szId);
	                        }
	                    };
	                    oWebsocket.onmessage = function (e) {
	                        if (typeof e.data === "string") {
	                            var oJSON = JSON.parse(e.data);
	                            var iWebsocketIndex = that[GETINDEX](szId);
	                            if (oJSON && oJSON.version && oJSON.cipherSuite) {
	                                //建立websocket连接成功返回
	                                that[PROTOCOLVERSION] = oJSON.version;
	                                that[CIPHERSUITES] = parseInt(oJSON.cipherSuite, 10);
	                                if (oJSON && oJSON.PKD && oJSON.rand) {
	                                    that[WEBSOCKET].push(oLiveMedia.createClientObject(oWebsocket, szId, oJSON.PKD, oJSON.rand, oParams)); //流媒体
	                                } else {
	                                    var szPlayURL = "live://" + szHostname + ":" + iPort + "/" + iCurChannel + "/" + iCurStream;
	                                    if (that[CIPHERSUITES] === -1) {
	                                        that[WEBSOCKET].push(oLocalService.createClientObject(oWebsocket, szId, szPlayURL, oParams)); //本地服务
	                                    } else {
	                                        that[WEBSOCKET].push(oDirectDevice.createClientObject(oWebsocket, szId, szPlayURL)); //基线设备
	                                    }
	                                }
	                                resolve(szId);
	                                return;
	                            }
	                            if (oJSON && oJSON.sdp) {
	                                var aSadpHeadBuf = oDirectDevice.getMediaFromSdp(oJSON.sdp); //获取媒体头
	                                cbMessage({
	                                    bHead: true,
	                                    buf: aSadpHeadBuf
	                                });
	                            }
	                            if (oJSON && oJSON.cmd) {
	                                if (oJSON.cmd === "end") {
	                                    cbMessage({
	                                        type: "exception",
	                                        cmd: oJSON.cmd
	                                    }); //回放结束
	                                }
	                            }
	                            if (oJSON && oJSON.statusString) {
	                                if (oJSON.statusString.toLowerCase() === "ok") {
	                                    if (that[WEBSOCKET][iWebsocketIndex].resolve) {
	                                        that[WEBSOCKET][iWebsocketIndex].resolve(oJSON);
	                                    }
	                                }
	                                if (oJSON.statusString.toLowerCase() !== "ok") {
	                                    var oError = oDirectDevice.getError(oJSON);
	                                    if (iWebsocketIndex > -1) {
	                                        //建立连接即返回错误，此时iWebsocketIndex为-1
	                                        if (that[WEBSOCKET][iWebsocketIndex].reject) {
	                                            that[WEBSOCKET][iWebsocketIndex].reject(oError);
	                                        }
	                                    } else {
	                                        reject(oError);
	                                    }
	                                }
	                            }
	                        } else {
	                            var dataObj = {};
	                            var dataBuf = new Uint8Array(e.data);
	                            if (dataBuf.byteLength === 64 || dataBuf.byteLength === 40) {
	                                //媒体头包含在第一个64字节的数据包中
	                                var iMediaHeadIndex = -1; //回放和预览媒体头位置不一致，需要动态查询媒体头位置
	                                var iLen = dataBuf.byteLength;
	                                for (var i = 0; i < iLen; i++) {
	                                    if (dataBuf[i] === 73 && dataBuf[i + 1] === 77 && dataBuf[i + 2] === 75 && dataBuf[i + 3] === 72) {
	                                        iMediaHeadIndex = i;
	                                        break;
	                                    }
	                                }
	                                if (iMediaHeadIndex !== -1) {
	                                    var aHeadBuf = dataBuf.slice(iMediaHeadIndex, iMediaHeadIndex + 40);
	                                    dataObj = {
	                                        bHead: true,
	                                        buf: aHeadBuf
	                                    };
	                                } else {
	                                    dataObj = {
	                                        bHead: false,
	                                        buf: dataBuf
	                                    };
	                                }
	                            } else {
	                                dataObj = {
	                                    bHead: false,
	                                    buf: dataBuf
	                                };
	                            }
	                            cbMessage(dataObj);
	                            dataBuf = null;
	                            dataObj = null;
	                            e = null;
	                        }
	                    };
	                    oWebsocket.onclose = function () {
	                        for (var i = 0, iLen = that[WEBSOCKET].length; i < iLen; i++) {
	                            if (that[WEBSOCKET][i].id === szId) {
	                                that[WEBSOCKET][i].resolve(); //关闭连接后触发该事件表示关闭成功
	                                that[WEBSOCKET].splice(i, 1);

	                                setTimeout(function () {
	                                    cbClose();
	                                }, 200); //延时触发停止成功回调，保证停止成功

	                                break;
	                            }
	                        }
	                        reject(); //建立websocket连接时就触发onclose
	                    };
	                });
	                return promise;
	            }
	            /**
	             * @synopsis 开始取流
	             *
	             * @param {string} id websocket id，在openStream的时候生成
	               @param {string} szStartTime 开始时间
	               @param {string} szStopTime 结束时间
	             * @param {function} cbMessage 码流回调函数
	             *
	             * @returns {object} 返回Promise对象
	             */

	        }, {
	            key: 'startPlay',
	            value: function startPlay(id, szStartTime, szStopTime) {
	                var that = this;
	                var iWebsocketIndex = this[GETINDEX](id);
	                if (szStartTime && szStopTime && that[PROTOCOLVERSION] === "0.1") {
	                    szStartTime = szStartTime.replace(/-/g, "").replace(/:/g, "");
	                    szStopTime = szStopTime.replace(/-/g, "").replace(/:/g, "");
	                }
	                var promise = new Promise(function (resolve, reject) {
	                    if (iWebsocketIndex > -1) {
	                        that[WEBSOCKET][iWebsocketIndex].resolve = resolve;
	                        that[WEBSOCKET][iWebsocketIndex].reject = reject;
	                        var uIntCmd = null;
	                        if (!szStartTime || !szStopTime) {
	                            //预览
	                            if (that[WEBSOCKET][iWebsocketIndex].iCurChannel === 0 && that[PROTOCOLVERSION] === "0.1") {
	                                //零通道预览
	                                uIntCmd = oDirectDeviceCustom.zeroPlayCmd(that[WEBSOCKET][iWebsocketIndex].iCurChannel, that[WEBSOCKET][iWebsocketIndex].iCurStream);
	                            } else {
	                                //普通预览
	                                if (that[PROTOCOLVERSION] !== "0.1") {
	                                    if (that[CIPHERSUITES] === 0) {
	                                        uIntCmd = oLiveMedia.playCmd(that[WEBSOCKET][iWebsocketIndex]); //流媒体预览
	                                    } else if (that[CIPHERSUITES] === 1) {
	                                        uIntCmd = oDirectDevice.playCmd(that[WEBSOCKET][iWebsocketIndex].playURL); //基线普通预览
	                                    } else if (that[CIPHERSUITES] === -1) {
	                                        uIntCmd = oLocalService.playCmd(that[WEBSOCKET][iWebsocketIndex]); //本地服务预览
	                                    }
	                                } else {
	                                    uIntCmd = oDirectDeviceCustom.playCmd(that[WEBSOCKET][iWebsocketIndex].iCurChannel, that[WEBSOCKET][iWebsocketIndex].iCurStream); //定制普通预览
	                                }
	                            }
	                        } else {
	                            //回放
	                            if (that[PROTOCOLVERSION] !== "0.1") {
	                                if (that[CIPHERSUITES] === 0) {
	                                    uIntCmd = oLiveMedia.playbackCmd(that[WEBSOCKET][iWebsocketIndex], szStartTime, szStopTime); //流媒体回放
	                                } else if (that[CIPHERSUITES] === 1) {
	                                    uIntCmd = oDirectDevice.playbackCmd(szStartTime, szStopTime, that[WEBSOCKET][iWebsocketIndex].playURL); //基线设备回放
	                                } else if (that[CIPHERSUITES] === -1) {
	                                    uIntCmd = oLocalService.playbackCmd(that[WEBSOCKET][iWebsocketIndex], szStartTime, szStopTime); //本地服务回放
	                                }
	                            } else {
	                                //定制设备回放
	                                uIntCmd = oDirectDeviceCustom.playbackCmd(szStartTime, szStopTime, that[WEBSOCKET][iWebsocketIndex].iCurChannel, that[WEBSOCKET][iWebsocketIndex].iCurStream);
	                            }
	                        }
	                        that[WEBSOCKET][iWebsocketIndex].socket.send(uIntCmd);
	                        if (that[PROTOCOLVERSION] === "0.1") {
	                            //定制协议没有返回码，发送后直接认为发送成功
	                            resolve();
	                        }
	                    } else {
	                        if (that[PROTOCOLVERSION] === "0.1") {
	                            //定制协议没有返回码，发送后直接认为发送成功
	                            reject();
	                        }
	                    }
	                });
	                return promise;
	            }
	        }, {
	            key: 'singleFrame',
	            value: function singleFrame() {}
	            //do something

	            /**
	             * @synopsis 设置倍率
	             *
	             * @param {string} id websocket id在openStream的时候生成
	               @param {number} iRate 播放倍率
	             *
	             * @returns {object} Promise
	             */

	        }, {
	            key: 'setPlayRate',
	            value: function setPlayRate(id, iRate) {
	                var that = this;
	                var promise = new Promise(function (resolve, reject) {
	                    for (var i = 0, iLen = that[WEBSOCKET].length; i < iLen; i++) {
	                        if (that[WEBSOCKET][i].id === id) {
	                            if (that[PROTOCOLVERSION] === "0.1") {
	                                var uIntCmd = oDirectDeviceCustom.playRateCmd(iRate); //定制协议快慢放
	                                that[WEBSOCKET][i].socket.send(uIntCmd);
	                                resolve(); //定制协议没有返回码，发送后直接认为发送成功
	                                break;
	                            } else {
	                                that[WEBSOCKET][i].resolve = resolve;
	                                that[WEBSOCKET][i].reject = reject;
	                                var szCmd = oDirectDevice.playRateCmd(iRate); //标准协议快慢放
	                                that[WEBSOCKET][i].socket.send(szCmd);
	                            }
	                        }
	                    }
	                });
	                return promise;
	            }
	            /**
	             * @synopsis 定位回放
	             *
	             * @param {string} id websocket id在openStream的时候生成
	               @param {string} szStartTime 开始时间
	               @param {string} szStopTime 结束时间
	             *
	             * @returns {object} Promise
	             */

	        }, {
	            key: 'seek',
	            value: function seek(id, szStartTime, szStopTime) {
	                var that = this;
	                var promise = new Promise(function (resolve, reject) {
	                    for (var i = 0, iLen = that[WEBSOCKET].length; i < iLen; i++) {
	                        if (that[WEBSOCKET][i].id === id) {
	                            that[WEBSOCKET][i].resolve = resolve;
	                            that[WEBSOCKET][i].reject = reject;
	                            var szCmd = oLiveMedia.seekCmd(szStartTime, szStopTime);
	                            that[WEBSOCKET][i].socket.send(szCmd);
	                        }
	                    }
	                });
	                return promise;
	            }
	            /**
	             * @synopsis 暂停取流
	             *
	             * @param {string} id websocket id，在openStream的时候生成
	             *
	             * @returns {object} 返回Promise对象
	             */

	        }, {
	            key: 'pause',
	            value: function pause(id) {
	                var that = this;
	                var promise = new Promise(function (resolve, reject) {
	                    for (var i = 0, iLen = that[WEBSOCKET].length; i < iLen; i++) {
	                        if (that[WEBSOCKET][i].id === id) {
	                            if (that[PROTOCOLVERSION] === "0.1") {
	                                var uIntCmd = oDirectDeviceCustom.pauseCmd(); //定制协议暂停
	                                that[WEBSOCKET][i].socket.send(uIntCmd);
	                                resolve(); //定制协议没有返回码，发送后直接认为发送成功
	                                break;
	                            } else {
	                                that[WEBSOCKET][i].resolve = resolve;
	                                that[WEBSOCKET][i].reject = reject;
	                                var szCmd = oDirectDevice.pauseCmd(); //标准协议暂停
	                                that[WEBSOCKET][i].socket.send(szCmd);
	                            }
	                        }
	                    }
	                });
	                return promise;
	            }
	            /**
	             * @synopsis 透传协议
	             *
	             * @param {string} id websocket id，在openStream的时候生成
	             * @param {string} szCmd, 透传的命令码
	             *
	             * @returns {object} 返回Promise对象
	             */

	        }, {
	            key: 'transmission',
	            value: function transmission(id, szCmd) {
	                var that = this;
	                var promise = new Promise(function (resolve, reject) {
	                    for (var i = 0, iLen = that[WEBSOCKET].length; i < iLen; i++) {
	                        if (that[WEBSOCKET][i].id === id) {
	                            that[WEBSOCKET][i].resolve = resolve;
	                            that[WEBSOCKET][i].reject = reject;
	                            that[WEBSOCKET][i].socket.send(szCmd);
	                        }
	                    }
	                });
	                return promise;
	            }
	            /**
	             * @synopsis 恢复取流
	             *
	             * @param {string} id websocket id，在openStream的时候生成
	             *
	             * @returns {object} 返回Promise对象
	             */

	        }, {
	            key: 'resume',
	            value: function resume(id) {
	                var that = this;
	                var promise = new Promise(function (resolve, reject) {
	                    for (var i = 0, iLen = that[WEBSOCKET].length; i < iLen; i++) {
	                        if (that[WEBSOCKET][i].id === id) {
	                            if (that[PROTOCOLVERSION] === "0.1") {
	                                var uIntCmd = oDirectDeviceCustom.resumeCmd(); //定制协议恢复
	                                that[WEBSOCKET][i].socket.send(uIntCmd);
	                                resolve(); //定制协议没有返回码，发送后直接认为发送成功
	                                break;
	                            } else {
	                                that[WEBSOCKET][i].resolve = resolve;
	                                that[WEBSOCKET][i].reject = reject;
	                                var szCmd = oDirectDevice.resumeCmd(); //定制协议恢复
	                                that[WEBSOCKET][i].socket.send(szCmd);
	                            }
	                        }
	                    }
	                });
	                return promise;
	            }
	            /**
	             * @synopsis 停止取流
	             *
	             * @param {string} id websocket id，在openStream的时候生成
	             *
	             * @returns {object} 返回Promise对象
	             */

	        }, {
	            key: 'stop',
	            value: function stop(id) {
	                var that = this;
	                var promise = new Promise(function (resolve, reject) {
	                    if (!id) {
	                        reject();
	                    } else {
	                        var iIndex = -1;
	                        for (var i = 0, iLen = that[WEBSOCKET].length; i < iLen; i++) {
	                            if (that[WEBSOCKET][i].id === id) {
	                                iIndex = i;
	                                that[WEBSOCKET][i].resolve = resolve; //onclose中处理，判断是否停止成功
	                                that[WEBSOCKET][i].socket.close(1000, "CLOSE");
	                                break;
	                            }
	                        }
	                        if (iIndex === -1) {
	                            reject();
	                        }
	                    }
	                });
	                return promise;
	            }
	            /**
	             * @synopsis 停止所有通道取流
	             *
	             * @returns {object} 返回Promise对象
	             */

	        }, {
	            key: 'stopAll',
	            value: function stopAll() {
	                var that = this;
	                for (var i = 0, iLen = that[WEBSOCKET].length; i < iLen; i++) {
	                    that[WEBSOCKET][i].socket.close(1000, "CLOSE");
	                }
	            }
	        }]);

	        return WebsocketClient;
	    }();

	    return WebsocketClient;
	}();

	exports.StreamClient = StreamClient;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var v1 = __webpack_require__(4);
	var v4 = __webpack_require__(7);

	var uuid = v4;
	uuid.v1 = v1;
	uuid.v4 = v4;

	module.exports = uuid;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// Unique ID creation requires a high quality random # generator.  We feature
	// detect to determine the best RNG source, normalizing to a function that
	// returns 128-bits of randomness, since that's what's usually required
	var rng = __webpack_require__(5);
	var bytesToUuid = __webpack_require__(6);

	// **`v1()` - Generate time-based UUID**
	//
	// Inspired by https://github.com/LiosK/UUID.js
	// and http://docs.python.org/library/uuid.html

	// random #'s we need to init node and clockseq
	var _seedBytes = rng();

	// Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
	var _nodeId = [_seedBytes[0] | 0x01, _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]];

	// Per 4.2.2, randomize (14 bit) clockseq
	var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

	// Previous uuid creation time
	var _lastMSecs = 0,
	    _lastNSecs = 0;

	// See https://github.com/broofa/node-uuid for API details
	function v1(options, buf, offset) {
	  var i = buf && offset || 0;
	  var b = buf || [];

	  options = options || {};

	  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

	  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
	  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
	  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
	  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
	  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

	  // Per 4.2.1.2, use count of uuid's generated during the current clock
	  // cycle to simulate higher resolution clock
	  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

	  // Time since last uuid creation (in msecs)
	  var dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000;

	  // Per 4.2.1.2, Bump clockseq on clock regression
	  if (dt < 0 && options.clockseq === undefined) {
	    clockseq = clockseq + 1 & 0x3fff;
	  }

	  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
	  // time interval
	  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
	    nsecs = 0;
	  }

	  // Per 4.2.1.2 Throw error if too many uuids are requested
	  if (nsecs >= 10000) {
	    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
	  }

	  _lastMSecs = msecs;
	  _lastNSecs = nsecs;
	  _clockseq = clockseq;

	  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
	  msecs += 12219292800000;

	  // `time_low`
	  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
	  b[i++] = tl >>> 24 & 0xff;
	  b[i++] = tl >>> 16 & 0xff;
	  b[i++] = tl >>> 8 & 0xff;
	  b[i++] = tl & 0xff;

	  // `time_mid`
	  var tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
	  b[i++] = tmh >>> 8 & 0xff;
	  b[i++] = tmh & 0xff;

	  // `time_high_and_version`
	  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
	  b[i++] = tmh >>> 16 & 0xff;

	  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
	  b[i++] = clockseq >>> 8 | 0x80;

	  // `clock_seq_low`
	  b[i++] = clockseq & 0xff;

	  // `node`
	  var node = options.node || _nodeId;
	  for (var n = 0; n < 6; ++n) {
	    b[i + n] = node[n];
	  }

	  return buf ? buf : bytesToUuid(b);
	}

	module.exports = v1;

/***/ },
/* 5 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {"use strict";

	// Unique ID creation requires a high quality random # generator.  In the
	// browser this is a little complicated due to unknown quality of Math.random()
	// and inconsistent support for the `crypto` API.  We do the best we can via
	// feature-detection
	var rng;

	var crypto = global.crypto || global.msCrypto; // for IE 11
	if (crypto && crypto.getRandomValues) {
	  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
	  var rnds8 = new Uint8Array(16);
	  rng = function whatwgRNG() {
	    crypto.getRandomValues(rnds8);
	    return rnds8;
	  };
	}

	if (!rng) {
	  // Math.random()-based (RNG)
	  //
	  // If all else fails, use Math.random().  It's fast, but is of unspecified
	  // quality.
	  var rnds = new Array(16);
	  rng = function rng() {
	    for (var i = 0, r; i < 16; i++) {
	      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
	      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
	    }

	    return rnds;
	  };
	}

	module.exports = rng;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Convert array of 16 byte values to UUID string format of the form:
	 * XXXXXXXX-XXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
	 */
	var byteToHex = [];
	for (var i = 0; i < 256; ++i) {
	  byteToHex[i] = (i + 0x100).toString(16).substr(1);
	}

	function bytesToUuid(buf, offset) {
	  var i = offset || 0;
	  var bth = byteToHex;
	  return bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]];
	}

	module.exports = bytesToUuid;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var rng = __webpack_require__(5);
	var bytesToUuid = __webpack_require__(6);

	function v4(options, buf, offset) {
	  var i = buf && offset || 0;

	  if (typeof options == 'string') {
	    buf = options == 'binary' ? new Array(16) : null;
	    options = null;
	  }
	  options = options || {};

	  var rnds = options.random || (options.rng || rng)();

	  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
	  rnds[6] = rnds[6] & 0x0f | 0x40;
	  rnds[8] = rnds[8] & 0x3f | 0x80;

	  // Copy bytes to buffer, if provided
	  if (buf) {
	    for (var ii = 0; ii < 16; ++ii) {
	      buf[i + ii] = rnds[ii];
	    }
	  }

	  return buf || bytesToUuid(rnds);
	}

	module.exports = v4;

/***/ },
/* 8 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * @synopsis 定制设备取流
	 *
	 * @note [ADD][2017-07-28]新建 by fengzhongjian
	 *
	 */
	var DirectDeviceCustom = function () {
	    if (typeof Symbol === "undefined") {
	        return;
	    }

	    var DeviceDirect = function () {
	        function DeviceDirect() {
	            _classCallCheck(this, DeviceDirect);
	        }
	        //to do

	        //创建取流客户端对象


	        _createClass(DeviceDirect, [{
	            key: "createClientObject",
	            value: function createClientObject(oWebsocket, szId, iCurChannel, iCurStream) {
	                return {
	                    socket: oWebsocket,
	                    id: szId,
	                    iCurChannel: iCurChannel,
	                    iCurStream: iCurStream,
	                    resolve: null,
	                    reject: null
	                };
	            }
	            //零通道预览

	        }, {
	            key: "zeroPlayCmd",
	            value: function zeroPlayCmd(iCurChannel, iCurStream) {
	                var aCmd = [0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x13, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, iCurChannel + 1, 0x00, 0x00, 0x00, iCurStream, 0x00, 0x00, 0x04, 0x00];
	                return new Uint8Array(aCmd);
	            }
	            //普通通道预览

	        }, {
	            key: "playCmd",
	            value: function playCmd(iCurChannel, iCurStream) {
	                var aCmd = [0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, iCurChannel, 0x00, 0x00, 0x00, iCurStream, 0x00, 0x00, 0x04, 0x00];
	                return new Uint8Array(aCmd);
	            }
	            //回放

	        }, {
	            key: "playbackCmd",
	            value: function playbackCmd(szStartTime, szStopTime, iCurChannel, iCurStream) {
	                var szStartDayMonthYear = szStartTime.split("T")[0];
	                var szStartHourMinSec = szStartTime.split("T")[1];
	                var szStartYear = "0" + parseInt(szStartDayMonthYear.substring(0, 4), 10).toString(16);
	                var iStartMonth = parseInt(szStartDayMonthYear.substring(4, 6), 10);
	                var iStartDay = parseInt(szStartDayMonthYear.substring(6), 10);
	                var iStartHour = parseInt(szStartHourMinSec.substring(0, 2), 10);
	                var iStartMin = parseInt(szStartHourMinSec.substring(2, 4), 10);
	                var iStartSec = parseInt(szStartHourMinSec.substring(4, 6), 10);

	                var szStopDayMonthYear = szStopTime.split("T")[0];
	                var szStopHourMinSec = szStopTime.split("T")[1];
	                var szStopYear = "0" + parseInt(szStopDayMonthYear.substring(0, 4), 10).toString(16);
	                var iStopMonth = parseInt(szStopDayMonthYear.substring(4, 6), 10);
	                //let iStopDay = parseInt(szStopDayMonthYear.substring(6), 10);
	                var iStopHour = parseInt(szStopHourMinSec.substring(0, 2), 10);
	                var iStopMin = parseInt(szStopHourMinSec.substring(2, 4), 10);
	                var iStopSec = parseInt(szStopHourMinSec.substring(4, 6), 10);
	                var aCmd = [/*header*/0x00, 0x00, 0x00, 0x60, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0x01, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	                /*channel*/0x00, 0x00, 0x00, iCurChannel, /*start time*/0x00, 0x00, parseInt(szStartYear.substring(0, 2), 16), parseInt(szStartYear.substring(2, 4), 16), 0x00, 0x00, 0x00, iStartMonth, 0x00, 0x00, 0x00, iStartDay, 0x00, 0x00, 0x00, iStartHour, 0x00, 0x00, 0x00, iStartMin, 0x00, 0x00, 0x00, iStartSec,
	                /*end time*/0x00, 0x00, parseInt(szStopYear.substring(0, 2), 16), parseInt(szStopYear.substring(2, 4), 16), 0x00, 0x00, 0x00, iStopMonth, 0x00, 0x00, 0x00, iStartDay, 0x00, 0x00, 0x00, iStopHour, 0x00, 0x00, 0x00, iStopMin, 0x00, 0x00, 0x00, iStopSec,
	                /*是否抽帧*/0x00, /*是否下载*/0x00, /*录像卷类型 0普通卷，1存档卷*/0x00, /*存档卷号*/0x00, /*存档卷上的录像文件索引*/0x00, 0x00, 0x00, 0x00,
	                /*码流类型 0主码流，1子码流，2三码流*/iCurStream, /*保留字*/0x00, 0x00, 0x00];
	                return new Uint8Array(aCmd);
	            }
	            //回放速率

	        }, {
	            key: "playRateCmd",
	            value: function playRateCmd(iRate) {
	                var szHex = (parseInt(iRate, 10) >>> 0).toString(16).toLocaleUpperCase().toString(16);
	                for (var j = szHex.length; j < 8; j++) {
	                    //对字符串进行补0，筹齐8位
	                    szHex = "0" + szHex;
	                }
	                var aRate = [0, 0, 0, 0]; //4字节16机制表示
	                for (var _j = 0, iLenRate = szHex.length; _j < iLenRate; _j = _j + 2) {
	                    aRate[Math.floor(_j / 2)] = parseInt(szHex.substring(_j, _j + 2), 16);
	                }
	                var aCmd = [/*header*/0x00, 0x00, 0x00, 0x24, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0x01, 0x2f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, aRate[0], aRate[1], aRate[2], aRate[3]];
	                return new Uint8Array(aCmd);
	            }
	            //回放暂停

	        }, {
	            key: "pauseCmd",
	            value: function pauseCmd() {
	                var aCmd = [/*header*/0x00, 0x00, 0x00, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0x01, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
	                return new Uint8Array(aCmd);
	            }
	            //恢复命令

	        }, {
	            key: "resumeCmd",
	            value: function resumeCmd() {
	                var aCmd = [/*header*/0x00, 0x00, 0x00, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0x01, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
	                return new Uint8Array(aCmd);
	            }
	        }]);

	        return DeviceDirect;
	    }();

	    return DeviceDirect;
	}();

	exports.DirectDeviceCustom = DirectDeviceCustom;

/***/ },
/* 9 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * @synopsis 直连设备取流
	 *
	 * @note [ADD][2017-07-28]新建 by fengzhongjian
	 *
	 */
	var ERROR_STREAM_UNKNOWN = 3001; //未知取流错误
	var ERROR_STREAM_LIMIT = 3002; //资源上限
	var ERROR_BAD_AUTH = 3003; //认证失败

	var DirectDevice = function () {
	    if (typeof Symbol === "undefined") {
	        return;
	    }

	    var DeviceDirect = function () {
	        function DeviceDirect() {
	            _classCallCheck(this, DeviceDirect);
	        }
	        //to do

	        //创建取流客户端对象


	        _createClass(DeviceDirect, [{
	            key: "createClientObject",
	            value: function createClientObject(oWebsocket, szId, szPlayURL) {
	                return {
	                    socket: oWebsocket,
	                    id: szId,
	                    playURL: szPlayURL,
	                    resolve: null,
	                    reject: null
	                };
	            }
	            //从sdp信息获取媒体头

	        }, {
	            key: "getMediaFromSdp",
	            value: function getMediaFromSdp(szSdp) {
	                var iMediaIndex = szSdp.indexOf("MEDIAINFO=") + 10;
	                var szMediaInfo = szSdp.slice(iMediaIndex, iMediaIndex + 80);
	                var aMediaInfo = [];
	                for (var i = 0, iLen = szMediaInfo.length / 2; i < iLen; i++) {
	                    aMediaInfo[i] = parseInt(szMediaInfo.slice(i * 2, i * 2 + 2), 16);
	                }
	                return new Uint8Array(aMediaInfo);
	            }
	            //普通通道预览

	        }, {
	            key: "playCmd",
	            value: function playCmd(szPlayURL) {
	                var oCmd = {
	                    sequence: 0,
	                    cmd: 'realplay',
	                    url: szPlayURL
	                };
	                return JSON.stringify(oCmd);
	            }
	            //回放

	        }, {
	            key: "playbackCmd",
	            value: function playbackCmd(szStartTime, szStopTime, szPlayURL) {
	                var oCmd = {
	                    sequence: 0,
	                    cmd: 'playback',
	                    url: szPlayURL,
	                    startTime: szStartTime,
	                    endTime: szStopTime
	                };
	                return JSON.stringify(oCmd);
	            }
	            //回放速率

	        }, {
	            key: "playRateCmd",
	            value: function playRateCmd(iRate) {
	                var oCmd = {
	                    sequence: 0,
	                    cmd: "speed",
	                    rate: iRate
	                };
	                return JSON.stringify(oCmd);
	            }
	            //回放暂停

	        }, {
	            key: "pauseCmd",
	            value: function pauseCmd() {
	                var oCmd = {
	                    sequence: 0,
	                    cmd: "pause"
	                };
	                return JSON.stringify(oCmd);
	            }
	            //恢复命令

	        }, {
	            key: "resumeCmd",
	            value: function resumeCmd() {
	                var oCmd = {
	                    sequence: 0,
	                    cmd: "resume"
	                };
	                return JSON.stringify(oCmd);
	            }
	            //获取取流错误

	        }, {
	            key: "getError",
	            value: function getError(oError) {
	                var iErrorNum = ERROR_STREAM_UNKNOWN;
	                if (oError) {
	                    if (parseInt(oError.statusCode, 10) === 6 && oError.subStatusCode === "streamLimit") {
	                        iErrorNum = ERROR_STREAM_LIMIT;
	                    } else if (parseInt(oError.statusCode, 10) === 4 && oError.subStatusCode === "badAuthorization") {
	                        iErrorNum = ERROR_BAD_AUTH;
	                    }
	                }
	                return {
	                    iErrorNum: iErrorNum,
	                    oError: oError
	                };
	            }
	        }]);

	        return DeviceDirect;
	    }();

	    return DeviceDirect;
	}();

	exports.DirectDevice = DirectDevice;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.LiveMedia = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @synopsis 流媒体取流
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @note [ADD][2017-07-28]新建 by fengzhongjian
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


	var _cryptico = __webpack_require__(11);

	var _cryptico2 = _interopRequireDefault(_cryptico);

	var _aes = __webpack_require__(12);

	var _aes2 = _interopRequireDefault(_aes);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var LiveMedia = function () {
	    if (typeof Symbol === "undefined") {
	        return;
	    }

	    var MediaLive = function () {
	        function MediaLive() {
	            _classCallCheck(this, MediaLive);
	        }
	        //to do

	        //创建取流客户端对象


	        _createClass(MediaLive, [{
	            key: 'createClientObject',
	            value: function createClientObject(oWebsocket, szId, szPKD, szRand, oParams) {
	                var key = _aes2.default.AES.encrypt(new Date().getTime().toString(), _aes2.default.enc.Hex.parse("1234567891234567123456789123456712345678912345671234567891234567"), {
	                    mode: _aes2.default.mode.CBC,
	                    iv: _aes2.default.enc.Hex.parse("12345678912345671234567891234567"),
	                    padding: _aes2.default.pad.Pkcs7
	                }).ciphertext.toString();
	                if (key.length < 64) {
	                    key = key + key;
	                }
	                var iv = _aes2.default.AES.encrypt(new Date().getTime().toString(), _aes2.default.enc.Hex.parse("12345678912345671234567891234567"), {
	                    mode: _aes2.default.mode.CBC,
	                    iv: _aes2.default.enc.Hex.parse("12345678912345671234567891234567"),
	                    padding: _aes2.default.pad.Pkcs7
	                }).ciphertext.toString();
	                return {
	                    socket: oWebsocket,
	                    id: szId,
	                    PKD: szPKD,
	                    rand: szRand,
	                    playURL: oParams.playURL || "",
	                    auth: oParams.auth || "",
	                    token: oParams.token || "",
	                    key: key,
	                    iv: iv,
	                    resolve: null,
	                    reject: null
	                };
	            }
	            //预览命令

	        }, {
	            key: 'playCmd',
	            value: function playCmd(oWebsocket) {
	                var oCmd = {
	                    sequence: 0,
	                    cmd: 'realplay',
	                    url: oWebsocket.playURL,
	                    key: _cryptico2.default.encrypt(oWebsocket.iv + ":" + oWebsocket.key, oWebsocket.PKD).cipher.split("?")[0],
	                    authorization: _aes2.default.AES.encrypt(oWebsocket.rand + ":" + oWebsocket.auth, _aes2.default.enc.Hex.parse(oWebsocket.key), {
	                        mode: _aes2.default.mode.CBC,
	                        iv: _aes2.default.enc.Hex.parse(oWebsocket.iv),
	                        padding: _aes2.default.pad.Pkcs7
	                    }).ciphertext.toString(),
	                    token: _aes2.default.AES.encrypt(oWebsocket.token, _aes2.default.enc.Hex.parse(oWebsocket.key), {
	                        mode: _aes2.default.mode.CBC,
	                        iv: _aes2.default.enc.Hex.parse(oWebsocket.iv),
	                        padding: _aes2.default.pad.Pkcs7
	                    }).ciphertext.toString()
	                };
	                return JSON.stringify(oCmd);
	            }
	            //回放

	        }, {
	            key: 'playbackCmd',
	            value: function playbackCmd(oWebsocket, szStartTime, szStopTime) {
	                var oCmd = {
	                    sequence: 0,
	                    cmd: 'playback',
	                    url: oWebsocket.playURL,
	                    key: _cryptico2.default.encrypt(oWebsocket.iv + ":" + oWebsocket.key, oWebsocket.PKD).cipher.split("?")[0],
	                    authorization: _aes2.default.AES.encrypt(oWebsocket.rand + ":" + oWebsocket.auth, _aes2.default.enc.Hex.parse(oWebsocket.key), {
	                        mode: _aes2.default.mode.CBC,
	                        iv: _aes2.default.enc.Hex.parse(oWebsocket.iv),
	                        padding: _aes2.default.pad.Pkcs7
	                    }).ciphertext.toString(),
	                    token: _aes2.default.AES.encrypt(oWebsocket.token, _aes2.default.enc.Hex.parse(oWebsocket.key), {
	                        mode: _aes2.default.mode.CBC,
	                        iv: _aes2.default.enc.Hex.parse(oWebsocket.iv),
	                        padding: _aes2.default.pad.Pkcs7
	                    }).ciphertext.toString(),
	                    startTime: szStartTime,
	                    endTime: szStopTime
	                };
	                return JSON.stringify(oCmd);
	            }
	            //定位回放

	        }, {
	            key: 'seekCmd',
	            value: function seekCmd(szStartTime, szStopTime) {
	                var oCmd = {
	                    sequence: 0,
	                    cmd: "seek",
	                    startTime: szStartTime,
	                    endTime: szStopTime
	                };
	                return JSON.stringify(oCmd);
	            }
	        }]);

	        return MediaLive;
	    }();

	    return MediaLive;
	}();

	exports.LiveMedia = LiveMedia;

/***/ },
/* 11 */
/***/ function(module, exports) {

	"use strict";

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var navigator = { appName: "Netscape", appVersion: 40 };
	var dbits,
	    canary = 244837814094590,
	    j_lm = (canary & 16777215) == 15715070;function BigInteger(a, b, c) {
	  a != null && ("number" == typeof a ? this.fromNumber(a, b, c) : b == null && "string" != typeof a ? this.fromString(a, 256) : this.fromString(a, b));
	}function nbi() {
	  return new BigInteger(null);
	}function am1(a, b, c, d, e, g) {
	  for (; --g >= 0;) {
	    var h = b * this[a++] + c[d] + e,
	        e = Math.floor(h / 67108864);c[d++] = h & 67108863;
	  }return e;
	}
	function am2(a, b, c, d, e, g) {
	  var h = b & 32767;for (b >>= 15; --g >= 0;) {
	    var f = this[a] & 32767,
	        o = this[a++] >> 15,
	        p = b * f + o * h,
	        f = h * f + ((p & 32767) << 15) + c[d] + (e & 1073741823),
	        e = (f >>> 30) + (p >>> 15) + b * o + (e >>> 30);c[d++] = f & 1073741823;
	  }return e;
	}function am3(a, b, c, d, e, g) {
	  var h = b & 16383;for (b >>= 14; --g >= 0;) {
	    var f = this[a] & 16383,
	        o = this[a++] >> 14,
	        p = b * f + o * h,
	        f = h * f + ((p & 16383) << 14) + c[d] + e,
	        e = (f >> 28) + (p >> 14) + b * o;c[d++] = f & 268435455;
	  }return e;
	}
	j_lm && navigator.appName == "Microsoft Internet Explorer" ? (BigInteger.prototype.am = am2, dbits = 30) : j_lm && navigator.appName != "Netscape" ? (BigInteger.prototype.am = am1, dbits = 26) : (BigInteger.prototype.am = am3, dbits = 28);BigInteger.prototype.DB = dbits;BigInteger.prototype.DM = (1 << dbits) - 1;BigInteger.prototype.DV = 1 << dbits;var BI_FP = 52;BigInteger.prototype.FV = Math.pow(2, BI_FP);BigInteger.prototype.F1 = BI_FP - dbits;BigInteger.prototype.F2 = 2 * dbits - BI_FP;var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz",
	    BI_RC = [],
	    rr,
	    vv;
	rr = "0".charCodeAt(0);for (vv = 0; vv <= 9; ++vv) {
	  BI_RC[rr++] = vv;
	}rr = "a".charCodeAt(0);for (vv = 10; vv < 36; ++vv) {
	  BI_RC[rr++] = vv;
	}rr = "A".charCodeAt(0);for (vv = 10; vv < 36; ++vv) {
	  BI_RC[rr++] = vv;
	}function int2char(a) {
	  return BI_RM.charAt(a);
	}function intAt(a, b) {
	  var c = BI_RC[a.charCodeAt(b)];return c == null ? -1 : c;
	}function bnpCopyTo(a) {
	  for (var b = this.t - 1; b >= 0; --b) {
	    a[b] = this[b];
	  }a.t = this.t;a.s = this.s;
	}function bnpFromInt(a) {
	  this.t = 1;this.s = a < 0 ? -1 : 0;a > 0 ? this[0] = a : a < -1 ? this[0] = a + DV : this.t = 0;
	}
	function nbv(a) {
	  var b = nbi();b.fromInt(a);return b;
	}
	function bnpFromString(a, b) {
	  var c;if (b == 16) c = 4;else if (b == 8) c = 3;else if (b == 256) c = 8;else if (b == 2) c = 1;else if (b == 32) c = 5;else if (b == 4) c = 2;else {
	    this.fromRadix(a, b);return;
	  }this.s = this.t = 0;for (var d = a.length, e = !1, g = 0; --d >= 0;) {
	    var h = c == 8 ? a[d] & 255 : intAt(a, d);h < 0 ? a.charAt(d) == "-" && (e = !0) : (e = !1, g == 0 ? this[this.t++] = h : g + c > this.DB ? (this[this.t - 1] |= (h & (1 << this.DB - g) - 1) << g, this[this.t++] = h >> this.DB - g) : this[this.t - 1] |= h << g, g += c, g >= this.DB && (g -= this.DB));
	  }if (c == 8 && (a[0] & 128) != 0) this.s = -1, g > 0 && (this[this.t - 1] |= (1 << this.DB - g) - 1 << g);this.clamp();e && BigInteger.ZERO.subTo(this, this);
	}function bnpClamp() {
	  for (var a = this.s & this.DM; this.t > 0 && this[this.t - 1] == a;) {
	    --this.t;
	  }
	}
	function bnToString(a) {
	  if (this.s < 0) return "-" + this.negate().toString(a);if (a == 16) a = 4;else if (a == 8) a = 3;else if (a == 2) a = 1;else if (a == 32) a = 5;else if (a == 64) a = 6;else if (a == 4) a = 2;else return this.toRadix(a);var b = (1 << a) - 1,
	      c,
	      d = !1,
	      e = "",
	      g = this.t,
	      h = this.DB - g * this.DB % a;if (g-- > 0) {
	    if (h < this.DB && (c = this[g] >> h) > 0) d = !0, e = int2char(c);for (; g >= 0;) {
	      h < a ? (c = (this[g] & (1 << h) - 1) << a - h, c |= this[--g] >> (h += this.DB - a)) : (c = this[g] >> (h -= a) & b, h <= 0 && (h += this.DB, --g)), c > 0 && (d = !0), d && (e += int2char(c));
	    }
	  }return d ? e : "0";
	}
	function bnNegate() {
	  var a = nbi();BigInteger.ZERO.subTo(this, a);return a;
	}function bnAbs() {
	  return this.s < 0 ? this.negate() : this;
	}function bnCompareTo(a) {
	  var b = this.s - a.s;if (b != 0) return b;var c = this.t,
	      b = c - a.t;if (b != 0) return b;for (; --c >= 0;) {
	    if ((b = this[c] - a[c]) != 0) return b;
	  }return 0;
	}function nbits(a) {
	  var b = 1,
	      c;if ((c = a >>> 16) != 0) a = c, b += 16;if ((c = a >> 8) != 0) a = c, b += 8;if ((c = a >> 4) != 0) a = c, b += 4;if ((c = a >> 2) != 0) a = c, b += 2;a >> 1 != 0 && (b += 1);return b;
	}
	function bnBitLength() {
	  return this.t <= 0 ? 0 : this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ this.s & this.DM);
	}function bnpDLShiftTo(a, b) {
	  var c;for (c = this.t - 1; c >= 0; --c) {
	    b[c + a] = this[c];
	  }for (c = a - 1; c >= 0; --c) {
	    b[c] = 0;
	  }b.t = this.t + a;b.s = this.s;
	}function bnpDRShiftTo(a, b) {
	  for (var c = a; c < this.t; ++c) {
	    b[c - a] = this[c];
	  }b.t = Math.max(this.t - a, 0);b.s = this.s;
	}
	function bnpLShiftTo(a, b) {
	  var c = a % this.DB,
	      d = this.DB - c,
	      e = (1 << d) - 1,
	      g = Math.floor(a / this.DB),
	      h = this.s << c & this.DM,
	      f;for (f = this.t - 1; f >= 0; --f) {
	    b[f + g + 1] = this[f] >> d | h, h = (this[f] & e) << c;
	  }for (f = g - 1; f >= 0; --f) {
	    b[f] = 0;
	  }b[g] = h;b.t = this.t + g + 1;b.s = this.s;b.clamp();
	}
	function bnpRShiftTo(a, b) {
	  b.s = this.s;var c = Math.floor(a / this.DB);if (c >= this.t) b.t = 0;else {
	    var d = a % this.DB,
	        e = this.DB - d,
	        g = (1 << d) - 1;b[0] = this[c] >> d;for (var h = c + 1; h < this.t; ++h) {
	      b[h - c - 1] |= (this[h] & g) << e, b[h - c] = this[h] >> d;
	    }d > 0 && (b[this.t - c - 1] |= (this.s & g) << e);b.t = this.t - c;b.clamp();
	  }
	}
	function bnpSubTo(a, b) {
	  for (var c = 0, d = 0, e = Math.min(a.t, this.t); c < e;) {
	    d += this[c] - a[c], b[c++] = d & this.DM, d >>= this.DB;
	  }if (a.t < this.t) {
	    for (d -= a.s; c < this.t;) {
	      d += this[c], b[c++] = d & this.DM, d >>= this.DB;
	    }d += this.s;
	  } else {
	    for (d += this.s; c < a.t;) {
	      d -= a[c], b[c++] = d & this.DM, d >>= this.DB;
	    }d -= a.s;
	  }b.s = d < 0 ? -1 : 0;d < -1 ? b[c++] = this.DV + d : d > 0 && (b[c++] = d);b.t = c;b.clamp();
	}
	function bnpMultiplyTo(a, b) {
	  var c = this.abs(),
	      d = a.abs(),
	      e = c.t;for (b.t = e + d.t; --e >= 0;) {
	    b[e] = 0;
	  }for (e = 0; e < d.t; ++e) {
	    b[e + c.t] = c.am(0, d[e], b, e, 0, c.t);
	  }b.s = 0;b.clamp();this.s != a.s && BigInteger.ZERO.subTo(b, b);
	}function bnpSquareTo(a) {
	  for (var b = this.abs(), c = a.t = 2 * b.t; --c >= 0;) {
	    a[c] = 0;
	  }for (c = 0; c < b.t - 1; ++c) {
	    var d = b.am(c, b[c], a, 2 * c, 0, 1);if ((a[c + b.t] += b.am(c + 1, 2 * b[c], a, 2 * c + 1, d, b.t - c - 1)) >= b.DV) a[c + b.t] -= b.DV, a[c + b.t + 1] = 1;
	  }a.t > 0 && (a[a.t - 1] += b.am(c, b[c], a, 2 * c, 0, 1));a.s = 0;a.clamp();
	}
	function bnpDivRemTo(a, b, c) {
	  var d = a.abs();if (!(d.t <= 0)) {
	    var e = this.abs();if (e.t < d.t) b != null && b.fromInt(0), c != null && this.copyTo(c);else {
	      c == null && (c = nbi());var g = nbi(),
	          h = this.s,
	          a = a.s,
	          f = this.DB - nbits(d[d.t - 1]);f > 0 ? (d.lShiftTo(f, g), e.lShiftTo(f, c)) : (d.copyTo(g), e.copyTo(c));d = g.t;e = g[d - 1];if (e != 0) {
	        var o = e * (1 << this.F1) + (d > 1 ? g[d - 2] >> this.F2 : 0),
	            p = this.FV / o,
	            o = (1 << this.F1) / o,
	            q = 1 << this.F2,
	            n = c.t,
	            k = n - d,
	            j = b == null ? nbi() : b;g.dlShiftTo(k, j);c.compareTo(j) >= 0 && (c[c.t++] = 1, c.subTo(j, c));BigInteger.ONE.dlShiftTo(d, j);for (j.subTo(g, g); g.t < d;) {
	          g[g.t++] = 0;
	        }for (; --k >= 0;) {
	          var l = c[--n] == e ? this.DM : Math.floor(c[n] * p + (c[n - 1] + q) * o);if ((c[n] += g.am(0, l, c, k, 0, d)) < l) {
	            g.dlShiftTo(k, j);for (c.subTo(j, c); c[n] < --l;) {
	              c.subTo(j, c);
	            }
	          }
	        }b != null && (c.drShiftTo(d, b), h != a && BigInteger.ZERO.subTo(b, b));c.t = d;c.clamp();f > 0 && c.rShiftTo(f, c);h < 0 && BigInteger.ZERO.subTo(c, c);
	      }
	    }
	  }
	}function bnMod(a) {
	  var b = nbi();this.abs().divRemTo(a, null, b);this.s < 0 && b.compareTo(BigInteger.ZERO) > 0 && a.subTo(b, b);return b;
	}function Classic(a) {
	  this.m = a;
	}
	function cConvert(a) {
	  return a.s < 0 || a.compareTo(this.m) >= 0 ? a.mod(this.m) : a;
	}function cRevert(a) {
	  return a;
	}function cReduce(a) {
	  a.divRemTo(this.m, null, a);
	}function cMulTo(a, b, c) {
	  a.multiplyTo(b, c);this.reduce(c);
	}function cSqrTo(a, b) {
	  a.squareTo(b);this.reduce(b);
	}Classic.prototype.convert = cConvert;Classic.prototype.revert = cRevert;Classic.prototype.reduce = cReduce;Classic.prototype.mulTo = cMulTo;Classic.prototype.sqrTo = cSqrTo;
	function bnpInvDigit() {
	  if (this.t < 1) return 0;var a = this[0];if ((a & 1) == 0) return 0;var b = a & 3,
	      b = b * (2 - (a & 15) * b) & 15,
	      b = b * (2 - (a & 255) * b) & 255,
	      b = b * (2 - ((a & 65535) * b & 65535)) & 65535,
	      b = b * (2 - a * b % this.DV) % this.DV;return b > 0 ? this.DV - b : -b;
	}function Montgomery(a) {
	  this.m = a;this.mp = a.invDigit();this.mpl = this.mp & 32767;this.mph = this.mp >> 15;this.um = (1 << a.DB - 15) - 1;this.mt2 = 2 * a.t;
	}
	function montConvert(a) {
	  var b = nbi();a.abs().dlShiftTo(this.m.t, b);b.divRemTo(this.m, null, b);a.s < 0 && b.compareTo(BigInteger.ZERO) > 0 && this.m.subTo(b, b);return b;
	}function montRevert(a) {
	  var b = nbi();a.copyTo(b);this.reduce(b);return b;
	}
	function montReduce(a) {
	  for (; a.t <= this.mt2;) {
	    a[a.t++] = 0;
	  }for (var b = 0; b < this.m.t; ++b) {
	    var c = a[b] & 32767,
	        d = c * this.mpl + ((c * this.mph + (a[b] >> 15) * this.mpl & this.um) << 15) & a.DM,
	        c = b + this.m.t;for (a[c] += this.m.am(0, d, a, b, 0, this.m.t); a[c] >= a.DV;) {
	      a[c] -= a.DV, a[++c]++;
	    }
	  }a.clamp();a.drShiftTo(this.m.t, a);a.compareTo(this.m) >= 0 && a.subTo(this.m, a);
	}function montSqrTo(a, b) {
	  a.squareTo(b);this.reduce(b);
	}function montMulTo(a, b, c) {
	  a.multiplyTo(b, c);this.reduce(c);
	}Montgomery.prototype.convert = montConvert;
	Montgomery.prototype.revert = montRevert;Montgomery.prototype.reduce = montReduce;Montgomery.prototype.mulTo = montMulTo;Montgomery.prototype.sqrTo = montSqrTo;function bnpIsEven() {
	  return (this.t > 0 ? this[0] & 1 : this.s) == 0;
	}function bnpExp(a, b) {
	  if (a > 4294967295 || a < 1) return BigInteger.ONE;var c = nbi(),
	      d = nbi(),
	      e = b.convert(this),
	      g = nbits(a) - 1;for (e.copyTo(c); --g >= 0;) {
	    if (b.sqrTo(c, d), (a & 1 << g) > 0) b.mulTo(d, e, c);else var h = c,
	        c = d,
	        d = h;
	  }return b.revert(c);
	}
	function bnModPowInt(a, b) {
	  var c;c = a < 256 || b.isEven() ? new Classic(b) : new Montgomery(b);return this.exp(a, c);
	}BigInteger.prototype.copyTo = bnpCopyTo;BigInteger.prototype.fromInt = bnpFromInt;BigInteger.prototype.fromString = bnpFromString;BigInteger.prototype.clamp = bnpClamp;BigInteger.prototype.dlShiftTo = bnpDLShiftTo;BigInteger.prototype.drShiftTo = bnpDRShiftTo;BigInteger.prototype.lShiftTo = bnpLShiftTo;BigInteger.prototype.rShiftTo = bnpRShiftTo;BigInteger.prototype.subTo = bnpSubTo;
	BigInteger.prototype.multiplyTo = bnpMultiplyTo;BigInteger.prototype.squareTo = bnpSquareTo;BigInteger.prototype.divRemTo = bnpDivRemTo;BigInteger.prototype.invDigit = bnpInvDigit;BigInteger.prototype.isEven = bnpIsEven;BigInteger.prototype.exp = bnpExp;BigInteger.prototype.toString = bnToString;BigInteger.prototype.negate = bnNegate;BigInteger.prototype.abs = bnAbs;BigInteger.prototype.compareTo = bnCompareTo;BigInteger.prototype.bitLength = bnBitLength;BigInteger.prototype.mod = bnMod;BigInteger.prototype.modPowInt = bnModPowInt;
	BigInteger.ZERO = nbv(0);BigInteger.ONE = nbv(1);function bnClone() {
	  var a = nbi();this.copyTo(a);return a;
	}function bnIntValue() {
	  if (this.s < 0) {
	    if (this.t == 1) return this[0] - this.DV;else {
	      if (this.t == 0) return -1;
	    }
	  } else if (this.t == 1) return this[0];else if (this.t == 0) return 0;return (this[1] & (1 << 32 - this.DB) - 1) << this.DB | this[0];
	}function bnByteValue() {
	  return this.t == 0 ? this.s : this[0] << 24 >> 24;
	}function bnShortValue() {
	  return this.t == 0 ? this.s : this[0] << 16 >> 16;
	}
	function bnpChunkSize(a) {
	  return Math.floor(Math.LN2 * this.DB / Math.log(a));
	}function bnSigNum() {
	  return this.s < 0 ? -1 : this.t <= 0 || this.t == 1 && this[0] <= 0 ? 0 : 1;
	}function bnpToRadix(a) {
	  a == null && (a = 10);if (this.signum() == 0 || a < 2 || a > 36) return "0";var b = this.chunkSize(a),
	      b = Math.pow(a, b),
	      c = nbv(b),
	      d = nbi(),
	      e = nbi(),
	      g = "";for (this.divRemTo(c, d, e); d.signum() > 0;) {
	    g = (b + e.intValue()).toString(a).substr(1) + g, d.divRemTo(c, d, e);
	  }return e.intValue().toString(a) + g;
	}
	function bnpFromRadix(a, b) {
	  this.fromInt(0);b == null && (b = 10);for (var c = this.chunkSize(b), d = Math.pow(b, c), e = !1, g = 0, h = 0, f = 0; f < a.length; ++f) {
	    var o = intAt(a, f);o < 0 ? a.charAt(f) == "-" && this.signum() == 0 && (e = !0) : (h = b * h + o, ++g >= c && (this.dMultiply(d), this.dAddOffset(h, 0), h = g = 0));
	  }g > 0 && (this.dMultiply(Math.pow(b, g)), this.dAddOffset(h, 0));e && BigInteger.ZERO.subTo(this, this);
	}
	function bnpFromNumber(a, b, c) {
	  if ("number" == typeof b) {
	    if (a < 2) this.fromInt(1);else {
	      this.fromNumber(a, c);this.testBit(a - 1) || this.bitwiseTo(BigInteger.ONE.shiftLeft(a - 1), op_or, this);for (this.isEven() && this.dAddOffset(1, 0); !this.isProbablePrime(b);) {
	        this.dAddOffset(2, 0), this.bitLength() > a && this.subTo(BigInteger.ONE.shiftLeft(a - 1), this);
	      }
	    }
	  } else {
	    var c = [],
	        d = a & 7;c.length = (a >> 3) + 1;b.nextBytes(c);d > 0 ? c[0] &= (1 << d) - 1 : c[0] = 0;this.fromString(c, 256);
	  }
	}
	function bnToByteArray() {
	  var a = this.t,
	      b = [];b[0] = this.s;var c = this.DB - a * this.DB % 8,
	      d,
	      e = 0;if (a-- > 0) {
	    if (c < this.DB && (d = this[a] >> c) != (this.s & this.DM) >> c) b[e++] = d | this.s << this.DB - c;for (; a >= 0;) {
	      if (c < 8 ? (d = (this[a] & (1 << c) - 1) << 8 - c, d |= this[--a] >> (c += this.DB - 8)) : (d = this[a] >> (c -= 8) & 255, c <= 0 && (c += this.DB, --a)), (d & 128) != 0 && (d |= -256), e == 0 && (this.s & 128) != (d & 128) && ++e, e > 0 || d != this.s) b[e++] = d;
	    }
	  }return b;
	}function bnEquals(a) {
	  return this.compareTo(a) == 0;
	}function bnMin(a) {
	  return this.compareTo(a) < 0 ? this : a;
	}
	function bnMax(a) {
	  return this.compareTo(a) > 0 ? this : a;
	}function bnpBitwiseTo(a, b, c) {
	  var d,
	      e,
	      g = Math.min(a.t, this.t);for (d = 0; d < g; ++d) {
	    c[d] = b(this[d], a[d]);
	  }if (a.t < this.t) {
	    e = a.s & this.DM;for (d = g; d < this.t; ++d) {
	      c[d] = b(this[d], e);
	    }c.t = this.t;
	  } else {
	    e = this.s & this.DM;for (d = g; d < a.t; ++d) {
	      c[d] = b(e, a[d]);
	    }c.t = a.t;
	  }c.s = b(this.s, a.s);c.clamp();
	}function op_and(a, b) {
	  return a & b;
	}function bnAnd(a) {
	  var b = nbi();this.bitwiseTo(a, op_and, b);return b;
	}function op_or(a, b) {
	  return a | b;
	}
	function bnOr(a) {
	  var b = nbi();this.bitwiseTo(a, op_or, b);return b;
	}function op_xor(a, b) {
	  return a ^ b;
	}function bnXor(a) {
	  var b = nbi();this.bitwiseTo(a, op_xor, b);return b;
	}function op_andnot(a, b) {
	  return a & ~b;
	}function bnAndNot(a) {
	  var b = nbi();this.bitwiseTo(a, op_andnot, b);return b;
	}function bnNot() {
	  for (var a = nbi(), b = 0; b < this.t; ++b) {
	    a[b] = this.DM & ~this[b];
	  }a.t = this.t;a.s = ~this.s;return a;
	}function bnShiftLeft(a) {
	  var b = nbi();a < 0 ? this.rShiftTo(-a, b) : this.lShiftTo(a, b);return b;
	}
	function bnShiftRight(a) {
	  var b = nbi();a < 0 ? this.lShiftTo(-a, b) : this.rShiftTo(a, b);return b;
	}function lbit(a) {
	  if (a == 0) return -1;var b = 0;(a & 65535) == 0 && (a >>= 16, b += 16);(a & 255) == 0 && (a >>= 8, b += 8);(a & 15) == 0 && (a >>= 4, b += 4);(a & 3) == 0 && (a >>= 2, b += 2);(a & 1) == 0 && ++b;return b;
	}function bnGetLowestSetBit() {
	  for (var a = 0; a < this.t; ++a) {
	    if (this[a] != 0) return a * this.DB + lbit(this[a]);
	  }return this.s < 0 ? this.t * this.DB : -1;
	}function cbit(a) {
	  for (var b = 0; a != 0;) {
	    a &= a - 1, ++b;
	  }return b;
	}
	function bnBitCount() {
	  for (var a = 0, b = this.s & this.DM, c = 0; c < this.t; ++c) {
	    a += cbit(this[c] ^ b);
	  }return a;
	}function bnTestBit(a) {
	  var b = Math.floor(a / this.DB);return b >= this.t ? this.s != 0 : (this[b] & 1 << a % this.DB) != 0;
	}function bnpChangeBit(a, b) {
	  var c = BigInteger.ONE.shiftLeft(a);this.bitwiseTo(c, b, c);return c;
	}function bnSetBit(a) {
	  return this.changeBit(a, op_or);
	}function bnClearBit(a) {
	  return this.changeBit(a, op_andnot);
	}function bnFlipBit(a) {
	  return this.changeBit(a, op_xor);
	}
	function bnpAddTo(a, b) {
	  for (var c = 0, d = 0, e = Math.min(a.t, this.t); c < e;) {
	    d += this[c] + a[c], b[c++] = d & this.DM, d >>= this.DB;
	  }if (a.t < this.t) {
	    for (d += a.s; c < this.t;) {
	      d += this[c], b[c++] = d & this.DM, d >>= this.DB;
	    }d += this.s;
	  } else {
	    for (d += this.s; c < a.t;) {
	      d += a[c], b[c++] = d & this.DM, d >>= this.DB;
	    }d += a.s;
	  }b.s = d < 0 ? -1 : 0;d > 0 ? b[c++] = d : d < -1 && (b[c++] = this.DV + d);b.t = c;b.clamp();
	}function bnAdd(a) {
	  var b = nbi();this.addTo(a, b);return b;
	}function bnSubtract(a) {
	  var b = nbi();this.subTo(a, b);return b;
	}
	function bnMultiply(a) {
	  var b = nbi();this.multiplyTo(a, b);return b;
	}function bnSquare() {
	  var a = nbi();this.squareTo(a);return a;
	}function bnDivide(a) {
	  var b = nbi();this.divRemTo(a, b, null);return b;
	}function bnRemainder(a) {
	  var b = nbi();this.divRemTo(a, null, b);return b;
	}function bnDivideAndRemainder(a) {
	  var b = nbi(),
	      c = nbi();this.divRemTo(a, b, c);return [b, c];
	}function bnpDMultiply(a) {
	  this[this.t] = this.am(0, a - 1, this, 0, 0, this.t);++this.t;this.clamp();
	}
	function bnpDAddOffset(a, b) {
	  if (a != 0) {
	    for (; this.t <= b;) {
	      this[this.t++] = 0;
	    }for (this[b] += a; this[b] >= this.DV;) {
	      this[b] -= this.DV, ++b >= this.t && (this[this.t++] = 0), ++this[b];
	    }
	  }
	}function NullExp() {}function nNop(a) {
	  return a;
	}function nMulTo(a, b, c) {
	  a.multiplyTo(b, c);
	}function nSqrTo(a, b) {
	  a.squareTo(b);
	}NullExp.prototype.convert = nNop;NullExp.prototype.revert = nNop;NullExp.prototype.mulTo = nMulTo;NullExp.prototype.sqrTo = nSqrTo;function bnPow(a) {
	  return this.exp(a, new NullExp());
	}
	function bnpMultiplyLowerTo(a, b, c) {
	  var d = Math.min(this.t + a.t, b);c.s = 0;for (c.t = d; d > 0;) {
	    c[--d] = 0;
	  }var e;for (e = c.t - this.t; d < e; ++d) {
	    c[d + this.t] = this.am(0, a[d], c, d, 0, this.t);
	  }for (e = Math.min(a.t, b); d < e; ++d) {
	    this.am(0, a[d], c, d, 0, b - d);
	  }c.clamp();
	}function bnpMultiplyUpperTo(a, b, c) {
	  --b;var d = c.t = this.t + a.t - b;for (c.s = 0; --d >= 0;) {
	    c[d] = 0;
	  }for (d = Math.max(b - this.t, 0); d < a.t; ++d) {
	    c[this.t + d - b] = this.am(b - d, a[d], c, 0, 0, this.t + d - b);
	  }c.clamp();c.drShiftTo(1, c);
	}
	function Barrett(a) {
	  this.r2 = nbi();this.q3 = nbi();BigInteger.ONE.dlShiftTo(2 * a.t, this.r2);this.mu = this.r2.divide(a);this.m = a;
	}function barrettConvert(a) {
	  if (a.s < 0 || a.t > 2 * this.m.t) return a.mod(this.m);else if (a.compareTo(this.m) < 0) return a;else {
	    var b = nbi();a.copyTo(b);this.reduce(b);return b;
	  }
	}function barrettRevert(a) {
	  return a;
	}
	function barrettReduce(a) {
	  a.drShiftTo(this.m.t - 1, this.r2);if (a.t > this.m.t + 1) a.t = this.m.t + 1, a.clamp();this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3);for (this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2); a.compareTo(this.r2) < 0;) {
	    a.dAddOffset(1, this.m.t + 1);
	  }for (a.subTo(this.r2, a); a.compareTo(this.m) >= 0;) {
	    a.subTo(this.m, a);
	  }
	}function barrettSqrTo(a, b) {
	  a.squareTo(b);this.reduce(b);
	}function barrettMulTo(a, b, c) {
	  a.multiplyTo(b, c);this.reduce(c);
	}Barrett.prototype.convert = barrettConvert;
	Barrett.prototype.revert = barrettRevert;Barrett.prototype.reduce = barrettReduce;Barrett.prototype.mulTo = barrettMulTo;Barrett.prototype.sqrTo = barrettSqrTo;
	function bnModPow(a, b) {
	  var c = a.bitLength(),
	      d,
	      e = nbv(1),
	      g;if (c <= 0) return e;else d = c < 18 ? 1 : c < 48 ? 3 : c < 144 ? 4 : c < 768 ? 5 : 6;g = c < 8 ? new Classic(b) : b.isEven() ? new Barrett(b) : new Montgomery(b);var h = [],
	      f = 3,
	      o = d - 1,
	      p = (1 << d) - 1;h[1] = g.convert(this);if (d > 1) {
	    c = nbi();for (g.sqrTo(h[1], c); f <= p;) {
	      h[f] = nbi(), g.mulTo(c, h[f - 2], h[f]), f += 2;
	    }
	  }for (var q = a.t - 1, n, k = !0, j = nbi(), c = nbits(a[q]) - 1; q >= 0;) {
	    c >= o ? n = a[q] >> c - o & p : (n = (a[q] & (1 << c + 1) - 1) << o - c, q > 0 && (n |= a[q - 1] >> this.DB + c - o));for (f = d; (n & 1) == 0;) {
	      n >>= 1, --f;
	    }if ((c -= f) < 0) c += this.DB, --q;if (k) h[n].copyTo(e), k = !1;else {
	      for (; f > 1;) {
	        g.sqrTo(e, j), g.sqrTo(j, e), f -= 2;
	      }f > 0 ? g.sqrTo(e, j) : (f = e, e = j, j = f);g.mulTo(j, h[n], e);
	    }for (; q >= 0 && (a[q] & 1 << c) == 0;) {
	      g.sqrTo(e, j), f = e, e = j, j = f, --c < 0 && (c = this.DB - 1, --q);
	    }
	  }return g.revert(e);
	}
	function bnGCD(a) {
	  var b = this.s < 0 ? this.negate() : this.clone(),
	      a = a.s < 0 ? a.negate() : a.clone();if (b.compareTo(a) < 0) var c = b,
	      b = a,
	      a = c;var c = b.getLowestSetBit(),
	      d = a.getLowestSetBit();if (d < 0) return b;c < d && (d = c);d > 0 && (b.rShiftTo(d, b), a.rShiftTo(d, a));for (; b.signum() > 0;) {
	    (c = b.getLowestSetBit()) > 0 && b.rShiftTo(c, b), (c = a.getLowestSetBit()) > 0 && a.rShiftTo(c, a), b.compareTo(a) >= 0 ? (b.subTo(a, b), b.rShiftTo(1, b)) : (a.subTo(b, a), a.rShiftTo(1, a));
	  }d > 0 && a.lShiftTo(d, a);return a;
	}
	function bnpModInt(a) {
	  if (a <= 0) return 0;var b = this.DV % a,
	      c = this.s < 0 ? a - 1 : 0;if (this.t > 0) if (b == 0) c = this[0] % a;else for (var d = this.t - 1; d >= 0; --d) {
	    c = (b * c + this[d]) % a;
	  }return c;
	}
	function bnModInverse(a) {
	  var b = a.isEven();if (this.isEven() && b || a.signum() == 0) return BigInteger.ZERO;for (var c = a.clone(), d = this.clone(), e = nbv(1), g = nbv(0), h = nbv(0), f = nbv(1); c.signum() != 0;) {
	    for (; c.isEven();) {
	      c.rShiftTo(1, c);if (b) {
	        if (!e.isEven() || !g.isEven()) e.addTo(this, e), g.subTo(a, g);e.rShiftTo(1, e);
	      } else g.isEven() || g.subTo(a, g);g.rShiftTo(1, g);
	    }for (; d.isEven();) {
	      d.rShiftTo(1, d);if (b) {
	        if (!h.isEven() || !f.isEven()) h.addTo(this, h), f.subTo(a, f);h.rShiftTo(1, h);
	      } else f.isEven() || f.subTo(a, f);f.rShiftTo(1, f);
	    }c.compareTo(d) >= 0 ? (c.subTo(d, c), b && e.subTo(h, e), g.subTo(f, g)) : (d.subTo(c, d), b && h.subTo(e, h), f.subTo(g, f));
	  }if (d.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;if (f.compareTo(a) >= 0) return f.subtract(a);if (f.signum() < 0) f.addTo(a, f);else return f;return f.signum() < 0 ? f.add(a) : f;
	}
	var lowprimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997],
	    lplim = 67108864 / lowprimes[lowprimes.length - 1];
	function bnIsProbablePrime(a) {
	  var b,
	      c = this.abs();if (c.t == 1 && c[0] <= lowprimes[lowprimes.length - 1]) {
	    for (b = 0; b < lowprimes.length; ++b) {
	      if (c[0] == lowprimes[b]) return !0;
	    }return !1;
	  }if (c.isEven()) return !1;for (b = 1; b < lowprimes.length;) {
	    for (var d = lowprimes[b], e = b + 1; e < lowprimes.length && d < lplim;) {
	      d *= lowprimes[e++];
	    }for (d = c.modInt(d); b < e;) {
	      if (d % lowprimes[b++] == 0) return !1;
	    }
	  }return c.millerRabin(a);
	}
	function bnpMillerRabin(a) {
	  var b = this.subtract(BigInteger.ONE),
	      c = b.getLowestSetBit();if (c <= 0) return !1;var d = b.shiftRight(c),
	      a = a + 1 >> 1;if (a > lowprimes.length) a = lowprimes.length;for (var e = nbi(), g = 0; g < a; ++g) {
	    e.fromInt(lowprimes[Math.floor(Math.random() * lowprimes.length)]);var h = e.modPow(d, this);if (h.compareTo(BigInteger.ONE) != 0 && h.compareTo(b) != 0) {
	      for (var f = 1; f++ < c && h.compareTo(b) != 0;) {
	        if (h = h.modPowInt(2, this), h.compareTo(BigInteger.ONE) == 0) return !1;
	      }if (h.compareTo(b) != 0) return !1;
	    }
	  }return !0;
	}
	BigInteger.prototype.chunkSize = bnpChunkSize;BigInteger.prototype.toRadix = bnpToRadix;BigInteger.prototype.fromRadix = bnpFromRadix;BigInteger.prototype.fromNumber = bnpFromNumber;BigInteger.prototype.bitwiseTo = bnpBitwiseTo;BigInteger.prototype.changeBit = bnpChangeBit;BigInteger.prototype.addTo = bnpAddTo;BigInteger.prototype.dMultiply = bnpDMultiply;BigInteger.prototype.dAddOffset = bnpDAddOffset;BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo;BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
	BigInteger.prototype.modInt = bnpModInt;BigInteger.prototype.millerRabin = bnpMillerRabin;BigInteger.prototype.clone = bnClone;BigInteger.prototype.intValue = bnIntValue;BigInteger.prototype.byteValue = bnByteValue;BigInteger.prototype.shortValue = bnShortValue;BigInteger.prototype.signum = bnSigNum;BigInteger.prototype.toByteArray = bnToByteArray;BigInteger.prototype.equals = bnEquals;BigInteger.prototype.min = bnMin;BigInteger.prototype.max = bnMax;BigInteger.prototype.and = bnAnd;BigInteger.prototype.or = bnOr;
	BigInteger.prototype.xor = bnXor;BigInteger.prototype.andNot = bnAndNot;BigInteger.prototype.not = bnNot;BigInteger.prototype.shiftLeft = bnShiftLeft;BigInteger.prototype.shiftRight = bnShiftRight;BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit;BigInteger.prototype.bitCount = bnBitCount;BigInteger.prototype.testBit = bnTestBit;BigInteger.prototype.setBit = bnSetBit;BigInteger.prototype.clearBit = bnClearBit;BigInteger.prototype.flipBit = bnFlipBit;BigInteger.prototype.add = bnAdd;BigInteger.prototype.subtract = bnSubtract;
	BigInteger.prototype.multiply = bnMultiply;BigInteger.prototype.divide = bnDivide;BigInteger.prototype.remainder = bnRemainder;BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder;BigInteger.prototype.modPow = bnModPow;BigInteger.prototype.modInverse = bnModInverse;BigInteger.prototype.pow = bnPow;BigInteger.prototype.gcd = bnGCD;BigInteger.prototype.isProbablePrime = bnIsProbablePrime;BigInteger.prototype.square = bnSquare;
	(function (a, b, c, d, e, g, h) {
	  function f(a) {
	    var b,
	        d,
	        e = this,
	        g = a.length,
	        f = 0,
	        h = e.i = e.j = e.m = 0;e.S = [];e.c = [];for (g || (a = [g++]); f < c;) {
	      e.S[f] = f++;
	    }for (f = 0; f < c; f++) {
	      b = e.S[f], h = h + b + a[f % g] & c - 1, d = e.S[h], e.S[f] = d, e.S[h] = b;
	    }e.g = function (a) {
	      var b = e.S,
	          d = e.i + 1 & c - 1,
	          g = b[d],
	          f = e.j + g & c - 1,
	          h = b[f];b[d] = h;b[f] = g;for (var k = b[g + h & c - 1]; --a;) {
	        d = d + 1 & c - 1, g = b[d], f = f + g & c - 1, h = b[f], b[d] = h, b[f] = g, k = k * c + b[g + h & c - 1];
	      }e.i = d;e.j = f;return k;
	    };e.g(c);
	  }function o(a, b, c, d, e) {
	    c = [];e = typeof a === "undefined" ? "undefined" : _typeof(a);if (b && e == "object") for (d in a) {
	      if (d.indexOf("S") < 5) try {
	        c.push(o(a[d], b - 1));
	      } catch (g) {}
	    }return c.length ? c : a + (e != "string" ? "\x00" : "");
	  }function p(a, b, d, e) {
	    a += "";for (e = d = 0; e < a.length; e++) {
	      var g = b,
	          f = e & c - 1,
	          h = (d ^= b[e & c - 1] * 19) + a.charCodeAt(e);g[f] = h & c - 1;
	    }a = "";for (e in b) {
	      a += String.fromCharCode(b[e]);
	    }return a;
	  }b.seedrandom = function (q, n) {
	    var k = [],
	        j,
	        q = p(o(n ? [q, a] : arguments.length ? q : [new Date().getTime(), a, window], 3), k);j = new f(k);p(j.S, a);b.random = function () {
	      for (var a = j.g(d), b = h, f = 0; a < e;) {
	        a = (a + f) * c, b *= c, f = j.g(1);
	      }for (; a >= g;) {
	        a /= 2, b /= 2, f >>>= 1;
	      }return (a + f) / b;
	    };return q;
	  };h = b.pow(c, d);e = b.pow(2, e);g = e * 2;p(b.random(), a);
	})([], Math, 256, 6, 52);function SeededRandom() {}function SRnextBytes(a) {
	  var b;for (b = 0; b < a.length; b++) {
	    a[b] = Math.floor(Math.random() * 256);
	  }
	}SeededRandom.prototype.nextBytes = SRnextBytes;function Arcfour() {
	  this.j = this.i = 0;this.S = [];
	}function ARC4init(a) {
	  var b, c, d;for (b = 0; b < 256; ++b) {
	    this.S[b] = b;
	  }for (b = c = 0; b < 256; ++b) {
	    c = c + this.S[b] + a[b % a.length] & 255, d = this.S[b], this.S[b] = this.S[c], this.S[c] = d;
	  }this.j = this.i = 0;
	}
	function ARC4next() {
	  var a;this.i = this.i + 1 & 255;this.j = this.j + this.S[this.i] & 255;a = this.S[this.i];this.S[this.i] = this.S[this.j];this.S[this.j] = a;return this.S[a + this.S[this.i] & 255];
	}Arcfour.prototype.init = ARC4init;Arcfour.prototype.next = ARC4next;function prng_newstate() {
	  return new Arcfour();
	}var rng_psize = 256,
	    rng_state,
	    rng_pool,
	    rng_pptr;
	function rng_seed_int(a) {
	  rng_pool[rng_pptr++] ^= a & 255;rng_pool[rng_pptr++] ^= a >> 8 & 255;rng_pool[rng_pptr++] ^= a >> 16 & 255;rng_pool[rng_pptr++] ^= a >> 24 & 255;rng_pptr >= rng_psize && (rng_pptr -= rng_psize);
	}function rng_seed_time() {
	  rng_seed_int(new Date().getTime());
	}
	if (rng_pool == null) {
	  rng_pool = [];rng_pptr = 0;var t;if (navigator.appName == "Netscape" && navigator.appVersion < "5" && window.crypto) {
	    var z = window.crypto.random(32);for (t = 0; t < z.length; ++t) {
	      rng_pool[rng_pptr++] = z.charCodeAt(t) & 255;
	    }
	  }for (; rng_pptr < rng_psize;) {
	    t = Math.floor(65536 * Math.random()), rng_pool[rng_pptr++] = t >>> 8, rng_pool[rng_pptr++] = t & 255;
	  }rng_pptr = 0;rng_seed_time();
	}
	function rng_get_byte() {
	  if (rng_state == null) {
	    rng_seed_time();rng_state = prng_newstate();rng_state.init(rng_pool);for (rng_pptr = 0; rng_pptr < rng_pool.length; ++rng_pptr) {
	      rng_pool[rng_pptr] = 0;
	    }rng_pptr = 0;
	  }return rng_state.next();
	}function rng_get_bytes(a) {
	  var b;for (b = 0; b < a.length; ++b) {
	    a[b] = rng_get_byte();
	  }
	}function SecureRandom() {}SecureRandom.prototype.nextBytes = rng_get_bytes;
	function SHA256(a) {
	  function b(a, b) {
	    var c = (a & 65535) + (b & 65535);return (a >> 16) + (b >> 16) + (c >> 16) << 16 | c & 65535;
	  }function c(a, b) {
	    return a >>> b | a << 32 - b;
	  }a = function (a) {
	    for (var a = a.replace(/\r\n/g, "\n"), b = "", c = 0; c < a.length; c++) {
	      var h = a.charCodeAt(c);h < 128 ? b += String.fromCharCode(h) : (h > 127 && h < 2048 ? b += String.fromCharCode(h >> 6 | 192) : (b += String.fromCharCode(h >> 12 | 224), b += String.fromCharCode(h >> 6 & 63 | 128)), b += String.fromCharCode(h & 63 | 128));
	    }return b;
	  }(a);return function (a) {
	    for (var b = "", c = 0; c < a.length * 4; c++) {
	      b += "0123456789abcdef".charAt(a[c >> 2] >> (3 - c % 4) * 8 + 4 & 15) + "0123456789abcdef".charAt(a[c >> 2] >> (3 - c % 4) * 8 & 15);
	    }return b;
	  }(function (a, e) {
	    var g = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298],
	        h = [1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225],
	        f = Array(64),
	        o,
	        p,
	        q,
	        n,
	        k,
	        j,
	        l,
	        m,
	        s,
	        r,
	        u,
	        w;a[e >> 5] |= 128 << 24 - e % 32;a[(e + 64 >> 9 << 4) + 15] = e;for (s = 0; s < a.length; s += 16) {
	      o = h[0];p = h[1];q = h[2];n = h[3];
	      k = h[4];j = h[5];l = h[6];m = h[7];for (r = 0; r < 64; r++) {
	        f[r] = r < 16 ? a[r + s] : b(b(b(c(f[r - 2], 17) ^ c(f[r - 2], 19) ^ f[r - 2] >>> 10, f[r - 7]), c(f[r - 15], 7) ^ c(f[r - 15], 18) ^ f[r - 15] >>> 3), f[r - 16]), u = b(b(b(b(m, c(k, 6) ^ c(k, 11) ^ c(k, 25)), k & j ^ ~k & l), g[r]), f[r]), w = b(c(o, 2) ^ c(o, 13) ^ c(o, 22), o & p ^ o & q ^ p & q), m = l, l = j, j = k, k = b(n, u), n = q, q = p, p = o, o = b(u, w);
	      }h[0] = b(o, h[0]);h[1] = b(p, h[1]);h[2] = b(q, h[2]);h[3] = b(n, h[3]);h[4] = b(k, h[4]);h[5] = b(j, h[5]);h[6] = b(l, h[6]);h[7] = b(m, h[7]);
	    }return h;
	  }(function (a) {
	    for (var b = [], c = 0; c < a.length * 8; c += 8) {
	      b[c >> 5] |= (a.charCodeAt(c / 8) & 255) << 24 - c % 32;
	    }return b;
	  }(a), a.length * 8));
	}var sha256 = { hex: function hex(a) {
	    return SHA256(a);
	  } };
	function SHA1(a) {
	  function b(a, b) {
	    return a << b | a >>> 32 - b;
	  }function c(a) {
	    var b = "",
	        c,
	        d;for (c = 7; c >= 0; c--) {
	      d = a >>> c * 4 & 15, b += d.toString(16);
	    }return b;
	  }var d,
	      e,
	      g = Array(80),
	      h = 1732584193,
	      f = 4023233417,
	      o = 2562383102,
	      p = 271733878,
	      q = 3285377520,
	      n,
	      k,
	      j,
	      l,
	      m,
	      a = function (a) {
	    for (var a = a.replace(/\r\n/g, "\n"), b = "", c = 0; c < a.length; c++) {
	      var d = a.charCodeAt(c);d < 128 ? b += String.fromCharCode(d) : (d > 127 && d < 2048 ? b += String.fromCharCode(d >> 6 | 192) : (b += String.fromCharCode(d >> 12 | 224), b += String.fromCharCode(d >> 6 & 63 | 128)), b += String.fromCharCode(d & 63 | 128));
	    }return b;
	  }(a);n = a.length;var s = [];for (d = 0; d < n - 3; d += 4) {
	    e = a.charCodeAt(d) << 24 | a.charCodeAt(d + 1) << 16 | a.charCodeAt(d + 2) << 8 | a.charCodeAt(d + 3), s.push(e);
	  }switch (n % 4) {case 0:
	      d = 2147483648;break;case 1:
	      d = a.charCodeAt(n - 1) << 24 | 8388608;break;case 2:
	      d = a.charCodeAt(n - 2) << 24 | a.charCodeAt(n - 1) << 16 | 32768;break;case 3:
	      d = a.charCodeAt(n - 3) << 24 | a.charCodeAt(n - 2) << 16 | a.charCodeAt(n - 1) << 8 | 128;}for (s.push(d); s.length % 16 != 14;) {
	    s.push(0);
	  }s.push(n >>> 29);s.push(n << 3 & 4294967295);for (a = 0; a < s.length; a += 16) {
	    for (d = 0; d < 16; d++) {
	      g[d] = s[a + d];
	    }for (d = 16; d <= 79; d++) {
	      g[d] = b(g[d - 3] ^ g[d - 8] ^ g[d - 14] ^ g[d - 16], 1);
	    }e = h;n = f;k = o;j = p;l = q;for (d = 0; d <= 19; d++) {
	      m = b(e, 5) + (n & k | ~n & j) + l + g[d] + 1518500249 & 4294967295, l = j, j = k, k = b(n, 30), n = e, e = m;
	    }for (d = 20; d <= 39; d++) {
	      m = b(e, 5) + (n ^ k ^ j) + l + g[d] + 1859775393 & 4294967295, l = j, j = k, k = b(n, 30), n = e, e = m;
	    }for (d = 40; d <= 59; d++) {
	      m = b(e, 5) + (n & k | n & j | k & j) + l + g[d] + 2400959708 & 4294967295, l = j, j = k, k = b(n, 30), n = e, e = m;
	    }for (d = 60; d <= 79; d++) {
	      m = b(e, 5) + (n ^ k ^ j) + l + g[d] + 3395469782 & 4294967295, l = j, j = k, k = b(n, 30), n = e, e = m;
	    }h = h + e & 4294967295;f = f + n & 4294967295;o = o + k & 4294967295;
	    p = p + j & 4294967295;q = q + l & 4294967295;
	  }m = c(h) + c(f) + c(o) + c(p) + c(q);return m.toLowerCase();
	}
	var sha1 = { hex: function hex(a) {
	    return SHA1(a);
	  } },
	    MD5 = function MD5(a) {
	  function b(a, b) {
	    var c, d, e, f, g;e = a & 2147483648;f = b & 2147483648;c = a & 1073741824;d = b & 1073741824;g = (a & 1073741823) + (b & 1073741823);return c & d ? g ^ 2147483648 ^ e ^ f : c | d ? g & 1073741824 ? g ^ 3221225472 ^ e ^ f : g ^ 1073741824 ^ e ^ f : g ^ e ^ f;
	  }function c(a, c, d, e, f, g, h) {
	    a = b(a, b(b(c & d | ~c & e, f), h));return b(a << g | a >>> 32 - g, c);
	  }function d(a, c, d, e, f, g, h) {
	    a = b(a, b(b(c & e | d & ~e, f), h));return b(a << g | a >>> 32 - g, c);
	  }function e(a, c, d, e, f, g, h) {
	    a = b(a, b(b(c ^ d ^ e, f), h));return b(a << g | a >>> 32 - g, c);
	  }function g(a, c, d, e, f, g, h) {
	    a = b(a, b(b(d ^ (c | ~e), f), h));return b(a << g | a >>> 32 - g, c);
	  }function h(a) {
	    var b = "",
	        c = "",
	        d;for (d = 0; d <= 3; d++) {
	      c = a >>> d * 8 & 255, c = "0" + c.toString(16), b += c.substr(c.length - 2, 2);
	    }return b;
	  }var f = [],
	      o,
	      p,
	      q,
	      n,
	      k,
	      j,
	      l,
	      m,
	      a = function (a) {
	    for (var a = a.replace(/\r\n/g, "\n"), b = "", c = 0; c < a.length; c++) {
	      var d = a.charCodeAt(c);d < 128 ? b += String.fromCharCode(d) : (d > 127 && d < 2048 ? b += String.fromCharCode(d >> 6 | 192) : (b += String.fromCharCode(d >> 12 | 224), b += String.fromCharCode(d >> 6 & 63 | 128)), b += String.fromCharCode(d & 63 | 128));
	    }return b;
	  }(a),
	      f = function (a) {
	    var b,
	        c = a.length;b = c + 8;for (var d = ((b - b % 64) / 64 + 1) * 16, e = Array(d - 1), f = 0, g = 0; g < c;) {
	      b = (g - g % 4) / 4, f = g % 4 * 8, e[b] |= a.charCodeAt(g) << f, g++;
	    }e[(g - g % 4) / 4] |= 128 << g % 4 * 8;e[d - 2] = c << 3;e[d - 1] = c >>> 29;return e;
	  }(a);k = 1732584193;j = 4023233417;l = 2562383102;m = 271733878;for (a = 0; a < f.length; a += 16) {
	    o = k, p = j, q = l, n = m, k = c(k, j, l, m, f[a + 0], 7, 3614090360), m = c(m, k, j, l, f[a + 1], 12, 3905402710), l = c(l, m, k, j, f[a + 2], 17, 606105819), j = c(j, l, m, k, f[a + 3], 22, 3250441966), k = c(k, j, l, m, f[a + 4], 7, 4118548399), m = c(m, k, j, l, f[a + 5], 12, 1200080426), l = c(l, m, k, j, f[a + 6], 17, 2821735955), j = c(j, l, m, k, f[a + 7], 22, 4249261313), k = c(k, j, l, m, f[a + 8], 7, 1770035416), m = c(m, k, j, l, f[a + 9], 12, 2336552879), l = c(l, m, k, j, f[a + 10], 17, 4294925233), j = c(j, l, m, k, f[a + 11], 22, 2304563134), k = c(k, j, l, m, f[a + 12], 7, 1804603682), m = c(m, k, j, l, f[a + 13], 12, 4254626195), l = c(l, m, k, j, f[a + 14], 17, 2792965006), j = c(j, l, m, k, f[a + 15], 22, 1236535329), k = d(k, j, l, m, f[a + 1], 5, 4129170786), m = d(m, k, j, l, f[a + 6], 9, 3225465664), l = d(l, m, k, j, f[a + 11], 14, 643717713), j = d(j, l, m, k, f[a + 0], 20, 3921069994), k = d(k, j, l, m, f[a + 5], 5, 3593408605), m = d(m, k, j, l, f[a + 10], 9, 38016083), l = d(l, m, k, j, f[a + 15], 14, 3634488961), j = d(j, l, m, k, f[a + 4], 20, 3889429448), k = d(k, j, l, m, f[a + 9], 5, 568446438), m = d(m, k, j, l, f[a + 14], 9, 3275163606), l = d(l, m, k, j, f[a + 3], 14, 4107603335), j = d(j, l, m, k, f[a + 8], 20, 1163531501), k = d(k, j, l, m, f[a + 13], 5, 2850285829), m = d(m, k, j, l, f[a + 2], 9, 4243563512), l = d(l, m, k, j, f[a + 7], 14, 1735328473), j = d(j, l, m, k, f[a + 12], 20, 2368359562), k = e(k, j, l, m, f[a + 5], 4, 4294588738), m = e(m, k, j, l, f[a + 8], 11, 2272392833), l = e(l, m, k, j, f[a + 11], 16, 1839030562), j = e(j, l, m, k, f[a + 14], 23, 4259657740), k = e(k, j, l, m, f[a + 1], 4, 2763975236), m = e(m, k, j, l, f[a + 4], 11, 1272893353), l = e(l, m, k, j, f[a + 7], 16, 4139469664), j = e(j, l, m, k, f[a + 10], 23, 3200236656), k = e(k, j, l, m, f[a + 13], 4, 681279174), m = e(m, k, j, l, f[a + 0], 11, 3936430074), l = e(l, m, k, j, f[a + 3], 16, 3572445317), j = e(j, l, m, k, f[a + 6], 23, 76029189), k = e(k, j, l, m, f[a + 9], 4, 3654602809), m = e(m, k, j, l, f[a + 12], 11, 3873151461), l = e(l, m, k, j, f[a + 15], 16, 530742520), j = e(j, l, m, k, f[a + 2], 23, 3299628645), k = g(k, j, l, m, f[a + 0], 6, 4096336452), m = g(m, k, j, l, f[a + 7], 10, 1126891415), l = g(l, m, k, j, f[a + 14], 15, 2878612391), j = g(j, l, m, k, f[a + 5], 21, 4237533241), k = g(k, j, l, m, f[a + 12], 6, 1700485571), m = g(m, k, j, l, f[a + 3], 10, 2399980690), l = g(l, m, k, j, f[a + 10], 15, 4293915773), j = g(j, l, m, k, f[a + 1], 21, 2240044497), k = g(k, j, l, m, f[a + 8], 6, 1873313359), m = g(m, k, j, l, f[a + 15], 10, 4264355552), l = g(l, m, k, j, f[a + 6], 15, 2734768916), j = g(j, l, m, k, f[a + 13], 21, 1309151649), k = g(k, j, l, m, f[a + 4], 6, 4149444226), m = g(m, k, j, l, f[a + 11], 10, 3174756917), l = g(l, m, k, j, f[a + 2], 15, 718787259), j = g(j, l, m, k, f[a + 9], 21, 3951481745), k = b(k, o), j = b(j, p), l = b(l, q), m = b(m, n);
	  }return (h(k) + h(j) + h(l) + h(m)).toLowerCase();
	};function parseBigInt(a, b) {
	  return new BigInteger(a, b);
	}function linebrk(a, b) {
	  for (var c = "", d = 0; d + b < a.length;) {
	    c += a.substring(d, d + b) + "\n", d += b;
	  }return c + a.substring(d, a.length);
	}function byte2Hex(a) {
	  return a < 16 ? "0" + a.toString(16) : a.toString(16);
	}
	function pkcs1pad2(a, b) {
	  if (b < a.length + 11) throw "Message too long for RSA (n=" + b + ", l=" + a.length + ")";for (var c = [], d = a.length - 1; d >= 0 && b > 0;) {
	    var e = a.charCodeAt(d--);e < 128 ? c[--b] = e : e > 127 && e < 2048 ? (c[--b] = e & 63 | 128, c[--b] = e >> 6 | 192) : (c[--b] = e & 63 | 128, c[--b] = e >> 6 & 63 | 128, c[--b] = e >> 12 | 224);
	  }c[--b] = 0;d = new SecureRandom();for (e = []; b > 2;) {
	    for (e[0] = 0; e[0] == 0;) {
	      d.nextBytes(e);
	    }c[--b] = e[0];
	  }c[--b] = 2;c[--b] = 0;return new BigInteger(c);
	}
	function RSAKey() {
	  this.n = null;this.e = 0;this.coeff = this.dmq1 = this.dmp1 = this.q = this.p = this.d = null;
	}function RSASetPublic(a, b) {
	  a != null && b != null && a.length > 0 && b.length > 0 ? (this.n = parseBigInt(a, 16), this.e = parseInt(b, 16)) : alert("Invalid RSA public key");
	}function RSADoPublic(a) {
	  return a.modPowInt(this.e, this.n);
	}function RSAEncrypt(a) {
	  a = pkcs1pad2(a, this.n.bitLength() + 7 >> 3);if (a == null) return null;a = this.doPublic(a);if (a == null) return null;a = a.toString(16);return (a.length & 1) == 0 ? a : "0" + a;
	}
	RSAKey.prototype.doPublic = RSADoPublic;RSAKey.prototype.setPublic = RSASetPublic;RSAKey.prototype.encrypt = RSAEncrypt;function pkcs1unpad2(a, b) {
	  for (var c = a.toByteArray(), d = 0; d < c.length && c[d] == 0;) {
	    ++d;
	  }if (c.length - d != b - 1 || c[d] != 2) return null;for (++d; c[d] != 0;) {
	    if (++d >= c.length) return null;
	  }for (var e = ""; ++d < c.length;) {
	    var g = c[d] & 255;g < 128 ? e += String.fromCharCode(g) : g > 191 && g < 224 ? (e += String.fromCharCode((g & 31) << 6 | c[d + 1] & 63), ++d) : (e += String.fromCharCode((g & 15) << 12 | (c[d + 1] & 63) << 6 | c[d + 2] & 63), d += 2);
	  }return e;
	}
	function RSASetPrivate(a, b, c) {
	  a != null && b != null && a.length > 0 && b.length > 0 ? (this.n = parseBigInt(a, 16), this.e = parseInt(b, 16), this.d = parseBigInt(c, 16)) : alert("Invalid RSA private key");
	}
	function RSASetPrivateEx(a, b, c, d, e, g, h, f) {
	  a != null && b != null && a.length > 0 && b.length > 0 ? (this.n = parseBigInt(a, 16), this.e = parseInt(b, 16), this.d = parseBigInt(c, 16), this.p = parseBigInt(d, 16), this.q = parseBigInt(e, 16), this.dmp1 = parseBigInt(g, 16), this.dmq1 = parseBigInt(h, 16), this.coeff = parseBigInt(f, 16)) : alert("Invalid RSA private key");
	}
	function RSAGenerate(a, b) {
	  var c = new SeededRandom(),
	      d = a >> 1;this.e = parseInt(b, 16);for (var e = new BigInteger(b, 16);;) {
	    for (;;) {
	      if (this.p = new BigInteger(a - d, 1, c), this.p.subtract(BigInteger.ONE).gcd(e).compareTo(BigInteger.ONE) == 0 && this.p.isProbablePrime(10)) break;
	    }for (;;) {
	      if (this.q = new BigInteger(d, 1, c), this.q.subtract(BigInteger.ONE).gcd(e).compareTo(BigInteger.ONE) == 0 && this.q.isProbablePrime(10)) break;
	    }if (this.p.compareTo(this.q) <= 0) {
	      var g = this.p;this.p = this.q;this.q = g;
	    }var g = this.p.subtract(BigInteger.ONE),
	        h = this.q.subtract(BigInteger.ONE),
	        f = g.multiply(h);if (f.gcd(e).compareTo(BigInteger.ONE) == 0) {
	      this.n = this.p.multiply(this.q);this.d = e.modInverse(f);this.dmp1 = this.d.mod(g);this.dmq1 = this.d.mod(h);this.coeff = this.q.modInverse(this.p);break;
	    }
	  }
	}
	function RSADoPrivate(a) {
	  if (this.p == null || this.q == null) return a.modPow(this.d, this.n);for (var b = a.mod(this.p).modPow(this.dmp1, this.p), a = a.mod(this.q).modPow(this.dmq1, this.q); b.compareTo(a) < 0;) {
	    b = b.add(this.p);
	  }return b.subtract(a).multiply(this.coeff).mod(this.p).multiply(this.q).add(a);
	}function RSADecrypt(a) {
	  a = this.doPrivate(parseBigInt(a, 16));return a == null ? null : pkcs1unpad2(a, this.n.bitLength() + 7 >> 3);
	}RSAKey.prototype.doPrivate = RSADoPrivate;RSAKey.prototype.setPrivate = RSASetPrivate;
	RSAKey.prototype.setPrivateEx = RSASetPrivateEx;RSAKey.prototype.generate = RSAGenerate;RSAKey.prototype.decrypt = RSADecrypt;var _RSASIGN_DIHEAD = [];_RSASIGN_DIHEAD.sha1 = "3021300906052b0e03021a05000414";_RSASIGN_DIHEAD.sha256 = "3031300d060960864801650304020105000420";var _RSASIGN_HASHHEXFUNC = [];_RSASIGN_HASHHEXFUNC.sha1 = sha1.hex;_RSASIGN_HASHHEXFUNC.sha256 = sha256.hex;
	function _rsasign_getHexPaddedDigestInfoForString(a, b, c) {
	  b /= 4;for (var a = (0, _RSASIGN_HASHHEXFUNC[c])(a), c = "00" + _RSASIGN_DIHEAD[c] + a, a = "", b = b - 4 - c.length, d = 0; d < b; d += 2) {
	    a += "ff";
	  }return sPaddedMessageHex = "0001" + a + c;
	}function _rsasign_signString(a, b) {
	  var c = _rsasign_getHexPaddedDigestInfoForString(a, this.n.bitLength(), b);return this.doPrivate(parseBigInt(c, 16)).toString(16);
	}
	function _rsasign_signStringWithSHA1(a) {
	  a = _rsasign_getHexPaddedDigestInfoForString(a, this.n.bitLength(), "sha1");return this.doPrivate(parseBigInt(a, 16)).toString(16);
	}function _rsasign_signStringWithSHA256(a) {
	  a = _rsasign_getHexPaddedDigestInfoForString(a, this.n.bitLength(), "sha256");return this.doPrivate(parseBigInt(a, 16)).toString(16);
	}function _rsasign_getDecryptSignatureBI(a, b, c) {
	  var d = new RSAKey();d.setPublic(b, c);return d.doPublic(a);
	}
	function _rsasign_getHexDigestInfoFromSig(a, b, c) {
	  return _rsasign_getDecryptSignatureBI(a, b, c).toString(16).replace(/^1f+00/, "");
	}function _rsasign_getAlgNameAndHashFromHexDisgestInfo(a) {
	  for (var b in _RSASIGN_DIHEAD) {
	    var c = _RSASIGN_DIHEAD[b],
	        d = c.length;if (a.substring(0, d) == c) return [b, a.substring(d)];
	  }return [];
	}
	function _rsasign_verifySignatureWithArgs(a, b, c, d) {
	  b = _rsasign_getHexDigestInfoFromSig(b, c, d);c = _rsasign_getAlgNameAndHashFromHexDisgestInfo(b);if (c.length == 0) return !1;b = c[1];a = (0, _RSASIGN_HASHHEXFUNC[c[0]])(a);return b == a;
	}function _rsasign_verifyHexSignatureForMessage(a, b) {
	  var c = parseBigInt(a, 16);return _rsasign_verifySignatureWithArgs(b, c, this.n.toString(16), this.e.toString(16));
	}
	function _rsasign_verifyString(a, b) {
	  var b = b.replace(/[ \n]+/g, ""),
	      c = this.doPublic(parseBigInt(b, 16)).toString(16).replace(/^1f+00/, ""),
	      d = _rsasign_getAlgNameAndHashFromHexDisgestInfo(c);if (d.length == 0) return !1;c = d[1];d = (0, _RSASIGN_HASHHEXFUNC[d[0]])(a);return c == d;
	}RSAKey.prototype.signString = _rsasign_signString;RSAKey.prototype.signStringWithSHA1 = _rsasign_signStringWithSHA1;RSAKey.prototype.signStringWithSHA256 = _rsasign_signStringWithSHA256;RSAKey.prototype.verifyString = _rsasign_verifyString;
	RSAKey.prototype.verifyHexSignatureForMessage = _rsasign_verifyHexSignatureForMessage;
	var aes = function () {
	  var a = { Sbox: [99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171, 118, 202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162, 175, 156, 164, 114, 192, 183, 253, 147, 38, 54, 63, 247, 204, 52, 165, 229, 241, 113, 216, 49, 21, 4, 199, 35, 195, 24, 150, 5, 154, 7, 18, 128, 226, 235, 39, 178, 117, 9, 131, 44, 26, 27, 110, 90, 160, 82, 59, 214, 179, 41, 227, 47, 132, 83, 209, 0, 237, 32, 252, 177, 91, 106, 203, 190, 57, 74, 76, 88, 207, 208, 239, 170, 251, 67, 77, 51, 133, 69, 249, 2, 127, 80, 60, 159, 168, 81, 163, 64, 143, 146, 157, 56, 245, 188, 182, 218, 33, 16, 255, 243, 210, 205, 12, 19, 236, 95, 151, 68, 23, 196, 167, 126, 61, 100, 93, 25, 115, 96, 129, 79, 220, 34, 42, 144, 136, 70, 238, 184, 20, 222, 94, 11, 219, 224, 50, 58, 10, 73, 6, 36, 92, 194, 211, 172, 98, 145, 149, 228, 121, 231, 200, 55, 109, 141, 213, 78, 169, 108, 86, 244, 234, 101, 122, 174, 8, 186, 120, 37, 46, 28, 166, 180, 198, 232, 221, 116, 31, 75, 189, 139, 138, 112, 62, 181, 102, 72, 3, 246, 14, 97, 53, 87, 185, 134, 193, 29, 158, 225, 248, 152, 17, 105, 217, 142, 148, 155, 30, 135, 233, 206, 85, 40, 223, 140, 161, 137, 13, 191, 230, 66, 104, 65, 153, 45, 15, 176, 84, 187, 22], ShiftRowTab: [0, 5, 10, 15, 4, 9, 14, 3, 8, 13, 2, 7, 12, 1, 6, 11] };a.Init = function () {
	    a.Sbox_Inv = Array(256);for (var b = 0; b < 256; b++) {
	      a.Sbox_Inv[a.Sbox[b]] = b;
	    }a.ShiftRowTab_Inv = Array(16);for (b = 0; b < 16; b++) {
	      a.ShiftRowTab_Inv[a.ShiftRowTab[b]] = b;
	    }a.xtime = Array(256);for (b = 0; b < 128; b++) {
	      a.xtime[b] = b << 1, a.xtime[128 + b] = b << 1 ^ 27;
	    }
	  };a.Done = function () {
	    delete a.Sbox_Inv;delete a.ShiftRowTab_Inv;delete a.xtime;
	  };a.ExpandKey = function (b) {
	    var c = b.length,
	        d,
	        e = 1;switch (c) {case 16:
	        d = 176;break;case 24:
	        d = 208;break;case 32:
	        d = 240;break;default:
	        alert("my.ExpandKey: Only key lengths of 16, 24 or 32 bytes allowed!");}for (var g = c; g < d; g += 4) {
	      var h = b.slice(g - 4, g);if (g % c == 0) {
	        if (h = [a.Sbox[h[1]] ^ e, a.Sbox[h[2]], a.Sbox[h[3]], a.Sbox[h[0]]], (e <<= 1) >= 256) e ^= 283;
	      } else c > 24 && g % c == 16 && (h = [a.Sbox[h[0]], a.Sbox[h[1]], a.Sbox[h[2]], a.Sbox[h[3]]]);for (var f = 0; f < 4; f++) {
	        b[g + f] = b[g + f - c] ^ h[f];
	      }
	    }
	  };a.Encrypt = function (b, c) {
	    var d = c.length;a.AddRoundKey(b, c.slice(0, 16));for (var e = 16; e < d - 16; e += 16) {
	      a.SubBytes(b, a.Sbox), a.ShiftRows(b, a.ShiftRowTab), a.MixColumns(b), a.AddRoundKey(b, c.slice(e, e + 16));
	    }a.SubBytes(b, a.Sbox);a.ShiftRows(b, a.ShiftRowTab);a.AddRoundKey(b, c.slice(e, d));
	  };a.Decrypt = function (b, c) {
	    var d = c.length;a.AddRoundKey(b, c.slice(d - 16, d));a.ShiftRows(b, a.ShiftRowTab_Inv);a.SubBytes(b, a.Sbox_Inv);for (d -= 32; d >= 16; d -= 16) {
	      a.AddRoundKey(b, c.slice(d, d + 16)), a.MixColumns_Inv(b), a.ShiftRows(b, a.ShiftRowTab_Inv), a.SubBytes(b, a.Sbox_Inv);
	    }a.AddRoundKey(b, c.slice(0, 16));
	  };a.SubBytes = function (a, c) {
	    for (var d = 0; d < 16; d++) {
	      a[d] = c[a[d]];
	    }
	  };a.AddRoundKey = function (a, c) {
	    for (var d = 0; d < 16; d++) {
	      a[d] ^= c[d];
	    }
	  };a.ShiftRows = function (a, c) {
	    for (var d = [].concat(a), e = 0; e < 16; e++) {
	      a[e] = d[c[e]];
	    }
	  };
	  a.MixColumns = function (b) {
	    for (var c = 0; c < 16; c += 4) {
	      var d = b[c + 0],
	          e = b[c + 1],
	          g = b[c + 2],
	          h = b[c + 3],
	          f = d ^ e ^ g ^ h;b[c + 0] ^= f ^ a.xtime[d ^ e];b[c + 1] ^= f ^ a.xtime[e ^ g];b[c + 2] ^= f ^ a.xtime[g ^ h];b[c + 3] ^= f ^ a.xtime[h ^ d];
	    }
	  };a.MixColumns_Inv = function (b) {
	    for (var c = 0; c < 16; c += 4) {
	      var d = b[c + 0],
	          e = b[c + 1],
	          g = b[c + 2],
	          h = b[c + 3],
	          f = d ^ e ^ g ^ h,
	          o = a.xtime[f],
	          p = a.xtime[a.xtime[o ^ d ^ g]] ^ f;f ^= a.xtime[a.xtime[o ^ e ^ h]];b[c + 0] ^= p ^ a.xtime[d ^ e];b[c + 1] ^= f ^ a.xtime[e ^ g];b[c + 2] ^= p ^ a.xtime[g ^ h];b[c + 3] ^= f ^ a.xtime[h ^ d];
	    }
	  };return a;
	}(),
	    cryptico = function () {
	  var a = {};aes.Init();
	  a.b256to64 = function (a) {
	    var c,
	        d,
	        e,
	        g = "",
	        h = 0,
	        f = 0,
	        o = a.length;for (e = 0; e < o; e++) {
	      d = a.charCodeAt(e), f == 0 ? (g += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(d >> 2 & 63), c = (d & 3) << 4) : f == 1 ? (g += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(c | d >> 4 & 15), c = (d & 15) << 2) : f == 2 && (g += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(c | d >> 6 & 3), h += 1, g += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(d & 63)), h += 1, f += 1, f == 3 && (f = 0);
	    }f > 0 && (g += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(c), g += "=");f == 1 && (g += "=");return g;
	  };a.b64to256 = function (a) {
	    var c,
	        d,
	        e = "",
	        g = 0,
	        h = 0,
	        f = a.length;for (d = 0; d < f; d++) {
	      c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(a.charAt(d)), c >= 0 && (g && (e += String.fromCharCode(h | c >> 6 - g & 255)), g = g + 2 & 7, h = c << g & 255);
	    }return e;
	  };a.b16to64 = function (a) {
	    var c,
	        d,
	        e = "";a.length % 2 == 1 && (a = "0" + a);for (c = 0; c + 3 <= a.length; c += 3) {
	      d = parseInt(a.substring(c, c + 3), 16), e += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(d >> 6) + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(d & 63);
	    }c + 1 == a.length ? (d = parseInt(a.substring(c, c + 1), 16), e += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(d << 2)) : c + 2 == a.length && (d = parseInt(a.substring(c, c + 2), 16), e += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(d >> 2) + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt((d & 3) << 4));for (; (e.length & 3) > 0;) {
	      e += "=";
	    }return e;
	  };a.b64to16 = function (a) {
	    var c = "",
	        d,
	        e = 0,
	        g;for (d = 0; d < a.length; ++d) {
	      if (a.charAt(d) == "=") break;v = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(a.charAt(d));v < 0 || (e == 0 ? (c += int2char(v >> 2), g = v & 3, e = 1) : e == 1 ? (c += int2char(g << 2 | v >> 4), g = v & 15, e = 2) : e == 2 ? (c += int2char(g), c += int2char(v >> 2), g = v & 3, e = 3) : (c += int2char(g << 2 | v >> 4), c += int2char(v & 15), e = 0));
	    }e == 1 && (c += int2char(g << 2));return c;
	  };a.string2bytes = function (a) {
	    for (var c = [], d = 0; d < a.length; d++) {
	      c.push(a.charCodeAt(d));
	    }return c;
	  };a.bytes2string = function (a) {
	    for (var c = "", d = 0; d < a.length; d++) {
	      c += String.fromCharCode(a[d]);
	    }return c;
	  };a.blockXOR = function (a, c) {
	    for (var d = Array(16), e = 0; e < 16; e++) {
	      d[e] = a[e] ^ c[e];
	    }return d;
	  };a.blockIV = function () {
	    var a = new SecureRandom(),
	        c = Array(16);a.nextBytes(c);return c;
	  };a.pad16 = function (a) {
	    var c = a.slice(0),
	        d = (16 - a.length % 16) % 16;for (i = a.length; i < a.length + d; i++) {
	      c.push(0);
	    }return c;
	  };a.depad = function (a) {
	    for (a = a.slice(0); a[a.length - 1] == 0;) {
	      a = a.slice(0, a.length - 1);
	    }return a;
	  };a.encryptAESCBC = function (b, c) {
	    var d = c.slice(0);aes.ExpandKey(d);for (var e = a.string2bytes(b), e = a.pad16(e), g = a.blockIV(), h = 0; h < e.length / 16; h++) {
	      var f = e.slice(h * 16, h * 16 + 16),
	          o = g.slice(h * 16, h * 16 + 16),
	          f = a.blockXOR(o, f);aes.Encrypt(f, d);g = g.concat(f);
	    }d = a.bytes2string(g);return a.b256to64(d);
	  };a.decryptAESCBC = function (b, c) {
	    var d = c.slice(0);aes.ExpandKey(d);for (var b = a.b64to256(b), e = a.string2bytes(b), g = [], h = 1; h < e.length / 16; h++) {
	      var f = e.slice(h * 16, h * 16 + 16),
	          o = e.slice((h - 1) * 16, (h - 1) * 16 + 16);aes.Decrypt(f, d);f = a.blockXOR(o, f);g = g.concat(f);
	    }g = a.depad(g);return a.bytes2string(g);
	  };a.wrap60 = function (a) {
	    for (var c = "", d = 0; d < a.length; d++) {
	      d % 60 == 0 && d != 0 && (c += "\n"), c += a[d];
	    }return c;
	  };a.generateAESKey = function () {
	    var a = Array(16);new SecureRandom().nextBytes(a);return a;
	  };a.generateRSAKey = function (a, c) {
	    Math.seedrandom(sha256.hex(a));var d = new RSAKey();d.generate(c, "10001");return d;
	  };a.publicKeyString = function (b) {
	    return pubkey = b.n.toString(16);
	  };a.publicKeyID = function (a) {
	    return MD5(a);
	  };a.publicKeyFromString = function (b) {
	    var b = b.split("|")[0],
	        c = new RSAKey();c.setPublic(b, "10001");return c;
	  };a.encrypt = function (b, c, d) {
	    var e = "";try {
	      var h = a.publicKeyFromString(c);e += h.encrypt(b) + "?";
	    } catch (f) {
	      return { status: "Invalid public key" };
	    };return { status: "success", cipher: e };
	  };a.decrypt = function (b, c) {
	    var d = b.split("?"),
	        e = c.decrypt(d[0]);return { status: "success", plaintext: e, signature: "unsigned" };
	  };return a;
	}();
	module.exports = cryptico;

/***/ },
/* 12 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	var CryptoJS = CryptoJS || function (u, p) {
	  var d = {},
	      l = d.lib = {},
	      s = function s() {},
	      t = l.Base = { extend: function extend(a) {
	      s.prototype = this;var c = new s();a && c.mixIn(a);c.hasOwnProperty("init") || (c.init = function () {
	        c.$super.init.apply(this, arguments);
	      });c.init.prototype = c;c.$super = this;return c;
	    }, create: function create() {
	      var a = this.extend();a.init.apply(a, arguments);return a;
	    }, init: function init() {}, mixIn: function mixIn(a) {
	      for (var c in a) {
	        a.hasOwnProperty(c) && (this[c] = a[c]);
	      }a.hasOwnProperty("toString") && (this.toString = a.toString);
	    }, clone: function clone() {
	      return this.init.prototype.extend(this);
	    } },
	      r = l.WordArray = t.extend({ init: function init(a, c) {
	      a = this.words = a || [];this.sigBytes = c != p ? c : 4 * a.length;
	    }, toString: function toString(a) {
	      return (a || v).stringify(this);
	    }, concat: function concat(a) {
	      var c = this.words,
	          e = a.words,
	          j = this.sigBytes;a = a.sigBytes;this.clamp();if (j % 4) for (var k = 0; k < a; k++) {
	        c[j + k >>> 2] |= (e[k >>> 2] >>> 24 - 8 * (k % 4) & 255) << 24 - 8 * ((j + k) % 4);
	      } else if (65535 < e.length) for (k = 0; k < a; k += 4) {
	        c[j + k >>> 2] = e[k >>> 2];
	      } else c.push.apply(c, e);this.sigBytes += a;return this;
	    }, clamp: function clamp() {
	      var a = this.words,
	          c = this.sigBytes;a[c >>> 2] &= 4294967295 << 32 - 8 * (c % 4);a.length = u.ceil(c / 4);
	    }, clone: function clone() {
	      var a = t.clone.call(this);a.words = this.words.slice(0);return a;
	    }, random: function random(a) {
	      for (var c = [], e = 0; e < a; e += 4) {
	        c.push(4294967296 * u.random() | 0);
	      }return new r.init(c, a);
	    } }),
	      w = d.enc = {},
	      v = w.Hex = { stringify: function stringify(a) {
	      var c = a.words;a = a.sigBytes;for (var e = [], j = 0; j < a; j++) {
	        var k = c[j >>> 2] >>> 24 - 8 * (j % 4) & 255;e.push((k >>> 4).toString(16));e.push((k & 15).toString(16));
	      }return e.join("");
	    }, parse: function parse(a) {
	      for (var c = a.length, e = [], j = 0; j < c; j += 2) {
	        e[j >>> 3] |= parseInt(a.substr(j, 2), 16) << 24 - 4 * (j % 8);
	      }return new r.init(e, c / 2);
	    } },
	      b = w.Latin1 = { stringify: function stringify(a) {
	      var c = a.words;a = a.sigBytes;for (var e = [], j = 0; j < a; j++) {
	        e.push(String.fromCharCode(c[j >>> 2] >>> 24 - 8 * (j % 4) & 255));
	      }return e.join("");
	    }, parse: function parse(a) {
	      for (var c = a.length, e = [], j = 0; j < c; j++) {
	        e[j >>> 2] |= (a.charCodeAt(j) & 255) << 24 - 8 * (j % 4);
	      }return new r.init(e, c);
	    } },
	      x = w.Utf8 = { stringify: function stringify(a) {
	      try {
	        return decodeURIComponent(escape(b.stringify(a)));
	      } catch (c) {
	        throw Error("Malformed UTF-8 data");
	      }
	    }, parse: function parse(a) {
	      return b.parse(unescape(encodeURIComponent(a)));
	    } },
	      q = l.BufferedBlockAlgorithm = t.extend({ reset: function reset() {
	      this._data = new r.init();this._nDataBytes = 0;
	    }, _append: function _append(a) {
	      "string" == typeof a && (a = x.parse(a));this._data.concat(a);this._nDataBytes += a.sigBytes;
	    }, _process: function _process(a) {
	      var c = this._data,
	          e = c.words,
	          j = c.sigBytes,
	          k = this.blockSize,
	          b = j / (4 * k),
	          b = a ? u.ceil(b) : u.max((b | 0) - this._minBufferSize, 0);a = b * k;j = u.min(4 * a, j);if (a) {
	        for (var q = 0; q < a; q += k) {
	          this._doProcessBlock(e, q);
	        }q = e.splice(0, a);c.sigBytes -= j;
	      }return new r.init(q, j);
	    }, clone: function clone() {
	      var a = t.clone.call(this);
	      a._data = this._data.clone();return a;
	    }, _minBufferSize: 0 });l.Hasher = q.extend({ cfg: t.extend(), init: function init(a) {
	      this.cfg = this.cfg.extend(a);this.reset();
	    }, reset: function reset() {
	      q.reset.call(this);this._doReset();
	    }, update: function update(a) {
	      this._append(a);this._process();return this;
	    }, finalize: function finalize(a) {
	      a && this._append(a);return this._doFinalize();
	    }, blockSize: 16, _createHelper: function _createHelper(a) {
	      return function (b, e) {
	        return new a.init(e).finalize(b);
	      };
	    }, _createHmacHelper: function _createHmacHelper(a) {
	      return function (b, e) {
	        return new n.HMAC.init(a, e).finalize(b);
	      };
	    } });var n = d.algo = {};return d;
	}(Math);
	(function () {
	  var u = CryptoJS,
	      p = u.lib.WordArray;u.enc.Base64 = { stringify: function stringify(d) {
	      var l = d.words,
	          p = d.sigBytes,
	          t = this._map;d.clamp();d = [];for (var r = 0; r < p; r += 3) {
	        for (var w = (l[r >>> 2] >>> 24 - 8 * (r % 4) & 255) << 16 | (l[r + 1 >>> 2] >>> 24 - 8 * ((r + 1) % 4) & 255) << 8 | l[r + 2 >>> 2] >>> 24 - 8 * ((r + 2) % 4) & 255, v = 0; 4 > v && r + 0.75 * v < p; v++) {
	          d.push(t.charAt(w >>> 6 * (3 - v) & 63));
	        }
	      }if (l = t.charAt(64)) for (; d.length % 4;) {
	        d.push(l);
	      }return d.join("");
	    }, parse: function parse(d) {
	      var l = d.length,
	          s = this._map,
	          t = s.charAt(64);t && (t = d.indexOf(t), -1 != t && (l = t));for (var t = [], r = 0, w = 0; w < l; w++) {
	        if (w % 4) {
	          var v = s.indexOf(d.charAt(w - 1)) << 2 * (w % 4),
	              b = s.indexOf(d.charAt(w)) >>> 6 - 2 * (w % 4);t[r >>> 2] |= (v | b) << 24 - 8 * (r % 4);r++;
	        }
	      }return p.create(t, r);
	    }, _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=" };
	})();
	(function (u) {
	  function p(b, n, a, c, e, j, k) {
	    b = b + (n & a | ~n & c) + e + k;return (b << j | b >>> 32 - j) + n;
	  }function d(b, n, a, c, e, j, k) {
	    b = b + (n & c | a & ~c) + e + k;return (b << j | b >>> 32 - j) + n;
	  }function l(b, n, a, c, e, j, k) {
	    b = b + (n ^ a ^ c) + e + k;return (b << j | b >>> 32 - j) + n;
	  }function s(b, n, a, c, e, j, k) {
	    b = b + (a ^ (n | ~c)) + e + k;return (b << j | b >>> 32 - j) + n;
	  }for (var t = CryptoJS, r = t.lib, w = r.WordArray, v = r.Hasher, r = t.algo, b = [], x = 0; 64 > x; x++) {
	    b[x] = 4294967296 * u.abs(u.sin(x + 1)) | 0;
	  }r = r.MD5 = v.extend({ _doReset: function _doReset() {
	      this._hash = new w.init([1732584193, 4023233417, 2562383102, 271733878]);
	    },
	    _doProcessBlock: function _doProcessBlock(q, n) {
	      for (var a = 0; 16 > a; a++) {
	        var c = n + a,
	            e = q[c];q[c] = (e << 8 | e >>> 24) & 16711935 | (e << 24 | e >>> 8) & 4278255360;
	      }var a = this._hash.words,
	          c = q[n + 0],
	          e = q[n + 1],
	          j = q[n + 2],
	          k = q[n + 3],
	          z = q[n + 4],
	          r = q[n + 5],
	          t = q[n + 6],
	          w = q[n + 7],
	          v = q[n + 8],
	          A = q[n + 9],
	          B = q[n + 10],
	          C = q[n + 11],
	          u = q[n + 12],
	          D = q[n + 13],
	          E = q[n + 14],
	          x = q[n + 15],
	          f = a[0],
	          m = a[1],
	          g = a[2],
	          h = a[3],
	          f = p(f, m, g, h, c, 7, b[0]),
	          h = p(h, f, m, g, e, 12, b[1]),
	          g = p(g, h, f, m, j, 17, b[2]),
	          m = p(m, g, h, f, k, 22, b[3]),
	          f = p(f, m, g, h, z, 7, b[4]),
	          h = p(h, f, m, g, r, 12, b[5]),
	          g = p(g, h, f, m, t, 17, b[6]),
	          m = p(m, g, h, f, w, 22, b[7]),
	          f = p(f, m, g, h, v, 7, b[8]),
	          h = p(h, f, m, g, A, 12, b[9]),
	          g = p(g, h, f, m, B, 17, b[10]),
	          m = p(m, g, h, f, C, 22, b[11]),
	          f = p(f, m, g, h, u, 7, b[12]),
	          h = p(h, f, m, g, D, 12, b[13]),
	          g = p(g, h, f, m, E, 17, b[14]),
	          m = p(m, g, h, f, x, 22, b[15]),
	          f = d(f, m, g, h, e, 5, b[16]),
	          h = d(h, f, m, g, t, 9, b[17]),
	          g = d(g, h, f, m, C, 14, b[18]),
	          m = d(m, g, h, f, c, 20, b[19]),
	          f = d(f, m, g, h, r, 5, b[20]),
	          h = d(h, f, m, g, B, 9, b[21]),
	          g = d(g, h, f, m, x, 14, b[22]),
	          m = d(m, g, h, f, z, 20, b[23]),
	          f = d(f, m, g, h, A, 5, b[24]),
	          h = d(h, f, m, g, E, 9, b[25]),
	          g = d(g, h, f, m, k, 14, b[26]),
	          m = d(m, g, h, f, v, 20, b[27]),
	          f = d(f, m, g, h, D, 5, b[28]),
	          h = d(h, f, m, g, j, 9, b[29]),
	          g = d(g, h, f, m, w, 14, b[30]),
	          m = d(m, g, h, f, u, 20, b[31]),
	          f = l(f, m, g, h, r, 4, b[32]),
	          h = l(h, f, m, g, v, 11, b[33]),
	          g = l(g, h, f, m, C, 16, b[34]),
	          m = l(m, g, h, f, E, 23, b[35]),
	          f = l(f, m, g, h, e, 4, b[36]),
	          h = l(h, f, m, g, z, 11, b[37]),
	          g = l(g, h, f, m, w, 16, b[38]),
	          m = l(m, g, h, f, B, 23, b[39]),
	          f = l(f, m, g, h, D, 4, b[40]),
	          h = l(h, f, m, g, c, 11, b[41]),
	          g = l(g, h, f, m, k, 16, b[42]),
	          m = l(m, g, h, f, t, 23, b[43]),
	          f = l(f, m, g, h, A, 4, b[44]),
	          h = l(h, f, m, g, u, 11, b[45]),
	          g = l(g, h, f, m, x, 16, b[46]),
	          m = l(m, g, h, f, j, 23, b[47]),
	          f = s(f, m, g, h, c, 6, b[48]),
	          h = s(h, f, m, g, w, 10, b[49]),
	          g = s(g, h, f, m, E, 15, b[50]),
	          m = s(m, g, h, f, r, 21, b[51]),
	          f = s(f, m, g, h, u, 6, b[52]),
	          h = s(h, f, m, g, k, 10, b[53]),
	          g = s(g, h, f, m, B, 15, b[54]),
	          m = s(m, g, h, f, e, 21, b[55]),
	          f = s(f, m, g, h, v, 6, b[56]),
	          h = s(h, f, m, g, x, 10, b[57]),
	          g = s(g, h, f, m, t, 15, b[58]),
	          m = s(m, g, h, f, D, 21, b[59]),
	          f = s(f, m, g, h, z, 6, b[60]),
	          h = s(h, f, m, g, C, 10, b[61]),
	          g = s(g, h, f, m, j, 15, b[62]),
	          m = s(m, g, h, f, A, 21, b[63]);a[0] = a[0] + f | 0;a[1] = a[1] + m | 0;a[2] = a[2] + g | 0;a[3] = a[3] + h | 0;
	    }, _doFinalize: function _doFinalize() {
	      var b = this._data,
	          n = b.words,
	          a = 8 * this._nDataBytes,
	          c = 8 * b.sigBytes;n[c >>> 5] |= 128 << 24 - c % 32;var e = u.floor(a / 4294967296);n[(c + 64 >>> 9 << 4) + 15] = (e << 8 | e >>> 24) & 16711935 | (e << 24 | e >>> 8) & 4278255360;n[(c + 64 >>> 9 << 4) + 14] = (a << 8 | a >>> 24) & 16711935 | (a << 24 | a >>> 8) & 4278255360;b.sigBytes = 4 * (n.length + 1);this._process();b = this._hash;n = b.words;for (a = 0; 4 > a; a++) {
	        c = n[a], n[a] = (c << 8 | c >>> 24) & 16711935 | (c << 24 | c >>> 8) & 4278255360;
	      }return b;
	    }, clone: function clone() {
	      var b = v.clone.call(this);b._hash = this._hash.clone();return b;
	    } });t.MD5 = v._createHelper(r);t.HmacMD5 = v._createHmacHelper(r);
	})(Math);
	(function () {
	  var u = CryptoJS,
	      p = u.lib,
	      d = p.Base,
	      l = p.WordArray,
	      p = u.algo,
	      s = p.EvpKDF = d.extend({ cfg: d.extend({ keySize: 4, hasher: p.MD5, iterations: 1 }), init: function init(d) {
	      this.cfg = this.cfg.extend(d);
	    }, compute: function compute(d, r) {
	      for (var p = this.cfg, s = p.hasher.create(), b = l.create(), u = b.words, q = p.keySize, p = p.iterations; u.length < q;) {
	        n && s.update(n);var n = s.update(d).finalize(r);s.reset();for (var a = 1; a < p; a++) {
	          n = s.finalize(n), s.reset();
	        }b.concat(n);
	      }b.sigBytes = 4 * q;return b;
	    } });u.EvpKDF = function (d, l, p) {
	    return s.create(p).compute(d, l);
	  };
	})();
	CryptoJS.lib.Cipher || function (u) {
	  var p = CryptoJS,
	      d = p.lib,
	      l = d.Base,
	      s = d.WordArray,
	      t = d.BufferedBlockAlgorithm,
	      r = p.enc.Base64,
	      w = p.algo.EvpKDF,
	      v = d.Cipher = t.extend({ cfg: l.extend(), createEncryptor: function createEncryptor(e, a) {
	      return this.create(this._ENC_XFORM_MODE, e, a);
	    }, createDecryptor: function createDecryptor(e, a) {
	      return this.create(this._DEC_XFORM_MODE, e, a);
	    }, init: function init(e, a, b) {
	      this.cfg = this.cfg.extend(b);this._xformMode = e;this._key = a;this.reset();
	    }, reset: function reset() {
	      t.reset.call(this);this._doReset();
	    }, process: function process(e) {
	      this._append(e);return this._process();
	    },
	    finalize: function finalize(e) {
	      e && this._append(e);return this._doFinalize();
	    }, keySize: 4, ivSize: 4, _ENC_XFORM_MODE: 1, _DEC_XFORM_MODE: 2, _createHelper: function _createHelper(e) {
	      return { encrypt: function encrypt(b, k, d) {
	          return ("string" == typeof k ? c : a).encrypt(e, b, k, d);
	        }, decrypt: function decrypt(b, k, d) {
	          return ("string" == typeof k ? c : a).decrypt(e, b, k, d);
	        } };
	    } });d.StreamCipher = v.extend({ _doFinalize: function _doFinalize() {
	      return this._process(!0);
	    }, blockSize: 1 });var b = p.mode = {},
	      x = function x(e, a, b) {
	    var c = this._iv;c ? this._iv = u : c = this._prevBlock;for (var d = 0; d < b; d++) {
	      e[a + d] ^= c[d];
	    }
	  },
	      q = (d.BlockCipherMode = l.extend({ createEncryptor: function createEncryptor(e, a) {
	      return this.Encryptor.create(e, a);
	    }, createDecryptor: function createDecryptor(e, a) {
	      return this.Decryptor.create(e, a);
	    }, init: function init(e, a) {
	      this._cipher = e;this._iv = a;
	    } })).extend();q.Encryptor = q.extend({ processBlock: function processBlock(e, a) {
	      var b = this._cipher,
	          c = b.blockSize;x.call(this, e, a, c);b.encryptBlock(e, a);this._prevBlock = e.slice(a, a + c);
	    } });q.Decryptor = q.extend({ processBlock: function processBlock(e, a) {
	      var b = this._cipher,
	          c = b.blockSize,
	          d = e.slice(a, a + c);b.decryptBlock(e, a);x.call(this, e, a, c);this._prevBlock = d;
	    } });b = b.CBC = q;q = (p.pad = {}).Pkcs7 = { pad: function pad(a, b) {
	      for (var c = 4 * b, c = c - a.sigBytes % c, d = c << 24 | c << 16 | c << 8 | c, l = [], n = 0; n < c; n += 4) {
	        l.push(d);
	      }c = s.create(l, c);a.concat(c);
	    }, unpad: function unpad(a) {
	      a.sigBytes -= a.words[a.sigBytes - 1 >>> 2] & 255;
	    } };d.BlockCipher = v.extend({ cfg: v.cfg.extend({ mode: b, padding: q }), reset: function reset() {
	      v.reset.call(this);var a = this.cfg,
	          b = a.iv,
	          a = a.mode;if (this._xformMode == this._ENC_XFORM_MODE) var c = a.createEncryptor;else c = a.createDecryptor, this._minBufferSize = 1;this._mode = c.call(a, this, b && b.words);
	    }, _doProcessBlock: function _doProcessBlock(a, b) {
	      this._mode.processBlock(a, b);
	    }, _doFinalize: function _doFinalize() {
	      var a = this.cfg.padding;if (this._xformMode == this._ENC_XFORM_MODE) {
	        a.pad(this._data, this.blockSize);var b = this._process(!0);
	      } else b = this._process(!0), a.unpad(b);return b;
	    }, blockSize: 4 });var n = d.CipherParams = l.extend({ init: function init(a) {
	      this.mixIn(a);
	    }, toString: function toString(a) {
	      return (a || this.formatter).stringify(this);
	    } }),
	      b = (p.format = {}).OpenSSL = { stringify: function stringify(a) {
	      var b = a.ciphertext;a = a.salt;return (a ? s.create([1398893684, 1701076831]).concat(a).concat(b) : b).toString(r);
	    }, parse: function parse(a) {
	      a = r.parse(a);var b = a.words;if (1398893684 == b[0] && 1701076831 == b[1]) {
	        var c = s.create(b.slice(2, 4));b.splice(0, 4);a.sigBytes -= 16;
	      }return n.create({ ciphertext: a, salt: c });
	    } },
	      a = d.SerializableCipher = l.extend({ cfg: l.extend({ format: b }), encrypt: function encrypt(a, b, c, d) {
	      d = this.cfg.extend(d);var l = a.createEncryptor(c, d);b = l.finalize(b);l = l.cfg;return n.create({ ciphertext: b, key: c, iv: l.iv, algorithm: a, mode: l.mode, padding: l.padding, blockSize: a.blockSize, formatter: d.format });
	    },
	    decrypt: function decrypt(a, b, c, d) {
	      d = this.cfg.extend(d);b = this._parse(b, d.format);return a.createDecryptor(c, d).finalize(b.ciphertext);
	    }, _parse: function _parse(a, b) {
	      return "string" == typeof a ? b.parse(a, this) : a;
	    } }),
	      p = (p.kdf = {}).OpenSSL = { execute: function execute(a, b, c, d) {
	      d || (d = s.random(8));a = w.create({ keySize: b + c }).compute(a, d);c = s.create(a.words.slice(b), 4 * c);a.sigBytes = 4 * b;return n.create({ key: a, iv: c, salt: d });
	    } },
	      c = d.PasswordBasedCipher = a.extend({ cfg: a.cfg.extend({ kdf: p }), encrypt: function encrypt(b, c, d, l) {
	      l = this.cfg.extend(l);d = l.kdf.execute(d, b.keySize, b.ivSize);l.iv = d.iv;b = a.encrypt.call(this, b, c, d.key, l);b.mixIn(d);return b;
	    }, decrypt: function decrypt(b, c, d, l) {
	      l = this.cfg.extend(l);c = this._parse(c, l.format);d = l.kdf.execute(d, b.keySize, b.ivSize, c.salt);l.iv = d.iv;return a.decrypt.call(this, b, c, d.key, l);
	    } });
	}();
	(function () {
	  for (var u = CryptoJS, p = u.lib.BlockCipher, d = u.algo, l = [], s = [], t = [], r = [], w = [], v = [], b = [], x = [], q = [], n = [], a = [], c = 0; 256 > c; c++) {
	    a[c] = 128 > c ? c << 1 : c << 1 ^ 283;
	  }for (var e = 0, j = 0, c = 0; 256 > c; c++) {
	    var k = j ^ j << 1 ^ j << 2 ^ j << 3 ^ j << 4,
	        k = k >>> 8 ^ k & 255 ^ 99;l[e] = k;s[k] = e;var z = a[e],
	        F = a[z],
	        G = a[F],
	        y = 257 * a[k] ^ 16843008 * k;t[e] = y << 24 | y >>> 8;r[e] = y << 16 | y >>> 16;w[e] = y << 8 | y >>> 24;v[e] = y;y = 16843009 * G ^ 65537 * F ^ 257 * z ^ 16843008 * e;b[k] = y << 24 | y >>> 8;x[k] = y << 16 | y >>> 16;q[k] = y << 8 | y >>> 24;n[k] = y;e ? (e = z ^ a[a[a[G ^ z]]], j ^= a[a[j]]) : e = j = 1;
	  }var H = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54],
	      d = d.AES = p.extend({ _doReset: function _doReset() {
	      for (var a = this._key, c = a.words, d = a.sigBytes / 4, a = 4 * ((this._nRounds = d + 6) + 1), e = this._keySchedule = [], j = 0; j < a; j++) {
	        if (j < d) e[j] = c[j];else {
	          var k = e[j - 1];j % d ? 6 < d && 4 == j % d && (k = l[k >>> 24] << 24 | l[k >>> 16 & 255] << 16 | l[k >>> 8 & 255] << 8 | l[k & 255]) : (k = k << 8 | k >>> 24, k = l[k >>> 24] << 24 | l[k >>> 16 & 255] << 16 | l[k >>> 8 & 255] << 8 | l[k & 255], k ^= H[j / d | 0] << 24);e[j] = e[j - d] ^ k;
	        }
	      }c = this._invKeySchedule = [];for (d = 0; d < a; d++) {
	        j = a - d, k = d % 4 ? e[j] : e[j - 4], c[d] = 4 > d || 4 >= j ? k : b[l[k >>> 24]] ^ x[l[k >>> 16 & 255]] ^ q[l[k >>> 8 & 255]] ^ n[l[k & 255]];
	      }
	    }, encryptBlock: function encryptBlock(a, b) {
	      this._doCryptBlock(a, b, this._keySchedule, t, r, w, v, l);
	    }, decryptBlock: function decryptBlock(a, c) {
	      var d = a[c + 1];a[c + 1] = a[c + 3];a[c + 3] = d;this._doCryptBlock(a, c, this._invKeySchedule, b, x, q, n, s);d = a[c + 1];a[c + 1] = a[c + 3];a[c + 3] = d;
	    }, _doCryptBlock: function _doCryptBlock(a, b, c, d, e, j, l, f) {
	      for (var m = this._nRounds, g = a[b] ^ c[0], h = a[b + 1] ^ c[1], k = a[b + 2] ^ c[2], n = a[b + 3] ^ c[3], p = 4, r = 1; r < m; r++) {
	        var q = d[g >>> 24] ^ e[h >>> 16 & 255] ^ j[k >>> 8 & 255] ^ l[n & 255] ^ c[p++],
	            s = d[h >>> 24] ^ e[k >>> 16 & 255] ^ j[n >>> 8 & 255] ^ l[g & 255] ^ c[p++],
	            t = d[k >>> 24] ^ e[n >>> 16 & 255] ^ j[g >>> 8 & 255] ^ l[h & 255] ^ c[p++],
	            n = d[n >>> 24] ^ e[g >>> 16 & 255] ^ j[h >>> 8 & 255] ^ l[k & 255] ^ c[p++],
	            g = q,
	            h = s,
	            k = t;
	      }q = (f[g >>> 24] << 24 | f[h >>> 16 & 255] << 16 | f[k >>> 8 & 255] << 8 | f[n & 255]) ^ c[p++];s = (f[h >>> 24] << 24 | f[k >>> 16 & 255] << 16 | f[n >>> 8 & 255] << 8 | f[g & 255]) ^ c[p++];t = (f[k >>> 24] << 24 | f[n >>> 16 & 255] << 16 | f[g >>> 8 & 255] << 8 | f[h & 255]) ^ c[p++];n = (f[n >>> 24] << 24 | f[g >>> 16 & 255] << 16 | f[h >>> 8 & 255] << 8 | f[k & 255]) ^ c[p++];a[b] = q;a[b + 1] = s;a[b + 2] = t;a[b + 3] = n;
	    }, keySize: 8 });u.AES = p._createHelper(d);
	})();
	exports.default = CryptoJS;

/***/ },
/* 13 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * @synopsis 本地服务取流
	 *
	 * @note [ADD][2017-07-28]新建 by fengzhongjian
	 *
	 */
	var LocalService = function () {
	    if (typeof Symbol === "undefined") {
	        return;
	    }

	    var LocalServer = function () {
	        function LocalServer() {
	            _classCallCheck(this, LocalServer);
	        }
	        //to do

	        //创建取流客户端对象


	        _createClass(LocalServer, [{
	            key: "createClientObject",
	            value: function createClientObject(oWebsocket, szId, szPlayURL, oParams) {
	                return {
	                    socket: oWebsocket,
	                    id: szId,
	                    playURL: szPlayURL,
	                    deviceSerial: oParams.deviceSerial || "",
	                    verificationCode: oParams.verificationCode || "",
	                    resolve: null,
	                    reject: null
	                };
	            }
	            //普通通道预览

	        }, {
	            key: "playCmd",
	            value: function playCmd(oWebsocket) {
	                var oCmd = {
	                    sequence: 0,
	                    cmd: 'realplay',
	                    deviceSerial: oWebsocket.deviceSerial,
	                    verificationCode: oWebsocket.verificationCode,
	                    url: oWebsocket.playURL
	                };
	                return JSON.stringify(oCmd);
	            }
	            //回放

	        }, {
	            key: "playbackCmd",
	            value: function playbackCmd(oWebsocket, szStartTime, szStopTime) {
	                var oCmd = {
	                    sequence: 0,
	                    cmd: 'playback',
	                    deviceSerial: oWebsocket.deviceSerial,
	                    verificationCode: oWebsocket.verificationCode,
	                    url: oWebsocket.playURL,
	                    startTime: szStartTime,
	                    endTime: szStopTime
	                };
	                return JSON.stringify(oCmd);
	            }
	        }]);

	        return LocalServer;
	    }();

	    return LocalServer;
	}();

	exports.LocalService = LocalService;

/***/ },
/* 14 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * Created by wangweijie5 on 2016/12/2.
	 */

	// 错误码
	//const PLAYM4_ERROR                  = 0;    // 错误
	var PLAYM4_NOERROR = 0; // 正确
	var PLAYM4_PARA_OVER = 1; // 参数错误
	var PLAYM4_ORDER_ERROR = 2; // 调用接口顺序错误
	var PLAYM4_TIMER_ERROR = 3; // 创建多媒体时钟错误
	var PLAYM4_DEC_VIDEO_ERROR = 4; // 视频设备错误
	var PLAYM4_DEC_AUDIO_ERROR = 5; // 音频设备错误
	var PLAYM4_ALLOC_MEMORY_ERROR = 6; // 申请内存失败
	var PLAYM4_OPEN_FILE_ERROR = 7; // 打开文件失败
	var PLAYM4_BUF_OVER = 11; // 缓存溢出
	var PLAYM4_CREATE_SOUND_ERROR = 12; // 创建音频设备失败
	var PLAYM4_SET_VOLUME_ERROR = 13; // 设置音频音量失败
	var PLAYM4_SUPPORT_FILE_ONLY = 14; // 只支持文件模式
	var PLAYM4_SUPPORT_STREAM_ONLY = 15; // 只支持流模式
	var PLAYM4_SYS_NOT_SUPPORT = 16; // 不支持
	var PLAYM4_FILEHEADER_UNKNOWN = 17; // 无文件头信息
	var PLAYM4_VERSION_INCORRECT = 18; // 解码库版本不对
	var PLAYM4_INIT_DECODER_ERROR = 19; // 初始化解码库失败
	var PLAYM4_CHECK_FILE_ERROR = 20; // 数据有误
	var PLAYM4_INIT_TIMER_ERROR = 21; // 初始化多媒体时钟失败
	var PLAYM4_BLT_ERROR = 22; // Blt失败
	var PLAYM4_OPEN_FILE_ERROR_MULTI = 24; // 打开文件失败，码流是复合流
	var PLAYM4_OPEN_FILE_ERROR_VIDEO = 25; // 打开文件失败，码流是纯视频
	var PLAYM4_JPEG_COMPRESS_ERROR = 26; // Jpeg编码失败
	var PLAYM4_EXTRACT_NOT_SUPPORT = 27; // 不支持该版本
	var PLAYM4_EXTRACT_DATA_ERROR = 28; // 解析数据失败
	var PLAYM4_SECRET_KEY_ERROR = 29; // 密钥错误
	var PLAYM4_DECODE_KEYFRAME_ERROR = 30; // 解码关键帧失败
	var PLAYM4_NEED_MORE_DATA = 31; // 需要更多数据才能解析
	var PLAYM4_NOT_FIND = 33; // 未找到
	var PLAYM4_NEED_LARGER_BUFFER = 34; // 需要更大的缓存
	var PLAYM4_FAIL_UNKNOWN = 99; // 未知错误
	var PLAYM4_INIT_RTPDEMUX_ERROR = 40; // RTP解析库初始化错误
	var PLAYM4_RTPDEMUX_CREATE_ERROR = 41; // RTP解析句柄创建失败
	var PLAYM4_RTPDEMUX_OUTBUF_LACK = 42; // RTP解析输出数据不足
	var PLAYM4_HANDLE_ERROR = 43; // 句柄创建失败
	var PLAYM4_DECODE_ERROR = 44; // 解码失败
	var PLAYM4_NEW_ERROR = 45; // new失败
	var PLAYM4_PRECONDITION_ERROR = 46;
	var PLAYM4_DEMUX_ERROR = 47; // 解析错误
	var PLAYM4_NOT_KEYFRAME = 48; // 非关键帧
	var PLAYM4_WORKER_ERROR = 60; // WORKER错误
	var PLAYM4_CREATE_RENDERER_ERROR = 61; // 创建渲染句柄失败
	var PLAYM4_LOAD_UNFINISHED = 62; // js文件未加载完成
	var PLAYM4_GET_VOLUME_ERROR = 63; // 获取音频音量失败

	// 加密类型
	var SECRET_NONE = 0; // 不加密
	var SECRET_AES = 1; // AES 加密

	// 视频编码类型
	var VIDEO_H264 = 0x1; // 标准H.264和海康H.264都可以用这个定义
	var VIDEO_AVC264 = 0x0100;

	// G711系列音频
	var AUDIO_G711_U = 0x7110; // G.711-U
	var AUDIO_G711_A = 0x7111; // G.711-A

	// 流模式
	var STREAM_REALTIME = 0; // 实时流
	var STREAM_FILE = 1; // 文件流

	// 截图类型
	var TYPE_BMP = 'BMP'; // bmp
	var TYPE_JPEG = 'JPEG'; // jpeg

	// 解码类型
	var DECODE_ALL = 0; // 全解
	var DECODE_VIDEO_KEYFRAME = 1; // 只解关键帧

	// 缓存帧数
	var BUFFER_MAXNUM_ONEBYONE = 15; // 帧进上限缓存数
	var BUFFER_MINNUM_ONEBYONE = 8; // 帧进下限缓存数
	var BUFFER_NUM_NORMAL = 1; // 正常缓存数
	var BUFFER_NUM_AUDIO = 25; // 音频存储25帧播放一次
	var BUFFER_MAXNUM_YUV = 20; // YUV最大缓存帧数
	var YUV_SKIP_NUM = 5; // YUV跳帧间隔

	// const BUFFER_NODE_NUM = 20;   // 输入缓存节点数
	// const BUFFER_MAX_SIZE = 800*1024;   // 最大缓存
	var BUFFER_MAX_SIZE = 5 * 1024 * 1024; // 最大缓存
	var BUFFER_INPUT_SIZE = 5000; // 一次送入数据大小
	// const BUFFER_FAST_INPUT_SIZE = 10000; // 快放一次送入数据大小
    // 音频格式
    var AUDIO_TYPE = {
    "AUDIO_G711_U": 0x7110, "AUDIO_G711_A": 0x7111, "AUDIO_G722_1": 0x7221, "AUDIO_G726_U": 0x7260, "AUDIO_G726_A": 0x7261,
    "AUDIO_G726_2": 0x7262, "AUDIO_AACLC": 0x2001, "AUDIO_NULL": 0x0000 };
	// 电子放大区域
	var HK_RECT = {
	    "left": 0,
	    "top": 0,
	    "right": 0,
	    "bottom": 0
	};

	// xx.js加载标识
	var bAudioRenderLoad = false;
	var bSuperRenderLoad = false;

	// 回调函数参数对象
	var CALLBACK_PARAMETER = {
	    "id": null,
	    "cmd": null,
	    "data": null,
	    "errorCode": 0,
	    "status": null
	};

	//定义类 JSPlayCtrl

	var JSPlayCtrl = exports.JSPlayCtrl = function () {
	    function JSPlayCtrl(path, callBack, winId) {
	        _classCallCheck(this, JSPlayCtrl);

	        // 路径
	        if (path != null && path !== undefined && typeof path === "string") {
	            this.szBasePath = path;
	        } else {
	            return PLAYM4_PARA_OVER;
	        }

	        // 加载回调
	        if (callBack && typeof callBack === "function") {
	            this.fnCallBack = callBack;
	        } else {
	            return PLAYM4_PARA_OVER;
	        }

	        // 解码 Worker
	        this.decodeWorker = null;

	        // 开启流类型
	        this.streamOpenMode = null;
	        this.bOpenStream = false;

	        // 音频渲染
	        this.audioRenderer = null;
	        this.aAudioBuffer = [];
	        this.iAudioBufferSize = 0;

	        // 视频渲染库
	        this.oSuperRender = null;
	        this.aVideoFrameBuffer = [];
	        this.YUVBufferSize = BUFFER_NUM_NORMAL;
	        this.szOSDTime = null;

	        // 播放音视频标识
	        this.bPlaySound = false;
	        this.bPlay = false;
	        this.bPause = false;
	        this.bOnebyOne = false;
            this.bPlayRateChange = false;
            this.bAudioTypeSupport = true;

	        // 回调函数
	        this.dataCallBackFun = null;

	        // 图像宽高
	        this.nWidth = 0;
	        this.nHeight = 0;

	        // 画布ID
	        this.sCanvasId = null;

	        // 显示图像数据缓存
	        this.aDisplayBuf = null;

	        // 页面是否激活
	        this.bVisibility = true;

	        // 解码类型
	        this.nDecFrameType = DECODE_ALL;

	        // 电子放大
	        this.iCanvasWidth = 0; // canvas宽
	        this.iCanvasHeight = 0; // canvas高
	        this.iZoomNum = 0; // 放大次数
	        this.iRatio_x = 1; // X方向比率
	        this.iRatio_y = 1; // Y方向比率
	        this.stDisplayRect = {
	            "top": 0,
	            "left": 0,
	            "right": 0,
	            "bottom": 0
	        }; // 上一次电子放大区域

	        this.stYUVRect = {
	            "top": 0,
	            "left": 0,
	            "right": 0,
	            "bottom": 0
	        }; // 映射到YUV上区域

	        this.aInputDataLens = []; // 送入缓存数据长度列表

	        /***********性能不足解决方案************/
	        this.aInputDataBuffer = []; // 送入数据的缓存
	        this.bIsGetYUV = false; // 获取YUV数据
	        this.bIsFirstFrame = true; // 第一帧数据
	        this.iInputMaxBufSize = BUFFER_MAX_SIZE; // 输入最大缓存大小
	        this.bIsInput = false; // 输入数据
	        this.bIsInputBufOver = false; // 输入缓存溢出
	        this.iInputDataLen = BUFFER_INPUT_SIZE; // 输入数据长度

	        var that = this; // 保存this, 在onmessage回调中使用

	        // 回调设置
	        this.setCallBack = function (that, cmd, data, errorCode, status) {
	            // 回调函数参数
	            var callBackParameter = CALLBACK_PARAMETER;

	            callBackParameter.id = winId;
	            callBackParameter.cmd = cmd;
	            callBackParameter.data = data;
	            callBackParameter.errorCode = errorCode;
	            callBackParameter.status = status;

	            that.fnCallBack(callBackParameter);
	        };

	        // 加载音频渲染js文件
	        if (!bAudioRenderLoad) {
	            bAudioRenderLoad = true;
	            var script_audio = document.createElement("script");
	            script_audio.type = "text/javascript";
	            script_audio.src = that.szBasePath + "AudioRenderer.js";
	            var head_audio = document.getElementsByTagName('head')[0];
	            head_audio.appendChild(script_audio);
	            script_audio.onload = script_audio.onreadystatechange = function () {
	                if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
	                    // console.log(">>> AudioRenderer.js load finish!");
	                }
	            };
	        }

	        // 加载视频渲染js文件
	        if (!bSuperRenderLoad) {
	            bSuperRenderLoad = true;
	            var script_vedio = document.createElement("script");
	            script_vedio.type = "text/javascript";
	            script_vedio.src = that.szBasePath + "SuperRender_10.js";
	            var head_vedio = document.getElementsByTagName('head')[0];
	            head_vedio.appendChild(script_vedio);
	            script_vedio.onload = script_vedio.onreadystatechange = function () {
	                if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
	                    //console.log(">>> SuperRender_10.js load finish!");
	                }
	            };

	            var script_vedio2 = document.createElement("script");
	            script_vedio2.type = "text/javascript";
	            script_vedio2.src = that.szBasePath + "SuperRender_20.js";
	            var head_vedio2 = document.getElementsByTagName('head')[0];
	            head_vedio2.appendChild(script_vedio2);
	            script_vedio2.onload = script_vedio2.onreadystatechange = function () {
	                if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
	                    //console.log(">>> SuperRender_20.js load finish!");
	                }
	            };
	        }

	        this.convertErrorCode = function (nErrorCode) {
	            switch (nErrorCode) {
	                case 1:
	                    return PLAYM4_NOERROR;

	                case 98:
	                    return PLAYM4_PARA_OVER;

	                default:
	                    return nErrorCode;
	            }
	        };
            // 判断码流音频格式是否支持
            this.checkAudioType = function (data)
            {
                // 4字节arrayBuffer数组中取整型数值
                var bytesToInt = function(src, offset)
                {
                    var value = ((src[offset] & 0xFF)
                        | ((src[offset+1] & 0xFF)<<8)
                        | ((src[offset+2] & 0xFF)<<16)
                        | ((src[offset+3] & 0xFF)<<24));
                    return value;
                };

                var typeArray = [data[12], data[13], 0, 0];
                var nType = bytesToInt(typeArray, 0);

                switch (nType)
                {
                    case AUDIO_TYPE.AUDIO_G711_A:
                    case AUDIO_TYPE.AUDIO_G711_U:
                    case AUDIO_TYPE.AUDIO_G722_1:
                    case AUDIO_TYPE.AUDIO_G726_2:
                    case AUDIO_TYPE.AUDIO_G726_A:
                    case AUDIO_TYPE.AUDIO_G726_U:
                    case AUDIO_TYPE.AUDIO_AACLC:
                        return PLAYM4_NOERROR;

                    default:
                        return PLAYM4_SYS_NOT_SUPPORT;
                }
            };
	        // ArrayBuffer复制
	        this.arrayBufferCopy = function (srcArrayBuf) {
	            var length = srcArrayBuf.byteLength;
	            var destBuf = new Uint8Array(length);
	            var srcBuf = new Uint8Array(srcArrayBuf);

	            var i = 0;
	            for (i = 0; i < length; i++) {
	                destBuf[i] = srcBuf[i];
	            }

	            return destBuf;
	        };

	        // 送入数据
	        this.inputDataFun = function () {
	            // var iInputLen = that.aInputDataBuffer.length;
	            var aReadBuf;
	            var iSize = 0;

	            that.bIsGetYUV = false;

	            // 如果解析解码缓存溢出，则停止送入数据，直到缓存空闲后继续送入
	            if (that.bIsInputBufOver) {
	                aReadBuf = new Uint8Array(1);
	            } else {

	                while (that.aInputDataLens.length > 0) {
	                    iSize += that.aInputDataLens.shift();
	                    if (iSize > that.iInputDataLen) {
	                        break;
	                    }
	                }

	                aReadBuf = that.aInputDataBuffer.splice(0, iSize);
	            }

	            var aSendBuf = new Uint8Array(aReadBuf);
	            var message = { 'command': "InputData", 'data': aSendBuf.buffer, 'dataSize': iSize };
	            if (that.bPlay) {
	                if (!that.bPause) {
	                    that.decodeWorker.postMessage(message, [message.data]);
	                } else {
	                    if (that.bOnebyOne) {
	                        that.decodeWorker.postMessage(message, [message.data]);
	                    }
	                }
	            }

	            aReadBuf = null;
	            aSendBuf = null;
	        };

	        this.getPic = function (callBack, command) {
	            if (this.decodeWorker == null || this.oSuperRender == null) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            if (!this.bPlay) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            if (callBack && typeof callBack === "function") {
	                this.dataCallBackFun = callBack;
	            } else {
	                return PLAYM4_PARA_OVER;
	            }

	            // 映射到原图位置信息
	            if (0 === this.iZoomNum) {
	                this.stYUVRect.left = 0;
	                this.stYUVRect.top = 0;
	                this.stYUVRect.right = 0;
	                this.stYUVRect.bottom = 0;
	            } else {
	                if (0 === this.iCanvasWidth || 0 === this.iCanvasHeight) {
	                    this.stYUVRect.left = 0;
	                    this.stYUVRect.top = 0;
	                    this.stYUVRect.right = 0;
	                    this.stYUVRect.bottom = 0;
	                } else {
	                    var ratio_x = this.nWidth / this.iCanvasWidth;
	                    var ratio_y = this.nHeight / this.iCanvasHeight;
	                    this.stYUVRect.left = Math.round(this.stDisplayRect.left * ratio_x);
	                    this.stYUVRect.top = Math.round(this.stDisplayRect.top * ratio_y);
	                    this.stYUVRect.right = Math.round(this.stDisplayRect.right * ratio_x);
	                    this.stYUVRect.bottom = Math.round(this.stDisplayRect.bottom * ratio_y);
	                }

	                // 宽高必须大于32
	                if (this.stYUVRect.right - this.stYUVRect.left < 32 || this.stYUVRect.bottom - this.stYUVRect.top < 32) {
	                    return PLAYM4_PARA_OVER;
	                }
	            }

	            // 数据转换
	            if (this.aDisplayBuf == null) {
	                return PLAYM4_ORDER_ERROR;
	            }
	            var buf = this.arrayBufferCopy(this.aDisplayBuf);

	            // 往 Worker 送数据
	            var message = { 'command': command, 'data': buf.buffer, 'width': this.nWidth, 'height': this.nHeight,
	                'rect': this.stYUVRect };
	            this.decodeWorker.postMessage(message, [message.data]);

	            return PLAYM4_NOERROR;
	        };

	        this.createWorker = function (self) {
	            // 加载Worker
	            if (window.Worker) {
	                // 判断浏览器是否支持 Worker
	                if (this.decodeWorker == null) {
	                    // 创建解码 Worker
	                    this.decodeWorker = new Worker(that.szBasePath + "DecodeWorker.js");

	                    if (this.decodeWorker == null) {
	                        return PLAYM4_WORKER_ERROR;
	                    }
	                }

	                // 接收 message
	                this.decodeWorker.onmessage = function (evt) {
	                    var typeName = null;
	                    var eventData = evt.data;
	                    switch (eventData.function) {
	                        case "loaded":
	                            typeName = "loaded";

	                            self.setCallBack(self, "loaded", 0, 0, true);
	                            break;

	                        case "SetStreamOpenMode":
	                            typeName = "SetStreamOpenMode";
	                            break;

	                        case "OpenStream":
	                            typeName = "OpenStream";
	                            break;

	                        case "InputData":
	                            typeName = "InputData";

	                            //　解析解码缓存溢出
	                            if (eventData.errorCode === PLAYM4_BUF_OVER) {
	                                that.bIsInputBufOver = true;
	                                that.inputDataFun();
	                                // console.log(">>>>>>>>>>>>>>> InputData PLAYM4_BUF_OVER");
	                            }

	                            // 解析解码缓存空闲
	                            if (eventData.errorCode === PLAYM4_NEED_MORE_DATA) {
	                                that.bIsInputBufOver = false;
	                                // that.inputDataFun();
	                                // console.log(">>>>>>>>>>>>>>> InputData PLAYM4_NEED_MORE_DATA");
	                            }
	                            break;

	                        case "GetFrameData":
	                            typeName = "GetFrameData";

	                            // that.bIsInputBufOver = !(eventData.errorCode === PLAYM4_NEED_MORE_DATA);

	                            if (!that.bIsFirstFrame && eventData.errorCode === PLAYM4_NEED_MORE_DATA) {
	                                // 数据不足时立刻送入数据
	                                that.bIsInputBufOver = false;
	                                // if (that.aInputDataLens.length > 0) {
	                                //     that.inputDataFun();
	                                // } else {
	                                //     that.bIsGetYUV = true;
	                                // }

	                                setTimeout(that.inputDataFun(), 5);
	                                // that.inputDataFun();
	                                break;
	                            } else if (that.bIsInputBufOver) {
	                                // 解析缓存溢出
	                                that.inputDataFun();
	                            } else {
	                                if (eventData.type === "videoType") {
	                                    if (that.aInputDataLens.length > 0 && that.bIsInput) {
	                                        that.inputDataFun();
	                                        that.bIsInput = false;
	                                    } else {
	                                        that.bIsGetYUV = true;
	                                    }

	                                    that.bIsFirstFrame = false;
	                                }
	                            }

	                            // web页面激活时才缓存音视频数据
	                            if (that.bVisibility) {
	                                switch (eventData.type) {
	                                    case "videoType":
	                                        if (eventData.data == null || eventData.frameInfo == null) {
	                                            return PLAYM4_PARA_OVER;
	                                        }

	                                        that.bIsFirstFrame = false;

	                                        // 获取图像宽高
	                                        self.nWidth = eventData.frameInfo.width;
	                                        self.nHeight = eventData.frameInfo.height;

	                                        // 缓存视频帧信息
	                                        var oVideoFrameInfo = new Object();
	                                        oVideoFrameInfo.data = eventData.data;
                                            oVideoFrameInfo.osdTime = eventData.osd;
                                            //console.log("11111"+eventData.osd);
	                                        self.aVideoFrameBuffer.push(oVideoFrameInfo);
	                                        oVideoFrameInfo = null;

	                                        // 如果YUV缓存大于阈值时进行抽帧显示，防止内存快速增长导致浏览器崩溃
	                                        var iYUVNum = self.aVideoFrameBuffer.length;
	                                        if (iYUVNum > BUFFER_MAXNUM_YUV) {
                                               // console.log(self.bOnebyOne);
	                                            if (!self.bOnebyOne) {
                                                   
	                                                // 非单帧模式下进行该处理
	                                                // YUV缓存超过BUFFER_MAXNUM_YUV个节点后隔YUV_SKIP_NUM个帧播一帧
	                                                self.aVideoFrameBuffer.splice(0, YUV_SKIP_NUM);
	                                            }
	                                        }

	                                        // 单帧
	                                        if (self.bOnebyOne) {
                                                // 缓存满，通知上层停止送流
                                               // console.log(self.aVideoFrameBuffer.length);
	                                            if (self.aVideoFrameBuffer.length >= BUFFER_MAXNUM_ONEBYONE) {
                                                 
	                                                self.setCallBack(self, "OnebyOne", 0, 0, false);

	                                                // 下次直接从缓存读取数据
	                                                self.bIsFirstFrame = true;
	                                                break;
	                                            }
	                                        }
	                                        break;

	                                    case "audioType":
	                                        if (self.bPlaySound && !self.bPlayRateChange) {
	                                            var bufferPackage = new Uint8Array(eventData.data);
	                                            var iIndexBuffer = self.aAudioBuffer.length;
	                                            for (var i = 0, iLen = bufferPackage.length; i < iLen; i++) {
	                                                self.aAudioBuffer[iIndexBuffer + i] = bufferPackage[i];
	                                            }
	                                            self.iAudioBufferSize++;
	                                            bufferPackage = null;

	                                            // 储存25帧播放一次
	                                            if (self.iAudioBufferSize >= BUFFER_NUM_AUDIO) {
	                                                // 播放
	                                                self.audioRenderer.Play(self.aAudioBuffer, self.aAudioBuffer.length, eventData.frameInfo);

	                                                self.aAudioBuffer.splice(0, self.aAudioBuffer.length);
	                                                self.aAudioBuffer.length = 0;
	                                                self.iAudioBufferSize = 0;
	                                            }
	                                        }
	                                        break;

	                                    case "privateType":
	                                        break;

	                                    default:
	                                        break;
	                                }
	                            }
	                            break;

	                        case "PlaySound":
	                            typeName = "PlaySound";
	                            break;

	                        case "GetJPEG":
	                            typeName = "GetJPEG";

	                            // 获取图像宽高
	                            var pJpegData = eventData.data;

	                            self.dataCallBackFun(pJpegData);
	                            break;

	                        case "GetBMP":
	                            typeName = "GetBMP";

	                            // 获取图像宽高
	                            var pBmpData = eventData.data;

	                            self.dataCallBackFun(pBmpData);
	                            break;

	                        default:
	                            break;
	                    }

	                    // 回调方式返回错误码
	                    if ("GetFrameData" !== typeName) {
	                        self.setCallBack(self, typeName, 0, self.convertErrorCode(eventData.errorCode), true);
	                    } else {
	                        if (PLAYM4_SYS_NOT_SUPPORT === eventData.errorCode) {
	                            self.setCallBack(self, typeName, 0, self.convertErrorCode(eventData.errorCode), true);
	                        }
	                    }
	                };
	            }
	        };

	        this.createWorker(that);

	        // 视频渲染
	        this.draw = function () {
	            if (that.bPlay) {
	                if (!that.bPause) {
	                    // that.bPause:true 暂停
	                    requestAnimationFrame(that.draw);
	                }

	                var iYUVNum = that.aVideoFrameBuffer.length;

	                if (that.bOnebyOne) {
	                    // that.bOnebyOne:true 单帧
	                    // 缓存不够，通知上层开始送流
	                    if (iYUVNum <= BUFFER_MINNUM_ONEBYONE) {
	                        that.setCallBack(that, "OnebyOne", 0, PLAYM4_NEED_MORE_DATA, true);
	                    }
	                }

	                // console.log("————————————————————— aVideoFrameBuffer.length == " + iYUVNum);

	                if (iYUVNum > that.YUVBufferSize) {

	                    var oVideoFrameInfo = that.aVideoFrameBuffer.shift();
	                    that.aDisplayBuf = oVideoFrameInfo.data;

	                    var displayBuf = new Uint8Array(that.aDisplayBuf);

	                    // console.time("%%%%%%%%%%%%%%%%%%%%%% SR_DisplayFrameData time");

	                    that.oSuperRender.SR_DisplayFrameData(that.nWidth, that.nHeight, displayBuf);
	                    displayBuf = null;

	                    // console.timeEnd("%%%%%%%%%%%%%%%%%%%%%% SR_DisplayFrameData time");

	                    // 当前OSD时间
                        that.szOSDTime = oVideoFrameInfo.osdTime;
                        //console.log(oVideoFrameInfo.osdTime);
	                    oVideoFrameInfo = null;
	                }
	            } else {
	                if (!that.bPlay) {
	                    // 停止播放清空视频帧和音频帧数据缓存
	                    that.aVideoFrameBuffer.splice(0, that.aVideoFrameBuffer.length);
	                    that.aAudioBuffer.splice(0, that.aAudioBuffer.length);
	                }
	            }
	        };
	    }

	    /**
	     * @synopsis 设置开启流播放模式
	     *
	     * @param nMode [IN] 打开方式
	     *
	     * @returns 状态码
	     */


	    _createClass(JSPlayCtrl, [{
	        key: 'PlayM4_SetStreamOpenMode',
	        value: function PlayM4_SetStreamOpenMode(nMode) {
	            if (nMode == null || nMode === undefined) {
	                return PLAYM4_PARA_OVER;
	            }

	            if (nMode !== STREAM_REALTIME && nMode !== STREAM_FILE) {
	                return PLAYM4_PARA_OVER;
	            }

	            this.streamOpenMode = nMode;

	            return PLAYM4_NOERROR;
	        }

	        /**
	         * @synopsis 实时流、回放流时字节头开流
	         *
	         * @param pFileHeadBuf 文件头缓存数据
	         * @param nSize 文件头缓存大小
	         * @param nBufPoolSize 流缓存大小
	         *
	         * @returns 状态码
	         */

	    }, {
	        key: 'PlayM4_OpenStream',
	        value: function PlayM4_OpenStream(pFileHeadBuf, nSize, nBufPoolSize) {
	            if (this.decodeWorker == null) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            if (pFileHeadBuf == null || nSize <= 0 || nBufPoolSize <= 0) {
	                return PLAYM4_PARA_OVER;
	            }
                var nRet = this.checkAudioType(pFileHeadBuf);
                if (PLAYM4_NOERROR !== nRet)
                {
                    this.bAudioTypeSupport = false;
                }
                else
                {
                    this.bAudioTypeSupport = true;
                }
	            // 单帧后恢复回放，清除状态值
	            this.bPlay = false;
	            this.bPause = false;
	            this.bOnebyOne = false;
	            this.bIsFirstFrame = true;
	            this.bIsGetYUV = false;
	            this.bIsInput = false;

	            // 往 Worker 送数据
	            this.decodeWorker.postMessage({ 'command': "SetStreamOpenMode", 'data': this.streamOpenMode });

	            // 往 Worker 送数据
	            this.decodeWorker.postMessage({
	                'command': "OpenStream",
	                'data': pFileHeadBuf,
	                'dataSize': nSize,
	                'bufPoolSize': nBufPoolSize
	            });

	            this.bOpenStream = true;
	            return PLAYM4_NOERROR;
	        }

	        /**
	         * @synopsis 关闭流
	         *
	         * @returns 状态码
	         */

	    }, {
	        key: 'PlayM4_CloseStream',
	        value: function PlayM4_CloseStream() {
	            if (this.decodeWorker === null || this.bOpenStream === false) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            this.PlayM4_Stop();

	            // 往 Worker 送数据
	            this.decodeWorker.postMessage({ 'command': "CloseStream" });

	            if (this.oSuperRender !== null) {
	                // 释放渲染资源
	                this.oSuperRender.SR_Destroy();
	                this.oSuperRender = null;
	            }

	            if (this.audioRenderer !== null) {
	                // 释放渲染资源
	                this.audioRenderer.Stop();
	                this.audioRenderer = null;
	            }

	            // 清空缓存
	            this.aAudioBuffer.splice(0, this.aAudioBuffer.length);
	            this.aVideoFrameBuffer.splice(0, this.aVideoFrameBuffer.length);
	            this.aInputDataBuffer.splice(0, this.aInputDataBuffer.length);
	            this.aInputDataLens.splice(0, this.aInputDataLens.length);

	            this.bOpenStream = false;
	            this.iAudioBufferSize = 0;

	            return PLAYM4_NOERROR;
	        }

	        /**
	         * @synopsis 销毁，关闭worker
	         *
	         * @returns 状态码
	         */

	    }, {
	        key: 'PlayM4_Destroy',
	        value: function PlayM4_Destroy() {
	            if (this.decodeWorker === null) {
	                return PLAYM4_NOERROR;
	            }

	            this.PlayM4_CloseStream();

	            this.decodeWorker.terminate(); // 停止 Worker 工作
	            this.decodeWorker = null;

	            return PLAYM4_NOERROR;
	        }

	        /**
	         * @synopsis 实时流、回放流送数据
	         *
	         * @param dataBuf  [IN] 输入数据缓存
	         * @param nSize [IN] 输入数据大小
	         *
	         * @returns 状态码
	         */

	    }, {
	        key: 'PlayM4_InputData',
	        value: function PlayM4_InputData(dataBuf, nSize) {
	            if (this.decodeWorker === null || this.bOpenStream === false) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            var iInputBufLen = this.aInputDataBuffer.length;

	            // 结束送流标识位[0x01, 0x02, 0x03, 0x04]
	            if (nSize === 4) {
	                var aBuf = new Uint8Array(dataBuf.buffer);
	                if (aBuf[0] === 0x01 && aBuf[1] === 0x02 && aBuf[2] === 0x03 && aBuf[3] === 0x04) {
	                    if (this.bIsFirstFrame) {
	                        // 直接往 Worker 送数据
	                        this.inputDataFun();
	                    } else {
	                        if (this.bIsGetYUV) {
	                            this.inputDataFun();
	                        } else {
	                            this.bIsInput = true;
	                        }
	                    }

	                    aBuf = null;
	                    return PLAYM4_NOERROR;
	                }
	            }

	            // 超出设置的缓存阈值，返回错误码（缓存溢出）
	            if (iInputBufLen > this.iInputMaxBufSize) {
	                return PLAYM4_BUF_OVER;
	            }

	            // 写入缓存，添加4字节头
	            var tempBuf = null;
	            var iDataLen = nSize;
	            switch (this.streamOpenMode) {
	                case STREAM_FILE:
	                    tempBuf = new Uint8Array(dataBuf.buffer);

	                    this.aInputDataLens.push(nSize);
	                    break;

	                case STREAM_REALTIME:
	                    // 加4字节长度信息
	                    iDataLen = nSize + 4;
	                    var a32 = new Uint32Array([nSize]);
	                    var a8 = new Uint8Array(a32.buffer);
	                    tempBuf = new Uint8Array(iDataLen);
	                    tempBuf.set(a8, 0);
	                    tempBuf.set(dataBuf, 4);
	                    a32 = null;
	                    a8 = null;

	                    this.aInputDataLens.push(nSize + 4);
	                    break;

	                default:
	                    return PLAYM4_SYS_NOT_SUPPORT;
	            }

	            for (var i = 0; i < iDataLen; i++) {
	                this.aInputDataBuffer[iInputBufLen + i] = tempBuf[i];
	            }
	            tempBuf = null;

	            if (this.bIsFirstFrame) {
	                // 首帧直接往 Worker 送数据
	                this.inputDataFun();
	            } else {
	                if (this.bIsGetYUV) {
	                    this.inputDataFun();
	                } else {
	                    this.bIsInput = true;
	                }
	            }

	            return PLAYM4_NOERROR;
	        }

	        /**
	         * @synopsis 开启播放
	         *
	         * @param canvasID  [IN] 窗口id
	         *
	         * @returns 状态码
	         */

	    }, {
	        key: 'PlayM4_Play',
	        value: function PlayM4_Play(canvasID) {
	            if (this.decodeWorker === null || this.bOpenStream === false) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            if (canvasID !== null) {
	                if (typeof canvasID !== "string") {
	                    return PLAYM4_PARA_OVER;
	                }
	            }

	            if (this.bOnebyOne) {
	                this.bPlayRateChange = false;
	                this.bOnebyOne = false;
	                this.bPause = false;
	                this.draw();
	            }

	            if (this.bPlay) {
	                return PLAYM4_NOERROR;
	            }

	            // 创建视频渲染句柄
	            if (this.oSuperRender == null) {

	                var canvas = document.getElementById(canvasID);
	                var gl = canvas.getContext("webgl2");
	                //如果浏览器不支持WebGL2.0,则使用WebGL1.0
	                if (!gl) {
	                    this.oSuperRender = new SuperRender(canvasID, this.szBasePath);
	                } else {
	                    this.oSuperRender = new SuperRender2(canvasID, this.szBasePath);
	                }

	                if (this.oSuperRender == null) {
	                    return PLAYM4_CREATE_RENDERER_ERROR;
	                }
	            }

	            // 创建音频渲染句柄
	            if (this.audioRenderer == null) {
	                this.audioRenderer = new AudioRenderer();
	                if (this.audioRenderer == null) {
	                    return PLAYM4_CREATE_RENDERER_ERROR;
	                }
	            }

	            this.sCanvasId = canvasID;

	            // 初始化
	            this.bPlay = true;
	            this.bPause = false;
	            this.bOnebyOne = false;

	            this.bPlaySound = false; // 关闭声音
	            this.bPlayRateChange = false;

	            this.draw();

	            return PLAYM4_NOERROR;
	        }

	        /**
	         * @synopsis 停止播放
	         *
	         * @returns 状态码
	         */

	    }, {
	        key: 'PlayM4_Stop',
	        value: function PlayM4_Stop() {
	            if (this.decodeWorker == null || this.oSuperRender == null) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            if (!this.bPlay) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            // 关闭声音
	            if (this.bPlaySound) {
	                this.PlayM4_StopSound();
	                this.bPlaySound = true;
	            }

	            this.bPlay = false;
	            this.bOnebyOne = false;
	            this.bPause = false;

	            // 关闭电子放大
	            this.oSuperRender.SR_SetDisplayRect(null);
	            this.iZoomNum = 0;

	            // 画布置黑
	            this.oSuperRender.SR_DisplayFrameData(this.nWidth, this.nHeight, null);

	            return PLAYM4_NOERROR;
	        }

	        /**
	         * @synopsis 播放速率
	         *
	         * @param nPlayRate [IN] 倍率
	         *
	         * @returns 状态码
	         */

	    }, {
	        key: 'PlayM4_PlayRate',
	        value: function PlayM4_PlayRate(nPlayRate) {
	            if (this.decodeWorker == null) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            if (nPlayRate === 1) {
	                this.bPlayRateChange = false;
	            } else {
	                this.bPlayRateChange = true;
	            }

	            if (nPlayRate < 1) {
	                nPlayRate = 1;
	            }
	            this.iInputDataLen = nPlayRate * BUFFER_INPUT_SIZE;

	            return PLAYM4_NOERROR;
	        }

	        /**
	         * @synopsis 暂停播放
	         *
	         * @param pause [IN] 暂停/恢复标识
	         *
	         * @returns 状态码
	         */

	    }, {
	        key: 'PlayM4_Pause',
	        value: function PlayM4_Pause(pause) {
	            if (this.decodeWorker == null || this.oSuperRender == null) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            if (!this.bPlay) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            if (this.bOnebyOne) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            if (typeof pause !== "boolean") {
	                return PLAYM4_PARA_OVER;
	            }

	            this.bPause = pause;
	            // this.bOnebyOne = false;

	            // 下次直接从缓存读取数据
	            this.bIsFirstFrame = true;

	            // if (!this.bPlayRateChange) {
	            if (pause) {
	                if (this.bPlaySound) {
	                    this.PlayM4_StopSound();
	                    this.bPlaySound = true;
	                }
	            } else {
	                if (this.bPlaySound) {
	                    this.PlayM4_PlaySound();
	                }
	                this.draw();
	            }
	            // }

	            return PLAYM4_NOERROR;
	        }

	        /**
	         * @synopsis 帧进
	         *
	         * @returns 状态码
	         */

	    }, {
	        key: 'PlayM4_OneByOne',
	        value: function PlayM4_OneByOne() {
	            if (this.decodeWorker == null || this.oSuperRender == null) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            if (!this.bPlay) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            this.iInputDataLen = BUFFER_INPUT_SIZE;

	            this.bPause = true;
	            this.bOnebyOne = true;
	            // this.bPlaySound = false;  // 单帧模式下关闭声音
	            this.bPlayRateChange = true;

	            this.draw();

	            return PLAYM4_NOERROR;
	        }

	        /**
	         * @synopsis 开启声音
	         *
	         *  @param iWndNum [IN] 窗口号
	         *
	         * @returns 状态码
	         */

	    }, {
	        key: 'PlayM4_PlaySound',
	        value: function PlayM4_PlaySound(iWndNum) {
	            if (this.decodeWorker === null || this.bOpenStream === false) {
	                return PLAYM4_ORDER_ERROR;
	            }
                // 判断音频格式是否支持，如果不支持返回状态码
                if (!this.bAudioTypeSupport)
                {
                    return PLAYM4_SYS_NOT_SUPPORT;
                }
	            // 最大支持16路
	            if (iWndNum < 0 || iWndNum > 16) {
	                return PLAYM4_PARA_OVER;
	            }

	            // 创建音频渲染句柄
	            if (this.audioRenderer == null) {
	                this.audioRenderer = new AudioRenderer();
	                if (this.audioRenderer == null) {
	                    return PLAYM4_CREATE_RENDERER_ERROR;
	                }
	            }

	            // 设置当前窗口号
	            this.audioRenderer.SetWndNum(iWndNum);

	            this.bPlaySound = true;

	            return PLAYM4_NOERROR;
	        }

	        /**
	         * @synopsis 关闭声音
	         *
	         * @returns
	         */

	    }, {
	        key: 'PlayM4_StopSound',
	        value: function PlayM4_StopSound() {
	            if (this.decodeWorker == null || this.audioRenderer == null) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            if (!this.bPlaySound) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            this.bPlaySound = false;

	            return PLAYM4_NOERROR;
	        }

	        /**
	         * @synopsis 设置解码后缓存
	         *
	         * @param nNum [IN] 显示缓存节点数
	         *
	         * @returns 状态码
	         */

	    }, {
	        key: 'PlayM4_SetDisplayBuf',
	        value: function PlayM4_SetDisplayBuf(nNum) {
	            if (this.decodeWorker == null) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            if (nNum <= 0) {
	                return PLAYM4_PARA_OVER;
	            }

	            this.YUVBufferSize = nNum;
	            return PLAYM4_NOERROR;
	        }

	        /**
	         * @synopsis 设置解密秘钥
	         *
	         * @param nKeyType [IN] 密钥类型
	         * @param pSecretKey [IN] 密钥缓存
	         * @param nKeyLen [IN] 密钥缓存大小
	         *
	         * @returns 状态码
	         */

	    }, {
	        key: 'PlayM4_SetSecretKey',
	        value: function PlayM4_SetSecretKey(nKeyType, pSecretKey, nKeyLen) {
	            if (this.decodeWorker == null || this.bOpenStream === false) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            if (pSecretKey == null) {
	                return PLAYM4_PARA_OVER;
	            }

	            if (SECRET_AES === nKeyType) {
	                if (128 === nKeyLen) {
	                    if (pSecretKey == null || pSecretKey === undefined) {
	                        return PLAYM4_PARA_OVER;
	                    }
	                } else {
	                    return PLAYM4_PARA_OVER;
	                }
	            } else if (SECRET_NONE === nKeyType) {} else {
	                return PLAYM4_PARA_OVER;
	            }

	            // 往 Worker 送数据
	            this.decodeWorker.postMessage({
	                'command': "SetSecretKey",
	                'data': pSecretKey,
	                'nKeyType': nKeyType,
	                'nKeyLen': nKeyLen
	            });

	            return PLAYM4_NOERROR;
	        }

	        /**
	         * @synopsis 设置要解码的帧类型.默认正常解码，当前只支持全解和只解码I帧
	         *
	         * @param nFrameType [IN] 帧类型
	         *
	         * @returns 状态码
	         */

	    }, {
	        key: 'PlayM4_SetDecodeFrameType',
	        value: function PlayM4_SetDecodeFrameType(nFrameType) {
	            if (this.decodeWorker == null || this.oSuperRender == null) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            if (nFrameType !== DECODE_ALL && nFrameType !== DECODE_VIDEO_KEYFRAME) {
	                return PLAYM4_PARA_OVER;
	            }

	            this.nDecFrameType = nFrameType;

	            // 往 Worker 送数据
	            this.decodeWorker.postMessage({ 'command': "SetDecodeFrameType", 'data': nFrameType });

	            return PLAYM4_NOERROR;
	        }

	        /**
	         * @synopsis 设置跳I帧间隔(调用前需要设置 setDecodeFrameType(1)只解关键帧，否则返回错误码 2)
	         *
	         * @param nInterval [IN] 跳I帧间隔
	         *
	         * @returns 状态码
	         */

	    }, {
	        key: 'PlayM4_SetIFrameDecInterval',
	        value: function PlayM4_SetIFrameDecInterval(nInterval) {
	            if (this.nDecFrameType !== DECODE_VIDEO_KEYFRAME) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            if (nInterval < 0) {
	                return PLAYM4_PARA_OVER;
	            }

	            // 往 Worker 送数据
	            this.decodeWorker.postMessage({ 'command': "SetIFrameDecInterval", 'data': nInterval });

	            return PLAYM4_NOERROR;
	        }

	        /**
	         * @synopsis 电子放大
	         *
	         * @param diplayRect [IN] 显示区域
	         * @param bEnable [IN] 是否显示
	         *
	         * @returns 状态码
	         */

	    }, {
	        key: 'PlayM4_SetDisplayRegion',
	        value: function PlayM4_SetDisplayRegion(diplayRect, bEnable) {
	            if (this.decodeWorker === null || this.bPlay === false || this.oSuperRender === null) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            if (this.canvasId === null) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            if (bEnable === true) {
	                if (diplayRect === null || diplayRect === undefined) {
	                    return PLAYM4_PARA_OVER;
	                }

	                // 判断放大区域参数
	                if (typeof diplayRect.left === "number" && typeof diplayRect.top === "number" && typeof diplayRect.right === "number" && typeof diplayRect.bottom === "number") {

	                    if (diplayRect.right < 0 || diplayRect.left < 0 || diplayRect.top < 0 || diplayRect.bottom < 0) {
	                        return PLAYM4_PARA_OVER;
	                    }

	                    var iLeft = diplayRect.left;
	                    var iRight = diplayRect.right;
	                    var iTop = diplayRect.top;
	                    var iBottom = diplayRect.bottom;

	                    /*区域宽高必须不小于16且不大于图像宽高*/
	                    if (iRight - iLeft < 16 || iBottom - iTop < 16 || iRight - iLeft > this.nWidth || iBottom - iTop > this.nHeight) {
	                        return PLAYM4_PARA_OVER;
	                    }

	                    // 获取画布大小
	                    var oRect = document.getElementById(this.sCanvasId).getBoundingClientRect();
	                    this.iCanvasWidth = oRect.width;
	                    this.iCanvasHeight = oRect.height;

	                    if (this.iZoomNum !== 0) {
	                        iLeft = Math.round(iLeft / this.iRatio_x) + this.stDisplayRect.left;
	                        iTop = Math.round(iTop / this.iRatio_y) + this.stDisplayRect.top;
	                        iRight = Math.round(iRight / this.iRatio_x) + this.stDisplayRect.left;
	                        iBottom = Math.round(iBottom / this.iRatio_y) + this.stDisplayRect.top;
	                    }

	                    // 电子放大
	                    this.stDisplayRect = {
	                        "top": iTop,
	                        "left": iLeft,
	                        "right": iRight,
	                        "bottom": iBottom
	                    };

	                    // 开启电子放大
	                    this.oSuperRender.SR_SetDisplayRect(this.stDisplayRect);

	                    // 电子放大选择区域大小
	                    var nCropWidth = iRight - iLeft;
	                    var nCropHeight = iBottom - iTop;

	                    // 计算放大比率
	                    this.iRatio_x = this.iCanvasWidth / nCropWidth;
	                    this.iRatio_y = this.iCanvasHeight / nCropHeight;

	                    this.iZoomNum++;
	                } else {
	                    return PLAYM4_PARA_OVER;
	                }
	            } else {
	                // 关闭电子放大
	                this.oSuperRender.SR_SetDisplayRect(null);
	                this.iZoomNum = 0;
	            }

	            // 如果暂停、单帧、快慢放情况，电子放大后需要刷新一帧
	            if (this.bPause || this.bOnebyOne || this.bPlayRateChange) {
	                this.oSuperRender.SR_DisplayFrameData(this.nWidth, this.nHeight, new Uint8Array(this.aDisplayBuf));
	            }

	            return PLAYM4_NOERROR;
	        }

	        /**
	         * @synopsis 抓取BMP图
	         *
	         * @param callBack [IN] 数据回调函数
	         *
	         * @returns 状态码
	         */

	    }, {
	        key: 'PlayM4_GetBMP',
	        value: function PlayM4_GetBMP(callBack) {
	            return this.getPic(callBack, "GetBMP");
	        }

	        /**
	         * @synopsis 抓取JPEG图
	         *
	         * @param callBack [IN] 数据回调函数
	         *
	         * @returns 状态码
	         */

	    }, {
	        key: 'PlayM4_GetJPEG',
	        value: function PlayM4_GetJPEG(callBack) {
	            return this.getPic(callBack, "GetJPEG");
	        }

	        /**
	         * @synopsis 设置音量
	         *
	         * @param volume [IN] 音量
	         *
	         * @returns 状态码
	         */

	    }, {
	        key: 'PlayM4_SetVolume',
	        value: function PlayM4_SetVolume(volume) {
	            if (this.decodeWorker == null) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            if (this.audioRenderer == null) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            if (volume < 0 || volume > 100) {
	                return PLAYM4_PARA_OVER;
	            }

	            this.audioRenderer.SetVolume(volume / 100);

	            return PLAYM4_NOERROR;
	        }

	        /**
	         * @synopsis 获取音量
	         *
	         * @param callBack [IN] 音量回调函数
	         *
	         * @returns 状态码
	         */

	    }, {
	        key: 'PlayM4_GetVolume',
	        value: function PlayM4_GetVolume(callBack) {
	            if (this.decodeWorker == null) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            if (this.audioRenderer == null) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            if (callBack && typeof callBack === "function") {
	                var volume = this.audioRenderer.GetVolume();
	                if (volume === null) {
	                    return PLAYM4_GET_VOLUME_ERROR;
	                } else {
	                    callBack(Math.round(volume * 10) * 10);

	                    return PLAYM4_NOERROR;
	                }
	            } else {
	                return PLAYM4_PARA_OVER;
	            }
	        }

	        /**
	         * @synopsis 获取OSD时间信息
	         *
	         * @param callBack [IN] 获取OSD时间信息回调函数
	         *
	         * @returns 状态码
	         */

	    }, {
	        key: 'PlayM4_GetOSDTime',
	        value: function PlayM4_GetOSDTime(callBack) {
	            if (this.decodeWorker == null) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            if (!this.bPlay) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            if (callBack && typeof callBack === "function") {
	                callBack(this.szOSDTime);

	                return PLAYM4_NOERROR;
	            } else {
	                return PLAYM4_PARA_OVER;
	            }
	        }

	        /**
	         * @synopsis 当前页面状态
	         *
	         * @param visibility [IN] 页面状态
	         *
	         * @returns 状态码
	         */

	    }, {
	        key: 'PlayM4_IsVisible',
	        value: function PlayM4_IsVisible(visibility) {
	            this.bVisibility = visibility;

	            return PLAYM4_NOERROR;
	        }

	        /**
	         * @synopsis 获取SDK版本信息
	         *
	         * @returns 状态码
	         */

	    }, {
	        key: 'PlayM4_GetSdkVersion',
	        value: function PlayM4_GetSdkVersion() {
	            return "07020115"; // 稳定性测试优化:V7.2.1.15
	        }

	        /**
	         * @synopsis 获取输入缓存大小
	         *
	         * @returns 返回输入缓存大小
	         */

	    }, {
	        key: 'PlayM4_GetInputBufSize',
	        value: function PlayM4_GetInputBufSize() {
	            return this.aInputDataBuffer.length;
	        }

	        /**
	         * @synopsis 设置输入缓存大小
	         *
	         * @returns 设置输入缓存大小
	         */

	    }, {
	        key: 'PlayM4_SetInputBufSize',
	        value: function PlayM4_SetInputBufSize(iInputBufSize) {
	            if (iInputBufSize > 0) {
	                this.iInputMaxBufSize = iInputBufSize;
	                return PLAYM4_NOERROR;
	            } else {
	                return PLAYM4_PARA_OVER;
	            }
	        }

	        /**
	         * @synopsis 获取YUV缓存大小
	         *
	         * @returns 返回YUV缓存大小
	         */

	    }, {
	        key: 'PlayM4_GetYUVBufSize',
	        value: function PlayM4_GetYUVBufSize() {
	            return this.aVideoFrameBuffer.length;
	        }

	        /**
	            * @synopsis 画布置透明
	            *
	            * @returns 状态码
	            */

	    }, {
	        key: 'PlayM4_ClearCanvas',
	        value: function PlayM4_ClearCanvas() {
	            if (this.oSuperRender == null) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            // 画布置黑
	            this.oSuperRender.SR_DisplayFrameData(this.nWidth, this.nHeight, null);

	            return PLAYM4_NOERROR;
	        }

	        /**
	         * @synopsis 释放输入码流缓存
	         *
	         * @returns 状态码
	         */

	    }, {
	        key: 'PlayM4_ReleaseInputBuffer',
	        value: function PlayM4_ReleaseInputBuffer() {
	            if (this.aInputDataBuffer === null) {
	                return PLAYM4_ORDER_ERROR;
	            }

	            // 释放缓存
	            this.aInputDataBuffer.splice(0, this.aInputDataBuffer.length);
	            this.aInputDataLens.splice(0, this.aInputDataLens.length);

	            return PLAYM4_NOERROR;
	        }

	        /**
	         * @synopsis 获取解码帧类型
	         *
	         * @returns 返回解码帧类型
	         */

	    }, {
	        key: 'PlayM4_GetDecodeFrameType',
	        value: function PlayM4_GetDecodeFrameType() {
	            return this.nDecFrameType;
	        }
	    }]);

	    return JSPlayCtrl;
	}();

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.StorageManager = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _uuid = __webpack_require__(3);

	var _uuid2 = _interopRequireDefault(_uuid);

	var _tool = __webpack_require__(1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	// 常量定义
	//const STORAGE_OK = 0;
	//const STORAGE_FAILED = -1;
	var STORAGE_RECORD_PATH = "Web/RecordFiles/";
	var STORAGE_CLIPS_PATH = "Web/PlaybackFiles/";
	var STORAGE_TIMEOUT = 1000;

	var TRANS_SYSHEAD = 1; //系统头数据
	//const TRANS_STREAMDATA = 2;         //视频流数据（包括复合流和音视频分开的视频流数据）
	//const TRANS_AUDIOSTREAMDATA = 3;    //音频流数据
	//const TRANS_PRIVTSTREAMDATA = 4;    //私有数据类型
	//const TRANS_DECODEPARAM = 5;        //解码参数类型

	var ERROR_MAX_FILE_SIZE = 3001; //文件大小超限

	// 兼容处理
	window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
	window.URL = window.URL || window.webkitURL;

	/**
	 * @synopsis 文件系统类
	 *
	 * @note [ADD][2017-01-03]新建 by xufengyf3
	 *
	 */

	var FileSystem = function () {
	    /**
	     * @synopsis 构造函数
	     *
	     * @param {string} szUUID 存储对象uuid
	     * @param {string} szFileName 文件名
	     * @param {number} iStreamType 码流类型
	     * @param {object} options 可选参数
	     *
	     * @returns {none} 无
	     */
	    function FileSystem(szUUID, szFileName, iStreamType, options) {
	        _classCallCheck(this, FileSystem);

	        this.szUUID = szUUID;
	        this.szFileName = szFileName;
	        this.iStreamType = iStreamType;
	        this.szPath = "";
	        this.bStart = false;
	        this.aStreamList = [];
	        this.options = options;
	    }

	    /**
	     * @synopsis 初始化
	     *
	     * @returns {object} 返回Promise对象
	     *
	     */


	    _createClass(FileSystem, [{
	        key: "init",
	        value: function init() {
	            var that = this;

	            if (0 === this.iStreamType) {
	                // 录像
	                this.szPath = STORAGE_RECORD_PATH;
	            } else if (1 === this.iStreamType) {
	                // 剪辑
	                this.szPath = STORAGE_CLIPS_PATH;
	            }
	            this.szPath += this.getDateDir();
	            var aPath = that.szPath.split("/");

	            var oPromise = new Promise(function (resolve /*, reject*/) {
	                // 创建目录
	                window.requestFileSystem(window.TEMPORARY, that.options.iFileSize, function (fs) {
	                    that.createDir(fs.root, aPath, function () {
	                        resolve();
	                    });
	                }, that.errorHandler);
	            });

	            return oPromise;
	        }

	        /**
	         * @synopsis 获取日期
	         *
	         * @returns {string} 返回当前日期
	         */

	    }, {
	        key: "getDateDir",
	        value: function getDateDir() {
	            return _tool.oTool.dateFormat(new Date(), "yyyy-MM-dd");
	        }

	        /**
	         * @synopsis 递归创建目录
	         *
	         * @param {string} rootDirEntry 根目录
	         * @param {string} floders 子目录
	         * @param {function} cbFunc 创建后回调函数
	         *
	         * @returns {none} 无
	         */

	    }, {
	        key: "createDir",
	        value: function createDir(rootDirEntry, floders, cbFunc) {
	            var that = this;

	            if (floders.length) {
	                rootDirEntry.getDirectory(floders[0], { create: true }, function (dirEntry) {
	                    that.createDir(dirEntry, floders.slice(1), cbFunc);
	                }, that.errorHandler);
	            } else {
	                // 创建完毕
	                cbFunc();
	            }
	        }

	        /**
	         * @synopsis 错误处理
	         *
	         * @returns {none} 无
	         */

	    }, {
	        key: "errorHandler",
	        value: function errorHandler() /*e*/{}
	        //to do
	        //console.log('Error: ' + e.toString());


	        /**
	         * @synopsis 写入文件头
	         *
	         * @param {Array} aData 文件头
	         *
	         * @returns {none} 无
	         */

	    }, {
	        key: "writeFileHeader",
	        value: function writeFileHeader(aData) {
	            var that = this;

	            window.requestFileSystem(window.TEMPORARY, that.options.iFileSize, function (fs) {
	                fs.root.getFile(that.szPath + "/" + that.szFileName, { create: true }, function (fileEntry) {
	                    fileEntry.createWriter(function (fileWriter) {
	                        fileWriter.onwriteend = function () {
	                            //console.log('write completed.');
	                            that.bStart = true;
	                            that.writeFile(fileWriter);
	                        };

	                        fileWriter.onerror = function () {
	                            //to do
	                            //console.log('write failed: ' + e.toString());
	                        };

	                        //console.log("write: " + data.byteLength);
	                        //console.log(new Uint8Array(data));
	                        //console.log(fileWriter.length);

	                        fileWriter.seek(fileWriter.length);
	                        var oBlob = new Blob([aData]);
	                        fileWriter.write(oBlob);
	                    }, that.errorHandler);
	                }, that.errorHandler);
	            }, that.errorHandler);
	        }

	        /**
	         * @synopsis 写入文件队列
	         *
	         * @param {Array} aData 文件内容
	         *
	         * @returns {none} 无
	         */

	    }, {
	        key: "writeFileContent",
	        value: function writeFileContent(aData) {
	            this.aStreamList.push(aData);
	        }

	        /**
	         * @synopsis 写文件
	         *
	         * @param {object} fileWriter 文件对象
	         *
	         * @returns {none} 无
	         */

	    }, {
	        key: "writeFile",
	        value: function writeFile(fileWriter) {
	            var that = this;

	            if (this.bStart) {
	                if (this.aStreamList.length > 0) {
	                    var aData = this.aStreamList.shift();

	                    fileWriter.seek(fileWriter.length);

	                    // 判断文件大小
	                    if (fileWriter.length >= this.options.iFileSize) {
	                        if (this.options.cbEventHandler) {
	                            this.options.cbEventHandler(ERROR_MAX_FILE_SIZE, this.szUUID);
	                        }
	                        return;
	                    }

	                    var oBlob = new Blob([aData]);
	                    fileWriter.write(oBlob);
	                } else {
	                    // 写的速度比数据来的快，延时递归
	                    setTimeout(function () {
	                        that.writeFile(fileWriter);
	                    }, STORAGE_TIMEOUT);
	                }
	            }
	        }

	        /**
	         * @synopsis 停止写文件 & 下载文件
	         *
	         *
	         * @returns {object} 返回Promise对象
	         */

	    }, {
	        key: "stopWriteFile",
	        value: function stopWriteFile() {
	            var that = this;

	            //console.log("stopWriteFile");

	            this.bStart = false;
	            this.aStreamList.length = 0;

	            var oPromise = new Promise(function (resolve /*, reject*/) {
	                window.requestFileSystem(window.TEMPORARY, that.options.iFileSize, function (fs) {
	                    fs.root.getFile(that.szPath + "/" + that.szFileName, { create: false }, function (fileEntry) {
	                        fileEntry.file(function (file) {
	                            resolve();

	                            _tool.oTool.downloadFile(file, file.name);
	                        });
	                    }, that.errorHandler);
	                }, that.errorHandler);
	            });

	            return oPromise;
	        }
	    }]);

	    return FileSystem;
	}();

	/**
	 * @synopsis 存储类
	 *
	 * @note [ADD][2017-01-03]新建 by xufengyf3
	 *
	 */


	var Storage = function () {
	    /**
	     * @synopsis 构造函数
	     * @param {string} szBasePath 基础路径
	     * @param {string} szUUID 存储对象uuid
	     * @param {string} szFileName 文件名
	     * @param {Array} aHeadBuf 40字节媒体头
	     * @param {number} iPackType 打包类型
	     * @param {number} iStreamType 码流类型
	     * @param {object} options 可选参数
	     *
	     * @returns {none} 无
	     */
	    function Storage(szBasePath, szUUID, szFileName, aHeadBuf, iPackType, iStreamType, options) {
	        _classCallCheck(this, Storage);

	        this.szBasePath = szBasePath;
	        this.szUUID = szUUID;
	        this.szFileName = szFileName;
	        this.aHeadBuf = new Uint8Array(aHeadBuf); //拷贝一份
	        this.iPackType = iPackType;
	        this.iStreamType = iStreamType;
	        this.oWorker = null;
	        this.oFileSystem = null;
	        this.options = options;
	    }

	    /**
	     * @synopsis 初始化
	     *
	     * @returns {object} 返回Promise对象
	     */


	    _createClass(Storage, [{
	        key: "init",
	        value: function init() {
	            var that = this;

	            var oPromise = new Promise(function (resolve, reject) {
	                that.initFileSystem().then(function () {
	                    that.initWorker().then(function () {
	                        resolve(that.szUUID);
	                    }, function (iError) {
	                        reject(iError);
	                    });
	                }, function (iError) {
	                    reject(iError);
	                });
	            });

	            return oPromise;
	        }

	        /**
	         * @synopsis 初始化虚拟文件系统
	         *
	         * @returns {object} 返回Promise对象
	         */

	    }, {
	        key: "initFileSystem",
	        value: function initFileSystem() {
	            var that = this;

	            this.oFileSystem = new FileSystem(this.szUUID, this.szFileName, this.iStreamType, this.options);

	            var oPromise = new Promise(function (resolve, reject) {
	                that.oFileSystem.init().then(function () {
	                    resolve();
	                }, function (iError) {
	                    reject(iError);
	                });
	            });

	            return oPromise;
	        }

	        /**
	         * @synopsis 初始化转封装Worker
	         *
	         *
	         * @returns {object} 返回Promise对象
	         */

	    }, {
	        key: "initWorker",
	        value: function initWorker() {
	            var that = this;

	            var oPromise = new Promise(function (resolve /*, reject*/) {
	                that.oWorker = new Worker(that.szBasePath + "/systemTransform-worker.min.js");
	                that.oWorker.onmessage = function (e) {
	                    var data = e.data;

	                    if ("loaded" === data.type) {
	                        // 加载完毕后，初始化转封装库
	                        that.oWorker.postMessage({
	                            type: "create",
	                            buf: that.aHeadBuf.buffer,
	                            len: 40,
	                            packType: that.iPackType
	                        }, [that.aHeadBuf.buffer]);
	                    } else if ("created" === data.type) {
	                        //console.log("created");
	                        resolve();
	                    } else if ("outputData" === data.type) {
	                        //console.log(new Uint8Array(data.buf));
	                        //console.log("dType: " + data.dType);

	                        var aFileData = new Uint8Array(data.buf); // 拷贝一份
	                        if (TRANS_SYSHEAD === data.dType) {
	                            // 头数据
	                            that.oFileSystem.writeFileHeader(aFileData);
	                        } else {
	                            that.oFileSystem.writeFileContent(aFileData);
	                        }
	                    }
	                };
	            });

	            return oPromise;
	        }

	        /**
	         * @synopsis 输入数据
	         *
	         * @param {Array} aData 数据
	         *
	         * @returns {none} 无
	         */

	    }, {
	        key: "inputData",
	        value: function inputData(aData) {
	            if (this.oWorker) {
	                var aPostData = new Uint8Array(aData); // 拷贝一份
	                this.oWorker.postMessage({
	                    type: "inputData",
	                    buf: aPostData.buffer,
	                    len: aPostData.length
	                }, [aPostData.buffer]);
	            }
	        }

	        /**
	         * @synopsis 停止录像
	         *
	         *
	         * @returns {object} 返回Promise对象
	         */

	    }, {
	        key: "stopRecord",
	        value: function stopRecord() {
	            var that = this;

	            var oPromise = new Promise(function (resolve, reject) {
	                if (that.oWorker) {
	                    that.oWorker.postMessage({ type: "release" });
	                } else {
	                    reject();
	                }

	                if (that.oFileSystem) {
	                    that.oFileSystem.stopWriteFile().then(function () {
	                        resolve();
	                    }, function () {
	                        reject();
	                    });
	                } else {
	                    reject();
	                }
	            });

	            return oPromise;
	        }
	    }]);

	    return Storage;
	}();

	/**
	 * @synopsis 存储管理类
	 *
	 * @note [ADD][2017-01-03]新建 by xufengyf3
	 *
	 */


	var StorageManager = function () {
	    if (typeof Symbol === "undefined") {
	        return;
	    }
	    var STORAGELIST = Symbol("STORAGELIST");

	    var StorageManage = function () {
	        /**
	         * @synopsis 构造函数
	         *
	         * @param {string} szBasePath 库基础路径，相对于web根目录
	         * @param {object} options 可选参数
	         *
	         * @returns {none} 无
	         */
	        function StorageManage(szBasePath, options) {
	            _classCallCheck(this, StorageManage);

	            this.szBasePath = szBasePath;
	            this[STORAGELIST] = {};

	            this.options = {
	                iFileSize: 1024 * 1024 * 1024 // 默认1G
	            };
	            Object.assign(this.options, options);
	        }

	        /**
	         * @synopsis 开始录像
	         *
	         * @param {string} szFileName 文件名
	         * @param {Array} aHeadBuf 40字节头
	         * @param {number} iPackType 目标格式
	         * @param {number} iStreamType 0:录像  1:剪辑
	         * @param {object} options 可选参数
	         *
	         * @returns {object} 返回Promise对象
	         */


	        _createClass(StorageManage, [{
	            key: "startRecord",
	            value: function startRecord(szFileName, aHeadBuf, iPackType, iStreamType, options) {
	                var that = this;

	                var szUUID = _uuid2.default.v4();
	                var oOptions = Object.assign({}, this.options, options);
	                var oStorage = new Storage(this.szBasePath, szUUID, szFileName, aHeadBuf, iPackType, iStreamType, oOptions);

	                var oPromise = new Promise(function (resolve, reject) {
	                    oStorage.init().then(function (szID) {
	                        //console.log("startRecord:" + szID);

	                        that[STORAGELIST][szID] = oStorage;

	                        resolve(szID);
	                    }, function (iError) {
	                        reject(iError);
	                    });
	                });

	                return oPromise;
	            }

	            /**
	             * @synopsis 输入数据
	             *
	             * @param {string} szUUID 实例标识
	             * @param {Array} aData 数据
	             *
	             * @returns {none} 无
	             */

	        }, {
	            key: "inputData",
	            value: function inputData(szUUID, aData) {
	                var oStorage = this[STORAGELIST][szUUID];
	                if (oStorage) {
	                    oStorage.inputData(aData);
	                }
	            }

	            /**
	             * @synopsis 停止录像
	             *
	             * @param {string} szUUID 实例标识
	             *
	             * @returns {object} 返回Promise对象
	             */

	        }, {
	            key: "stopRecord",
	            value: function stopRecord(szUUID) {
	                var that = this;

	                var oPromise = new Promise(function (resolve, reject) {
	                    var oStorage = that[STORAGELIST][szUUID];
	                    if (oStorage) {
	                        oStorage.stopRecord().then(function () {
	                            delete that[STORAGELIST][szUUID];

	                            resolve();
	                        }, function () {
	                            reject();
	                        });
	                    } else {
	                        reject();
	                    }
	                });

	                return oPromise;
	            }
	        }]);

	        return StorageManage;
	    }();

	    return StorageManage;
	}();

	exports.StorageManager = StorageManager;

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.ESCanvas = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @synopsis ESCanvas
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @note [ADD][2017-03-01]create by fengzhongjian
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


	var _jquery = __webpack_require__(17);

	var _jquery2 = _interopRequireDefault(_jquery);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var ESCanvas = function () {
	    if (typeof Symbol === "undefined") {
	        return;
	    }
	    var self = null; //self指向ESCanvas类
	    //ESCanvas类私有成员变量
	    var CANVAS = Symbol("CANVAS"); //画布
	    var CONTEXT = Symbol("CONTEXT"); //绘图上下文
	    var SHAPES = Symbol("SHAPES"); //图形数组
	    var DRAWSTATUS = Symbol("DRAWSTATUS"); //是否开启绘图
	    var SHAPETYPE = Symbol("SHAPETYPE"); //图形类型
	    var MAXSHAPENUMSUPPORT = Symbol("MAXSHAPENUMSUPPORT"); //支持最大的图形个数
	    var SHAPESTYLE = Symbol("SHAPESTYLE"); //图形样式
	    var POLYGONDRAWING = Symbol("POLYGONDRAWING"); //正在绘制多边形
	    var CURRENTSHAPEINFO = Symbol("CURRENTSHAPEINFO"); //当前图形id
	    var DRAWSHAPEMULTIONETIME = Symbol("DRAWSHAPEMULTIONETIME"); //一次是否可绘制多个图形
	    var EVENTCALLBACK = Symbol("EVENTCALLBACK");

	    //画布重绘
	    function redraw() {
	        self[CONTEXT].clearRect(0, 0, self.m_iCanvasWidth, self.m_iCanvasHeight);
	        for (var i = 0, len = self[SHAPES].length; i < len; i++) {
	            //遍历图形列表，绘制所有图形
	            self[SHAPES][i].draw();
	        }
	    }
	    //添加图形到列表
	    function addShape(oShape) {
	        var iLen = self[SHAPES].length;
	        if (iLen < self[MAXSHAPENUMSUPPORT]) {
	            self[SHAPES].push(oShape);
	        }
	    }
	    //事件初始化
	    function initEvent() {
	        var bPainting = false;
	        var iMouseDownX = 0; //mousedown事件点击时的X坐标
	        var iMouseDownY = 0; //mousedown事件点击时的Y坐标
	        var szStatus = "draw"; //draw, drag, stretch
	        var oShape = null;
	        //是否被选中，返回被选中图像索引值
	        function getChooseBoxIndex() {
	            var iIndex = -1;
	            for (var i = 0, iLen = self[SHAPES].length; i < iLen; i++) {
	                if (self[SHAPES][i].m_bChoosed) {
	                    iIndex = i;
	                    break;
	                }
	            }
	            return iIndex;
	        }
	        //禁止右键菜单
	        self[CANVAS][0].oncontextmenu = function () {
	            return false;
	        };
	        //禁止双击选中
	        self[CANVAS][0].onselectstart = function () {
	            return false;
	        };
	        //鼠标点击事件
	        self[CANVAS].unbind();
	        self[CANVAS].bind("mousedown", function (e) {
	            if (e.button === 2) {
	                //鼠标右键闭合图形
	                if (self[POLYGONDRAWING] && oShape) {
	                    //多边形并未闭合
	                    if (oShape.m_aPoint.length >= oShape.m_iMinClosed - 1) {
	                        oShape.m_bClosed = true;
	                        self[POLYGONDRAWING] = false;
	                        oShape.setPointInfo(oShape.m_aPoint);
	                        addShape(oShape);
	                        redraw();
	                        bPainting = false;
	                        if (!self[DRAWSHAPEMULTIONETIME]) {
	                            self[DRAWSTATUS] = false;
	                        }
	                    }
	                }
	            } else if (e.button === 0) {
	                //鼠标左键
	                iMouseDownX = e.offsetX;
	                iMouseDownY = e.offsetY;
	                szStatus = "draw";
	                if (!self[POLYGONDRAWING]) {
	                    //不在绘制多边形
	                    //目前是否已经选中某个图形
	                    var iBoxIndex = getChooseBoxIndex();
	                    if (iBoxIndex !== -1) {
	                        //判断是否在圆点内
	                        if (self[SHAPES][iBoxIndex].inArc(e.offsetX, e.offsetY, 5)) {
	                            szStatus = "stretch";
	                        }
	                    }
	                    //未选中圆点，则判断是否选中某个图形
	                    if (szStatus !== "stretch") {
	                        //判断鼠标是否在图形内
	                        for (var i = 0, iLen = self[SHAPES].length; i < iLen; i++) {
	                            if (self[SHAPES][i].inShape(e.offsetX, e.offsetY)) {
	                                self[SHAPES][i].m_bChoosed = true;
	                                self[SHAPES][i].getMouseDownPoints(e.offsetX, e.offsetY);
	                                szStatus = "drag";
	                            } else {
	                                self[SHAPES][i].m_bChoosed = false;
	                            }
	                        }
	                    }
	                    if (szStatus === "drag") {
	                        self[CANVAS][0].style.cursor = "move";
	                    } else {
	                        self[CANVAS][0].style.cursor = "default";
	                    }
	                }
	                if (szStatus === "draw") {
	                    if (self[DRAWSTATUS]) {
	                        if (self[MAXSHAPENUMSUPPORT] <= self[SHAPES].length && self[SHAPETYPE] !== "Grid") {
	                            return;
	                        }
	                        if (self[SHAPETYPE] === "Rect") {
	                            oShape = new Rect();
	                        } else if (self[SHAPETYPE] === "Grid") {
	                            if (self[SHAPES].length === 0) {
	                                oShape = new MotionGrid();
	                                addShape(oShape);
	                            }
	                        } else if (self[SHAPETYPE] === "Polygon") {
	                            if (!self[POLYGONDRAWING]) {
	                                self[POLYGONDRAWING] = true;
	                                oShape = new Polygon();
	                                oShape.m_szId = self[CURRENTSHAPEINFO].szId || "";
	                                oShape.m_szTips = self[CURRENTSHAPEINFO].szTips || "";
	                                oShape.m_iMinClosed = self[CURRENTSHAPEINFO].iMinClosed || 3;
	                                oShape.m_iMaxPointNum = self[CURRENTSHAPEINFO].iMaxPointNum || 11;
	                                oShape.m_iPolygonType = self[CURRENTSHAPEINFO].iPolygonType;
	                                oShape.m_szDrawColor = self[CURRENTSHAPEINFO].szDrawColor;
	                                oShape.m_szFillColor = self[CURRENTSHAPEINFO].szFillColor;
	                                oShape.m_iTranslucent = self[CURRENTSHAPEINFO].iTranslucent;
	                            }
	                            if (oShape.m_iPolygonType === 1) {
	                                oShape.addPoint(iMouseDownX, iMouseDownY);
	                                if (oShape.m_aPoint.length === oShape.m_iMaxPointNum) {
	                                    oShape.m_bClosed = true;
	                                    self[POLYGONDRAWING] = false;
	                                    addShape(oShape);
	                                    redraw();
	                                    bPainting = false;
	                                    if (!self[DRAWSHAPEMULTIONETIME]) {
	                                        self[DRAWSTATUS] = false;
	                                    }
	                                }
	                            }
	                        }
	                    }
	                }
	                bPainting = true;
	            }
	        });
	        //鼠标移动事件
	        self[CANVAS].bind("mousemove", function (e) {
	            if (!self[POLYGONDRAWING]) {
	                var iBoxIndex = getChooseBoxIndex();
	                if (iBoxIndex > -1) {
	                    //drag, stretch
	                    if (bPainting && self[DRAWSTATUS]) {
	                        if (szStatus === "drag") {
	                            self[SHAPES][iBoxIndex].drag(e.offsetX, e.offsetY);
	                        } else if (szStatus === "stretch") {
	                            self[SHAPES][iBoxIndex].stretch(e.offsetX, e.offsetY);
	                        }
	                    }
	                } else {
	                    if (self[DRAWSTATUS]) {
	                        if (bPainting) {
	                            if (self[SHAPETYPE] === "Rect") {
	                                oShape.move([[iMouseDownX, iMouseDownY], [e.offsetX, e.offsetY]]);
	                            } else if (self[SHAPETYPE] === "Grid") {
	                                self[SHAPES][0].move(iMouseDownX, iMouseDownY, e.offsetX, e.offsetY);
	                            }
	                        }
	                    }
	                }
	            } else {
	                if (self[DRAWSTATUS]) {
	                    if (bPainting) {
	                        if (self[SHAPETYPE] === "Polygon" && oShape.m_iPolygonType === 0) {
	                            oShape.m_bClosed = true;
	                        }
	                        redraw();
	                        oShape.move(e.offsetX, e.offsetY, iMouseDownX, iMouseDownY);
	                    }
	                }
	            }
	        });
	        //鼠标释放事件
	        self[CANVAS].bind("mouseup", function (e) {
	            self[CANVAS][0].style.cursor = "default";
	            if (oShape !== null && typeof oShape !== 'undefined' && szStatus === "draw") {
	                if (self[SHAPETYPE] === "Rect") {
	                    if (Math.abs(e.offsetX - iMouseDownX) > 2 && Math.abs(e.offsetY - iMouseDownY) > 2) {
	                        //绘制宽高同时大于2px，则绘制该图形
	                        addShape(oShape);
	                        if (!self[DRAWSHAPEMULTIONETIME]) {
	                            self[DRAWSTATUS] = false;
	                        }
	                    }
	                    if (self[EVENTCALLBACK]) {
	                        //事件回调处理
	                        var oRECT = {
	                            startPos: [],
	                            endPos: []
	                        };
	                        if (e.offsetX > iMouseDownX && e.offsetY > iMouseDownY) {
	                            oRECT.startPos = oShape.m_aPoint[0] || [e.offsetX, e.offsetY];
	                            oRECT.endPos = oShape.m_aPoint[2] || [e.offsetX, e.offsetY];
	                        } else {
	                            oRECT.startPos = oShape.m_aPoint[2] || [e.offsetX, e.offsetY];
	                            oRECT.endPos = oShape.m_aPoint[0] || [e.offsetX, e.offsetY];
	                        }
	                        self[EVENTCALLBACK] && self[EVENTCALLBACK](oRECT);
	                        oShape = null;
	                        self.clearAllShape();
	                    }
	                } else if (self[SHAPETYPE] === "Polygon" && oShape.m_iPolygonType === 0 && self[POLYGONDRAWING]) {
	                    if (Math.abs(e.offsetX - iMouseDownX) > 2 && Math.abs(e.offsetY - iMouseDownY) > 2) {
	                        //绘制宽高同时大于2px，则绘制该图形
	                        addShape(oShape);
	                        self[POLYGONDRAWING] = false;
	                        if (!self[DRAWSHAPEMULTIONETIME]) {
	                            self[DRAWSTATUS] = false;
	                        }
	                    }
	                }
	            }
	            if (!self[POLYGONDRAWING]) {
	                bPainting = false;
	            } else {
	                bPainting = true;
	            }
	            redraw();
	        });

	        //鼠标双击事件
	        self[CANVAS].bind("dblclick", function () {
	            if (self[DRAWSTATUS]) {
	                if (self[SHAPETYPE] === "Grid") {
	                    self[SHAPES][0].m_szGridMap = "fffffcfffffcfffffcfffffcfffffcfffffcfffffcfffffcfffffcfffffcfffffcfffffcfffffcfffffcfffffcfffffcfffffcfffffc";
	                    redraw();
	                }
	            }
	        });
	        //鼠标移出事件
	        self[CANVAS].bind("mouseout", function () /*e*/{
	            self[CANVAS][0].style.cursor = "default";
	            if (!self[POLYGONDRAWING]) {
	                bPainting = false;
	            } else {
	                bPainting = true;
	            }
	            /*if (self[EVENTCALLBACK]) {  //事件回调处理
	                let oRECT = {
	                    startPos: [],
	                    endPos: []
	                };
	                if (iMouseDownX > 0 && iMouseDownY > 0) {
	                    oRECT.startPos = [iMouseDownX, iMouseDownY];
	                    oRECT.endPos = [e.offsetX, e.offsetY];
	                    self[EVENTCALLBACK] && self[EVENTCALLBACK](oRECT);
	                    self.clearAllShape();
	                }
	            }*/
	        });
	    }

	    //图形基类

	    var Shape = function () {
	        //图形基类构造函数
	        function Shape() {
	            _classCallCheck(this, Shape);

	            this.m_szId = ""; //图形id
	            this.m_aPoint = []; //图形所有点的坐标
	            this.m_bChoosed = false; //图形是否被选中
	            this.m_szDrawColor = self[SHAPESTYLE].szDrawColor; //图形中线的颜色
	            this.m_szFillColor = self[SHAPESTYLE].szFillColor; //图形填充颜色
	            this.m_iTranslucent = self[SHAPESTYLE].iTranslucent; //图形填充颜色透明度
	            this.m_iIndexChoosePoint = -1; //判断鼠标点击选中图形上点的索引
	            this.m_iDriftStartX = 0; //drag起始X坐标
	            this.m_iDriftStartY = 0; //drag起始Y坐标
	            this.m_oEdgePoints = {
	                top: {
	                    x: 0,
	                    y: 0
	                },
	                left: {
	                    x: 0,
	                    y: 0
	                },
	                right: {
	                    x: 0,
	                    y: 0
	                },
	                bottom: {
	                    x: 0,
	                    y: 0
	                }
	            }; //多边形中用于判断边界
	            this.m_szTips = ""; //图形内部显示文字信息
	            this.m_iEditType = 0; //图形是否可编辑, 0-可编辑, 1-不可编辑

	            /*多边形和线用的属性*/
	            this.m_iMinClosed = 3; //至少几个坐标点可闭合图像
	            this.m_iMaxPointNum = 11; //图形支持的最大坐标点数
	            this.m_bClosed = false; //图形目前是否闭合
	        }
	        //绘制图形


	        _createClass(Shape, [{
	            key: "draw",
	            value: function draw() {}
	            //do something

	            //平移图形

	        }, {
	            key: "drag",
	            value: function drag(iPointX, iPointY) {
	                var iLength = this.m_aPoint.length;
	                var i = 0;
	                for (i = 0; i < iLength; i++) {
	                    if (this.m_aPoint[i][0] + iPointX - this.m_iDriftStartX > self.m_iCanvasWidth || this.m_aPoint[i][1] + iPointY - this.m_iDriftStartY > self.m_iCanvasHeight || this.m_aPoint[i][0] + iPointX - this.m_iDriftStartX < 0 || this.m_aPoint[i][1] + iPointY - this.m_iDriftStartY < 0) {
	                        this.m_iDriftStartX = iPointX;
	                        this.m_iDriftStartY = iPointY;
	                        return;
	                    }
	                }
	                for (i = 0; i < iLength; i++) {
	                    this.m_aPoint[i][0] = this.m_aPoint[i][0] + iPointX - this.m_iDriftStartX;
	                    this.m_aPoint[i][1] = this.m_aPoint[i][1] + iPointY - this.m_iDriftStartY;
	                }
	                this.m_iDriftStartX = iPointX;
	                this.m_iDriftStartY = iPointY;
	                this.setPointInfo(this.m_aPoint);
	                redraw();
	            }
	            //拉伸图形

	        }, {
	            key: "stretch",
	            value: function stretch(iPointX, iPointY) {
	                if (this.m_iEditType === 0) {
	                    if (this.m_iIndexChoosePoint !== -1) {
	                        this.m_aPoint[this.m_iIndexChoosePoint][0] = iPointX;
	                        this.m_aPoint[this.m_iIndexChoosePoint][1] = iPointY;
	                    }
	                    this.setPointInfo(this.m_aPoint);
	                    redraw();
	                }
	            }
	            //判断是否在图形内

	        }, {
	            key: "inShape",
	            value: function inShape(iPointX, iPointY) {
	                var bRet = false;
	                var iLen = this.m_aPoint.length;
	                for (var i = 0, j = iLen - 1; i < iLen; j = i++) {
	                    if (this.m_aPoint[i][1] > iPointY !== this.m_aPoint[j][1] > iPointY && iPointX < (this.m_aPoint[j][0] - this.m_aPoint[i][0]) * (iPointY - this.m_aPoint[i][1]) / (this.m_aPoint[j][1] - this.m_aPoint[i][1]) + this.m_aPoint[i][0]) {
	                        bRet = !bRet;
	                    }
	                }
	                return bRet;
	            }
	            //判断是否在图形边界圆点内

	        }, {
	            key: "inArc",
	            value: function inArc(iPointX, iPointY, iRadius) {
	                var bRet = false;
	                for (var i = 0, iLen = this.m_aPoint.length; i < iLen; i++) {
	                    var iDistance = Math.sqrt((iPointX - this.m_aPoint[i][0]) * (iPointX - this.m_aPoint[i][0]) + (iPointY - this.m_aPoint[i][1]) * (iPointY - this.m_aPoint[i][1]));
	                    if (iDistance < iRadius) {
	                        bRet = true;
	                        this.m_iIndexChoosePoint = i;
	                        break;
	                    }
	                }
	                return bRet;
	            }
	            //鼠标点击选择图形时调用获取坐标偏差

	        }, {
	            key: "getMouseDownPoints",
	            value: function getMouseDownPoints(iMouseDownX, iMouseDownY) {
	                this.m_iDriftStartX = iMouseDownX;
	                this.m_iDriftStartY = iMouseDownY;
	            }
	            //获取坐标信息

	        }, {
	            key: "getPointInfo",
	            value: function getPointInfo() {
	                return this.m_aPoint;
	            }
	            //设置坐标信息

	        }, {
	            key: "setPointInfo",
	            value: function setPointInfo(aPoint) {
	                if (aPoint !== null && typeof aPoint !== 'undefined' && aPoint.length > 0) {
	                    this.m_aPoint = aPoint;
	                    this.setEdgePoints(aPoint);
	                }
	            }
	            //添加坐标

	        }, {
	            key: "addPoint",
	            value: function addPoint(iMouseDownX, iMouseDownY) {
	                if (this.m_aPoint.length < this.m_iMaxPointNum) {
	                    this.m_aPoint.push([iMouseDownX, iMouseDownY]);
	                }
	                if (this.m_aPoint.length === this.m_iMaxPointNum) {
	                    this.setPointInfo(this.m_aPoint);
	                }
	            }
	            //计算边缘坐标

	        }, {
	            key: "setEdgePoints",
	            value: function setEdgePoints(aPoint) {
	                for (var i = 0, iLen = aPoint.length; i < iLen; i++) {
	                    if (i === 0) {
	                        this.m_oEdgePoints.top.x = aPoint[i][0];
	                        this.m_oEdgePoints.top.y = aPoint[i][1];
	                        this.m_oEdgePoints.left.x = aPoint[i][0];
	                        this.m_oEdgePoints.left.y = aPoint[i][1];
	                        this.m_oEdgePoints.right.x = aPoint[i][0];
	                        this.m_oEdgePoints.right.y = aPoint[i][1];
	                        this.m_oEdgePoints.bottom.x = aPoint[i][0];
	                        this.m_oEdgePoints.bottom.y = aPoint[i][1];
	                    } else {
	                        if (aPoint[i][1] < this.m_oEdgePoints.top.y) {
	                            this.m_oEdgePoints.top.x = aPoint[i][0];
	                            this.m_oEdgePoints.top.y = aPoint[i][1];
	                        }
	                        if (aPoint[i][0] > this.m_oEdgePoints.right.x) {
	                            this.m_oEdgePoints.right.x = aPoint[i][0];
	                            this.m_oEdgePoints.right.y = aPoint[i][1];
	                        }
	                        if (aPoint[i][1] > this.m_oEdgePoints.bottom.y) {
	                            this.m_oEdgePoints.bottom.x = aPoint[i][0];
	                            this.m_oEdgePoints.bottom.y = aPoint[i][1];
	                        }
	                        if (aPoint[i][0] < this.m_oEdgePoints.left.x) {
	                            this.m_oEdgePoints.left.x = aPoint[i][0];
	                            this.m_oEdgePoints.left.y = aPoint[i][1];
	                        }
	                    }
	                }
	            }
	        }]);

	        return Shape;
	    }();
	    //矩形类


	    var Rect = function (_Shape) {
	        _inherits(Rect, _Shape);

	        function Rect() {
	            _classCallCheck(this, Rect);

	            var _this = _possibleConstructorReturn(this, (Rect.__proto__ || Object.getPrototypeOf(Rect)).call(this));

	            _this.m_szType = "Rect";
	            return _this;
	        }

	        _createClass(Rect, [{
	            key: "setPointInfo",
	            value: function setPointInfo(aPoint) {
	                if (aPoint !== null && typeof aPoint !== 'undefined') {
	                    var iStartX = aPoint[0][0];
	                    var iStartY = aPoint[0][1];
	                    var iEndX = aPoint[0][0];
	                    var iEndY = aPoint[0][1];
	                    for (var i = 0, iLen = aPoint.length; i < iLen; i++) {
	                        if (iStartX > aPoint[i][0]) {
	                            iStartX = aPoint[i][0];
	                        }
	                        if (iStartY > aPoint[i][1]) {
	                            iStartY = aPoint[i][1];
	                        }
	                        if (iEndX < aPoint[i][0]) {
	                            iEndX = aPoint[i][0];
	                        }
	                        if (iEndY < aPoint[i][1]) {
	                            iEndY = aPoint[i][1];
	                        }
	                    }
	                    this.m_aPoint = [[iStartX, iStartY], [iEndX, iStartY], [iEndX, iEndY], [iStartX, iEndY]];
	                }
	            }
	            //绘制矩形

	        }, {
	            key: "draw",
	            value: function draw() {
	                self[CONTEXT].fillStyle = this.m_szFillColor;
	                self[CONTEXT].strokeStyle = this.m_szDrawColor;
	                var iStartX = this.m_aPoint[0][0];
	                var iStartY = this.m_aPoint[0][1];
	                var iWidth = this.m_aPoint[2][0] - iStartX;
	                var iHeight = this.m_aPoint[2][1] - iStartY;
	                self[CONTEXT].globalAlpha = this.m_iTranslucent;
	                self[CONTEXT].fillRect(iStartX, iStartY, iWidth, iHeight);
	                self[CONTEXT].globalAlpha = 1;
	                self[CONTEXT].fillText(this.m_szTips, (iStartX + this.m_aPoint[2][0]) / 2, (iStartY + this.m_aPoint[2][1]) / 2);
	                if (this.m_bChoosed) {
	                    var iHalfWidth = Math.round(iWidth / 2);
	                    var iHalfHeight = Math.round(iHeight / 2);
	                    if (this.m_iEditType === 0) {
	                        var aPointX = [iStartX, iStartX + iHalfWidth, iStartX + iWidth, iStartX, iStartX + iWidth, iStartX, iStartX + iHalfWidth, iStartX + iWidth];
	                        var aPointY = [iStartY, iStartY, iStartY, iStartY + iHalfHeight, iStartY + iHalfHeight, iStartY + iHeight, iStartY + iHeight, iStartY + iHeight];
	                        for (var i = 0; i < 8; i++) {
	                            self[CONTEXT].beginPath();
	                            self[CONTEXT].arc(aPointX[i], aPointY[i], 3, 0, 360, false);
	                            self[CONTEXT].fillStyle = this.m_szDrawColor;
	                            self[CONTEXT].closePath();
	                            self[CONTEXT].fill();
	                        }
	                    }
	                }
	                self[CONTEXT].strokeRect(iStartX, iStartY, iWidth, iHeight);
	            }
	            //拉伸矩形

	        }, {
	            key: "stretch",
	            value: function stretch(iPointX, iPointY) {
	                if (this.m_iEditType === 0) {
	                    if (this.m_iIndexChoosePoint === 0) {
	                        if (iPointX < this.m_aPoint[2][0] && iPointY < this.m_aPoint[2][1]) {
	                            this.m_aPoint[0][0] = iPointX;
	                            this.m_aPoint[0][1] = iPointY;
	                            this.m_aPoint[3][0] = iPointX;
	                            this.m_aPoint[1][1] = iPointY;
	                        }
	                    } else if (this.m_iIndexChoosePoint === 1) {
	                        if (iPointY < this.m_aPoint[2][1]) {
	                            this.m_aPoint[0][1] = iPointY;
	                            this.m_aPoint[1][1] = iPointY;
	                        }
	                    } else if (this.m_iIndexChoosePoint === 2) {
	                        if (iPointX > this.m_aPoint[3][0] && iPointY < this.m_aPoint[3][1]) {
	                            this.m_aPoint[1][0] = iPointX;
	                            this.m_aPoint[1][1] = iPointY;
	                            this.m_aPoint[2][0] = iPointX;
	                            this.m_aPoint[0][1] = iPointY;
	                        }
	                    } else if (this.m_iIndexChoosePoint === 3) {
	                        if (iPointX < this.m_aPoint[2][0]) {
	                            this.m_aPoint[0][0] = iPointX;
	                            this.m_aPoint[3][0] = iPointX;
	                        }
	                    } else if (this.m_iIndexChoosePoint === 4) {
	                        if (iPointX > this.m_aPoint[0][0]) {
	                            this.m_aPoint[1][0] = iPointX;
	                            this.m_aPoint[2][0] = iPointX;
	                        }
	                    } else if (this.m_iIndexChoosePoint === 5) {
	                        if (iPointX < this.m_aPoint[1][0] && iPointY > this.m_aPoint[1][1]) {
	                            this.m_aPoint[3][0] = iPointX;
	                            this.m_aPoint[3][1] = iPointY;
	                            this.m_aPoint[0][0] = iPointX;
	                            this.m_aPoint[2][1] = iPointY;
	                        }
	                    } else if (this.m_iIndexChoosePoint === 6) {
	                        if (iPointY > this.m_aPoint[1][1]) {
	                            this.m_aPoint[2][1] = iPointY;
	                            this.m_aPoint[3][1] = iPointY;
	                        }
	                    } else if (this.m_iIndexChoosePoint === 7) {
	                        if (iPointX > this.m_aPoint[0][0] && iPointY > this.m_aPoint[0][1]) {
	                            this.m_aPoint[2][0] = iPointX;
	                            this.m_aPoint[2][1] = iPointY;
	                            this.m_aPoint[1][0] = iPointX;
	                            this.m_aPoint[3][1] = iPointY;
	                        }
	                    }
	                    redraw();
	                }
	            }
	            //点击后移动鼠标绘制矩形

	        }, {
	            key: "move",
	            value: function move(aPoint) {
	                redraw();
	                this.m_bChoosed = true;
	                var iStartX = aPoint[0][0];
	                var iStartY = aPoint[0][1];
	                var iEndX = aPoint[1][0];
	                var iEndY = aPoint[1][1];
	                this.setPointInfo([[iStartX, iStartY], [iEndX, iStartY], [iEndX, iEndY], [iStartX, iEndY]]);
	                this.draw();
	            }
	            //判断是否在图形边界圆点内

	        }, {
	            key: "inArc",
	            value: function inArc(iPointX, iPointY, iRadius) {
	                var iStartX = this.m_aPoint[0][0];
	                var iStartY = this.m_aPoint[0][1];
	                var iWidth = this.m_aPoint[2][0] - iStartX;
	                var iHeight = this.m_aPoint[2][1] - iStartY;
	                var iHalfWidth = Math.round(iWidth / 2);
	                var iHalfHeight = Math.round(iHeight / 2);
	                var aPointX = [iStartX, iStartX + iHalfWidth, iStartX + iWidth, iStartX, iStartX + iWidth, iStartX, iStartX + iHalfWidth, iStartX + iWidth];
	                var aPointY = [iStartY, iStartY, iStartY, iStartY + iHalfHeight, iStartY + iHalfHeight, iStartY + iHeight, iStartY + iHeight, iStartY + iHeight];
	                //let aCursors = ["nw-resize", "n-resize", "ne-resize", "w-resize", "e-resize", "sw-resize", "s-resize", "se-resize"];
	                for (var i = 0; i < 8; i++) {
	                    var iDistance = Math.sqrt((iPointX - aPointX[i]) * (iPointX - aPointX[i]) + (iPointY - aPointY[i]) * (iPointY - aPointY[i]));
	                    if (iDistance < iRadius) {
	                        this.m_iIndexChoosePoint = i;
	                        return true;
	                    }
	                }
	                return false;
	            }
	        }]);

	        return Rect;
	    }(Shape);
	    //OSD类


	    var RectOSD = function (_Shape2) {
	        _inherits(RectOSD, _Shape2);

	        function RectOSD(szText, szEnabled) {
	            _classCallCheck(this, RectOSD);

	            var _this2 = _possibleConstructorReturn(this, (RectOSD.__proto__ || Object.getPrototypeOf(RectOSD)).call(this));

	            _this2.m_szType = "RectOSD";
	            _this2.m_szOSDType = "overlay-date"; //OSD类型, overlay-date: 日期, overlay-ch: 通道名, overlay-text: 字符叠加
	            _this2.m_szText = szText || "";
	            _this2.m_szEnabled = szEnabled || "";
	            _this2.m_szDateStyle = "";
	            _this2.m_szClockType = "";
	            _this2.m_szDisplayWeek = "";
	            _this2.m_szId = "";
	            return _this2;
	        }

	        _createClass(RectOSD, [{
	            key: "draw",
	            value: function draw() {
	                if (this.m_szEnabled === "true") {
	                    var iStartX = this.m_aPoint[0][0];
	                    var iStartY = this.m_aPoint[0][1];
	                    var iWidth = this.m_aPoint[2][0] - iStartX;
	                    var iHeight = this.m_aPoint[2][1] - iStartY;
	                    self[CONTEXT].beginPath();
	                    self[CONTEXT].strokeStyle = this.m_szDrawColor;
	                    self[CONTEXT].globalAlpha = 1;
	                    self[CONTEXT].rect(iStartX, iStartY, iWidth, iHeight);
	                    self[CONTEXT].font = "15px serif";
	                    self[CONTEXT].strokeText(this.m_szText, iStartX, iStartY + 15);
	                    self[CONTEXT].stroke();
	                }
	            }
	        }, {
	            key: "drag",
	            value: function drag(iPointX, iPointY) {
	                var iLength = this.m_aPoint.length;
	                var i = 0;
	                for (i = 0; i < iLength; i++) {
	                    if (this.m_aPoint[i][1] + iPointY - this.m_iDriftStartY > self.m_iCanvasHeight || this.m_aPoint[i][0] + iPointX - this.m_iDriftStartX < 0 || this.m_aPoint[i][1] + iPointY - this.m_iDriftStartY < 0) {
	                        this.m_iDriftStartX = iPointX;
	                        this.m_iDriftStartY = iPointY;
	                        return;
	                    }
	                }
	                for (i = 0; i < iLength; i++) {
	                    this.m_aPoint[i][0] = this.m_aPoint[i][0] + iPointX - this.m_iDriftStartX;
	                    this.m_aPoint[i][1] = this.m_aPoint[i][1] + iPointY - this.m_iDriftStartY;
	                }
	                this.m_iDriftStartX = iPointX;
	                this.m_iDriftStartY = iPointY;
	                this.setEdgePoints(this.m_aPoint);
	                redraw();
	            }
	            //重写基类的stretch, OSD不支持拉伸

	        }, {
	            key: "stretch",
	            value: function stretch() {
	                //do something
	            }
	        }]);

	        return RectOSD;
	    }(Shape);
	    //移动侦测方格类


	    var MotionGrid = function (_Shape3) {
	        _inherits(MotionGrid, _Shape3);

	        function MotionGrid() {
	            _classCallCheck(this, MotionGrid);

	            var _this3 = _possibleConstructorReturn(this, (MotionGrid.__proto__ || Object.getPrototypeOf(MotionGrid)).call(this));

	            _this3.m_szType = "Grid";
	            _this3.m_iGridColNum = 22;
	            _this3.m_iGridRowNum = 18;
	            _this3.m_szGridMap = "";
	            _this3.m_aAddGridMap = [];
	            return _this3;
	        }

	        _createClass(MotionGrid, [{
	            key: "draw",
	            value: function draw() {
	                var iWidth = self.m_iCanvasWidth / this.m_iGridColNum;
	                var iHeight = self.m_iCanvasHeight / this.m_iGridRowNum;
	                var szResultGridMap = "";
	                for (var i = 0; i < this.m_iGridRowNum; i++) {
	                    var szGridRowMap = this.m_szGridMap.substring(i * 6, i * 6 + 6);
	                    var aBinaryMap = parseInt("f" + szGridRowMap, 16).toString(2).split("").slice(4);
	                    var szResultGridMapRow = "";
	                    for (var j = 0; j < this.m_iGridColNum; j++) {
	                        var szResultGridMapRowCol = "";
	                        if (aBinaryMap[j] === "1") {
	                            self[CONTEXT].strokeStyle = this.m_szDrawColor;
	                            self[CONTEXT].globalAlpha = 1;
	                            self[CONTEXT].strokeRect(iWidth * j, iHeight * i, iWidth, iHeight);
	                            szResultGridMapRowCol = "1";
	                        } else {
	                            szResultGridMapRowCol = "0";
	                        }
	                        if (this.m_aAddGridMap.length) {
	                            if (this.m_aAddGridMap[i][j] === 1) {
	                                self[CONTEXT].strokeStyle = this.m_szDrawColor;
	                                self[CONTEXT].strokeRect(iWidth * j, iHeight * i, iWidth, iHeight);
	                                szResultGridMapRowCol = "1";
	                            }
	                        }
	                        szResultGridMapRow += szResultGridMapRowCol;
	                    }
	                    szResultGridMap += parseInt("1111" + szResultGridMapRow + "00", 2).toString(16).substring(1);
	                }
	                this.m_szGridMap = szResultGridMap;
	            }
	        }, {
	            key: "move",
	            value: function move(iMouseDownX, iMouseDownY, iMouseMoveX, iMouseMoveY) {
	                //szGridMap
	                var iWidth = self.m_iCanvasWidth / this.m_iGridColNum;
	                var iHeight = self.m_iCanvasHeight / this.m_iGridRowNum;
	                var iStartX = Math.floor(iMouseDownX / iWidth);
	                var iStartY = Math.floor(iMouseDownY / iHeight);
	                var iRectColNum = Math.floor(Math.abs(iMouseMoveX - iMouseDownX) / iWidth);
	                var iRectRowNum = Math.floor(Math.abs(iMouseMoveY - iMouseDownY) / iHeight);
	                var iCoefficientX = 1; //横坐标系数, 1: 起始坐标小于结束坐标, -1: 起始坐标小于结束坐标
	                var iCoefficientY = 1; //纵坐标系数
	                if (iMouseMoveX - iMouseDownX > 0) {
	                    iCoefficientX = 1;
	                } else {
	                    iCoefficientX = -1;
	                }
	                if (iMouseMoveY - iMouseDownY > 0) {
	                    iCoefficientY = 1;
	                } else {
	                    iCoefficientY = -1;
	                }
	                var aAddGridMap = [];
	                for (var i = 0; i < this.m_iGridRowNum; i++) {
	                    aAddGridMap[i] = [];
	                    for (var j = 0; j < this.m_iGridColNum; j++) {
	                        if (iCoefficientX === 1) {
	                            if (iCoefficientY === 1) {
	                                if (i >= iStartY && i <= iStartY + iRectRowNum && j >= iStartX && j <= iStartX + iRectColNum) {
	                                    aAddGridMap[i][j] = 1;
	                                } else {
	                                    aAddGridMap[i][j] = 0;
	                                }
	                            } else {
	                                if (i <= iStartY && i >= iStartY - iRectRowNum && j >= iStartX && j <= iStartX + iRectColNum) {
	                                    aAddGridMap[i][j] = 1;
	                                } else {
	                                    aAddGridMap[i][j] = 0;
	                                }
	                            }
	                        } else {
	                            if (iCoefficientY === 1) {
	                                if (i >= iStartY && i <= iStartY + iRectRowNum && j <= iStartX && j >= iStartX - iRectColNum) {
	                                    aAddGridMap[i][j] = 1;
	                                } else {
	                                    aAddGridMap[i][j] = 0;
	                                }
	                            } else {
	                                if (i <= iStartY && i >= iStartY - iRectRowNum && j <= iStartX && j >= iStartX - iRectColNum) {
	                                    aAddGridMap[i][j] = 1;
	                                } else {
	                                    aAddGridMap[i][j] = 0;
	                                }
	                            }
	                        }
	                    }
	                }
	                this.m_aAddGridMap = aAddGridMap;
	                this.draw();
	            }
	        }]);

	        return MotionGrid;
	    }(Shape);
	    //线类


	    var Line = function (_Shape4) {
	        _inherits(Line, _Shape4);

	        function Line() {
	            _classCallCheck(this, Line);

	            var _this4 = _possibleConstructorReturn(this, (Line.__proto__ || Object.getPrototypeOf(Line)).call(this));

	            _this4.m_szType = "Line";
	            _this4.m_iLineType = 0; //普通线-0, 头上带箭头的线-1, 折线-2, 越界侦测线-3, 分离式过线统计线 -4
	            _this4.m_iDirection = 0;
	            _this4.m_iArrowType = 0; //客流量统计的箭头方向
	            _this4.m_aCrossArrowPoint = []; //过线统计箭头坐标
	            return _this4;
	        }

	        _createClass(Line, [{
	            key: "draw",
	            value: function draw() {
	                if (this.m_iLineType === 0) {
	                    this.drawNormalLine();
	                } else if (this.m_iLineType === 1) {
	                    this.drawArrowLine();
	                } else if (this.m_iLineType === 3) {
	                    this.drawCrossLine();
	                } else if (this.m_iLineType === 4) {
	                    this.drawLineCount();
	                }
	            }
	        }, {
	            key: "drawNormalLine",
	            value: function drawNormalLine() {
	                self[CONTEXT].globalAlpha = 1;
	                if (this.m_aPoint.length > 0) {
	                    //连线
	                    self[CONTEXT].beginPath();
	                    self[CONTEXT].strokeStyle = this.m_szDrawColor;
	                    self[CONTEXT].lineWidth = 2;
	                    self[CONTEXT].moveTo(this.m_aPoint[0][0], this.m_aPoint[0][1]);
	                    for (var i = 1, iLen = this.m_aPoint.length; i < iLen; i++) {
	                        self[CONTEXT].lineTo(this.m_aPoint[i][0], this.m_aPoint[i][1]);
	                    }
	                    self[CONTEXT].stroke();
	                    //画点
	                    if (this.m_bChoosed) {
	                        for (var _i = 0, _iLen = this.m_aPoint.length; _i < _iLen; _i++) {
	                            self[CONTEXT].beginPath();
	                            self[CONTEXT].fillStyle = this.m_szDrawColor;
	                            self[CONTEXT].arc(this.m_aPoint[_i][0], this.m_aPoint[_i][1], 3, 0, Math.PI * 2, true);
	                            self[CONTEXT].closePath();
	                            self[CONTEXT].fill();
	                        }
	                    }
	                    if (this.m_szTips !== "") {
	                        self[CONTEXT].strokeStyle = this.m_szDrawColor;
	                        self[CONTEXT].fillText(this.m_szTips, this.m_aPoint[0][0] + 10, this.m_aPoint[0][1] + 4);
	                    }
	                }
	            }
	            //绘制箭头线

	        }, {
	            key: "drawArrowLine",
	            value: function drawArrowLine(iType, fromX, fromY, toX, toY, theta, headlen, width) {
	                theta = typeof theta !== 'undefined' ? theta : 30; //三角斜边一直线夹角
	                headlen = typeof headlen !== 'undefined' ? headlen : 10; //三角斜边长度
	                width = typeof width !== 'undefined' ? width : 1;

	                var angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI;
	                var angle1 = (angle + theta) * Math.PI / 180;
	                var angle2 = (angle - theta) * Math.PI / 180;
	                var topX = headlen * Math.cos(angle1);
	                var topY = headlen * Math.sin(angle1);
	                var botX = headlen * Math.cos(angle2);
	                var botY = headlen * Math.sin(angle2);

	                self[CONTEXT].save();
	                self[CONTEXT].beginPath();

	                var arrowX = fromX - topX;
	                var arrowY = fromY - topY;

	                self[CONTEXT].moveTo(arrowX, arrowY);
	                self[CONTEXT].lineTo(fromX, fromY);
	                arrowX = fromX - botX;
	                arrowY = fromY - botY;
	                self[CONTEXT].lineTo(arrowX, arrowY);
	                self[CONTEXT].moveTo(fromX, fromY);
	                self[CONTEXT].lineTo(toX, toY);

	                // Reverse length on the other side
	                if (iType === 1) {
	                    arrowX = toX + topX;
	                    arrowY = toY + topY;
	                    self[CONTEXT].moveTo(arrowX, arrowY);
	                    self[CONTEXT].lineTo(toX, toY);
	                    arrowX = toX + botX;
	                    arrowY = toY + botY;
	                    self[CONTEXT].lineTo(arrowX, arrowY);
	                }

	                self[CONTEXT].strokeStyle = this.m_szDrawColor;
	                self[CONTEXT].lineWidth = width;
	                self[CONTEXT].stroke();
	                self[CONTEXT].restore();
	            }
	        }, {
	            key: "drawCrossLine",
	            value: function drawCrossLine() {
	                this.drawNormalLine();
	                var iMiddleX = (this.m_aPoint[0][0] + this.m_aPoint[1][0]) / 2;
	                var iMiddleY = (this.m_aPoint[0][1] + this.m_aPoint[1][1]) / 2;

	                var angle = Math.atan2(iMiddleY - this.m_aPoint[0][1], iMiddleX - this.m_aPoint[0][0]) * 180 / Math.PI;
	                var angle1 = (angle + 90) * Math.PI / 180;
	                var angle2 = (angle - 90) * Math.PI / 180;
	                var topX = 25 * Math.cos(angle1);
	                var topY = 25 * Math.sin(angle1);
	                var botX = 25 * Math.cos(angle2);
	                var botY = 25 * Math.sin(angle2);
	                var arrowX = 0;
	                var arrowY = 0;
	                arrowX = iMiddleX - topX;
	                arrowY = iMiddleY - topY;
	                var iTextPositionA = 0;
	                var iTextPositionB = 0;
	                if (this.m_iDirection === 0) {
	                    iTextPositionA = -10;
	                    iTextPositionB = -15;
	                } else if (this.m_iDirection === 1) {
	                    iTextPositionA = 10;
	                    iTextPositionB = 10;
	                } else {
	                    iTextPositionA = 10;
	                    iTextPositionB = -15;
	                }
	                if (this.m_iDirection !== 0) {
	                    this.drawArrowLine(0, arrowX, arrowY, iMiddleX, iMiddleY);
	                }
	                self[CONTEXT].strokeStyle = this.m_szDrawColor;
	                self[CONTEXT].font = "8px";
	                self[CONTEXT].strokeText("A", arrowX + iTextPositionA, arrowY + 4);

	                arrowX = iMiddleX - botX;
	                arrowY = iMiddleY - botY;
	                if (this.m_iDirection !== 1) {
	                    this.drawArrowLine(0, arrowX, arrowY, iMiddleX, iMiddleY);
	                }
	                self[CONTEXT].strokeStyle = this.m_szDrawColor;
	                self[CONTEXT].font = "8px";
	                self[CONTEXT].strokeText("B", arrowX + iTextPositionB, arrowY + 4);
	            }
	        }, {
	            key: "drawLineCount",
	            value: function drawLineCount() {
	                this.drawNormalLine();
	                var iMiddleX = (this.m_aPoint[0][0] + this.m_aPoint[1][0]) / 2;
	                var iMiddleY = (this.m_aPoint[0][1] + this.m_aPoint[1][1]) / 2;

	                var angle = Math.atan2(iMiddleY - this.m_aPoint[0][1], iMiddleX - this.m_aPoint[0][0]) * 180 / Math.PI;
	                var angle1 = (angle + 90) * Math.PI / 180;
	                var angle2 = (angle - 90) * Math.PI / 180;
	                var topX = 25 * Math.cos(angle1);
	                var topY = 25 * Math.sin(angle1);
	                var botX = 25 * Math.cos(angle2);
	                var botY = 25 * Math.sin(angle2);
	                var arrowX = 0;
	                var arrowY = 0;
	                arrowX = iMiddleX - topX;
	                arrowY = iMiddleY - topY;
	                if (this.m_iArrowType === 1) {
	                    arrowX = iMiddleX - botX;
	                    arrowY = iMiddleY - botY;
	                    this.drawArrowLine(0, arrowX, arrowY, iMiddleX, iMiddleY);
	                } else if (this.m_iArrowType === 0) {
	                    this.drawArrowLine(0, arrowX, arrowY, iMiddleX, iMiddleY);
	                }
	                this.m_aCrossArrowPoint = [[iMiddleX, iMiddleY], [arrowX, arrowY]];
	            }
	            //线的选中判断

	        }, {
	            key: "inShape",
	            value: function inShape(iPointX, iPointY) {
	                var bRet = false;
	                for (var i = 0, iLen = this.m_aPoint.length - 1; i < iLen; i++) {
	                    var iLineLen = Math.sqrt((this.m_aPoint[i + 1][0] - this.m_aPoint[i][0]) * (this.m_aPoint[i + 1][0] - this.m_aPoint[i][0]) + (this.m_aPoint[i + 1][1] - this.m_aPoint[i][1]) * (this.m_aPoint[i + 1][1] - this.m_aPoint[i][1]));
	                    var iLineLen1 = Math.sqrt((iPointX - this.m_aPoint[i][0]) * (iPointX - this.m_aPoint[i][0]) + (iPointY - this.m_aPoint[i][1]) * (iPointY - this.m_aPoint[i][1]));
	                    var iLineLen2 = Math.sqrt((iPointX - this.m_aPoint[i + 1][0]) * (iPointX - this.m_aPoint[i + 1][0]) + (iPointY - this.m_aPoint[i + 1][1]) * (iPointY - this.m_aPoint[i + 1][1]));
	                    if (iLineLen1 + iLineLen2 - iLineLen < 1) {
	                        bRet = true;
	                    }
	                }
	                return bRet;
	            }
	        }]);

	        return Line;
	    }(Shape);
	    //多边形类


	    var Polygon = function (_Shape5) {
	        _inherits(Polygon, _Shape5);

	        function Polygon() {
	            _classCallCheck(this, Polygon);

	            var _this5 = _possibleConstructorReturn(this, (Polygon.__proto__ || Object.getPrototypeOf(Polygon)).call(this));

	            _this5.m_szType = "Polygon";
	            _this5.m_iPolygonType = 1; //0-矩形， 1-多边形
	            return _this5;
	        }

	        _createClass(Polygon, [{
	            key: "setPointInfo",
	            value: function setPointInfo(aPoint) {
	                if (aPoint !== null && typeof aPoint !== 'undefined') {
	                    if (this.m_iPolygonType === 0) {
	                        var iStartX = aPoint[0][0];
	                        var iStartY = aPoint[0][1];
	                        var iEndX = aPoint[0][0];
	                        var iEndY = aPoint[0][1];
	                        for (var i = 0, iLen = aPoint.length; i < iLen; i++) {
	                            if (iStartX > aPoint[i][0]) {
	                                iStartX = aPoint[i][0];
	                            }
	                            if (iStartY > aPoint[i][1]) {
	                                iStartY = aPoint[i][1];
	                            }
	                            if (iEndX < aPoint[i][0]) {
	                                iEndX = aPoint[i][0];
	                            }
	                            if (iEndY < aPoint[i][1]) {
	                                iEndY = aPoint[i][1];
	                            }
	                        }
	                        this.m_aPoint = [[iStartX, iStartY], [iEndX, iStartY], [iEndX, iEndY], [iStartX, iEndY]];
	                    } else if (this.m_iPolygonType === 1) {
	                        this.m_aPoint = aPoint;
	                    } else {
	                        this.m_aPoint = aPoint;
	                    }
	                    this.setEdgePoints(aPoint);
	                }
	            }
	        }, {
	            key: "draw",
	            value: function draw() {
	                if (this.m_aPoint.length > 0) {
	                    self[CONTEXT].fillStyle = this.m_szFillColor;
	                    self[CONTEXT].strokeStyle = this.m_szDrawColor;
	                    self[CONTEXT].globalAlpha = 1;
	                    var i = 0;
	                    var iLen = 0;
	                    if (this.m_bChoosed) {
	                        for (i = 0, iLen = this.m_aPoint.length; i < iLen; i++) {
	                            self[CONTEXT].beginPath();
	                            self[CONTEXT].arc(this.m_aPoint[i][0], this.m_aPoint[i][1], 3, 0, 360, false);
	                            self[CONTEXT].fillStyle = this.m_szDrawColor;
	                            self[CONTEXT].closePath();
	                            self[CONTEXT].fill();
	                        }
	                    }

	                    self[CONTEXT].beginPath();
	                    self[CONTEXT].moveTo(this.m_aPoint[0][0], this.m_aPoint[0][1]);
	                    for (i = 0, iLen = this.m_aPoint.length; i < iLen; i++) {
	                        if (i !== 0) {
	                            self[CONTEXT].lineTo(this.m_aPoint[i][0], this.m_aPoint[i][1]);
	                        }
	                    }
	                    self[CONTEXT].stroke();
	                    if (this.m_bClosed) {
	                        self[CONTEXT].fillText(this.m_szTips, (this.m_oEdgePoints.left.x + this.m_oEdgePoints.right.x) / 2, (this.m_oEdgePoints.top.y + this.m_oEdgePoints.bottom.y) / 2);
	                        self[CONTEXT].closePath();
	                        self[CONTEXT].stroke();
	                        //填充区域颜色,设置透明度
	                        self[CONTEXT].globalAlpha = this.m_iTranslucent;
	                        self[CONTEXT].fill();
	                    }
	                }
	            }
	        }, {
	            key: "move",
	            value: function move(iMouseMoveX, iMouseMoveY, iMouseDownX, iMouseDownY) {
	                if (this.m_iPolygonType === 1) {
	                    if (this.m_aPoint.length < this.m_iMaxPointNum && this.m_aPoint.length > 0) {
	                        self[CONTEXT].fillStyle = this.m_szFillColor;
	                        self[CONTEXT].strokeStyle = this.m_szDrawColor;
	                        self[CONTEXT].globalAlpha = 1;
	                        var i = 0;
	                        var iLen = 0;
	                        for (i = 0, iLen = this.m_aPoint.length; i < iLen; i++) {
	                            self[CONTEXT].beginPath();
	                            self[CONTEXT].arc(this.m_aPoint[i][0], this.m_aPoint[i][1], 3, 0, 360, false);
	                            self[CONTEXT].fillStyle = this.m_szDrawColor;
	                            self[CONTEXT].closePath();
	                            self[CONTEXT].fill();
	                        }
	                        self[CONTEXT].beginPath();
	                        self[CONTEXT].moveTo(this.m_aPoint[0][0], this.m_aPoint[0][1]);
	                        for (i = 0, iLen = this.m_aPoint.length; i < iLen; i++) {
	                            if (i !== 0) {
	                                self[CONTEXT].lineTo(this.m_aPoint[i][0], this.m_aPoint[i][1]);
	                            }
	                        }
	                        self[CONTEXT].lineTo(iMouseMoveX, iMouseMoveY);
	                        self[CONTEXT].closePath();
	                        self[CONTEXT].stroke();
	                    }
	                } else if (this.m_iPolygonType === 0) {
	                    this.m_bChoosed = true;
	                    var iStartX = iMouseDownX;
	                    var iStartY = iMouseDownY;
	                    var iEndX = iMouseMoveX;
	                    var iEndY = iMouseMoveY;
	                    this.setPointInfo([[iStartX, iStartY], [iEndX, iStartY], [iEndX, iEndY], [iStartX, iEndY]]);
	                    this.draw();
	                }
	            }
	        }, {
	            key: "stretch",
	            value: function stretch(iPointX, iPointY) {
	                if (this.m_iEditType === 0) {
	                    if (this.m_iPolygonType === 1) {
	                        if (this.m_iIndexChoosePoint !== -1) {
	                            this.m_aPoint[this.m_iIndexChoosePoint][0] = iPointX;
	                            this.m_aPoint[this.m_iIndexChoosePoint][1] = iPointY;
	                        }
	                    } else {
	                        if (this.m_iIndexChoosePoint === 0) {
	                            if (iPointX < this.m_aPoint[2][0] && iPointY < this.m_aPoint[2][1]) {
	                                this.m_aPoint[0][0] = iPointX;
	                                this.m_aPoint[0][1] = iPointY;
	                                this.m_aPoint[3][0] = iPointX;
	                                this.m_aPoint[1][1] = iPointY;
	                            }
	                        } else if (this.m_iIndexChoosePoint === 1) {
	                            if (iPointX > this.m_aPoint[3][0] && iPointY < this.m_aPoint[3][1]) {
	                                this.m_aPoint[1][0] = iPointX;
	                                this.m_aPoint[1][1] = iPointY;
	                                this.m_aPoint[2][0] = iPointX;
	                                this.m_aPoint[0][1] = iPointY;
	                            }
	                        } else if (this.m_iIndexChoosePoint === 2) {
	                            if (iPointX > this.m_aPoint[0][0] && iPointY > this.m_aPoint[0][1]) {
	                                this.m_aPoint[2][0] = iPointX;
	                                this.m_aPoint[2][1] = iPointY;
	                                this.m_aPoint[1][0] = iPointX;
	                                this.m_aPoint[3][1] = iPointY;
	                            }
	                        } else if (this.m_iIndexChoosePoint === 3) {
	                            if (iPointX < this.m_aPoint[1][0] && iPointY > this.m_aPoint[1][1]) {
	                                this.m_aPoint[3][0] = iPointX;
	                                this.m_aPoint[3][1] = iPointY;
	                                this.m_aPoint[0][0] = iPointX;
	                                this.m_aPoint[2][1] = iPointY;
	                            }
	                        }
	                    }
	                    this.setPointInfo(this.m_aPoint);
	                    redraw();
	                }
	            }
	        }]);

	        return Polygon;
	    }(Shape);

	    //绘图库类


	    var DrawCanvas = function () {
	        function DrawCanvas(szCanvasId) {
	            _classCallCheck(this, DrawCanvas);

	            self = this;
	            this[CANVAS] = (0, _jquery2.default)("#" + szCanvasId); //获取画布对象
	            this[CONTEXT] = this[CANVAS][0].getContext("2d"); //获取画布上下文
	            this[SHAPES] = []; //画布上的图形列表
	            this[DRAWSTATUS] = false; //是否开启手动绘制
	            this[SHAPETYPE] = "Rect"; //图形类型
	            this[MAXSHAPENUMSUPPORT] = 10;
	            this[DRAWSHAPEMULTIONETIME] = true; //一次是否可绘制多个
	            this[CURRENTSHAPEINFO] = {}; //当前图形信息，用于绘制当前图形
	            this[EVENTCALLBACK] = null;

	            this[SHAPESTYLE] = {
	                szDrawColor: "#ff0000",
	                szFillColor: "#343434",
	                iTranslucent: 0.7
	            };
	            this[POLYGONDRAWING] = false; //是否正在绘制多边形
	            this.m_iCanvasWidth = this[CANVAS].width(); //画布宽
	            this.m_iCanvasHeight = this[CANVAS].height(); //画布高
	            this.m_iHorizontalResolution = 0; //视频分辨率
	            this.m_iVerticalResolution = 0; //视频分辨率
	            this.m_szDisplayMode = ""; //视频显示模式
	            this.m_szVideoFormat = ""; //视频制式

	            initEvent(); //事件初始化
	            this[SHAPES].length = 0; //图形列表清空
	        }

	        _createClass(DrawCanvas, [{
	            key: "setDrawMutiShapeOneTime",
	            value: function setDrawMutiShapeOneTime(bDrawMuti) {
	                this[DRAWSHAPEMULTIONETIME] = bDrawMuti;
	            }
	            //设置最大绘制图形个数

	        }, {
	            key: "setMaxShapeSupport",
	            value: function setMaxShapeSupport(iMax) {
	                this[MAXSHAPENUMSUPPORT] = iMax;
	            }
	        }, {
	            key: "getMaxShapeSupport",
	            value: function getMaxShapeSupport() {
	                return this[MAXSHAPENUMSUPPORT];
	            }
	            //是否开启绘制

	        }, {
	            key: "setDrawStatus",
	            value: function setDrawStatus(bDrawStatus, cbCallback) {
	                this[DRAWSTATUS] = bDrawStatus;
	                if (cbCallback && bDrawStatus) {
	                    this[EVENTCALLBACK] = cbCallback;
	                }
	                if (!bDrawStatus) {
                        this[EVENTCALLBACK] = null;
                        // var DRAWCANVAS = Symbol("DRAWCANVAS"); //视频叠加绘制画布
                        // this[DRAWCANVAS].setDrawStatus(bDrawStatus);
	                }
	            }
	            //设置绘图类型

	        }, {
	            key: "setShapeType",
	            value: function setShapeType(szType) {
	                this[SHAPETYPE] = szType;
	                redraw();
	                /*if (szType === "Grid" || szType === "RectOSD") {  //栅格式移动侦测区域绘制不可和其他图形一起绘制
	                    this[SHAPES].length = 0;
	                    redraw();
	                }*/
	            }
	        }, {
	            key: "setCurrentShapeInfo",
	            value: function setCurrentShapeInfo(oShapeInfo) {
	                this[CURRENTSHAPEINFO] = oShapeInfo || {
	                    szId: "",
	                    szTips: "",
	                    iMinClosed: 3,
	                    iMaxPointNum: 11,
	                    iPolygonType: 1
	                };
	            }
	        }, {
	            key: "getShapeType",
	            value: function getShapeType() {
	                return this[SHAPETYPE];
	            }
	            //获取所有图形信息

	        }, {
	            key: "getAllShapesInfo",
	            value: function getAllShapesInfo() {
	                var aShape = [];
	                for (var i = 0, iLen = this[SHAPES].length; i < iLen; i++) {
	                    if (this[SHAPES][i].m_szType === "Grid") {
	                        aShape.push({
	                            szType: this[SHAPES][i].m_szType,
	                            szGridMap: this[SHAPES][i].m_szGridMap,
	                            iGridColNum: this[SHAPES][i].m_iGridColNum,
	                            iGridRowNum: this[SHAPES][i].m_iGridRowNum
	                        });
	                    } else if (this[SHAPES][i].m_szType === "RectOSD") {
	                        aShape.push({
	                            szType: this[SHAPES][i].m_szType,
	                            szText: this[SHAPES][i].m_szText,
	                            szEnabled: this[SHAPES][i].m_szEnabled,
	                            szOSDType: this[SHAPES][i].m_szOSDType,
	                            iPositionX: this[SHAPES][i].m_aPoint[0][0],
	                            iPositionY: this[SHAPES][i].m_aPoint[0][1],
	                            szDateStyle: this[SHAPES][i].m_szDateStyle,
	                            szClockType: this[SHAPES][i].m_szClockType,
	                            szDisplayWeek: this[SHAPES][i].m_szDisplayWeek,
	                            szId: this[SHAPES][i].m_szId
	                        });
	                    } else {
	                        aShape.push({
	                            szType: this[SHAPES][i].m_szType,
	                            aPoint: this[SHAPES][i].m_aPoint,
	                            szId: this[SHAPES][i].m_szId
	                        });
	                    }
	                }
	                return aShape;
	            }
	            //根据类型获取图形信息

	        }, {
	            key: "getShapesInfoByType",
	            value: function getShapesInfoByType(szType) {
	                var aShape = [];
	                for (var i = 0, iLen = this[SHAPES].length; i < iLen; i++) {
	                    if (this[SHAPES][i].m_szType === szType) {
	                        if (this[SHAPES][i].m_szType === "Grid") {
	                            aShape.push({
	                                szType: this[SHAPES][i].m_szType,
	                                szGridMap: this[SHAPES][i].m_szGridMap,
	                                iGridColNum: this[SHAPES][i].m_iGridColNum,
	                                iGridRowNum: this[SHAPES][i].m_iGridRowNum
	                            });
	                        } else if (this[SHAPES][i].m_szType === "RectOSD") {
	                            aShape.push({
	                                szType: this[SHAPES][i].m_szType,
	                                szText: this[SHAPES][i].m_szText,
	                                szEnabled: this[SHAPES][i].m_szEnabled,
	                                szOSDType: this[SHAPES][i].m_szOSDType,
	                                iPositionX: this[SHAPES][i].m_aPoint[0][0],
	                                iPositionY: this[SHAPES][i].m_aPoint[0][1],
	                                szDateStyle: this[SHAPES][i].m_szDateStyle,
	                                szClockType: this[SHAPES][i].m_szClockType,
	                                szDisplayWeek: this[SHAPES][i].m_szDisplayWeek,
	                                szId: this[SHAPES][i].m_szId
	                            });
	                        } else if (szType === "Polygon") {
	                            aShape.push({
	                                szType: this[SHAPES][i].m_szType,
	                                szId: this[SHAPES][i].m_szId,
	                                iPolygonType: this[SHAPES][i].m_iPolygonType,
	                                iMinClosed: this[SHAPES][i].m_iMinClosed,
	                                iMaxPointNum: this[SHAPES][i].m_iMaxPointNum,
	                                iEditType: this[SHAPES][i].m_iEditType,
	                                aPoint: this[SHAPES][i].m_aPoint,
	                                bClosed: this[SHAPES][i].m_bClosed,
	                                szTips: this[SHAPES][i].m_szTips,
	                                szDrawColor: this[SHAPES][i].m_szDrawColor,
	                                szFillColor: this[SHAPES][i].m_szFillColor,
	                                iTranslucent: this[SHAPES][i].m_iTranslucent
	                            });
	                        } else if (szType === "Line") {
	                            aShape.push({
	                                szType: this[SHAPES][i].m_szType,
	                                szId: this[SHAPES][i].m_szId,
	                                aPoint: this[SHAPES][i].m_aPoint,
	                                szTips: this[SHAPES][i].m_szTips,
	                                iLineType: this[SHAPES][i].m_iLineType,
	                                iDirection: this[SHAPES][i].m_iDirection,
	                                iArrowType: this[SHAPES][i].m_iArrowType,
	                                szDrawColor: this[SHAPES][i].m_szDrawColor,
	                                aCrossArrowPoint: this[SHAPES][i].m_aCrossArrowPoint
	                            });
	                        } else if (szType === "Rect") {
	                            aShape.push({
	                                szType: this[SHAPES][i].m_szType,
	                                iEditType: this[SHAPES][i].m_iEditType,
	                                aPoint: this[SHAPES][i].m_aPoint,
	                                szTips: this[SHAPES][i].m_szTips,
	                                szDrawColor: this[SHAPES][i].m_szDrawColor,
	                                szFillColor: this[SHAPES][i].m_szFillColor,
	                                iTranslucent: this[SHAPES][i].m_iTranslucent
	                            });
	                        } else {
	                            aShape.push({
	                                szType: this[SHAPES][i].m_szType,
	                                aPoint: this[SHAPES][i].m_aPoint
	                            });
	                        }
	                    }
	                }
	                return aShape;
	            }
	            //根据类型获取图形信息

	        }, {
	            key: "setShapesInfoByType",
	            value: function setShapesInfoByType(szType, aShapesInfo) {
	                if (!aShapesInfo) {
	                    aShapesInfo = [];
	                }
	                var oShape = null;
	                if (szType === "Rect" || szType === "Polygon" || szType === "Line") {
	                    for (var i = 0, iLen = aShapesInfo.length; i < iLen; i++) {
	                        if (szType === "Rect") {
	                            oShape = new Rect();
	                            oShape.m_iEditType = aShapesInfo[i].iEditType;
	                            oShape.m_szTips = aShapesInfo[i].szTips;
	                            if (aShapesInfo[i].style) {
	                                oShape.m_szDrawColor = aShapesInfo[i].style.szDrawColor;
	                                oShape.m_szFillColor = aShapesInfo[i].style.szFillColor;
	                                oShape.m_iTranslucent = aShapesInfo[i].style.iTranslucent;
	                            }
	                        } else if (szType === "Polygon") {
	                            oShape = new Polygon();
	                            if (aShapesInfo[i].iPolygonType === 0) {
	                                oShape.m_bClosed = true;
	                            } else {
	                                oShape.m_bClosed = aShapesInfo[i].bClosed;
	                            }
	                            oShape.m_szTips = aShapesInfo[i].szTips;
	                            oShape.m_szId = aShapesInfo[i].szId || "";
	                            oShape.m_iPolygonType = aShapesInfo[i].iPolygonType;
	                            oShape.m_iMinClosed = aShapesInfo[i].iMinClosed || 3;
	                            oShape.m_iMaxPointNum = aShapesInfo[i].iMaxPointNum || 11;
	                            oShape.m_iEditType = aShapesInfo[i].iEditType;
	                            if (aShapesInfo[i].style) {
	                                oShape.m_szDrawColor = aShapesInfo[i].style.szDrawColor;
	                                oShape.m_szFillColor = aShapesInfo[i].style.szFillColor;
	                                oShape.m_iTranslucent = aShapesInfo[i].style.iTranslucent;
	                            }
	                        } else if (szType === "Line") {
	                            oShape = new Line();
	                            oShape.m_iLineType = aShapesInfo[i].iLineType;
	                            oShape.m_szTips = aShapesInfo[i].szTips;
	                            oShape.m_szId = aShapesInfo[i].szId;
	                            oShape.m_iDirection = aShapesInfo[i].iDirection;
	                            oShape.m_iArrowType = aShapesInfo[i].iArrowType;
	                            if (aShapesInfo[i].style) {
	                                oShape.m_szDrawColor = aShapesInfo[i].style.szDrawColor;
	                            }
	                            oShape.setPointInfo(aShapesInfo[i].aPoint);
	                        }
	                        oShape.setPointInfo(aShapesInfo[i].aPoint);
	                        if (i === 0) {
	                            oShape.m_bChoosed = true; //默认选中第一个图形
	                        }
	                        addShape(oShape);
	                    }
	                } else if (szType === "Grid") {
	                    oShape = new MotionGrid();
	                    oShape.m_szGridMap = aShapesInfo[0].szGridMap || "";
	                    oShape.m_iGridColNum = aShapesInfo[0].iGridColNum || 22;
	                    oShape.m_iGridRowNum = aShapesInfo[0].iGridRowNum || 18;
	                    addShape(oShape);
	                }
	                redraw();
	            }
	            //添加单条OSD

	        }, {
	            key: "addOSDShape",
	            value: function addOSDShape(szText, szEnabled, iStartX, iStartY, oExtend) {
	                if (!iStartX && !iStartY) {
	                    iStartX = 0;
	                    iStartY = 0;
	                }
	                if (!oExtend) {
	                    oExtend = {};
	                }
	                var oRectOSD = new RectOSD(szText, szEnabled);
	                var iWidth = szText.length * 10;
	                oRectOSD.m_aPoint = [[iStartX, iStartY], [iWidth + iStartX, iStartY], [iWidth + iStartX, iStartY + 20], [iStartX, iStartY + 20]];
	                oRectOSD.m_szOSDType = oExtend.szOSDType || "";
	                oRectOSD.m_szDateStyle = oExtend.szDateStyle || "";
	                oRectOSD.m_szClockType = oExtend.szClockType || "";
	                oRectOSD.m_szDisplayWeek = oExtend.szDisplayWeek || "";
	                oRectOSD.m_szId = oExtend.szId || "";
	                addShape(oRectOSD);
	                redraw();
	            }
	            //设置画布宽高

	        }, {
	            key: "setCanvasSize",
	            value: function setCanvasSize(iWidth, iHeight) {
	                if (iWidth > 0 && iHeight > 0) {
	                    this.m_iCanvasWidth = iWidth;
	                    this.m_iCanvasHeight = iHeight;
	                    redraw();
	                }
	            }
	            //设置图形样式

	        }, {
	            key: "setDrawStyle",
	            value: function setDrawStyle(szBorderColor, szFillColor, iTranslucent) {
	                this[SHAPESTYLE] = {
	                    szDrawColor: szBorderColor,
	                    szFillColor: szFillColor,
	                    iTranslucent: iTranslucent
	                };
	            }
	            //清除所有图形

	        }, {
	            key: "clearAllShape",
	            value: function clearAllShape() {
	                this[SHAPES].length = 0;
	                redraw();
	            }
	            //根据类型清除图形

	        }, {
	            key: "clearShapeByType",
	            value: function clearShapeByType(szType) {
	                var iLen = this[SHAPES].length;
	                for (var i = iLen; i > 0; i--) {
	                    if (this[SHAPES][i - 1].m_szType === szType) {
	                        if (szType === "Grid") {
	                            this[SHAPES][i - 1].m_szGridMap = "";
	                            this[SHAPES][i - 1].m_aAddGridMap = [];
	                        } else {
	                            this[SHAPES].splice(i - 1, 1);
	                        }
	                    }
	                }
	                redraw();
	            }
	            //删除单个图形

	        }, {
	            key: "deleteShape",
	            value: function deleteShape(iShapeIndex) {
	                if (this[SHAPES].length > iShapeIndex) {
	                    this[SHAPES].splice(iShapeIndex, 1);
	                }
	                redraw();
	            }
	        }, {
	            key: "updateCanvas",
	            value: function updateCanvas(szCanvasId) {
	                this[CANVAS] = (0, _jquery2.default)("#" + szCanvasId); //获取画布对象
	                this[CONTEXT] = this[CANVAS][0].getContext("2d"); //获取画布上下文
	                this.m_iCanvasWidth = this[CANVAS].width(); //画布宽
	                this.m_iCanvasHeight = this[CANVAS].height(); //画布高
	                initEvent(); //事件初始化
	            }
	        }, {
	            key: "resizeCanvas",
	            value: function resizeCanvas() {
	                this.m_iCanvasWidth = this[CANVAS].width(); //画布宽
	                this.m_iCanvasHeight = this[CANVAS].height(); //画布高
	            }
	        }, {
	            key: "canvasRedraw",
	            value: function canvasRedraw() {
	                redraw();
	            }
	        }]);

	        return DrawCanvas;
	    }();

	    return DrawCanvas;
	}();
	exports.ESCanvas = ESCanvas;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module) {"use strict";

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	/*!
	 * jQuery JavaScript Library v3.2.1
	 * https://jquery.com/
	 *
	 * Includes Sizzle.js
	 * https://sizzlejs.com/
	 *
	 * Copyright JS Foundation and other contributors
	 * Released under the MIT license
	 * https://jquery.org/license
	 *
	 * Date: 2017-03-20T18:59Z
	 */
	(function (global, factory) {

		"use strict";

		if (( false ? "undefined" : _typeof(module)) === "object" && _typeof(module.exports) === "object") {

			// For CommonJS and CommonJS-like environments where a proper `window`
			// is present, execute the factory and get jQuery.
			// For environments that do not have a `window` with a `document`
			// (such as Node.js), expose a factory as module.exports.
			// This accentuates the need for the creation of a real `window`.
			// e.g. var jQuery = require("jquery")(window);
			// See ticket #14549 for more info.
			module.exports = global.document ? factory(global, true) : function (w) {
				if (!w.document) {
					throw new Error("jQuery requires a window with a document");
				}
				return factory(w);
			};
		} else {
			factory(global);
		}

		// Pass this if window is not defined yet
	})(typeof window !== "undefined" ? window : undefined, function (window, noGlobal) {

		// Edge <= 12 - 13+, Firefox <=18 - 45+, IE 10 - 11, Safari 5.1 - 9+, iOS 6 - 9.1
		// throw exceptions when non-strict code (e.g., ASP.NET 4.5) accesses strict mode
		// arguments.callee.caller (trac-13335). But as of jQuery 3.0 (2016), strict mode should be common
		// enough that all such attempts are guarded in a try block.
		"use strict";

		var arr = [];

		var document = window.document;

		var getProto = Object.getPrototypeOf;

		var _slice = arr.slice;

		var concat = arr.concat;

		var push = arr.push;

		var indexOf = arr.indexOf;

		var class2type = {};

		var toString = class2type.toString;

		var hasOwn = class2type.hasOwnProperty;

		var fnToString = hasOwn.toString;

		var ObjectFunctionString = fnToString.call(Object);

		var support = {};

		function DOMEval(code, doc) {
			doc = doc || document;

			var script = doc.createElement("script");

			script.text = code;
			doc.head.appendChild(script).parentNode.removeChild(script);
		}
		/* global Symbol */
		// Defining this global in .eslintrc.json would create a danger of using the global
		// unguarded in another place, it seems safer to define global only for this module


		var version = "3.2.1",


		// Define a local copy of jQuery
		jQuery = function jQuery(selector, context) {

			// The jQuery object is actually just the init constructor 'enhanced'
			// Need init if jQuery is called (just allow error to be thrown if not included)
			return new jQuery.fn.init(selector, context);
		},


		// Support: Android <=4.0 only
		// Make sure we trim BOM and NBSP
		rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,


		// Matches dashed string for camelizing
		rmsPrefix = /^-ms-/,
		    rdashAlpha = /-([a-z])/g,


		// Used by jQuery.camelCase as callback to replace()
		fcamelCase = function fcamelCase(all, letter) {
			return letter.toUpperCase();
		};

		jQuery.fn = jQuery.prototype = {

			// The current version of jQuery being used
			jquery: version,

			constructor: jQuery,

			// The default length of a jQuery object is 0
			length: 0,

			toArray: function toArray() {
				return _slice.call(this);
			},

			// Get the Nth element in the matched element set OR
			// Get the whole matched element set as a clean array
			get: function get(num) {

				// Return all the elements in a clean array
				if (num == null) {
					return _slice.call(this);
				}

				// Return just the one element from the set
				return num < 0 ? this[num + this.length] : this[num];
			},

			// Take an array of elements and push it onto the stack
			// (returning the new matched element set)
			pushStack: function pushStack(elems) {

				// Build a new jQuery matched element set
				var ret = jQuery.merge(this.constructor(), elems);

				// Add the old object onto the stack (as a reference)
				ret.prevObject = this;

				// Return the newly-formed element set
				return ret;
			},

			// Execute a callback for every element in the matched set.
			each: function each(callback) {
				return jQuery.each(this, callback);
			},

			map: function map(callback) {
				return this.pushStack(jQuery.map(this, function (elem, i) {
					return callback.call(elem, i, elem);
				}));
			},

			slice: function slice() {
				return this.pushStack(_slice.apply(this, arguments));
			},

			first: function first() {
				return this.eq(0);
			},

			last: function last() {
				return this.eq(-1);
			},

			eq: function eq(i) {
				var len = this.length,
				    j = +i + (i < 0 ? len : 0);
				return this.pushStack(j >= 0 && j < len ? [this[j]] : []);
			},

			end: function end() {
				return this.prevObject || this.constructor();
			},

			// For internal use only.
			// Behaves like an Array's method, not like a jQuery method.
			push: push,
			sort: arr.sort,
			splice: arr.splice
		};

		jQuery.extend = jQuery.fn.extend = function () {
			var options,
			    name,
			    src,
			    copy,
			    copyIsArray,
			    clone,
			    target = arguments[0] || {},
			    i = 1,
			    length = arguments.length,
			    deep = false;

			// Handle a deep copy situation
			if (typeof target === "boolean") {
				deep = target;

				// Skip the boolean and the target
				target = arguments[i] || {};
				i++;
			}

			// Handle case when target is a string or something (possible in deep copy)
			if ((typeof target === "undefined" ? "undefined" : _typeof(target)) !== "object" && !jQuery.isFunction(target)) {
				target = {};
			}

			// Extend jQuery itself if only one argument is passed
			if (i === length) {
				target = this;
				i--;
			}

			for (; i < length; i++) {

				// Only deal with non-null/undefined values
				if ((options = arguments[i]) != null) {

					// Extend the base object
					for (name in options) {
						src = target[name];
						copy = options[name];

						// Prevent never-ending loop
						if (target === copy) {
							continue;
						}

						// Recurse if we're merging plain objects or arrays
						if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {

							if (copyIsArray) {
								copyIsArray = false;
								clone = src && Array.isArray(src) ? src : [];
							} else {
								clone = src && jQuery.isPlainObject(src) ? src : {};
							}

							// Never move original objects, clone them
							target[name] = jQuery.extend(deep, clone, copy);

							// Don't bring in undefined values
						} else if (copy !== undefined) {
							target[name] = copy;
						}
					}
				}
			}

			// Return the modified object
			return target;
		};

		jQuery.extend({

			// Unique for each copy of jQuery on the page
			expando: "jQuery" + (version + Math.random()).replace(/\D/g, ""),

			// Assume jQuery is ready without the ready module
			isReady: true,

			error: function error(msg) {
				throw new Error(msg);
			},

			noop: function noop() {},

			isFunction: function isFunction(obj) {
				return jQuery.type(obj) === "function";
			},

			isWindow: function isWindow(obj) {
				return obj != null && obj === obj.window;
			},

			isNumeric: function isNumeric(obj) {

				// As of jQuery 3.0, isNumeric is limited to
				// strings and numbers (primitives or objects)
				// that can be coerced to finite numbers (gh-2662)
				var type = jQuery.type(obj);
				return (type === "number" || type === "string") &&

				// parseFloat NaNs numeric-cast false positives ("")
				// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
				// subtraction forces infinities to NaN
				!isNaN(obj - parseFloat(obj));
			},

			isPlainObject: function isPlainObject(obj) {
				var proto, Ctor;

				// Detect obvious negatives
				// Use toString instead of jQuery.type to catch host objects
				if (!obj || toString.call(obj) !== "[object Object]") {
					return false;
				}

				proto = getProto(obj);

				// Objects with no prototype (e.g., `Object.create( null )`) are plain
				if (!proto) {
					return true;
				}

				// Objects with prototype are plain iff they were constructed by a global Object function
				Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
				return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
			},

			isEmptyObject: function isEmptyObject(obj) {

				/* eslint-disable no-unused-vars */
				// See https://github.com/eslint/eslint/issues/6125
				var name;

				for (name in obj) {
					return false;
				}
				return true;
			},

			type: function type(obj) {
				if (obj == null) {
					return obj + "";
				}

				// Support: Android <=2.3 only (functionish RegExp)
				return (typeof obj === "undefined" ? "undefined" : _typeof(obj)) === "object" || typeof obj === "function" ? class2type[toString.call(obj)] || "object" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
			},

			// Evaluates a script in a global context
			globalEval: function globalEval(code) {
				DOMEval(code);
			},

			// Convert dashed to camelCase; used by the css and data modules
			// Support: IE <=9 - 11, Edge 12 - 13
			// Microsoft forgot to hump their vendor prefix (#9572)
			camelCase: function camelCase(string) {
				return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
			},

			each: function each(obj, callback) {
				var length,
				    i = 0;

				if (isArrayLike(obj)) {
					length = obj.length;
					for (; i < length; i++) {
						if (callback.call(obj[i], i, obj[i]) === false) {
							break;
						}
					}
				} else {
					for (i in obj) {
						if (callback.call(obj[i], i, obj[i]) === false) {
							break;
						}
					}
				}

				return obj;
			},

			// Support: Android <=4.0 only
			trim: function trim(text) {
				return text == null ? "" : (text + "").replace(rtrim, "");
			},

			// results is for internal usage only
			makeArray: function makeArray(arr, results) {
				var ret = results || [];

				if (arr != null) {
					if (isArrayLike(Object(arr))) {
						jQuery.merge(ret, typeof arr === "string" ? [arr] : arr);
					} else {
						push.call(ret, arr);
					}
				}

				return ret;
			},

			inArray: function inArray(elem, arr, i) {
				return arr == null ? -1 : indexOf.call(arr, elem, i);
			},

			// Support: Android <=4.0 only, PhantomJS 1 only
			// push.apply(_, arraylike) throws on ancient WebKit
			merge: function merge(first, second) {
				var len = +second.length,
				    j = 0,
				    i = first.length;

				for (; j < len; j++) {
					first[i++] = second[j];
				}

				first.length = i;

				return first;
			},

			grep: function grep(elems, callback, invert) {
				var callbackInverse,
				    matches = [],
				    i = 0,
				    length = elems.length,
				    callbackExpect = !invert;

				// Go through the array, only saving the items
				// that pass the validator function
				for (; i < length; i++) {
					callbackInverse = !callback(elems[i], i);
					if (callbackInverse !== callbackExpect) {
						matches.push(elems[i]);
					}
				}

				return matches;
			},

			// arg is for internal usage only
			map: function map(elems, callback, arg) {
				var length,
				    value,
				    i = 0,
				    ret = [];

				// Go through the array, translating each of the items to their new values
				if (isArrayLike(elems)) {
					length = elems.length;
					for (; i < length; i++) {
						value = callback(elems[i], i, arg);

						if (value != null) {
							ret.push(value);
						}
					}

					// Go through every key on the object,
				} else {
					for (i in elems) {
						value = callback(elems[i], i, arg);

						if (value != null) {
							ret.push(value);
						}
					}
				}

				// Flatten any nested arrays
				return concat.apply([], ret);
			},

			// A global GUID counter for objects
			guid: 1,

			// Bind a function to a context, optionally partially applying any
			// arguments.
			proxy: function proxy(fn, context) {
				var tmp, args, proxy;

				if (typeof context === "string") {
					tmp = fn[context];
					context = fn;
					fn = tmp;
				}

				// Quick check to determine if target is callable, in the spec
				// this throws a TypeError, but we will just return undefined.
				if (!jQuery.isFunction(fn)) {
					return undefined;
				}

				// Simulated bind
				args = _slice.call(arguments, 2);
				proxy = function proxy() {
					return fn.apply(context || this, args.concat(_slice.call(arguments)));
				};

				// Set the guid of unique handler to the same of original handler, so it can be removed
				proxy.guid = fn.guid = fn.guid || jQuery.guid++;

				return proxy;
			},

			now: Date.now,

			// jQuery.support is not used in Core but other projects attach their
			// properties to it so it needs to exist.
			support: support
		});

		if (typeof Symbol === "function") {
			jQuery.fn[Symbol.iterator] = arr[Symbol.iterator];
		}

		// Populate the class2type map
		jQuery.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "), function (i, name) {
			class2type["[object " + name + "]"] = name.toLowerCase();
		});

		function isArrayLike(obj) {

			// Support: real iOS 8.2 only (not reproducible in simulator)
			// `in` check used to prevent JIT error (gh-2145)
			// hasOwn isn't used here due to false negatives
			// regarding Nodelist length in IE
			var length = !!obj && "length" in obj && obj.length,
			    type = jQuery.type(obj);

			if (type === "function" || jQuery.isWindow(obj)) {
				return false;
			}

			return type === "array" || length === 0 || typeof length === "number" && length > 0 && length - 1 in obj;
		}
		var Sizzle =
		/*!
	  * Sizzle CSS Selector Engine v2.3.3
	  * https://sizzlejs.com/
	  *
	  * Copyright jQuery Foundation and other contributors
	  * Released under the MIT license
	  * http://jquery.org/license
	  *
	  * Date: 2016-08-08
	  */
		function (window) {

			var i,
			    support,
			    Expr,
			    getText,
			    isXML,
			    tokenize,
			    compile,
			    select,
			    outermostContext,
			    sortInput,
			    hasDuplicate,


			// Local document vars
			setDocument,
			    document,
			    docElem,
			    documentIsHTML,
			    rbuggyQSA,
			    rbuggyMatches,
			    matches,
			    contains,


			// Instance-specific data
			expando = "sizzle" + 1 * new Date(),
			    preferredDoc = window.document,
			    dirruns = 0,
			    done = 0,
			    classCache = createCache(),
			    tokenCache = createCache(),
			    compilerCache = createCache(),
			    sortOrder = function sortOrder(a, b) {
				if (a === b) {
					hasDuplicate = true;
				}
				return 0;
			},


			// Instance methods
			hasOwn = {}.hasOwnProperty,
			    arr = [],
			    pop = arr.pop,
			    push_native = arr.push,
			    push = arr.push,
			    slice = arr.slice,


			// Use a stripped-down indexOf as it's faster than native
			// https://jsperf.com/thor-indexof-vs-for/5
			indexOf = function indexOf(list, elem) {
				var i = 0,
				    len = list.length;
				for (; i < len; i++) {
					if (list[i] === elem) {
						return i;
					}
				}
				return -1;
			},
			    booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",


			// Regular expressions

			// http://www.w3.org/TR/css3-selectors/#whitespace
			whitespace = "[\\x20\\t\\r\\n\\f]",


			// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
			identifier = "(?:\\\\.|[\\w-]|[^\0-\\xa0])+",


			// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
			attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
			// Operator (capture 2)
			"*([*^$|!~]?=)" + whitespace +
			// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
			"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace + "*\\]",
			    pseudos = ":(" + identifier + ")(?:\\((" +
			// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
			// 1. quoted (capture 3; capture 4 or capture 5)
			"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
			// 2. simple (capture 6)
			"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
			// 3. anything else (capture 2)
			".*" + ")\\)|)",


			// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
			rwhitespace = new RegExp(whitespace + "+", "g"),
			    rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g"),
			    rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*"),
			    rcombinators = new RegExp("^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*"),
			    rattributeQuotes = new RegExp("=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g"),
			    rpseudo = new RegExp(pseudos),
			    ridentifier = new RegExp("^" + identifier + "$"),
			    matchExpr = {
				"ID": new RegExp("^#(" + identifier + ")"),
				"CLASS": new RegExp("^\\.(" + identifier + ")"),
				"TAG": new RegExp("^(" + identifier + "|[*])"),
				"ATTR": new RegExp("^" + attributes),
				"PSEUDO": new RegExp("^" + pseudos),
				"CHILD": new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i"),
				"bool": new RegExp("^(?:" + booleans + ")$", "i"),
				// For use in libraries implementing .is()
				// We use this for POS matching in `select`
				"needsContext": new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i")
			},
			    rinputs = /^(?:input|select|textarea|button)$/i,
			    rheader = /^h\d$/i,
			    rnative = /^[^{]+\{\s*\[native \w/,


			// Easily-parseable/retrievable ID or TAG or CLASS selectors
			rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
			    rsibling = /[+~]/,


			// CSS escapes
			// http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
			runescape = new RegExp("\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig"),
			    funescape = function funescape(_, escaped, escapedWhitespace) {
				var high = "0x" + escaped - 0x10000;
				// NaN means non-codepoint
				// Support: Firefox<24
				// Workaround erroneous numeric interpretation of +"0x"
				return high !== high || escapedWhitespace ? escaped : high < 0 ?
				// BMP codepoint
				String.fromCharCode(high + 0x10000) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
			},


			// CSS string/identifier serialization
			// https://drafts.csswg.org/cssom/#common-serializing-idioms
			rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,
			    fcssescape = function fcssescape(ch, asCodePoint) {
				if (asCodePoint) {

					// U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
					if (ch === "\0") {
						return "\uFFFD";
					}

					// Control characters and (dependent upon position) numbers get escaped as code points
					return ch.slice(0, -1) + "\\" + ch.charCodeAt(ch.length - 1).toString(16) + " ";
				}

				// Other potentially-special ASCII characters get backslash-escaped
				return "\\" + ch;
			},


			// Used for iframes
			// See setDocument()
			// Removing the function wrapper causes a "Permission Denied"
			// error in IE
			unloadHandler = function unloadHandler() {
				setDocument();
			},
			    disabledAncestor = addCombinator(function (elem) {
				return elem.disabled === true && ("form" in elem || "label" in elem);
			}, { dir: "parentNode", next: "legend" });

			// Optimize for push.apply( _, NodeList )
			try {
				push.apply(arr = slice.call(preferredDoc.childNodes), preferredDoc.childNodes);
				// Support: Android<4.0
				// Detect silently failing push.apply
				arr[preferredDoc.childNodes.length].nodeType;
			} catch (e) {
				push = { apply: arr.length ?

					// Leverage slice if possible
					function (target, els) {
						push_native.apply(target, slice.call(els));
					} :

					// Support: IE<9
					// Otherwise append directly
					function (target, els) {
						var j = target.length,
						    i = 0;
						// Can't trust NodeList.length
						while (target[j++] = els[i++]) {}
						target.length = j - 1;
					}
				};
			}

			function Sizzle(selector, context, results, seed) {
				var m,
				    i,
				    elem,
				    nid,
				    match,
				    groups,
				    newSelector,
				    newContext = context && context.ownerDocument,


				// nodeType defaults to 9, since context defaults to document
				nodeType = context ? context.nodeType : 9;

				results = results || [];

				// Return early from calls with invalid selector or context
				if (typeof selector !== "string" || !selector || nodeType !== 1 && nodeType !== 9 && nodeType !== 11) {

					return results;
				}

				// Try to shortcut find operations (as opposed to filters) in HTML documents
				if (!seed) {

					if ((context ? context.ownerDocument || context : preferredDoc) !== document) {
						setDocument(context);
					}
					context = context || document;

					if (documentIsHTML) {

						// If the selector is sufficiently simple, try using a "get*By*" DOM method
						// (excepting DocumentFragment context, where the methods don't exist)
						if (nodeType !== 11 && (match = rquickExpr.exec(selector))) {

							// ID selector
							if (m = match[1]) {

								// Document context
								if (nodeType === 9) {
									if (elem = context.getElementById(m)) {

										// Support: IE, Opera, Webkit
										// TODO: identify versions
										// getElementById can match elements by name instead of ID
										if (elem.id === m) {
											results.push(elem);
											return results;
										}
									} else {
										return results;
									}

									// Element context
								} else {

									// Support: IE, Opera, Webkit
									// TODO: identify versions
									// getElementById can match elements by name instead of ID
									if (newContext && (elem = newContext.getElementById(m)) && contains(context, elem) && elem.id === m) {

										results.push(elem);
										return results;
									}
								}

								// Type selector
							} else if (match[2]) {
								push.apply(results, context.getElementsByTagName(selector));
								return results;

								// Class selector
							} else if ((m = match[3]) && support.getElementsByClassName && context.getElementsByClassName) {

								push.apply(results, context.getElementsByClassName(m));
								return results;
							}
						}

						// Take advantage of querySelectorAll
						if (support.qsa && !compilerCache[selector + " "] && (!rbuggyQSA || !rbuggyQSA.test(selector))) {

							if (nodeType !== 1) {
								newContext = context;
								newSelector = selector;

								// qSA looks outside Element context, which is not what we want
								// Thanks to Andrew Dupont for this workaround technique
								// Support: IE <=8
								// Exclude object elements
							} else if (context.nodeName.toLowerCase() !== "object") {

								// Capture the context ID, setting it first if necessary
								if (nid = context.getAttribute("id")) {
									nid = nid.replace(rcssescape, fcssescape);
								} else {
									context.setAttribute("id", nid = expando);
								}

								// Prefix every selector in the list
								groups = tokenize(selector);
								i = groups.length;
								while (i--) {
									groups[i] = "#" + nid + " " + toSelector(groups[i]);
								}
								newSelector = groups.join(",");

								// Expand context for sibling selectors
								newContext = rsibling.test(selector) && testContext(context.parentNode) || context;
							}

							if (newSelector) {
								try {
									push.apply(results, newContext.querySelectorAll(newSelector));
									return results;
								} catch (qsaError) {} finally {
									if (nid === expando) {
										context.removeAttribute("id");
									}
								}
							}
						}
					}
				}

				// All others
				return select(selector.replace(rtrim, "$1"), context, results, seed);
			}

			/**
	   * Create key-value caches of limited size
	   * @returns {function(string, object)} Returns the Object data after storing it on itself with
	   *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
	   *	deleting the oldest entry
	   */
			function createCache() {
				var keys = [];

				function cache(key, value) {
					// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
					if (keys.push(key + " ") > Expr.cacheLength) {
						// Only keep the most recent entries
						delete cache[keys.shift()];
					}
					return cache[key + " "] = value;
				}
				return cache;
			}

			/**
	   * Mark a function for special use by Sizzle
	   * @param {Function} fn The function to mark
	   */
			function markFunction(fn) {
				fn[expando] = true;
				return fn;
			}

			/**
	   * Support testing using an element
	   * @param {Function} fn Passed the created element and returns a boolean result
	   */
			function assert(fn) {
				var el = document.createElement("fieldset");

				try {
					return !!fn(el);
				} catch (e) {
					return false;
				} finally {
					// Remove from its parent by default
					if (el.parentNode) {
						el.parentNode.removeChild(el);
					}
					// release memory in IE
					el = null;
				}
			}

			/**
	   * Adds the same handler for all of the specified attrs
	   * @param {String} attrs Pipe-separated list of attributes
	   * @param {Function} handler The method that will be applied
	   */
			function addHandle(attrs, handler) {
				var arr = attrs.split("|"),
				    i = arr.length;

				while (i--) {
					Expr.attrHandle[arr[i]] = handler;
				}
			}

			/**
	   * Checks document order of two siblings
	   * @param {Element} a
	   * @param {Element} b
	   * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
	   */
			function siblingCheck(a, b) {
				var cur = b && a,
				    diff = cur && a.nodeType === 1 && b.nodeType === 1 && a.sourceIndex - b.sourceIndex;

				// Use IE sourceIndex if available on both nodes
				if (diff) {
					return diff;
				}

				// Check if b follows a
				if (cur) {
					while (cur = cur.nextSibling) {
						if (cur === b) {
							return -1;
						}
					}
				}

				return a ? 1 : -1;
			}

			/**
	   * Returns a function to use in pseudos for input types
	   * @param {String} type
	   */
			function createInputPseudo(type) {
				return function (elem) {
					var name = elem.nodeName.toLowerCase();
					return name === "input" && elem.type === type;
				};
			}

			/**
	   * Returns a function to use in pseudos for buttons
	   * @param {String} type
	   */
			function createButtonPseudo(type) {
				return function (elem) {
					var name = elem.nodeName.toLowerCase();
					return (name === "input" || name === "button") && elem.type === type;
				};
			}

			/**
	   * Returns a function to use in pseudos for :enabled/:disabled
	   * @param {Boolean} disabled true for :disabled; false for :enabled
	   */
			function createDisabledPseudo(disabled) {

				// Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
				return function (elem) {

					// Only certain elements can match :enabled or :disabled
					// https://html.spec.whatwg.org/multipage/scripting.html#selector-enabled
					// https://html.spec.whatwg.org/multipage/scripting.html#selector-disabled
					if ("form" in elem) {

						// Check for inherited disabledness on relevant non-disabled elements:
						// * listed form-associated elements in a disabled fieldset
						//   https://html.spec.whatwg.org/multipage/forms.html#category-listed
						//   https://html.spec.whatwg.org/multipage/forms.html#concept-fe-disabled
						// * option elements in a disabled optgroup
						//   https://html.spec.whatwg.org/multipage/forms.html#concept-option-disabled
						// All such elements have a "form" property.
						if (elem.parentNode && elem.disabled === false) {

							// Option elements defer to a parent optgroup if present
							if ("label" in elem) {
								if ("label" in elem.parentNode) {
									return elem.parentNode.disabled === disabled;
								} else {
									return elem.disabled === disabled;
								}
							}

							// Support: IE 6 - 11
							// Use the isDisabled shortcut property to check for disabled fieldset ancestors
							return elem.isDisabled === disabled ||

							// Where there is no isDisabled, check manually
							/* jshint -W018 */
							elem.isDisabled !== !disabled && disabledAncestor(elem) === disabled;
						}

						return elem.disabled === disabled;

						// Try to winnow out elements that can't be disabled before trusting the disabled property.
						// Some victims get caught in our net (label, legend, menu, track), but it shouldn't
						// even exist on them, let alone have a boolean value.
					} else if ("label" in elem) {
						return elem.disabled === disabled;
					}

					// Remaining elements are neither :enabled nor :disabled
					return false;
				};
			}

			/**
	   * Returns a function to use in pseudos for positionals
	   * @param {Function} fn
	   */
			function createPositionalPseudo(fn) {
				return markFunction(function (argument) {
					argument = +argument;
					return markFunction(function (seed, matches) {
						var j,
						    matchIndexes = fn([], seed.length, argument),
						    i = matchIndexes.length;

						// Match elements found at the specified indexes
						while (i--) {
							if (seed[j = matchIndexes[i]]) {
								seed[j] = !(matches[j] = seed[j]);
							}
						}
					});
				});
			}

			/**
	   * Checks a node for validity as a Sizzle context
	   * @param {Element|Object=} context
	   * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
	   */
			function testContext(context) {
				return context && typeof context.getElementsByTagName !== "undefined" && context;
			}

			// Expose support vars for convenience
			support = Sizzle.support = {};

			/**
	   * Detects XML nodes
	   * @param {Element|Object} elem An element or a document
	   * @returns {Boolean} True iff elem is a non-HTML XML node
	   */
			isXML = Sizzle.isXML = function (elem) {
				// documentElement is verified for cases where it doesn't yet exist
				// (such as loading iframes in IE - #4833)
				var documentElement = elem && (elem.ownerDocument || elem).documentElement;
				return documentElement ? documentElement.nodeName !== "HTML" : false;
			};

			/**
	   * Sets document-related variables once based on the current document
	   * @param {Element|Object} [doc] An element or document object to use to set the document
	   * @returns {Object} Returns the current document
	   */
			setDocument = Sizzle.setDocument = function (node) {
				var hasCompare,
				    subWindow,
				    doc = node ? node.ownerDocument || node : preferredDoc;

				// Return early if doc is invalid or already selected
				if (doc === document || doc.nodeType !== 9 || !doc.documentElement) {
					return document;
				}

				// Update global variables
				document = doc;
				docElem = document.documentElement;
				documentIsHTML = !isXML(document);

				// Support: IE 9-11, Edge
				// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
				if (preferredDoc !== document && (subWindow = document.defaultView) && subWindow.top !== subWindow) {

					// Support: IE 11, Edge
					if (subWindow.addEventListener) {
						subWindow.addEventListener("unload", unloadHandler, false);

						// Support: IE 9 - 10 only
					} else if (subWindow.attachEvent) {
						subWindow.attachEvent("onunload", unloadHandler);
					}
				}

				/* Attributes
	   ---------------------------------------------------------------------- */

				// Support: IE<8
				// Verify that getAttribute really returns attributes and not properties
				// (excepting IE8 booleans)
				support.attributes = assert(function (el) {
					el.className = "i";
					return !el.getAttribute("className");
				});

				/* getElement(s)By*
	   ---------------------------------------------------------------------- */

				// Check if getElementsByTagName("*") returns only elements
				support.getElementsByTagName = assert(function (el) {
					el.appendChild(document.createComment(""));
					return !el.getElementsByTagName("*").length;
				});

				// Support: IE<9
				support.getElementsByClassName = rnative.test(document.getElementsByClassName);

				// Support: IE<10
				// Check if getElementById returns elements by name
				// The broken getElementById methods don't pick up programmatically-set names,
				// so use a roundabout getElementsByName test
				support.getById = assert(function (el) {
					docElem.appendChild(el).id = expando;
					return !document.getElementsByName || !document.getElementsByName(expando).length;
				});

				// ID filter and find
				if (support.getById) {
					Expr.filter["ID"] = function (id) {
						var attrId = id.replace(runescape, funescape);
						return function (elem) {
							return elem.getAttribute("id") === attrId;
						};
					};
					Expr.find["ID"] = function (id, context) {
						if (typeof context.getElementById !== "undefined" && documentIsHTML) {
							var elem = context.getElementById(id);
							return elem ? [elem] : [];
						}
					};
				} else {
					Expr.filter["ID"] = function (id) {
						var attrId = id.replace(runescape, funescape);
						return function (elem) {
							var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
							return node && node.value === attrId;
						};
					};

					// Support: IE 6 - 7 only
					// getElementById is not reliable as a find shortcut
					Expr.find["ID"] = function (id, context) {
						if (typeof context.getElementById !== "undefined" && documentIsHTML) {
							var node,
							    i,
							    elems,
							    elem = context.getElementById(id);

							if (elem) {

								// Verify the id attribute
								node = elem.getAttributeNode("id");
								if (node && node.value === id) {
									return [elem];
								}

								// Fall back on getElementsByName
								elems = context.getElementsByName(id);
								i = 0;
								while (elem = elems[i++]) {
									node = elem.getAttributeNode("id");
									if (node && node.value === id) {
										return [elem];
									}
								}
							}

							return [];
						}
					};
				}

				// Tag
				Expr.find["TAG"] = support.getElementsByTagName ? function (tag, context) {
					if (typeof context.getElementsByTagName !== "undefined") {
						return context.getElementsByTagName(tag);

						// DocumentFragment nodes don't have gEBTN
					} else if (support.qsa) {
						return context.querySelectorAll(tag);
					}
				} : function (tag, context) {
					var elem,
					    tmp = [],
					    i = 0,


					// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
					results = context.getElementsByTagName(tag);

					// Filter out possible comments
					if (tag === "*") {
						while (elem = results[i++]) {
							if (elem.nodeType === 1) {
								tmp.push(elem);
							}
						}

						return tmp;
					}
					return results;
				};

				// Class
				Expr.find["CLASS"] = support.getElementsByClassName && function (className, context) {
					if (typeof context.getElementsByClassName !== "undefined" && documentIsHTML) {
						return context.getElementsByClassName(className);
					}
				};

				/* QSA/matchesSelector
	   ---------------------------------------------------------------------- */

				// QSA and matchesSelector support

				// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
				rbuggyMatches = [];

				// qSa(:focus) reports false when true (Chrome 21)
				// We allow this because of a bug in IE8/9 that throws an error
				// whenever `document.activeElement` is accessed on an iframe
				// So, we allow :focus to pass through QSA all the time to avoid the IE error
				// See https://bugs.jquery.com/ticket/13378
				rbuggyQSA = [];

				if (support.qsa = rnative.test(document.querySelectorAll)) {
					// Build QSA regex
					// Regex strategy adopted from Diego Perini
					assert(function (el) {
						// Select is set to empty string on purpose
						// This is to test IE's treatment of not explicitly
						// setting a boolean content attribute,
						// since its presence should be enough
						// https://bugs.jquery.com/ticket/12359
						docElem.appendChild(el).innerHTML = "<a id='" + expando + "'></a>" + "<select id='" + expando + "-\r\\' msallowcapture=''>" + "<option selected=''></option></select>";

						// Support: IE8, Opera 11-12.16
						// Nothing should be selected when empty strings follow ^= or $= or *=
						// The test attribute must be unknown in Opera but "safe" for WinRT
						// https://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
						if (el.querySelectorAll("[msallowcapture^='']").length) {
							rbuggyQSA.push("[*^$]=" + whitespace + "*(?:''|\"\")");
						}

						// Support: IE8
						// Boolean attributes and "value" are not treated correctly
						if (!el.querySelectorAll("[selected]").length) {
							rbuggyQSA.push("\\[" + whitespace + "*(?:value|" + booleans + ")");
						}

						// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
						if (!el.querySelectorAll("[id~=" + expando + "-]").length) {
							rbuggyQSA.push("~=");
						}

						// Webkit/Opera - :checked should return selected option elements
						// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
						// IE8 throws error here and will not see later tests
						if (!el.querySelectorAll(":checked").length) {
							rbuggyQSA.push(":checked");
						}

						// Support: Safari 8+, iOS 8+
						// https://bugs.webkit.org/show_bug.cgi?id=136851
						// In-page `selector#id sibling-combinator selector` fails
						if (!el.querySelectorAll("a#" + expando + "+*").length) {
							rbuggyQSA.push(".#.+[+~]");
						}
					});

					assert(function (el) {
						el.innerHTML = "<a href='' disabled='disabled'></a>" + "<select disabled='disabled'><option/></select>";

						// Support: Windows 8 Native Apps
						// The type and name attributes are restricted during .innerHTML assignment
						var input = document.createElement("input");
						input.setAttribute("type", "hidden");
						el.appendChild(input).setAttribute("name", "D");

						// Support: IE8
						// Enforce case-sensitivity of name attribute
						if (el.querySelectorAll("[name=d]").length) {
							rbuggyQSA.push("name" + whitespace + "*[*^$|!~]?=");
						}

						// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
						// IE8 throws error here and will not see later tests
						if (el.querySelectorAll(":enabled").length !== 2) {
							rbuggyQSA.push(":enabled", ":disabled");
						}

						// Support: IE9-11+
						// IE's :disabled selector does not pick up the children of disabled fieldsets
						docElem.appendChild(el).disabled = true;
						if (el.querySelectorAll(":disabled").length !== 2) {
							rbuggyQSA.push(":enabled", ":disabled");
						}

						// Opera 10-11 does not throw on post-comma invalid pseudos
						el.querySelectorAll("*,:x");
						rbuggyQSA.push(",.*:");
					});
				}

				if (support.matchesSelector = rnative.test(matches = docElem.matches || docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector)) {

					assert(function (el) {
						// Check to see if it's possible to do matchesSelector
						// on a disconnected node (IE 9)
						support.disconnectedMatch = matches.call(el, "*");

						// This should fail with an exception
						// Gecko does not error, returns false instead
						matches.call(el, "[s!='']:x");
						rbuggyMatches.push("!=", pseudos);
					});
				}

				rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));
				rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join("|"));

				/* Contains
	   ---------------------------------------------------------------------- */
				hasCompare = rnative.test(docElem.compareDocumentPosition);

				// Element contains another
				// Purposefully self-exclusive
				// As in, an element does not contain itself
				contains = hasCompare || rnative.test(docElem.contains) ? function (a, b) {
					var adown = a.nodeType === 9 ? a.documentElement : a,
					    bup = b && b.parentNode;
					return a === bup || !!(bup && bup.nodeType === 1 && (adown.contains ? adown.contains(bup) : a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16));
				} : function (a, b) {
					if (b) {
						while (b = b.parentNode) {
							if (b === a) {
								return true;
							}
						}
					}
					return false;
				};

				/* Sorting
	   ---------------------------------------------------------------------- */

				// Document order sorting
				sortOrder = hasCompare ? function (a, b) {

					// Flag for duplicate removal
					if (a === b) {
						hasDuplicate = true;
						return 0;
					}

					// Sort on method existence if only one input has compareDocumentPosition
					var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
					if (compare) {
						return compare;
					}

					// Calculate position if both inputs belong to the same document
					compare = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) :

					// Otherwise we know they are disconnected
					1;

					// Disconnected nodes
					if (compare & 1 || !support.sortDetached && b.compareDocumentPosition(a) === compare) {

						// Choose the first element that is related to our preferred document
						if (a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a)) {
							return -1;
						}
						if (b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b)) {
							return 1;
						}

						// Maintain original order
						return sortInput ? indexOf(sortInput, a) - indexOf(sortInput, b) : 0;
					}

					return compare & 4 ? -1 : 1;
				} : function (a, b) {
					// Exit early if the nodes are identical
					if (a === b) {
						hasDuplicate = true;
						return 0;
					}

					var cur,
					    i = 0,
					    aup = a.parentNode,
					    bup = b.parentNode,
					    ap = [a],
					    bp = [b];

					// Parentless nodes are either documents or disconnected
					if (!aup || !bup) {
						return a === document ? -1 : b === document ? 1 : aup ? -1 : bup ? 1 : sortInput ? indexOf(sortInput, a) - indexOf(sortInput, b) : 0;

						// If the nodes are siblings, we can do a quick check
					} else if (aup === bup) {
						return siblingCheck(a, b);
					}

					// Otherwise we need full lists of their ancestors for comparison
					cur = a;
					while (cur = cur.parentNode) {
						ap.unshift(cur);
					}
					cur = b;
					while (cur = cur.parentNode) {
						bp.unshift(cur);
					}

					// Walk down the tree looking for a discrepancy
					while (ap[i] === bp[i]) {
						i++;
					}

					return i ?
					// Do a sibling check if the nodes have a common ancestor
					siblingCheck(ap[i], bp[i]) :

					// Otherwise nodes in our document sort first
					ap[i] === preferredDoc ? -1 : bp[i] === preferredDoc ? 1 : 0;
				};

				return document;
			};

			Sizzle.matches = function (expr, elements) {
				return Sizzle(expr, null, null, elements);
			};

			Sizzle.matchesSelector = function (elem, expr) {
				// Set document vars if needed
				if ((elem.ownerDocument || elem) !== document) {
					setDocument(elem);
				}

				// Make sure that attribute selectors are quoted
				expr = expr.replace(rattributeQuotes, "='$1']");

				if (support.matchesSelector && documentIsHTML && !compilerCache[expr + " "] && (!rbuggyMatches || !rbuggyMatches.test(expr)) && (!rbuggyQSA || !rbuggyQSA.test(expr))) {

					try {
						var ret = matches.call(elem, expr);

						// IE 9's matchesSelector returns false on disconnected nodes
						if (ret || support.disconnectedMatch ||
						// As well, disconnected nodes are said to be in a document
						// fragment in IE 9
						elem.document && elem.document.nodeType !== 11) {
							return ret;
						}
					} catch (e) {}
				}

				return Sizzle(expr, document, null, [elem]).length > 0;
			};

			Sizzle.contains = function (context, elem) {
				// Set document vars if needed
				if ((context.ownerDocument || context) !== document) {
					setDocument(context);
				}
				return contains(context, elem);
			};

			Sizzle.attr = function (elem, name) {
				// Set document vars if needed
				if ((elem.ownerDocument || elem) !== document) {
					setDocument(elem);
				}

				var fn = Expr.attrHandle[name.toLowerCase()],


				// Don't get fooled by Object.prototype properties (jQuery #13807)
				val = fn && hasOwn.call(Expr.attrHandle, name.toLowerCase()) ? fn(elem, name, !documentIsHTML) : undefined;

				return val !== undefined ? val : support.attributes || !documentIsHTML ? elem.getAttribute(name) : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
			};

			Sizzle.escape = function (sel) {
				return (sel + "").replace(rcssescape, fcssescape);
			};

			Sizzle.error = function (msg) {
				throw new Error("Syntax error, unrecognized expression: " + msg);
			};

			/**
	   * Document sorting and removing duplicates
	   * @param {ArrayLike} results
	   */
			Sizzle.uniqueSort = function (results) {
				var elem,
				    duplicates = [],
				    j = 0,
				    i = 0;

				// Unless we *know* we can detect duplicates, assume their presence
				hasDuplicate = !support.detectDuplicates;
				sortInput = !support.sortStable && results.slice(0);
				results.sort(sortOrder);

				if (hasDuplicate) {
					while (elem = results[i++]) {
						if (elem === results[i]) {
							j = duplicates.push(i);
						}
					}
					while (j--) {
						results.splice(duplicates[j], 1);
					}
				}

				// Clear input after sorting to release objects
				// See https://github.com/jquery/sizzle/pull/225
				sortInput = null;

				return results;
			};

			/**
	   * Utility function for retrieving the text value of an array of DOM nodes
	   * @param {Array|Element} elem
	   */
			getText = Sizzle.getText = function (elem) {
				var node,
				    ret = "",
				    i = 0,
				    nodeType = elem.nodeType;

				if (!nodeType) {
					// If no nodeType, this is expected to be an array
					while (node = elem[i++]) {
						// Do not traverse comment nodes
						ret += getText(node);
					}
				} else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
					// Use textContent for elements
					// innerText usage removed for consistency of new lines (jQuery #11153)
					if (typeof elem.textContent === "string") {
						return elem.textContent;
					} else {
						// Traverse its children
						for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
							ret += getText(elem);
						}
					}
				} else if (nodeType === 3 || nodeType === 4) {
					return elem.nodeValue;
				}
				// Do not include comment or processing instruction nodes

				return ret;
			};

			Expr = Sizzle.selectors = {

				// Can be adjusted by the user
				cacheLength: 50,

				createPseudo: markFunction,

				match: matchExpr,

				attrHandle: {},

				find: {},

				relative: {
					">": { dir: "parentNode", first: true },
					" ": { dir: "parentNode" },
					"+": { dir: "previousSibling", first: true },
					"~": { dir: "previousSibling" }
				},

				preFilter: {
					"ATTR": function ATTR(match) {
						match[1] = match[1].replace(runescape, funescape);

						// Move the given value to match[3] whether quoted or unquoted
						match[3] = (match[3] || match[4] || match[5] || "").replace(runescape, funescape);

						if (match[2] === "~=") {
							match[3] = " " + match[3] + " ";
						}

						return match.slice(0, 4);
					},

					"CHILD": function CHILD(match) {
						/* matches from matchExpr["CHILD"]
	     	1 type (only|nth|...)
	     	2 what (child|of-type)
	     	3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
	     	4 xn-component of xn+y argument ([+-]?\d*n|)
	     	5 sign of xn-component
	     	6 x of xn-component
	     	7 sign of y-component
	     	8 y of y-component
	     */
						match[1] = match[1].toLowerCase();

						if (match[1].slice(0, 3) === "nth") {
							// nth-* requires argument
							if (!match[3]) {
								Sizzle.error(match[0]);
							}

							// numeric x and y parameters for Expr.filter.CHILD
							// remember that false/true cast respectively to 0/1
							match[4] = +(match[4] ? match[5] + (match[6] || 1) : 2 * (match[3] === "even" || match[3] === "odd"));
							match[5] = +(match[7] + match[8] || match[3] === "odd");

							// other types prohibit arguments
						} else if (match[3]) {
							Sizzle.error(match[0]);
						}

						return match;
					},

					"PSEUDO": function PSEUDO(match) {
						var excess,
						    unquoted = !match[6] && match[2];

						if (matchExpr["CHILD"].test(match[0])) {
							return null;
						}

						// Accept quoted arguments as-is
						if (match[3]) {
							match[2] = match[4] || match[5] || "";

							// Strip excess characters from unquoted arguments
						} else if (unquoted && rpseudo.test(unquoted) && (
						// Get excess from tokenize (recursively)
						excess = tokenize(unquoted, true)) && (
						// advance to the next closing parenthesis
						excess = unquoted.indexOf(")", unquoted.length - excess) - unquoted.length)) {

							// excess is a negative index
							match[0] = match[0].slice(0, excess);
							match[2] = unquoted.slice(0, excess);
						}

						// Return only captures needed by the pseudo filter method (type and argument)
						return match.slice(0, 3);
					}
				},

				filter: {

					"TAG": function TAG(nodeNameSelector) {
						var nodeName = nodeNameSelector.replace(runescape, funescape).toLowerCase();
						return nodeNameSelector === "*" ? function () {
							return true;
						} : function (elem) {
							return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
						};
					},

					"CLASS": function CLASS(className) {
						var pattern = classCache[className + " "];

						return pattern || (pattern = new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)")) && classCache(className, function (elem) {
							return pattern.test(typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "");
						});
					},

					"ATTR": function ATTR(name, operator, check) {
						return function (elem) {
							var result = Sizzle.attr(elem, name);

							if (result == null) {
								return operator === "!=";
							}
							if (!operator) {
								return true;
							}

							result += "";

							return operator === "=" ? result === check : operator === "!=" ? result !== check : operator === "^=" ? check && result.indexOf(check) === 0 : operator === "*=" ? check && result.indexOf(check) > -1 : operator === "$=" ? check && result.slice(-check.length) === check : operator === "~=" ? (" " + result.replace(rwhitespace, " ") + " ").indexOf(check) > -1 : operator === "|=" ? result === check || result.slice(0, check.length + 1) === check + "-" : false;
						};
					},

					"CHILD": function CHILD(type, what, argument, first, last) {
						var simple = type.slice(0, 3) !== "nth",
						    forward = type.slice(-4) !== "last",
						    ofType = what === "of-type";

						return first === 1 && last === 0 ?

						// Shortcut for :nth-*(n)
						function (elem) {
							return !!elem.parentNode;
						} : function (elem, context, xml) {
							var cache,
							    uniqueCache,
							    outerCache,
							    node,
							    nodeIndex,
							    start,
							    dir = simple !== forward ? "nextSibling" : "previousSibling",
							    parent = elem.parentNode,
							    name = ofType && elem.nodeName.toLowerCase(),
							    useCache = !xml && !ofType,
							    diff = false;

							if (parent) {

								// :(first|last|only)-(child|of-type)
								if (simple) {
									while (dir) {
										node = elem;
										while (node = node[dir]) {
											if (ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) {

												return false;
											}
										}
										// Reverse direction for :only-* (if we haven't yet done so)
										start = dir = type === "only" && !start && "nextSibling";
									}
									return true;
								}

								start = [forward ? parent.firstChild : parent.lastChild];

								// non-xml :nth-child(...) stores cache data on `parent`
								if (forward && useCache) {

									// Seek `elem` from a previously-cached index

									// ...in a gzip-friendly way
									node = parent;
									outerCache = node[expando] || (node[expando] = {});

									// Support: IE <9 only
									// Defend against cloned attroperties (jQuery gh-1709)
									uniqueCache = outerCache[node.uniqueID] || (outerCache[node.uniqueID] = {});

									cache = uniqueCache[type] || [];
									nodeIndex = cache[0] === dirruns && cache[1];
									diff = nodeIndex && cache[2];
									node = nodeIndex && parent.childNodes[nodeIndex];

									while (node = ++nodeIndex && node && node[dir] || (

									// Fallback to seeking `elem` from the start
									diff = nodeIndex = 0) || start.pop()) {

										// When found, cache indexes on `parent` and break
										if (node.nodeType === 1 && ++diff && node === elem) {
											uniqueCache[type] = [dirruns, nodeIndex, diff];
											break;
										}
									}
								} else {
									// Use previously-cached element index if available
									if (useCache) {
										// ...in a gzip-friendly way
										node = elem;
										outerCache = node[expando] || (node[expando] = {});

										// Support: IE <9 only
										// Defend against cloned attroperties (jQuery gh-1709)
										uniqueCache = outerCache[node.uniqueID] || (outerCache[node.uniqueID] = {});

										cache = uniqueCache[type] || [];
										nodeIndex = cache[0] === dirruns && cache[1];
										diff = nodeIndex;
									}

									// xml :nth-child(...)
									// or :nth-last-child(...) or :nth(-last)?-of-type(...)
									if (diff === false) {
										// Use the same loop as above to seek `elem` from the start
										while (node = ++nodeIndex && node && node[dir] || (diff = nodeIndex = 0) || start.pop()) {

											if ((ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) && ++diff) {

												// Cache the index of each encountered element
												if (useCache) {
													outerCache = node[expando] || (node[expando] = {});

													// Support: IE <9 only
													// Defend against cloned attroperties (jQuery gh-1709)
													uniqueCache = outerCache[node.uniqueID] || (outerCache[node.uniqueID] = {});

													uniqueCache[type] = [dirruns, diff];
												}

												if (node === elem) {
													break;
												}
											}
										}
									}
								}

								// Incorporate the offset, then check against cycle size
								diff -= last;
								return diff === first || diff % first === 0 && diff / first >= 0;
							}
						};
					},

					"PSEUDO": function PSEUDO(pseudo, argument) {
						// pseudo-class names are case-insensitive
						// http://www.w3.org/TR/selectors/#pseudo-classes
						// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
						// Remember that setFilters inherits from pseudos
						var args,
						    fn = Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] || Sizzle.error("unsupported pseudo: " + pseudo);

						// The user may use createPseudo to indicate that
						// arguments are needed to create the filter function
						// just as Sizzle does
						if (fn[expando]) {
							return fn(argument);
						}

						// But maintain support for old signatures
						if (fn.length > 1) {
							args = [pseudo, pseudo, "", argument];
							return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ? markFunction(function (seed, matches) {
								var idx,
								    matched = fn(seed, argument),
								    i = matched.length;
								while (i--) {
									idx = indexOf(seed, matched[i]);
									seed[idx] = !(matches[idx] = matched[i]);
								}
							}) : function (elem) {
								return fn(elem, 0, args);
							};
						}

						return fn;
					}
				},

				pseudos: {
					// Potentially complex pseudos
					"not": markFunction(function (selector) {
						// Trim the selector passed to compile
						// to avoid treating leading and trailing
						// spaces as combinators
						var input = [],
						    results = [],
						    matcher = compile(selector.replace(rtrim, "$1"));

						return matcher[expando] ? markFunction(function (seed, matches, context, xml) {
							var elem,
							    unmatched = matcher(seed, null, xml, []),
							    i = seed.length;

							// Match elements unmatched by `matcher`
							while (i--) {
								if (elem = unmatched[i]) {
									seed[i] = !(matches[i] = elem);
								}
							}
						}) : function (elem, context, xml) {
							input[0] = elem;
							matcher(input, null, xml, results);
							// Don't keep the element (issue #299)
							input[0] = null;
							return !results.pop();
						};
					}),

					"has": markFunction(function (selector) {
						return function (elem) {
							return Sizzle(selector, elem).length > 0;
						};
					}),

					"contains": markFunction(function (text) {
						text = text.replace(runescape, funescape);
						return function (elem) {
							return (elem.textContent || elem.innerText || getText(elem)).indexOf(text) > -1;
						};
					}),

					// "Whether an element is represented by a :lang() selector
					// is based solely on the element's language value
					// being equal to the identifier C,
					// or beginning with the identifier C immediately followed by "-".
					// The matching of C against the element's language value is performed case-insensitively.
					// The identifier C does not have to be a valid language name."
					// http://www.w3.org/TR/selectors/#lang-pseudo
					"lang": markFunction(function (lang) {
						// lang value must be a valid identifier
						if (!ridentifier.test(lang || "")) {
							Sizzle.error("unsupported lang: " + lang);
						}
						lang = lang.replace(runescape, funescape).toLowerCase();
						return function (elem) {
							var elemLang;
							do {
								if (elemLang = documentIsHTML ? elem.lang : elem.getAttribute("xml:lang") || elem.getAttribute("lang")) {

									elemLang = elemLang.toLowerCase();
									return elemLang === lang || elemLang.indexOf(lang + "-") === 0;
								}
							} while ((elem = elem.parentNode) && elem.nodeType === 1);
							return false;
						};
					}),

					// Miscellaneous
					"target": function target(elem) {
						var hash = window.location && window.location.hash;
						return hash && hash.slice(1) === elem.id;
					},

					"root": function root(elem) {
						return elem === docElem;
					},

					"focus": function focus(elem) {
						return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
					},

					// Boolean properties
					"enabled": createDisabledPseudo(false),
					"disabled": createDisabledPseudo(true),

					"checked": function checked(elem) {
						// In CSS3, :checked should return both checked and selected elements
						// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
						var nodeName = elem.nodeName.toLowerCase();
						return nodeName === "input" && !!elem.checked || nodeName === "option" && !!elem.selected;
					},

					"selected": function selected(elem) {
						// Accessing this property makes selected-by-default
						// options in Safari work properly
						if (elem.parentNode) {
							elem.parentNode.selectedIndex;
						}

						return elem.selected === true;
					},

					// Contents
					"empty": function empty(elem) {
						// http://www.w3.org/TR/selectors/#empty-pseudo
						// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
						//   but not by others (comment: 8; processing instruction: 7; etc.)
						// nodeType < 6 works because attributes (2) do not appear as children
						for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
							if (elem.nodeType < 6) {
								return false;
							}
						}
						return true;
					},

					"parent": function parent(elem) {
						return !Expr.pseudos["empty"](elem);
					},

					// Element/input types
					"header": function header(elem) {
						return rheader.test(elem.nodeName);
					},

					"input": function input(elem) {
						return rinputs.test(elem.nodeName);
					},

					"button": function button(elem) {
						var name = elem.nodeName.toLowerCase();
						return name === "input" && elem.type === "button" || name === "button";
					},

					"text": function text(elem) {
						var attr;
						return elem.nodeName.toLowerCase() === "input" && elem.type === "text" && (

						// Support: IE<8
						// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
						(attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text");
					},

					// Position-in-collection
					"first": createPositionalPseudo(function () {
						return [0];
					}),

					"last": createPositionalPseudo(function (matchIndexes, length) {
						return [length - 1];
					}),

					"eq": createPositionalPseudo(function (matchIndexes, length, argument) {
						return [argument < 0 ? argument + length : argument];
					}),

					"even": createPositionalPseudo(function (matchIndexes, length) {
						var i = 0;
						for (; i < length; i += 2) {
							matchIndexes.push(i);
						}
						return matchIndexes;
					}),

					"odd": createPositionalPseudo(function (matchIndexes, length) {
						var i = 1;
						for (; i < length; i += 2) {
							matchIndexes.push(i);
						}
						return matchIndexes;
					}),

					"lt": createPositionalPseudo(function (matchIndexes, length, argument) {
						var i = argument < 0 ? argument + length : argument;
						for (; --i >= 0;) {
							matchIndexes.push(i);
						}
						return matchIndexes;
					}),

					"gt": createPositionalPseudo(function (matchIndexes, length, argument) {
						var i = argument < 0 ? argument + length : argument;
						for (; ++i < length;) {
							matchIndexes.push(i);
						}
						return matchIndexes;
					})
				}
			};

			Expr.pseudos["nth"] = Expr.pseudos["eq"];

			// Add button/input type pseudos
			for (i in { radio: true, checkbox: true, file: true, password: true, image: true }) {
				Expr.pseudos[i] = createInputPseudo(i);
			}
			for (i in { submit: true, reset: true }) {
				Expr.pseudos[i] = createButtonPseudo(i);
			}

			// Easy API for creating new setFilters
			function setFilters() {}
			setFilters.prototype = Expr.filters = Expr.pseudos;
			Expr.setFilters = new setFilters();

			tokenize = Sizzle.tokenize = function (selector, parseOnly) {
				var matched,
				    match,
				    tokens,
				    type,
				    soFar,
				    groups,
				    preFilters,
				    cached = tokenCache[selector + " "];

				if (cached) {
					return parseOnly ? 0 : cached.slice(0);
				}

				soFar = selector;
				groups = [];
				preFilters = Expr.preFilter;

				while (soFar) {

					// Comma and first run
					if (!matched || (match = rcomma.exec(soFar))) {
						if (match) {
							// Don't consume trailing commas as valid
							soFar = soFar.slice(match[0].length) || soFar;
						}
						groups.push(tokens = []);
					}

					matched = false;

					// Combinators
					if (match = rcombinators.exec(soFar)) {
						matched = match.shift();
						tokens.push({
							value: matched,
							// Cast descendant combinators to space
							type: match[0].replace(rtrim, " ")
						});
						soFar = soFar.slice(matched.length);
					}

					// Filters
					for (type in Expr.filter) {
						if ((match = matchExpr[type].exec(soFar)) && (!preFilters[type] || (match = preFilters[type](match)))) {
							matched = match.shift();
							tokens.push({
								value: matched,
								type: type,
								matches: match
							});
							soFar = soFar.slice(matched.length);
						}
					}

					if (!matched) {
						break;
					}
				}

				// Return the length of the invalid excess
				// if we're just parsing
				// Otherwise, throw an error or return tokens
				return parseOnly ? soFar.length : soFar ? Sizzle.error(selector) :
				// Cache the tokens
				tokenCache(selector, groups).slice(0);
			};

			function toSelector(tokens) {
				var i = 0,
				    len = tokens.length,
				    selector = "";
				for (; i < len; i++) {
					selector += tokens[i].value;
				}
				return selector;
			}

			function addCombinator(matcher, combinator, base) {
				var dir = combinator.dir,
				    skip = combinator.next,
				    key = skip || dir,
				    checkNonElements = base && key === "parentNode",
				    doneName = done++;

				return combinator.first ?
				// Check against closest ancestor/preceding element
				function (elem, context, xml) {
					while (elem = elem[dir]) {
						if (elem.nodeType === 1 || checkNonElements) {
							return matcher(elem, context, xml);
						}
					}
					return false;
				} :

				// Check against all ancestor/preceding elements
				function (elem, context, xml) {
					var oldCache,
					    uniqueCache,
					    outerCache,
					    newCache = [dirruns, doneName];

					// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
					if (xml) {
						while (elem = elem[dir]) {
							if (elem.nodeType === 1 || checkNonElements) {
								if (matcher(elem, context, xml)) {
									return true;
								}
							}
						}
					} else {
						while (elem = elem[dir]) {
							if (elem.nodeType === 1 || checkNonElements) {
								outerCache = elem[expando] || (elem[expando] = {});

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[elem.uniqueID] || (outerCache[elem.uniqueID] = {});

								if (skip && skip === elem.nodeName.toLowerCase()) {
									elem = elem[dir] || elem;
								} else if ((oldCache = uniqueCache[key]) && oldCache[0] === dirruns && oldCache[1] === doneName) {

									// Assign to newCache so results back-propagate to previous elements
									return newCache[2] = oldCache[2];
								} else {
									// Reuse newcache so results back-propagate to previous elements
									uniqueCache[key] = newCache;

									// A match means we're done; a fail means we have to keep checking
									if (newCache[2] = matcher(elem, context, xml)) {
										return true;
									}
								}
							}
						}
					}
					return false;
				};
			}

			function elementMatcher(matchers) {
				return matchers.length > 1 ? function (elem, context, xml) {
					var i = matchers.length;
					while (i--) {
						if (!matchers[i](elem, context, xml)) {
							return false;
						}
					}
					return true;
				} : matchers[0];
			}

			function multipleContexts(selector, contexts, results) {
				var i = 0,
				    len = contexts.length;
				for (; i < len; i++) {
					Sizzle(selector, contexts[i], results);
				}
				return results;
			}

			function condense(unmatched, map, filter, context, xml) {
				var elem,
				    newUnmatched = [],
				    i = 0,
				    len = unmatched.length,
				    mapped = map != null;

				for (; i < len; i++) {
					if (elem = unmatched[i]) {
						if (!filter || filter(elem, context, xml)) {
							newUnmatched.push(elem);
							if (mapped) {
								map.push(i);
							}
						}
					}
				}

				return newUnmatched;
			}

			function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
				if (postFilter && !postFilter[expando]) {
					postFilter = setMatcher(postFilter);
				}
				if (postFinder && !postFinder[expando]) {
					postFinder = setMatcher(postFinder, postSelector);
				}
				return markFunction(function (seed, results, context, xml) {
					var temp,
					    i,
					    elem,
					    preMap = [],
					    postMap = [],
					    preexisting = results.length,


					// Get initial elements from seed or context
					elems = seed || multipleContexts(selector || "*", context.nodeType ? [context] : context, []),


					// Prefilter to get matcher input, preserving a map for seed-results synchronization
					matcherIn = preFilter && (seed || !selector) ? condense(elems, preMap, preFilter, context, xml) : elems,
					    matcherOut = matcher ?
					// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
					postFinder || (seed ? preFilter : preexisting || postFilter) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results : matcherIn;

					// Find primary matches
					if (matcher) {
						matcher(matcherIn, matcherOut, context, xml);
					}

					// Apply postFilter
					if (postFilter) {
						temp = condense(matcherOut, postMap);
						postFilter(temp, [], context, xml);

						// Un-match failing elements by moving them back to matcherIn
						i = temp.length;
						while (i--) {
							if (elem = temp[i]) {
								matcherOut[postMap[i]] = !(matcherIn[postMap[i]] = elem);
							}
						}
					}

					if (seed) {
						if (postFinder || preFilter) {
							if (postFinder) {
								// Get the final matcherOut by condensing this intermediate into postFinder contexts
								temp = [];
								i = matcherOut.length;
								while (i--) {
									if (elem = matcherOut[i]) {
										// Restore matcherIn since elem is not yet a final match
										temp.push(matcherIn[i] = elem);
									}
								}
								postFinder(null, matcherOut = [], temp, xml);
							}

							// Move matched elements from seed to results to keep them synchronized
							i = matcherOut.length;
							while (i--) {
								if ((elem = matcherOut[i]) && (temp = postFinder ? indexOf(seed, elem) : preMap[i]) > -1) {

									seed[temp] = !(results[temp] = elem);
								}
							}
						}

						// Add elements to results, through postFinder if defined
					} else {
						matcherOut = condense(matcherOut === results ? matcherOut.splice(preexisting, matcherOut.length) : matcherOut);
						if (postFinder) {
							postFinder(null, results, matcherOut, xml);
						} else {
							push.apply(results, matcherOut);
						}
					}
				});
			}

			function matcherFromTokens(tokens) {
				var checkContext,
				    matcher,
				    j,
				    len = tokens.length,
				    leadingRelative = Expr.relative[tokens[0].type],
				    implicitRelative = leadingRelative || Expr.relative[" "],
				    i = leadingRelative ? 1 : 0,


				// The foundational matcher ensures that elements are reachable from top-level context(s)
				matchContext = addCombinator(function (elem) {
					return elem === checkContext;
				}, implicitRelative, true),
				    matchAnyContext = addCombinator(function (elem) {
					return indexOf(checkContext, elem) > -1;
				}, implicitRelative, true),
				    matchers = [function (elem, context, xml) {
					var ret = !leadingRelative && (xml || context !== outermostContext) || ((checkContext = context).nodeType ? matchContext(elem, context, xml) : matchAnyContext(elem, context, xml));
					// Avoid hanging onto element (issue #299)
					checkContext = null;
					return ret;
				}];

				for (; i < len; i++) {
					if (matcher = Expr.relative[tokens[i].type]) {
						matchers = [addCombinator(elementMatcher(matchers), matcher)];
					} else {
						matcher = Expr.filter[tokens[i].type].apply(null, tokens[i].matches);

						// Return special upon seeing a positional matcher
						if (matcher[expando]) {
							// Find the next relative operator (if any) for proper handling
							j = ++i;
							for (; j < len; j++) {
								if (Expr.relative[tokens[j].type]) {
									break;
								}
							}
							return setMatcher(i > 1 && elementMatcher(matchers), i > 1 && toSelector(
							// If the preceding token was a descendant combinator, insert an implicit any-element `*`
							tokens.slice(0, i - 1).concat({ value: tokens[i - 2].type === " " ? "*" : "" })).replace(rtrim, "$1"), matcher, i < j && matcherFromTokens(tokens.slice(i, j)), j < len && matcherFromTokens(tokens = tokens.slice(j)), j < len && toSelector(tokens));
						}
						matchers.push(matcher);
					}
				}

				return elementMatcher(matchers);
			}

			function matcherFromGroupMatchers(elementMatchers, setMatchers) {
				var bySet = setMatchers.length > 0,
				    byElement = elementMatchers.length > 0,
				    superMatcher = function superMatcher(seed, context, xml, results, outermost) {
					var elem,
					    j,
					    matcher,
					    matchedCount = 0,
					    i = "0",
					    unmatched = seed && [],
					    setMatched = [],
					    contextBackup = outermostContext,


					// We must always have either seed elements or outermost context
					elems = seed || byElement && Expr.find["TAG"]("*", outermost),


					// Use integer dirruns iff this is the outermost matcher
					dirrunsUnique = dirruns += contextBackup == null ? 1 : Math.random() || 0.1,
					    len = elems.length;

					if (outermost) {
						outermostContext = context === document || context || outermost;
					}

					// Add elements passing elementMatchers directly to results
					// Support: IE<9, Safari
					// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
					for (; i !== len && (elem = elems[i]) != null; i++) {
						if (byElement && elem) {
							j = 0;
							if (!context && elem.ownerDocument !== document) {
								setDocument(elem);
								xml = !documentIsHTML;
							}
							while (matcher = elementMatchers[j++]) {
								if (matcher(elem, context || document, xml)) {
									results.push(elem);
									break;
								}
							}
							if (outermost) {
								dirruns = dirrunsUnique;
							}
						}

						// Track unmatched elements for set filters
						if (bySet) {
							// They will have gone through all possible matchers
							if (elem = !matcher && elem) {
								matchedCount--;
							}

							// Lengthen the array for every element, matched or not
							if (seed) {
								unmatched.push(elem);
							}
						}
					}

					// `i` is now the count of elements visited above, and adding it to `matchedCount`
					// makes the latter nonnegative.
					matchedCount += i;

					// Apply set filters to unmatched elements
					// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
					// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
					// no element matchers and no seed.
					// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
					// case, which will result in a "00" `matchedCount` that differs from `i` but is also
					// numerically zero.
					if (bySet && i !== matchedCount) {
						j = 0;
						while (matcher = setMatchers[j++]) {
							matcher(unmatched, setMatched, context, xml);
						}

						if (seed) {
							// Reintegrate element matches to eliminate the need for sorting
							if (matchedCount > 0) {
								while (i--) {
									if (!(unmatched[i] || setMatched[i])) {
										setMatched[i] = pop.call(results);
									}
								}
							}

							// Discard index placeholder values to get only actual matches
							setMatched = condense(setMatched);
						}

						// Add matches to results
						push.apply(results, setMatched);

						// Seedless set matches succeeding multiple successful matchers stipulate sorting
						if (outermost && !seed && setMatched.length > 0 && matchedCount + setMatchers.length > 1) {

							Sizzle.uniqueSort(results);
						}
					}

					// Override manipulation of globals by nested matchers
					if (outermost) {
						dirruns = dirrunsUnique;
						outermostContext = contextBackup;
					}

					return unmatched;
				};

				return bySet ? markFunction(superMatcher) : superMatcher;
			}

			compile = Sizzle.compile = function (selector, match /* Internal Use Only */) {
				var i,
				    setMatchers = [],
				    elementMatchers = [],
				    cached = compilerCache[selector + " "];

				if (!cached) {
					// Generate a function of recursive functions that can be used to check each element
					if (!match) {
						match = tokenize(selector);
					}
					i = match.length;
					while (i--) {
						cached = matcherFromTokens(match[i]);
						if (cached[expando]) {
							setMatchers.push(cached);
						} else {
							elementMatchers.push(cached);
						}
					}

					// Cache the compiled function
					cached = compilerCache(selector, matcherFromGroupMatchers(elementMatchers, setMatchers));

					// Save selector and tokenization
					cached.selector = selector;
				}
				return cached;
			};

			/**
	   * A low-level selection function that works with Sizzle's compiled
	   *  selector functions
	   * @param {String|Function} selector A selector or a pre-compiled
	   *  selector function built with Sizzle.compile
	   * @param {Element} context
	   * @param {Array} [results]
	   * @param {Array} [seed] A set of elements to match against
	   */
			select = Sizzle.select = function (selector, context, results, seed) {
				var i,
				    tokens,
				    token,
				    type,
				    find,
				    compiled = typeof selector === "function" && selector,
				    match = !seed && tokenize(selector = compiled.selector || selector);

				results = results || [];

				// Try to minimize operations if there is only one selector in the list and no seed
				// (the latter of which guarantees us context)
				if (match.length === 1) {

					// Reduce context if the leading compound selector is an ID
					tokens = match[0] = match[0].slice(0);
					if (tokens.length > 2 && (token = tokens[0]).type === "ID" && context.nodeType === 9 && documentIsHTML && Expr.relative[tokens[1].type]) {

						context = (Expr.find["ID"](token.matches[0].replace(runescape, funescape), context) || [])[0];
						if (!context) {
							return results;

							// Precompiled matchers will still verify ancestry, so step up a level
						} else if (compiled) {
							context = context.parentNode;
						}

						selector = selector.slice(tokens.shift().value.length);
					}

					// Fetch a seed set for right-to-left matching
					i = matchExpr["needsContext"].test(selector) ? 0 : tokens.length;
					while (i--) {
						token = tokens[i];

						// Abort if we hit a combinator
						if (Expr.relative[type = token.type]) {
							break;
						}
						if (find = Expr.find[type]) {
							// Search, expanding context for leading sibling combinators
							if (seed = find(token.matches[0].replace(runescape, funescape), rsibling.test(tokens[0].type) && testContext(context.parentNode) || context)) {

								// If seed is empty or no tokens remain, we can return early
								tokens.splice(i, 1);
								selector = seed.length && toSelector(tokens);
								if (!selector) {
									push.apply(results, seed);
									return results;
								}

								break;
							}
						}
					}
				}

				// Compile and execute a filtering function if one is not provided
				// Provide `match` to avoid retokenization if we modified the selector above
				(compiled || compile(selector, match))(seed, context, !documentIsHTML, results, !context || rsibling.test(selector) && testContext(context.parentNode) || context);
				return results;
			};

			// One-time assignments

			// Sort stability
			support.sortStable = expando.split("").sort(sortOrder).join("") === expando;

			// Support: Chrome 14-35+
			// Always assume duplicates if they aren't passed to the comparison function
			support.detectDuplicates = !!hasDuplicate;

			// Initialize against the default document
			setDocument();

			// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
			// Detached nodes confoundingly follow *each other*
			support.sortDetached = assert(function (el) {
				// Should return 1, but returns 4 (following)
				return el.compareDocumentPosition(document.createElement("fieldset")) & 1;
			});

			// Support: IE<8
			// Prevent attribute/property "interpolation"
			// https://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
			if (!assert(function (el) {
				el.innerHTML = "<a href='#'></a>";
				return el.firstChild.getAttribute("href") === "#";
			})) {
				addHandle("type|href|height|width", function (elem, name, isXML) {
					if (!isXML) {
						return elem.getAttribute(name, name.toLowerCase() === "type" ? 1 : 2);
					}
				});
			}

			// Support: IE<9
			// Use defaultValue in place of getAttribute("value")
			if (!support.attributes || !assert(function (el) {
				el.innerHTML = "<input/>";
				el.firstChild.setAttribute("value", "");
				return el.firstChild.getAttribute("value") === "";
			})) {
				addHandle("value", function (elem, name, isXML) {
					if (!isXML && elem.nodeName.toLowerCase() === "input") {
						return elem.defaultValue;
					}
				});
			}

			// Support: IE<9
			// Use getAttributeNode to fetch booleans when getAttribute lies
			if (!assert(function (el) {
				return el.getAttribute("disabled") == null;
			})) {
				addHandle(booleans, function (elem, name, isXML) {
					var val;
					if (!isXML) {
						return elem[name] === true ? name.toLowerCase() : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
					}
				});
			}

			return Sizzle;
		}(window);

		jQuery.find = Sizzle;
		jQuery.expr = Sizzle.selectors;

		// Deprecated
		jQuery.expr[":"] = jQuery.expr.pseudos;
		jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
		jQuery.text = Sizzle.getText;
		jQuery.isXMLDoc = Sizzle.isXML;
		jQuery.contains = Sizzle.contains;
		jQuery.escapeSelector = Sizzle.escape;

		var dir = function dir(elem, _dir, until) {
			var matched = [],
			    truncate = until !== undefined;

			while ((elem = elem[_dir]) && elem.nodeType !== 9) {
				if (elem.nodeType === 1) {
					if (truncate && jQuery(elem).is(until)) {
						break;
					}
					matched.push(elem);
				}
			}
			return matched;
		};

		var _siblings = function _siblings(n, elem) {
			var matched = [];

			for (; n; n = n.nextSibling) {
				if (n.nodeType === 1 && n !== elem) {
					matched.push(n);
				}
			}

			return matched;
		};

		var rneedsContext = jQuery.expr.match.needsContext;

		function nodeName(elem, name) {

			return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
		};
		var rsingleTag = /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;

		var risSimple = /^.[^:#\[\.,]*$/;

		// Implement the identical functionality for filter and not
		function winnow(elements, qualifier, not) {
			if (jQuery.isFunction(qualifier)) {
				return jQuery.grep(elements, function (elem, i) {
					return !!qualifier.call(elem, i, elem) !== not;
				});
			}

			// Single element
			if (qualifier.nodeType) {
				return jQuery.grep(elements, function (elem) {
					return elem === qualifier !== not;
				});
			}

			// Arraylike of elements (jQuery, arguments, Array)
			if (typeof qualifier !== "string") {
				return jQuery.grep(elements, function (elem) {
					return indexOf.call(qualifier, elem) > -1 !== not;
				});
			}

			// Simple selector that can be filtered directly, removing non-Elements
			if (risSimple.test(qualifier)) {
				return jQuery.filter(qualifier, elements, not);
			}

			// Complex selector, compare the two sets, removing non-Elements
			qualifier = jQuery.filter(qualifier, elements);
			return jQuery.grep(elements, function (elem) {
				return indexOf.call(qualifier, elem) > -1 !== not && elem.nodeType === 1;
			});
		}

		jQuery.filter = function (expr, elems, not) {
			var elem = elems[0];

			if (not) {
				expr = ":not(" + expr + ")";
			}

			if (elems.length === 1 && elem.nodeType === 1) {
				return jQuery.find.matchesSelector(elem, expr) ? [elem] : [];
			}

			return jQuery.find.matches(expr, jQuery.grep(elems, function (elem) {
				return elem.nodeType === 1;
			}));
		};

		jQuery.fn.extend({
			find: function find(selector) {
				var i,
				    ret,
				    len = this.length,
				    self = this;

				if (typeof selector !== "string") {
					return this.pushStack(jQuery(selector).filter(function () {
						for (i = 0; i < len; i++) {
							if (jQuery.contains(self[i], this)) {
								return true;
							}
						}
					}));
				}

				ret = this.pushStack([]);

				for (i = 0; i < len; i++) {
					jQuery.find(selector, self[i], ret);
				}

				return len > 1 ? jQuery.uniqueSort(ret) : ret;
			},
			filter: function filter(selector) {
				return this.pushStack(winnow(this, selector || [], false));
			},
			not: function not(selector) {
				return this.pushStack(winnow(this, selector || [], true));
			},
			is: function is(selector) {
				return !!winnow(this,

				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				typeof selector === "string" && rneedsContext.test(selector) ? jQuery(selector) : selector || [], false).length;
			}
		});

		// Initialize a jQuery object


		// A central reference to the root jQuery(document)
		var rootjQuery,


		// A simple way to check for HTML strings
		// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
		// Strict HTML recognition (#11290: must start with <)
		// Shortcut simple #id case for speed
		rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,
		    init = jQuery.fn.init = function (selector, context, root) {
			var match, elem;

			// HANDLE: $(""), $(null), $(undefined), $(false)
			if (!selector) {
				return this;
			}

			// Method init() accepts an alternate rootjQuery
			// so migrate can support jQuery.sub (gh-2101)
			root = root || rootjQuery;

			// Handle HTML strings
			if (typeof selector === "string") {
				if (selector[0] === "<" && selector[selector.length - 1] === ">" && selector.length >= 3) {

					// Assume that strings that start and end with <> are HTML and skip the regex check
					match = [null, selector, null];
				} else {
					match = rquickExpr.exec(selector);
				}

				// Match html or make sure no context is specified for #id
				if (match && (match[1] || !context)) {

					// HANDLE: $(html) -> $(array)
					if (match[1]) {
						context = context instanceof jQuery ? context[0] : context;

						// Option to run scripts is true for back-compat
						// Intentionally let the error be thrown if parseHTML is not present
						jQuery.merge(this, jQuery.parseHTML(match[1], context && context.nodeType ? context.ownerDocument || context : document, true));

						// HANDLE: $(html, props)
						if (rsingleTag.test(match[1]) && jQuery.isPlainObject(context)) {
							for (match in context) {

								// Properties of context are called as methods if possible
								if (jQuery.isFunction(this[match])) {
									this[match](context[match]);

									// ...and otherwise set as attributes
								} else {
									this.attr(match, context[match]);
								}
							}
						}

						return this;

						// HANDLE: $(#id)
					} else {
						elem = document.getElementById(match[2]);

						if (elem) {

							// Inject the element directly into the jQuery object
							this[0] = elem;
							this.length = 1;
						}
						return this;
					}

					// HANDLE: $(expr, $(...))
				} else if (!context || context.jquery) {
					return (context || root).find(selector);

					// HANDLE: $(expr, context)
					// (which is just equivalent to: $(context).find(expr)
				} else {
					return this.constructor(context).find(selector);
				}

				// HANDLE: $(DOMElement)
			} else if (selector.nodeType) {
				this[0] = selector;
				this.length = 1;
				return this;

				// HANDLE: $(function)
				// Shortcut for document ready
			} else if (jQuery.isFunction(selector)) {
				return root.ready !== undefined ? root.ready(selector) :

				// Execute immediately if ready is not present
				selector(jQuery);
			}

			return jQuery.makeArray(selector, this);
		};

		// Give the init function the jQuery prototype for later instantiation
		init.prototype = jQuery.fn;

		// Initialize central reference
		rootjQuery = jQuery(document);

		var rparentsprev = /^(?:parents|prev(?:Until|All))/,


		// Methods guaranteed to produce a unique set when starting from a unique set
		guaranteedUnique = {
			children: true,
			contents: true,
			next: true,
			prev: true
		};

		jQuery.fn.extend({
			has: function has(target) {
				var targets = jQuery(target, this),
				    l = targets.length;

				return this.filter(function () {
					var i = 0;
					for (; i < l; i++) {
						if (jQuery.contains(this, targets[i])) {
							return true;
						}
					}
				});
			},

			closest: function closest(selectors, context) {
				var cur,
				    i = 0,
				    l = this.length,
				    matched = [],
				    targets = typeof selectors !== "string" && jQuery(selectors);

				// Positional selectors never match, since there's no _selection_ context
				if (!rneedsContext.test(selectors)) {
					for (; i < l; i++) {
						for (cur = this[i]; cur && cur !== context; cur = cur.parentNode) {

							// Always skip document fragments
							if (cur.nodeType < 11 && (targets ? targets.index(cur) > -1 :

							// Don't pass non-elements to Sizzle
							cur.nodeType === 1 && jQuery.find.matchesSelector(cur, selectors))) {

								matched.push(cur);
								break;
							}
						}
					}
				}

				return this.pushStack(matched.length > 1 ? jQuery.uniqueSort(matched) : matched);
			},

			// Determine the position of an element within the set
			index: function index(elem) {

				// No argument, return index in parent
				if (!elem) {
					return this[0] && this[0].parentNode ? this.first().prevAll().length : -1;
				}

				// Index in selector
				if (typeof elem === "string") {
					return indexOf.call(jQuery(elem), this[0]);
				}

				// Locate the position of the desired element
				return indexOf.call(this,

				// If it receives a jQuery object, the first element is used
				elem.jquery ? elem[0] : elem);
			},

			add: function add(selector, context) {
				return this.pushStack(jQuery.uniqueSort(jQuery.merge(this.get(), jQuery(selector, context))));
			},

			addBack: function addBack(selector) {
				return this.add(selector == null ? this.prevObject : this.prevObject.filter(selector));
			}
		});

		function sibling(cur, dir) {
			while ((cur = cur[dir]) && cur.nodeType !== 1) {}
			return cur;
		}

		jQuery.each({
			parent: function parent(elem) {
				var parent = elem.parentNode;
				return parent && parent.nodeType !== 11 ? parent : null;
			},
			parents: function parents(elem) {
				return dir(elem, "parentNode");
			},
			parentsUntil: function parentsUntil(elem, i, until) {
				return dir(elem, "parentNode", until);
			},
			next: function next(elem) {
				return sibling(elem, "nextSibling");
			},
			prev: function prev(elem) {
				return sibling(elem, "previousSibling");
			},
			nextAll: function nextAll(elem) {
				return dir(elem, "nextSibling");
			},
			prevAll: function prevAll(elem) {
				return dir(elem, "previousSibling");
			},
			nextUntil: function nextUntil(elem, i, until) {
				return dir(elem, "nextSibling", until);
			},
			prevUntil: function prevUntil(elem, i, until) {
				return dir(elem, "previousSibling", until);
			},
			siblings: function siblings(elem) {
				return _siblings((elem.parentNode || {}).firstChild, elem);
			},
			children: function children(elem) {
				return _siblings(elem.firstChild);
			},
			contents: function contents(elem) {
				if (nodeName(elem, "iframe")) {
					return elem.contentDocument;
				}

				// Support: IE 9 - 11 only, iOS 7 only, Android Browser <=4.3 only
				// Treat the template element as a regular one in browsers that
				// don't support it.
				if (nodeName(elem, "template")) {
					elem = elem.content || elem;
				}

				return jQuery.merge([], elem.childNodes);
			}
		}, function (name, fn) {
			jQuery.fn[name] = function (until, selector) {
				var matched = jQuery.map(this, fn, until);

				if (name.slice(-5) !== "Until") {
					selector = until;
				}

				if (selector && typeof selector === "string") {
					matched = jQuery.filter(selector, matched);
				}

				if (this.length > 1) {

					// Remove duplicates
					if (!guaranteedUnique[name]) {
						jQuery.uniqueSort(matched);
					}

					// Reverse order for parents* and prev-derivatives
					if (rparentsprev.test(name)) {
						matched.reverse();
					}
				}

				return this.pushStack(matched);
			};
		});
		var rnothtmlwhite = /[^\x20\t\r\n\f]+/g;

		// Convert String-formatted options into Object-formatted ones
		function createOptions(options) {
			var object = {};
			jQuery.each(options.match(rnothtmlwhite) || [], function (_, flag) {
				object[flag] = true;
			});
			return object;
		}

		/*
	  * Create a callback list using the following parameters:
	  *
	  *	options: an optional list of space-separated options that will change how
	  *			the callback list behaves or a more traditional option object
	  *
	  * By default a callback list will act like an event callback list and can be
	  * "fired" multiple times.
	  *
	  * Possible options:
	  *
	  *	once:			will ensure the callback list can only be fired once (like a Deferred)
	  *
	  *	memory:			will keep track of previous values and will call any callback added
	  *					after the list has been fired right away with the latest "memorized"
	  *					values (like a Deferred)
	  *
	  *	unique:			will ensure a callback can only be added once (no duplicate in the list)
	  *
	  *	stopOnFalse:	interrupt callings when a callback returns false
	  *
	  */
		jQuery.Callbacks = function (options) {

			// Convert options from String-formatted to Object-formatted if needed
			// (we check in cache first)
			options = typeof options === "string" ? createOptions(options) : jQuery.extend({}, options);

			var // Flag to know if list is currently firing
			firing,


			// Last fire value for non-forgettable lists
			memory,


			// Flag to know if list was already fired
			_fired,


			// Flag to prevent firing
			_locked,


			// Actual callback list
			list = [],


			// Queue of execution data for repeatable lists
			queue = [],


			// Index of currently firing callback (modified by add/remove as needed)
			firingIndex = -1,


			// Fire callbacks
			fire = function fire() {

				// Enforce single-firing
				_locked = _locked || options.once;

				// Execute callbacks for all pending executions,
				// respecting firingIndex overrides and runtime changes
				_fired = firing = true;
				for (; queue.length; firingIndex = -1) {
					memory = queue.shift();
					while (++firingIndex < list.length) {

						// Run callback and check for early termination
						if (list[firingIndex].apply(memory[0], memory[1]) === false && options.stopOnFalse) {

							// Jump to end and forget the data so .add doesn't re-fire
							firingIndex = list.length;
							memory = false;
						}
					}
				}

				// Forget the data if we're done with it
				if (!options.memory) {
					memory = false;
				}

				firing = false;

				// Clean up if we're done firing for good
				if (_locked) {

					// Keep an empty list if we have data for future add calls
					if (memory) {
						list = [];

						// Otherwise, this object is spent
					} else {
						list = "";
					}
				}
			},


			// Actual Callbacks object
			self = {

				// Add a callback or a collection of callbacks to the list
				add: function add() {
					if (list) {

						// If we have memory from a past run, we should fire after adding
						if (memory && !firing) {
							firingIndex = list.length - 1;
							queue.push(memory);
						}

						(function add(args) {
							jQuery.each(args, function (_, arg) {
								if (jQuery.isFunction(arg)) {
									if (!options.unique || !self.has(arg)) {
										list.push(arg);
									}
								} else if (arg && arg.length && jQuery.type(arg) !== "string") {

									// Inspect recursively
									add(arg);
								}
							});
						})(arguments);

						if (memory && !firing) {
							fire();
						}
					}
					return this;
				},

				// Remove a callback from the list
				remove: function remove() {
					jQuery.each(arguments, function (_, arg) {
						var index;
						while ((index = jQuery.inArray(arg, list, index)) > -1) {
							list.splice(index, 1);

							// Handle firing indexes
							if (index <= firingIndex) {
								firingIndex--;
							}
						}
					});
					return this;
				},

				// Check if a given callback is in the list.
				// If no argument is given, return whether or not list has callbacks attached.
				has: function has(fn) {
					return fn ? jQuery.inArray(fn, list) > -1 : list.length > 0;
				},

				// Remove all callbacks from the list
				empty: function empty() {
					if (list) {
						list = [];
					}
					return this;
				},

				// Disable .fire and .add
				// Abort any current/pending executions
				// Clear all callbacks and values
				disable: function disable() {
					_locked = queue = [];
					list = memory = "";
					return this;
				},
				disabled: function disabled() {
					return !list;
				},

				// Disable .fire
				// Also disable .add unless we have memory (since it would have no effect)
				// Abort any pending executions
				lock: function lock() {
					_locked = queue = [];
					if (!memory && !firing) {
						list = memory = "";
					}
					return this;
				},
				locked: function locked() {
					return !!_locked;
				},

				// Call all callbacks with the given context and arguments
				fireWith: function fireWith(context, args) {
					if (!_locked) {
						args = args || [];
						args = [context, args.slice ? args.slice() : args];
						queue.push(args);
						if (!firing) {
							fire();
						}
					}
					return this;
				},

				// Call all the callbacks with the given arguments
				fire: function fire() {
					self.fireWith(this, arguments);
					return this;
				},

				// To know if the callbacks have already been called at least once
				fired: function fired() {
					return !!_fired;
				}
			};

			return self;
		};

		function Identity(v) {
			return v;
		}
		function Thrower(ex) {
			throw ex;
		}

		function adoptValue(value, resolve, reject, noValue) {
			var method;

			try {

				// Check for promise aspect first to privilege synchronous behavior
				if (value && jQuery.isFunction(method = value.promise)) {
					method.call(value).done(resolve).fail(reject);

					// Other thenables
				} else if (value && jQuery.isFunction(method = value.then)) {
					method.call(value, resolve, reject);

					// Other non-thenables
				} else {

					// Control `resolve` arguments by letting Array#slice cast boolean `noValue` to integer:
					// * false: [ value ].slice( 0 ) => resolve( value )
					// * true: [ value ].slice( 1 ) => resolve()
					resolve.apply(undefined, [value].slice(noValue));
				}

				// For Promises/A+, convert exceptions into rejections
				// Since jQuery.when doesn't unwrap thenables, we can skip the extra checks appearing in
				// Deferred#then to conditionally suppress rejection.
			} catch (value) {

				// Support: Android 4.0 only
				// Strict mode functions invoked without .call/.apply get global-object context
				reject.apply(undefined, [value]);
			}
		}

		jQuery.extend({

			Deferred: function Deferred(func) {
				var tuples = [

				// action, add listener, callbacks,
				// ... .then handlers, argument index, [final state]
				["notify", "progress", jQuery.Callbacks("memory"), jQuery.Callbacks("memory"), 2], ["resolve", "done", jQuery.Callbacks("once memory"), jQuery.Callbacks("once memory"), 0, "resolved"], ["reject", "fail", jQuery.Callbacks("once memory"), jQuery.Callbacks("once memory"), 1, "rejected"]],
				    _state = "pending",
				    _promise = {
					state: function state() {
						return _state;
					},
					always: function always() {
						deferred.done(arguments).fail(arguments);
						return this;
					},
					"catch": function _catch(fn) {
						return _promise.then(null, fn);
					},

					// Keep pipe for back-compat
					pipe: function pipe() /* fnDone, fnFail, fnProgress */{
						var fns = arguments;

						return jQuery.Deferred(function (newDefer) {
							jQuery.each(tuples, function (i, tuple) {

								// Map tuples (progress, done, fail) to arguments (done, fail, progress)
								var fn = jQuery.isFunction(fns[tuple[4]]) && fns[tuple[4]];

								// deferred.progress(function() { bind to newDefer or newDefer.notify })
								// deferred.done(function() { bind to newDefer or newDefer.resolve })
								// deferred.fail(function() { bind to newDefer or newDefer.reject })
								deferred[tuple[1]](function () {
									var returned = fn && fn.apply(this, arguments);
									if (returned && jQuery.isFunction(returned.promise)) {
										returned.promise().progress(newDefer.notify).done(newDefer.resolve).fail(newDefer.reject);
									} else {
										newDefer[tuple[0] + "With"](this, fn ? [returned] : arguments);
									}
								});
							});
							fns = null;
						}).promise();
					},
					then: function then(onFulfilled, onRejected, onProgress) {
						var maxDepth = 0;
						function resolve(depth, deferred, handler, special) {
							return function () {
								var that = this,
								    args = arguments,
								    mightThrow = function mightThrow() {
									var returned, then;

									// Support: Promises/A+ section 2.3.3.3.3
									// https://promisesaplus.com/#point-59
									// Ignore double-resolution attempts
									if (depth < maxDepth) {
										return;
									}

									returned = handler.apply(that, args);

									// Support: Promises/A+ section 2.3.1
									// https://promisesaplus.com/#point-48
									if (returned === deferred.promise()) {
										throw new TypeError("Thenable self-resolution");
									}

									// Support: Promises/A+ sections 2.3.3.1, 3.5
									// https://promisesaplus.com/#point-54
									// https://promisesaplus.com/#point-75
									// Retrieve `then` only once
									then = returned && (

									// Support: Promises/A+ section 2.3.4
									// https://promisesaplus.com/#point-64
									// Only check objects and functions for thenability
									(typeof returned === "undefined" ? "undefined" : _typeof(returned)) === "object" || typeof returned === "function") && returned.then;

									// Handle a returned thenable
									if (jQuery.isFunction(then)) {

										// Special processors (notify) just wait for resolution
										if (special) {
											then.call(returned, resolve(maxDepth, deferred, Identity, special), resolve(maxDepth, deferred, Thrower, special));

											// Normal processors (resolve) also hook into progress
										} else {

											// ...and disregard older resolution values
											maxDepth++;

											then.call(returned, resolve(maxDepth, deferred, Identity, special), resolve(maxDepth, deferred, Thrower, special), resolve(maxDepth, deferred, Identity, deferred.notifyWith));
										}

										// Handle all other returned values
									} else {

										// Only substitute handlers pass on context
										// and multiple values (non-spec behavior)
										if (handler !== Identity) {
											that = undefined;
											args = [returned];
										}

										// Process the value(s)
										// Default process is resolve
										(special || deferred.resolveWith)(that, args);
									}
								},


								// Only normal processors (resolve) catch and reject exceptions
								process = special ? mightThrow : function () {
									try {
										mightThrow();
									} catch (e) {

										if (jQuery.Deferred.exceptionHook) {
											jQuery.Deferred.exceptionHook(e, process.stackTrace);
										}

										// Support: Promises/A+ section 2.3.3.3.4.1
										// https://promisesaplus.com/#point-61
										// Ignore post-resolution exceptions
										if (depth + 1 >= maxDepth) {

											// Only substitute handlers pass on context
											// and multiple values (non-spec behavior)
											if (handler !== Thrower) {
												that = undefined;
												args = [e];
											}

											deferred.rejectWith(that, args);
										}
									}
								};

								// Support: Promises/A+ section 2.3.3.3.1
								// https://promisesaplus.com/#point-57
								// Re-resolve promises immediately to dodge false rejection from
								// subsequent errors
								if (depth) {
									process();
								} else {

									// Call an optional hook to record the stack, in case of exception
									// since it's otherwise lost when execution goes async
									if (jQuery.Deferred.getStackHook) {
										process.stackTrace = jQuery.Deferred.getStackHook();
									}
									window.setTimeout(process);
								}
							};
						}

						return jQuery.Deferred(function (newDefer) {

							// progress_handlers.add( ... )
							tuples[0][3].add(resolve(0, newDefer, jQuery.isFunction(onProgress) ? onProgress : Identity, newDefer.notifyWith));

							// fulfilled_handlers.add( ... )
							tuples[1][3].add(resolve(0, newDefer, jQuery.isFunction(onFulfilled) ? onFulfilled : Identity));

							// rejected_handlers.add( ... )
							tuples[2][3].add(resolve(0, newDefer, jQuery.isFunction(onRejected) ? onRejected : Thrower));
						}).promise();
					},

					// Get a promise for this deferred
					// If obj is provided, the promise aspect is added to the object
					promise: function promise(obj) {
						return obj != null ? jQuery.extend(obj, _promise) : _promise;
					}
				},
				    deferred = {};

				// Add list-specific methods
				jQuery.each(tuples, function (i, tuple) {
					var list = tuple[2],
					    stateString = tuple[5];

					// promise.progress = list.add
					// promise.done = list.add
					// promise.fail = list.add
					_promise[tuple[1]] = list.add;

					// Handle state
					if (stateString) {
						list.add(function () {

							// state = "resolved" (i.e., fulfilled)
							// state = "rejected"
							_state = stateString;
						},

						// rejected_callbacks.disable
						// fulfilled_callbacks.disable
						tuples[3 - i][2].disable,

						// progress_callbacks.lock
						tuples[0][2].lock);
					}

					// progress_handlers.fire
					// fulfilled_handlers.fire
					// rejected_handlers.fire
					list.add(tuple[3].fire);

					// deferred.notify = function() { deferred.notifyWith(...) }
					// deferred.resolve = function() { deferred.resolveWith(...) }
					// deferred.reject = function() { deferred.rejectWith(...) }
					deferred[tuple[0]] = function () {
						deferred[tuple[0] + "With"](this === deferred ? undefined : this, arguments);
						return this;
					};

					// deferred.notifyWith = list.fireWith
					// deferred.resolveWith = list.fireWith
					// deferred.rejectWith = list.fireWith
					deferred[tuple[0] + "With"] = list.fireWith;
				});

				// Make the deferred a promise
				_promise.promise(deferred);

				// Call given func if any
				if (func) {
					func.call(deferred, deferred);
				}

				// All done!
				return deferred;
			},

			// Deferred helper
			when: function when(singleValue) {
				var

				// count of uncompleted subordinates
				remaining = arguments.length,


				// count of unprocessed arguments
				i = remaining,


				// subordinate fulfillment data
				resolveContexts = Array(i),
				    resolveValues = _slice.call(arguments),


				// the master Deferred
				master = jQuery.Deferred(),


				// subordinate callback factory
				updateFunc = function updateFunc(i) {
					return function (value) {
						resolveContexts[i] = this;
						resolveValues[i] = arguments.length > 1 ? _slice.call(arguments) : value;
						if (! --remaining) {
							master.resolveWith(resolveContexts, resolveValues);
						}
					};
				};

				// Single- and empty arguments are adopted like Promise.resolve
				if (remaining <= 1) {
					adoptValue(singleValue, master.done(updateFunc(i)).resolve, master.reject, !remaining);

					// Use .then() to unwrap secondary thenables (cf. gh-3000)
					if (master.state() === "pending" || jQuery.isFunction(resolveValues[i] && resolveValues[i].then)) {

						return master.then();
					}
				}

				// Multiple arguments are aggregated like Promise.all array elements
				while (i--) {
					adoptValue(resolveValues[i], updateFunc(i), master.reject);
				}

				return master.promise();
			}
		});

		// These usually indicate a programmer mistake during development,
		// warn about them ASAP rather than swallowing them by default.
		var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;

		jQuery.Deferred.exceptionHook = function (error, stack) {

			// Support: IE 8 - 9 only
			// Console exists when dev tools are open, which can happen at any time
			if (window.console && window.console.warn && error && rerrorNames.test(error.name)) {
				window.console.warn("jQuery.Deferred exception: " + error.message, error.stack, stack);
			}
		};

		jQuery.readyException = function (error) {
			window.setTimeout(function () {
				throw error;
			});
		};

		// The deferred used on DOM ready
		var readyList = jQuery.Deferred();

		jQuery.fn.ready = function (fn) {

			readyList.then(fn)

			// Wrap jQuery.readyException in a function so that the lookup
			// happens at the time of error handling instead of callback
			// registration.
			.catch(function (error) {
				jQuery.readyException(error);
			});

			return this;
		};

		jQuery.extend({

			// Is the DOM ready to be used? Set to true once it occurs.
			isReady: false,

			// A counter to track how many items to wait for before
			// the ready event fires. See #6781
			readyWait: 1,

			// Handle when the DOM is ready
			ready: function ready(wait) {

				// Abort if there are pending holds or we're already ready
				if (wait === true ? --jQuery.readyWait : jQuery.isReady) {
					return;
				}

				// Remember that the DOM is ready
				jQuery.isReady = true;

				// If a normal DOM Ready event fired, decrement, and wait if need be
				if (wait !== true && --jQuery.readyWait > 0) {
					return;
				}

				// If there are functions bound, to execute
				readyList.resolveWith(document, [jQuery]);
			}
		});

		jQuery.ready.then = readyList.then;

		// The ready event handler and self cleanup method
		function completed() {
			document.removeEventListener("DOMContentLoaded", completed);
			window.removeEventListener("load", completed);
			jQuery.ready();
		}

		// Catch cases where $(document).ready() is called
		// after the browser event has already occurred.
		// Support: IE <=9 - 10 only
		// Older IE sometimes signals "interactive" too soon
		if (document.readyState === "complete" || document.readyState !== "loading" && !document.documentElement.doScroll) {

			// Handle it asynchronously to allow scripts the opportunity to delay ready
			window.setTimeout(jQuery.ready);
		} else {

			// Use the handy event callback
			document.addEventListener("DOMContentLoaded", completed);

			// A fallback to window.onload, that will always work
			window.addEventListener("load", completed);
		}

		// Multifunctional method to get and set values of a collection
		// The value/s can optionally be executed if it's a function
		var access = function access(elems, fn, key, value, chainable, emptyGet, raw) {
			var i = 0,
			    len = elems.length,
			    bulk = key == null;

			// Sets many values
			if (jQuery.type(key) === "object") {
				chainable = true;
				for (i in key) {
					access(elems, fn, i, key[i], true, emptyGet, raw);
				}

				// Sets one value
			} else if (value !== undefined) {
				chainable = true;

				if (!jQuery.isFunction(value)) {
					raw = true;
				}

				if (bulk) {

					// Bulk operations run against the entire set
					if (raw) {
						fn.call(elems, value);
						fn = null;

						// ...except when executing function values
					} else {
						bulk = fn;
						fn = function fn(elem, key, value) {
							return bulk.call(jQuery(elem), value);
						};
					}
				}

				if (fn) {
					for (; i < len; i++) {
						fn(elems[i], key, raw ? value : value.call(elems[i], i, fn(elems[i], key)));
					}
				}
			}

			if (chainable) {
				return elems;
			}

			// Gets
			if (bulk) {
				return fn.call(elems);
			}

			return len ? fn(elems[0], key) : emptyGet;
		};
		var acceptData = function acceptData(owner) {

			// Accepts only:
			//  - Node
			//    - Node.ELEMENT_NODE
			//    - Node.DOCUMENT_NODE
			//  - Object
			//    - Any
			return owner.nodeType === 1 || owner.nodeType === 9 || !+owner.nodeType;
		};

		function Data() {
			this.expando = jQuery.expando + Data.uid++;
		}

		Data.uid = 1;

		Data.prototype = {

			cache: function cache(owner) {

				// Check if the owner object already has a cache
				var value = owner[this.expando];

				// If not, create one
				if (!value) {
					value = {};

					// We can accept data for non-element nodes in modern browsers,
					// but we should not, see #8335.
					// Always return an empty object.
					if (acceptData(owner)) {

						// If it is a node unlikely to be stringify-ed or looped over
						// use plain assignment
						if (owner.nodeType) {
							owner[this.expando] = value;

							// Otherwise secure it in a non-enumerable property
							// configurable must be true to allow the property to be
							// deleted when data is removed
						} else {
							Object.defineProperty(owner, this.expando, {
								value: value,
								configurable: true
							});
						}
					}
				}

				return value;
			},
			set: function set(owner, data, value) {
				var prop,
				    cache = this.cache(owner);

				// Handle: [ owner, key, value ] args
				// Always use camelCase key (gh-2257)
				if (typeof data === "string") {
					cache[jQuery.camelCase(data)] = value;

					// Handle: [ owner, { properties } ] args
				} else {

					// Copy the properties one-by-one to the cache object
					for (prop in data) {
						cache[jQuery.camelCase(prop)] = data[prop];
					}
				}
				return cache;
			},
			get: function get(owner, key) {
				return key === undefined ? this.cache(owner) :

				// Always use camelCase key (gh-2257)
				owner[this.expando] && owner[this.expando][jQuery.camelCase(key)];
			},
			access: function access(owner, key, value) {

				// In cases where either:
				//
				//   1. No key was specified
				//   2. A string key was specified, but no value provided
				//
				// Take the "read" path and allow the get method to determine
				// which value to return, respectively either:
				//
				//   1. The entire cache object
				//   2. The data stored at the key
				//
				if (key === undefined || key && typeof key === "string" && value === undefined) {

					return this.get(owner, key);
				}

				// When the key is not a string, or both a key and value
				// are specified, set or extend (existing objects) with either:
				//
				//   1. An object of properties
				//   2. A key and value
				//
				this.set(owner, key, value);

				// Since the "set" path can have two possible entry points
				// return the expected data based on which path was taken[*]
				return value !== undefined ? value : key;
			},
			remove: function remove(owner, key) {
				var i,
				    cache = owner[this.expando];

				if (cache === undefined) {
					return;
				}

				if (key !== undefined) {

					// Support array or space separated string of keys
					if (Array.isArray(key)) {

						// If key is an array of keys...
						// We always set camelCase keys, so remove that.
						key = key.map(jQuery.camelCase);
					} else {
						key = jQuery.camelCase(key);

						// If a key with the spaces exists, use it.
						// Otherwise, create an array by matching non-whitespace
						key = key in cache ? [key] : key.match(rnothtmlwhite) || [];
					}

					i = key.length;

					while (i--) {
						delete cache[key[i]];
					}
				}

				// Remove the expando if there's no more data
				if (key === undefined || jQuery.isEmptyObject(cache)) {

					// Support: Chrome <=35 - 45
					// Webkit & Blink performance suffers when deleting properties
					// from DOM nodes, so set to undefined instead
					// https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
					if (owner.nodeType) {
						owner[this.expando] = undefined;
					} else {
						delete owner[this.expando];
					}
				}
			},
			hasData: function hasData(owner) {
				var cache = owner[this.expando];
				return cache !== undefined && !jQuery.isEmptyObject(cache);
			}
		};
		var dataPriv = new Data();

		var dataUser = new Data();

		//	Implementation Summary
		//
		//	1. Enforce API surface and semantic compatibility with 1.9.x branch
		//	2. Improve the module's maintainability by reducing the storage
		//		paths to a single mechanism.
		//	3. Use the same single mechanism to support "private" and "user" data.
		//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
		//	5. Avoid exposing implementation details on user objects (eg. expando properties)
		//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

		var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
		    rmultiDash = /[A-Z]/g;

		function getData(data) {
			if (data === "true") {
				return true;
			}

			if (data === "false") {
				return false;
			}

			if (data === "null") {
				return null;
			}

			// Only convert to a number if it doesn't change the string
			if (data === +data + "") {
				return +data;
			}

			if (rbrace.test(data)) {
				return JSON.parse(data);
			}

			return data;
		}

		function dataAttr(elem, key, data) {
			var name;

			// If nothing was found internally, try to fetch any
			// data from the HTML5 data-* attribute
			if (data === undefined && elem.nodeType === 1) {
				name = "data-" + key.replace(rmultiDash, "-$&").toLowerCase();
				data = elem.getAttribute(name);

				if (typeof data === "string") {
					try {
						data = getData(data);
					} catch (e) {}

					// Make sure we set the data so it isn't changed later
					dataUser.set(elem, key, data);
				} else {
					data = undefined;
				}
			}
			return data;
		}

		jQuery.extend({
			hasData: function hasData(elem) {
				return dataUser.hasData(elem) || dataPriv.hasData(elem);
			},

			data: function data(elem, name, _data) {
				return dataUser.access(elem, name, _data);
			},

			removeData: function removeData(elem, name) {
				dataUser.remove(elem, name);
			},

			// TODO: Now that all calls to _data and _removeData have been replaced
			// with direct calls to dataPriv methods, these can be deprecated.
			_data: function _data(elem, name, data) {
				return dataPriv.access(elem, name, data);
			},

			_removeData: function _removeData(elem, name) {
				dataPriv.remove(elem, name);
			}
		});

		jQuery.fn.extend({
			data: function data(key, value) {
				var i,
				    name,
				    data,
				    elem = this[0],
				    attrs = elem && elem.attributes;

				// Gets all values
				if (key === undefined) {
					if (this.length) {
						data = dataUser.get(elem);

						if (elem.nodeType === 1 && !dataPriv.get(elem, "hasDataAttrs")) {
							i = attrs.length;
							while (i--) {

								// Support: IE 11 only
								// The attrs elements can be null (#14894)
								if (attrs[i]) {
									name = attrs[i].name;
									if (name.indexOf("data-") === 0) {
										name = jQuery.camelCase(name.slice(5));
										dataAttr(elem, name, data[name]);
									}
								}
							}
							dataPriv.set(elem, "hasDataAttrs", true);
						}
					}

					return data;
				}

				// Sets multiple values
				if ((typeof key === "undefined" ? "undefined" : _typeof(key)) === "object") {
					return this.each(function () {
						dataUser.set(this, key);
					});
				}

				return access(this, function (value) {
					var data;

					// The calling jQuery object (element matches) is not empty
					// (and therefore has an element appears at this[ 0 ]) and the
					// `value` parameter was not undefined. An empty jQuery object
					// will result in `undefined` for elem = this[ 0 ] which will
					// throw an exception if an attempt to read a data cache is made.
					if (elem && value === undefined) {

						// Attempt to get data from the cache
						// The key will always be camelCased in Data
						data = dataUser.get(elem, key);
						if (data !== undefined) {
							return data;
						}

						// Attempt to "discover" the data in
						// HTML5 custom data-* attrs
						data = dataAttr(elem, key);
						if (data !== undefined) {
							return data;
						}

						// We tried really hard, but the data doesn't exist.
						return;
					}

					// Set the data...
					this.each(function () {

						// We always store the camelCased key
						dataUser.set(this, key, value);
					});
				}, null, value, arguments.length > 1, null, true);
			},

			removeData: function removeData(key) {
				return this.each(function () {
					dataUser.remove(this, key);
				});
			}
		});

		jQuery.extend({
			queue: function queue(elem, type, data) {
				var queue;

				if (elem) {
					type = (type || "fx") + "queue";
					queue = dataPriv.get(elem, type);

					// Speed up dequeue by getting out quickly if this is just a lookup
					if (data) {
						if (!queue || Array.isArray(data)) {
							queue = dataPriv.access(elem, type, jQuery.makeArray(data));
						} else {
							queue.push(data);
						}
					}
					return queue || [];
				}
			},

			dequeue: function dequeue(elem, type) {
				type = type || "fx";

				var queue = jQuery.queue(elem, type),
				    startLength = queue.length,
				    fn = queue.shift(),
				    hooks = jQuery._queueHooks(elem, type),
				    next = function next() {
					jQuery.dequeue(elem, type);
				};

				// If the fx queue is dequeued, always remove the progress sentinel
				if (fn === "inprogress") {
					fn = queue.shift();
					startLength--;
				}

				if (fn) {

					// Add a progress sentinel to prevent the fx queue from being
					// automatically dequeued
					if (type === "fx") {
						queue.unshift("inprogress");
					}

					// Clear up the last queue stop function
					delete hooks.stop;
					fn.call(elem, next, hooks);
				}

				if (!startLength && hooks) {
					hooks.empty.fire();
				}
			},

			// Not public - generate a queueHooks object, or return the current one
			_queueHooks: function _queueHooks(elem, type) {
				var key = type + "queueHooks";
				return dataPriv.get(elem, key) || dataPriv.access(elem, key, {
					empty: jQuery.Callbacks("once memory").add(function () {
						dataPriv.remove(elem, [type + "queue", key]);
					})
				});
			}
		});

		jQuery.fn.extend({
			queue: function queue(type, data) {
				var setter = 2;

				if (typeof type !== "string") {
					data = type;
					type = "fx";
					setter--;
				}

				if (arguments.length < setter) {
					return jQuery.queue(this[0], type);
				}

				return data === undefined ? this : this.each(function () {
					var queue = jQuery.queue(this, type, data);

					// Ensure a hooks for this queue
					jQuery._queueHooks(this, type);

					if (type === "fx" && queue[0] !== "inprogress") {
						jQuery.dequeue(this, type);
					}
				});
			},
			dequeue: function dequeue(type) {
				return this.each(function () {
					jQuery.dequeue(this, type);
				});
			},
			clearQueue: function clearQueue(type) {
				return this.queue(type || "fx", []);
			},

			// Get a promise resolved when queues of a certain type
			// are emptied (fx is the type by default)
			promise: function promise(type, obj) {
				var tmp,
				    count = 1,
				    defer = jQuery.Deferred(),
				    elements = this,
				    i = this.length,
				    resolve = function resolve() {
					if (! --count) {
						defer.resolveWith(elements, [elements]);
					}
				};

				if (typeof type !== "string") {
					obj = type;
					type = undefined;
				}
				type = type || "fx";

				while (i--) {
					tmp = dataPriv.get(elements[i], type + "queueHooks");
					if (tmp && tmp.empty) {
						count++;
						tmp.empty.add(resolve);
					}
				}
				resolve();
				return defer.promise(obj);
			}
		});
		var pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;

		var rcssNum = new RegExp("^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i");

		var cssExpand = ["Top", "Right", "Bottom", "Left"];

		var isHiddenWithinTree = function isHiddenWithinTree(elem, el) {

			// isHiddenWithinTree might be called from jQuery#filter function;
			// in that case, element will be second argument
			elem = el || elem;

			// Inline style trumps all
			return elem.style.display === "none" || elem.style.display === "" &&

			// Otherwise, check computed style
			// Support: Firefox <=43 - 45
			// Disconnected elements can have computed display: none, so first confirm that elem is
			// in the document.
			jQuery.contains(elem.ownerDocument, elem) && jQuery.css(elem, "display") === "none";
		};

		var swap = function swap(elem, options, callback, args) {
			var ret,
			    name,
			    old = {};

			// Remember the old values, and insert the new ones
			for (name in options) {
				old[name] = elem.style[name];
				elem.style[name] = options[name];
			}

			ret = callback.apply(elem, args || []);

			// Revert the old values
			for (name in options) {
				elem.style[name] = old[name];
			}

			return ret;
		};

		function adjustCSS(elem, prop, valueParts, tween) {
			var adjusted,
			    scale = 1,
			    maxIterations = 20,
			    currentValue = tween ? function () {
				return tween.cur();
			} : function () {
				return jQuery.css(elem, prop, "");
			},
			    initial = currentValue(),
			    unit = valueParts && valueParts[3] || (jQuery.cssNumber[prop] ? "" : "px"),


			// Starting value computation is required for potential unit mismatches
			initialInUnit = (jQuery.cssNumber[prop] || unit !== "px" && +initial) && rcssNum.exec(jQuery.css(elem, prop));

			if (initialInUnit && initialInUnit[3] !== unit) {

				// Trust units reported by jQuery.css
				unit = unit || initialInUnit[3];

				// Make sure we update the tween properties later on
				valueParts = valueParts || [];

				// Iteratively approximate from a nonzero starting point
				initialInUnit = +initial || 1;

				do {

					// If previous iteration zeroed out, double until we get *something*.
					// Use string for doubling so we don't accidentally see scale as unchanged below
					scale = scale || ".5";

					// Adjust and apply
					initialInUnit = initialInUnit / scale;
					jQuery.style(elem, prop, initialInUnit + unit);

					// Update scale, tolerating zero or NaN from tween.cur()
					// Break the loop if scale is unchanged or perfect, or if we've just had enough.
				} while (scale !== (scale = currentValue() / initial) && scale !== 1 && --maxIterations);
			}

			if (valueParts) {
				initialInUnit = +initialInUnit || +initial || 0;

				// Apply relative offset (+=/-=) if specified
				adjusted = valueParts[1] ? initialInUnit + (valueParts[1] + 1) * valueParts[2] : +valueParts[2];
				if (tween) {
					tween.unit = unit;
					tween.start = initialInUnit;
					tween.end = adjusted;
				}
			}
			return adjusted;
		}

		var defaultDisplayMap = {};

		function getDefaultDisplay(elem) {
			var temp,
			    doc = elem.ownerDocument,
			    nodeName = elem.nodeName,
			    display = defaultDisplayMap[nodeName];

			if (display) {
				return display;
			}

			temp = doc.body.appendChild(doc.createElement(nodeName));
			display = jQuery.css(temp, "display");

			temp.parentNode.removeChild(temp);

			if (display === "none") {
				display = "block";
			}
			defaultDisplayMap[nodeName] = display;

			return display;
		}

		function showHide(elements, show) {
			var display,
			    elem,
			    values = [],
			    index = 0,
			    length = elements.length;

			// Determine new display value for elements that need to change
			for (; index < length; index++) {
				elem = elements[index];
				if (!elem.style) {
					continue;
				}

				display = elem.style.display;
				if (show) {

					// Since we force visibility upon cascade-hidden elements, an immediate (and slow)
					// check is required in this first loop unless we have a nonempty display value (either
					// inline or about-to-be-restored)
					if (display === "none") {
						values[index] = dataPriv.get(elem, "display") || null;
						if (!values[index]) {
							elem.style.display = "";
						}
					}
					if (elem.style.display === "" && isHiddenWithinTree(elem)) {
						values[index] = getDefaultDisplay(elem);
					}
				} else {
					if (display !== "none") {
						values[index] = "none";

						// Remember what we're overwriting
						dataPriv.set(elem, "display", display);
					}
				}
			}

			// Set the display of the elements in a second loop to avoid constant reflow
			for (index = 0; index < length; index++) {
				if (values[index] != null) {
					elements[index].style.display = values[index];
				}
			}

			return elements;
		}

		jQuery.fn.extend({
			show: function show() {
				return showHide(this, true);
			},
			hide: function hide() {
				return showHide(this);
			},
			toggle: function toggle(state) {
				if (typeof state === "boolean") {
					return state ? this.show() : this.hide();
				}

				return this.each(function () {
					if (isHiddenWithinTree(this)) {
						jQuery(this).show();
					} else {
						jQuery(this).hide();
					}
				});
			}
		});
		var rcheckableType = /^(?:checkbox|radio)$/i;

		var rtagName = /<([a-z][^\/\0>\x20\t\r\n\f]+)/i;

		var rscriptType = /^$|\/(?:java|ecma)script/i;

		// We have to close these tags to support XHTML (#13200)
		var wrapMap = {

			// Support: IE <=9 only
			option: [1, "<select multiple='multiple'>", "</select>"],

			// XHTML parsers do not magically insert elements in the
			// same way that tag soup parsers do. So we cannot shorten
			// this by omitting <tbody> or other required elements.
			thead: [1, "<table>", "</table>"],
			col: [2, "<table><colgroup>", "</colgroup></table>"],
			tr: [2, "<table><tbody>", "</tbody></table>"],
			td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],

			_default: [0, "", ""]
		};

		// Support: IE <=9 only
		wrapMap.optgroup = wrapMap.option;

		wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
		wrapMap.th = wrapMap.td;

		function getAll(context, tag) {

			// Support: IE <=9 - 11 only
			// Use typeof to avoid zero-argument method invocation on host objects (#15151)
			var ret;

			if (typeof context.getElementsByTagName !== "undefined") {
				ret = context.getElementsByTagName(tag || "*");
			} else if (typeof context.querySelectorAll !== "undefined") {
				ret = context.querySelectorAll(tag || "*");
			} else {
				ret = [];
			}

			if (tag === undefined || tag && nodeName(context, tag)) {
				return jQuery.merge([context], ret);
			}

			return ret;
		}

		// Mark scripts as having already been evaluated
		function setGlobalEval(elems, refElements) {
			var i = 0,
			    l = elems.length;

			for (; i < l; i++) {
				dataPriv.set(elems[i], "globalEval", !refElements || dataPriv.get(refElements[i], "globalEval"));
			}
		}

		var rhtml = /<|&#?\w+;/;

		function buildFragment(elems, context, scripts, selection, ignored) {
			var elem,
			    tmp,
			    tag,
			    wrap,
			    contains,
			    j,
			    fragment = context.createDocumentFragment(),
			    nodes = [],
			    i = 0,
			    l = elems.length;

			for (; i < l; i++) {
				elem = elems[i];

				if (elem || elem === 0) {

					// Add nodes directly
					if (jQuery.type(elem) === "object") {

						// Support: Android <=4.0 only, PhantomJS 1 only
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge(nodes, elem.nodeType ? [elem] : elem);

						// Convert non-html into a text node
					} else if (!rhtml.test(elem)) {
						nodes.push(context.createTextNode(elem));

						// Convert html into DOM nodes
					} else {
						tmp = tmp || fragment.appendChild(context.createElement("div"));

						// Deserialize a standard representation
						tag = (rtagName.exec(elem) || ["", ""])[1].toLowerCase();
						wrap = wrapMap[tag] || wrapMap._default;
						tmp.innerHTML = wrap[1] + jQuery.htmlPrefilter(elem) + wrap[2];

						// Descend through wrappers to the right content
						j = wrap[0];
						while (j--) {
							tmp = tmp.lastChild;
						}

						// Support: Android <=4.0 only, PhantomJS 1 only
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge(nodes, tmp.childNodes);

						// Remember the top-level container
						tmp = fragment.firstChild;

						// Ensure the created nodes are orphaned (#12392)
						tmp.textContent = "";
					}
				}
			}

			// Remove wrapper from fragment
			fragment.textContent = "";

			i = 0;
			while (elem = nodes[i++]) {

				// Skip elements already in the context collection (trac-4087)
				if (selection && jQuery.inArray(elem, selection) > -1) {
					if (ignored) {
						ignored.push(elem);
					}
					continue;
				}

				contains = jQuery.contains(elem.ownerDocument, elem);

				// Append to fragment
				tmp = getAll(fragment.appendChild(elem), "script");

				// Preserve script evaluation history
				if (contains) {
					setGlobalEval(tmp);
				}

				// Capture executables
				if (scripts) {
					j = 0;
					while (elem = tmp[j++]) {
						if (rscriptType.test(elem.type || "")) {
							scripts.push(elem);
						}
					}
				}
			}

			return fragment;
		}

		(function () {
			var fragment = document.createDocumentFragment(),
			    div = fragment.appendChild(document.createElement("div")),
			    input = document.createElement("input");

			// Support: Android 4.0 - 4.3 only
			// Check state lost if the name is set (#11217)
			// Support: Windows Web Apps (WWA)
			// `name` and `type` must use .setAttribute for WWA (#14901)
			input.setAttribute("type", "radio");
			input.setAttribute("checked", "checked");
			input.setAttribute("name", "t");

			div.appendChild(input);

			// Support: Android <=4.1 only
			// Older WebKit doesn't clone checked state correctly in fragments
			support.checkClone = div.cloneNode(true).cloneNode(true).lastChild.checked;

			// Support: IE <=11 only
			// Make sure textarea (and checkbox) defaultValue is properly cloned
			div.innerHTML = "<textarea>x</textarea>";
			support.noCloneChecked = !!div.cloneNode(true).lastChild.defaultValue;
		})();
		var documentElement = document.documentElement;

		var rkeyEvent = /^key/,
		    rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
		    rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

		function returnTrue() {
			return true;
		}

		function returnFalse() {
			return false;
		}

		// Support: IE <=9 only
		// See #13393 for more info
		function safeActiveElement() {
			try {
				return document.activeElement;
			} catch (err) {}
		}

		function _on(elem, types, selector, data, fn, one) {
			var origFn, type;

			// Types can be a map of types/handlers
			if ((typeof types === "undefined" ? "undefined" : _typeof(types)) === "object") {

				// ( types-Object, selector, data )
				if (typeof selector !== "string") {

					// ( types-Object, data )
					data = data || selector;
					selector = undefined;
				}
				for (type in types) {
					_on(elem, type, selector, data, types[type], one);
				}
				return elem;
			}

			if (data == null && fn == null) {

				// ( types, fn )
				fn = selector;
				data = selector = undefined;
			} else if (fn == null) {
				if (typeof selector === "string") {

					// ( types, selector, fn )
					fn = data;
					data = undefined;
				} else {

					// ( types, data, fn )
					fn = data;
					data = selector;
					selector = undefined;
				}
			}
			if (fn === false) {
				fn = returnFalse;
			} else if (!fn) {
				return elem;
			}

			if (one === 1) {
				origFn = fn;
				fn = function fn(event) {

					// Can use an empty set, since event contains the info
					jQuery().off(event);
					return origFn.apply(this, arguments);
				};

				// Use same guid so caller can remove using origFn
				fn.guid = origFn.guid || (origFn.guid = jQuery.guid++);
			}
			return elem.each(function () {
				jQuery.event.add(this, types, fn, data, selector);
			});
		}

		/*
	  * Helper functions for managing events -- not part of the public interface.
	  * Props to Dean Edwards' addEvent library for many of the ideas.
	  */
		jQuery.event = {

			global: {},

			add: function add(elem, types, handler, data, selector) {

				var handleObjIn,
				    eventHandle,
				    tmp,
				    events,
				    t,
				    handleObj,
				    special,
				    handlers,
				    type,
				    namespaces,
				    origType,
				    elemData = dataPriv.get(elem);

				// Don't attach events to noData or text/comment nodes (but allow plain objects)
				if (!elemData) {
					return;
				}

				// Caller can pass in an object of custom data in lieu of the handler
				if (handler.handler) {
					handleObjIn = handler;
					handler = handleObjIn.handler;
					selector = handleObjIn.selector;
				}

				// Ensure that invalid selectors throw exceptions at attach time
				// Evaluate against documentElement in case elem is a non-element node (e.g., document)
				if (selector) {
					jQuery.find.matchesSelector(documentElement, selector);
				}

				// Make sure that the handler has a unique ID, used to find/remove it later
				if (!handler.guid) {
					handler.guid = jQuery.guid++;
				}

				// Init the element's event structure and main handler, if this is the first
				if (!(events = elemData.events)) {
					events = elemData.events = {};
				}
				if (!(eventHandle = elemData.handle)) {
					eventHandle = elemData.handle = function (e) {

						// Discard the second event of a jQuery.event.trigger() and
						// when an event is called after a page has unloaded
						return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ? jQuery.event.dispatch.apply(elem, arguments) : undefined;
					};
				}

				// Handle multiple events separated by a space
				types = (types || "").match(rnothtmlwhite) || [""];
				t = types.length;
				while (t--) {
					tmp = rtypenamespace.exec(types[t]) || [];
					type = origType = tmp[1];
					namespaces = (tmp[2] || "").split(".").sort();

					// There *must* be a type, no attaching namespace-only handlers
					if (!type) {
						continue;
					}

					// If event changes its type, use the special event handlers for the changed type
					special = jQuery.event.special[type] || {};

					// If selector defined, determine special event api type, otherwise given type
					type = (selector ? special.delegateType : special.bindType) || type;

					// Update special based on newly reset type
					special = jQuery.event.special[type] || {};

					// handleObj is passed to all event handlers
					handleObj = jQuery.extend({
						type: type,
						origType: origType,
						data: data,
						handler: handler,
						guid: handler.guid,
						selector: selector,
						needsContext: selector && jQuery.expr.match.needsContext.test(selector),
						namespace: namespaces.join(".")
					}, handleObjIn);

					// Init the event handler queue if we're the first
					if (!(handlers = events[type])) {
						handlers = events[type] = [];
						handlers.delegateCount = 0;

						// Only use addEventListener if the special events handler returns false
						if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false) {

							if (elem.addEventListener) {
								elem.addEventListener(type, eventHandle);
							}
						}
					}

					if (special.add) {
						special.add.call(elem, handleObj);

						if (!handleObj.handler.guid) {
							handleObj.handler.guid = handler.guid;
						}
					}

					// Add to the element's handler list, delegates in front
					if (selector) {
						handlers.splice(handlers.delegateCount++, 0, handleObj);
					} else {
						handlers.push(handleObj);
					}

					// Keep track of which events have ever been used, for event optimization
					jQuery.event.global[type] = true;
				}
			},

			// Detach an event or set of events from an element
			remove: function remove(elem, types, handler, selector, mappedTypes) {

				var j,
				    origCount,
				    tmp,
				    events,
				    t,
				    handleObj,
				    special,
				    handlers,
				    type,
				    namespaces,
				    origType,
				    elemData = dataPriv.hasData(elem) && dataPriv.get(elem);

				if (!elemData || !(events = elemData.events)) {
					return;
				}

				// Once for each type.namespace in types; type may be omitted
				types = (types || "").match(rnothtmlwhite) || [""];
				t = types.length;
				while (t--) {
					tmp = rtypenamespace.exec(types[t]) || [];
					type = origType = tmp[1];
					namespaces = (tmp[2] || "").split(".").sort();

					// Unbind all events (on this namespace, if provided) for the element
					if (!type) {
						for (type in events) {
							jQuery.event.remove(elem, type + types[t], handler, selector, true);
						}
						continue;
					}

					special = jQuery.event.special[type] || {};
					type = (selector ? special.delegateType : special.bindType) || type;
					handlers = events[type] || [];
					tmp = tmp[2] && new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)");

					// Remove matching events
					origCount = j = handlers.length;
					while (j--) {
						handleObj = handlers[j];

						if ((mappedTypes || origType === handleObj.origType) && (!handler || handler.guid === handleObj.guid) && (!tmp || tmp.test(handleObj.namespace)) && (!selector || selector === handleObj.selector || selector === "**" && handleObj.selector)) {
							handlers.splice(j, 1);

							if (handleObj.selector) {
								handlers.delegateCount--;
							}
							if (special.remove) {
								special.remove.call(elem, handleObj);
							}
						}
					}

					// Remove generic event handler if we removed something and no more handlers exist
					// (avoids potential for endless recursion during removal of special event handlers)
					if (origCount && !handlers.length) {
						if (!special.teardown || special.teardown.call(elem, namespaces, elemData.handle) === false) {

							jQuery.removeEvent(elem, type, elemData.handle);
						}

						delete events[type];
					}
				}

				// Remove data and the expando if it's no longer used
				if (jQuery.isEmptyObject(events)) {
					dataPriv.remove(elem, "handle events");
				}
			},

			dispatch: function dispatch(nativeEvent) {

				// Make a writable jQuery.Event from the native event object
				var event = jQuery.event.fix(nativeEvent);

				var i,
				    j,
				    ret,
				    matched,
				    handleObj,
				    handlerQueue,
				    args = new Array(arguments.length),
				    handlers = (dataPriv.get(this, "events") || {})[event.type] || [],
				    special = jQuery.event.special[event.type] || {};

				// Use the fix-ed jQuery.Event rather than the (read-only) native event
				args[0] = event;

				for (i = 1; i < arguments.length; i++) {
					args[i] = arguments[i];
				}

				event.delegateTarget = this;

				// Call the preDispatch hook for the mapped type, and let it bail if desired
				if (special.preDispatch && special.preDispatch.call(this, event) === false) {
					return;
				}

				// Determine handlers
				handlerQueue = jQuery.event.handlers.call(this, event, handlers);

				// Run delegates first; they may want to stop propagation beneath us
				i = 0;
				while ((matched = handlerQueue[i++]) && !event.isPropagationStopped()) {
					event.currentTarget = matched.elem;

					j = 0;
					while ((handleObj = matched.handlers[j++]) && !event.isImmediatePropagationStopped()) {

						// Triggered event must either 1) have no namespace, or 2) have namespace(s)
						// a subset or equal to those in the bound event (both can have no namespace).
						if (!event.rnamespace || event.rnamespace.test(handleObj.namespace)) {

							event.handleObj = handleObj;
							event.data = handleObj.data;

							ret = ((jQuery.event.special[handleObj.origType] || {}).handle || handleObj.handler).apply(matched.elem, args);

							if (ret !== undefined) {
								if ((event.result = ret) === false) {
									event.preventDefault();
									event.stopPropagation();
								}
							}
						}
					}
				}

				// Call the postDispatch hook for the mapped type
				if (special.postDispatch) {
					special.postDispatch.call(this, event);
				}

				return event.result;
			},

			handlers: function handlers(event, _handlers) {
				var i,
				    handleObj,
				    sel,
				    matchedHandlers,
				    matchedSelectors,
				    handlerQueue = [],
				    delegateCount = _handlers.delegateCount,
				    cur = event.target;

				// Find delegate handlers
				if (delegateCount &&

				// Support: IE <=9
				// Black-hole SVG <use> instance trees (trac-13180)
				cur.nodeType &&

				// Support: Firefox <=42
				// Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
				// https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
				// Support: IE 11 only
				// ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
				!(event.type === "click" && event.button >= 1)) {

					for (; cur !== this; cur = cur.parentNode || this) {

						// Don't check non-elements (#13208)
						// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
						if (cur.nodeType === 1 && !(event.type === "click" && cur.disabled === true)) {
							matchedHandlers = [];
							matchedSelectors = {};
							for (i = 0; i < delegateCount; i++) {
								handleObj = _handlers[i];

								// Don't conflict with Object.prototype properties (#13203)
								sel = handleObj.selector + " ";

								if (matchedSelectors[sel] === undefined) {
									matchedSelectors[sel] = handleObj.needsContext ? jQuery(sel, this).index(cur) > -1 : jQuery.find(sel, this, null, [cur]).length;
								}
								if (matchedSelectors[sel]) {
									matchedHandlers.push(handleObj);
								}
							}
							if (matchedHandlers.length) {
								handlerQueue.push({ elem: cur, handlers: matchedHandlers });
							}
						}
					}
				}

				// Add the remaining (directly-bound) handlers
				cur = this;
				if (delegateCount < _handlers.length) {
					handlerQueue.push({ elem: cur, handlers: _handlers.slice(delegateCount) });
				}

				return handlerQueue;
			},

			addProp: function addProp(name, hook) {
				Object.defineProperty(jQuery.Event.prototype, name, {
					enumerable: true,
					configurable: true,

					get: jQuery.isFunction(hook) ? function () {
						if (this.originalEvent) {
							return hook(this.originalEvent);
						}
					} : function () {
						if (this.originalEvent) {
							return this.originalEvent[name];
						}
					},

					set: function set(value) {
						Object.defineProperty(this, name, {
							enumerable: true,
							configurable: true,
							writable: true,
							value: value
						});
					}
				});
			},

			fix: function fix(originalEvent) {
				return originalEvent[jQuery.expando] ? originalEvent : new jQuery.Event(originalEvent);
			},

			special: {
				load: {

					// Prevent triggered image.load events from bubbling to window.load
					noBubble: true
				},
				focus: {

					// Fire native event if possible so blur/focus sequence is correct
					trigger: function trigger() {
						if (this !== safeActiveElement() && this.focus) {
							this.focus();
							return false;
						}
					},
					delegateType: "focusin"
				},
				blur: {
					trigger: function trigger() {
						if (this === safeActiveElement() && this.blur) {
							this.blur();
							return false;
						}
					},
					delegateType: "focusout"
				},
				click: {

					// For checkbox, fire native event so checked state will be right
					trigger: function trigger() {
						if (this.type === "checkbox" && this.click && nodeName(this, "input")) {
							this.click();
							return false;
						}
					},

					// For cross-browser consistency, don't fire native .click() on links
					_default: function _default(event) {
						return nodeName(event.target, "a");
					}
				},

				beforeunload: {
					postDispatch: function postDispatch(event) {

						// Support: Firefox 20+
						// Firefox doesn't alert if the returnValue field is not set.
						if (event.result !== undefined && event.originalEvent) {
							event.originalEvent.returnValue = event.result;
						}
					}
				}
			}
		};

		jQuery.removeEvent = function (elem, type, handle) {

			// This "if" is needed for plain objects
			if (elem.removeEventListener) {
				elem.removeEventListener(type, handle);
			}
		};

		jQuery.Event = function (src, props) {

			// Allow instantiation without the 'new' keyword
			if (!(this instanceof jQuery.Event)) {
				return new jQuery.Event(src, props);
			}

			// Event object
			if (src && src.type) {
				this.originalEvent = src;
				this.type = src.type;

				// Events bubbling up the document may have been marked as prevented
				// by a handler lower down the tree; reflect the correct value.
				this.isDefaultPrevented = src.defaultPrevented || src.defaultPrevented === undefined &&

				// Support: Android <=2.3 only
				src.returnValue === false ? returnTrue : returnFalse;

				// Create target properties
				// Support: Safari <=6 - 7 only
				// Target should not be a text node (#504, #13143)
				this.target = src.target && src.target.nodeType === 3 ? src.target.parentNode : src.target;

				this.currentTarget = src.currentTarget;
				this.relatedTarget = src.relatedTarget;

				// Event type
			} else {
				this.type = src;
			}

			// Put explicitly provided properties onto the event object
			if (props) {
				jQuery.extend(this, props);
			}

			// Create a timestamp if incoming event doesn't have one
			this.timeStamp = src && src.timeStamp || jQuery.now();

			// Mark it as fixed
			this[jQuery.expando] = true;
		};

		// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
		// https://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
		jQuery.Event.prototype = {
			constructor: jQuery.Event,
			isDefaultPrevented: returnFalse,
			isPropagationStopped: returnFalse,
			isImmediatePropagationStopped: returnFalse,
			isSimulated: false,

			preventDefault: function preventDefault() {
				var e = this.originalEvent;

				this.isDefaultPrevented = returnTrue;

				if (e && !this.isSimulated) {
					e.preventDefault();
				}
			},
			stopPropagation: function stopPropagation() {
				var e = this.originalEvent;

				this.isPropagationStopped = returnTrue;

				if (e && !this.isSimulated) {
					e.stopPropagation();
				}
			},
			stopImmediatePropagation: function stopImmediatePropagation() {
				var e = this.originalEvent;

				this.isImmediatePropagationStopped = returnTrue;

				if (e && !this.isSimulated) {
					e.stopImmediatePropagation();
				}

				this.stopPropagation();
			}
		};

		// Includes all common event props including KeyEvent and MouseEvent specific props
		jQuery.each({
			altKey: true,
			bubbles: true,
			cancelable: true,
			changedTouches: true,
			ctrlKey: true,
			detail: true,
			eventPhase: true,
			metaKey: true,
			pageX: true,
			pageY: true,
			shiftKey: true,
			view: true,
			"char": true,
			charCode: true,
			key: true,
			keyCode: true,
			button: true,
			buttons: true,
			clientX: true,
			clientY: true,
			offsetX: true,
			offsetY: true,
			pointerId: true,
			pointerType: true,
			screenX: true,
			screenY: true,
			targetTouches: true,
			toElement: true,
			touches: true,

			which: function which(event) {
				var button = event.button;

				// Add which for key events
				if (event.which == null && rkeyEvent.test(event.type)) {
					return event.charCode != null ? event.charCode : event.keyCode;
				}

				// Add which for click: 1 === left; 2 === middle; 3 === right
				if (!event.which && button !== undefined && rmouseEvent.test(event.type)) {
					if (button & 1) {
						return 1;
					}

					if (button & 2) {
						return 3;
					}

					if (button & 4) {
						return 2;
					}

					return 0;
				}

				return event.which;
			}
		}, jQuery.event.addProp);

		// Create mouseenter/leave events using mouseover/out and event-time checks
		// so that event delegation works in jQuery.
		// Do the same for pointerenter/pointerleave and pointerover/pointerout
		//
		// Support: Safari 7 only
		// Safari sends mouseenter too often; see:
		// https://bugs.chromium.org/p/chromium/issues/detail?id=470258
		// for the description of the bug (it existed in older Chrome versions as well).
		jQuery.each({
			mouseenter: "mouseover",
			mouseleave: "mouseout",
			pointerenter: "pointerover",
			pointerleave: "pointerout"
		}, function (orig, fix) {
			jQuery.event.special[orig] = {
				delegateType: fix,
				bindType: fix,

				handle: function handle(event) {
					var ret,
					    target = this,
					    related = event.relatedTarget,
					    handleObj = event.handleObj;

					// For mouseenter/leave call the handler if related is outside the target.
					// NB: No relatedTarget if the mouse left/entered the browser window
					if (!related || related !== target && !jQuery.contains(target, related)) {
						event.type = handleObj.origType;
						ret = handleObj.handler.apply(this, arguments);
						event.type = fix;
					}
					return ret;
				}
			};
		});

		jQuery.fn.extend({

			on: function on(types, selector, data, fn) {
				return _on(this, types, selector, data, fn);
			},
			one: function one(types, selector, data, fn) {
				return _on(this, types, selector, data, fn, 1);
			},
			off: function off(types, selector, fn) {
				var handleObj, type;
				if (types && types.preventDefault && types.handleObj) {

					// ( event )  dispatched jQuery.Event
					handleObj = types.handleObj;
					jQuery(types.delegateTarget).off(handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType, handleObj.selector, handleObj.handler);
					return this;
				}
				if ((typeof types === "undefined" ? "undefined" : _typeof(types)) === "object") {

					// ( types-object [, selector] )
					for (type in types) {
						this.off(type, selector, types[type]);
					}
					return this;
				}
				if (selector === false || typeof selector === "function") {

					// ( types [, fn] )
					fn = selector;
					selector = undefined;
				}
				if (fn === false) {
					fn = returnFalse;
				}
				return this.each(function () {
					jQuery.event.remove(this, types, fn, selector);
				});
			}
		});

		var

		/* eslint-disable max-len */

		// See https://github.com/eslint/eslint/issues/3229
		rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi,


		/* eslint-enable */

		// Support: IE <=10 - 11, Edge 12 - 13
		// In IE/Edge using regex groups here causes severe slowdowns.
		// See https://connect.microsoft.com/IE/feedback/details/1736512/
		rnoInnerhtml = /<script|<style|<link/i,


		// checked="checked" or checked
		rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
		    rscriptTypeMasked = /^true\/(.*)/,
		    rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

		// Prefer a tbody over its parent table for containing new rows
		function manipulationTarget(elem, content) {
			if (nodeName(elem, "table") && nodeName(content.nodeType !== 11 ? content : content.firstChild, "tr")) {

				return jQuery(">tbody", elem)[0] || elem;
			}

			return elem;
		}

		// Replace/restore the type attribute of script elements for safe DOM manipulation
		function disableScript(elem) {
			elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
			return elem;
		}
		function restoreScript(elem) {
			var match = rscriptTypeMasked.exec(elem.type);

			if (match) {
				elem.type = match[1];
			} else {
				elem.removeAttribute("type");
			}

			return elem;
		}

		function cloneCopyEvent(src, dest) {
			var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

			if (dest.nodeType !== 1) {
				return;
			}

			// 1. Copy private data: events, handlers, etc.
			if (dataPriv.hasData(src)) {
				pdataOld = dataPriv.access(src);
				pdataCur = dataPriv.set(dest, pdataOld);
				events = pdataOld.events;

				if (events) {
					delete pdataCur.handle;
					pdataCur.events = {};

					for (type in events) {
						for (i = 0, l = events[type].length; i < l; i++) {
							jQuery.event.add(dest, type, events[type][i]);
						}
					}
				}
			}

			// 2. Copy user data
			if (dataUser.hasData(src)) {
				udataOld = dataUser.access(src);
				udataCur = jQuery.extend({}, udataOld);

				dataUser.set(dest, udataCur);
			}
		}

		// Fix IE bugs, see support tests
		function fixInput(src, dest) {
			var nodeName = dest.nodeName.toLowerCase();

			// Fails to persist the checked state of a cloned checkbox or radio button.
			if (nodeName === "input" && rcheckableType.test(src.type)) {
				dest.checked = src.checked;

				// Fails to return the selected option to the default selected state when cloning options
			} else if (nodeName === "input" || nodeName === "textarea") {
				dest.defaultValue = src.defaultValue;
			}
		}

		function domManip(collection, args, callback, ignored) {

			// Flatten any nested arrays
			args = concat.apply([], args);

			var fragment,
			    first,
			    scripts,
			    hasScripts,
			    node,
			    doc,
			    i = 0,
			    l = collection.length,
			    iNoClone = l - 1,
			    value = args[0],
			    isFunction = jQuery.isFunction(value);

			// We can't cloneNode fragments that contain checked, in WebKit
			if (isFunction || l > 1 && typeof value === "string" && !support.checkClone && rchecked.test(value)) {
				return collection.each(function (index) {
					var self = collection.eq(index);
					if (isFunction) {
						args[0] = value.call(this, index, self.html());
					}
					domManip(self, args, callback, ignored);
				});
			}

			if (l) {
				fragment = buildFragment(args, collection[0].ownerDocument, false, collection, ignored);
				first = fragment.firstChild;

				if (fragment.childNodes.length === 1) {
					fragment = first;
				}

				// Require either new content or an interest in ignored elements to invoke the callback
				if (first || ignored) {
					scripts = jQuery.map(getAll(fragment, "script"), disableScript);
					hasScripts = scripts.length;

					// Use the original fragment for the last item
					// instead of the first because it can end up
					// being emptied incorrectly in certain situations (#8070).
					for (; i < l; i++) {
						node = fragment;

						if (i !== iNoClone) {
							node = jQuery.clone(node, true, true);

							// Keep references to cloned scripts for later restoration
							if (hasScripts) {

								// Support: Android <=4.0 only, PhantomJS 1 only
								// push.apply(_, arraylike) throws on ancient WebKit
								jQuery.merge(scripts, getAll(node, "script"));
							}
						}

						callback.call(collection[i], node, i);
					}

					if (hasScripts) {
						doc = scripts[scripts.length - 1].ownerDocument;

						// Reenable scripts
						jQuery.map(scripts, restoreScript);

						// Evaluate executable scripts on first document insertion
						for (i = 0; i < hasScripts; i++) {
							node = scripts[i];
							if (rscriptType.test(node.type || "") && !dataPriv.access(node, "globalEval") && jQuery.contains(doc, node)) {

								if (node.src) {

									// Optional AJAX dependency, but won't run scripts if not present
									if (jQuery._evalUrl) {
										jQuery._evalUrl(node.src);
									}
								} else {
									DOMEval(node.textContent.replace(rcleanScript, ""), doc);
								}
							}
						}
					}
				}
			}

			return collection;
		}

		function _remove(elem, selector, keepData) {
			var node,
			    nodes = selector ? jQuery.filter(selector, elem) : elem,
			    i = 0;

			for (; (node = nodes[i]) != null; i++) {
				if (!keepData && node.nodeType === 1) {
					jQuery.cleanData(getAll(node));
				}

				if (node.parentNode) {
					if (keepData && jQuery.contains(node.ownerDocument, node)) {
						setGlobalEval(getAll(node, "script"));
					}
					node.parentNode.removeChild(node);
				}
			}

			return elem;
		}

		jQuery.extend({
			htmlPrefilter: function htmlPrefilter(html) {
				return html.replace(rxhtmlTag, "<$1></$2>");
			},

			clone: function clone(elem, dataAndEvents, deepDataAndEvents) {
				var i,
				    l,
				    srcElements,
				    destElements,
				    clone = elem.cloneNode(true),
				    inPage = jQuery.contains(elem.ownerDocument, elem);

				// Fix IE cloning issues
				if (!support.noCloneChecked && (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem)) {

					// We eschew Sizzle here for performance reasons: https://jsperf.com/getall-vs-sizzle/2
					destElements = getAll(clone);
					srcElements = getAll(elem);

					for (i = 0, l = srcElements.length; i < l; i++) {
						fixInput(srcElements[i], destElements[i]);
					}
				}

				// Copy the events from the original to the clone
				if (dataAndEvents) {
					if (deepDataAndEvents) {
						srcElements = srcElements || getAll(elem);
						destElements = destElements || getAll(clone);

						for (i = 0, l = srcElements.length; i < l; i++) {
							cloneCopyEvent(srcElements[i], destElements[i]);
						}
					} else {
						cloneCopyEvent(elem, clone);
					}
				}

				// Preserve script evaluation history
				destElements = getAll(clone, "script");
				if (destElements.length > 0) {
					setGlobalEval(destElements, !inPage && getAll(elem, "script"));
				}

				// Return the cloned set
				return clone;
			},

			cleanData: function cleanData(elems) {
				var data,
				    elem,
				    type,
				    special = jQuery.event.special,
				    i = 0;

				for (; (elem = elems[i]) !== undefined; i++) {
					if (acceptData(elem)) {
						if (data = elem[dataPriv.expando]) {
							if (data.events) {
								for (type in data.events) {
									if (special[type]) {
										jQuery.event.remove(elem, type);

										// This is a shortcut to avoid jQuery.event.remove's overhead
									} else {
										jQuery.removeEvent(elem, type, data.handle);
									}
								}
							}

							// Support: Chrome <=35 - 45+
							// Assign undefined instead of using delete, see Data#remove
							elem[dataPriv.expando] = undefined;
						}
						if (elem[dataUser.expando]) {

							// Support: Chrome <=35 - 45+
							// Assign undefined instead of using delete, see Data#remove
							elem[dataUser.expando] = undefined;
						}
					}
				}
			}
		});

		jQuery.fn.extend({
			detach: function detach(selector) {
				return _remove(this, selector, true);
			},

			remove: function remove(selector) {
				return _remove(this, selector);
			},

			text: function text(value) {
				return access(this, function (value) {
					return value === undefined ? jQuery.text(this) : this.empty().each(function () {
						if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
							this.textContent = value;
						}
					});
				}, null, value, arguments.length);
			},

			append: function append() {
				return domManip(this, arguments, function (elem) {
					if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
						var target = manipulationTarget(this, elem);
						target.appendChild(elem);
					}
				});
			},

			prepend: function prepend() {
				return domManip(this, arguments, function (elem) {
					if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
						var target = manipulationTarget(this, elem);
						target.insertBefore(elem, target.firstChild);
					}
				});
			},

			before: function before() {
				return domManip(this, arguments, function (elem) {
					if (this.parentNode) {
						this.parentNode.insertBefore(elem, this);
					}
				});
			},

			after: function after() {
				return domManip(this, arguments, function (elem) {
					if (this.parentNode) {
						this.parentNode.insertBefore(elem, this.nextSibling);
					}
				});
			},

			empty: function empty() {
				var elem,
				    i = 0;

				for (; (elem = this[i]) != null; i++) {
					if (elem.nodeType === 1) {

						// Prevent memory leaks
						jQuery.cleanData(getAll(elem, false));

						// Remove any remaining nodes
						elem.textContent = "";
					}
				}

				return this;
			},

			clone: function clone(dataAndEvents, deepDataAndEvents) {
				dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
				deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

				return this.map(function () {
					return jQuery.clone(this, dataAndEvents, deepDataAndEvents);
				});
			},

			html: function html(value) {
				return access(this, function (value) {
					var elem = this[0] || {},
					    i = 0,
					    l = this.length;

					if (value === undefined && elem.nodeType === 1) {
						return elem.innerHTML;
					}

					// See if we can take a shortcut and just use innerHTML
					if (typeof value === "string" && !rnoInnerhtml.test(value) && !wrapMap[(rtagName.exec(value) || ["", ""])[1].toLowerCase()]) {

						value = jQuery.htmlPrefilter(value);

						try {
							for (; i < l; i++) {
								elem = this[i] || {};

								// Remove element nodes and prevent memory leaks
								if (elem.nodeType === 1) {
									jQuery.cleanData(getAll(elem, false));
									elem.innerHTML = value;
								}
							}

							elem = 0;

							// If using innerHTML throws an exception, use the fallback method
						} catch (e) {}
					}

					if (elem) {
						this.empty().append(value);
					}
				}, null, value, arguments.length);
			},

			replaceWith: function replaceWith() {
				var ignored = [];

				// Make the changes, replacing each non-ignored context element with the new content
				return domManip(this, arguments, function (elem) {
					var parent = this.parentNode;

					if (jQuery.inArray(this, ignored) < 0) {
						jQuery.cleanData(getAll(this));
						if (parent) {
							parent.replaceChild(elem, this);
						}
					}

					// Force callback invocation
				}, ignored);
			}
		});

		jQuery.each({
			appendTo: "append",
			prependTo: "prepend",
			insertBefore: "before",
			insertAfter: "after",
			replaceAll: "replaceWith"
		}, function (name, original) {
			jQuery.fn[name] = function (selector) {
				var elems,
				    ret = [],
				    insert = jQuery(selector),
				    last = insert.length - 1,
				    i = 0;

				for (; i <= last; i++) {
					elems = i === last ? this : this.clone(true);
					jQuery(insert[i])[original](elems);

					// Support: Android <=4.0 only, PhantomJS 1 only
					// .get() because push.apply(_, arraylike) throws on ancient WebKit
					push.apply(ret, elems.get());
				}

				return this.pushStack(ret);
			};
		});
		var rmargin = /^margin/;

		var rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i");

		var getStyles = function getStyles(elem) {

			// Support: IE <=11 only, Firefox <=30 (#15098, #14150)
			// IE throws on elements created in popups
			// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
			var view = elem.ownerDocument.defaultView;

			if (!view || !view.opener) {
				view = window;
			}

			return view.getComputedStyle(elem);
		};

		(function () {

			// Executing both pixelPosition & boxSizingReliable tests require only one layout
			// so they're executed at the same time to save the second computation.
			function computeStyleTests() {

				// This is a singleton, we need to execute it only once
				if (!div) {
					return;
				}

				div.style.cssText = "box-sizing:border-box;" + "position:relative;display:block;" + "margin:auto;border:1px;padding:1px;" + "top:1%;width:50%";
				div.innerHTML = "";
				documentElement.appendChild(container);

				var divStyle = window.getComputedStyle(div);
				pixelPositionVal = divStyle.top !== "1%";

				// Support: Android 4.0 - 4.3 only, Firefox <=3 - 44
				reliableMarginLeftVal = divStyle.marginLeft === "2px";
				boxSizingReliableVal = divStyle.width === "4px";

				// Support: Android 4.0 - 4.3 only
				// Some styles come back with percentage values, even though they shouldn't
				div.style.marginRight = "50%";
				pixelMarginRightVal = divStyle.marginRight === "4px";

				documentElement.removeChild(container);

				// Nullify the div so it wouldn't be stored in the memory and
				// it will also be a sign that checks already performed
				div = null;
			}

			var pixelPositionVal,
			    boxSizingReliableVal,
			    pixelMarginRightVal,
			    reliableMarginLeftVal,
			    container = document.createElement("div"),
			    div = document.createElement("div");

			// Finish early in limited (non-browser) environments
			if (!div.style) {
				return;
			}

			// Support: IE <=9 - 11 only
			// Style of cloned element affects source element cloned (#8908)
			div.style.backgroundClip = "content-box";
			div.cloneNode(true).style.backgroundClip = "";
			support.clearCloneStyle = div.style.backgroundClip === "content-box";

			container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" + "padding:0;margin-top:1px;position:absolute";
			container.appendChild(div);

			jQuery.extend(support, {
				pixelPosition: function pixelPosition() {
					computeStyleTests();
					return pixelPositionVal;
				},
				boxSizingReliable: function boxSizingReliable() {
					computeStyleTests();
					return boxSizingReliableVal;
				},
				pixelMarginRight: function pixelMarginRight() {
					computeStyleTests();
					return pixelMarginRightVal;
				},
				reliableMarginLeft: function reliableMarginLeft() {
					computeStyleTests();
					return reliableMarginLeftVal;
				}
			});
		})();

		function curCSS(elem, name, computed) {
			var width,
			    minWidth,
			    maxWidth,
			    ret,


			// Support: Firefox 51+
			// Retrieving style before computed somehow
			// fixes an issue with getting wrong values
			// on detached elements
			style = elem.style;

			computed = computed || getStyles(elem);

			// getPropertyValue is needed for:
			//   .css('filter') (IE 9 only, #12537)
			//   .css('--customProperty) (#3144)
			if (computed) {
				ret = computed.getPropertyValue(name) || computed[name];

				if (ret === "" && !jQuery.contains(elem.ownerDocument, elem)) {
					ret = jQuery.style(elem, name);
				}

				// A tribute to the "awesome hack by Dean Edwards"
				// Android Browser returns percentage for some values,
				// but width seems to be reliably pixels.
				// This is against the CSSOM draft spec:
				// https://drafts.csswg.org/cssom/#resolved-values
				if (!support.pixelMarginRight() && rnumnonpx.test(ret) && rmargin.test(name)) {

					// Remember the original values
					width = style.width;
					minWidth = style.minWidth;
					maxWidth = style.maxWidth;

					// Put in the new values to get a computed value out
					style.minWidth = style.maxWidth = style.width = ret;
					ret = computed.width;

					// Revert the changed values
					style.width = width;
					style.minWidth = minWidth;
					style.maxWidth = maxWidth;
				}
			}

			return ret !== undefined ?

			// Support: IE <=9 - 11 only
			// IE returns zIndex value as an integer.
			ret + "" : ret;
		}

		function addGetHookIf(conditionFn, hookFn) {

			// Define the hook, we'll check on the first run if it's really needed.
			return {
				get: function get() {
					if (conditionFn()) {

						// Hook not needed (or it's not possible to use it due
						// to missing dependency), remove it.
						delete this.get;
						return;
					}

					// Hook needed; redefine it so that the support test is not executed again.
					return (this.get = hookFn).apply(this, arguments);
				}
			};
		}

		var

		// Swappable if display is none or starts with table
		// except "table", "table-cell", or "table-caption"
		// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
		rdisplayswap = /^(none|table(?!-c[ea]).+)/,
		    rcustomProp = /^--/,
		    cssShow = { position: "absolute", visibility: "hidden", display: "block" },
		    cssNormalTransform = {
			letterSpacing: "0",
			fontWeight: "400"
		},
		    cssPrefixes = ["Webkit", "Moz", "ms"],
		    emptyStyle = document.createElement("div").style;

		// Return a css property mapped to a potentially vendor prefixed property
		function vendorPropName(name) {

			// Shortcut for names that are not vendor prefixed
			if (name in emptyStyle) {
				return name;
			}

			// Check for vendor prefixed names
			var capName = name[0].toUpperCase() + name.slice(1),
			    i = cssPrefixes.length;

			while (i--) {
				name = cssPrefixes[i] + capName;
				if (name in emptyStyle) {
					return name;
				}
			}
		}

		// Return a property mapped along what jQuery.cssProps suggests or to
		// a vendor prefixed property.
		function finalPropName(name) {
			var ret = jQuery.cssProps[name];
			if (!ret) {
				ret = jQuery.cssProps[name] = vendorPropName(name) || name;
			}
			return ret;
		}

		function setPositiveNumber(elem, value, subtract) {

			// Any relative (+/-) values have already been
			// normalized at this point
			var matches = rcssNum.exec(value);
			return matches ?

			// Guard against undefined "subtract", e.g., when used as in cssHooks
			Math.max(0, matches[2] - (subtract || 0)) + (matches[3] || "px") : value;
		}

		function augmentWidthOrHeight(elem, name, extra, isBorderBox, styles) {
			var i,
			    val = 0;

			// If we already have the right measurement, avoid augmentation
			if (extra === (isBorderBox ? "border" : "content")) {
				i = 4;

				// Otherwise initialize for horizontal or vertical properties
			} else {
				i = name === "width" ? 1 : 0;
			}

			for (; i < 4; i += 2) {

				// Both box models exclude margin, so add it if we want it
				if (extra === "margin") {
					val += jQuery.css(elem, extra + cssExpand[i], true, styles);
				}

				if (isBorderBox) {

					// border-box includes padding, so remove it if we want content
					if (extra === "content") {
						val -= jQuery.css(elem, "padding" + cssExpand[i], true, styles);
					}

					// At this point, extra isn't border nor margin, so remove border
					if (extra !== "margin") {
						val -= jQuery.css(elem, "border" + cssExpand[i] + "Width", true, styles);
					}
				} else {

					// At this point, extra isn't content, so add padding
					val += jQuery.css(elem, "padding" + cssExpand[i], true, styles);

					// At this point, extra isn't content nor padding, so add border
					if (extra !== "padding") {
						val += jQuery.css(elem, "border" + cssExpand[i] + "Width", true, styles);
					}
				}
			}

			return val;
		}

		function getWidthOrHeight(elem, name, extra) {

			// Start with computed style
			var valueIsBorderBox,
			    styles = getStyles(elem),
			    val = curCSS(elem, name, styles),
			    isBorderBox = jQuery.css(elem, "boxSizing", false, styles) === "border-box";

			// Computed unit is not pixels. Stop here and return.
			if (rnumnonpx.test(val)) {
				return val;
			}

			// Check for style in case a browser which returns unreliable values
			// for getComputedStyle silently falls back to the reliable elem.style
			valueIsBorderBox = isBorderBox && (support.boxSizingReliable() || val === elem.style[name]);

			// Fall back to offsetWidth/Height when value is "auto"
			// This happens for inline elements with no explicit setting (gh-3571)
			if (val === "auto") {
				val = elem["offset" + name[0].toUpperCase() + name.slice(1)];
			}

			// Normalize "", auto, and prepare for extra
			val = parseFloat(val) || 0;

			// Use the active box-sizing model to add/subtract irrelevant styles
			return val + augmentWidthOrHeight(elem, name, extra || (isBorderBox ? "border" : "content"), valueIsBorderBox, styles) + "px";
		}

		jQuery.extend({

			// Add in style property hooks for overriding the default
			// behavior of getting and setting a style property
			cssHooks: {
				opacity: {
					get: function get(elem, computed) {
						if (computed) {

							// We should always get a number back from opacity
							var ret = curCSS(elem, "opacity");
							return ret === "" ? "1" : ret;
						}
					}
				}
			},

			// Don't automatically add "px" to these possibly-unitless properties
			cssNumber: {
				"animationIterationCount": true,
				"columnCount": true,
				"fillOpacity": true,
				"flexGrow": true,
				"flexShrink": true,
				"fontWeight": true,
				"lineHeight": true,
				"opacity": true,
				"order": true,
				"orphans": true,
				"widows": true,
				"zIndex": true,
				"zoom": true
			},

			// Add in properties whose names you wish to fix before
			// setting or getting the value
			cssProps: {
				"float": "cssFloat"
			},

			// Get and set the style property on a DOM Node
			style: function style(elem, name, value, extra) {

				// Don't set styles on text and comment nodes
				if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
					return;
				}

				// Make sure that we're working with the right name
				var ret,
				    type,
				    hooks,
				    origName = jQuery.camelCase(name),
				    isCustomProp = rcustomProp.test(name),
				    style = elem.style;

				// Make sure that we're working with the right name. We don't
				// want to query the value if it is a CSS custom property
				// since they are user-defined.
				if (!isCustomProp) {
					name = finalPropName(origName);
				}

				// Gets hook for the prefixed version, then unprefixed version
				hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];

				// Check if we're setting a value
				if (value !== undefined) {
					type = typeof value === "undefined" ? "undefined" : _typeof(value);

					// Convert "+=" or "-=" to relative numbers (#7345)
					if (type === "string" && (ret = rcssNum.exec(value)) && ret[1]) {
						value = adjustCSS(elem, name, ret);

						// Fixes bug #9237
						type = "number";
					}

					// Make sure that null and NaN values aren't set (#7116)
					if (value == null || value !== value) {
						return;
					}

					// If a number was passed in, add the unit (except for certain CSS properties)
					if (type === "number") {
						value += ret && ret[3] || (jQuery.cssNumber[origName] ? "" : "px");
					}

					// background-* props affect original clone's values
					if (!support.clearCloneStyle && value === "" && name.indexOf("background") === 0) {
						style[name] = "inherit";
					}

					// If a hook was provided, use that value, otherwise just set the specified value
					if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value, extra)) !== undefined) {

						if (isCustomProp) {
							style.setProperty(name, value);
						} else {
							style[name] = value;
						}
					}
				} else {

					// If a hook was provided get the non-computed value from there
					if (hooks && "get" in hooks && (ret = hooks.get(elem, false, extra)) !== undefined) {

						return ret;
					}

					// Otherwise just get the value from the style object
					return style[name];
				}
			},

			css: function css(elem, name, extra, styles) {
				var val,
				    num,
				    hooks,
				    origName = jQuery.camelCase(name),
				    isCustomProp = rcustomProp.test(name);

				// Make sure that we're working with the right name. We don't
				// want to modify the value if it is a CSS custom property
				// since they are user-defined.
				if (!isCustomProp) {
					name = finalPropName(origName);
				}

				// Try prefixed name followed by the unprefixed name
				hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];

				// If a hook was provided get the computed value from there
				if (hooks && "get" in hooks) {
					val = hooks.get(elem, true, extra);
				}

				// Otherwise, if a way to get the computed value exists, use that
				if (val === undefined) {
					val = curCSS(elem, name, styles);
				}

				// Convert "normal" to computed value
				if (val === "normal" && name in cssNormalTransform) {
					val = cssNormalTransform[name];
				}

				// Make numeric if forced or a qualifier was provided and val looks numeric
				if (extra === "" || extra) {
					num = parseFloat(val);
					return extra === true || isFinite(num) ? num || 0 : val;
				}

				return val;
			}
		});

		jQuery.each(["height", "width"], function (i, name) {
			jQuery.cssHooks[name] = {
				get: function get(elem, computed, extra) {
					if (computed) {

						// Certain elements can have dimension info if we invisibly show them
						// but it must have a current display style that would benefit
						return rdisplayswap.test(jQuery.css(elem, "display")) && (

						// Support: Safari 8+
						// Table columns in Safari have non-zero offsetWidth & zero
						// getBoundingClientRect().width unless display is changed.
						// Support: IE <=11 only
						// Running getBoundingClientRect on a disconnected node
						// in IE throws an error.
						!elem.getClientRects().length || !elem.getBoundingClientRect().width) ? swap(elem, cssShow, function () {
							return getWidthOrHeight(elem, name, extra);
						}) : getWidthOrHeight(elem, name, extra);
					}
				},

				set: function set(elem, value, extra) {
					var matches,
					    styles = extra && getStyles(elem),
					    subtract = extra && augmentWidthOrHeight(elem, name, extra, jQuery.css(elem, "boxSizing", false, styles) === "border-box", styles);

					// Convert to pixels if value adjustment is needed
					if (subtract && (matches = rcssNum.exec(value)) && (matches[3] || "px") !== "px") {

						elem.style[name] = value;
						value = jQuery.css(elem, name);
					}

					return setPositiveNumber(elem, value, subtract);
				}
			};
		});

		jQuery.cssHooks.marginLeft = addGetHookIf(support.reliableMarginLeft, function (elem, computed) {
			if (computed) {
				return (parseFloat(curCSS(elem, "marginLeft")) || elem.getBoundingClientRect().left - swap(elem, { marginLeft: 0 }, function () {
					return elem.getBoundingClientRect().left;
				})) + "px";
			}
		});

		// These hooks are used by animate to expand properties
		jQuery.each({
			margin: "",
			padding: "",
			border: "Width"
		}, function (prefix, suffix) {
			jQuery.cssHooks[prefix + suffix] = {
				expand: function expand(value) {
					var i = 0,
					    expanded = {},


					// Assumes a single number if not a string
					parts = typeof value === "string" ? value.split(" ") : [value];

					for (; i < 4; i++) {
						expanded[prefix + cssExpand[i] + suffix] = parts[i] || parts[i - 2] || parts[0];
					}

					return expanded;
				}
			};

			if (!rmargin.test(prefix)) {
				jQuery.cssHooks[prefix + suffix].set = setPositiveNumber;
			}
		});

		jQuery.fn.extend({
			css: function css(name, value) {
				return access(this, function (elem, name, value) {
					var styles,
					    len,
					    map = {},
					    i = 0;

					if (Array.isArray(name)) {
						styles = getStyles(elem);
						len = name.length;

						for (; i < len; i++) {
							map[name[i]] = jQuery.css(elem, name[i], false, styles);
						}

						return map;
					}

					return value !== undefined ? jQuery.style(elem, name, value) : jQuery.css(elem, name);
				}, name, value, arguments.length > 1);
			}
		});

		function Tween(elem, options, prop, end, easing) {
			return new Tween.prototype.init(elem, options, prop, end, easing);
		}
		jQuery.Tween = Tween;

		Tween.prototype = {
			constructor: Tween,
			init: function init(elem, options, prop, end, easing, unit) {
				this.elem = elem;
				this.prop = prop;
				this.easing = easing || jQuery.easing._default;
				this.options = options;
				this.start = this.now = this.cur();
				this.end = end;
				this.unit = unit || (jQuery.cssNumber[prop] ? "" : "px");
			},
			cur: function cur() {
				var hooks = Tween.propHooks[this.prop];

				return hooks && hooks.get ? hooks.get(this) : Tween.propHooks._default.get(this);
			},
			run: function run(percent) {
				var eased,
				    hooks = Tween.propHooks[this.prop];

				if (this.options.duration) {
					this.pos = eased = jQuery.easing[this.easing](percent, this.options.duration * percent, 0, 1, this.options.duration);
				} else {
					this.pos = eased = percent;
				}
				this.now = (this.end - this.start) * eased + this.start;

				if (this.options.step) {
					this.options.step.call(this.elem, this.now, this);
				}

				if (hooks && hooks.set) {
					hooks.set(this);
				} else {
					Tween.propHooks._default.set(this);
				}
				return this;
			}
		};

		Tween.prototype.init.prototype = Tween.prototype;

		Tween.propHooks = {
			_default: {
				get: function get(tween) {
					var result;

					// Use a property on the element directly when it is not a DOM element,
					// or when there is no matching style property that exists.
					if (tween.elem.nodeType !== 1 || tween.elem[tween.prop] != null && tween.elem.style[tween.prop] == null) {
						return tween.elem[tween.prop];
					}

					// Passing an empty string as a 3rd parameter to .css will automatically
					// attempt a parseFloat and fallback to a string if the parse fails.
					// Simple values such as "10px" are parsed to Float;
					// complex values such as "rotate(1rad)" are returned as-is.
					result = jQuery.css(tween.elem, tween.prop, "");

					// Empty strings, null, undefined and "auto" are converted to 0.
					return !result || result === "auto" ? 0 : result;
				},
				set: function set(tween) {

					// Use step hook for back compat.
					// Use cssHook if its there.
					// Use .style if available and use plain properties where available.
					if (jQuery.fx.step[tween.prop]) {
						jQuery.fx.step[tween.prop](tween);
					} else if (tween.elem.nodeType === 1 && (tween.elem.style[jQuery.cssProps[tween.prop]] != null || jQuery.cssHooks[tween.prop])) {
						jQuery.style(tween.elem, tween.prop, tween.now + tween.unit);
					} else {
						tween.elem[tween.prop] = tween.now;
					}
				}
			}
		};

		// Support: IE <=9 only
		// Panic based approach to setting things on disconnected nodes
		Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
			set: function set(tween) {
				if (tween.elem.nodeType && tween.elem.parentNode) {
					tween.elem[tween.prop] = tween.now;
				}
			}
		};

		jQuery.easing = {
			linear: function linear(p) {
				return p;
			},
			swing: function swing(p) {
				return 0.5 - Math.cos(p * Math.PI) / 2;
			},
			_default: "swing"
		};

		jQuery.fx = Tween.prototype.init;

		// Back compat <1.8 extension point
		jQuery.fx.step = {};

		var fxNow,
		    inProgress,
		    rfxtypes = /^(?:toggle|show|hide)$/,
		    rrun = /queueHooks$/;

		function schedule() {
			if (inProgress) {
				if (document.hidden === false && window.requestAnimationFrame) {
					window.requestAnimationFrame(schedule);
				} else {
					window.setTimeout(schedule, jQuery.fx.interval);
				}

				jQuery.fx.tick();
			}
		}

		// Animations created synchronously will run synchronously
		function createFxNow() {
			window.setTimeout(function () {
				fxNow = undefined;
			});
			return fxNow = jQuery.now();
		}

		// Generate parameters to create a standard animation
		function genFx(type, includeWidth) {
			var which,
			    i = 0,
			    attrs = { height: type };

			// If we include width, step value is 1 to do all cssExpand values,
			// otherwise step value is 2 to skip over Left and Right
			includeWidth = includeWidth ? 1 : 0;
			for (; i < 4; i += 2 - includeWidth) {
				which = cssExpand[i];
				attrs["margin" + which] = attrs["padding" + which] = type;
			}

			if (includeWidth) {
				attrs.opacity = attrs.width = type;
			}

			return attrs;
		}

		function createTween(value, prop, animation) {
			var tween,
			    collection = (Animation.tweeners[prop] || []).concat(Animation.tweeners["*"]),
			    index = 0,
			    length = collection.length;
			for (; index < length; index++) {
				if (tween = collection[index].call(animation, prop, value)) {

					// We're done with this property
					return tween;
				}
			}
		}

		function defaultPrefilter(elem, props, opts) {
			var prop,
			    value,
			    toggle,
			    hooks,
			    oldfire,
			    propTween,
			    restoreDisplay,
			    display,
			    isBox = "width" in props || "height" in props,
			    anim = this,
			    orig = {},
			    style = elem.style,
			    hidden = elem.nodeType && isHiddenWithinTree(elem),
			    dataShow = dataPriv.get(elem, "fxshow");

			// Queue-skipping animations hijack the fx hooks
			if (!opts.queue) {
				hooks = jQuery._queueHooks(elem, "fx");
				if (hooks.unqueued == null) {
					hooks.unqueued = 0;
					oldfire = hooks.empty.fire;
					hooks.empty.fire = function () {
						if (!hooks.unqueued) {
							oldfire();
						}
					};
				}
				hooks.unqueued++;

				anim.always(function () {

					// Ensure the complete handler is called before this completes
					anim.always(function () {
						hooks.unqueued--;
						if (!jQuery.queue(elem, "fx").length) {
							hooks.empty.fire();
						}
					});
				});
			}

			// Detect show/hide animations
			for (prop in props) {
				value = props[prop];
				if (rfxtypes.test(value)) {
					delete props[prop];
					toggle = toggle || value === "toggle";
					if (value === (hidden ? "hide" : "show")) {

						// Pretend to be hidden if this is a "show" and
						// there is still data from a stopped show/hide
						if (value === "show" && dataShow && dataShow[prop] !== undefined) {
							hidden = true;

							// Ignore all other no-op show/hide data
						} else {
							continue;
						}
					}
					orig[prop] = dataShow && dataShow[prop] || jQuery.style(elem, prop);
				}
			}

			// Bail out if this is a no-op like .hide().hide()
			propTween = !jQuery.isEmptyObject(props);
			if (!propTween && jQuery.isEmptyObject(orig)) {
				return;
			}

			// Restrict "overflow" and "display" styles during box animations
			if (isBox && elem.nodeType === 1) {

				// Support: IE <=9 - 11, Edge 12 - 13
				// Record all 3 overflow attributes because IE does not infer the shorthand
				// from identically-valued overflowX and overflowY
				opts.overflow = [style.overflow, style.overflowX, style.overflowY];

				// Identify a display type, preferring old show/hide data over the CSS cascade
				restoreDisplay = dataShow && dataShow.display;
				if (restoreDisplay == null) {
					restoreDisplay = dataPriv.get(elem, "display");
				}
				display = jQuery.css(elem, "display");
				if (display === "none") {
					if (restoreDisplay) {
						display = restoreDisplay;
					} else {

						// Get nonempty value(s) by temporarily forcing visibility
						showHide([elem], true);
						restoreDisplay = elem.style.display || restoreDisplay;
						display = jQuery.css(elem, "display");
						showHide([elem]);
					}
				}

				// Animate inline elements as inline-block
				if (display === "inline" || display === "inline-block" && restoreDisplay != null) {
					if (jQuery.css(elem, "float") === "none") {

						// Restore the original display value at the end of pure show/hide animations
						if (!propTween) {
							anim.done(function () {
								style.display = restoreDisplay;
							});
							if (restoreDisplay == null) {
								display = style.display;
								restoreDisplay = display === "none" ? "" : display;
							}
						}
						style.display = "inline-block";
					}
				}
			}

			if (opts.overflow) {
				style.overflow = "hidden";
				anim.always(function () {
					style.overflow = opts.overflow[0];
					style.overflowX = opts.overflow[1];
					style.overflowY = opts.overflow[2];
				});
			}

			// Implement show/hide animations
			propTween = false;
			for (prop in orig) {

				// General show/hide setup for this element animation
				if (!propTween) {
					if (dataShow) {
						if ("hidden" in dataShow) {
							hidden = dataShow.hidden;
						}
					} else {
						dataShow = dataPriv.access(elem, "fxshow", { display: restoreDisplay });
					}

					// Store hidden/visible for toggle so `.stop().toggle()` "reverses"
					if (toggle) {
						dataShow.hidden = !hidden;
					}

					// Show elements before animating them
					if (hidden) {
						showHide([elem], true);
					}

					/* eslint-disable no-loop-func */

					anim.done(function () {

						/* eslint-enable no-loop-func */

						// The final step of a "hide" animation is actually hiding the element
						if (!hidden) {
							showHide([elem]);
						}
						dataPriv.remove(elem, "fxshow");
						for (prop in orig) {
							jQuery.style(elem, prop, orig[prop]);
						}
					});
				}

				// Per-property setup
				propTween = createTween(hidden ? dataShow[prop] : 0, prop, anim);
				if (!(prop in dataShow)) {
					dataShow[prop] = propTween.start;
					if (hidden) {
						propTween.end = propTween.start;
						propTween.start = 0;
					}
				}
			}
		}

		function propFilter(props, specialEasing) {
			var index, name, easing, value, hooks;

			// camelCase, specialEasing and expand cssHook pass
			for (index in props) {
				name = jQuery.camelCase(index);
				easing = specialEasing[name];
				value = props[index];
				if (Array.isArray(value)) {
					easing = value[1];
					value = props[index] = value[0];
				}

				if (index !== name) {
					props[name] = value;
					delete props[index];
				}

				hooks = jQuery.cssHooks[name];
				if (hooks && "expand" in hooks) {
					value = hooks.expand(value);
					delete props[name];

					// Not quite $.extend, this won't overwrite existing keys.
					// Reusing 'index' because we have the correct "name"
					for (index in value) {
						if (!(index in props)) {
							props[index] = value[index];
							specialEasing[index] = easing;
						}
					}
				} else {
					specialEasing[name] = easing;
				}
			}
		}

		function Animation(elem, properties, options) {
			var result,
			    stopped,
			    index = 0,
			    length = Animation.prefilters.length,
			    deferred = jQuery.Deferred().always(function () {

				// Don't match elem in the :animated selector
				delete tick.elem;
			}),
			    tick = function tick() {
				if (stopped) {
					return false;
				}
				var currentTime = fxNow || createFxNow(),
				    remaining = Math.max(0, animation.startTime + animation.duration - currentTime),


				// Support: Android 2.3 only
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				temp = remaining / animation.duration || 0,
				    percent = 1 - temp,
				    index = 0,
				    length = animation.tweens.length;

				for (; index < length; index++) {
					animation.tweens[index].run(percent);
				}

				deferred.notifyWith(elem, [animation, percent, remaining]);

				// If there's more to do, yield
				if (percent < 1 && length) {
					return remaining;
				}

				// If this was an empty animation, synthesize a final progress notification
				if (!length) {
					deferred.notifyWith(elem, [animation, 1, 0]);
				}

				// Resolve the animation and report its conclusion
				deferred.resolveWith(elem, [animation]);
				return false;
			},
			    animation = deferred.promise({
				elem: elem,
				props: jQuery.extend({}, properties),
				opts: jQuery.extend(true, {
					specialEasing: {},
					easing: jQuery.easing._default
				}, options),
				originalProperties: properties,
				originalOptions: options,
				startTime: fxNow || createFxNow(),
				duration: options.duration,
				tweens: [],
				createTween: function createTween(prop, end) {
					var tween = jQuery.Tween(elem, animation.opts, prop, end, animation.opts.specialEasing[prop] || animation.opts.easing);
					animation.tweens.push(tween);
					return tween;
				},
				stop: function stop(gotoEnd) {
					var index = 0,


					// If we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
					if (stopped) {
						return this;
					}
					stopped = true;
					for (; index < length; index++) {
						animation.tweens[index].run(1);
					}

					// Resolve when we played the last frame; otherwise, reject
					if (gotoEnd) {
						deferred.notifyWith(elem, [animation, 1, 0]);
						deferred.resolveWith(elem, [animation, gotoEnd]);
					} else {
						deferred.rejectWith(elem, [animation, gotoEnd]);
					}
					return this;
				}
			}),
			    props = animation.props;

			propFilter(props, animation.opts.specialEasing);

			for (; index < length; index++) {
				result = Animation.prefilters[index].call(animation, elem, props, animation.opts);
				if (result) {
					if (jQuery.isFunction(result.stop)) {
						jQuery._queueHooks(animation.elem, animation.opts.queue).stop = jQuery.proxy(result.stop, result);
					}
					return result;
				}
			}

			jQuery.map(props, createTween, animation);

			if (jQuery.isFunction(animation.opts.start)) {
				animation.opts.start.call(elem, animation);
			}

			// Attach callbacks from options
			animation.progress(animation.opts.progress).done(animation.opts.done, animation.opts.complete).fail(animation.opts.fail).always(animation.opts.always);

			jQuery.fx.timer(jQuery.extend(tick, {
				elem: elem,
				anim: animation,
				queue: animation.opts.queue
			}));

			return animation;
		}

		jQuery.Animation = jQuery.extend(Animation, {

			tweeners: {
				"*": [function (prop, value) {
					var tween = this.createTween(prop, value);
					adjustCSS(tween.elem, prop, rcssNum.exec(value), tween);
					return tween;
				}]
			},

			tweener: function tweener(props, callback) {
				if (jQuery.isFunction(props)) {
					callback = props;
					props = ["*"];
				} else {
					props = props.match(rnothtmlwhite);
				}

				var prop,
				    index = 0,
				    length = props.length;

				for (; index < length; index++) {
					prop = props[index];
					Animation.tweeners[prop] = Animation.tweeners[prop] || [];
					Animation.tweeners[prop].unshift(callback);
				}
			},

			prefilters: [defaultPrefilter],

			prefilter: function prefilter(callback, prepend) {
				if (prepend) {
					Animation.prefilters.unshift(callback);
				} else {
					Animation.prefilters.push(callback);
				}
			}
		});

		jQuery.speed = function (speed, easing, fn) {
			var opt = speed && (typeof speed === "undefined" ? "undefined" : _typeof(speed)) === "object" ? jQuery.extend({}, speed) : {
				complete: fn || !fn && easing || jQuery.isFunction(speed) && speed,
				duration: speed,
				easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
			};

			// Go to the end state if fx are off
			if (jQuery.fx.off) {
				opt.duration = 0;
			} else {
				if (typeof opt.duration !== "number") {
					if (opt.duration in jQuery.fx.speeds) {
						opt.duration = jQuery.fx.speeds[opt.duration];
					} else {
						opt.duration = jQuery.fx.speeds._default;
					}
				}
			}

			// Normalize opt.queue - true/undefined/null -> "fx"
			if (opt.queue == null || opt.queue === true) {
				opt.queue = "fx";
			}

			// Queueing
			opt.old = opt.complete;

			opt.complete = function () {
				if (jQuery.isFunction(opt.old)) {
					opt.old.call(this);
				}

				if (opt.queue) {
					jQuery.dequeue(this, opt.queue);
				}
			};

			return opt;
		};

		jQuery.fn.extend({
			fadeTo: function fadeTo(speed, to, easing, callback) {

				// Show any hidden elements after setting opacity to 0
				return this.filter(isHiddenWithinTree).css("opacity", 0).show()

				// Animate to the value specified
				.end().animate({ opacity: to }, speed, easing, callback);
			},
			animate: function animate(prop, speed, easing, callback) {
				var empty = jQuery.isEmptyObject(prop),
				    optall = jQuery.speed(speed, easing, callback),
				    doAnimation = function doAnimation() {

					// Operate on a copy of prop so per-property easing won't be lost
					var anim = Animation(this, jQuery.extend({}, prop), optall);

					// Empty animations, or finishing resolves immediately
					if (empty || dataPriv.get(this, "finish")) {
						anim.stop(true);
					}
				};
				doAnimation.finish = doAnimation;

				return empty || optall.queue === false ? this.each(doAnimation) : this.queue(optall.queue, doAnimation);
			},
			stop: function stop(type, clearQueue, gotoEnd) {
				var stopQueue = function stopQueue(hooks) {
					var stop = hooks.stop;
					delete hooks.stop;
					stop(gotoEnd);
				};

				if (typeof type !== "string") {
					gotoEnd = clearQueue;
					clearQueue = type;
					type = undefined;
				}
				if (clearQueue && type !== false) {
					this.queue(type || "fx", []);
				}

				return this.each(function () {
					var dequeue = true,
					    index = type != null && type + "queueHooks",
					    timers = jQuery.timers,
					    data = dataPriv.get(this);

					if (index) {
						if (data[index] && data[index].stop) {
							stopQueue(data[index]);
						}
					} else {
						for (index in data) {
							if (data[index] && data[index].stop && rrun.test(index)) {
								stopQueue(data[index]);
							}
						}
					}

					for (index = timers.length; index--;) {
						if (timers[index].elem === this && (type == null || timers[index].queue === type)) {

							timers[index].anim.stop(gotoEnd);
							dequeue = false;
							timers.splice(index, 1);
						}
					}

					// Start the next in the queue if the last step wasn't forced.
					// Timers currently will call their complete callbacks, which
					// will dequeue but only if they were gotoEnd.
					if (dequeue || !gotoEnd) {
						jQuery.dequeue(this, type);
					}
				});
			},
			finish: function finish(type) {
				if (type !== false) {
					type = type || "fx";
				}
				return this.each(function () {
					var index,
					    data = dataPriv.get(this),
					    queue = data[type + "queue"],
					    hooks = data[type + "queueHooks"],
					    timers = jQuery.timers,
					    length = queue ? queue.length : 0;

					// Enable finishing flag on private data
					data.finish = true;

					// Empty the queue first
					jQuery.queue(this, type, []);

					if (hooks && hooks.stop) {
						hooks.stop.call(this, true);
					}

					// Look for any active animations, and finish them
					for (index = timers.length; index--;) {
						if (timers[index].elem === this && timers[index].queue === type) {
							timers[index].anim.stop(true);
							timers.splice(index, 1);
						}
					}

					// Look for any animations in the old queue and finish them
					for (index = 0; index < length; index++) {
						if (queue[index] && queue[index].finish) {
							queue[index].finish.call(this);
						}
					}

					// Turn off finishing flag
					delete data.finish;
				});
			}
		});

		jQuery.each(["toggle", "show", "hide"], function (i, name) {
			var cssFn = jQuery.fn[name];
			jQuery.fn[name] = function (speed, easing, callback) {
				return speed == null || typeof speed === "boolean" ? cssFn.apply(this, arguments) : this.animate(genFx(name, true), speed, easing, callback);
			};
		});

		// Generate shortcuts for custom animations
		jQuery.each({
			slideDown: genFx("show"),
			slideUp: genFx("hide"),
			slideToggle: genFx("toggle"),
			fadeIn: { opacity: "show" },
			fadeOut: { opacity: "hide" },
			fadeToggle: { opacity: "toggle" }
		}, function (name, props) {
			jQuery.fn[name] = function (speed, easing, callback) {
				return this.animate(props, speed, easing, callback);
			};
		});

		jQuery.timers = [];
		jQuery.fx.tick = function () {
			var timer,
			    i = 0,
			    timers = jQuery.timers;

			fxNow = jQuery.now();

			for (; i < timers.length; i++) {
				timer = timers[i];

				// Run the timer and safely remove it when done (allowing for external removal)
				if (!timer() && timers[i] === timer) {
					timers.splice(i--, 1);
				}
			}

			if (!timers.length) {
				jQuery.fx.stop();
			}
			fxNow = undefined;
		};

		jQuery.fx.timer = function (timer) {
			jQuery.timers.push(timer);
			jQuery.fx.start();
		};

		jQuery.fx.interval = 13;
		jQuery.fx.start = function () {
			if (inProgress) {
				return;
			}

			inProgress = true;
			schedule();
		};

		jQuery.fx.stop = function () {
			inProgress = null;
		};

		jQuery.fx.speeds = {
			slow: 600,
			fast: 200,

			// Default speed
			_default: 400
		};

		// Based off of the plugin by Clint Helfers, with permission.
		// https://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
		jQuery.fn.delay = function (time, type) {
			time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
			type = type || "fx";

			return this.queue(type, function (next, hooks) {
				var timeout = window.setTimeout(next, time);
				hooks.stop = function () {
					window.clearTimeout(timeout);
				};
			});
		};

		(function () {
			var input = document.createElement("input"),
			    select = document.createElement("select"),
			    opt = select.appendChild(document.createElement("option"));

			input.type = "checkbox";

			// Support: Android <=4.3 only
			// Default value for a checkbox should be "on"
			support.checkOn = input.value !== "";

			// Support: IE <=11 only
			// Must access selectedIndex to make default options select
			support.optSelected = opt.selected;

			// Support: IE <=11 only
			// An input loses its value after becoming a radio
			input = document.createElement("input");
			input.value = "t";
			input.type = "radio";
			support.radioValue = input.value === "t";
		})();

		var boolHook,
		    attrHandle = jQuery.expr.attrHandle;

		jQuery.fn.extend({
			attr: function attr(name, value) {
				return access(this, jQuery.attr, name, value, arguments.length > 1);
			},

			removeAttr: function removeAttr(name) {
				return this.each(function () {
					jQuery.removeAttr(this, name);
				});
			}
		});

		jQuery.extend({
			attr: function attr(elem, name, value) {
				var ret,
				    hooks,
				    nType = elem.nodeType;

				// Don't get/set attributes on text, comment and attribute nodes
				if (nType === 3 || nType === 8 || nType === 2) {
					return;
				}

				// Fallback to prop when attributes are not supported
				if (typeof elem.getAttribute === "undefined") {
					return jQuery.prop(elem, name, value);
				}

				// Attribute hooks are determined by the lowercase version
				// Grab necessary hook if one is defined
				if (nType !== 1 || !jQuery.isXMLDoc(elem)) {
					hooks = jQuery.attrHooks[name.toLowerCase()] || (jQuery.expr.match.bool.test(name) ? boolHook : undefined);
				}

				if (value !== undefined) {
					if (value === null) {
						jQuery.removeAttr(elem, name);
						return;
					}

					if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined) {
						return ret;
					}

					elem.setAttribute(name, value + "");
					return value;
				}

				if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
					return ret;
				}

				ret = jQuery.find.attr(elem, name);

				// Non-existent attributes return null, we normalize to undefined
				return ret == null ? undefined : ret;
			},

			attrHooks: {
				type: {
					set: function set(elem, value) {
						if (!support.radioValue && value === "radio" && nodeName(elem, "input")) {
							var val = elem.value;
							elem.setAttribute("type", value);
							if (val) {
								elem.value = val;
							}
							return value;
						}
					}
				}
			},

			removeAttr: function removeAttr(elem, value) {
				var name,
				    i = 0,


				// Attribute names can contain non-HTML whitespace characters
				// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
				attrNames = value && value.match(rnothtmlwhite);

				if (attrNames && elem.nodeType === 1) {
					while (name = attrNames[i++]) {
						elem.removeAttribute(name);
					}
				}
			}
		});

		// Hooks for boolean attributes
		boolHook = {
			set: function set(elem, value, name) {
				if (value === false) {

					// Remove boolean attributes when set to false
					jQuery.removeAttr(elem, name);
				} else {
					elem.setAttribute(name, name);
				}
				return name;
			}
		};

		jQuery.each(jQuery.expr.match.bool.source.match(/\w+/g), function (i, name) {
			var getter = attrHandle[name] || jQuery.find.attr;

			attrHandle[name] = function (elem, name, isXML) {
				var ret,
				    handle,
				    lowercaseName = name.toLowerCase();

				if (!isXML) {

					// Avoid an infinite loop by temporarily removing this function from the getter
					handle = attrHandle[lowercaseName];
					attrHandle[lowercaseName] = ret;
					ret = getter(elem, name, isXML) != null ? lowercaseName : null;
					attrHandle[lowercaseName] = handle;
				}
				return ret;
			};
		});

		var rfocusable = /^(?:input|select|textarea|button)$/i,
		    rclickable = /^(?:a|area)$/i;

		jQuery.fn.extend({
			prop: function prop(name, value) {
				return access(this, jQuery.prop, name, value, arguments.length > 1);
			},

			removeProp: function removeProp(name) {
				return this.each(function () {
					delete this[jQuery.propFix[name] || name];
				});
			}
		});

		jQuery.extend({
			prop: function prop(elem, name, value) {
				var ret,
				    hooks,
				    nType = elem.nodeType;

				// Don't get/set properties on text, comment and attribute nodes
				if (nType === 3 || nType === 8 || nType === 2) {
					return;
				}

				if (nType !== 1 || !jQuery.isXMLDoc(elem)) {

					// Fix name and attach hooks
					name = jQuery.propFix[name] || name;
					hooks = jQuery.propHooks[name];
				}

				if (value !== undefined) {
					if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined) {
						return ret;
					}

					return elem[name] = value;
				}

				if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
					return ret;
				}

				return elem[name];
			},

			propHooks: {
				tabIndex: {
					get: function get(elem) {

						// Support: IE <=9 - 11 only
						// elem.tabIndex doesn't always return the
						// correct value when it hasn't been explicitly set
						// https://web.archive.org/web/20141116233347/http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
						// Use proper attribute retrieval(#12072)
						var tabindex = jQuery.find.attr(elem, "tabindex");

						if (tabindex) {
							return parseInt(tabindex, 10);
						}

						if (rfocusable.test(elem.nodeName) || rclickable.test(elem.nodeName) && elem.href) {
							return 0;
						}

						return -1;
					}
				}
			},

			propFix: {
				"for": "htmlFor",
				"class": "className"
			}
		});

		// Support: IE <=11 only
		// Accessing the selectedIndex property
		// forces the browser to respect setting selected
		// on the option
		// The getter ensures a default option is selected
		// when in an optgroup
		// eslint rule "no-unused-expressions" is disabled for this code
		// since it considers such accessions noop
		if (!support.optSelected) {
			jQuery.propHooks.selected = {
				get: function get(elem) {

					/* eslint no-unused-expressions: "off" */

					var parent = elem.parentNode;
					if (parent && parent.parentNode) {
						parent.parentNode.selectedIndex;
					}
					return null;
				},
				set: function set(elem) {

					/* eslint no-unused-expressions: "off" */

					var parent = elem.parentNode;
					if (parent) {
						parent.selectedIndex;

						if (parent.parentNode) {
							parent.parentNode.selectedIndex;
						}
					}
				}
			};
		}

		jQuery.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function () {
			jQuery.propFix[this.toLowerCase()] = this;
		});

		// Strip and collapse whitespace according to HTML spec
		// https://html.spec.whatwg.org/multipage/infrastructure.html#strip-and-collapse-whitespace
		function stripAndCollapse(value) {
			var tokens = value.match(rnothtmlwhite) || [];
			return tokens.join(" ");
		}

		function getClass(elem) {
			return elem.getAttribute && elem.getAttribute("class") || "";
		}

		jQuery.fn.extend({
			addClass: function addClass(value) {
				var classes,
				    elem,
				    cur,
				    curValue,
				    clazz,
				    j,
				    finalValue,
				    i = 0;

				if (jQuery.isFunction(value)) {
					return this.each(function (j) {
						jQuery(this).addClass(value.call(this, j, getClass(this)));
					});
				}

				if (typeof value === "string" && value) {
					classes = value.match(rnothtmlwhite) || [];

					while (elem = this[i++]) {
						curValue = getClass(elem);
						cur = elem.nodeType === 1 && " " + stripAndCollapse(curValue) + " ";

						if (cur) {
							j = 0;
							while (clazz = classes[j++]) {
								if (cur.indexOf(" " + clazz + " ") < 0) {
									cur += clazz + " ";
								}
							}

							// Only assign if different to avoid unneeded rendering.
							finalValue = stripAndCollapse(cur);
							if (curValue !== finalValue) {
								elem.setAttribute("class", finalValue);
							}
						}
					}
				}

				return this;
			},

			removeClass: function removeClass(value) {
				var classes,
				    elem,
				    cur,
				    curValue,
				    clazz,
				    j,
				    finalValue,
				    i = 0;

				if (jQuery.isFunction(value)) {
					return this.each(function (j) {
						jQuery(this).removeClass(value.call(this, j, getClass(this)));
					});
				}

				if (!arguments.length) {
					return this.attr("class", "");
				}

				if (typeof value === "string" && value) {
					classes = value.match(rnothtmlwhite) || [];

					while (elem = this[i++]) {
						curValue = getClass(elem);

						// This expression is here for better compressibility (see addClass)
						cur = elem.nodeType === 1 && " " + stripAndCollapse(curValue) + " ";

						if (cur) {
							j = 0;
							while (clazz = classes[j++]) {

								// Remove *all* instances
								while (cur.indexOf(" " + clazz + " ") > -1) {
									cur = cur.replace(" " + clazz + " ", " ");
								}
							}

							// Only assign if different to avoid unneeded rendering.
							finalValue = stripAndCollapse(cur);
							if (curValue !== finalValue) {
								elem.setAttribute("class", finalValue);
							}
						}
					}
				}

				return this;
			},

			toggleClass: function toggleClass(value, stateVal) {
				var type = typeof value === "undefined" ? "undefined" : _typeof(value);

				if (typeof stateVal === "boolean" && type === "string") {
					return stateVal ? this.addClass(value) : this.removeClass(value);
				}

				if (jQuery.isFunction(value)) {
					return this.each(function (i) {
						jQuery(this).toggleClass(value.call(this, i, getClass(this), stateVal), stateVal);
					});
				}

				return this.each(function () {
					var className, i, self, classNames;

					if (type === "string") {

						// Toggle individual class names
						i = 0;
						self = jQuery(this);
						classNames = value.match(rnothtmlwhite) || [];

						while (className = classNames[i++]) {

							// Check each className given, space separated list
							if (self.hasClass(className)) {
								self.removeClass(className);
							} else {
								self.addClass(className);
							}
						}

						// Toggle whole class name
					} else if (value === undefined || type === "boolean") {
						className = getClass(this);
						if (className) {

							// Store className if set
							dataPriv.set(this, "__className__", className);
						}

						// If the element has a class name or if we're passed `false`,
						// then remove the whole classname (if there was one, the above saved it).
						// Otherwise bring back whatever was previously saved (if anything),
						// falling back to the empty string if nothing was stored.
						if (this.setAttribute) {
							this.setAttribute("class", className || value === false ? "" : dataPriv.get(this, "__className__") || "");
						}
					}
				});
			},

			hasClass: function hasClass(selector) {
				var className,
				    elem,
				    i = 0;

				className = " " + selector + " ";
				while (elem = this[i++]) {
					if (elem.nodeType === 1 && (" " + stripAndCollapse(getClass(elem)) + " ").indexOf(className) > -1) {
						return true;
					}
				}

				return false;
			}
		});

		var rreturn = /\r/g;

		jQuery.fn.extend({
			val: function val(value) {
				var hooks,
				    ret,
				    isFunction,
				    elem = this[0];

				if (!arguments.length) {
					if (elem) {
						hooks = jQuery.valHooks[elem.type] || jQuery.valHooks[elem.nodeName.toLowerCase()];

						if (hooks && "get" in hooks && (ret = hooks.get(elem, "value")) !== undefined) {
							return ret;
						}

						ret = elem.value;

						// Handle most common string cases
						if (typeof ret === "string") {
							return ret.replace(rreturn, "");
						}

						// Handle cases where value is null/undef or number
						return ret == null ? "" : ret;
					}

					return;
				}

				isFunction = jQuery.isFunction(value);

				return this.each(function (i) {
					var val;

					if (this.nodeType !== 1) {
						return;
					}

					if (isFunction) {
						val = value.call(this, i, jQuery(this).val());
					} else {
						val = value;
					}

					// Treat null/undefined as ""; convert numbers to string
					if (val == null) {
						val = "";
					} else if (typeof val === "number") {
						val += "";
					} else if (Array.isArray(val)) {
						val = jQuery.map(val, function (value) {
							return value == null ? "" : value + "";
						});
					}

					hooks = jQuery.valHooks[this.type] || jQuery.valHooks[this.nodeName.toLowerCase()];

					// If set returns undefined, fall back to normal setting
					if (!hooks || !("set" in hooks) || hooks.set(this, val, "value") === undefined) {
						this.value = val;
					}
				});
			}
		});

		jQuery.extend({
			valHooks: {
				option: {
					get: function get(elem) {

						var val = jQuery.find.attr(elem, "value");
						return val != null ? val :

						// Support: IE <=10 - 11 only
						// option.text throws exceptions (#14686, #14858)
						// Strip and collapse whitespace
						// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
						stripAndCollapse(jQuery.text(elem));
					}
				},
				select: {
					get: function get(elem) {
						var value,
						    option,
						    i,
						    options = elem.options,
						    index = elem.selectedIndex,
						    one = elem.type === "select-one",
						    values = one ? null : [],
						    max = one ? index + 1 : options.length;

						if (index < 0) {
							i = max;
						} else {
							i = one ? index : 0;
						}

						// Loop through all the selected options
						for (; i < max; i++) {
							option = options[i];

							// Support: IE <=9 only
							// IE8-9 doesn't update selected after form reset (#2551)
							if ((option.selected || i === index) &&

							// Don't return options that are disabled or in a disabled optgroup
							!option.disabled && (!option.parentNode.disabled || !nodeName(option.parentNode, "optgroup"))) {

								// Get the specific value for the option
								value = jQuery(option).val();

								// We don't need an array for one selects
								if (one) {
									return value;
								}

								// Multi-Selects return an array
								values.push(value);
							}
						}

						return values;
					},

					set: function set(elem, value) {
						var optionSet,
						    option,
						    options = elem.options,
						    values = jQuery.makeArray(value),
						    i = options.length;

						while (i--) {
							option = options[i];

							/* eslint-disable no-cond-assign */

							if (option.selected = jQuery.inArray(jQuery.valHooks.option.get(option), values) > -1) {
								optionSet = true;
							}

							/* eslint-enable no-cond-assign */
						}

						// Force browsers to behave consistently when non-matching value is set
						if (!optionSet) {
							elem.selectedIndex = -1;
						}
						return values;
					}
				}
			}
		});

		// Radios and checkboxes getter/setter
		jQuery.each(["radio", "checkbox"], function () {
			jQuery.valHooks[this] = {
				set: function set(elem, value) {
					if (Array.isArray(value)) {
						return elem.checked = jQuery.inArray(jQuery(elem).val(), value) > -1;
					}
				}
			};
			if (!support.checkOn) {
				jQuery.valHooks[this].get = function (elem) {
					return elem.getAttribute("value") === null ? "on" : elem.value;
				};
			}
		});

		// Return jQuery for attributes-only inclusion


		var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/;

		jQuery.extend(jQuery.event, {

			trigger: function trigger(event, data, elem, onlyHandlers) {

				var i,
				    cur,
				    tmp,
				    bubbleType,
				    ontype,
				    handle,
				    special,
				    eventPath = [elem || document],
				    type = hasOwn.call(event, "type") ? event.type : event,
				    namespaces = hasOwn.call(event, "namespace") ? event.namespace.split(".") : [];

				cur = tmp = elem = elem || document;

				// Don't do events on text and comment nodes
				if (elem.nodeType === 3 || elem.nodeType === 8) {
					return;
				}

				// focus/blur morphs to focusin/out; ensure we're not firing them right now
				if (rfocusMorph.test(type + jQuery.event.triggered)) {
					return;
				}

				if (type.indexOf(".") > -1) {

					// Namespaced trigger; create a regexp to match event type in handle()
					namespaces = type.split(".");
					type = namespaces.shift();
					namespaces.sort();
				}
				ontype = type.indexOf(":") < 0 && "on" + type;

				// Caller can pass in a jQuery.Event object, Object, or just an event type string
				event = event[jQuery.expando] ? event : new jQuery.Event(type, (typeof event === "undefined" ? "undefined" : _typeof(event)) === "object" && event);

				// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
				event.isTrigger = onlyHandlers ? 2 : 3;
				event.namespace = namespaces.join(".");
				event.rnamespace = event.namespace ? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null;

				// Clean up the event in case it is being reused
				event.result = undefined;
				if (!event.target) {
					event.target = elem;
				}

				// Clone any incoming data and prepend the event, creating the handler arg list
				data = data == null ? [event] : jQuery.makeArray(data, [event]);

				// Allow special events to draw outside the lines
				special = jQuery.event.special[type] || {};
				if (!onlyHandlers && special.trigger && special.trigger.apply(elem, data) === false) {
					return;
				}

				// Determine event propagation path in advance, per W3C events spec (#9951)
				// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
				if (!onlyHandlers && !special.noBubble && !jQuery.isWindow(elem)) {

					bubbleType = special.delegateType || type;
					if (!rfocusMorph.test(bubbleType + type)) {
						cur = cur.parentNode;
					}
					for (; cur; cur = cur.parentNode) {
						eventPath.push(cur);
						tmp = cur;
					}

					// Only add window if we got to document (e.g., not plain obj or detached DOM)
					if (tmp === (elem.ownerDocument || document)) {
						eventPath.push(tmp.defaultView || tmp.parentWindow || window);
					}
				}

				// Fire handlers on the event path
				i = 0;
				while ((cur = eventPath[i++]) && !event.isPropagationStopped()) {

					event.type = i > 1 ? bubbleType : special.bindType || type;

					// jQuery handler
					handle = (dataPriv.get(cur, "events") || {})[event.type] && dataPriv.get(cur, "handle");
					if (handle) {
						handle.apply(cur, data);
					}

					// Native handler
					handle = ontype && cur[ontype];
					if (handle && handle.apply && acceptData(cur)) {
						event.result = handle.apply(cur, data);
						if (event.result === false) {
							event.preventDefault();
						}
					}
				}
				event.type = type;

				// If nobody prevented the default action, do it now
				if (!onlyHandlers && !event.isDefaultPrevented()) {

					if ((!special._default || special._default.apply(eventPath.pop(), data) === false) && acceptData(elem)) {

						// Call a native DOM method on the target with the same name as the event.
						// Don't do default actions on window, that's where global variables be (#6170)
						if (ontype && jQuery.isFunction(elem[type]) && !jQuery.isWindow(elem)) {

							// Don't re-trigger an onFOO event when we call its FOO() method
							tmp = elem[ontype];

							if (tmp) {
								elem[ontype] = null;
							}

							// Prevent re-triggering of the same event, since we already bubbled it above
							jQuery.event.triggered = type;
							elem[type]();
							jQuery.event.triggered = undefined;

							if (tmp) {
								elem[ontype] = tmp;
							}
						}
					}
				}

				return event.result;
			},

			// Piggyback on a donor event to simulate a different one
			// Used only for `focus(in | out)` events
			simulate: function simulate(type, elem, event) {
				var e = jQuery.extend(new jQuery.Event(), event, {
					type: type,
					isSimulated: true
				});

				jQuery.event.trigger(e, null, elem);
			}

		});

		jQuery.fn.extend({

			trigger: function trigger(type, data) {
				return this.each(function () {
					jQuery.event.trigger(type, data, this);
				});
			},
			triggerHandler: function triggerHandler(type, data) {
				var elem = this[0];
				if (elem) {
					return jQuery.event.trigger(type, data, elem, true);
				}
			}
		});

		jQuery.each(("blur focus focusin focusout resize scroll click dblclick " + "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " + "change select submit keydown keypress keyup contextmenu").split(" "), function (i, name) {

			// Handle event binding
			jQuery.fn[name] = function (data, fn) {
				return arguments.length > 0 ? this.on(name, null, data, fn) : this.trigger(name);
			};
		});

		jQuery.fn.extend({
			hover: function hover(fnOver, fnOut) {
				return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
			}
		});

		support.focusin = "onfocusin" in window;

		// Support: Firefox <=44
		// Firefox doesn't have focus(in | out) events
		// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
		//
		// Support: Chrome <=48 - 49, Safari <=9.0 - 9.1
		// focus(in | out) events fire after focus & blur events,
		// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
		// Related ticket - https://bugs.chromium.org/p/chromium/issues/detail?id=449857
		if (!support.focusin) {
			jQuery.each({ focus: "focusin", blur: "focusout" }, function (orig, fix) {

				// Attach a single capturing handler on the document while someone wants focusin/focusout
				var handler = function handler(event) {
					jQuery.event.simulate(fix, event.target, jQuery.event.fix(event));
				};

				jQuery.event.special[fix] = {
					setup: function setup() {
						var doc = this.ownerDocument || this,
						    attaches = dataPriv.access(doc, fix);

						if (!attaches) {
							doc.addEventListener(orig, handler, true);
						}
						dataPriv.access(doc, fix, (attaches || 0) + 1);
					},
					teardown: function teardown() {
						var doc = this.ownerDocument || this,
						    attaches = dataPriv.access(doc, fix) - 1;

						if (!attaches) {
							doc.removeEventListener(orig, handler, true);
							dataPriv.remove(doc, fix);
						} else {
							dataPriv.access(doc, fix, attaches);
						}
					}
				};
			});
		}
		var location = window.location;

		var nonce = jQuery.now();

		var rquery = /\?/;

		// Cross-browser xml parsing
		jQuery.parseXML = function (data) {
			var xml;
			if (!data || typeof data !== "string") {
				return null;
			}

			// Support: IE 9 - 11 only
			// IE throws on parseFromString with invalid input.
			try {
				xml = new window.DOMParser().parseFromString(data, "text/xml");
			} catch (e) {
				xml = undefined;
			}

			if (!xml || xml.getElementsByTagName("parsererror").length) {
				jQuery.error("Invalid XML: " + data);
			}
			return xml;
		};

		var rbracket = /\[\]$/,
		    rCRLF = /\r?\n/g,
		    rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
		    rsubmittable = /^(?:input|select|textarea|keygen)/i;

		function buildParams(prefix, obj, traditional, add) {
			var name;

			if (Array.isArray(obj)) {

				// Serialize array item.
				jQuery.each(obj, function (i, v) {
					if (traditional || rbracket.test(prefix)) {

						// Treat each array item as a scalar.
						add(prefix, v);
					} else {

						// Item is non-scalar (array or object), encode its numeric index.
						buildParams(prefix + "[" + ((typeof v === "undefined" ? "undefined" : _typeof(v)) === "object" && v != null ? i : "") + "]", v, traditional, add);
					}
				});
			} else if (!traditional && jQuery.type(obj) === "object") {

				// Serialize object item.
				for (name in obj) {
					buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
				}
			} else {

				// Serialize scalar item.
				add(prefix, obj);
			}
		}

		// Serialize an array of form elements or a set of
		// key/values into a query string
		jQuery.param = function (a, traditional) {
			var prefix,
			    s = [],
			    add = function add(key, valueOrFunction) {

				// If value is a function, invoke it and use its return value
				var value = jQuery.isFunction(valueOrFunction) ? valueOrFunction() : valueOrFunction;

				s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value == null ? "" : value);
			};

			// If an array was passed in, assume that it is an array of form elements.
			if (Array.isArray(a) || a.jquery && !jQuery.isPlainObject(a)) {

				// Serialize the form elements
				jQuery.each(a, function () {
					add(this.name, this.value);
				});
			} else {

				// If traditional, encode the "old" way (the way 1.3.2 or older
				// did it), otherwise encode params recursively.
				for (prefix in a) {
					buildParams(prefix, a[prefix], traditional, add);
				}
			}

			// Return the resulting serialization
			return s.join("&");
		};

		jQuery.fn.extend({
			serialize: function serialize() {
				return jQuery.param(this.serializeArray());
			},
			serializeArray: function serializeArray() {
				return this.map(function () {

					// Can add propHook for "elements" to filter or add form elements
					var elements = jQuery.prop(this, "elements");
					return elements ? jQuery.makeArray(elements) : this;
				}).filter(function () {
					var type = this.type;

					// Use .is( ":disabled" ) so that fieldset[disabled] works
					return this.name && !jQuery(this).is(":disabled") && rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type) && (this.checked || !rcheckableType.test(type));
				}).map(function (i, elem) {
					var val = jQuery(this).val();

					if (val == null) {
						return null;
					}

					if (Array.isArray(val)) {
						return jQuery.map(val, function (val) {
							return { name: elem.name, value: val.replace(rCRLF, "\r\n") };
						});
					}

					return { name: elem.name, value: val.replace(rCRLF, "\r\n") };
				}).get();
			}
		});

		var r20 = /%20/g,
		    rhash = /#.*$/,
		    rantiCache = /([?&])_=[^&]*/,
		    rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,


		// #7653, #8125, #8152: local protocol detection
		rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
		    rnoContent = /^(?:GET|HEAD)$/,
		    rprotocol = /^\/\//,


		/* Prefilters
	  * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	  * 2) These are called:
	  *    - BEFORE asking for a transport
	  *    - AFTER param serialization (s.data is a string if s.processData is true)
	  * 3) key is the dataType
	  * 4) the catchall symbol "*" can be used
	  * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	  */
		prefilters = {},


		/* Transports bindings
	  * 1) key is the dataType
	  * 2) the catchall symbol "*" can be used
	  * 3) selection will start with transport dataType and THEN go to "*" if needed
	  */
		transports = {},


		// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
		allTypes = "*/".concat("*"),


		// Anchor tag for parsing the document origin
		originAnchor = document.createElement("a");
		originAnchor.href = location.href;

		// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
		function addToPrefiltersOrTransports(structure) {

			// dataTypeExpression is optional and defaults to "*"
			return function (dataTypeExpression, func) {

				if (typeof dataTypeExpression !== "string") {
					func = dataTypeExpression;
					dataTypeExpression = "*";
				}

				var dataType,
				    i = 0,
				    dataTypes = dataTypeExpression.toLowerCase().match(rnothtmlwhite) || [];

				if (jQuery.isFunction(func)) {

					// For each dataType in the dataTypeExpression
					while (dataType = dataTypes[i++]) {

						// Prepend if requested
						if (dataType[0] === "+") {
							dataType = dataType.slice(1) || "*";
							(structure[dataType] = structure[dataType] || []).unshift(func);

							// Otherwise append
						} else {
							(structure[dataType] = structure[dataType] || []).push(func);
						}
					}
				}
			};
		}

		// Base inspection function for prefilters and transports
		function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR) {

			var inspected = {},
			    seekingTransport = structure === transports;

			function inspect(dataType) {
				var selected;
				inspected[dataType] = true;
				jQuery.each(structure[dataType] || [], function (_, prefilterOrFactory) {
					var dataTypeOrTransport = prefilterOrFactory(options, originalOptions, jqXHR);
					if (typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[dataTypeOrTransport]) {

						options.dataTypes.unshift(dataTypeOrTransport);
						inspect(dataTypeOrTransport);
						return false;
					} else if (seekingTransport) {
						return !(selected = dataTypeOrTransport);
					}
				});
				return selected;
			}

			return inspect(options.dataTypes[0]) || !inspected["*"] && inspect("*");
		}

		// A special extend for ajax options
		// that takes "flat" options (not to be deep extended)
		// Fixes #9887
		function ajaxExtend(target, src) {
			var key,
			    deep,
			    flatOptions = jQuery.ajaxSettings.flatOptions || {};

			for (key in src) {
				if (src[key] !== undefined) {
					(flatOptions[key] ? target : deep || (deep = {}))[key] = src[key];
				}
			}
			if (deep) {
				jQuery.extend(true, target, deep);
			}

			return target;
		}

		/* Handles responses to an ajax request:
	  * - finds the right dataType (mediates between content-type and expected dataType)
	  * - returns the corresponding response
	  */
		function ajaxHandleResponses(s, jqXHR, responses) {

			var ct,
			    type,
			    finalDataType,
			    firstDataType,
			    contents = s.contents,
			    dataTypes = s.dataTypes;

			// Remove auto dataType and get content-type in the process
			while (dataTypes[0] === "*") {
				dataTypes.shift();
				if (ct === undefined) {
					ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
				}
			}

			// Check if we're dealing with a known content-type
			if (ct) {
				for (type in contents) {
					if (contents[type] && contents[type].test(ct)) {
						dataTypes.unshift(type);
						break;
					}
				}
			}

			// Check to see if we have a response for the expected dataType
			if (dataTypes[0] in responses) {
				finalDataType = dataTypes[0];
			} else {

				// Try convertible dataTypes
				for (type in responses) {
					if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
						finalDataType = type;
						break;
					}
					if (!firstDataType) {
						firstDataType = type;
					}
				}

				// Or just use first one
				finalDataType = finalDataType || firstDataType;
			}

			// If we found a dataType
			// We add the dataType to the list if needed
			// and return the corresponding response
			if (finalDataType) {
				if (finalDataType !== dataTypes[0]) {
					dataTypes.unshift(finalDataType);
				}
				return responses[finalDataType];
			}
		}

		/* Chain conversions given the request and the original response
	  * Also sets the responseXXX fields on the jqXHR instance
	  */
		function ajaxConvert(s, response, jqXHR, isSuccess) {
			var conv2,
			    current,
			    conv,
			    tmp,
			    prev,
			    converters = {},


			// Work with a copy of dataTypes in case we need to modify it for conversion
			dataTypes = s.dataTypes.slice();

			// Create converters map with lowercased keys
			if (dataTypes[1]) {
				for (conv in s.converters) {
					converters[conv.toLowerCase()] = s.converters[conv];
				}
			}

			current = dataTypes.shift();

			// Convert to each sequential dataType
			while (current) {

				if (s.responseFields[current]) {
					jqXHR[s.responseFields[current]] = response;
				}

				// Apply the dataFilter if provided
				if (!prev && isSuccess && s.dataFilter) {
					response = s.dataFilter(response, s.dataType);
				}

				prev = current;
				current = dataTypes.shift();

				if (current) {

					// There's only work to do if current dataType is non-auto
					if (current === "*") {

						current = prev;

						// Convert response if prev dataType is non-auto and differs from current
					} else if (prev !== "*" && prev !== current) {

						// Seek a direct converter
						conv = converters[prev + " " + current] || converters["* " + current];

						// If none found, seek a pair
						if (!conv) {
							for (conv2 in converters) {

								// If conv2 outputs current
								tmp = conv2.split(" ");
								if (tmp[1] === current) {

									// If prev can be converted to accepted input
									conv = converters[prev + " " + tmp[0]] || converters["* " + tmp[0]];
									if (conv) {

										// Condense equivalence converters
										if (conv === true) {
											conv = converters[conv2];

											// Otherwise, insert the intermediate dataType
										} else if (converters[conv2] !== true) {
											current = tmp[0];
											dataTypes.unshift(tmp[1]);
										}
										break;
									}
								}
							}
						}

						// Apply converter (if not an equivalence)
						if (conv !== true) {

							// Unless errors are allowed to bubble, catch and return them
							if (conv && s.throws) {
								response = conv(response);
							} else {
								try {
									response = conv(response);
								} catch (e) {
									return {
										state: "parsererror",
										error: conv ? e : "No conversion from " + prev + " to " + current
									};
								}
							}
						}
					}
				}
			}

			return { state: "success", data: response };
		}

		jQuery.extend({

			// Counter for holding the number of active queries
			active: 0,

			// Last-Modified header cache for next request
			lastModified: {},
			etag: {},

			ajaxSettings: {
				url: location.href,
				type: "GET",
				isLocal: rlocalProtocol.test(location.protocol),
				global: true,
				processData: true,
				async: true,
				contentType: "application/x-www-form-urlencoded; charset=UTF-8",

				/*
	   timeout: 0,
	   data: null,
	   dataType: null,
	   username: null,
	   password: null,
	   cache: null,
	   throws: false,
	   traditional: false,
	   headers: {},
	   */

				accepts: {
					"*": allTypes,
					text: "text/plain",
					html: "text/html",
					xml: "application/xml, text/xml",
					json: "application/json, text/javascript"
				},

				contents: {
					xml: /\bxml\b/,
					html: /\bhtml/,
					json: /\bjson\b/
				},

				responseFields: {
					xml: "responseXML",
					text: "responseText",
					json: "responseJSON"
				},

				// Data converters
				// Keys separate source (or catchall "*") and destination types with a single space
				converters: {

					// Convert anything to text
					"* text": String,

					// Text to html (true = no transformation)
					"text html": true,

					// Evaluate text as a json expression
					"text json": JSON.parse,

					// Parse text as xml
					"text xml": jQuery.parseXML
				},

				// For options that shouldn't be deep extended:
				// you can add your own custom options here if
				// and when you create one that shouldn't be
				// deep extended (see ajaxExtend)
				flatOptions: {
					url: true,
					context: true
				}
			},

			// Creates a full fledged settings object into target
			// with both ajaxSettings and settings fields.
			// If target is omitted, writes into ajaxSettings.
			ajaxSetup: function ajaxSetup(target, settings) {
				return settings ?

				// Building a settings object
				ajaxExtend(ajaxExtend(target, jQuery.ajaxSettings), settings) :

				// Extending ajaxSettings
				ajaxExtend(jQuery.ajaxSettings, target);
			},

			ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
			ajaxTransport: addToPrefiltersOrTransports(transports),

			// Main method
			ajax: function ajax(url, options) {

				// If url is an object, simulate pre-1.5 signature
				if ((typeof url === "undefined" ? "undefined" : _typeof(url)) === "object") {
					options = url;
					url = undefined;
				}

				// Force options to be an object
				options = options || {};

				var transport,


				// URL without anti-cache param
				cacheURL,


				// Response headers
				responseHeadersString,
				    responseHeaders,


				// timeout handle
				timeoutTimer,


				// Url cleanup var
				urlAnchor,


				// Request state (becomes false upon send and true upon completion)
				completed,


				// To know if global events are to be dispatched
				fireGlobals,


				// Loop variable
				i,


				// uncached part of the url
				uncached,


				// Create the final options object
				s = jQuery.ajaxSetup({}, options),


				// Callbacks context
				callbackContext = s.context || s,


				// Context for global events is callbackContext if it is a DOM node or jQuery collection
				globalEventContext = s.context && (callbackContext.nodeType || callbackContext.jquery) ? jQuery(callbackContext) : jQuery.event,


				// Deferreds
				deferred = jQuery.Deferred(),
				    completeDeferred = jQuery.Callbacks("once memory"),


				// Status-dependent callbacks
				_statusCode = s.statusCode || {},


				// Headers (they are sent all at once)
				requestHeaders = {},
				    requestHeadersNames = {},


				// Default abort message
				strAbort = "canceled",


				// Fake xhr
				jqXHR = {
					readyState: 0,

					// Builds headers hashtable if needed
					getResponseHeader: function getResponseHeader(key) {
						var match;
						if (completed) {
							if (!responseHeaders) {
								responseHeaders = {};
								while (match = rheaders.exec(responseHeadersString)) {
									responseHeaders[match[1].toLowerCase()] = match[2];
								}
							}
							match = responseHeaders[key.toLowerCase()];
						}
						return match == null ? null : match;
					},

					// Raw string
					getAllResponseHeaders: function getAllResponseHeaders() {
						return completed ? responseHeadersString : null;
					},

					// Caches the header
					setRequestHeader: function setRequestHeader(name, value) {
						if (completed == null) {
							name = requestHeadersNames[name.toLowerCase()] = requestHeadersNames[name.toLowerCase()] || name;
							requestHeaders[name] = value;
						}
						return this;
					},

					// Overrides response content-type header
					overrideMimeType: function overrideMimeType(type) {
						if (completed == null) {
							s.mimeType = type;
						}
						return this;
					},

					// Status-dependent callbacks
					statusCode: function statusCode(map) {
						var code;
						if (map) {
							if (completed) {

								// Execute the appropriate callbacks
								jqXHR.always(map[jqXHR.status]);
							} else {

								// Lazy-add the new callbacks in a way that preserves old ones
								for (code in map) {
									_statusCode[code] = [_statusCode[code], map[code]];
								}
							}
						}
						return this;
					},

					// Cancel the request
					abort: function abort(statusText) {
						var finalText = statusText || strAbort;
						if (transport) {
							transport.abort(finalText);
						}
						done(0, finalText);
						return this;
					}
				};

				// Attach deferreds
				deferred.promise(jqXHR);

				// Add protocol if not provided (prefilters might expect it)
				// Handle falsy url in the settings object (#10093: consistency with old signature)
				// We also use the url parameter if available
				s.url = ((url || s.url || location.href) + "").replace(rprotocol, location.protocol + "//");

				// Alias method option to type as per ticket #12004
				s.type = options.method || options.type || s.method || s.type;

				// Extract dataTypes list
				s.dataTypes = (s.dataType || "*").toLowerCase().match(rnothtmlwhite) || [""];

				// A cross-domain request is in order when the origin doesn't match the current origin.
				if (s.crossDomain == null) {
					urlAnchor = document.createElement("a");

					// Support: IE <=8 - 11, Edge 12 - 13
					// IE throws exception on accessing the href property if url is malformed,
					// e.g. http://example.com:80x/
					try {
						urlAnchor.href = s.url;

						// Support: IE <=8 - 11 only
						// Anchor's host property isn't correctly set when s.url is relative
						urlAnchor.href = urlAnchor.href;
						s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !== urlAnchor.protocol + "//" + urlAnchor.host;
					} catch (e) {

						// If there is an error parsing the URL, assume it is crossDomain,
						// it can be rejected by the transport if it is invalid
						s.crossDomain = true;
					}
				}

				// Convert data if not already a string
				if (s.data && s.processData && typeof s.data !== "string") {
					s.data = jQuery.param(s.data, s.traditional);
				}

				// Apply prefilters
				inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);

				// If request was aborted inside a prefilter, stop there
				if (completed) {
					return jqXHR;
				}

				// We can fire global events as of now if asked to
				// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
				fireGlobals = jQuery.event && s.global;

				// Watch for a new set of requests
				if (fireGlobals && jQuery.active++ === 0) {
					jQuery.event.trigger("ajaxStart");
				}

				// Uppercase the type
				s.type = s.type.toUpperCase();

				// Determine if request has content
				s.hasContent = !rnoContent.test(s.type);

				// Save the URL in case we're toying with the If-Modified-Since
				// and/or If-None-Match header later on
				// Remove hash to simplify url manipulation
				cacheURL = s.url.replace(rhash, "");

				// More options handling for requests with no content
				if (!s.hasContent) {

					// Remember the hash so we can put it back
					uncached = s.url.slice(cacheURL.length);

					// If data is available, append data to url
					if (s.data) {
						cacheURL += (rquery.test(cacheURL) ? "&" : "?") + s.data;

						// #9682: remove data so that it's not used in an eventual retry
						delete s.data;
					}

					// Add or update anti-cache param if needed
					if (s.cache === false) {
						cacheURL = cacheURL.replace(rantiCache, "$1");
						uncached = (rquery.test(cacheURL) ? "&" : "?") + "_=" + nonce++ + uncached;
					}

					// Put hash and anti-cache on the URL that will be requested (gh-1732)
					s.url = cacheURL + uncached;

					// Change '%20' to '+' if this is encoded form body content (gh-2658)
				} else if (s.data && s.processData && (s.contentType || "").indexOf("application/x-www-form-urlencoded") === 0) {
					s.data = s.data.replace(r20, "+");
				}

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if (s.ifModified) {
					if (jQuery.lastModified[cacheURL]) {
						jqXHR.setRequestHeader("If-Modified-Since", jQuery.lastModified[cacheURL]);
					}
					if (jQuery.etag[cacheURL]) {
						jqXHR.setRequestHeader("If-None-Match", jQuery.etag[cacheURL]);
					}
				}

				// Set the correct header, if data is being sent
				if (s.data && s.hasContent && s.contentType !== false || options.contentType) {
					jqXHR.setRequestHeader("Content-Type", s.contentType);
				}

				// Set the Accepts header for the server, depending on the dataType
				jqXHR.setRequestHeader("Accept", s.dataTypes[0] && s.accepts[s.dataTypes[0]] ? s.accepts[s.dataTypes[0]] + (s.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "") : s.accepts["*"]);

				// Check for headers option
				for (i in s.headers) {
					jqXHR.setRequestHeader(i, s.headers[i]);
				}

				// Allow custom headers/mimetypes and early abort
				if (s.beforeSend && (s.beforeSend.call(callbackContext, jqXHR, s) === false || completed)) {

					// Abort if not done already and return
					return jqXHR.abort();
				}

				// Aborting is no longer a cancellation
				strAbort = "abort";

				// Install callbacks on deferreds
				completeDeferred.add(s.complete);
				jqXHR.done(s.success);
				jqXHR.fail(s.error);

				// Get transport
				transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);

				// If no transport, we auto-abort
				if (!transport) {
					done(-1, "No Transport");
				} else {
					jqXHR.readyState = 1;

					// Send global event
					if (fireGlobals) {
						globalEventContext.trigger("ajaxSend", [jqXHR, s]);
					}

					// If request was aborted inside ajaxSend, stop there
					if (completed) {
						return jqXHR;
					}

					// Timeout
					if (s.async && s.timeout > 0) {
						timeoutTimer = window.setTimeout(function () {
							jqXHR.abort("timeout");
						}, s.timeout);
					}

					try {
						completed = false;
						transport.send(requestHeaders, done);
					} catch (e) {

						// Rethrow post-completion exceptions
						if (completed) {
							throw e;
						}

						// Propagate others as results
						done(-1, e);
					}
				}

				// Callback for when everything is done
				function done(status, nativeStatusText, responses, headers) {
					var isSuccess,
					    success,
					    error,
					    response,
					    modified,
					    statusText = nativeStatusText;

					// Ignore repeat invocations
					if (completed) {
						return;
					}

					completed = true;

					// Clear timeout if it exists
					if (timeoutTimer) {
						window.clearTimeout(timeoutTimer);
					}

					// Dereference transport for early garbage collection
					// (no matter how long the jqXHR object will be used)
					transport = undefined;

					// Cache response headers
					responseHeadersString = headers || "";

					// Set readyState
					jqXHR.readyState = status > 0 ? 4 : 0;

					// Determine if successful
					isSuccess = status >= 200 && status < 300 || status === 304;

					// Get response data
					if (responses) {
						response = ajaxHandleResponses(s, jqXHR, responses);
					}

					// Convert no matter what (that way responseXXX fields are always set)
					response = ajaxConvert(s, response, jqXHR, isSuccess);

					// If successful, handle type chaining
					if (isSuccess) {

						// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
						if (s.ifModified) {
							modified = jqXHR.getResponseHeader("Last-Modified");
							if (modified) {
								jQuery.lastModified[cacheURL] = modified;
							}
							modified = jqXHR.getResponseHeader("etag");
							if (modified) {
								jQuery.etag[cacheURL] = modified;
							}
						}

						// if no content
						if (status === 204 || s.type === "HEAD") {
							statusText = "nocontent";

							// if not modified
						} else if (status === 304) {
							statusText = "notmodified";

							// If we have data, let's convert it
						} else {
							statusText = response.state;
							success = response.data;
							error = response.error;
							isSuccess = !error;
						}
					} else {

						// Extract error from statusText and normalize for non-aborts
						error = statusText;
						if (status || !statusText) {
							statusText = "error";
							if (status < 0) {
								status = 0;
							}
						}
					}

					// Set data for the fake xhr object
					jqXHR.status = status;
					jqXHR.statusText = (nativeStatusText || statusText) + "";

					// Success/Error
					if (isSuccess) {
						deferred.resolveWith(callbackContext, [success, statusText, jqXHR]);
					} else {
						deferred.rejectWith(callbackContext, [jqXHR, statusText, error]);
					}

					// Status-dependent callbacks
					jqXHR.statusCode(_statusCode);
					_statusCode = undefined;

					if (fireGlobals) {
						globalEventContext.trigger(isSuccess ? "ajaxSuccess" : "ajaxError", [jqXHR, s, isSuccess ? success : error]);
					}

					// Complete
					completeDeferred.fireWith(callbackContext, [jqXHR, statusText]);

					if (fireGlobals) {
						globalEventContext.trigger("ajaxComplete", [jqXHR, s]);

						// Handle the global AJAX counter
						if (! --jQuery.active) {
							jQuery.event.trigger("ajaxStop");
						}
					}
				}

				return jqXHR;
			},

			getJSON: function getJSON(url, data, callback) {
				return jQuery.get(url, data, callback, "json");
			},

			getScript: function getScript(url, callback) {
				return jQuery.get(url, undefined, callback, "script");
			}
		});

		jQuery.each(["get", "post"], function (i, method) {
			jQuery[method] = function (url, data, callback, type) {

				// Shift arguments if data argument was omitted
				if (jQuery.isFunction(data)) {
					type = type || callback;
					callback = data;
					data = undefined;
				}

				// The url can be an options object (which then must have .url)
				return jQuery.ajax(jQuery.extend({
					url: url,
					type: method,
					dataType: type,
					data: data,
					success: callback
				}, jQuery.isPlainObject(url) && url));
			};
		});

		jQuery._evalUrl = function (url) {
			return jQuery.ajax({
				url: url,

				// Make this explicit, since user can override this through ajaxSetup (#11264)
				type: "GET",
				dataType: "script",
				cache: true,
				async: false,
				global: false,
				"throws": true
			});
		};

		jQuery.fn.extend({
			wrapAll: function wrapAll(html) {
				var wrap;

				if (this[0]) {
					if (jQuery.isFunction(html)) {
						html = html.call(this[0]);
					}

					// The elements to wrap the target around
					wrap = jQuery(html, this[0].ownerDocument).eq(0).clone(true);

					if (this[0].parentNode) {
						wrap.insertBefore(this[0]);
					}

					wrap.map(function () {
						var elem = this;

						while (elem.firstElementChild) {
							elem = elem.firstElementChild;
						}

						return elem;
					}).append(this);
				}

				return this;
			},

			wrapInner: function wrapInner(html) {
				if (jQuery.isFunction(html)) {
					return this.each(function (i) {
						jQuery(this).wrapInner(html.call(this, i));
					});
				}

				return this.each(function () {
					var self = jQuery(this),
					    contents = self.contents();

					if (contents.length) {
						contents.wrapAll(html);
					} else {
						self.append(html);
					}
				});
			},

			wrap: function wrap(html) {
				var isFunction = jQuery.isFunction(html);

				return this.each(function (i) {
					jQuery(this).wrapAll(isFunction ? html.call(this, i) : html);
				});
			},

			unwrap: function unwrap(selector) {
				this.parent(selector).not("body").each(function () {
					jQuery(this).replaceWith(this.childNodes);
				});
				return this;
			}
		});

		jQuery.expr.pseudos.hidden = function (elem) {
			return !jQuery.expr.pseudos.visible(elem);
		};
		jQuery.expr.pseudos.visible = function (elem) {
			return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
		};

		jQuery.ajaxSettings.xhr = function () {
			try {
				return new window.XMLHttpRequest();
			} catch (e) {}
		};

		var xhrSuccessStatus = {

			// File protocol always yields status code 0, assume 200
			0: 200,

			// Support: IE <=9 only
			// #1450: sometimes IE returns 1223 when it should be 204
			1223: 204
		},
		    xhrSupported = jQuery.ajaxSettings.xhr();

		support.cors = !!xhrSupported && "withCredentials" in xhrSupported;
		support.ajax = xhrSupported = !!xhrSupported;

		jQuery.ajaxTransport(function (options) {
			var _callback, errorCallback;

			// Cross domain only allowed if supported through XMLHttpRequest
			if (support.cors || xhrSupported && !options.crossDomain) {
				return {
					send: function send(headers, complete) {
						var i,
						    xhr = options.xhr();

						xhr.open(options.type, options.url, options.async, options.username, options.password);

						// Apply custom fields if provided
						if (options.xhrFields) {
							for (i in options.xhrFields) {
								xhr[i] = options.xhrFields[i];
							}
						}

						// Override mime type if needed
						if (options.mimeType && xhr.overrideMimeType) {
							xhr.overrideMimeType(options.mimeType);
						}

						// X-Requested-With header
						// For cross-domain requests, seeing as conditions for a preflight are
						// akin to a jigsaw puzzle, we simply never set it to be sure.
						// (it can always be set on a per-request basis or even using ajaxSetup)
						// For same-domain requests, won't change header if already provided.
						if (!options.crossDomain && !headers["X-Requested-With"]) {
							headers["X-Requested-With"] = "XMLHttpRequest";
						}

						// Set headers
						for (i in headers) {
							xhr.setRequestHeader(i, headers[i]);
						}

						// Callback
						_callback = function callback(type) {
							return function () {
								if (_callback) {
									_callback = errorCallback = xhr.onload = xhr.onerror = xhr.onabort = xhr.onreadystatechange = null;

									if (type === "abort") {
										xhr.abort();
									} else if (type === "error") {

										// Support: IE <=9 only
										// On a manual native abort, IE9 throws
										// errors on any property access that is not readyState
										if (typeof xhr.status !== "number") {
											complete(0, "error");
										} else {
											complete(

											// File: protocol always yields status 0; see #8605, #14207
											xhr.status, xhr.statusText);
										}
									} else {
										complete(xhrSuccessStatus[xhr.status] || xhr.status, xhr.statusText,

										// Support: IE <=9 only
										// IE9 has no XHR2 but throws on binary (trac-11426)
										// For XHR2 non-text, let the caller handle it (gh-2498)
										(xhr.responseType || "text") !== "text" || typeof xhr.responseText !== "string" ? { binary: xhr.response } : { text: xhr.responseText }, xhr.getAllResponseHeaders());
									}
								}
							};
						};

						// Listen to events
						xhr.onload = _callback();
						errorCallback = xhr.onerror = _callback("error");

						// Support: IE 9 only
						// Use onreadystatechange to replace onabort
						// to handle uncaught aborts
						if (xhr.onabort !== undefined) {
							xhr.onabort = errorCallback;
						} else {
							xhr.onreadystatechange = function () {

								// Check readyState before timeout as it changes
								if (xhr.readyState === 4) {

									// Allow onerror to be called first,
									// but that will not handle a native abort
									// Also, save errorCallback to a variable
									// as xhr.onerror cannot be accessed
									window.setTimeout(function () {
										if (_callback) {
											errorCallback();
										}
									});
								}
							};
						}

						// Create the abort callback
						_callback = _callback("abort");

						try {

							// Do send the request (this may raise an exception)
							xhr.send(options.hasContent && options.data || null);
						} catch (e) {

							// #14683: Only rethrow if this hasn't been notified as an error yet
							if (_callback) {
								throw e;
							}
						}
					},

					abort: function abort() {
						if (_callback) {
							_callback();
						}
					}
				};
			}
		});

		// Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
		jQuery.ajaxPrefilter(function (s) {
			if (s.crossDomain) {
				s.contents.script = false;
			}
		});

		// Install script dataType
		jQuery.ajaxSetup({
			accepts: {
				script: "text/javascript, application/javascript, " + "application/ecmascript, application/x-ecmascript"
			},
			contents: {
				script: /\b(?:java|ecma)script\b/
			},
			converters: {
				"text script": function textScript(text) {
					jQuery.globalEval(text);
					return text;
				}
			}
		});

		// Handle cache's special case and crossDomain
		jQuery.ajaxPrefilter("script", function (s) {
			if (s.cache === undefined) {
				s.cache = false;
			}
			if (s.crossDomain) {
				s.type = "GET";
			}
		});

		// Bind script tag hack transport
		jQuery.ajaxTransport("script", function (s) {

			// This transport only deals with cross domain requests
			if (s.crossDomain) {
				var script, _callback2;
				return {
					send: function send(_, complete) {
						script = jQuery("<script>").prop({
							charset: s.scriptCharset,
							src: s.url
						}).on("load error", _callback2 = function callback(evt) {
							script.remove();
							_callback2 = null;
							if (evt) {
								complete(evt.type === "error" ? 404 : 200, evt.type);
							}
						});

						// Use native DOM manipulation to avoid our domManip AJAX trickery
						document.head.appendChild(script[0]);
					},
					abort: function abort() {
						if (_callback2) {
							_callback2();
						}
					}
				};
			}
		});

		var oldCallbacks = [],
		    rjsonp = /(=)\?(?=&|$)|\?\?/;

		// Default jsonp settings
		jQuery.ajaxSetup({
			jsonp: "callback",
			jsonpCallback: function jsonpCallback() {
				var callback = oldCallbacks.pop() || jQuery.expando + "_" + nonce++;
				this[callback] = true;
				return callback;
			}
		});

		// Detect, normalize options and install callbacks for jsonp requests
		jQuery.ajaxPrefilter("json jsonp", function (s, originalSettings, jqXHR) {

			var callbackName,
			    overwritten,
			    responseContainer,
			    jsonProp = s.jsonp !== false && (rjsonp.test(s.url) ? "url" : typeof s.data === "string" && (s.contentType || "").indexOf("application/x-www-form-urlencoded") === 0 && rjsonp.test(s.data) && "data");

			// Handle iff the expected data type is "jsonp" or we have a parameter to set
			if (jsonProp || s.dataTypes[0] === "jsonp") {

				// Get callback name, remembering preexisting value associated with it
				callbackName = s.jsonpCallback = jQuery.isFunction(s.jsonpCallback) ? s.jsonpCallback() : s.jsonpCallback;

				// Insert callback into url or form data
				if (jsonProp) {
					s[jsonProp] = s[jsonProp].replace(rjsonp, "$1" + callbackName);
				} else if (s.jsonp !== false) {
					s.url += (rquery.test(s.url) ? "&" : "?") + s.jsonp + "=" + callbackName;
				}

				// Use data converter to retrieve json after script execution
				s.converters["script json"] = function () {
					if (!responseContainer) {
						jQuery.error(callbackName + " was not called");
					}
					return responseContainer[0];
				};

				// Force json dataType
				s.dataTypes[0] = "json";

				// Install callback
				overwritten = window[callbackName];
				window[callbackName] = function () {
					responseContainer = arguments;
				};

				// Clean-up function (fires after converters)
				jqXHR.always(function () {

					// If previous value didn't exist - remove it
					if (overwritten === undefined) {
						jQuery(window).removeProp(callbackName);

						// Otherwise restore preexisting value
					} else {
						window[callbackName] = overwritten;
					}

					// Save back as free
					if (s[callbackName]) {

						// Make sure that re-using the options doesn't screw things around
						s.jsonpCallback = originalSettings.jsonpCallback;

						// Save the callback name for future use
						oldCallbacks.push(callbackName);
					}

					// Call if it was a function and we have a response
					if (responseContainer && jQuery.isFunction(overwritten)) {
						overwritten(responseContainer[0]);
					}

					responseContainer = overwritten = undefined;
				});

				// Delegate to script
				return "script";
			}
		});

		// Support: Safari 8 only
		// In Safari 8 documents created via document.implementation.createHTMLDocument
		// collapse sibling forms: the second one becomes a child of the first one.
		// Because of that, this security measure has to be disabled in Safari 8.
		// https://bugs.webkit.org/show_bug.cgi?id=137337
		support.createHTMLDocument = function () {
			var body = document.implementation.createHTMLDocument("").body;
			body.innerHTML = "<form></form><form></form>";
			return body.childNodes.length === 2;
		}();

		// Argument "data" should be string of html
		// context (optional): If specified, the fragment will be created in this context,
		// defaults to document
		// keepScripts (optional): If true, will include scripts passed in the html string
		jQuery.parseHTML = function (data, context, keepScripts) {
			if (typeof data !== "string") {
				return [];
			}
			if (typeof context === "boolean") {
				keepScripts = context;
				context = false;
			}

			var base, parsed, scripts;

			if (!context) {

				// Stop scripts or inline event handlers from being executed immediately
				// by using document.implementation
				if (support.createHTMLDocument) {
					context = document.implementation.createHTMLDocument("");

					// Set the base href for the created document
					// so any parsed elements with URLs
					// are based on the document's URL (gh-2965)
					base = context.createElement("base");
					base.href = document.location.href;
					context.head.appendChild(base);
				} else {
					context = document;
				}
			}

			parsed = rsingleTag.exec(data);
			scripts = !keepScripts && [];

			// Single tag
			if (parsed) {
				return [context.createElement(parsed[1])];
			}

			parsed = buildFragment([data], context, scripts);

			if (scripts && scripts.length) {
				jQuery(scripts).remove();
			}

			return jQuery.merge([], parsed.childNodes);
		};

		/**
	  * Load a url into a page
	  */
		jQuery.fn.load = function (url, params, callback) {
			var selector,
			    type,
			    response,
			    self = this,
			    off = url.indexOf(" ");

			if (off > -1) {
				selector = stripAndCollapse(url.slice(off));
				url = url.slice(0, off);
			}

			// If it's a function
			if (jQuery.isFunction(params)) {

				// We assume that it's the callback
				callback = params;
				params = undefined;

				// Otherwise, build a param string
			} else if (params && (typeof params === "undefined" ? "undefined" : _typeof(params)) === "object") {
				type = "POST";
			}

			// If we have elements to modify, make the request
			if (self.length > 0) {
				jQuery.ajax({
					url: url,

					// If "type" variable is undefined, then "GET" method will be used.
					// Make value of this field explicit since
					// user can override it through ajaxSetup method
					type: type || "GET",
					dataType: "html",
					data: params
				}).done(function (responseText) {

					// Save response for use in complete callback
					response = arguments;

					self.html(selector ?

					// If a selector was specified, locate the right elements in a dummy div
					// Exclude scripts to avoid IE 'Permission Denied' errors
					jQuery("<div>").append(jQuery.parseHTML(responseText)).find(selector) :

					// Otherwise use the full result
					responseText);

					// If the request succeeds, this function gets "data", "status", "jqXHR"
					// but they are ignored because response was set above.
					// If it fails, this function gets "jqXHR", "status", "error"
				}).always(callback && function (jqXHR, status) {
					self.each(function () {
						callback.apply(this, response || [jqXHR.responseText, status, jqXHR]);
					});
				});
			}

			return this;
		};

		// Attach a bunch of functions for handling common AJAX events
		jQuery.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function (i, type) {
			jQuery.fn[type] = function (fn) {
				return this.on(type, fn);
			};
		});

		jQuery.expr.pseudos.animated = function (elem) {
			return jQuery.grep(jQuery.timers, function (fn) {
				return elem === fn.elem;
			}).length;
		};

		jQuery.offset = {
			setOffset: function setOffset(elem, options, i) {
				var curPosition,
				    curLeft,
				    curCSSTop,
				    curTop,
				    curOffset,
				    curCSSLeft,
				    calculatePosition,
				    position = jQuery.css(elem, "position"),
				    curElem = jQuery(elem),
				    props = {};

				// Set position first, in-case top/left are set even on static elem
				if (position === "static") {
					elem.style.position = "relative";
				}

				curOffset = curElem.offset();
				curCSSTop = jQuery.css(elem, "top");
				curCSSLeft = jQuery.css(elem, "left");
				calculatePosition = (position === "absolute" || position === "fixed") && (curCSSTop + curCSSLeft).indexOf("auto") > -1;

				// Need to be able to calculate position if either
				// top or left is auto and position is either absolute or fixed
				if (calculatePosition) {
					curPosition = curElem.position();
					curTop = curPosition.top;
					curLeft = curPosition.left;
				} else {
					curTop = parseFloat(curCSSTop) || 0;
					curLeft = parseFloat(curCSSLeft) || 0;
				}

				if (jQuery.isFunction(options)) {

					// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
					options = options.call(elem, i, jQuery.extend({}, curOffset));
				}

				if (options.top != null) {
					props.top = options.top - curOffset.top + curTop;
				}
				if (options.left != null) {
					props.left = options.left - curOffset.left + curLeft;
				}

				if ("using" in options) {
					options.using.call(elem, props);
				} else {
					curElem.css(props);
				}
			}
		};

		jQuery.fn.extend({
			offset: function offset(options) {

				// Preserve chaining for setter
				if (arguments.length) {
					return options === undefined ? this : this.each(function (i) {
						jQuery.offset.setOffset(this, options, i);
					});
				}

				var doc,
				    docElem,
				    rect,
				    win,
				    elem = this[0];

				if (!elem) {
					return;
				}

				// Return zeros for disconnected and hidden (display: none) elements (gh-2310)
				// Support: IE <=11 only
				// Running getBoundingClientRect on a
				// disconnected node in IE throws an error
				if (!elem.getClientRects().length) {
					return { top: 0, left: 0 };
				}

				rect = elem.getBoundingClientRect();

				doc = elem.ownerDocument;
				docElem = doc.documentElement;
				win = doc.defaultView;

				return {
					top: rect.top + win.pageYOffset - docElem.clientTop,
					left: rect.left + win.pageXOffset - docElem.clientLeft
				};
			},

			position: function position() {
				if (!this[0]) {
					return;
				}

				var offsetParent,
				    offset,
				    elem = this[0],
				    parentOffset = { top: 0, left: 0 };

				// Fixed elements are offset from window (parentOffset = {top:0, left: 0},
				// because it is its only offset parent
				if (jQuery.css(elem, "position") === "fixed") {

					// Assume getBoundingClientRect is there when computed position is fixed
					offset = elem.getBoundingClientRect();
				} else {

					// Get *real* offsetParent
					offsetParent = this.offsetParent();

					// Get correct offsets
					offset = this.offset();
					if (!nodeName(offsetParent[0], "html")) {
						parentOffset = offsetParent.offset();
					}

					// Add offsetParent borders
					parentOffset = {
						top: parentOffset.top + jQuery.css(offsetParent[0], "borderTopWidth", true),
						left: parentOffset.left + jQuery.css(offsetParent[0], "borderLeftWidth", true)
					};
				}

				// Subtract parent offsets and element margins
				return {
					top: offset.top - parentOffset.top - jQuery.css(elem, "marginTop", true),
					left: offset.left - parentOffset.left - jQuery.css(elem, "marginLeft", true)
				};
			},

			// This method will return documentElement in the following cases:
			// 1) For the element inside the iframe without offsetParent, this method will return
			//    documentElement of the parent window
			// 2) For the hidden or detached element
			// 3) For body or html element, i.e. in case of the html node - it will return itself
			//
			// but those exceptions were never presented as a real life use-cases
			// and might be considered as more preferable results.
			//
			// This logic, however, is not guaranteed and can change at any point in the future
			offsetParent: function offsetParent() {
				return this.map(function () {
					var offsetParent = this.offsetParent;

					while (offsetParent && jQuery.css(offsetParent, "position") === "static") {
						offsetParent = offsetParent.offsetParent;
					}

					return offsetParent || documentElement;
				});
			}
		});

		// Create scrollLeft and scrollTop methods
		jQuery.each({ scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function (method, prop) {
			var top = "pageYOffset" === prop;

			jQuery.fn[method] = function (val) {
				return access(this, function (elem, method, val) {

					// Coalesce documents and windows
					var win;
					if (jQuery.isWindow(elem)) {
						win = elem;
					} else if (elem.nodeType === 9) {
						win = elem.defaultView;
					}

					if (val === undefined) {
						return win ? win[prop] : elem[method];
					}

					if (win) {
						win.scrollTo(!top ? val : win.pageXOffset, top ? val : win.pageYOffset);
					} else {
						elem[method] = val;
					}
				}, method, val, arguments.length);
			};
		});

		// Support: Safari <=7 - 9.1, Chrome <=37 - 49
		// Add the top/left cssHooks using jQuery.fn.position
		// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
		// Blink bug: https://bugs.chromium.org/p/chromium/issues/detail?id=589347
		// getComputedStyle returns percent when specified for top/left/bottom/right;
		// rather than make the css module depend on the offset module, just check for it here
		jQuery.each(["top", "left"], function (i, prop) {
			jQuery.cssHooks[prop] = addGetHookIf(support.pixelPosition, function (elem, computed) {
				if (computed) {
					computed = curCSS(elem, prop);

					// If curCSS returns percentage, fallback to offset
					return rnumnonpx.test(computed) ? jQuery(elem).position()[prop] + "px" : computed;
				}
			});
		});

		// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
		jQuery.each({ Height: "height", Width: "width" }, function (name, type) {
			jQuery.each({ padding: "inner" + name, content: type, "": "outer" + name }, function (defaultExtra, funcName) {

				// Margin is only for outerHeight, outerWidth
				jQuery.fn[funcName] = function (margin, value) {
					var chainable = arguments.length && (defaultExtra || typeof margin !== "boolean"),
					    extra = defaultExtra || (margin === true || value === true ? "margin" : "border");

					return access(this, function (elem, type, value) {
						var doc;

						if (jQuery.isWindow(elem)) {

							// $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
							return funcName.indexOf("outer") === 0 ? elem["inner" + name] : elem.document.documentElement["client" + name];
						}

						// Get document width or height
						if (elem.nodeType === 9) {
							doc = elem.documentElement;

							// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
							// whichever is greatest
							return Math.max(elem.body["scroll" + name], doc["scroll" + name], elem.body["offset" + name], doc["offset" + name], doc["client" + name]);
						}

						return value === undefined ?

						// Get width or height on the element, requesting but not forcing parseFloat
						jQuery.css(elem, type, extra) :

						// Set width or height on the element
						jQuery.style(elem, type, value, extra);
					}, type, chainable ? margin : undefined, chainable);
				};
			});
		});

		jQuery.fn.extend({

			bind: function bind(types, data, fn) {
				return this.on(types, null, data, fn);
			},
			unbind: function unbind(types, fn) {
				return this.off(types, null, fn);
			},

			delegate: function delegate(selector, types, data, fn) {
				return this.on(types, selector, data, fn);
			},
			undelegate: function undelegate(selector, types, fn) {

				// ( namespace ) or ( selector, types [, fn] )
				return arguments.length === 1 ? this.off(selector, "**") : this.off(types, selector || "**", fn);
			}
		});

		jQuery.holdReady = function (hold) {
			if (hold) {
				jQuery.readyWait++;
			} else {
				jQuery.ready(true);
			}
		};
		jQuery.isArray = Array.isArray;
		jQuery.parseJSON = JSON.parse;
		jQuery.nodeName = nodeName;

		// Register as a named AMD module, since jQuery can be concatenated with other
		// files that may use define, but not via a proper concatenation script that
		// understands anonymous AMD modules. A named AMD is safest and most robust
		// way to register. Lowercase jquery is used because AMD module names are
		// derived from file names, and jQuery is normally delivered in a lowercase
		// file name. Do this after creating the global so that if an AMD module wants
		// to call noConflict to hide this version of jQuery, it will work.

		// Note that for maximum portability, libraries that are not jQuery should
		// declare themselves as anonymous modules, and avoid setting a global if an
		// AMD loader is present. jQuery is a special case. For more information, see
		// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

		if (true) {
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
				return jQuery;
			}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		}

		var

		// Map over jQuery in case of overwrite
		_jQuery = window.jQuery,


		// Map over the $ in case of overwrite
		_$ = window.$;

		jQuery.noConflict = function (deep) {
			if (window.$ === jQuery) {
				window.$ = _$;
			}

			if (deep && window.jQuery === jQuery) {
				window.jQuery = _jQuery;
			}

			return jQuery;
		};

		// Expose jQuery and $ identifiers, even in AMD
		// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
		// and CommonJS for browser emulators (#13566)
		if (!noGlobal) {
			window.jQuery = window.$ = jQuery;
		}

		return jQuery;
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(18)(module)))

/***/ },
/* 18 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function (module) {
		if (!module.webpackPolyfill) {
			module.deprecate = function () {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	};

/***/ }
/******/ ])
});
;