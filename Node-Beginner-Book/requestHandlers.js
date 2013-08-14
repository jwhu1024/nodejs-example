var fs = require("fs"),
    querystring = require("querystring"),
    formidable = require("formidable"),
    gpio = require("rpi-gpio"),
    url = require("url"),
    exec = require("child_process").exec;

function homepage(response, request) {
    console.log("Request handler 'homepage' was called.");
    fs.readFile(__dirname + "/index.html", "utf8", function(err, text) {
        if (err) {
            throw err;
        }
        response.writeHeader(200, {
            "Content-Type": "text/html"
        });
        response.write(text);
        response.end();
    });
}

function start(response, request) {
    console.log("Request handler 'start' was called.");
    var body =
        "<html>" +
        "<head>" +
        "<meta http-equiv=\"Content-Type\" content=\"text/html; " +
        "charset=UTF-8\" />" +
        "</head>" +
        "<body>" +
        "<form action=\"/upload\" enctype=\"multipart/form-data\" " +
        "method=\"post\">" +
        "<input type=\"file\" name=\"upload\">" +
        "<input type=\"submit\" value=\"Upload file\" />" +
        "</form>" +
        "</body>" +
        "</html>";

    response.writeHead(200, {
        "Content-Type": "text/html"
    });
    response.write(body);
    response.end();
}

function upload(response, request) {
    console.log("Request handler 'upload' was called.");
    var form = new formidable.IncomingForm();
    console.log("about to parse");
    form.parse(request, function(error, fields, files) {

        fs.renameSync(files.upload.path, "./fromuser.png");
        response.writeHead(200, {
            "Content-Type": "text/html"
        });
        response.write("received image:<br/>");
        response.write("<img src='/show' />");
        response.end();
        /*
        fs.readFile(__dirname + "/index.html", "utf8", function(err, text) {
            if (err) {
                throw err;
            }
            response.writeHeader(200, {"Content-Type": "text/html"});
            response.write(text);
            response.end();
        });
        */
    });
}

function show(response, request) {
    console.log("Request handler 'show' was called.");
    fs.readFile("./fromuser.png", "binary", function(error, file) {
        if (error) {
            response.writeHead(500, {
                "Content-Type": "text/plain"
            });
            response.write(error + "\n");
            response.end();
        } else {
            response.writeHead(200, {
                "Content-Type": "image/png"
            });
            response.write(file, "binary");
            response.end();
        }
    });
}

function GpioControl(response, request) {
    console.log("Request handler 'GpioControl' was called.");
    var value = querystring.parse(url.parse(request.url).query);

    gpio.setup(value.pin, gpio.DIR_OUT, function() {
        gpio.write(value.pin, value.act, function(err) {
            if (err) {
                console.log("function writeOn()");
                throw err;
            }
            console.log("Written to pin");
        });
    });

    response.writeHead(200, {
        "Content-Type": "text/plain"
    });
    response.end();
}

function ShellCmd(response, request) {
    console.log("Request handler 'ShellCmd' was called.");
    var cmd = querystring.parse(url.parse(request.url).query).cmd;

    exec(cmd, {
            encoding: "utf8",
            timeout: 10000000,
            maxBuffer: 2000000 * 1024 * 1024,
            cwd: null,
            env: null
        },
        function(error, stdout, stderr) {
            response.writeHead(200, {
                "Content-Type": "text/plain",
                "Content-Length": stdout.length
            });
            response.write(stdout);
            response.end();
        });

    /*
    exec(cmd, function(error, stdout, stderr) {
    //exec("ps -aux", function(error, stdout, stderr) {
        console.log("##############Callback");
        response.writeHead(200, {
            "Content-Type": "text/plain",
            "Content-Length": stdout.length
        });
        response.write(stdout);
        response.end();
    });
*/
}

function asyncCase(response, request) {
    console.log("Request handler 'asyncCase' was called.");
    exec("find /", {
            encoding: "utf8",
            timeout: 10000000,
            maxBuffer: 2000000 * 1024 * 1024,
            cwd: null,
            env: null
        },        
        function(error, stdout, stderr) {
            console.log("\n##############Callback################\n");
            console.log(stdout.length);
            response.writeHead(200, {
                "Content-Type": "text/plain",
                "Content-Length": stdout.length
            });
            response.write(stdout);
            response.end();
        });
}

exports.homepage = homepage;
exports.start = start;
exports.upload = upload;
exports.show = show;
exports.GpioControl = GpioControl;
exports.ShellCmd = ShellCmd;
exports.asyncCase = asyncCase;