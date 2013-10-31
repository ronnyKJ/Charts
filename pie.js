(function(){
    var B = Charts.Base;
    var Pie = function(data){
        this.components = {
            data : data,
            container : data.container,
            innerContainer : B.C('div'),
            pieCanvas : B.C('canvas')
        };
        this.refresh();
    };

    Pie.innerRadius = 30;
    Pie.radius = 80;
    Pie.percent2Radian = function(per){
        return per/50 * Math.PI; // per/100 * Math.PI * 2
    }

    Pie.prototype.refresh = function(){
        var components = this.components;
        components.container.innerHTML = '';
        var data = components.data;
        var containerWidth = data.container.clientWidth;
        var containerHeight = data.container.clientHeight;

        B.setStyle(components.innerContainer, {
            width : containerWidth + 'px',
            height : containerHeight + 'px'
        });
        components.container.appendChild(components.innerContainer);
        console.log(containerHeight);
        var sideLength = Math.min(containerWidth, containerHeight);
        initPie(components, sideLength);
    };

    var initPie = function(components, sideLength){
        var canvas = components.pieCanvas;
        canvas.width = canvas.height = sideLength*2;
        B.setStyle(canvas, {
            width : sideLength + 'px',
            height : sideLength + 'px'
        });
        var ctx = components.pieCTX = canvas.getContext("2d");
        ctx.translate(sideLength, sideLength);
        ctx.rotate(-Math.PI/2);
        components.innerContainer.appendChild(canvas);

        drawPie(ctx, components);
    }

    var drawPie = function(ctx, components){
        var data = components.data, series = data.series, rate, startRadian = endRadian = 0;
        var innerRadius = (data.pie && data.pie.innerRadius || Pie.innerRadius)*2;
        var radius = (data.pie && data.pie.radius || Pie.radius)*2;
        for (var i = 0; i < series.length; i++) {
            var serie = series[i];
            radian = Pie.percent2Radian(serie.data);
            ctx.rotate(startRadian);
            ctx.beginPath();
            ctx.arc(0, 0, innerRadius, 0, radian, false);
            ctx.arc(0, 0, radius, radian, 0, true);
            ctx.closePath();
            ctx.fillStyle = serie.color || Charts.Base.defaultColors[i];
            ctx.fill();
            startRadian = radian;
        };
    }

    if(!window.Charts){
        window.Charts = {};
    }

    window.Charts.Pie = Pie;
})();