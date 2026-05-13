
export const parseCSV = (text: string): string[][] => {
    const arr: string[][] = [];
    let quote = false;
    let col = 0, row = 0;

    for (let c = 0; c < text.length; c++) {
        const cc = text[c], nc = text[c+1];
        arr[row] = arr[row] || [];
        arr[row][col] = arr[row][col] || '';

        if (cc === '"' && quote && nc === '"') { arr[row][col] += cc; ++c; continue; }
        if (cc === '"') { quote = !quote; continue; }
        if (cc === ',' && !quote) { ++col; continue; }
        if (cc === '\r' && nc === '\n' && !quote) { ++row; col = 0; ++c; continue; }
        if (cc === '\n' && !quote) { ++row; col = 0; continue; }
        if (cc === '\r' && !quote) { ++row; col = 0; continue; }

        arr[row][col] += cc;
    }
    if (arr.length > 0 && arr[arr.length-1].length === 1 && arr[arr.length-1][0] === '') {
        arr.pop();
    }
    return arr;
};
