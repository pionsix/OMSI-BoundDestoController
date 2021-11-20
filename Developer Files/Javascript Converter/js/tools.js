function allExit(value) {
    return (value == true) ? "{ALLEX}" : "";
}

function manageRouteNumber(routeNum, bound, customFont){
    if (routeNum != null && routeNum != "") {
        return "*L[" + routeNum + "]"
    } else if (!bound && customFont) {
        return "*CN";
    } else {
        return ""
    }
}

function generateHanoverScroll(code, route, fixed = false, current = 0, scrolling = 0) {
    route = route.replace(/\D/, "");
    if (!fixed) {
        let codeArray = code.match(/^[A-Za-z]?(\w{1,3})(\w)$/); // Invert
        code = codeArray[2] * 1000 + parseInt(codeArray[1]);
    } else {
        code = parseInt(code);
    }

    if (current == 0) {
        GlobalHannoverDestoCodes.push(code);
    }
    return (scrolling === 0) ? "1" + code.toString().padStart(4, "0") :  + ((current + 1) * 10000 + code).toString();
}

function outputKrugerDestoLine(Allex = "",Code = "",Destination = "",IBIS1 = "",
                               Top = "",Bottom = "",Third = "",IBIS2 = "") {
    return allExit(Allex) + "\t" +
        Code + "\t" +
        Destination + "\t" +
        IBIS1 + "\t" +
        Top + "\t" +
        Bottom + "\t" +
        Third + "\t" +
        "\t\t" +
        IBIS2 +
        "\r\n";
}

function IBISOutput (IBISversion, destination, code) {
    let output = destination + " " + code;
    return (IBISversion === 1) ? output.toUpperCase() : output;
}

function outputHanoverDestoLine(Allex = "",Code = "",Destination = "",IBIS1 = "",
                                Top = "",Bottom = "",Side = "",RouteNum = "",
                                ImgPath = "", RearSmallTop = "", RearSmallBottom = "",
                                RearBigTop = "", RearBigBottom = "") {
    return allExit(Allex) + "\t" +
        Code + "\t" +
        Destination + "\t" +
        IBIS1 + "\t" +
        Top + "\t" +
        Bottom + "\t" +
        Side + "\t" +
        "\t" +
        RouteNum +
        "\t\t" +
        ImgPath + "\t" +
        RearSmallTop + "\t" +
        RearSmallBottom + "\t" +
        "\t" +
        RearBigTop + "\t" +
        RearBigBottom + "\r\n";
}

function copyToClipboard(){
    document.getElementById("output").select();
    document.execCommand("copy");
}

function checkDuplicateDestoCodes(arr) {
    let sorted_arr = arr.slice().sort(); // You can define the comparing function here. 
    // JS by default uses a crappy string compare.
    // (we use slice to clone the array so the
    // original array won't be modified)
    let results = [];
    for (let i = 0; i < sorted_arr.length - 1; i++) {
        if (sorted_arr[i + 1] == sorted_arr[i]) {
        results.push(sorted_arr[i]);
        }
    }
    if (results.length != 0) window.alert(`Duplicate desto codes exist ending in: ${results}`);
}

//https://stackoverflow.com/a/9160869
String.prototype.insert = function(index, string) {
    if (index > 0) {
      return this.substring(0, index) + string + this.substr(index);
    }
  
    return string + this;
  };


// https://sebhastian.com/javascript-group-by/
function groupBy(arr, criteria) {
    const newObj = arr.reduce(function (acc, currentValue) {
        if (!acc[currentValue[criteria]]) {
            acc[currentValue[criteria]] = [];
        }
        acc[currentValue[criteria]].push(currentValue);
        return acc;
    }, {});
    return newObj;
}

function denullify(input) {
    return (input == null) ? "" : input;
}