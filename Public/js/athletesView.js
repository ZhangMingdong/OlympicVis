/*
    dsp: players view of the olympic games
        show the top players and number of their medals
    author: Mingdong
    logs:
        created
        2018/06/25
 */
mainApp.directive('athletesView', function () {
    function link(scope, el, attr) {
        function athletesView(){
            // 0.definition
            var showDisciplines=false;   // false means show events

            // 0.1.size
            var margin = {top: 40, right: 40, bottom: 200, left: 30};

            var svgBGW=1000;
            var svgBGH=800;
            var svgW = svgBGW - margin.left - margin.right;
            var svgH = svgBGH - margin.top - margin.bottom;

            // 0.2.color
            var color = d3.scaleOrdinal(d3.schemeCategory20)


            // 1.Add DOM elements
            var svgBG = d3.select(el[0]).append("svg").attr("width",svgBGW).attr("height",svgBGH);
            var svg=svgBG.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var svgAxisX=svg.append("g");
            var svgAxisY=svg.append("g");
            var svgBars=svg.append("g");
            var svgAxisTitle=svg.append("text");

            var zScale = d3.scaleOrdinal()
                .range(["gold","silver","#cd7f32"]);

            var keys = ["gold","silver","bronze"]
            var legend = svg.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 10)
                .attr("text-anchor", "end")
                .selectAll("g")
                .data(keys.slice().reverse())
                .enter().append("g")
                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

            legend.append("rect")
                .attr("x", svgW - 19)
                .attr("width", 19)
                .attr("height", 19)
                .attr("fill", zScale);

            legend.append("text")
                .attr("x", svgW - 24)
                .attr("y", 9.5)
                .attr("dy", "0.32em")
                .text(function(d) { return d; });

            scope.$watch(function () {
                //    console.log("watching===============svgStreamBG")
                svgBGW = el[0].clientWidth;
                svgBGH = el[0].clientHeight;
            //    svgBGH=2000

                return svgBGW + svgBGH;
            }, resize);
            // response the size-change
            function resize() {
            //    console.log("====================resize motion chart=================");
                svgW = svgBGW - margin.left - margin.right;
                svgH = svgBGH - margin.top - margin.bottom;

                svgBG
                    .attr("width", svgBGW)
                    .attr("height", svgBGH)
                redraw();
            }
            function redraw(){
                if(scope.data.athletes.length==0) return;

                var data;
                if(scope.data.scope==0){
                    data=scope.data.athletes;
                }
                else{
                    data=scope.data.countries;
                }


                if(scope.data.rank==0){
                    data.sort(function(a,b){
                        if(a.gold==b.gold)
                            if(a.silver==b.silver)
                                return b.bronze-a.bronze;
                            else return b.silver-a.silver;
                        else return b.gold-a.gold;
                    })
                }
                else{
                    data.sort(function(a,b){
                        return b.gold+b.silver+b.bronze-a.gold-a.silver-a.bronze;
                    })
                }
                if(data.length>50) data=data.slice(0,50);

                var xScale = d3.scaleBand()
                    .rangeRound([0, svgW])
                    .paddingInner(0.05)
                    .align(0.1);

                var yScale = d3.scaleLinear()
                    .rangeRound([svgH, 0]);




                xScale.domain(data.map(function(d) { return d.name; }));
                yScale.domain([0, d3.max(data, function(d) { return d.gold+d.silver+d.bronze; })]).nice();
                zScale.domain(keys);

                // the first version
                function _redrawBars_v1(){
                    var groups=svgBars
                        .selectAll("g")
                        .data(d3.stack().keys(keys)(data));

                    groups
                        .enter().append("g")
                        .attr("fill", function(d) { return zScale(d.key); })
                        .selectAll("rect")
                        .data(function(d) {return d;})
                        .enter().append("rect")
                        .attr("x", function(d) { return xScale(d.data.name); })
                        .attr("y", function(d) { return yScale(d[1]); })
                        .attr("height", function(d) { return yScale(d[0]) - yScale(d[1]); })
                        .attr("width", xScale.bandwidth());

                    groups
                        .transition()           // apply a transition
                        .duration(500)         // apply it over 4000 milliseconds
                        .attr("fill", function(d) { return zScale(d.key); })
                        .selectAll("rect")
                        .attr("x", function(d) { return xScale(d.data.name); })
                        .attr("y", function(d) { return yScale(d[1]); })
                        .attr("height", function(d) { return yScale(d[0]) - yScale(d[1]); })
                        .attr("width", xScale.bandwidth());

                    groups.exit().remove();
                }


                function _redrawBars(){

                    var groups=svgBars
                        .selectAll("g")
                        .data(d3.stack().keys(keys)(data));

                    function _setGroups(groups){
                        var rects=groups
                            .attr("fill", function(d) { return zScale(d.key); })
                            .selectAll("rect")
                            .data(function(d) {return d;})

                        function _setRects(rects){
                            rects
                                .transition()           // apply a transition
                                .duration(500)         // apply it over 4000 milliseconds
                                .attr("x", function(d) { return xScale(d.data.name); })
                                .attr("y", function(d) { return yScale(d[1]); })
                                .attr("height", function(d) { return yScale(d[0]) - yScale(d[1]); })
                                .attr("width", xScale.bandwidth());
                        }

                        function _setNewRects(rects){
                            rects
                                .attr("x", function(d) { return xScale(d.data.name); })
                                .attr("y", svgH)
                                .attr("height", 0)
                                .attr("width", xScale.bandwidth())
                                .transition()           // apply a transition
                                .duration(500)         // apply it over 4000 milliseconds
                                .attr("x", function(d) { return xScale(d.data.name); })
                                .attr("y", function(d) { return yScale(d[1]); })
                                .attr("height", function(d) { return yScale(d[0]) - yScale(d[1]); })
                                .attr("width", xScale.bandwidth());
                        }
                        _setRects(rects)
                        _setNewRects(rects.enter().append("rect"))

                        rects.exit()
                            .remove();
                    }

                    _setGroups(groups.enter().append("g"))

                    _setGroups(groups);


                    groups.exit().remove();
                }

                _redrawBars();


                svgAxisX
                    .attr("class", "axis")
                    .attr("transform", "translate(0," + svgH + ")")
                    .call(d3.axisBottom(xScale))
                    .selectAll("text")
                    .attr("y", 0)
                    .attr("x", 9)
                    .attr("dy", ".35em")
                    .attr("transform", "rotate(90)")
                    .style("text-anchor", "start");

                svgAxisY
                    .attr("class", "axis")
                    .call(d3.axisLeft(yScale).ticks(null, "s"))

                svgAxisTitle
                    .attr("x", 2)
                    .attr("y", yScale(yScale.ticks().pop()) + 0.5)
                    .attr("dy", "-0.32em")
                    .attr("fill", "#000")
                    .attr("font-weight", "bold")
                    .attr("text-anchor", "start")
                    .text("Medals");


            }
            redraw();


            scope.$watch('data', redraw);
            scope.$watch('data.athletes', redraw);
            scope.$watch('data.scope', redraw);
            scope.$watch('data.rank', redraw);
        }
        athletesView();
    }
    return {
        link: link,
        restrict: 'E',
        scope: { data: '=' }
    };
});