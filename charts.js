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
    U.addStyleSheets('.round-hover'+timeStamp, 'background-repeat: no-repeat;position: absolute;width: 32px;height: 32px;border-radius: 100px;border: #3f9a41 4px solid;');
    U.addStyleSheets('.round-hover'+timeStamp+':before', 'display: block;content : "";border: #b7d3f0 4px solid;width: 12px;height: 12px;border-radius: 100px;margin: 6px;');
    U.addStyleSheets('.coorY'      +timeStamp, 'position: absolute;text-align: right;font-size: 20px;left:-108px;width: 100px;');
    U.addStyleSheets('.coorX'      +timeStamp, 'font-size: 20px;text-align: center;position:absolute;bottom: -25px;');
    U.addStyleSheets('.round-dot'  +timeStamp, 'position:absolute;border:#b7d3f0 4px solid;width:12px;height:12px;background:#e5f2ff;border-radius:100px;z-index:2');
    U.addStyleSheets('.round-min'  +timeStamp, 'position:absolute;border:#b7d3f0 4px solid;width:28px;height:28px;background:#e5f2fe;border-radius:100px;');
    U.addStyleSheets('.round-max'  +timeStamp, 'position:absolute;border:#f2c4c1 4px solid;width:28px;height:28px;background:#fde5e3;border-radius:100px;');
    U.addStyleSheets('.round-min'  +timeStamp+':before, .round-max'+timeStamp+':before', 'display: block;content : "";width: 20px;height: 20px;margin:4px;border-radius: 100px;');
    U.addStyleSheets('.round-min'  +timeStamp+':before', 'background: #3a82c9');
    U.addStyleSheets('.round-max'  +timeStamp+':before', 'background: #cd332d');
    U.addStyleSheets('.value-label'+timeStamp, 'position: absolute;text-align: center;font-size: 24px;color : #555;');
    U.addStyleSheets('.value-label'+timeStamp+'.min, .value-label'+timeStamp+'.max', 'font-size: 24px;color: #FFF;padding: 10px 12px;border-radius: 8px;');
    U.addStyleSheets('.value-label'+timeStamp+'.max', 'background: -webkit-gradient(linear, 0 0, 0 bottom, from(#eb473b), to(#d03126)); border: #b02a20 2px solid;');
    U.addStyleSheets('.value-label'+timeStamp+'.min', 'background: -webkit-gradient(linear, 0 0, 0 bottom, from(#4fa0f3), to(#3b8cde)); border: #4188d0 2px solid;');
    U.addStyleSheets('.value-label'+timeStamp+'.max .arrow-max', 'position: absolute;width: 0px;height: 0px;border-left: 10px solid transparent;border-right: 10px solid transparent;border-top: 10px solid #b02a20;');
    U.addStyleSheets('.value-label'+timeStamp+'.min .arrow-min', 'position: absolute;width: 0px;height: 0px;border-left: 10px solid transparent;border-right: 10px solid transparent;border-bottom: 10px solid #4188d0;');
    U.addStyleSheets('.indicator'  +timeStamp, 'position:absolute;width: 0;height: 100%;border-left: #7cbb7e 2px dashed;border-right: #7cbb7e 2px dashed;display:none;');
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
        canvas.width = commonAttr.outerWidth + 20;
        canvas.height = commonAttr.outerHeight + 20;
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
            height: commonAttr.outerHeight+20+'px',
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
                display : "none",
                "z-index" : "1"
            }, data.roundDot&&data.roundDot.hover?'':"round-hover"+timeStamp);
            hoverRounds.push(tmp);
            elementsContainer.appendChild(tmp);
        }
    }

    var renderCoordX = function(container, data){
        if(data.xAxis){
            var categories = data.xAxis.categories, xAxis = data.xAxis;
            var l = categories.length, unit = commonAttr.outerWidth/l, X, label, xArr = [], step = data.xAxis.step;

            var hasLines = xAxis.visible !== false;

            hasLines && coorCTX.beginPath();
            var halfStep = unit/2;
            for (var i = 0; i < l; i++){
                X = unit*i + halfStep;
                xArr.push(X);

                var onStep = U.isOnStep(step, i, l);

                if(hasLines && onStep){
                    coorCTX.moveTo(X, 0);
                    coorCTX.lineTo(X, commonAttr.outerHeight);
                }

                if(onStep){
                    label = U.createEle('div', {
                        color : xAxis.fontColor ? xAxis.fontColor : ''
                    }, 'coorX'+timeStamp, categories[i], container);

                    label.style.left = (X - label.offsetWidth/2) + 'px'; 
                }

            };
            
            if(hasLines){
                coorCTX.strokeStyle = xAxis.lineColor || "#f2f2f2";
                coorCTX.lineWidth = xAxis.lineWidth || 2;  
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
            var hasLines = !yAxis || (yAxis.visible !== false);

            var max = U.getSeriesMostValue(data.series, 'max');
            var min = U.getSeriesMostValue(data.series, 'min');
            commonAttr.min = min;
            commonAttr.max = max;

            var yAxisAttrs = getYAxisAttrs(min, max);
            var minBound = yAxisAttrs.min;
            var maxBound = yAxisAttrs.max;

            var tickCount = yAxisAttrs.tickCount;

            var pxStep = yAxisAttrs.tickRange/(maxBound - minBound)*commonAttr.outerHeight;

            commonAttr.minBound = minBound;
            commonAttr.maxBound = maxBound;

            var Y;
            hasLines && coorCTX.beginPath();
            for (var i = 0; i <= tickCount; i++){
                Y = pxStep * i;
                if(hasLines){
                    coorCTX.moveTo(0, Y);
                    coorCTX.lineTo(commonAttr.outerWidth, Y);
                }

                var val = minBound + i * yAxisAttrs.tickRange;
                var innerHTML = (val+'').indexOf('.')>0 ? val.toFixed(2): val;

                U.createEle('div', {
                    bottom : (Y-13)+'px',
                    color : yAxis && yAxis.fontColor || '',
                }, 'coorY'+timeStamp, innerHTML, container);
            };

            if(hasLines){
                coorCTX.strokeStyle = yAxis && yAxis.lineColor || "#f2f2f2";  
                coorCTX.lineWidth = yAxis && yAxis.lineWidth || 2; 
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
    var putValueLabel = function(value, x, y, type){
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
        var arrowX = tmpELement.clientWidth/2-10;
        var arrowY = tmpELement.clientHeight;
        tmpELement.style.display = 'none';

        if((type == "min" && !(data.valueLabel && data.valueLabel.min)) || (type == "max" && !(data.valueLabel && data.valueLabel.max))){
            var h = type == "min" ? -10 : arrowY;
            content += '<div class="arrow-' + type + '" style="left:'+arrowX+'px;top:'+h+'px"></div>';
        }

        var deltaH = 5;
        if(type == 'above' || type == 'max'){
            deltaH = - height - deltaH;
        }
        
        var style = {
            position: 'absolute',
            top: y+deltaH +'px',
            left: (x-width/2)+'px',
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
        return U.mergeObj({position : 'absolute'}, dot);
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

    var renderRoundDot = function(data, pX, pY){
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

        if((most == 'min' || most == 'both') && val == commonAttr.min){
            dotObj = setMostValueDotObj(dotObj, 'min', data);
        }else if((most == 'max' || most == 'both') && val == commonAttr.max){
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

    var renderLabel = function(data, pX, pY, pos){
        var valueLabel = data.valueLabel;
        var type = valueLabel && valueLabel.type || 'all';
        var most = valueLabel && valueLabel.most || 'both';
        if(type){
            var valueLabel;
            var halfRound = h/2;
            if(type == 'all' || (type == 'x' && onStep)){
                if(pos){//above
                    valueLabel = putValueLabel(val, pX, pY-halfRound, 'above');
                }else{//below
                    valueLabel = putValueLabel(val, pX, pY+halfRound, 'below');
                }
            }

            if((most == 'min' || most == 'both') && val == commonAttr.min){
                valueLabel = putValueLabel(val, pX, pY+halfRound+5, 'min');
            }else if((most == 'max' || most == 'both') && val == commonAttr.max){
                valueLabel = putValueLabel(val, pX, pY-halfRound-5, 'max');
            }

            valueLabel && elementsContainer.appendChild(valueLabel);
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
            Y = (1-((serie.data[0]-commonAttr.minBound)/commonAttr.rangeY)) * commonAttr.outerHeight, l = serie.data.length;
            YArr.push(Y);
            plotCTX.moveTo(commonAttr.xAxis[0], Y);
            for(var j = 0; j < l; j++){
                if(j > 0){
                    Y = (1-((serie.data[j]-commonAttr.minBound)/commonAttr.rangeY)) * commonAttr.outerHeight;
                    YArr.push(Y);
                    plotCTX.lineTo(commonAttr.xAxis[j], Y);
                }

                var onStep = U.isOnStep(step, j, l);
                var pX = commonAttr.xAxis[j], pY = YArr[j];
                val = serie.data[j];

                // 圆点
                renderRoundDot(data, pX, pY);

                // 值标签
                pos = (j==0 || val >= serie.data[j-1]);
                renderLabel(data, pX, pY, pos);

            }
            plotCTX.strokeStyle = serie.color || defaultElements.plotDefaultColors[i];
            plotCTX.lineWidth = 4; 
            plotCTX.stroke();

            // 渐变颜色
            plotCTX.lineTo(commonAttr.xAxis[j-1], commonAttr.outerHeight);
            plotCTX.lineTo(commonAttr.xInterval/2, commonAttr.outerHeight);
            plotCTX.closePath();
            plotCTX.save();
            var gradient = plotCTX.createLinearGradient(0, 0, 0, commonAttr.outerHeight);   //创建一个线性渐变
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

    var showIndicator = function(x, y, data){
        var interval = commonAttr.xInterval, posX, posY, halfStep = interval/2;

        // 吸附
        var delta = x%interval;
        var indexDelta = 0;
        if(delta <= interval/2){
            // 吸附前面
            posX = x - delta;
        }else{
            // 吸附后面
            posX = x + interval - delta;
            indexDelta = 1;
        }

        posX += halfStep;

        if(posX < 0 || posX > commonAttr.outerWidth - halfStep){
            return;
        }

        indicator.style.left = posX-indicator.offsetWidth/2 + 'px';

        // posY
        var index = parseInt(x/interval) + indexDelta;

        var l = commonAttr.yAxis.length;
        var yValArr = [];
        var round;
        if(data.roundDot && data.roundDot.hover){
            var hover = data.roundDot.hover;
            var w = parseInt(hover.width), h = parseInt(hover.height);
            for(var j = 0; j < l; j++) {
                yValArr.push(data.series[j].data[index]);
                round = hoverRounds[j];

                U.setStyle(round, U.mergeObj({
                    position : 'absolute',
                    top : commonAttr.yAxis[j][index]-h/2 + 'px',
                    left : posX-w/2 + 'px'
                }, hover));
            }
        }else{
            for(var j = 0; j < l; j++) {
                round = hoverRounds[j];
                yValArr.push(data.series[j].data[index]);
                U.setStyle(round, {
                    position : "absolute",
                    top : commonAttr.yAxis[j][index]-round.offsetHeight/2 + 'px',
                    left : posX-round.offsetWidth/2 + 'px',
                    "background-color" : '#FFF'//data.series[j].color || defaultElements.plotDefaultColors[j] || '#FFF'
                });
            }
        }


        var xVal = data.xAxis.categories[index];

        commonAttr.hoverVal = {x: xVal, yArr : yValArr};
        // 回调
        data.onhover && data.onhover(xVal, yValArr);
    }

    var bindAction = function(data){
        var tmpX = 0;
        elementsContainer.addEventListener('touchmove', function(e){
            e.preventDefault();
            var touch = e.touches[0], container = this.parentNode;
            var x = touch.pageX - container.offsetLeft;
            var y = touch.pageY - container.offsetTop;

            if(Math.abs(x-tmpX) >= commonAttr.xInterval/2){
                showIndicator(x, y, data);
                tmpX = x;
            }
        });

        elementsContainer.addEventListener('touchstart', function(e){
            e.preventDefault();
            indicator.style.display = 'block';

            var touch = e.touches[0], container = this.parentNode;
            var x = touch.pageX - container.offsetLeft;
            var y = touch.pageY - container.offsetTop;

            U.setCss(hoverRounds, 'display', 'block');

            showIndicator(x, y, data);
        });

        elementsContainer.addEventListener('touchend', function(e){
            e.preventDefault();
            indicator.style.display = 'none';

            U.setCss(hoverRounds, 'display', 'none');
        });
    }

    var initAnim = function(){
        plotContainer.style.width = commonAttr.outerWidth+20+'px';
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

        var w = container.offsetWidth;
        var h = container.offsetHeight;

        var innerContainer = U.C('div');
        innerContainer.style.cssText = 'position: relative; width: '+(w-100)+'px; height: '+(h-60)+'px;margin:10px 20px 0px 60px'

        container.appendChild(innerContainer);

        commonAttr.outerWidth = parseInt(innerContainer.offsetWidth);
        commonAttr.outerHeight = parseInt(innerContainer.offsetHeight);

        setComponents(innerContainer, data);

        initAnim();//生成动画

        bindAction(data);
    }

    window.Charts = {
        plots : render
    };
})();