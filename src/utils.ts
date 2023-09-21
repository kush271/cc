import {
    createHash,
    createCipheriv,
    createDecipheriv,
    randomBytes,
  } from 'crypto';
  
  import { parse } from 'querystring';
  export const encrypt = (plainText, workingKey) => {
    var m = createHash('md5');
    m.update(workingKey);
    var key = m.digest('binary');
    var iv = randomBytes(16);
    var cipher = createCipheriv('aes-256-gcm', workingKey, iv);
    var encoded = cipher.update(plainText, 'utf8', 'hex');
    encoded += cipher.final('hex');
    return encoded;
  
    // parameter payload should be in string/stringify
  
    // const method = 'aes-256-gcm';
    // const initVector = randomBytes(16);
    // const cipher = createCipheriv(method, workingKey, initVector);
    // let encrypted = cipher.update(plainText, 'utf8', 'hex');
    // encrypted += cipher.final('hex');
    // const tag = cipher.getAuthTag().toString('hex');
    // return initVector.toString('hex') + encrypted + tag;
  };
  
  export const decrypt = (encResp, workingKey) => {
    const method = 'aes-256-gcm';
    const encryptedTextBuffer = Buffer.from(encResp, 'hex');
    const iv_len = 16;
    const tag_length = 16;
    const iv = encryptedTextBuffer.slice(0, iv_len);
    const tag = encryptedTextBuffer.slice(-tag_length);
    const ciphertext = encryptedTextBuffer.slice(iv_len, -tag_length);
    const decipher = createDecipheriv(method, workingKey, iv);
    decipher.setAuthTag(tag);
    // @ts-ignore
    let decrypted = decipher.update(ciphertext, 'binary', 'utf8');
    // @ts-ignore
    decrypted += decipher.final('utf8');
  
    let data = parse(decrypted);
    return data;
  };