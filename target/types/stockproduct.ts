/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/stockproduct.json`.
 */
export type Stockproduct = {
  "address": "865m9ePhc85sKxN5LgTzYkxG3hQWiwgfxfuzGQUjjiCM",
  "metadata": {
    "name": "stockproduct",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "checkStore",
      "discriminator": [
        151,
        116,
        119,
        85,
        88,
        212,
        169,
        66
      ],
      "accounts": [
        {
          "name": "storeAccount",
          "writable": true
        }
      ],
      "args": [],
      "returns": {
        "vec": {
          "defined": {
            "name": "store"
          }
        }
      }
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "storeAccount",
          "writable": true,
          "signer": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "recordIncoming",
      "discriminator": [
        113,
        98,
        185,
        213,
        169,
        36,
        196,
        243
      ],
      "accounts": [
        {
          "name": "storeAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "item",
          "type": "string"
        },
        {
          "name": "price",
          "type": "string"
        },
        {
          "name": "quantity",
          "type": "i64"
        },
        {
          "name": "entrydate",
          "type": "i64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "storeAccount",
      "discriminator": [
        158,
        151,
        50,
        63,
        120,
        194,
        135,
        114
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "noProducts",
      "msg": "No products in store."
    }
  ],
  "types": [
    {
      "name": "store",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "item",
            "type": "string"
          },
          {
            "name": "price",
            "type": "string"
          },
          {
            "name": "quantity",
            "type": "i64"
          },
          {
            "name": "entrydate",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "storeAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "products",
            "type": {
              "vec": {
                "defined": {
                  "name": "store"
                }
              }
            }
          }
        ]
      }
    }
  ]
};
