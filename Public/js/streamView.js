/*
    dsp: stream view of the olympic games
        just finished the axis, have not transimit the data to timespan yet
    author: Mingdong
    logs:
        created
        2018/01/10
 */
mainApp.directive('streamView', function () {
    function link(scope, el, attr) {
        function streamView(){
            // categorical colors
            var categoricalColors=[
                d3.scaleLinear().range(["#1f77b4", "#FFFFFF"]),
                d3.scaleLinear().range(["#ff7f0e", "#FFFFFF"]),
                d3.scaleLinear().range(["#2ca02c", "#FFFFFF"]),
                d3.scaleLinear().range(["#d62728", "#FFFFFF"]),
                d3.scaleLinear().range(["#9467bd", "#FFFFFF"]),
                d3.scaleLinear().range(["#8c564b", "#FFFFFF"]),
                d3.scaleLinear().range(["#e377c2", "#FFFFFF"]),
                d3.scaleLinear().range(["#7f7f7f", "#FFFFFF"]),
                d3.scaleLinear().range(["#bcbd22", "#FFFFFF"]),
                d3.scaleLinear().range(["#17becf", "#FFFFFF"])
            ]

            // 0.definition
            var showDisciplines=false;   // false means show events

            // 0.1.size
            var margin = {top: 20, right: 80, bottom: 20, left: 40};

            var svgBGW=1000;
            var svgBGH=400;
            var svgW = svgBGW - margin.left - margin.right;
            var svgH = svgBGH - margin.top - margin.bottom;




            // 1.Add DOM elements
            var svgBG = d3.select(el[0]).append("svg").attr("width",svgBGW).attr("height",svgBGH);
            var svg=svgBG.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var svgAxisX=svgBG.append("g")
                .attr("class", "axis axis--x")

            // tooltip
            var tooltip = d3.select(el[0]).append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);


            scope.$watch(function () {
                //    console.log("watching===============svgStreamBG")
                svgBGW = el[0].clientWidth;
                svgBGH = el[0].clientHeight;
                //    svgBGH=2000
                //if(svgBGH<8000) svgBGH=8000

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
                console.log("redraw")
                var sports=scope.data.sports;
                var symmetric=(scope.setting.selectedBase=="Symmetric")

                // array of the years
                var sports_data=[];

                // list of the disciplines
                var disciplines=[];

                // list of the years
                var years=[]

                // map year to data of the year
                var mapYears={};

                // map discipline to data of the discipline
                var mapDisciplines=[]

                // used to check index of the sports and disciplines
                var indexMap={};
                var discipline2sport={}
                // current sport index
                var sport_index=0;
                // build map of the data
                sports.forEach(function(sport){
                    var Sport=sport.Sport;
                    if(!indexMap[Sport])indexMap[Sport]={};
                    indexMap[Sport].index=sport_index++
                    indexMap[Sport].arrDiscipline=[];
                    indexMap[Sport].mapDiscipline={};

                    sport.Disciplines.forEach(function(discipline){
                        var Discipline=discipline.Discipline;
                        if(!discipline2sport[Discipline]){
                            discipline2sport[Discipline]=Sport;
                            indexMap[Sport].mapDiscipline[Discipline]=indexMap[Sport].arrDiscipline.length;
                            indexMap[Sport].arrDiscipline.push(Discipline);
                        }
                        if(!mapDisciplines[Discipline]){
                            mapDisciplines[Discipline]=1;
                            disciplines.push(Discipline);
                        }
                        discipline.Events.forEach(function(event){
                            event.Years.forEach(function(year){
                                if(!mapYears[year.Year]){
                                    mapYears[year.Year]={year:new Date(year.Year, 0, 1)}
                                    mapYears[year.Year][Discipline]=1;
                                }
                                else{
                                    if(!mapYears[year.Year][Discipline]){
                                        mapYears[year.Year][Discipline]=1;
                                    }
                                    else{
                                        mapYears[year.Year][Discipline]+=1;
                                    }
                                }
                            })
                        })
                    })
                })

                // translate the map to list
                for (var year in mapYears){
                    for(var i=0;i<disciplines.length;i++){
                        if(!mapYears[year][disciplines[i]]) mapYears[year][disciplines[i]]=0;
                    }
                    sports_data.push(mapYears[year]);
                    years.push(mapYears[year].year);
                }


                var stack = my_stack.stack()
                    //.keys(["apples", "bananas", "cherries", "dates"])
                    .keys(disciplines)
                .order(my_stack.insideOut_stability)
                //.order(stability)
                    //.order(d3.stackOrderDescending)
                    //.order(d3.stackOrderInsideOut)
                    //.order(d3.stackOrderNone)
                    //.offset(d3.stackOffsetWiggle);

                if(symmetric){
                    stack.offset(d3.stackOffsetWiggle);
                }
                else{
                    stack.offset(d3.stackOffsetNone);
                }


                //var series = stack(data);
                var series = stack(sports_data);

                //console.log(series);


                var xScale = d3.scaleTime()
                    .domain(d3.extent(sports_data, function(d){ return d.year; }))
                    .range([0, svgW]);

                // setup axis
                var xAxis = d3.axisBottom(xScale)
                    .tickValues(years);
                //    .ticks(d3.timeYear.every(4));

                var yScale = d3.scaleLinear()
                    .domain([
                        d3.min(series, function(layer) { return d3.min(layer, function(d){ return d[0];}); }),
                        d3.max(series, function(layer) { return d3.max(layer, function(d){ return d[1];}); })
                    ])
                    .range([svgH, 0]);
                    //.range([svgH*0.8, 0]);


                var area = d3.area()
                    .x(function(d) { return xScale(d.data.year); })
                    .y0(function(d) {return yScale(d[0]); })
                    .y1(function(d) {return yScale(d[1]); })
                    .curve(d3.curveBasis);


                var svgPath=svg.selectAll("path")
                    .data(series);
                _setPath(svgPath.enter().append("path"));

                _setPath(svgPath)

                function _setPath(path){
                    path
                        .attr("d", area)
                        .style("fill", function(d) {
                            var Discipline=d.key;
                            var Sport=discipline2sport[Discipline];
                            var SportIndex=indexMap[Sport].index % 10;
                            if(indexMap[Sport].arrDiscipline.length==1){
                                return categoricalColors[SportIndex](0);
                            }
                            else{
                                var DisciplineIndex=indexMap[Sport].mapDiscipline[Discipline];
                                var IndexColor=DisciplineIndex/(indexMap[Sport].arrDiscipline.length);
                                return categoricalColors[SportIndex](.8*IndexColor);
                            }
                        })
                        .on("mouseover", function(d) {
                            tooltip.transition()
                                .duration(200)
                                .style("opacity", .9);
                            tooltip.html(function(){return d.key;})
                                .style("left", (d3.event.pageX) + "px")
                                .style("top", (d3.event.pageY - 28) + "px");
                        })
                        .on("mouseout", function(d) {
                            tooltip.transition()
                                .duration(500)
                                .style("opacity", 0);
                        });
                        //.style("stroke","black")


                }

                svgPath.exit().remove();

                svgAxisX
                    .attr("transform", "translate("+margin.left+"," + (svgH+margin.top) + ")")
                    .call(xAxis);


                //redrawEvents();
            }
            redraw();


            scope.$watch('data', redraw);

            scope.$watch('setting.selectedBase', redraw);
            scope.$watch('data.raw', redraw);
            scope.$watch('data.sports', redraw);
        }
        streamView();
    }
    return {
        link: link,
        restrict: 'E',
        scope: { data: '=', setting: '=' }
    };
});
