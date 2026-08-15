#include <gtest/gtest.h>
#include "bb84/protocol.hpp"

using namespace qrypt::qkd;

TEST(BB84ProtocolTest, LowQBERAccepted) {
    BB84Config config{
        .raw_key_bits = 10000,
        .qber_threshold = 0.11,
        .eve_enabled = false,
        .final_key_bits = 256
    };

    QKDResult result = run_bb84(config);
    EXPECT_TRUE(result.accepted);
    EXPECT_NEAR(result.qber, 0.0, 0.01);
    EXPECT_EQ(result.final_key.size(), 32);
}

TEST(BB84ProtocolTest, HighQBERRejected) {
    BB84Config config{
        .raw_key_bits = 10000,
        .qber_threshold = 0.11,
        .eve_enabled = true,
        .final_key_bits = 256
    };

    QKDResult result = run_bb84(config);
    EXPECT_FALSE(result.accepted);
    EXPECT_NEAR(result.qber, 0.25, 0.05);
    EXPECT_TRUE(result.final_key.empty());
}
