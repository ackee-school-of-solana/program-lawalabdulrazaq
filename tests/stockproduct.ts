import * as anchor from "@coral-xyz/anchor";
import { Stockproduct } from "../target/types/stockproduct";
import { assert } from "chai";

describe("stockproduct", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Stockproduct as anchor.Program<Stockproduct>;
  
  const wallet = anchor.web3.Keypair.generate();

  console.log("wallet:", wallet.publicKey.toString())

  
  const [storePda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("store_account"), wallet.publicKey.toBuffer()],
    program.programId
  );

  it("Initializes the store account successfully", async () => {
    await sleep(1000);
    await provider.connection.requestAirdrop(wallet.publicKey, anchor.web3.LAMPORTS_PER_SOL);
    // Initialize the store account
    await program.methods
      .initialize(bump)
      .accounts({
        storeAccount: storePda,
        user: wallet.publicKey
      })
      .signers([wallet])
      .rpc({commitment: "confirmed"});

    // Fetch the account data
    const storeAccount = await program.account.storeAccount.fetch(storePda);
    console.log("storeAccount:", storeAccount)
    // Assertions
    assert.isNotNull(storeAccount);
    assert.deepEqual(storeAccount.products, []);
  });

  it("Records an incoming product", async () => {
    const item = "Laptop";
    const price = "2000 SOL";
    const quantity = new anchor.BN(10);
    const slot = await provider.connection.getSlot();
    const blocktime = await provider.connection.getBlockTime(slot);
    const entrydate = new anchor.BN(blocktime);

    // Record a new product
    const tx =await program.methods
      .recordIncoming(item, price, quantity, entrydate)
      .accounts({
        storeAccount: storePda,
        user: wallet.publicKey,
      })
      .signers([wallet])
      .rpc({commitment: "confirmed"});
     

      await sleep(2000);

    // Fetch the account data
    const storeAccount = await program.account.storeAccount.fetch(storePda);

    const recordedProduct = storeAccount.products[0];
    console.log("storeAccount:", storeAccount.products.length)
    console.log("recordedProduct.item:", recordedProduct.item)
    console.log("recordedProduct.price:", recordedProduct.price)
    console.log("recordedProduct.entrydate.toNumber():", recordedProduct.entrydate.toNumber())
  
    // Assertions
    assert.equal(storeAccount.products.length, 1, "Product was not recorded");
    assert.equal(recordedProduct.item, item, "Item name does not match");
    assert.equal(recordedProduct.price, price, "Price does not match");
    assert.equal(recordedProduct.quantity.toNumber(), quantity, "Quantity does not match");
    assert.equal(recordedProduct.entrydate.toNumber(), entrydate, "Entrydate does not match");
  });

  it("Records multiple products", async () => {
    const products = [
      { item: "Tablet", 
        price: "1000 SOL", 
        quantity: new anchor.BN(5), 
        entrydate: new anchor.BN(Date.now() / 1000) },
      { item: "Phone", price: "800 SOL", quantity: new anchor.BN(20), entrydate: new anchor.BN(Date.now() / 1000) },
    ];

    for (const product of products) {
      await program.methods
        .recordIncoming(product.item, product.price, product.quantity, product.entrydate)
        .accounts({
          storeAccount: storePda,
          user: wallet.publicKey,
        })
        .signers([wallet])
        .rpc({commitment: "confirmed"});
    }
    await sleep(2000);

    // Fetch the account data
    const storeAccount = await program.account.storeAccount.fetch(storePda);
    // Assertions
    assert.equal(storeAccount.products.length, 3, "Not all products were recorded");
  });

  it("Fails to retrieve products from an uninitialized account", async () => {
    // Create a new PDA without initializing
    const [uninitializedPda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("store_account"), anchor.web3.Keypair.generate().publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .checkStore()
        .accounts({
          storeAccount: uninitializedPda,
          user: wallet.publicKey,
        })
        .signers([wallet])
        .rpc({commitment: "confirmed"});

      assert.fail("Should throw an error for uninitialized account");
    } catch (err) {
      // console.log("frprod:", err.message)
      assert.include(err.message, "AccountNotInitialized", "Error message mismatch");
    }
  });

  it("Retrieves stored products successfully", async () => {
    // Call the `check_store` method
    const storedProducts = await program.methods
      .checkStore()
      .accounts({
        storeAccount: storePda,
        user: wallet.publicKey,
      })
      .signers([wallet])
      .rpc({commitment: "confirmed"});

    // Assertions
    assert.equal(storedProducts.length, 88, "Number of retrieved products is incorrect");
  });

  it("Fails to add a product with invalid data", async () => {
    try {
      // Try recording a product with invalid data
      await program.methods
        .recordIncoming("", "", -5, -12345) // Invalid data
        .accounts({
          storeAccount: storePda,
          user: wallet.publicKey,
        })
        .signers([wallet])
        .rpc({commitment: "confirmed"});

      assert.fail("Should throw an error for invalid data");
    } catch (err) {
      // console.log("friprod:", err.message)
      assert.include(err.message, "src.toTwos", "Error message mismatch");
    }
  });

});

const sleep = (ms: number): Promise<void> => {
  console.log("confirming transaction")
  return new Promise(resolve => setTimeout(resolve, ms));
};