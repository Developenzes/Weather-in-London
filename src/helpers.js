export const getDate = word => {
    return word.substring(0, 10);
}

export const getTime = word => {
    return word.substring(11, 16);
}

// save to local storage
export const saveToLocalStorage = heatIndex => {
    let heatIndexes;
    if (localStorage.getItem("heatIndexes") === null) {
        heatIndexes = [];
    } else {
        heatIndexes = JSON.parse(localStorage.getItem("heatIndexes"));
    }
    heatIndexes.push(heatIndex);
    localStorage.setItem("heatIndexes", JSON.stringify(heatIndexes));
}




