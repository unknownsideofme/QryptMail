#include <gtest/gtest.h>
#include "bb84/quantum_state.hpp"
#include <cmath>

using namespace qrypt::qkd;

TEST(QuantumStateTest, EncodingCorrectness) {
    constexpr double inv_sqrt2 = 0.7071067811865475;
    constexpr double tol = 1e-9;

    // |0> = (1, 0)
    QuantumState state0 = encode(Bit::Zero, Basis::Rectilinear);
    EXPECT_NEAR(state0.alpha, 1.0, tol);
    EXPECT_NEAR(state0.beta, 0.0, tol);

    // |1> = (0, 1)
    QuantumState state1 = encode(Bit::One, Basis::Rectilinear);
    EXPECT_NEAR(state1.alpha, 0.0, tol);
    EXPECT_NEAR(state1.beta, 1.0, tol);

    // |+> = (1/sqrt(2), 1/sqrt(2))
    QuantumState state_plus = encode(Bit::Zero, Basis::Diagonal);
    EXPECT_NEAR(state_plus.alpha, inv_sqrt2, tol);
    EXPECT_NEAR(state_plus.beta, inv_sqrt2, tol);

    // |-> = (1/sqrt(2), -1/sqrt(2))
    QuantumState state_minus = encode(Bit::One, Basis::Diagonal);
    EXPECT_NEAR(state_minus.alpha, inv_sqrt2, tol);
    EXPECT_NEAR(state_minus.beta, -inv_sqrt2, tol);
}
