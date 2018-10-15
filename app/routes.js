
    module.exports = function(app) {
        app.get('/stream', function (req, res) {
            res.sendfile('./public/main_stream.html'); // load the single view file (angular will handle the page changes on the front-end)
        });
        app.get('/athletes', function (req, res) {
            res.sendfile('./public/athletes.html'); // load the single view file (angular will handle the page changes on the front-end)
        });
        app.get('/v2', function (req, res) {
            res.sendfile('./public/main2.html');
        });
        // application -------------------------------------------------------------
        app.get('*', function (req, res) {
            console.log("-----get* from "+req.host+" at "+Date());

            //res.sendfile('./public/mainFencing.html'); // load the single view file (angular will handle the page changes on the front-end)
            res.sendfile('./public/main.html');
        });
};



























