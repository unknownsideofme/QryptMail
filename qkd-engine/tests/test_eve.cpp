#include <gtest/gtest.h>
#include "bb84/alice.hpp"
#include "bb84/bob.hpp"
#include "bb84/channel.hpp"
#include "bb84/sifting.hpp"
#include "bb84/qber.hpp"

using namespace qrypt::qkd;

TEST(EveTest, EavesdroppingDisturbance) {
    const size_t num_bits = 20000;

    // Run 1: Eve disabled
    {
        Alice alice;
        alice.generate(num_bits);

        QuantumChannel channel(false); // Eve disabled
        std::vector<QuantumState> received = channel.transmit(alice.states());

        Bob bob;
        bob.generate_bases(num_bits);
        bob.measure(received);

        SiftedKeys sifted = sift(alice.bits(), alice.bases(), bob.measured_bits(), bob.bases());
        double qber = calculate_qber(sifted.alice_bits, sifted.bob_bits);

        // QBER should be approximately 0
        EXPECT_NEAR(qber, 0.0, 0.001);
    }

    // Run 2: Eve enabled
    {
        Alice alice;
        alice.generate(num_bits);

        QuantumChannel channel(true); // Eve enabled
        std::vector<QuantumState> received = channel.transmit(alice.states());

        Bob bob;
        bob.generate_bases(num_bits);
        bob.measure(received);

        SiftedKeys sifted = sift(alice.bits(), alice.bases(), bob.measured_bits(), bob.bases());
        double qber = calculate_qber(sifted.alice_bits, sifted.bob_bits);

        // QBER should be approximately 25% (tolerance 3%)
        // Because for sifted keys (bases match), Eve guesses the wrong basis 50% of the time,
        // which randomizes the state Bob measures. So 25% of the sifted bits are incorrect.
        EXPECT_NEAR(qber, 0.25, 0.03);
    }
}
