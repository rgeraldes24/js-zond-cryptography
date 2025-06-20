import { decrypt, encrypt } from "../../src/aes";
import { hexToBytes, toHex } from "../../src/utils";
import { deepStrictEqual, rejects } from "./assert";
// Test vectors taken from https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38a.pdf
const TEST_VECTORS = [
  {
    mode: "aes-256-gcm",
    key: "603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4",
    iv: "000102030405060708090a0b0c0d0e0f",
    msg: "6bc1bee22e409f96e93d7e117393172aae2d8a571e03ac9c9eb76fac45af8e5130c81c46a35ce411e5fbc1191a0a52eff69f2445df4f9b17ad2b417be66c3710",
    cypherText:
      "f58c4c04d6e5f1ba779eabfb5f7bfbd69cfc4e967edb808d679f777bc6702c7d39f23369a9d9bacfa530e26304231461b2eb05e2c39be9fcda6c19078c6a9d1b",
  },
  {
    mode: "aes-256-gcm",
    key: "603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4",
    iv: "000102030405060708090a0b0c0d0e0f",
    msg: "6bc1bee22e409f96e93d7e117393172aae2d8a571e03ac9c9eb76fac45af8e5130c81c46a35ce411e5fbc1191a0a52eff69f2445df4f9b17ad2b417be66c371010101010101010101010101010101010",
    cypherText:
      "f58c4c04d6e5f1ba779eabfb5f7bfbd69cfc4e967edb808d679f777bc6702c7d39f23369a9d9bacfa530e26304231461b2eb05e2c39be9fcda6c19078c6a9d1b3f461796d6b0d6b2e0c2a72b4d80e644",
  },
  {
    mode: "aes-256-gcm",
    key: "603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4",
    iv: "000102030405060708090a0b0c0d0e0f",
    msg: "6bc1bee22e409f96e93d7e117393172aae2d8a571e03ac9c9eb76fac45af8e5130c81c46a35ce411e5fbc1191a0a52eff69f2445df4f9b17ad2b417be66c3710",
    cypherText:
      "f58c4c04d6e5f1ba779eabfb5f7bfbd69cfc4e967edb808d679f777bc6702c7d39f23369a9d9bacfa530e26304231461b2eb05e2c39be9fcda6c19078c6a9d1b3f461796d6b0d6b2e0c2a72b4d80e644",
  },
];

describe("aes", () => {
  for (const [i, vector] of TEST_VECTORS.entries()) {
    it(`Should encrypt the test ${i} correctly`, async () => {
      const encrypted = await encrypt(
        hexToBytes(vector.msg),
        hexToBytes(vector.key),
        hexToBytes(vector.iv),
        vector.mode
      );

      deepStrictEqual(toHex(encrypted), vector.cypherText);
    });

    it(`Should decrypt the test ${i} correctly`, async () => {
      const decrypted = await decrypt(
        hexToBytes(vector.cypherText),
        hexToBytes(vector.key),
        hexToBytes(vector.iv),
        vector.mode
      );

      deepStrictEqual(toHex(decrypted), vector.msg);
    });
  }

  it("Should throw when not padding automatically and the message isn't the right size", async () => {
    rejects(() =>
      encrypt(
        hexToBytes("abcd"),
        hexToBytes("2b7e151628aed2a6abf7158809cf4f3c"),
        hexToBytes("2b7e151628aed2a6abf7158809cf4f3c"),
        "aes-256-gcm"
      )
    );
  });

  it("Should throw when trying to use non-aes modes", async () => {
    rejects(() =>
      encrypt(
        hexToBytes("abcd"),
        hexToBytes("2b7e151628aed2a6abf7158809cf4f3c"),
        hexToBytes("2b7e151628aed2a6abf7158809cf4f3c"),
        "asd-256-gcm"
      )
    );
  });
});
