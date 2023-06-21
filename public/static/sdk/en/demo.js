// Init plugin

// overall save the current selected window
var g_iWndIndex = 0; //don't have to set the variable; default to use the current selected window without transmiting value when the interface has window parameters
$(function () {
    // check the installation status of plugin 
    var iRet = WebVideoCtrl.I_CheckPluginInstall();
    if (-1 == iRet) {
        alert("If the plugin is uninstalled, please install the WebComponentsKit.exe!");
        return;
    }

    // Init plugin parameters and insert the plugin
    WebVideoCtrl.I_InitPlugin(500, 300, {
        bWndFull: true,   //Wether support doule clicking to switch the full-screen mode: it's supported by default; true:support, false:not support
        iPackageType: 2,    //2:PS 11:MP4
        iWndowType: 1,
        bNoPlugin: true,
        cbSelWnd: function (xmlDoc) {
            g_iWndIndex = parseInt($(xmlDoc).find("SelectWnd").eq(0).text(), 10);
            var szInfo = "selected window number: " + g_iWndIndex;
            showCBInfo(szInfo);
        },
        cbDoubleClickWnd: function (iWndIndex, bFullScreen) {
            var szInfo = "present window number to zoom: " + iWndIndex;
            if (!bFullScreen) {            
                szInfo = "present window number to restore: " + iWndIndex;
            }
            showCBInfo(szInfo);
                        
            // you can handle the single window bit stream switching here
            /*if (bFullScreen) {
                clickStartRealPlay(1);
            } else {
                clickStartRealPlay(2);
            }*/
        },
        cbEvent: function (iEventType, iParam1, iParam2) {
            if (2 == iEventType) {// playback finished normally
                showCBInfo("window " + iParam1 + " playback finished!");
            } else if (-1 == iEventType) {
                showCBInfo("device " + iParam1 + " network error!");
            } else if (3001 == iEventType) {
                clickStopRecord(g_szRecordType, iParam1);
            }
        },
        cbRemoteConfig: function () {
            showCBInfo("closed remote config!");
        },
        cbInitPluginComplete: function () {
            WebVideoCtrl.I_InsertOBJECTPlugin("divPlugin");

            // check plugin to see whether it is the latest
            if (-1 == WebVideoCtrl.I_CheckPluginVersion()) {
                alert("Detect the latest version, please double click WebComponentsKit.exe to update!");
                return;
            }
        }
    });

    // window event binding
    $(window).bind({
        resize: function () {
            var $Restart = $("#restartDiv");
            if ($Restart.length > 0) {
                var oSize = getWindowSize();
                $Restart.css({
                    width: oSize.width + "px",
                    height: oSize.height + "px"
                });
            }
        }
    });

    //init date
    var szCurTime = dateFormat(new Date(), "yyyy-MM-dd");
    $("#starttime").val(szCurTime + " 00:00:00");
    $("#endtime").val(szCurTime + " 23:59:59");
    $("#downloadstarttime").val(szCurTime + " 00:00:00");
    $("#downloadendtime").val(szCurTime + " 23:59:59");
    if(WebVideoCtrl.I_SupportNoPlugin()){
       $(".localconfig").hide();
       $(".ipparse").hide();
       $("#checkVersion").hide();
       $("#remoteconfig").hide();
       $("#btnReverse").hide();
    }
});

// display operation info
function showOPInfo(szInfo, status, xmlDoc) {
    var szTip = "<div>" + dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss") + " " + szInfo;
    if (typeof status != "undefined" && status != 200) {
        var szStatusString = $(xmlDoc).find("statusString").eq(0).text();
        var szSubStatusCode = $(xmlDoc).find("subStatusCode").eq(0).text();
        if ("" === szSubStatusCode) {
            if("" === szSubStatusCode && "" === szStatusString){
                szTip += "(" + status + ")";
            }
            else{
                szTip += "(" + status + ", " + szStatusString + ")";
            }
        } else {
            szTip += "(" + status + ", " + szSubStatusCode + ")";
        }
    }
    szTip += "</div>";

    $("#opinfo").html(szTip + $("#opinfo").html());
}

// display callback info
function showCBInfo(szInfo) {
    szInfo = "<div>" + dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss") + " " + szInfo + "</div>";
    $("#cbinfo").html(szInfo + $("#cbinfo").html());
}

// time format
function dateFormat(oDate, fmt) {
    var o = {
        "M+": oDate.getMonth() + 1, //month
        "d+": oDate.getDate(), //day
        "h+": oDate.getHours(), //hour
        "m+": oDate.getMinutes(), //minute
        "s+": oDate.getSeconds(), //second
        "q+": Math.floor((oDate.getMonth() + 3) / 3), //quarter
        "S": oDate.getMilliseconds()//millisecond
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (oDate.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}

// get window size
function getWindowSize() {
    var nWidth = $(this).width() + $(this).scrollLeft(),
        nHeight = $(this).height() + $(this).scrollTop();

    return {width: nWidth, height: nHeight};
}

// open option dialog 0: folder, 1: file 
    function clickOpenFileDlg(id, iType) {
        WebVideoCtrl.I2_OpenFileDlg(iType).then(function(szDirPath){
            if (szDirPath != -1 && szDirPath != "" && szDirPath != null) {
                $("#" + id).val(szDirPath);
            }
        });
    // var szDirPath = WebVideoCtrl.I_OpenFileDlg(iType);
    
    // if (szDirPath != -1 && szDirPath != "" && szDirPath != null) {
    //     $("#" + id).val(szDirPath);
    // }
}

// get local parameters
function clickGetLocalCfg() {
    var xmlDoc = WebVideoCtrl.I_GetLocalCfg();

    if (xmlDoc != null) {
        $("#netsPreach").val($(xmlDoc).find("BuffNumberType").eq(0).text());
        $("#wndSize").val($(xmlDoc).find("PlayWndType").eq(0).text());
        $("#rulesInfo").val($(xmlDoc).find("IVSMode").eq(0).text());
        $("#captureFileFormat").val($(xmlDoc).find("CaptureFileFormat").eq(0).text());
        $("#packSize").val($(xmlDoc).find("PackgeSize").eq(0).text());
        $("#recordPath").val($(xmlDoc).find("RecordPath").eq(0).text());
        $("#downloadPath").val($(xmlDoc).find("DownloadPath").eq(0).text());
        $("#previewPicPath").val($(xmlDoc).find("CapturePath").eq(0).text());
        $("#playbackPicPath").val($(xmlDoc).find("PlaybackPicPath").eq(0).text());
        $("#devicePicPath").val($(xmlDoc).find("DeviceCapturePath").eq(0).text());
        $("#playbackFilePath").val($(xmlDoc).find("PlaybackFilePath").eq(0).text());
        $("#protocolType").val($(xmlDoc).find("ProtocolType").eq(0).text());

        showOPInfo("local configuration success！");
    } else {
        showOPInfo("local configuration failed！");
    }
}

// set local parameters
function clickSetLocalCfg() {
    var arrXml = [],
        szInfo = "";
    
    arrXml.push("<LocalConfigInfo>");
    arrXml.push("<PackgeSize>" + $("#packSize").val() + "</PackgeSize>");
    arrXml.push("<PlayWndType>" + $("#wndSize").val() + "</PlayWndType>");
    arrXml.push("<BuffNumberType>" + $("#netsPreach").val() + "</BuffNumberType>");
    arrXml.push("<RecordPath>" + $("#recordPath").val() + "</RecordPath>");
    arrXml.push("<CapturePath>" + $("#previewPicPath").val() + "</CapturePath>");
    arrXml.push("<PlaybackFilePath>" + $("#playbackFilePath").val() + "</PlaybackFilePath>");
    arrXml.push("<PlaybackPicPath>" + $("#playbackPicPath").val() + "</PlaybackPicPath>");
    arrXml.push("<DeviceCapturePath>" + $("#devicePicPath").val() + "</DeviceCapturePath>");    
    arrXml.push("<DownloadPath>" + $("#downloadPath").val() + "</DownloadPath>");
    arrXml.push("<IVSMode>" + $("#rulesInfo").val() + "</IVSMode>");
    arrXml.push("<CaptureFileFormat>" + $("#captureFileFormat").val() + "</CaptureFileFormat>");
    arrXml.push("<ProtocolType>" + $("#protocolType").val() + "</ProtocolType>");
    arrXml.push("</LocalConfigInfo>");

    var iRet = WebVideoCtrl.I_SetLocalCfg(arrXml.join(""));

    if (0 == iRet) {
        szInfo = "local configuration success！";
    } else {
        szInfo = "local configuration failed！";
    }
    showOPInfo(szInfo);
}

// windows number
function changeWndNum(iType) {
    iType = parseInt(iType, 10);
    WebVideoCtrl.I_ChangeWndNum(iType);
}

// login
function clickLogin() {
    var szIP = $("#loginip").val(),
        szPort = $("#port").val(),
        szUsername = $("#username").val(),
        szPassword = $("#password").val();

    if ("" == szIP || "" == szPort) {
        return;
    }

    var szDeviceIdentify = szIP + "_" + szPort;

    var iRet = WebVideoCtrl.I_Login(szIP, 1, szPort, szUsername, szPassword, {
        success: function (xmlDoc) {
            showOPInfo(szDeviceIdentify + " login success！");

            $("#ip").prepend("<option value='" + szDeviceIdentify + "'>" + szDeviceIdentify + "</option>");
            //var i =1;
            setTimeout(function () {
                $("#ip").val(szDeviceIdentify);
                getChannelInfo();
                getDevicePort();
            }, 10);
        //    var a= setInterval(function(){
        //         i++;
        //         if(i>100){
        //            clearInterval(a);
        //            alert("done");
        //         }
        //         clickStartRealPlay();
        //         setTimeout(function () {
        //             clickStopRealPlay();
        //         }, 900);
        //     },1000);
          
        },
        error: function (status, xmlDoc) {
            showOPInfo(szDeviceIdentify + " login failed！", status, xmlDoc);
        }
    });

    if (-1 == iRet) {
        showOPInfo(szDeviceIdentify + " login already !");
    }
}

// exit
function clickLogout() {
    var szDeviceIdentify = $("#ip").val(),
        szInfo = "";

    if (null == szDeviceIdentify) {
        return;
    }

    var iRet = WebVideoCtrl.I_Logout(szDeviceIdentify);
    if (0 == iRet) {
        szInfo = "exit success！";

        $("#ip option[value='" + szDeviceIdentify + "']").remove();
        getChannelInfo();
        getDevicePort();
    } else {
        szInfo = "exit failed！";
    }
    showOPInfo(szDeviceIdentify + " " + szInfo);
}

// get deivce info
function clickGetDeviceInfo() {
    var szDeviceIdentify = $("#ip").val();

    if (null == szDeviceIdentify) {
        return;
    }

    WebVideoCtrl.I_GetDeviceInfo(szDeviceIdentify, {
        success: function (xmlDoc) {
            var arrStr = [];
            arrStr.push("device name：" + $(xmlDoc).find("deviceName").eq(0).text() + "\r\n");
            arrStr.push("device ID：" + $(xmlDoc).find("deviceID").eq(0).text() + "\r\n");
            arrStr.push("model：" + $(xmlDoc).find("model").eq(0).text() + "\r\n");
            arrStr.push("serial number：" + $(xmlDoc).find("serialNumber").eq(0).text() + "\r\n");
            arrStr.push("MAC address：" + $(xmlDoc).find("macAddress").eq(0).text() + "\r\n");
            arrStr.push("firmware version：" + $(xmlDoc).find("firmwareVersion").eq(0).text() + " " + $(xmlDoc).find("firmwareReleasedDate").eq(0).text() + "\r\n");
            arrStr.push("encoder version：" + $(xmlDoc).find("encoderVersion").eq(0).text() + " " + $(xmlDoc).find("encoderReleasedDate").eq(0).text() + "\r\n");
            
            showOPInfo(szDeviceIdentify + " get deivce info success！");
            alert(arrStr.join(""));
        },
        error: function (status, xmlDoc) {
            showOPInfo(szDeviceIdentify + " get device info failed！", status, xmlDoc);
        }
    });
}

// get channel info
function getChannelInfo() {
    var szDeviceIdentify = $("#ip").val(),
        oSel = $("#channels").empty();

    if (null == szDeviceIdentify) {
        return;
    }

    // analog channel
    WebVideoCtrl.I_GetAnalogChannelInfo(szDeviceIdentify, {
        async: false,
        success: function (xmlDoc) {
            var oChannels = $(xmlDoc).find("VideoInputChannel");

            $.each(oChannels, function (i) {
                var id = $(this).find("id").eq(0).text(),
                    name = $(this).find("name").eq(0).text();
                if ("" == name) {
                    name = "Camera " + (i < 9 ? "0" + (i + 1) : (i + 1));
                }
                oSel.append("<option value='" + id + "' bZero='false'>" + name + "</option>");
            });
            showOPInfo(szDeviceIdentify + " get analog channel success！");
        },
        error: function (status, xmlDoc) {
            showOPInfo(szDeviceIdentify + " get analog channel failed！", status, xmlDoc);
        }
    });
    // IP channel
    WebVideoCtrl.I_GetDigitalChannelInfo(szDeviceIdentify, {
        async: false,
        success: function (xmlDoc) {
            var oChannels = $(xmlDoc).find("InputProxyChannelStatus");

            $.each(oChannels, function (i) {
                var id = $(this).find("id").eq(0).text(),
                    name = $(this).find("name").eq(0).text(),
                    online = $(this).find("online").eq(0).text();
                if ("false" == online) {// filter the forbidden IP channel
                    return true;
                }
                if ("" == name) {
                    name = "IPCamera " + (i < 9 ? "0" + (i + 1) : (i + 1));
                }
                oSel.append("<option value='" + id + "' bZero='false'>" + name + "</option>");
            });
            showOPInfo(szDeviceIdentify + " get IP channel success！");
        },
        error: function (status, xmlDoc) {
            showOPInfo(szDeviceIdentify + " get IP channel failed！", status, xmlDoc);
        }
    });
    // zero-channel info
    WebVideoCtrl.I_GetZeroChannelInfo(szDeviceIdentify, {
        async: false,
        success: function (xmlDoc) {
            var oChannels = $(xmlDoc).find("ZeroVideoChannel");
            
            $.each(oChannels, function (i) {
                var id = $(this).find("id").eq(0).text(),
                    name = $(this).find("name").eq(0).text();
                if ("" == name) {
                    name = "Zero Channel " + (i < 9 ? "0" + (i + 1) : (i + 1));
                }
                if ("true" == $(this).find("enabled").eq(0).text()) {//  filter the forbidden zero-channel
                    oSel.append("<option value='" + id + "' bZero='true'>" + name + "</option>");
                }
            });
            showOPInfo(szDeviceIdentify + " get zero-channel success！");
        },
        error: function (status, xmlDoc) {
            showOPInfo(szDeviceIdentify + " get zero-channel failed！", status, xmlDoc);
        }
    });
}

// get port
function getDevicePort() {
    var szDeviceIdentify = $("#ip").val();

    if (null == szDeviceIdentify) {
        return;
    }

    var oPort = WebVideoCtrl.I_GetDevicePort(szDeviceIdentify);
    if (oPort != null) {
        $("#deviceport").val(oPort.iDevicePort);
        $("#rtspport").val(oPort.iRtspPort);

        showOPInfo(szDeviceIdentify + " get port success！");
    } else {
        showOPInfo(szDeviceIdentify + " get port failed！");
    }
}

// get IP channel
function clickGetDigitalChannelInfo() {
    var szDeviceIdentify = $("#ip").val(),
        iAnalogChannelNum = 0;

    $("#digitalchannellist").empty();

    if (null == szDeviceIdentify) {
        return;
    }

    // analog channel
    WebVideoCtrl.I_GetAnalogChannelInfo(szDeviceIdentify, {
        async: false,
        success: function (xmlDoc) {
            iAnalogChannelNum = $(xmlDoc).find("VideoInputChannel").length;
        },
        error: function () {
            
        }
    });

    // IP channel
    WebVideoCtrl.I_GetDigitalChannelInfo(szDeviceIdentify, {
        async: false,
        success: function (xmlDoc) {
            var oChannels = $(xmlDoc).find("InputProxyChannelStatus");
            
            $.each(oChannels, function () {
                var id = parseInt($(this).find("id").eq(0).text(), 10),
                    ipAddress = $(this).find("ipAddress").eq(0).text(),
                    srcInputPort = $(this).find("srcInputPort").eq(0).text(),
                    managePortNo = $(this).find("managePortNo").eq(0).text(),
                    online = $(this).find("online").eq(0).text(),
                    proxyProtocol = $(this).find("proxyProtocol").eq(0).text();
                            
                var objTr = $("#digitalchannellist").get(0).insertRow(-1);
                var objTd = objTr.insertCell(0);
                objTd.innerHTML = (id - iAnalogChannelNum) < 10 ? "D0" + (id - iAnalogChannelNum) : "D" + (id - iAnalogChannelNum);
                objTd = objTr.insertCell(1);
                objTd.width = "25%";
                objTd.innerHTML = ipAddress;
                objTd = objTr.insertCell(2);
                objTd.width = "15%";
                objTd.innerHTML = srcInputPort;
                objTd = objTr.insertCell(3);
                objTd.width = "20%";
                objTd.innerHTML = managePortNo;
                objTd = objTr.insertCell(4);
                objTd.width = "15%";
                objTd.innerHTML = "true" == online ? "online" : "offline";
                objTd = objTr.insertCell(5);
                objTd.width = "25%";
                objTd.innerHTML = proxyProtocol;
            });
            showOPInfo(szDeviceIdentify + " get IP channel success！");
        },
        error: function (status, xmlDoc) {
            showOPInfo(szDeviceIdentify + " no IP channel！", status, xmlDoc);
        }
    });
}

// strat real play
function clickStartRealPlay(iStreamType) {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        szDeviceIdentify = $("#ip").val(),
        iRtspPort = parseInt($("#rtspport").val(), 10),
        iChannelID = parseInt($("#channels").val(), 10),
        bZeroChannel = $("#channels option").eq($("#channels").get(0).selectedIndex).attr("bZero") == "true" ? true : false,
        szInfo = "";

    if ("undefined" === typeof iStreamType) {
        iStreamType = parseInt($("#streamtype").val(), 10);
    }

    if (null == szDeviceIdentify) {
        return;
    }

    var startRealPlay = function () {
        WebVideoCtrl.I_StartRealPlay(szDeviceIdentify, {
            iRtspPort: iRtspPort,
            iStreamType: iStreamType,
            iChannelID: iChannelID,
            bZeroChannel: bZeroChannel,
            success: function () {
                szInfo = "start real play success！";
                showOPInfo(szDeviceIdentify + " " + szInfo);
            },
            error: function (status, xmlDoc) {
                if (403 === status) {
                    szInfo = "Device do not support Websocket extracting the flow！";
                } else {
                    szInfo = "start real play failed！";
                }
                showOPInfo(szDeviceIdentify + " " + szInfo);
            }
        });
    };

    if (oWndInfo != null) {// stop play first
        WebVideoCtrl.I_Stop({
            success: function () {
                startRealPlay();
            }
        });
    } else {
        startRealPlay();
    }
}
function setTextOverlay() {
    var  szDeviceIdentify = $("#ip").val();
    var szInfo = "";
    var that = this;
    var szUrl = "ISAPI/System/Video/inputs/channels/1/overlays";
        WebVideoCtrl.I_GetTextOverlay(szUrl,szDeviceIdentify,{
            success:function(data){
            $(data).find("TextOverlay").eq(0).find("displayText").eq(0).text("eee6444是66ee&lt;");
            $(data).find("TextOverlay").eq(0).find("positionX").eq(0).text("208");
            $(data).find("TextOverlay").eq(0).find("positionY").eq(0).text("304");
            var xmldoc = toXMLStr(data);
            var newOptions = {
                async:true,
                type: "PUT",
                data:xmldoc,
                success:function(){
                    szInfo = "draw osd succ";
                    showOPInfo(szDeviceIdentify + " " + szInfo);
                },
                error:function(){
                    szInfo = "draw osd fail";
                showOPInfo(szDeviceIdentify + " " + szInfo);
                }
            };
           
            WebVideoCtrl.I_SendHTTPRequest(szDeviceIdentify,szUrl,newOptions);
        },
        error:function(){
            szInfo = "get osd fail";
                showOPInfo(szDeviceIdentify + " " + szInfo);
        }
    });
    }
// stop real play
function clickStopRealPlay() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        szInfo = "";

    if (oWndInfo != null) {
        WebVideoCtrl.I_Stop({
            success: function () {
                szInfo = "stop real play success！";
                showOPInfo(oWndInfo.szDeviceIdentify + " " + szInfo);
            },
            error: function () {
                szInfo = "stop real play failed！";
                showOPInfo(oWndInfo.szDeviceIdentify + " " + szInfo);
            }
        });
    }
}

// open sound
function clickOpenSound() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        szInfo = "";

    if (oWndInfo != null) {
        var allWndInfo = WebVideoCtrl.I_GetWindowStatus();
        // close the sound by iterating over all the window
        for (var i = 0, iLen = allWndInfo.length; i < iLen; i++) {
            oWndInfo = allWndInfo[i];
            if (oWndInfo.bSound) {
                WebVideoCtrl.I_CloseSound(oWndInfo.iIndex);
                break;
            }
        }

        var iRet = WebVideoCtrl.I_OpenSound();

        if (0 == iRet) {
            szInfo = "open sound success！";
        } else {
            szInfo = "open sound failed！";
        }
        showOPInfo(oWndInfo.szDeviceIdentify + " " + szInfo);
    }
}

// close sound
function clickCloseSound() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        szInfo = "";

    if (oWndInfo != null) {
        var iRet = WebVideoCtrl.I_CloseSound();
        if (0 == iRet) {
            szInfo = "close sound success！";
        } else {
            szInfo = "close sound failed！";
        }
        showOPInfo(oWndInfo.szDeviceIdentify + " " + szInfo);
    }
}

// set volume
function clickSetVolume() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        iVolume = parseInt($("#volume").val(), 10),
        szInfo = "";

    if (oWndInfo != null) {
        var iRet = WebVideoCtrl.I_SetVolume(iVolume);
        if (0 == iRet) {
            szInfo = "set volume success！";
        } else {
            szInfo = "set volume failed！";
        }
        showOPInfo(oWndInfo.szDeviceIdentify + " " + szInfo);
    }
}

// capture
function clickCapturePic() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        szInfo = "";

    if (oWndInfo != null) {
        var xmlDoc = WebVideoCtrl.I_GetLocalCfg();
        var szCaptureFileFormat = "0";
        if (xmlDoc != null) {
            szCaptureFileFormat = $(xmlDoc).find("CaptureFileFormat").eq(0).text();
        }

        var szChannelID = $("#channels").val();
        var szPicName = oWndInfo.szDeviceIdentify + "_" + szChannelID + "_" + new Date().getTime();
        
        szPicName += ("0" === szCaptureFileFormat) ? ".jpg": ".bmp";

        var iRet = WebVideoCtrl.I_CapturePic(szPicName, {
            bDateDir: true  //generate the date file or not
        });
        if (0 == iRet) {
            szInfo = "capture success！";
        } else {
            szInfo = "capture failed！";
        }
        showOPInfo(oWndInfo.szDeviceIdentify + " " + szInfo);
    }
}
// capture onload
function clickCapturePicData() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        szInfo = "";
    if (oWndInfo != null) {
        WebVideoCtrl.I2_CapturePicData().then(function(data){
            szInfo = "capture onload success！";
            console.log(data);
            showOPInfo(oWndInfo.szDeviceIdentify + " " + szInfo);
        },function(){
            szInfo = "capture onload failed！";
            showOPInfo(oWndInfo.szDeviceIdentify + " " + szInfo);
        });
    }
}
// start record
var g_szRecordType = "";
function clickStartRecord(szType) {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        szInfo = "";

    g_szRecordType = szType;

    if (oWndInfo != null) {
        var szChannelID = $("#channels").val(),
            szFileName = oWndInfo.szDeviceIdentify + "_" + szChannelID + "_" + new Date().getTime();

        WebVideoCtrl.I_StartRecord(szFileName, {
            bDateDir: true, //generate the date file or not
            success: function () {
                if ('realplay' === szType) {
                    szInfo = "start recording success！";
                } else if ('playback' === szType) {
                    szInfo = "start clip success！";
                }
                showOPInfo(oWndInfo.szDeviceIdentify + " " + szInfo);
            },
            error: function () {
                if ('realplay' === szType) {
                    szInfo = "start recording failed！";
                } else if ('playback' === szType) {
                    szInfo = "start clip failed！";
                }
                showOPInfo(oWndInfo.szDeviceIdentify + " " + szInfo);
            }
        });
    }
}

// stop record
function clickStopRecord(szType, iWndIndex) {
    if ("undefined" === typeof iWndIndex) {
        iWndIndex = g_iWndIndex;
    }
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(iWndIndex),
        szInfo = "";

    if (oWndInfo != null) {
        WebVideoCtrl.I_StopRecord({
            success: function () {
                if ('realplay' === szType) {
                    szInfo = "stop recording success！";
                } else if ('playback' === szType) {
                    szInfo = "stop clip success！";
                }
                showOPInfo(oWndInfo.szDeviceIdentify + " " + szInfo);
            },
            error: function () {
                if ('realplay' === szType) {
                    szInfo = "stop recording failed！";
                } else if ('playback' === szType) {
                    szInfo = "stop clip failed！";
                }
                showOPInfo(oWndInfo.szDeviceIdentify + " " + szInfo);
            }
        });
    }
}

// get audio channel
function clickGetAudioInfo() {
    var szDeviceIdentify = $("#ip").val();

    if (null == szDeviceIdentify) {
        return;
    }

    WebVideoCtrl.I_GetAudioInfo(szDeviceIdentify, {
        success: function (xmlDoc) {
            var oAudioChannels = $(xmlDoc).find("TwoWayAudioChannel"),
                oSel = $("#audiochannels").empty();
            $.each(oAudioChannels, function () {
                var id = $(this).find("id").eq(0).text();

                oSel.append("<option value='" + id + "'>" + id + "</option>");
            });
            showOPInfo(szDeviceIdentify + " get audio channel success！");
        },
        error: function (status, xmlDoc) {
            showOPInfo(szDeviceIdentify + " get audio channel failed！", status, xmlDoc);
        }
    });
}

// start voice talk
function clickStartVoiceTalk() {
    var szDeviceIdentify = $("#ip").val(),
        iAudioChannel = parseInt($("#audiochannels").val(), 10),
        szInfo = "";

    if (null == szDeviceIdentify) {
        return;
    }

    if (isNaN(iAudioChannel)) {
        alert("please select channel first！");
        return;
    }

    var iRet = WebVideoCtrl.I_StartVoiceTalk(szDeviceIdentify, iAudioChannel);

    if (0 == iRet) {
        szInfo = "start voice talk success！";
    } else {
        szInfo = "start voice talk failed！";
    }
    showOPInfo(szDeviceIdentify + " " + szInfo);
}

// stop voice talk
function clickStopVoiceTalk() {
    var szDeviceIdentify = $("#ip").val(),
        iRet = WebVideoCtrl.I_StopVoiceTalk(),
        szInfo = "";

    if (null == szDeviceIdentify) {
        return;
    }

    if (0 == iRet) {
        szInfo = "stop voice talk success！";
    } else {
        szInfo = "stop voice talk failed！";
    }
    showOPInfo(szDeviceIdentify + " " + szInfo);
}

// enable E-zoom
function clickEnableEZoom() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        szInfo = "";

    if (oWndInfo != null) {
        var iRet = WebVideoCtrl.I_EnableEZoom();
        if (0 == iRet) {
            szInfo = "enable E-zoom success！";
        } else {
            szInfo = "enable E-zoom failed！";
        }
        showOPInfo(oWndInfo.szDeviceIdentify + " " + szInfo);
    }
}

// disable E-zoom
function clickDisableEZoom() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        szInfo = "";

    if (oWndInfo != null) {
        var iRet = WebVideoCtrl.I_DisableEZoom();
        if (0 == iRet) {
            szInfo = "disable E-zoom success！";
        } else {
            szInfo = "disable E-zoom failed！";
        }
        showOPInfo(oWndInfo.szDeviceIdentify + " " + szInfo);
    }
}

// enable 3D zoom
function clickEnable3DZoom() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        szInfo = "";

    if (oWndInfo != null) {
        var iRet = WebVideoCtrl.I_Enable3DZoom();
        if (0 == iRet) {
            szInfo = "enable 3D zoom success！";
        } else {
            szInfo = "enable 3D zoom failed！";
        }
        showOPInfo(oWndInfo.szDeviceIdentify + " " + szInfo);
    }
}

// diasble 3D zoom
function clickDisable3DZoom() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        szInfo = "";

    if (oWndInfo != null) {
        var iRet = WebVideoCtrl.I_Disable3DZoom();
        if (0 == iRet) {
            szInfo = "diasble 3D zoom success！";
        } else {
            szInfo = "diasble 3D zoom failed！";
        }
        showOPInfo(oWndInfo.szDeviceIdentify + " " + szInfo);
    }
}

// full screen
function clickFullScreen() {
    WebVideoCtrl.I_FullScreen(true);
}

// PTZ control, 9- auto; 1,2,3,4,5,6,7,8 -  PTZ direction control by mouse
var g_bPTZAuto = false;
function mouseDownPTZControl(iPTZIndex) {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        bZeroChannel = $("#channels option").eq($("#channels").get(0).selectedIndex).attr("bZero") == "true" ? true : false,
        iPTZSpeed = $("#ptzspeed").val();

    if (bZeroChannel) {// zero-channel does not support PTZ 
        return;
    }
    
    if (oWndInfo != null) {
        if (9 == iPTZIndex && g_bPTZAuto) {
            iPTZSpeed = 0;// you can close auto mode by setting speed to 0 when auto is start already
        } else {
            g_bPTZAuto = false;// auto mode will be close when you clik other direction
        }

        WebVideoCtrl.I_PTZControl(iPTZIndex, false, {
            iPTZSpeed: iPTZSpeed,
            success: function (xmlDoc) {
                if (9 == iPTZIndex && g_bPTZAuto) {
                    showOPInfo(oWndInfo.szDeviceIdentify + " stop PTZ success！");
                } else {
                    showOPInfo(oWndInfo.szDeviceIdentify + " start PTZ success！");
                }
                if (9 == iPTZIndex) {
                    g_bPTZAuto = !g_bPTZAuto;
                }
            },
            error: function (status, xmlDoc) {
                showOPInfo(oWndInfo.szDeviceIdentify + " start PTZ failed！", status, xmlDoc);
            }
        });
    }
}

// stop PTZ direction 
function mouseUpPTZControl() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);

    if (oWndInfo != null) {
        WebVideoCtrl.I_PTZControl(1, true, {
            success: function (xmlDoc) {
                showOPInfo(oWndInfo.szDeviceIdentify + " stop PTZ success！");
            },
            error: function (status, xmlDoc) {
                showOPInfo(oWndInfo.szDeviceIdentify + " stop PTZ failed！", status, xmlDoc);
            }
        });
    }
}

// set preset
function clickSetPreset() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        iPresetID = parseInt($("#preset").val(), 10);

    if (oWndInfo != null) {
        WebVideoCtrl.I_SetPreset(iPresetID, {
            success: function (xmlDoc) {
                showOPInfo(oWndInfo.szDeviceIdentify + " set preset success！");
            },
            error: function (status, xmlDoc) {
                showOPInfo(oWndInfo.szDeviceIdentify + " set preset failed！", status, xmlDoc);
            }
        });
    }
}

// call preset
function clickGoPreset() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        iPresetID = parseInt($("#preset").val(), 10);

    if (oWndInfo != null) {
        WebVideoCtrl.I_GoPreset(iPresetID, {
            success: function (xmlDoc) {
                showOPInfo(oWndInfo.szDeviceIdentify + " call preset success！");
            },
            error: function (status, xmlDoc) {
                showOPInfo(oWndInfo.szDeviceIdentify + " call preset failed！", status, xmlDoc);
            }
        });
    }
}

// record searching
var g_iSearchTimes = 0;
function clickRecordSearch(iType) {
    var szDeviceIdentify = $("#ip").val(),
        iChannelID = parseInt($("#channels").val(), 10),
        bZeroChannel = $("#channels option").eq($("#channels").get(0).selectedIndex).attr("bZero") == "true" ? true : false,
        iStreamType = parseInt($("#record_streamtype").val(), 10),
        szStartTime = $("#starttime").val(),
        szEndTime = $("#endtime").val();
        if (Date.parse(szEndTime.replace(/-/g, "/")) - Date.parse(szStartTime.replace(/-/g, "/")) < 0) {
            alert("starttime must earlier than endtime");
            return;
        }
    if (null == szDeviceIdentify) {
        return;
    }

    if (bZeroChannel) {// zero-channel does not support record searching
        return;
    }

    if (0 == iType) {// search for the first time
        $("#searchlist").empty();
        iSearchTimes = 0;
    }

    WebVideoCtrl.I_RecordSearch(szDeviceIdentify, iChannelID, szStartTime, szEndTime, {
        iStreamType: iStreamType,
        iSearchPos: g_iSearchTimes * 40,
        success: function (xmlDoc) {
            if("MORE" === $(xmlDoc).find("responseStatusStrg").eq(0).text()) {
                
                for(var i = 0, nLen = $(xmlDoc).find("searchMatchItem").length; i < nLen; i++) {
                    var szPlaybackURI = $(xmlDoc).find("playbackURI").eq(i).text();
                    if(szPlaybackURI.indexOf("name=") < 0) {
                        break;
                    }
                    var szStartTime = $(xmlDoc).find("startTime").eq(i).text();
                    var szEndTime = $(xmlDoc).find("endTime").eq(i).text();
                    var szFileName = szPlaybackURI.substring(szPlaybackURI.indexOf("name=") + 5, szPlaybackURI.indexOf("&size="));

                    var objTr = $("#searchlist").get(0).insertRow(-1);
                    var objTd = objTr.insertCell(0);
                    objTd.id = "downloadTd" + i;
                    objTd.innerHTML = g_iSearchTimes * 40 + (i + 1);
                    objTd = objTr.insertCell(1);
                    objTd.width = "30%";
                    objTd.innerHTML = szFileName;
                    objTd = objTr.insertCell(2);
                    objTd.width = "30%";
                    objTd.innerHTML = (szStartTime.replace("T", " ")).replace("Z", "");
                    objTd = objTr.insertCell(3);
                    objTd.width = "30%";
                    objTd.innerHTML = (szEndTime.replace("T", " ")).replace("Z", "");
                    objTd = objTr.insertCell(4);
                    objTd.width = "10%";
                    objTd.innerHTML = "<a href='javascript:;' onclick='clickStartDownloadRecord(" + (i + g_iSearchTimes * 40) + ");'>download</a>";
                    $("#downloadTd" + (i + g_iSearchTimes * 40)).data("fileName", szFileName);
                    $("#downloadTd" + (i + g_iSearchTimes * 40)).data("playbackURI", szPlaybackURI);
                }

                g_iSearchTimes++;
                clickRecordSearch(1);// contine to search
            } else if ("OK" === $(xmlDoc).find("responseStatusStrg").eq(0).text()) {
                var iLength = $(xmlDoc).find("searchMatchItem").length;
                for(var i = 0; i < iLength; i++) {
                    var szPlaybackURI = $(xmlDoc).find("playbackURI").eq(i).text();
                    if(szPlaybackURI.indexOf("name=") < 0) {
                        break;
                    }
                    var szStartTime = $(xmlDoc).find("startTime").eq(i).text();
                    var szEndTime = $(xmlDoc).find("endTime").eq(i).text();
                    var szFileName = szPlaybackURI.substring(szPlaybackURI.indexOf("name=") + 5, szPlaybackURI.indexOf("&size="));

                    var objTr = $("#searchlist").get(0).insertRow(-1);
                    var objTd = objTr.insertCell(0);
                    objTd.id = "downloadTd" + i;
                    objTd.innerHTML = g_iSearchTimes * 40 + (i + 1);
                    objTd = objTr.insertCell(1);
                    objTd.width = "30%";
                    objTd.innerHTML = szFileName;
                    objTd = objTr.insertCell(2);
                    objTd.width = "30%";
                    objTd.innerHTML = (szStartTime.replace("T", " ")).replace("Z", "");
                    objTd = objTr.insertCell(3);
                    objTd.width = "30%";
                    objTd.innerHTML = (szEndTime.replace("T", " ")).replace("Z", "");
                    objTd = objTr.insertCell(4);
                    objTd.width = "10%";
                    objTd.innerHTML = "<a href='javascript:;' onclick='clickStartDownloadRecord(" + (i + g_iSearchTimes * 40) + ");'>download</a>";
                    $("#downloadTd" + (i + g_iSearchTimes * 40)).data("fileName", szFileName);
                    $("#downloadTd" + (i + g_iSearchTimes * 40)).data("playbackURI", szPlaybackURI);
                }
                showOPInfo(szDeviceIdentify + " search video file success！");
            } else if("NO MATCHES" === $(xmlDoc).find("responseStatusStrg").eq(0).text()) {
                setTimeout(function() {
                    showOPInfo(szDeviceIdentify + " no record file！");
                }, 50);
            }
        },
        error: function (status, xmlDoc) {
            showOPInfo(szDeviceIdentify + " search record file failed！", status, xmlDoc);
        }
    });
}

// start play back
function clickStartPlayback() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        szDeviceIdentify = $("#ip").val(),
        iRtspPort = parseInt($("#rtspport").val(), 10),
        iStreamType = parseInt($("#record_streamtype").val(), 10),
        bZeroChannel = $("#channels option").eq($("#channels").get(0).selectedIndex).attr("bZero") == "true" ? true : false,
        iChannelID = parseInt($("#channels").val(), 10),
        szStartTime = $("#starttime").val(),
        szEndTime = $("#endtime").val(),
        szInfo = "",
        bChecked = $("#transstream").prop("checked"),
        iRet = -1;

    if (null == szDeviceIdentify) {
        return;
    }

    if (bZeroChannel) {// zero-channel does not support play back
        return;
    }

    var startPlayback = function () {
        if (bChecked) {// enable transcode playback
            var oTransCodeParam = {
                TransFrameRate: "16",// 0：full，5：1，6：2，7：4，8：6，9：8，10：10，11：12，12：16，14：15，15：18，13：20，16：22
                TransResolution: "2",// 255：Auto，3：4CIF，2：QCIF，1：CIF
                TransBitrate: "23"// 2：32K，3：48K，4：64K，5：80K，6：96K，7：128K，8：160K，9：192K，10：224K，11：256K，12：320K，13：384K，14：448K，15：512K，16：640K，17：768K，18：896K，19：1024K，20：1280K，21：1536K，22：1792K，23：2048K，24：3072K，25：4096K，26：8192K
            };
            WebVideoCtrl.I_StartPlayback(szDeviceIdentify, {
                iRtspPort: iRtspPort,
                iStreamType: iStreamType,
                iChannelID: iChannelID,
                szStartTime: szStartTime,
                szEndTime: szEndTime,
                oTransCodeParam: oTransCodeParam,
                success: function () {
                    szInfo = "start play back success！";
                    showOPInfo(szDeviceIdentify + " " + szInfo);
                },
                error: function (status, xmlDoc) {
                    if (403 === status) {
                        szInfo = "Device do not support Websocket extracting the flow！";
                    } else {
                        szInfo = "start play back failed！";
                    }
                    showOPInfo(szDeviceIdentify + " " + szInfo);
                }
            });
        } else {
            WebVideoCtrl.I_StartPlayback(szDeviceIdentify, {
                iRtspPort: iRtspPort,
                iStreamType: iStreamType,
                iChannelID: iChannelID,
                szStartTime: szStartTime,
                szEndTime: szEndTime,
                success: function () {
                    szInfo = "start play back success！";
                    showOPInfo(szDeviceIdentify + " " + szInfo);
                },
                error: function (status, xmlDoc) {
                    if (403 === status) {
                        szInfo = "Device do not support Websocket extracting the flow！";
                    } else {
                        szInfo = "start play back failed！";
                    }
                    showOPInfo(szDeviceIdentify + " " + szInfo);
                }
            });
        }
    };

    if (oWndInfo != null) {// stop play first
        WebVideoCtrl.I_Stop({
            success: function () {
                startPlayback();
            }
        });
    } else {
        startPlayback();
    }
}

// stop play back
function clickStopPlayback() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        szInfo = "";

    if (oWndInfo != null) {
        WebVideoCtrl.I_Stop({
            success: function () {
                szInfo = "stop play back success！";
                showOPInfo(oWndInfo.szDeviceIdentify + " " + szInfo);
            },
            error: function () {
                szInfo = "stop play back failed！";
                showOPInfo(oWndInfo.szDeviceIdentify + " " + szInfo);
            }
        });
    }
}

// start reverse play
function clickReversePlayback() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        szDeviceIdentify = $("#ip").val(),
        iRtspPort = parseInt($("#rtspport").val(), 10),
        iStreamType = parseInt($("#record_streamtype").val(), 10),
        bZeroChannel = $("#channels option").eq($("#channels").get(0).selectedIndex).attr("bZero") == "true" ? true : false,
        iChannelID = parseInt($("#channels").val(), 10),
        szStartTime = $("#starttime").val(),
        szEndTime = $("#endtime").val(),
        szInfo = "";

    if (null == szDeviceIdentify) {
        return;
    }

    if (bZeroChannel) {// zero-channel does not support reverse play
        return;
    }

    var reversePlayback = function () {
        var iRet = WebVideoCtrl.I_ReversePlayback(szDeviceIdentify, {
            iRtspPort: iRtspPort,
            iStreamType: iStreamType,
            iChannelID: iChannelID,
            szStartTime: szStartTime,
            szEndTime: szEndTime
        });

        if (0 == iRet) {
            szInfo = "start reverse play success！";
        } else {
            szInfo = "start reverse play failed！";
        }
        showOPInfo(szDeviceIdentify + " " + szInfo);
    };

    if (oWndInfo != null) {// stop play first
        WebVideoCtrl.I_Stop({
            success: function () {
                reversePlayback();
            }
        });
    } else {
        reversePlayback();
    }
}

// single frame
function clickFrame() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        szInfo = "";

    if (oWndInfo != null) {
        WebVideoCtrl.I_Frame({
            success: function () {
                szInfo = "single frame play success！";
                showOPInfo(oWndInfo.szDeviceIdentify + " " + szInfo);
            },
            error: function () {
                szInfo = "single frame play failed！";
                showOPInfo(oWndInfo.szDeviceIdentify + " " + szInfo);
            }
        });
    }
}

// pause
function clickPause() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        szInfo = "";

    if (oWndInfo != null) {
        WebVideoCtrl.I_Pause({
            success: function () {
                szInfo = "pause success！";
                showOPInfo(oWndInfo.szDeviceIdentify + " " + szInfo);
            },
            error: function () {
                szInfo = "pause failed！";
                showOPInfo(oWndInfo.szDeviceIdentify + " " + szInfo);
            }
        });
    }
}

// resume
function clickResume() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        szInfo = "";

    if (oWndInfo != null) {
        WebVideoCtrl.I_Resume({
            success: function () {
                szInfo = "resume success！";
                showOPInfo(oWndInfo.szDeviceIdentify + " " + szInfo);
            },
            error: function () {
                szInfo = "resume failed！";
                showOPInfo(oWndInfo.szDeviceIdentify + " " + szInfo);
            }
        });
    }
}

// slow play
function clickPlaySlow() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        szInfo = "";

    if (oWndInfo != null) {
        WebVideoCtrl.I_PlaySlow({
            success: function () {
                szInfo = "slow play success！";
                showOPInfo(oWndInfo.szDeviceIdentify + " " + szInfo);
            },
            error: function () {
                szInfo = "slow play failed！";
                showOPInfo(oWndInfo.szDeviceIdentify + " " + szInfo);
            }
        });
    }
}

// fast play
function clickPlayFast() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        szInfo = "";

    if (oWndInfo != null) {
        WebVideoCtrl.I_PlayFast({
            success: function () {
                szInfo = "fast play success！";
                showOPInfo(oWndInfo.szDeviceIdentify + " " + szInfo);
            },
            error: function () {
                szInfo = "fast play failed！";
                showOPInfo(oWndInfo.szDeviceIdentify + " " + szInfo);
            }
        });
    }
}

// OSD time
function clickGetOSDTime() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    
    if (oWndInfo != null) {
        var szTime = WebVideoCtrl.I_GetOSDTime({
            success: function (szOSDTime) {
                $("#osdtime").val(szOSDTime);
                showOPInfo(oWndInfo.szDeviceIdentify + " get OSD time success！");
            },
            error: function () {
                showOPInfo(oWndInfo.szDeviceIdentify + " get OSD time failed！");
            }
        });
    }
}

// download video
var g_iDownloadID = -1;
var g_tDownloadProcess = 0;
function clickStartDownloadRecord(i) {
    var szDeviceIdentify = $("#ip").val(),
        szChannelID = $("#channels").val(),
        szFileName = $("#downloadTd" + i).data("fileName"),
        szPlaybackURI = $("#downloadTd" + i).data("playbackURI");

    if (null == szDeviceIdentify) {
        return;
    }

    g_iDownloadID = WebVideoCtrl.I_StartDownloadRecord(szDeviceIdentify, szPlaybackURI, szFileName, {
        bDateDir: true  //generate the date file or not
    });

    if (g_iDownloadID < 0) {
        var iErrorValue = WebVideoCtrl.I_GetLastError();
        if (34 == iErrorValue) {
            showOPInfo(szDeviceIdentify + " download already！");
        } else if (33 == iErrorValue) {
            showOPInfo(szDeviceIdentify + " lack of space！");
        } else {
            showOPInfo(szDeviceIdentify + " download failed！");
        }
    } else {
        $("<div id='downProcess' class='freeze'></div>").appendTo("body");
        g_tDownloadProcess = setInterval("downProcess(" + i + ")", 1000);
    }
}
function clickStartDownloadRecordByTime() {
    var szDeviceIdentify = $("#ip").val(),
        szChannelID = $("#channels").val(),
        szFileName = $("#downloadTd0").data("fileName"),
        szPlaybackURI = $("#downloadTd0").data("playbackURI"),
        szStartTime = $("#downloadstarttime").val(),
        szEndTime = $("#downloadendtime").val();
    if (null == szDeviceIdentify) {
        return;
    }
    if (Date.parse(szEndTime.replace(/-/g, "/")) - Date.parse(szStartTime.replace(/-/g, "/")) < 0) {
        alert("starttime must earlier than endtime");
        return;
    }
    g_iDownloadID = WebVideoCtrl.I_StartDownloadRecordByTime(szDeviceIdentify, szPlaybackURI, szFileName, szStartTime,szEndTime,{
        bDateDir: true  //是否生成日期文件
    });

    if (g_iDownloadID < 0) {
        var iErrorValue = WebVideoCtrl.I_GetLastError();
        if (34 == iErrorValue) {
            showOPInfo(szDeviceIdentify + " Downloaded");
        } else if (33 == iErrorValue) {
            showOPInfo(szDeviceIdentify + " No enough space");
        } else {
            showOPInfo(szDeviceIdentify + " Download Failed！");
        }
    } else {
        $("<div id='downProcess' class='freeze'></div>").appendTo("body");
        g_tDownloadProcess = setInterval("downProcess(" + 0 + ")", 1000);
    }
}
// download process
function downProcess() {
    var iStatus = WebVideoCtrl.I_GetDownloadStatus(g_iDownloadID);
    if (0 == iStatus) {
        $("#downProcess").css({
            width: $("#searchlist").width() + "px",
            height: "100px",
            lineHeight: "100px",
            left: $("#searchdiv").offset().left + "px",
            top: $("#searchdiv").offset().top + "px"
        });
        var iProcess = WebVideoCtrl.I_GetDownloadProgress(g_iDownloadID);
        if (iProcess < 0) {
            clearInterval(g_tDownloadProcess);
            g_tDownloadProcess = 0;
            g_iDownloadID = -1;
        } else if (iProcess < 100) {
            $("#downProcess").text(iProcess + "%");
        } else {
            $("#downProcess").text("100%");
            setTimeout(function () {
                $("#downProcess").remove();
            }, 1000);
            WebVideoCtrl.I_StopDownloadRecord(g_iDownloadID);
            showOPInfo("video dowload finish");
            clearInterval(g_tDownloadProcess);
            g_tDownloadProcess = 0;
            g_iDownloadID = -1;
        }
    } else {
        WebVideoCtrl.I_StopDownloadRecord(g_iDownloadID);

        clearInterval(g_tDownloadProcess);
        g_tDownloadProcess = 0;
        g_iDownloadID = -1;
    }
}

// export configuration file
function clickExportDeviceConfig() {
    var szDeviceIdentify = $("#ip").val(),
    szInfo = "";

if (null == szDeviceIdentify) {
    return;
}
var szDevicePassWord = $("#edfpassword").val();

var iRet = WebVideoCtrl.I_ExportDeviceConfig(szDeviceIdentify,szDevicePassWord);

    if (0 == iRet) {
        szInfo = " export configuration file success！";
    } else {
        szInfo = " export configuration file failed！";
    }
    showOPInfo(szDeviceIdentify + " " + szInfo);
}

// import configuration file
function clickImportDeviceConfig() {
    var szDeviceIdentify = $("#ip").val(),
        szFileName = $("#configFile").val();
    var szDevicePassWord= $("#edfpassword").val();
    if (null == szDeviceIdentify) {
        return;
    }

    if ("" == szFileName) {
        alert("please select configuration file！");
        return;
    }

    var iRet = WebVideoCtrl.I_ImportDeviceConfig(szDeviceIdentify, szFileName,szDevicePassWord);

    if (0 == iRet) {
        WebVideoCtrl.I_Restart(szDeviceIdentify, {
            success: function (xmlDoc) {
                $("<div id='restartDiv' class='freeze'>reboot...</div>").appendTo("body");
                var oSize = getWindowSize();
                $("#restartDiv").css({
                    width: oSize.width + "px",
                    height: oSize.height + "px",
                    lineHeight: oSize.height + "px",
                    left: 0,
                    top: 0
                });
                setTimeout("reconnect('" + szDeviceIdentify + "')", 20000);
            },
            error: function (status, xmlDoc) {
                showOPInfo(szDeviceIdentify + " reboot failed！", status, xmlDoc);
            }
        });
    } else {
        showOPInfo(szDeviceIdentify + " export failed！");
    }
}

// reconnection
function reconnect(szDeviceIdentify) {
    WebVideoCtrl.I_Reconnect(szDeviceIdentify, {
        success: function (xmlDoc) {
            $("#restartDiv").remove();
        },
        error: function (status, xmlDoc) {
            if (401 == status) {// no plug-in scheme,session invalid after restart,program log out,delete from the device which has logged in
                $("#restartDiv").remove();
                clickLogout();
            } else {
                setTimeout(function () {reconnect(szDeviceIdentify);}, 5000);
            }
        }
    });
}

// start upgrade
var g_tUpgrade = 0;
function clickStartUpgrade(szDeviceIdentify) {
    var szDeviceIdentify = $("#ip").val(),
        szFileName = $("#upgradeFile").val();

    if (null == szDeviceIdentify) {
        return;
    }

    if ("" == szFileName) {
        alert("please select upgrade file！");
        return;
    }

    WebVideoCtrl.I2_StartUpgrade(szDeviceIdentify, szFileName).then(function(){
        g_tUpgrade = setInterval("getUpgradeStatus('" + szDeviceIdentify + "')", 1000);
    },function(){
        showOPInfo(szDeviceIdentify + " upgrade failed！");
    });
}

// get upgrade status
function getUpgradeStatus(szDeviceIdentify) {
    var iStatus = WebVideoCtrl.I_UpgradeStatus();
    if (iStatus == 0) {
        var iProcess = WebVideoCtrl.I_UpgradeProgress();
        if (iProcess < 0) {
            clearInterval(g_tUpgrade);
            g_tUpgrade = 0;
            showOPInfo(szDeviceIdentify + " get process failed！");
            return;
        } else if (iProcess < 100) {
            if (0 == $("#restartDiv").length) {
                $("<div id='restartDiv' class='freeze'></div>").appendTo("body");
                var oSize = getWindowSize();
                $("#restartDiv").css({
                    width: oSize.width + "px",
                    height: oSize.height + "px",
                    lineHeight: oSize.height + "px",
                    left: 0,
                    top: 0
                });
            }
            $("#restartDiv").text(iProcess + "%");
        } else {
            WebVideoCtrl.I_StopUpgrade();
            clearInterval(g_tUpgrade);
            g_tUpgrade = 0;

            $("#restartDiv").remove();

            WebVideoCtrl.I_Restart(szDeviceIdentify, {
                success: function (xmlDoc) {
                    $("<div id='restartDiv' class='freeze'>reboot...</div>").appendTo("body");
                    var oSize = getWindowSize();
                    $("#restartDiv").css({
                        width: oSize.width + "px",
                        height: oSize.height + "px",
                        lineHeight: oSize.height + "px",
                        left: 0,
                        top: 0
                    });
                    setTimeout("reconnect('" + szDeviceIdentify + "')", 20000);
                },
                error: function (status, xmlDoc) {
                    showOPInfo(szDeviceIdentify + " reboot failed！", status, xmlDoc);
                }
            });
        }
    } else if (iStatus == 1) {
        WebVideoCtrl.I_StopUpgrade();
        showOPInfo(szDeviceIdentify + " upgrade failed！");
        clearInterval(g_tUpgrade);
        g_tUpgrade = 0;
    } else if (iStatus == 2) {
        WebVideoCtrl.I_StopUpgrade();
        showOPInfo(szDeviceIdentify + " language does not match！");
        clearInterval(g_tUpgrade);
        g_tUpgrade = 0;
    } else {
        WebVideoCtrl.I_StopUpgrade();
        showOPInfo(szDeviceIdentify + " get status failed！");
        clearInterval(g_tUpgrade);
        g_tUpgrade = 0;
    }
}

// check plugin version
function clickCheckPluginVersion() {
    var iRet = WebVideoCtrl.I_CheckPluginVersion();
    if (0 == iRet) {
        alert("your plugin version is the latest！");
    } else {
        alert("detect the latest plugin version！");
    }
}

// remote configuration library
function clickRemoteConfig() {
    var szDeviceIdentify = $("#ip").val(),
        iDevicePort = parseInt($("#deviceport").val(), 10) || "",
        szInfo = "";
    
    if (null == szDeviceIdentify) {
        return;
    }

    var iRet = WebVideoCtrl.I_RemoteConfig(szDeviceIdentify, {
        iDevicePort: iDevicePort,
        iLan: 0
    });

    if (-1 == iRet) {
        szInfo = "call remote configuration library failed！";
    } else {
        szInfo = "call remote configuration library success！";
    }
    showOPInfo(szDeviceIdentify + " " + szInfo);
}

function clickRestoreDefault() {
    var szDeviceIdentify = $("#ip").val(),
        szMode = "basic";
    WebVideoCtrl.I_RestoreDefault(szDeviceIdentify, szMode, {
        timeout: 30000,
        success: function (xmlDoc) {
            $("#restartDiv").remove();
            showOPInfo(szDeviceIdentify + " restore default success！");
            //reboot after restore
            WebVideoCtrl.I_Restart(szDeviceIdentify, {
                success: function (xmlDoc) {
                    $("<div id='restartDiv' class='freeze'>reboot...</div>").appendTo("body");
                    var oSize = getWindowSize();
                    $("#restartDiv").css({
                        width: oSize.width + "px",
                        height: oSize.height + "px",
                        lineHeight: oSize.height + "px",
                        left: 0,
                        top: 0
                    });
                    setTimeout("reconnect('" + szDeviceIdentify + "')", 20000);
                },
                error: function (status, xmlDoc) {
                    showOPInfo(szDeviceIdentify + " reboot failed！", status, xmlDoc);
                }
            });
        },
        error: function (status, xmlDoc) {
            showOPInfo(szDeviceIdentify + " restore default failed！", status, xmlDoc);
        }
    });
}

function PTZZoomIn() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);

    if (oWndInfo != null) {
        WebVideoCtrl.I_PTZControl(10, false, {
            iWndIndex: g_iWndIndex,
            success: function (xmlDoc) {
                showOPInfo(oWndInfo.szDeviceIdentify + " Zoom+success！");
            },
            error: function (status, xmlDoc) {
                showOPInfo(oWndInfo.szDeviceIdentify + "  Zoom+failed！", status, xmlDoc);
            }
        });
    }
}

function PTZZoomout() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);

    if (oWndInfo != null) {
        WebVideoCtrl.I_PTZControl(11, false, {
            iWndIndex: g_iWndIndex,
            success: function (xmlDoc) {
                showOPInfo(oWndInfo.szDeviceIdentify + " Zoom-success！");
            },
            error: function (status, xmlDoc) {
                showOPInfo(oWndInfo.szDeviceIdentify + "  Zoom-failed！", status, xmlDoc);
            }
        });
    }
}

function PTZZoomStop() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);

    if (oWndInfo != null) {
        WebVideoCtrl.I_PTZControl(11, true, {
            iWndIndex: g_iWndIndex,
            success: function (xmlDoc) {
                showOPInfo(oWndInfo.szDeviceIdentify + " stop zoom success！");
            },
            error: function (status, xmlDoc) {
                showOPInfo(oWndInfo.szDeviceIdentify + "  stop zoom failed！", status, xmlDoc);
            }
        });
    }
}

function PTZFocusIn() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);

    if (oWndInfo != null) {
        WebVideoCtrl.I_PTZControl(12, false, {
            iWndIndex: g_iWndIndex,
            success: function (xmlDoc) {
                showOPInfo(oWndInfo.szDeviceIdentify + " focus+success！");
            },
            error: function (status, xmlDoc) {
                showOPInfo(oWndInfo.szDeviceIdentify + "  focus+failed！", status, xmlDoc);
            }
        });
    }
}

function PTZFoucusOut() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);

    if (oWndInfo != null) {
        WebVideoCtrl.I_PTZControl(13, false, {
            iWndIndex: g_iWndIndex,
            success: function (xmlDoc) {
                showOPInfo(oWndInfo.szDeviceIdentify + " focus-success！");
            },
            error: function (status, xmlDoc) {
                showOPInfo(oWndInfo.szDeviceIdentify + "  focus-failed！", status, xmlDoc);
            }
        });
    }
}

function PTZFoucusStop() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);

    if (oWndInfo != null) {
        WebVideoCtrl.I_PTZControl(12, true, {
            iWndIndex: g_iWndIndex,
            success: function (xmlDoc) {
                showOPInfo(oWndInfo.szDeviceIdentify + " stop focus success！");
            },
            error: function (status, xmlDoc) {
                showOPInfo(oWndInfo.szDeviceIdentify + "  stop focus failed！", status, xmlDoc);
            }
        });
    }
}

function PTZIrisIn() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);

    if (oWndInfo != null) {
        WebVideoCtrl.I_PTZControl(14, false, {
            iWndIndex: g_iWndIndex,
            success: function (xmlDoc) {
                showOPInfo(oWndInfo.szDeviceIdentify + " Iris+success！");
            },
            error: function (status, xmlDoc) {
                showOPInfo(oWndInfo.szDeviceIdentify + "  Iris+failed！", status, xmlDoc);
            }
        });
    }
}

function PTZIrisOut() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);

    if (oWndInfo != null) {
        WebVideoCtrl.I_PTZControl(15, false, {
            iWndIndex: g_iWndIndex,
            success: function (xmlDoc) {
                showOPInfo(oWndInfo.szDeviceIdentify + " Iris-success！");
            },
            error: function (status, xmlDoc) {
                showOPInfo(oWndInfo.szDeviceIdentify + "  Iris-failed！", status, xmlDoc);
            }
        });
    }
}

function PTZIrisStop() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);

    if (oWndInfo != null) {
        WebVideoCtrl.I_PTZControl(14, true, {
            iWndIndex: g_iWndIndex,
            success: function (xmlDoc) {
                showOPInfo(oWndInfo.szDeviceIdentify + " stop Iris success！");
            },
            error: function (status, xmlDoc) {
                showOPInfo(oWndInfo.szDeviceIdentify + "  stop Iris failed！", status, xmlDoc);
            }
        });
    }
}

// change mode
function changeIPMode(iType) {
    var arrPort = [0, 7071, 80];

    $("#serverport").val(arrPort[iType]);
}

// get device ip
function clickGetDeviceIP() {
    var iDeviceMode = parseInt($("#devicemode").val(), 10),
        szAddress = $("#serveraddress").val(),
        iPort = parseInt($("#serverport").val(), 10) || 0,
        szDeviceID = $("#deviceid").val(),
        szDeviceInfo = "";

    szDeviceInfo = WebVideoCtrl.I_GetIPInfoByMode(iDeviceMode, szAddress, iPort, szDeviceID);

    if ("" == szDeviceInfo) {
        showOPInfo("get device ip failed！");
    } else {
        showOPInfo("get device ip success！");

        var arrTemp = szDeviceInfo.split("-");
        $("#loginip").val(arrTemp[0]);
        $("#deviceport").val(arrTemp[1]);
    }
}

// polygon drawing enabled
var g_bEnableDraw = false;
function clickEnableDraw() {
    var iRet = WebVideoCtrl.I_SetPlayModeType(6);// polygon pattern

    if (0 === iRet) {
        g_bEnableDraw = true;

        showOPInfo("drawing enabled succeed!");
    } else {
        showOPInfo("drawing enabled failed!");
    }
}

// polygon drawing disabled
function clickDisableDraw() {
    var iRet = WebVideoCtrl.I_SetPlayModeType(0);// preview pattern
    if (0 === iRet) {
        g_bEnableDraw = false;

        showOPInfo("drawing disabled success!");
    } else {
        showOPInfo("drawing disabled failed!");
    }
}

// add the graph
function clickAddSnapPolygon() {
    if (!g_bEnableDraw) {
        return;
    }

    var szId = $("#snapId").val();
    var szName = encodeString($("#snapName").val());

    var szInfo = "<?xml version='1.0' encoding='utf-8'?>";
    szInfo += "<SnapPolygonList>";
    szInfo += "<SnapPolygon>";
    szInfo += "<id>" + szId + "</id>";          // [1, 32]
    szInfo += "<polygonType>1</polygonType>";
    szInfo += "<PointNumMax>17</PointNumMax>";  // [MinClosed, 17]
    szInfo += "<MinClosed>4</MinClosed>";       // [4, 17]
    szInfo += "<tips>#" + szId + "#" + szName + "</tips>";
    szInfo += "<isClosed>false</isClosed>";
    szInfo += "<color><r>0</r><g>255</g><b>0</b></color>";
    szInfo += "<pointList/>";
    szInfo += "</SnapPolygon>";
    szInfo += "</SnapPolygonList>";

    var iRet = WebVideoCtrl.I_SetSnapPolygonInfo(g_iWndIndex, szInfo);
    if (0 === iRet) {
        showOPInfo("window " + g_iWndIndex + " add graph succeed!");
    } else if (-1 === iRet) {
        showOPInfo("window " + g_iWndIndex + " add graph failed!");
    } else if (-2 === iRet) {
        alert("Parameter error!");
    } else if (-3 === iRet) {
        alert("The number of grapg reaches the ceiling!");
    } else if (-4 === iRet) {
        alert("Graph ID has existed!");
    }
    WebVideoCtrl.I_SetSnapDrawMode(g_iWndIndex, 2);
}

// delete the graph
function clickDelSnapPolygon() {
    if (!g_bEnableDraw) {
        return;
    }

    var szId = $("#snapId").val();

    var iIndex = getSnapPolygon(szId);
    if (iIndex != -1) {
        var oXML = getSnapPolygon();
        $(oXML).find("SnapPolygon").eq(iIndex).remove();

        var szInfo = toXMLStr(oXML);

        WebVideoCtrl.I_ClearSnapInfo(g_iWndIndex);
        WebVideoCtrl.I2_SetSnapPolygonInfo(g_iWndIndex, szInfo);
        WebVideoCtrl.I_SetSnapDrawMode(g_iWndIndex, 3);
    } else {
        alert("Graph ID do not exist!");
    }
}

// edit the graph
function clickEditSnapPolygon() {
    if (!g_bEnableDraw) {
        return;
    }

    var iRet = WebVideoCtrl.I_SetSnapDrawMode(g_iWndIndex, 3);
    if (0 === iRet) {
        showOPInfo("window " + g_iWndIndex + " edit graph succeed!");
    } else {
        showOPInfo("window " + g_iWndIndex + " edit graph failed!");
    }
}

// stop editing
function clickStopSnapPolygon() {
    if (!g_bEnableDraw) {
        return;
    }

    var iRet = WebVideoCtrl.I_SetSnapDrawMode(g_iWndIndex, -1);
    if (0 === iRet) {
        showOPInfo("window " + g_iWndIndex + " stop editing succeed!");
    } else {
        showOPInfo("window " + g_iWndIndex + " stop editing failed!");
    }
}

function getSnapPolygon(szId) {
    var szInfo = WebVideoCtrl.I_GetSnapPolygonInfo(g_iWndIndex);
    var oXML = loadXML(szInfo);

    if (typeof szId === "undefined") {
        return oXML;
    } else {
        var iIndex = -1;

        var aNodeList = $(oXML).find("SnapPolygon");
        if (aNodeList.length > 0) {
            $.each(aNodeList, function (i) {
                if ($(this).find("id").text() === szId) {
                    iIndex = i;
                    return false;
                }
            });
        }

        return iIndex;
    }
}

// gain the graph,save to own database
function clickGetSnapPolygon() {
    if (!g_bEnableDraw) {
        return;
    }

    var szInfo = WebVideoCtrl.I_GetSnapPolygonInfo(g_iWndIndex);

    alert(szInfo);
}

// set the graph,you can set the graph which has been set before when opening the page
function clickSetSnapPolygon() {
    if (!g_bEnableDraw) {
        return;
    }

    WebVideoCtrl.I_ClearSnapInfo(g_iWndIndex);

    var szInfo = "<?xml version='1.0' encoding='utf-8'?>";
    szInfo += "<SnapPolygonList>";
    szInfo += "<SnapPolygon>";
    szInfo += "<id>1</id>";
    szInfo += "<polygonType>1</polygonType>";
    szInfo += "<tips>#1#Set1</tips>";
    szInfo += "<isClosed>true</isClosed>";
    szInfo += "<color><r>0</r><g>255</g><b>0</b></color>";
    szInfo += "<pointList>";
    szInfo += "<point><x>0.737903</x><y>0.229730</y></point>";
    szInfo += "<point><x>0.947581</x><y>0.804054</y></point>";
    szInfo += "<point><x>0.362903</x><y>0.777027</y></point>";
    szInfo += "</pointList>";
    szInfo += "</SnapPolygon>";
    szInfo += "<SnapPolygon>";
    szInfo += "<id>2</id>";
    szInfo += "<polygonType>1</polygonType>";
    szInfo += "<tips>#2#Set2</tips>";
    szInfo += "<isClosed>true</isClosed>";
    szInfo += "<color><r>0</r><g>255</g><b>0</b></color>";
    szInfo += "<pointList>";
    szInfo += "<point><x>0.451613</x><y>0.216216</y></point>";
    szInfo += "<point><x>0.447581</x><y>0.729730</y></point>";
    szInfo += "<point><x>0.116935</x><y>0.554054</y></point>";
    szInfo += "</pointList>";
    szInfo += "</SnapPolygon>";
    szInfo += "</SnapPolygonList>";

    var iRet = WebVideoCtrl.I2_SetSnapPolygonInfo(g_iWndIndex, szInfo);
    if (0 === iRet) {
        showOPInfo("window " + g_iWndIndex + " set the graph succeed!");
    } else if (-1 === iRet) {
        showOPInfo("window " + g_iWndIndex + " set the graph failed!");
    } else if (-2 === iRet) {
        alert("Parameter error!");
    } else if (-3 === iRet) {
        alert("The number of grapg reaches the ceiling!");
    } else if (-4 === iRet) {
        alert("Graph ID has existed!");
    }
}

// clear the graph
function clickDelAllSnapPolygon() {
    if (!g_bEnableDraw) {
        return;
    }

    var iRet = WebVideoCtrl.I_ClearSnapInfo(g_iWndIndex);
    if (0 === iRet) {
        showOPInfo("window " + g_iWndIndex + " empty the graph succeed!");
    } else {
        showOPInfo("window " + g_iWndIndex + " empty the graph failed!");
    }
}

// device capturing
function clickDeviceCapturePic() {
    var szInfo = "";
    var szDeviceIdentify = $("#ip").val();
    var bZeroChannel = $("#channels option").eq($("#channels").get(0).selectedIndex).attr("bZero") == "true" ? true : false;
    var iChannelID = parseInt($("#channels").val(), 10);
    var iResolutionWidth = parseInt($("#resolutionWidth").val(), 10);
    var iResolutionHeight = parseInt($("#resolutionHeight").val(), 10);

    if (null == szDeviceIdentify) {
        return;
    }
    
    if (bZeroChannel) {// zero channel do not support device capturing 
        return;
    }

    var szPicName = szDeviceIdentify + "_" + iChannelID + "_" + new Date().getTime();
    var iRet = WebVideoCtrl.I_DeviceCapturePic(szDeviceIdentify, iChannelID, szPicName, {
        bDateDir: true,  //generate the date file or not
        iResolutionWidth: iResolutionWidth,
        iResolutionHeight: iResolutionHeight
    });

    if (0 == iRet) {
        szInfo = "device capturing succeed!";
    } else {
        szInfo = "device capturing failed!";
    }
    showOPInfo(szDeviceIdentify + " " + szInfo);
}

function loadXML(szXml) {
    if(null == szXml || "" == szXml) {
        return null;
    }

    var oXmlDoc = null;

    if (window.DOMParser) {
        var oParser = new DOMParser();
        oXmlDoc = oParser.parseFromString(szXml, "text/xml");
    } else {
        oXmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        oXmlDoc.async = false;
        oXmlDoc.loadXML(szXml);
    }

    return oXmlDoc;
}

function toXMLStr(oXmlDoc) {
    var szXmlDoc = "";

    try {
        var oSerializer = new XMLSerializer();
        szXmlDoc = oSerializer.serializeToString(oXmlDoc);
    } catch (e) {
        try {
            szXmlDoc = oXmlDoc.xml;
        } catch (e) {
            return "";
        }
    }
    if (szXmlDoc.indexOf("<?xml") == -1) {
        szXmlDoc = "<?xml version='1.0' encoding='utf-8'?>" + szXmlDoc;
    }

    return szXmlDoc;
}

function encodeString(str) {
    if (str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    } else {
        return "";
    }
}