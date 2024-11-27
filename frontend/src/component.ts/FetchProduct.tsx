import React, { useEffect, useState } from "react";
import * as anchor from "@project-serum/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import { useAnchorWallet } from "@solana/wallet-adapter-react";

const PROGRAM_ID = new PublicKey("865m9ePhc85sKxN5LgTzYkxG3hQWiwgfxfuzGQUjjiCM");

const idl: anchor.Idl = {
  version: "0.1.0",
  name: "stockproduct",
  instructions: [
    {
      name: "initialize",
      accounts: [
        { name: "storeAccount", isMut: true, isSigner: false },
        { name: "user", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [{ name: "bump", type: "u8" }],
    },
    {
      name: "recordIncoming",
      accounts: [
        { name: "storeAccount", isMut: true, isSigner: false },
        { name: "user", isMut: false, isSigner: true },
      ],
      args: [
        { name: "item", type: "string" },
        { name: "price", type: "string" },
        { name: "quantity", type: "i64" },
        { name: "entrydate", type: "i64" },
      ],
    },
    {
      name: "checkStore",
      accounts: [
        { name: "storeAccount", isMut: false, isSigner: false },
        { name: "user", isMut: false, isSigner: true },
      ],
      args: [],
      returns: { vec: { defined: "Store" } },
    },
  ],
  accounts: [
    {
      name: "StoreAccount",
      type: {
        kind: "struct",
        fields: [
          { name: "products", type: { vec: { defined: "Store" } } },
          { name: "bump", type: "u8" },
        ],
      },
    },
  ],
  types: [
    {
      name: "Store",
      type: {
        kind: "struct",
        fields: [
          { name: "item", type: "string" },
          { name: "price", type: "string" },
          { name: "quantity", type: "i64" },
          { name: "entrydate", type: "i64" },
        ],
      },
    },
  ],
  errors: [{ code: 6000, name: "NoProducts", msg: "No Products in Store." }],
};

const FetchProduct: React.FC = () => {
  const wallet = useAnchorWallet();
  const [item, setItem] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const connection = new Connection("https://api.devnet.solana.com");

  const initializeAccount = async () => {
    try {
      if (!wallet) {
        console.error("Wallet not connected");
        return;
      }

      const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
      const program = new anchor.Program(idl, PROGRAM_ID, provider);

      const [storeAccountPda, Bump] = await PublicKey.findProgramAddressSync(
        [Buffer.from("store_account"), 
          wallet.publicKey.toBuffer()
        ],
          program.programId
      );

      // Check if storeAccount is already initialized
      try {
        const accountData = await program.account.storeAccount.fetch(storeAccountPda);
        console.log("Store account already initialized:", accountData);
      } catch (err) {
        // Account not found, initialize it
        const tx = await program.methods.initialize(Bump)
        .accounts({
          storeAccount: storeAccountPda,
          user: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        }).rpc();

        console.log("Store account initialized:", tx);
      }
    } catch (err: any) {
      console.error("Error initializing store account:", err);
      setError(err.message || "Error initializing store account");
    }
  };

  const fetchprods = async () => {
    try {
      if (!wallet) {
        console.error("Wallet not connected");
        return;
      }

      const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
      const program = new anchor.Program(idl, PROGRAM_ID, provider);

      const [storeAccountPda, _] = await PublicKey.findProgramAddressSync(
        [
          Buffer.from("store_account"), 
          wallet.publicKey.toBuffer()
        ],
        program.programId
      );

      const accountData = await program.account.storeAccount.fetch(storeAccountPda);

      if (accountData.products) {
        setProducts((prevProducts) => [
          ...prevProducts,
          ...accountData.products.map((products: any) => ({
            item: products.item,
            price: products.price,
            quantity: products.quantity,
            entrydate: new Date(products.entrydate.toNumber() * 1000).toLocaleString(),
          }))
        ])
      } else {
        console.error("No products found");
      }
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError(err.message || "Error fetching products");
    }
  };

  const saveProducts = async () => {
    try {
      if (!wallet) {
        console.error("Wallet not connected");
        return;
      }

      const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
      const program = new anchor.Program(idl, PROGRAM_ID, provider);

      const [storeAccountPda] = await PublicKey.findProgramAddressSync(
        [Buffer.from("store_account"), wallet.publicKey.toBuffer()],
        program.programId
      );

      const slot = await connection.getSlot();
      const entrydate = await connection.getBlockTime(slot);

      const tx = await program.methods
        .recordIncoming(item, price, new anchor.BN(quantity), new anchor.BN(entrydate))
        .accounts({
          storeAccount: storeAccountPda,
        })
        .rpc();

      console.log("Transaction for saving product:", tx);
        
      setProducts([]);
      
      if(entrydate) {
        setProducts((prevProducts) => [
          ...prevProducts,
          {
            item: item,
            price: price,
            quantity: quantity,
            entrydate: new Date(entrydate * 1000).toLocaleString()
          }
        ])
      }

      fetchprods(); // Refresh the product list
      setItem("");
      setPrice("");
      setQuantity(1);
    } catch (err: any) {
      console.error("Error saving product:", err);
      setError(err.message || "Error saving product");
    }
  };

  useEffect(() => {
    fetchprods();
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
        onClick={initializeAccount}
      >
        Initialize Store
      </button>
      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          saveProducts();
        }}
      >
        <h2 className="text-lg font-bold mb-4">Add Stock</h2>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Item</label>
          <input
            type="text"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Price</label>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Save Product
        </button>
      </form>

      <div className="mb-4">
        <h3 className="text-lg font-bold">Product List</h3>
        {products.length === 0 ? (
          <p>No products saved yet.</p>
        ) : (
          <ul>
            {products.map((product, index) => (
              <li key={index} className="mb-2">
                {product.item} | {product.price} | {product.quantity} | {product.entrydate}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <div className="text-red-500 mt-4">
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  );
};

export default FetchProduct;
