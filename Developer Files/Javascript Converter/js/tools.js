function allExit(value) {
    return (value !== "") ? "{ALLEX}" : "";
}

function manageRouteNumber(desto, customFont){
    if (desto[0] !== "") {
        return "*L[" + desto[0] + "]"
    } else if (!desto[12].includes("*N") && customFont) {
        return "*CN";
    } else {
        return ""
    }
}

function generateHanoverScroll(code, current, scrolling = 0, route) {
    let version = 2
    switch (version) {
        case 0:
            return (scrolling === 0) ? code.padStart(4, "0") : (current + 1) * 10000 + parseInt(code); //V1
        case 1:
            return (scrolling === 0) ? code.padStart(4, "0") : (current * 10000 + parseInt(code)).toString(); //V2
        case 2:
        default:
            route = route.replace(/\D/, "");
            if (code.indexOf(route) !== -1 && route !== "") {
                let codeArray = code.match(/^[A-Za-z]?(\w{1,3})(\w)$/); // Invert
                code = codeArray[2] * 1000 + parseInt(codeArray[1]);
            }
            //return (scrolling === 0) ? "1" + code.toString().padStart(4, "0") :  + ((current + 1) * 10000 + code).toString();
            return (scrolling === 0) ? "1" + code.toString().padStart(4, "0") :  + ((current + 1) * 10000 + code).toString();
    }
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

function IBISOutput (IBISversion, Depot, Desto) {
    let output = Desto[5] + " (" + Desto[1] + ")";
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
