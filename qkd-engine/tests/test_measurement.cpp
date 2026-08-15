#include <gtest/gtest.h>
#include "bb84/quantum_state.hpp"
#include <cmath>

using namespace qrypt::qkd;

TEST(MeasurementTest, MatchingBases) {
    // Matching rectilinear basis
    QuantumState r0 = encode(Bit::Zero, Basis::Rectilinear);
    QuantumState r1 = encode(Bit::One, Basis::Rectilinear);

    for (int i = 0; i < 100; ++i) {
        EXPECT_EQ(measure(r0, Basis::Rectilinear).bit, Bit::Zero);
        EXPECT_EQ(measure(r1, Basis::Rectilinear).bit, Bit::One);
    }

    // Matching diagonal basis
    QuantumState d0 = encode(Bit::Zero, Basis::Diagonal);
    QuantumState d1 = encode(Bit::One, Basis::Diagonal);

    for (int i = 0; i < 100; ++i) {
        EXPECT_EQ(measure(d0, Basis::Diagonal).bit, Bit::Zero);
        EXPECT_EQ(measure(d1, Basis::Diagonal).bit, Bit::One);
    }
}

TEST(MeasurementTest, MismatchedBasesStatistical) {
    QuantumState r0 = encode(Bit::Zero, Basis::Rectilinear);
    QuantumState d0 = encode(Bit::Zero, Basis::Diagonal);

    size_t count_r0_measured_in_d = 0;
    size_t count_d0_measured_in_r = 0;
    const size_t runs = 10000;

    for (size_t i = 0; i < runs; ++i) {
        if (measure(r0, Basis::Diagonal).bit == Bit::Zero) {
            ++count_r0_measured_in_d;
        }
        if (measure(d0, Basis::Rectilinear).bit == Bit::Zero) {
            ++count_d0_measured_in_r;
        }
    }

    double ratio_r0 = static_cast<double>(count_r0_measured_in_d) / runs;
    double ratio_d0 = static_cast<double>(count_d0_measured_in_r) / runs;

    // Check that the ratio is close to 0.50 (within 3% tolerance)
    EXPECT_NEAR(ratio_r0, 0.50, 0.03);
    EXPECT_NEAR(ratio_d0, 0.50, 0.03);
}
