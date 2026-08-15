#include <gtest/gtest.h>
#include "bb84/privacy_amplification.hpp"
#include <string>
#include <vector>

using namespace qrypt::qkd;

TEST(PrivacyAmplificationTest, OutputsCorrectLengths) {
    PrivacyAmplifier amplifier;
    std::vector<Bit> key = {Bit::Zero, Bit::One, Bit::Zero, Bit::One, Bit::Zero, Bit::One, Bit::Zero, Bit::One};
    std::string session_id = "test-session-id-12345";

    // Test 128 bits (16 bytes)
    std::vector<uint8_t> key128 = amplifier.amplify(key, 128, session_id);
    EXPECT_EQ(key128.size(), 16);

    // Test 256 bits (32 bytes)
    std::vector<uint8_t> key256 = amplifier.amplify(key, 256, session_id);
    EXPECT_EQ(key256.size(), 32);

    // Test 512 bits (64 bytes)
    std::vector<uint8_t> key512 = amplifier.amplify(key, 512, session_id);
    EXPECT_EQ(key512.size(), 64);
}

TEST(PrivacyAmplificationTest, ConsistencyAndUniqueness) {
    PrivacyAmplifier amplifier;
    std::vector<Bit> key_alice = {Bit::Zero, Bit::One, Bit::Zero, Bit::One};
    std::vector<Bit> key_bob   = {Bit::Zero, Bit::One, Bit::Zero, Bit::One};
    std::vector<Bit> key_eve   = {Bit::Zero, Bit::One, Bit::One, Bit::Zero};

    std::string session_id = "session-1";

    // Alice and Bob keys should be identical
    std::vector<uint8_t> final_alice = amplifier.amplify(key_alice, 256, session_id);
    std::vector<uint8_t> final_bob   = amplifier.amplify(key_bob, 256, session_id);
    EXPECT_EQ(final_alice, final_bob);

    // Eve's key (from different reconciled bits) should be different
    std::vector<uint8_t> final_eve = amplifier.amplify(key_eve, 256, session_id);
    EXPECT_NE(final_alice, final_eve);

    // Different session ID (salt) should produce different keys even for the same input
    std::vector<uint8_t> final_alice_session2 = amplifier.amplify(key_alice, 256, "session-2");
    EXPECT_NE(final_alice, final_alice_session2);
}
