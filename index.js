function normalizeHex(hex){
    let fullHex = "00" + hex;
    let normalizedHex = fullHex;
    if(normalizedHex.length > 3)
        normalizedHex = normalizedHex.slice(-3);
    return normalizedHex;
}

function convertToHex(text){
    let hex = [];
    for (let i = 0; i < text.length; i++) {
        let symbol = text.charCodeAt(i).toString(16);
        let normalizedHex = normalizeHex(symbol);
        hex.push(normalizedHex);
    }
    return hex;
}

function convertToString(hex) {
    let symbols = hex.split(' ');
    let line = "";
    for (let i = 0; i < symbols.length; i++) {
        let number = parseInt(symbols[i], 16);
        line += String.fromCharCode(number);
    }
    return line;
}

function generateKey(length) {
    let key = '';
    for (let i = 0; i < length; i++) {
        let hex = Math.random() * 0xFFF << 0;
        let normalizedNumber = normalizeHex(hex.toString(16));
        key += normalizedNumber;
        if(i !== length - 1)
            key += ' ';
    }
    return key;
}

function generateKeySet(length, count = 10) {
    let keys = generateKey(length).split(' ');
    let keySet = '';
    for (let i = 0; i < count; i++) {
        let number = Math.random() * 0xFFF << 0;
        let salt = number.toString(16);
        keySet += normalizeHex(salt) + ' ';
        for (let j = 0; j < keys.length; j++) {
            keySet += generateSum(keys[j], salt)
            if(j !== keys.length - 1)
                keySet += ' ';
        }
        if (i !== count - 1)
            keySet += '\n';
    }
    return keySet;
}

function generateSum(keyPart, salt){
    let number = (parseInt(keyPart, 16) ^ parseInt(salt, 16)).toString(16);
    return normalizeHex(number);
}

function getKeyFromSet(keys) {
    let salt = keys.shift();
    for (let i = 0; i < keys.length; i++) {
        keys[i] = (parseInt(keys[i], 16) ^ parseInt(salt, 16)).toString(16);
    }
    return keys;
}

function encrypt(codes, keys) {
    let encryptedText = '';
    for (let i = 0; i < codes.length; i++) {
        let number = (parseInt(codes[i], 16) ^ parseInt(keys[i], 16)).toString(16);
        let normalizedNumber = normalizeHex(number);
        encryptedText += normalizedNumber;
        if(i !== codes.length - 1)
            encryptedText += ' ';
    }
    return encryptedText;
}


function clearFields() {
    document.getElementById('keySetOriginalText').value = '';
    document.getElementById('keySetKeyText').value = '';
    document.getElementById('keySetText').value = '';
    document.getElementById('keySetEncryptedText').value = '';
}

function generateKeySetClick() {
    let keySetField = document.getElementById('keySetText');
    let keyField = document.getElementById('keySetKeyText');
    let length = convertToHex(document.getElementById('keySetOriginalText').value).length;
    keySetField.value = generateKeySet(length);
    keyField.value = keySetField.value.split('\n')[Math.floor(Math.random() * 10)];
}

function encryptTextClick() {
    let text = convertToHex(document.getElementById('keySetOriginalText').value);
    let keyParts = document.getElementById('keySetKeyText').value.split(' ');
    let encryptedTextField = document.getElementById('keySetEncryptedText');
    keyParts = getKeyFromSet(keyParts);
    encryptedTextField.value = encrypt(text, keyParts);
}

function decryptTextClick() {
    let encryptedParts = document.getElementById('keySetEncryptedText').value.split(' ');
    let keyParts = document.getElementById('keySetKeyText').value.split(' ');
    let textField = document.getElementById('keySetOriginalText');
    keyParts = getKeyFromSet(keyParts);
    textField.value = convertToString(encrypt(encryptedParts, keyParts));
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

document.getElementById('keySetClearEncodingFields').addEventListener('click', clearFields);
document.getElementById('keySetKeyGenerationButton').addEventListener('click', generateKeySetClick);
document.getElementById('keySetEncryptButton').addEventListener('click', encryptTextClick);
document.getElementById('keySetDecipherButton').addEventListener('click', decryptTextClick);
document.getElementById('saveKeySetButton').addEventListener('click', saveKeySetClick);

