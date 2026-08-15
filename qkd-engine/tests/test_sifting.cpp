#include <gtest/gtest.h>
#include "bb84/sifting.hpp"

using namespace qrypt::qkd;

TEST(SiftingTest, BasisSifting) {
    std::vector<Bit> alice_bits = {Bit::Zero, Bit::One, Bit::Zero, Bit::One, Bit::Zero};
    std::vector<Basis> alice_bases = {Basis::Rectilinear, Basis::Rectilinear, Basis::Diagonal, Basis::Diagonal, Basis::Rectilinear};

    std::vector<Bit> bob_bits = {Bit::Zero, Bit::Zero, Bit::Zero, Bit::One, Bit::One};
    std::vector<Basis> bob_bases = {Basis::Rectilinear, Basis::Diagonal, Basis::Diagonal, Basis::Rectilinear, Basis::Rectilinear};

    // Bases match at index: 0 (Rectilinear), 2 (Diagonal), 4 (Rectilinear)
    SiftedKeys result = sift(alice_bits, alice_bases, bob_bits, bob_bases);

    ASSERT_EQ(result.indices.size(), 3);
    EXPECT_EQ(result.indices[0], 0);
    EXPECT_EQ(result.indices[1], 2);
    EXPECT_EQ(result.indices[2], 4);

    ASSERT_EQ(result.alice_bits.size(), 3);
    EXPECT_EQ(result.alice_bits[0], Bit::Zero);
    EXPECT_EQ(result.alice_bits[1], Bit::Zero);
    EXPECT_EQ(result.alice_bits[2], Bit::Zero);

    ASSERT_EQ(result.bob_bits.size(), 3);
    EXPECT_EQ(result.bob_bits[0], Bit::Zero);
    EXPECT_EQ(result.bob_bits[1], Bit::Zero);
    EXPECT_EQ(result.bob_bits[2], Bit::One);
}

TEST(SiftingTest, InputValidation) {
    std::vector<Bit> alice_bits = {Bit::Zero};
    std::vector<Basis> alice_bases = {Basis::Rectilinear};
    std::vector<Bit> bob_bits = {Bit::Zero, Bit::One};
    std::vector<Basis> bob_bases = {Basis::Rectilinear, Basis::Diagonal};

    EXPECT_THROW(sift(alice_bits, alice_bases, bob_bits, bob_bases), std::invalid_argument);
}
