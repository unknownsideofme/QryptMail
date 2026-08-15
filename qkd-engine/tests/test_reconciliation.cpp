#include <gtest/gtest.h>
#include "bb84/reconciliation.hpp"
#include "common/random.hpp"
#include <vector>

using namespace qrypt::qkd;

TEST(ReconciliationTest, ErrorCorrection) {
    const size_t num_bits = 1000;
    SecureRandom rng;

    // Generate Alice's key
    std::vector<Bit> alice_key(num_bits);
    for (size_t i = 0; i < num_bits; ++i) {
        alice_key[i] = rng.random_bit();
    }

    // Generate Bob's key with ~3% errors
    std::vector<Bit> bob_key = alice_key;
    size_t error_count = 0;
    for (size_t i = 0; i < num_bits; ++i) {
        if (rng.uniform_probability() < 0.03) {
            bob_key[i] = (bob_key[i] == Bit::Zero) ? Bit::One : Bit::Zero;
            ++error_count;
        }
    }

    // Verify Bob's key has errors initially
    if (error_count > 0) {
        EXPECT_NE(alice_key, bob_key);
    }

    // Reconcile
    PrototypeReconciler reconciler;
    size_t bits_revealed = 0;
    std::vector<Bit> reconciled_bob = reconciler.reconcile(alice_key, bob_key, bits_revealed);

    // Verify keys are now identical
    EXPECT_EQ(alice_key, reconciled_bob);
    EXPECT_GT(bits_revealed, 0);
}

TEST(ReconciliationTest, EmptyKey) {
    PrototypeReconciler reconciler;
    size_t bits_revealed = 0;
    std::vector<Bit> alice_key;
    std::vector<Bit> bob_key;
    std::vector<Bit> reconciled = reconciler.reconcile(alice_key, bob_key, bits_revealed);
    EXPECT_TRUE(reconciled.empty());
    EXPECT_EQ(bits_revealed, 0);
}
