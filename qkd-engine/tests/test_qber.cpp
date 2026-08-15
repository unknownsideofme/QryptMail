#include <gtest/gtest.h>
#include "bb84/qber.hpp"

using namespace qrypt::qkd;

TEST(QBERTest, CalculationCorrectness) {
    // Identical keys -> QBER = 0
    std::vector<Bit> alice_key1 = {Bit::Zero, Bit::One, Bit::Zero, Bit::One};
    std::vector<Bit> bob_key1   = {Bit::Zero, Bit::One, Bit::Zero, Bit::One};
    EXPECT_DOUBLE_EQ(calculate_qber(alice_key1, bob_key1), 0.0);

    // Mismatched keys -> QBER = 25% (1 mismatch out of 4)
    std::vector<Bit> alice_key2 = {Bit::Zero, Bit::One, Bit::Zero, Bit::One};
    std::vector<Bit> bob_key2   = {Bit::Zero, Bit::One, Bit::One, Bit::One};
    EXPECT_DOUBLE_EQ(calculate_qber(alice_key2, bob_key2), 0.25);

    // Empty keys -> QBER = 0
    std::vector<Bit> alice_empty;
    std::vector<Bit> bob_empty;
    EXPECT_DOUBLE_EQ(calculate_qber(alice_empty, bob_empty), 0.0);
}

TEST(QBERTest, SizeMismatchValidation) {
    std::vector<Bit> alice_key = {Bit::Zero};
    std::vector<Bit> bob_key   = {Bit::Zero, Bit::One};
    EXPECT_THROW(calculate_qber(alice_key, bob_key), std::invalid_argument);
}
