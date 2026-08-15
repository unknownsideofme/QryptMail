#include <gtest/gtest.h>
#include "qkd/qkd_engine.hpp"
#include "common/random.hpp"
#include <set>
#include <vector>

using namespace qrypt::qkd;

TEST(QKDEngineTest, ConfigurableKeySizes) {
    QKDEngine engine;
    std::vector<size_t> sizes = {128, 256, 512, 1024, 8192};

    for (size_t bits : sizes) {
        BB84Config config{
            .raw_key_bits = bits * 10,
            .qber_threshold = 0.11,
            .eve_enabled = false,
            .final_key_bits = bits
        };

        QKDResult result = engine.run(config);
        ASSERT_TRUE(result.accepted);
        EXPECT_EQ(result.final_key.size(), bits / 8);
    }
}

TEST(QKDEngineTest, RandomnessEntropy) {
    SecureRandom rng;
    const size_t sample_size = 10000;
    size_t count_ones = 0;
    size_t count_diagonals = 0;

    std::set<double> unique_probs;

    for (size_t i = 0; i < sample_size; ++i) {
        if (rng.random_bit() == Bit::One) {
            ++count_ones;
        }
        if (rng.random_basis() == Basis::Diagonal) {
            ++count_diagonals;
        }
        unique_probs.insert(rng.uniform_probability());
    }

    double bit_ratio = static_cast<double>(count_ones) / sample_size;
    double basis_ratio = static_cast<double>(count_diagonals) / sample_size;

    EXPECT_NEAR(bit_ratio, 0.50, 0.03);
    EXPECT_NEAR(basis_ratio, 0.50, 0.03);

    EXPECT_GT(unique_probs.size(), sample_size - 10);
}

TEST(QKDEngineTest, RegressionMultipleSessions) {
    QKDEngine engine;
    BB84Config config{
        .raw_key_bits = 5000,
        .qber_threshold = 0.11,
        .eve_enabled = false,
        .final_key_bits = 256
    };

    for (int i = 0; i < 50; ++i) {
        QKDResult result = engine.run(config);
        EXPECT_TRUE(result.accepted);
        EXPECT_EQ(result.final_key.size(), 32);
    }
}
