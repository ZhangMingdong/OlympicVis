/*
    dsp: time view of the olympic games
        just finished the axis, have not transimit the data to timespan yet
    author: Mingdong
    logs:
        created
        2018/06/22
 */
mainApp.directive('timeView', function () {
    function link(scope, el, attr) {
        function timeView(){
            // 0.definition
            var showDisciplines=false;   // false means show events

            // 0.1.size
            var margin = {top: 20, right: 40, bottom: 20, left: 30};
            var col1=60;
            var col2=130;
            var col3=180;
            var text_margin=3;
            var svgTreeW=col1+col2+col3;

            var svgBGW=1000;
            var svgBGH=800;
            var svgTimelineW = svgBGW - margin.left - margin.right-svgTreeW;
            var svgTimelineH = svgBGH - margin.top - margin.bottom;

            // 0.2.color
            var color = d3.scaleOrdinal(d3.schemeCategory20)


            // 1.Add DOM elements
            var svgBG = d3.select(el[0]).append("svg").attr("width",svgBGW).attr("height",svgBGH);
            var svgTimeline=svgBG.append("g")
                .classed('timeline',true)
                .attr("transform", "translate(" + (margin.left+svgTreeW) + "," + margin.top + ")");
            var svgTree=svgBG.append("g")
                .classed('tree',true)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


            var gAxisX=svgTimeline.append("g").attr("class", "axis axis--x")
            var gAxisXBottom=svgTimeline.append("g").attr("class", "axis axis--x")
            var gAxisY=svgTimeline.append("g").attr("class", "axis axis--y")

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
                svgTimelineW = svgBGW - margin.left - margin.right-svgTreeW;
                svgTimelineH = svgBGH - margin.top - margin.bottom;

                svgBG
                    .attr("width", svgBGW)
                    .attr("height", svgBGH)
                redraw();
            }
            function redraw(){
                //console.log("redraw motion chart");

                var sports=scope.data.sports;
                var data_sports=[]
                var data_disciplines=[]

                var data_tree_events=[]

                var data_events=scope.data.events;

                // build data for sports and disciplines
                sports.forEach(function(sport){
                    var event0=0;
                    var event1=0;
                    sport.Disciplines.forEach(function(discipline){
                        discipline.Events.forEach(function(event){
                            data_tree_events.push({
                                Sport:sport.Sport
                                ,Discipline:discipline.Discipline
                                ,Event:event.Event
                            })
                        })
                        var event_last=discipline.Events[discipline.Events.length-1]
                        data_disciplines.push({
                            Discipline: discipline.Discipline
                            ,event0:{
                                Sport:sport.Sport
                                ,Discipline:discipline.Discipline
                                ,Event:discipline.Events[0].Event
                            }
                            ,event1:{
                                Sport:sport.Sport
                                ,Discipline:discipline.Discipline
                                ,Event:event_last.Event
                            }
                        })
                        if(!event0) event0=discipline.Events[0]
                        event1=event_last;
                    })
                    data_sports.push({
                        Sport: sport.Sport
                        ,event0:{
                            Sport:sport.Sport
                            ,Discipline:sport.Disciplines[0].Discipline
                            ,Event:event0.Event
                        }
                        ,event1:{
                            Sport:sport.Sport
                            ,Discipline:sport.Disciplines[sport.Disciplines.length-1].Discipline
                            ,Event:event1.Event
                        }
                    })
                })

                function getEvent(d){
                    //return d.Event;
                    return d.Sport+"-"+d.Discipline+"-"+d.Event;
                }
                function getDiscipline(d){
                    return d.Sport+"-"+d.Discipline;
                }



                var yScale = d3.scaleBand()
                    .domain(data_events.map(function(d) { return showDisciplines? getDiscipline(d): getEvent(d); }))
                    .range([0,svgTimelineH])

                var mapYear={};
                var years=[];
                data_events.forEach(function(d){
                    if(!mapYear[d.Year]){
                        mapYear[d.Year]=1;
                        years.push(d.Year);
                    }
                })
                years.sort(function(a,b){
                    return a-b;
                })
                var xScale = d3.scaleBand()
                    .domain(years.map(function(d) { return d; }))
                    .range([0, svgTimelineW])


                // update axes
                gAxisX
                    .attr("transform", "translate(0," + -2 + ")")
                    .call(d3.axisTop(xScale))
                gAxisXBottom
                    .attr("transform", "translate(0," + svgTimelineH + ")")
                    .call(d3.axisBottom(xScale))

                /*
                gAxisY
                    .attr("transform", "translate(-2,0)")
                    .call(d3.axisLeft(yScale).tickFormat(function(d){
                        return "";
                    }));
                */




                function redrawTimeline(){
                    // add codes to draw
                    // append the rectangles for the background
                    var svgEvents=svgTimeline.selectAll(".event").data(data_events);
                    function _setEvent(event){
                        event
                            .attr("x",  function(d) {return xScale(d.Year);})
                            .attr("y", function(d) {return yScale(showDisciplines? getDiscipline(d): getEvent(d));})
                            .attr("width", xScale.bandwidth())
                            .attr("height", yScale.bandwidth())
                            .style("fill",function(d){
                                if(d.Gender==2) return "blue"
                                else if(d.Gender==3) return "red"
                                else return "purple"
                            })

                    }
                    _setEvent(svgEvents
                        .enter().append("rect")
                        .attr("class", "event"))
                    _setEvent(svgEvents)


                    svgEvents.exit().remove();

                }
                function redrawSports(){
                    var svgSports=svgTree.selectAll(".sport").data(data_sports);
                    function _setSport(sport){
                        sport
                            .attr("x",  function(d) {return 0;})
                            .attr("y", function(d) {return yScale(getEvent(d.event0));})
                            .attr("width", col1)
                            .attr("height", function(d) {return yScale(getEvent(d.event1))-yScale(getEvent(d.event0))+yScale.bandwidth();})
                    }
                    _setSport(svgSports
                        .enter().append("rect")
                        .attr("class", "sport"))
                    _setSport(svgSports)
                    svgSports.exit().remove();

                    var svtText=svgTree.selectAll(".sportText").data(data_sports);
                    function _setText(text){
                        text
                            .text(function(d) { return d.Sport; })
                            .attr("x",  function(d) {return col1-text_margin;})
                            .attr("y", function(d) {
                                return (yScale(getEvent(d.event0))+yScale(getEvent(d.event1))+yScale.bandwidth())/2;})
                    }
                    _setText(svtText
                        .enter().append("text")
                        .attr("class", "sportText"))

                    _setText(svtText)
                    svtText.exit().remove();
                }
                function redrawDisciplines(){
                    var svgDisciplines=svgTree.selectAll(".discipline").data(data_disciplines);
                    function _setDiscipline(discipline){
                        discipline
                            .attr("x",  function(d) {return col1;})
                            .attr("y", function(d) {return yScale(getEvent(d.event0));})
                            .attr("width", col2)
                            .attr("height", function(d) {return yScale(getEvent(d.event1))-yScale(getEvent(d.event0))+yScale.bandwidth();})
                    }
                    _setDiscipline(svgDisciplines
                        .enter().append("rect")
                        .attr("class", "discipline"))
                    _setDiscipline(svgDisciplines)
                    svgDisciplines.exit().remove();


                    var svtText=svgTree.selectAll(".disciplineText").data(data_disciplines);
                    function _setText(text){
                        text
                            .text(function(d) { return d.Discipline; })
                            .attr("x",  function(d) {return col1+col2-text_margin;})
                            .attr("y", function(d) {
                                return (yScale(getEvent(d.event0))+yScale(getEvent(d.event1))+yScale.bandwidth())/2;})
                    }
                    _setText(svtText
                        .enter().append("text")
                        .attr("class", "disciplineText"))

                    _setText(svtText)
                    svtText.exit().remove();
                }
                function redrawEvents(){
                    var svgEvents=svgTree.selectAll(".event").data(data_tree_events);
                    function _setEvent(event){
                        event
                            .attr("x",  function(d) {return col1+col2;})
                            .attr("y", function(d) {return yScale(getEvent(d));})
                            .attr("width", col3
                            //    +svgTimelineW
                            )
                            .attr("height", yScale.bandwidth())
                    }
                    _setEvent(svgEvents
                        .enter().append("rect")
                        .attr("class", "event"))
                    _setEvent(svgEvents)

                    svgEvents.exit().remove();


                    var svtText=svgTree.selectAll(".eventText").data(data_tree_events);
                    function _setText(text){
                        text
                            .text(function(d) { return d.Event; })
                            .attr("x",  function(d) {return col1+col2+col3-text_margin-8;})
                            .attr("y", function(d) {return yScale(getEvent(d))+yScale.bandwidth()/2;})
                    }
                    _setText(svtText
                        .enter().append("text")
                        .attr("class", "eventText"))

                    _setText(svtText)
                    svtText.exit().remove();


                    // events in timeline
                    var svgEventLines=svgTree.selectAll(".eventline").data(data_tree_events);
                    function _setEventLine(event){
                        event
                            .attr("x",  function(d) {return col1+col2+col3;})
                            .attr("y", function(d) {return yScale(getEvent(d));})
                            .attr("width", svgTimelineW)
                            .attr("height", yScale.bandwidth())
                    }
                    _setEventLine(svgEventLines
                        .enter().append("rect")
                        .attr("class", "eventline"))
                    _setEventLine(svgEventLines)

                    svgEvents.exit().remove();
                }

                redrawEvents();
                redrawSports();
                redrawDisciplines();
                redrawTimeline();


                //redrawEvents();
            }
            redraw();


            scope.$watch('data', redraw);
            scope.$watch('data.raw', redraw);
            scope.$watch('data.events', redraw);
        }
        timeView();
    }
    return {
        link: link,
        restrict: 'E',
        scope: { data: '=' }
    };
});