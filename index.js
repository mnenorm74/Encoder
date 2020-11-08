function normalizeHex(hex){
    let fullHex = "00" + hex;
    let normalizedHex = fullHex;
    if(normalizedHex.length > 3)
        normalizedHex = normalizedHex.slice(-3);
    return normalizedHex;
}

String.prototype.hexEncode = function () {
    let result = [];
    for (let i = 0; i < this.length; i++) {
        let hex = this.charCodeAt(i).toString(16);
        let normalizedHex = normalizeHex(hex)
        result.push(normalizedHex);
    }
    return result;
};

String.prototype.hexDecode = function () {
    let hexes = this.split(' ') || [];
    let result = "";
    for (let i = 0; i < hexes.length; i++) {
        result += String.fromCharCode(parseInt(hexes[i], 16));
    }
    return result;
};

function generateKey(keyLength) {
    let key = '';
    for (let i = 0; i < keyLength; i++) {
        let isLast = i === keyLength - 1;
        let number = (Math.random() * 0xFFF << 0).toString(16);
        key += ('00' + number).slice(-3) + (isLast ? '' : ' ');
    }
    return key;
}

function generateKeySet(keyLength) {
    let currentKeys = generateKey(keyLength).split(' ');
    let keySet = '';
    for (let i = 0; i < 10; i++) {
        let salt = (Math.random() * 0xFFF << 0).toString(16);
        keySet += ('00' + salt).slice(-3) + ' ';
        for (let j = 0; j < currentKeys.length; j++) {
            let isLast = j === currentKeys.length - 1;
            let number = (parseInt(currentKeys[j], 16) ^ parseInt(salt, 16)).toString(16);
            keySet += ('00' + number).slice(-3) + (isLast ? '' : ' ');
        }
        if (i !== 9)
            keySet += '\n';
    }
    return keySet;
}

function recoverKey(keys) {
    let salt = keys.shift();
    for (let i = 0; i < keys.length; i++) {
        keys[i] = (parseInt(keys[i], 16) ^ parseInt(salt, 16)).toString(16);
    }
    return keys;
}

function encrypt(codes, keys) {
    let cipher = '';
    for (let i = 0; i < codes.length; i++) {
        let isLast = i === codes.length - 1;
        let number = (parseInt(codes[i], 16) ^ parseInt(keys[i], 16)).toString(16);
        cipher += ('00' + number).slice(-3) + (isLast ? '' : ' ');
    }
    return cipher;
}


document.getElementById('keySetClearEncodingFields').addEventListener('click', clearFields);
document.getElementById('keySetKeyGenerationButton').addEventListener('click', generateKeySetClick);
document.getElementById('keySetEncryptButton').addEventListener('click', encryptTextClick);
document.getElementById('keySetDecipherButton').addEventListener('click', decryptTextClick);
document.getElementById('saveKeySetButton').addEventListener('click', saveKeySetClick);


function clearFields() {
    document.getElementById('keySetOriginalText').value = '';
    document.getElementById('keySetKeyText').value = '';
    document.getElementById('keySetText').value = '';
    document.getElementById('keySetEncryptedText').value = '';
}

function generateKeySetClick() {
    let keyLength = document.getElementById('keySetOriginalText').value.hexEncode().length;
    let keySet = document.getElementById('keySetText');
    let key = document.getElementById('keySetKeyText');
    keySet.value = generateKeySet(keyLength);
    key.value = keySet.value.split('\n')[Math.floor(Math.random() * 10)];
}

function encryptTextClick() {
    let codes = document.getElementById('keySetOriginalText').value.hexEncode();
    let key = document.getElementById('keySetKeyText').value.split(' ');
    let cipher = document.getElementById('keySetEncryptedText');
    /*if (key.length === 1 && key[0] === '') {
        cipher.value = 'Сначала нужно сгенерировать ключ';
        return;
    }
    if (key.length - 1 !== codes.length) {
        cipher.value = 'Длины ключа и текста не совпадают';
        return;
    }*/
    key = recoverKey(key);
    cipher.value = encrypt(codes, key);
}

function decryptTextClick() {
    let codes = document.getElementById('keySetEncryptedText').value.split(' ');
    let key = document.getElementById('keySetKeyText').value.split(' ');
    let text = document.getElementById('keySetOriginalText');
    /*if (key.length === 1 && key[0] === '') {
        text.value = 'Введите ключ';
        return;
    }
    if (key.length - 1 !== codes.length) {
        text.value = 'Длины ключа и шифра не совпадают';
        return;
    }*/
    key = recoverKey(key);
    text.value = encrypt(codes, key).hexDecode();
}

function saveKeySetClick() {
    let keySet = document.getElementById('keySetText').value;
    let textToSave = 'Группа ключей:\n' + keySet;
    let link = document.createElement('a');
    link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(textToSave));
    link.setAttribute('download', 'keys.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

