
    module.exports = function(app) {

        // application -------------------------------------------------------------
        app.get('*', function (req, res) {
            console.log("-----get* from "+req.host+" at "+Date());

            //res.sendfile('./public/mainFencing.html'); // load the single view file (angular will handle the page changes on the front-end)
            res.sendfile('./public/main.html');
        });



};



























