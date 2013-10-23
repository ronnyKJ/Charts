(function(){
    var U = {
        getSeriesMostValue : function(series, type){
            var arr = [];
            for(var i = 0; i < series.length; i++){
                arr.push(Math[type].apply({}, series[i].data));
            }
            return Math[type].apply({}, arr);
        },
        C : function(ele){
            return document.createElement(ele);
        },
        setCss : function(eles, attr, value){
            for (var i = eles.length - 1; i >= 0; i--) {
                eles[i].style[attr] = value;
            };
        },
        log10 : function(a){
            return Math.log(a)/Math.log(10);
        },
        getStyle : function(obj, attr){
            return getComputedStyle(obj, true)[attr];
        },
        setStyle : function(obj, attrs){
            for(var i in attrs){
                obj.style[i] = attrs[i];
            }
        },
        createEle : function(ele, style, className, innerHTML, appendTo){
            var e = this.C(ele);
            this.setStyle(e, style);
            className && (e.className = className);
            (innerHTML !== undefined) && (e.innerHTML = innerHTML);
            appendTo && appendTo.appendChild(e);
            return e;
        },
        mergeObj : function(){
            var result = {};
            for (var i = 0, l = arguments.length; i < l; i++) {
                var obj = arguments[i];
                for(var attr in obj){
                    result[attr] = obj[attr];
                }
            }
            return result;
        },
        addStyleSheets : function(className, style) {
            var tmp = document.styleSheets;
            var c = tmp[tmp.length - 1];
            c.insertRule(className + " { "+style+" }", c.cssRules.length);
        },
        isOnStep : function(step, i, l){
            return onStep = !step || (step && i % step == 0) || (i==l-1);
        }
    };

    if(document.styleSheets.length == 0){
        document.getElementsByTagName('head')[0].appendChild(U.C('style'));
    }
    var timeStamp = +new Date;
    U.addStyleSheets('.init-anim'  +timeStamp, 'transition:width 1s;-moz-transition:width 1s;-webkit-transition: width 1s;-o-transition:width 1s;');
    U.addStyleSheets('.round-hover'+timeStamp, 'background-repeat: no-repeat;position: absolute;width: 16px;height: 16px;border-radius: 100px;border: #3f9a41 3px solid;');
    U.addStyleSheets('.round-hover'+timeStamp+':before', 'display: block;content : "";border: #b7d3f0 2px solid;width: 6px;height: 6px;border-radius: 100px;margin: 3px;');
    U.addStyleSheets('.coorY'      +timeStamp, 'position: absolute;text-align: right;font-size: 10px;left:-68px;width: 60px;');
    U.addStyleSheets('.coorX'      +timeStamp, 'font-size: 10px;text-align: center;position:absolute;bottom: -25px;white-space:nowrap;');
    U.addStyleSheets('.round-dot'  +timeStamp, 'position:absolute;border:#b7d3f0 2px solid;width:6px;height:6px;background:#e5f2ff;border-radius:100px;z-index:2');
    U.addStyleSheets('.round-min'  +timeStamp, 'position:absolute;border:#b7d3f0 2px solid;width:14px;height:14px;background:#e5f2fe;border-radius:100px;z-index:2');
    U.addStyleSheets('.round-max'  +timeStamp, 'position:absolute;border:#f2c4c1 2px solid;width:14px;height:14px;background:#fde5e3;border-radius:100px;z-index:2');
    U.addStyleSheets('.round-min'  +timeStamp+':before, .round-max'+timeStamp+':before', 'display: block;content : "";width: 10px;height: 10px;margin:2px;border-radius: 100px;');
    U.addStyleSheets('.round-min'  +timeStamp+':before', 'background: #3a82c9');
    U.addStyleSheets('.round-max'  +timeStamp+':before', 'background: #cd332d');
    U.addStyleSheets('.value-label'+timeStamp, 'position: absolute;text-align: center;font-size: 12px;color : #555;min-width:20px;white-space:nowrap;');
    U.addStyleSheets('.value-label'+timeStamp+'.min, .value-label'+timeStamp+'.max', 'font-size: 12px;color: #FFF;padding: 0px 7px;border-radius: 4px;');
    U.addStyleSheets('.value-label'+timeStamp+'.max', 'background: #d7372b;');
    U.addStyleSheets('.value-label'+timeStamp+'.min', 'background: #3d8ee0;');
    U.addStyleSheets('.value-label'+timeStamp+'.max .arrow-max', 'position: absolute;width: 0px;height: 0px;border-left: 5px solid transparent;border-right: 5px solid transparent;border-top: 5px solid #d7372b;');
    U.addStyleSheets('.value-label'+timeStamp+'.min .arrow-min', 'position: absolute;width: 0px;height: 0px;border-left: 5px solid transparent;border-right: 5px solid transparent;border-bottom: 5px solid #3d8ee0;');
    U.addStyleSheets('.indicator'  +timeStamp, 'position:absolute;width: 0;height: 100%;border-left: #7cbb7e 1px dashed;border-right: #7cbb7e 1px dashed;');
    U.addStyleSheets('.legend'     +timeStamp, 'bottom: -50px;font-size: 10px;padding: 4px;border-radius: 2px;border: #AAA 1px solid;');
    U.addStyleSheets('.legend-color'+timeStamp, 'border-radius: 2px;margin-right: 2px;display: inline-block;width: 10px;height: 10px;');
    U.addStyleSheets('.legend-name' +timeStamp, 'margin-right: 10px;');
    U.addStyleSheets('.elements-container'+timeStamp, 'position:absolute;left:0;top:0;width:100%;height:100%;');
    U.addStyleSheets('.plot-container'+timeStamp, 'position:absolute;overflow:hidden;width:0;left:-10px;top:-10px;');

    var defaultElements = {
        plotDefaultColors : ['#5A4440', '#539EA0', '#C29333', '#AC9FA2', '#A35347', '#6C8B79']
    };

    var coordinate = U.C('canvas'),
        plot = U.C('canvas'),
        plotContainer,
        indicator = U.C('div'),
        elementsContainer = U.C('div');//圆点、标签等
    var coorCTX, plotCTX;
    var hoverRounds = [];
    var commonAttr = {};


    var addCanvas = function(canvas, container){
        canvas.width = commonAttr.containerWidth + 20;
        canvas.height = commonAttr.containerHeight + 20;
        canvas.style.cssText = "position:absolute;left:-10px;top:-10px;";
        container.appendChild(canvas);
        ctx = canvas.getContext("2d");
        ctx.translate(10, 10);
        return ctx;
    }

    var setComponents = function(container, data){
        var posStyle = U.getStyle(container, 'position');
        if(["relative", "absolute"].indexOf(posStyle) < 0){
            container.style.position = "relative";
        }

        elementsContainer.className = "elements-container"+timeStamp;

        // 坐标
        coorCTX = addCanvas(coordinate, container);

        // 指示线
        addHoverRound(data);
        indicator.className = 'indicator'+timeStamp;
        U.setStyle(indicator, data.indicator||{});
        elementsContainer.appendChild(indicator);

        // 折线容器
        plotContainer = U.createEle('div', {
            height: commonAttr.containerHeight+20+'px',
        }, 'plot-container'+timeStamp);

        // 折线画布
        plotCTX = addCanvas(plot, plotContainer);
        U.setStyle(plot, {
            left : "0",
            top : "0"
        });

        container.appendChild(plotContainer);

        // 生成动画
        if(data.initAnim) plotContainer.className += ' init-anim'+timeStamp;
        
        container.appendChild(elementsContainer);

        renderCoordinate(container, data);
        renderPlots(container, data);
        if(data.series.length > 1) renderLegend(container, data);
    }

    var addHoverRound = function(data){
        var l = data.series.length;
        var tmp;
        for(var i = 0; i < l; i++) {
            tmp = U.createEle('div', {
                // display : "none",
                "z-index" : "1"
            }, data.roundDot&&data.roundDot.hover?'':"round-hover"+timeStamp);
            hoverRounds.push(tmp);
            elementsContainer.appendChild(tmp);
        }
    }

    var renderCoordX = function(container, data){
        if(data.xAxis){
            var categories = data.xAxis.categories, xAxis = data.xAxis;
            var l = categories.length, unit = commonAttr.containerWidth/l, X, label, xArr = [], step = data.xAxis.step;

            var hasLines = xAxis.tickVisible !== false;

            hasLines && coorCTX.beginPath();
            var halfStep = unit/2;
            for (var i = 0; i < l; i++){
                X = unit*i + halfStep;
                xArr.push(X);

                var onStep = U.isOnStep(step, i, l);

                if(hasLines && onStep){
                    coorCTX.moveTo(X, 0);
                    coorCTX.lineTo(X, commonAttr.containerHeight);
                }

                if(onStep){
                    label = U.createEle('div', {
                        color : xAxis.fontColor ? xAxis.fontColor : '#999'
                    }, 'coorX'+timeStamp, categories[i], container);

                    label.style.left = (X - label.offsetWidth/2) + 'px'; 
                }

            };
            
            if(hasLines){
                coorCTX.strokeStyle = xAxis.lineColor || "#f2f2f2";
                coorCTX.lineWidth = xAxis.lineWidth || 1;  
                coorCTX.lineCap = "round";  
                coorCTX.stroke();
            }
        }
        commonAttr.xAxis = xArr||[];
        commonAttr.xInterval = xArr ? xArr[1] - xArr[0] : 0;
    }

    var getYAxisAttrs = function(min, max){
        var range = (max - min) || Math.abs(max);
        var tickCount = 4;
        var unroundedTickSize = range/(tickCount-1);
        // var exp = Math.ceil(U.log10(unroundedTickSize)-1);//得到数量级, 如32345，即exp=10^4
        var exp = parseInt(U.log10(unroundedTickSize));
        var pow10x = Math.pow(10, exp);

        var tmp = unroundedTickSize / pow10x;
        var roundedTickRange;
        if(tmp>2&&tmp<=2.5){
            roundedTickRange = 2.5 * pow10x;
        }else if(tmp>7&&tmp<=7.5){
            roundedTickRange = 7.5 * pow10x;
            tickCount += 1;
        }else{
            roundedTickRange = Math.ceil(tmp) * pow10x;
        }

        var newLowerBound = roundedTickRange * (Math.round(min/roundedTickRange)-1);
        var newUpperBound = roundedTickRange * Math.round(1 + max/roundedTickRange);

        return {
            'min' : newLowerBound,
            'max' : newUpperBound,
            'tickRange' : roundedTickRange,
            'tickCount' : parseInt((newUpperBound - newLowerBound)/roundedTickRange)
        };
    }

    var renderCoordY = function(container, data){
        if(data.series && data.series.length > 0){
            var yAxis = data.yAxis;
            var hasLines = !yAxis || (yAxis.tickVisible !== false);

            var max = U.getSeriesMostValue(data.series, 'max');
            var min = U.getSeriesMostValue(data.series, 'min');
            commonAttr.min = min;
            commonAttr.max = max;

            var yAxisAttrs = getYAxisAttrs(min, max);
            var minBound = yAxisAttrs.min;
            var maxBound = yAxisAttrs.max;

            var tickCount = yAxisAttrs.tickCount;

            var pxStep = yAxisAttrs.tickRange/(maxBound - minBound)*commonAttr.containerHeight;

            commonAttr.minBound = minBound;
            commonAttr.maxBound = maxBound;

            var Y;
            hasLines && coorCTX.beginPath();
            for (var i = 0; i <= tickCount; i++){
                Y = pxStep * i;
                if(hasLines){
                    coorCTX.moveTo(0, Y);
                    coorCTX.lineTo(commonAttr.containerWidth, Y);
                }
                if(!yAxis || (yAxis && yAxis.labelVisible!==false)){
                    var val = minBound + i * yAxisAttrs.tickRange;
                    var innerHTML = (val+'').indexOf('.')>0 ? val.toFixed(2): val;

                    U.createEle('div', {
                        bottom : (Y-13)+'px',
                        color : yAxis && yAxis.fontColor || '#999',
                    }, 'coorY'+timeStamp, innerHTML, container);
                }
            };

            if(hasLines){
                coorCTX.strokeStyle = yAxis && yAxis.lineColor || "#f2f2f2";  
                coorCTX.lineWidth = yAxis && yAxis.lineWidth || 1; 
                coorCTX.stroke();
            }

            commonAttr.rangeY = maxBound - minBound;
        }
    }

    var setMostLabelStyle = function(style, obj, x, y){
        var s = U.mergeObj(style, obj);
        s.left = x - parseInt(obj.width)/2 + 'px';
        return s;
    }

    var tmpELement;
    var putValueLabel = function(value, x, y, type, data){
        var content = value, arrow = '', className = 'value-label'+timeStamp+' ' + type;

        if(!tmpELement){
            tmpELement = U.C('div');
            document.body.appendChild(tmpELement);
        }
        tmpELement.className = className;
        
        tmpELement.innerHTML = content;
        tmpELement.style.display = 'block';
        var width = tmpELement.offsetWidth;
        var height = tmpELement.offsetHeight;
        var arrowX = tmpELement.clientWidth/2-5;
        var arrowY = tmpELement.clientHeight;
        tmpELement.style.display = 'none';

        var deltaH = 0;
        if(type == 'above' || type == 'max'){
            deltaH = - height - deltaH;
        }
        

        var halfWidth = width/2, arrowTmp = 0, adjust = 3;
        var leftPos = halfWidth;
        if(x < halfWidth){
            leftPos = -adjust;
            arrowTmp = x - halfWidth + adjust;
        }else if(commonAttr.containerWidth - x < halfWidth){
            leftPos = commonAttr.containerWidth - width + adjust;
            arrowTmp = x - (commonAttr.containerWidth - halfWidth) - adjust;
        }else{
            leftPos = x - halfWidth;
        }

        if((type == "min" && !(data.valueLabel && data.valueLabel.min)) || (type == "max" && !(data.valueLabel && data.valueLabel.max))){
            var h = type == "min" ? -4 : arrowY-1;
            content += '<div class="arrow-' + type + '" style="left:' + (arrowX + arrowTmp) + 'px;top:' + h + 'px"></div>';
        }

        var style = {
            position: 'absolute',
            top: y + deltaH + 'px',
            left: leftPos + 'px',
            "z-index" : "3"
        };

        if(type == "min" && data.valueLabel && data.valueLabel.min){
            style = setMostLabelStyle(style, data.valueLabel.min, x, y);
            className = '';
        }else if(type == "max" && data.valueLabel && data.valueLabel.max){
            style = setMostLabelStyle(style, data.valueLabel.max, x, y);
            className = '';
        }else if(data.valueLabel && data.valueLabel.label){
            style = setMostLabelStyle(style, data.valueLabel.label, x, y);
            className = '';
        }

        var div = U.createEle('div', style, className, content);

        return div;
    }

    var setDotStyle = function(dot){
        return U.mergeObj({position : 'absolute', 'z-index' : 2}, dot);
    }

    var setMostValueDotObj = function(dotObj, mostType, data){
        !dotObj ? (dotObj = U.C('div')) : dotObj.style.cssText = '';
        if(data.roundDot && data.roundDot[mostType]){
            U.setStyle(dotObj, setDotStyle(data.roundDot[mostType]));
        }else{
            U.setStyle(dotObj, defaultElements[mostType]);
            dotObj.className = 'round-' + mostType+timeStamp;
        }
        
        return dotObj;
    }

    var renderRoundDot = function(val, data, pX, pY, lastMost){
        var roundDot = data.roundDot;
        var type = (roundDot && roundDot.type) || 'x', most = roundDot && roundDot.most || 'both', dotObj = null;
        var w = h = 0;
        if(type == 'all' || (type == 'x' && onStep)){
            var dot = roundDot && roundDot.dot;
            if(dot){
                dotObj = U.createEle('div', setDotStyle(dot));
            }else{
                dotObj = U.createEle('div', {}, 'round-dot'+timeStamp);
            }
        }

        if((most == 'min' || most == 'both') && val == commonAttr.min && lastMost == 'min'){
            dotObj = setMostValueDotObj(dotObj, 'min', data);
        }else if((most == 'max' || most == 'both') && val == commonAttr.max && lastMost == 'max'){
            dotObj = setMostValueDotObj(dotObj, 'max', data);
        }

        if(dotObj){
            elementsContainer.appendChild(dotObj);
            w = dotObj.offsetWidth;
            h = dotObj.offsetHeight;
            U.setStyle(dotObj, {
                left : pX-w/2 +'px',
                top : pY-h/2 +'px'
            });
        }
    }

    var renderLabel = function(val, data, pX, pY, pos, lastMost){
        var valueLabel = data.valueLabel;
        var type = valueLabel && valueLabel.type || 'all';
        var most = valueLabel && valueLabel.most || 'both';
        if(type){
            var lbl;
            var halfRound = h/2;
            if(type == 'all' || (type == 'x' && onStep)){
                if(pos){//above
                    lbl = putValueLabel(val, pX, pY-halfRound, 'above', data);
                }else{//below
                    lbl = putValueLabel(val, pX, pY+halfRound, 'below', data);
                }
            }

            if((most == 'min' || most == 'both') && val == commonAttr.min && lastMost == 'min'){
                lbl = putValueLabel(val, pX, pY+halfRound+5, 'min', data);
            }else if((most == 'max' || most == 'both') && val == commonAttr.max && lastMost == 'max'){
                lbl = putValueLabel(val, pX, pY-halfRound-5, 'max', data);
            }

            lbl && elementsContainer.appendChild(lbl);
        }
    }

    var isLastMost = function(val, arr, i){
        if(val == commonAttr.min){
            for (var j = i+1; j < arr.length; j++) {
                if(arr[j] == val) return null;
            }
            return 'min';
        }

        if(val == commonAttr.max){
            for (var j = i+1; j < arr.length; j++) {
                if(arr[j] == val) return null;
            }
            return 'max';
        }
    }

    var renderPlots = function(container, data){
        var series = data.series, serie, Y, YArr, PI = Math.PI*2, step = data.xAxis.step;
        commonAttr.yAxis = [];
        for(var i = 0; i < series.length; i++){
            serie = series[i];
            plotCTX.beginPath();

            YArr = [];

            // 折线
            Y = (1-((serie.data[0]-commonAttr.minBound)/commonAttr.rangeY)) * commonAttr.containerHeight, l = serie.data.length;
            YArr.push(Y);
            plotCTX.moveTo(commonAttr.xAxis[0], Y);
            for(var j = 0; j < l; j++){
                if(j > 0){
                    Y = (1-((serie.data[j]-commonAttr.minBound)/commonAttr.rangeY)) * commonAttr.containerHeight;
                    YArr.push(Y);
                    plotCTX.lineTo(commonAttr.xAxis[j], Y);
                }

                var onStep = U.isOnStep(step, j, l);
                var pX = commonAttr.xAxis[j], pY = YArr[j];
                val = serie.data[j];
                var tmp = isLastMost(val, serie.data, j);
                // 圆点
                renderRoundDot(val, data, pX, pY, tmp);

                // 值标签
                pos = (j==0 || val >= serie.data[j-1]);
                renderLabel(val, data, pX, pY, pos, tmp);

            }
            plotCTX.strokeStyle = serie.color || defaultElements.plotDefaultColors[i];
            plotCTX.lineWidth = 2; 
            plotCTX.stroke();

            // 渐变颜色
            plotCTX.lineTo(commonAttr.xAxis[j-1], commonAttr.containerHeight);
            plotCTX.lineTo(commonAttr.xInterval/2, commonAttr.containerHeight);
            plotCTX.closePath();
            plotCTX.save();
            var gradient = plotCTX.createLinearGradient(0, 0, 0, commonAttr.containerHeight);   //创建一个线性渐变
            gradient.addColorStop(0.3, "rgba(216,235,255,0.3)");
            gradient.addColorStop(1, "rgba(244,249,255,0.3)");
            plotCTX.fillStyle = gradient;
            plotCTX.fill();
            plotCTX.restore();

            commonAttr.yAxis.push(YArr);
        }
    }

    var renderCoordinate = function(container, data){
        renderCoordX(container, data);
        renderCoordY(container, data);
    }

    var indicatorLastIndex;
    var showIndicator = function(x, y, data, startIndex, isInit){
        if(x < 0 || x >= commonAttr.containerWidth){
            return;
        }

        var interval = commonAttr.xInterval, posX, posY, halfStep = interval/2;
        var index = startIndex || parseInt(x/interval);
        if(indicatorLastIndex == index && !isInit){
            return;
        }else{
            indicatorLastIndex = index;
        }
        // 吸附
        var posX = index * interval + halfStep;

        indicator.style.left = posX-indicator.offsetWidth/2 + 'px';

        // posY
        var l = commonAttr.yAxis.length;
        var yValArr = [];
        var round;
        if(data.roundDot && data.roundDot.hover){
            var hover = data.roundDot.hover;
            var w = parseInt(hover.width), h = parseInt(hover.height);
            for(var j = 0; j < l; j++) {
                round = hoverRounds[j];
                yValArr.push({
                    name : data.series[j].name,
                    data : data.series[j].data[index]
                });
                U.setStyle(round, U.mergeObj({
                    position : 'absolute',
                    top : commonAttr.yAxis[j][index]-h/2 + 'px',
                    left : posX-w/2 + 'px'
                }, hover));
            }
        }else{
            for(var j = 0; j < l; j++) {
                round = hoverRounds[j];
                yValArr.push({
                    name : data.series[j].name,
                    data : data.series[j].data[index]
                });
                U.setStyle(round, {
                    position : "absolute",
                    top : commonAttr.yAxis[j][index]-round.offsetHeight/2 + 'px',
                    left : posX-round.offsetWidth/2 + 'px',
                    backgroundColor : '#FFF'//data.series[j].color || defaultElements.plotDefaultColors[j] || '#FFF'
                });
            }
        }


        var xVal = data.xAxis.categories[index];

        commonAttr.hoverVal = {x: xVal, yArr : yValArr};
        // 回调
        data.onhover && data.onhover.callback && data.onhover.callback(xVal, yValArr);
    }

    var bindAction = function(data){
        var startX, startY;
        elementsContainer.addEventListener('touchmove', function(e){
            // e.preventDefault();
            var touch = e.touches[0], container = this.parentNode;
            var x = touch.pageX - container.offsetLeft;
            var y = touch.pageY - container.offsetTop;

            var rate = Math.abs(y-startY)/Math.abs(x-startX);

            if(rate < 2){
                e.preventDefault();
                first = false;
            }
            showIndicator(x, y, data);
        });

        elementsContainer.addEventListener('touchstart', function(e){
            // e.preventDefault();
            // indicator.style.display = 'block';

            var touch = e.touches[0], container = this.parentNode;
            var x = touch.pageX - container.offsetLeft;
            var y = touch.pageY - container.offsetTop;

            // U.setCss(hoverRounds, 'display', 'block');
            startX = x;
            startY = y;

            showIndicator(x, y, data);
        });

        elementsContainer.addEventListener('touchend', function(e){
            // e.preventDefault();
            // indicator.style.display = 'none';

            // U.setCss(hoverRounds, 'display', 'none');
        });
    }

    var initAnim = function(){
        plotContainer.style.width = commonAttr.containerWidth+20+'px';
    }

    var renderLegend = function(container, data){
        var series = data.series, l = series.length, color, html = '';
        var legend = U.C('div');
        legend.style.position = "absolute";
        legend.className = "legend"+timeStamp;
        for(var i=0; i<l; i++){
            color = series[i].color || defaultElements.plotDefaultColors[i];
            html += '<span class="legend-color" style="background-color:' + color + '"></span><span class="legend-name">' + series[i].name + '</span>';
        }
        legend.innerHTML = html;
        container.appendChild(legend);
    }

    var clear = function(){
        plotContainer && (plotContainer.innerHTML = '');
        elementsContainer && (elementsContainer.innerHTML = '');
        hoverRounds = [];
    }

    var render = function(container, data){
        container.innerHTML = '';
        clear();

        var w = container.clientWidth;
        var h = container.clientHeight;

        var innerContainer = U.C('div'), tmpWidthDelta = 40, paddingLeft = 30;
        if(data.yAxis && data.yAxis.labelVisible === false){
            tmpWidthDelta = 0;
            paddingLeft = 0;
        }
        innerContainer.style.cssText = 'position: relative; width: '+(w-tmpWidthDelta)+'px; height: '+(h-30)+'px;margin:6px 10px 0px '+ paddingLeft +'px'

        container.appendChild(innerContainer);

        commonAttr.containerWidth = parseInt(innerContainer.clientWidth);
        commonAttr.containerHeight = parseInt(innerContainer.clientHeight);

        setComponents(innerContainer, data);

        initAnim();//生成动画

        if(data.onhover && data.onhover.callback){
            bindAction(data);
            var index = Math.min(data.onhover.start === undefined? 100000 : data.onhover.start, data.series[0].data.length - 1);
            showIndicator(0, 0, data, indicatorLastIndex || index, true);
        }
    }

    window.Charts = {
        plots : render
    };
})();