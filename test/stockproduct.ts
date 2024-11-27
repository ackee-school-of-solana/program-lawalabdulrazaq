import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { StockProduct } from "../target/types/stockproduct";
import { assert } from "chai";

describe("stockproduct", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.StockProduct as Program<StockProduct>;
  const provider = anchor.AnchorProvider.env();
  const wallet = provider.wallet;

  let storePda: anchor.web3.PublicKey;
  let bump: number;

  before(async () => {
    // Derive the PDA for the store account
    [storePda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("store_account"), wallet.publicKey.toBuffer()],
      program.programId
    );
  });

  it("Initializes the store account successfully", async () => {
    // Initialize the store account
    await program.methods
      .initialize(bump)
      .accounts({
        storeAccount: storePda,
        user: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // Fetch the account data
    const storeAccount = await program.account.storeAccount.fetch(storePda);

    // Assertions
    assert.isNotNull(storeAccount);
    assert.deepEqual(storeAccount.products, []);
    assert.equal(storeAccount.bump, bump, "Bump does not match the expected value");
  });

  it("Records an incoming product", async () => {
    const item = "Laptop";
    const price = "2000 SOL";
    const quantity = 10;
    const entrydate = Math.floor(Date.now() / 1000);

    // Record a new product
    await program.methods
      .recordIncoming(item, price, quantity, entrydate)
      .accounts({
        storeAccount: storePda,
        user: wallet.publicKey,
      })
      .rpc();

    // Fetch the account data
    const storeAccount = await program.account.storeAccount.fetch(storePda);

    // Assertions
    assert.equal(storeAccount.products.length, 1, "Product was not recorded");
    const recordedProduct = storeAccount.products[0];
    assert.equal(recordedProduct.item, item, "Item name does not match");
    assert.equal(recordedProduct.price, price, "Price does not match");
    assert.equal(recordedProduct.quantity, quantity, "Quantity does not match");
    assert.equal(recordedProduct.entrydate, entrydate, "Entrydate does not match");
  });

  it("Records multiple products", async () => {
    const products = [
      { item: "Tablet", price: "1000 SOL", quantity: 5, entrydate: Math.floor(Date.now() / 1000) },
      { item: "Phone", price: "800 SOL", quantity: 20, entrydate: Math.floor(Date.now() / 1000) },
    ];

    for (const product of products) {
      await program.methods
        .recordIncoming(product.item, product.price, product.quantity, product.entrydate)
        .accounts({
          storeAccount: storePda,
          user: wallet.publicKey,
        })
        .rpc();
    }

    // Fetch the account data
    const storeAccount = await program.account.storeAccount.fetch(storePda);

    // Assertions
    assert.equal(storeAccount.products.length, 3, "Not all products were recorded");
  });

  it("Fails to retrieve products from an uninitialized account", async () => {
    // Create a new PDA without initializing
    const [uninitializedPda] = anchor.web3.PublicKey.findProgramAddressSync(
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
        .rpc();
      assert.fail("Should throw an error for uninitialized account");
    } catch (err) {
      assert.include(err.message, "Account does not exist", "Error message mismatch");
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
      .rpc();

    // Assertions
    assert.equal(storedProducts.length, 3, "Number of retrieved products is incorrect");
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
        .rpc();
      assert.fail("Should throw an error for invalid data");
    } catch (err) {
      assert.include(err.message, "Program failed to complete", "Error message mismatch");
    }
  });
});
