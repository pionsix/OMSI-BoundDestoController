window.addEventListener("load", start);
let GlobalHannoverDestoCodes = [];

function start() {
    document.getElementById("build").addEventListener("click", convert)
    document.getElementById("copy").addEventListener("click", copyToClipboard);
}

function convert() {
    let csvString = document.getElementById("input").value;
    let version = document.getElementById("version").value;
    let hanover = document.getElementById("hanover").checked;
    let customFont = document.getElementById("customFonts").checked;

    //contents = contents.split("\t");
    
    json = Papa.parse(csvString, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
    })["data"];
    groupedCodes = groupBy(json, "code");
    output(groupedCodes, version, hanover, customFont);

    //console.log (contents);
    /*
    contents = contents.split("\n");
    for (let i = 0; i < contents.length; i++) {
        contents[i] = contents[i].split("\t");
    }
    //console.log(groupBy(contents,))
    output(contents, version, title, hanover, customFont);
    */
}

function output(groupedCodes, version, hanover, customFont) {
    let [terminus, serviceTrip, routes, title] = generateDestoData(groupedCodes, version, hanover, customFont);

    let output = (hanover) ?
        generateHeader("Studio Polygon EG3 Controller with Scrolling Mod",title + " rev" + version,serviceTrip)
        : generateHeader("Citaro RHD with Controller Mod",title + " rev" + version,serviceTrip);

    output += terminus;
    output += (customFont && !hanover) ?
        "	14994	Custom number	BT_Numbers_Old					\r\n"
        + "	14998	Custom number	BT_Numbers_Old					\r\n"
        : "";
    output += "[end]\r\n\r\n[addbusstop_list]\r\n[end]\r\n\r\n";
    output += routes;
    document.getElementById("output").value = output;
}

function generateHeader(version,title,serviceTrip) {
    let output = "\tAutogenerated File made for QFA1213's Bounded Desto Controller Mod.\r\n"
    output += "This HOF is designed for " + version + " only.\r\n\r\n";
    output += "Generated: " +  Math.floor(Date.now() / 1000) + "\r\n\r\n";
    output += "[name]\r\n" + title + "\r\n\r\n";
    output += "[servicetrip]\r\n" + serviceTrip + "\r\n\r\n";
    output += "[global_strings]\r\n0\r\n\r\n";
    output += "stringcount_terminus\r\n26\r\n\r\n";
    output += "stringcount_busstop\r\n9\r\n\r\n";
    output += "[addterminus_list]\r\n";
    return output;
}

function generateInfoSystemTrips(IBISDesto, i, routeNum, name){
    let routes = "[infosystem_trip]\r\n"; //opening tag
    routes += IBISDesto + "\r\n"; //desto code
    routes += ((routeNum == "") ? name : name + " " + routeNum) + "\r\n"; // Name
    routes += i + "\r\n";
    routes += routeNum.replace(/\D/g, "");
    routes += "\r\n\r\n[infosystem_busstop_list]\r\n0\r\n\r\n";
    return routes;
}



