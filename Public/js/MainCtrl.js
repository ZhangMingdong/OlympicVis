/*
    control of olympicVis
    created in june, 2018
    by Mingdong
 */
var mainApp = angular.module("myApp", ['ngRoute']);

mainApp.controller('MainCtrl', function ($scope, $http,$window) {
    angular.element($window).on('resize', function () { $scope.$apply() })

    // dataset list
    $scope.datasetList=["Summer Olympic","Winter Olympic"];

    // selected match
    $scope.selectedDataset="Winter Olympic";
    //$scope.selectedDataset="Summer Olympic";

    $scope.streamSetting={
        baseList:["Horizontal","Symmetric"]
        ,selectedBase:"Horizontal"//"Symmetric"
    }


    //var olympic_file="../data/winter.csv";
    var olympic_file="../data/summer_cleaned.csv";
    var dictionary_file="../data/dictionary.csv"

    // the olympic data
    $scope.olympic={
        raw:[]                  // raw data list
        ,events:[]              // list of events
        ,sports:[]              // list of the sports, roots of the forests
        ,athletes:[]             // list of athletes and their medals
        ,countries:[]           // list of countries and thier medals
        ,scope:0                // show 0-athlete or 1-country
        ,rank:0                // rank by 0-gold or 1-medal
    }

    // read data from csv file
    function readOlympicData(){
        // build events data from raw data
        function buildEvents(raw){
            /*
                Sports:[
                    {
                        Sport:
                        Disciplines:
                        mapDiscipline:{}
                    }
                ...
                ]

                Disciplines:[
                    {
                        Sport:
                        Discipline:
                        Events:
                        mapEvents:{}
                    }
                ...
                ]

                Events:[
                    {
                        Sport:
                        Discipline:
                        Years:
                        mapYears:{}
                    }
                ...
                ]

                Years:[
                    {
                        Year:
                        Gender:
                    }
                ...
                ]
             */
            var sports=[];

            // map of the sport names to the data of each sport
            var mapSports={}
            // 1.check the raw data
            raw.forEach(function(d){
                // 1.functions
                function _createNewEvent(d){
                    var newEvent={
                        Sport:d.Sport
                        ,Discipline:d.Discipline
                        ,Event:d.Event
                        ,mapYear:{}
                        ,Years:[]
                    }
                    _addYear(newEvent,d.Year,d.Gender);
                    return newEvent;
                }
                function _createNewDiscipline(d){
                    var newDiscipline={
                        Sport:d.Sport
                        ,Discipline:d.Discipline
                        ,mapEvents:{}
                        ,Events:[]
                    }
                    return newDiscipline;
                }
                function _createNewSport(d){
                    var newSport={
                        Sport:d.Sport
                        ,mapDiscipline:{}
                        ,Disciplines:[]
                    }
                    mapSports[d.Sport]=newSport;
                    sports.push(newSport)
                    return newSport;
                }
                function _addYear(event,year,gender){
                    var gender_code=(gender=="Men"?2:3);    // 2 for men, 3 for women
                    if(!event.mapYear[d.Year]){
                        var newYear={
                            Year:d.Year
                            ,Gender:gender_code
                        }
                        event.mapYear[d.Year]=newYear;
                        event.Years.push(newYear);
                    }
                    else if(event.mapYear[d.Year].Gender%gender_code){
                        event.mapYear[d.Year].Gender*=gender_code;
                    }
                }
                function _addEvent(discipline,event){
                    discipline.mapEvents[event.Event]=event;
                    discipline.Events.push(event);
                }
                function _addDiscipline(sport,discipline){
                    sport.mapDiscipline[discipline.Discipline]=discipline;
                    sport.Disciplines.push(discipline);
                }

                // 2.check layer by layer
                if(!mapSports[d.Sport]) // check sport
                {
                    var newEvent=_createNewEvent(d);

                    var newDiscipline=_createNewDiscipline(d)
                    _addEvent(newDiscipline,newEvent);

                    var newSport=_createNewSport(d)
                    _addDiscipline(newSport,newDiscipline);
                }
                else if(!mapSports[d.Sport].mapDiscipline[d.Discipline]) // check discipline
                {
                    var newEvent=_createNewEvent(d);

                    var newDiscipline=_createNewDiscipline(d)
                    _addEvent(newDiscipline,newEvent);

                    _addDiscipline(mapSports[d.Sport],newDiscipline)
                }
                else if(!mapSports[d.Sport].mapDiscipline[d.Discipline].mapEvents[d.Event])// check event
                {
                    var newEvent=_createNewEvent(d);
                    _addEvent(mapSports[d.Sport].mapDiscipline[d.Discipline],newEvent);
                }
                else // just add
                {
                    _addYear(mapSports[d.Sport].mapDiscipline[d.Discipline].mapEvents[d.Event],d.Year,d.Gender);
                }

            })

            $scope.olympic.sports=sports;
            console.log($scope.olympic.sports);

        }

        // build the data for the atheletes and countries
        function buildAthletes(raw){
            var athletes=[]
            var mapAthletes={}

            var countries=[]
            var mapCountries={}

            raw.forEach(function(d){
                // add the athlete if it not exist
                if(!mapAthletes[d.Athlete]){
                    var newAthlete={
                        name:d.Athlete
                        , country:d.Country
                        , gender:d.Gender
                        , gold:0
                        , silver:0
                        , bronze:0
                        , medal:[]
                    }
                    mapAthletes[d.Athlete]=newAthlete;
                    athletes.push(newAthlete);
                }

                if(!mapCountries[d.Country]){
                    var newCountry={
                        name:mapDic[d.Country]?mapDic[d.Country]:d.Country
                        , gold:0
                        , silver:0
                        , bronze:0
                        , medal:[]
                    }
                    mapCountries[d.Country]=newCountry;
                    countries.push(newCountry);
                }
                // add the record of this athlete
                mapAthletes[d.Athlete].medal.push({
                    Year:d.Year
                    ,Sport:d.Sport
                    ,Discipline: d.Discipline
                    ,Event:d.Event
                    ,Medal:d.Medal
                })

                mapCountries[d.Country].medal.push({
                    Year:d.Year
                    ,Sport:d.Sport
                    ,Discipline: d.Discipline
                    ,Event:d.Event
                    ,Medal:d.Medal
                })
                if(d.Medal=="Gold") {
                    mapAthletes[d.Athlete].gold+=1;
                    mapCountries[d.Country].gold+=1;
                }
                else if(d.Medal=="Silver") {
                    mapAthletes[d.Athlete].silver+=1;
                    mapCountries[d.Country].silver+=1;
                }
                else if(d.Medal=="Bronze") {
                    mapAthletes[d.Athlete].bronze+=1;
                    mapCountries[d.Country].bronze+=1;
                }
            })

            athletes.sort(function(a,b){
                return b.gold+b.silver+b.bronze-a.gold-a.silver-a.bronze;
                if(a.gold==b.gold)
                    if(a.silver==b.silver)
                        return b.bronze-a.bronze;
                    else return b.silver-a.silver;
                else return b.gold-a.gold;
            })
            //athletes=athletes.slice(0,50);


            countries.sort(function(a,b){
                //    return b.gold+b.silver+b.bronze-a.gold-a.silver-a.bronze;
                if(a.gold==b.gold)
                    if(a.silver==b.silver)
                        return b.bronze-a.bronze;
                    else return b.silver-a.silver;
                else return b.gold-a.gold;
            })

            $scope.olympic.athletes=athletes;
            $scope.olympic.countries=countries;

        }

        // map of code to country
        var mapDic={};


        // temporary structure, just used for build the map of country codes
        var dic=[];
        d3.csv(dictionary_file, function(d) {
            dic.push(d)
        }, function(error,hehe) {
            dic.forEach(function(d){
                mapDic[d.Code]=d.Country;
            })

            // store the raw data
            var raw=[];
            d3.csv(olympic_file, function(d) {
            //    d.Sport=d.Sport.toLowerCase();
            //    d.Discipline=d.Discipline.toLowerCase();
            //    d.Event=d.Event.toLowerCase();
                raw.push(d)
            }, function(error,hehe) {
                buildEvents(raw);
                buildAthletes(raw);
                $scope.olympic.raw=raw;
                $scope.$apply();

                if (error) throw error;
            });
        });

    }


    $scope.$watch('selectedDataset', function() {
        if($scope.selectedDataset=="Summer Olympic"){
            olympic_file="../data/summer_cleaned.csv";
        }
        else if($scope.selectedDataset=="Winter Olympic"){
            olympic_file="../data/winter.csv";
        }
        readOlympicData();
    });
});

