#include "bb84/protocol.hpp"
#include "bb84/alice.hpp"
#include "bb84/bob.hpp"
#include "bb84/channel.hpp"
#include "bb84/sifting.hpp"
#include "bb84/qber.hpp"
#include "bb84/reconciliation.hpp"
#include "bb84/privacy_amplification.hpp"
#include "common/random.hpp"
#include "common/errors.hpp"
#include <chrono>
#include <iomanip>
#include <sstream>
#include <algorithm>

namespace qrypt::qkd {

static std::string generate_session_id() {
    SecureRandom rng;
    std::vector<uint8_t> bytes = rng.random_bytes(16);
    std::stringstream ss;
    ss << std::hex << std::setfill('0');
    for (uint8_t b : bytes) {
        ss << std::setw(2) << static_cast<int>(b);
    }
    return ss.str();
}

QKDResult run_bb84(const BB84Config& config) {
    QKDResult result;
    result.session_id = generate_session_id();
    result.transmitted_bits = config.raw_key_bits;

    Alice alice;
    alice.generate(config.raw_key_bits);

    QuantumChannel channel(config.eve_enabled);
    std::vector<QuantumState> received_states = channel.transmit(alice.states());

    Bob bob;
    bob.generate_bases(config.raw_key_bits);
    bob.measure(received_states);

    SiftedKeys sifted = sift(
        alice.bits(), alice.bases(),
        bob.measured_bits(), bob.bases()
    );
    result.sifted_bits = sifted.indices.size();

    size_t required_bits = config.final_key_bits * 2;
    if (result.sifted_bits < required_bits) {
        result.accepted = false;
        result.qber = 0.0;
        return result;
    }

    size_t sample_size = std::max(result.sifted_bits / 10, static_cast<size_t>(10));
    sample_size = std::min(sample_size, result.sifted_bits / 2);

    std::vector<Bit> alice_sample;
    std::vector<Bit> bob_sample;
    alice_sample.reserve(sample_size);
    bob_sample.reserve(sample_size);

    std::vector<Bit> alice_remaining;
    std::vector<Bit> bob_remaining;
    alice_remaining.reserve(result.sifted_bits - sample_size);
    bob_remaining.reserve(result.sifted_bits - sample_size);

    SecureRandom rng;
    for (size_t i = 0; i < result.sifted_bits; ++i) {
        size_t remaining_needed = sample_size - alice_sample.size();
        size_t remaining_total = result.sifted_bits - i;
        
        bool choose_sample = false;
        if (remaining_needed > 0) {
            if (remaining_needed >= remaining_total || rng.uniform_probability() < (double)remaining_needed / remaining_total) {
                choose_sample = true;
            }
        }

        if (choose_sample) {
            alice_sample.push_back(sifted.alice_bits[i]);
            bob_sample.push_back(sifted.bob_bits[i]);
        } else {
            alice_remaining.push_back(sifted.alice_bits[i]);
            bob_remaining.push_back(sifted.bob_bits[i]);
        }
    }

    result.qber = calculate_qber(alice_sample, bob_sample);

    if (result.qber > config.qber_threshold) {
        result.accepted = false;
        return result;
    }

    PrototypeReconciler reconciler;
    size_t bits_revealed = 0;
    std::vector<Bit> reconciled_bob = reconciler.reconcile(
        alice_remaining,
        bob_remaining,
        bits_revealed
    );

    bool reconciliation_success = (alice_remaining == reconciled_bob);
    if (!reconciliation_success) {
        result.accepted = false;
        return result;
    }

    PrivacyAmplifier amplifier;
    result.final_key = amplifier.amplify(
        alice_remaining,
        config.final_key_bits,
        result.session_id
    );

    result.accepted = true;
    return result;
}

} // namespace qrypt::qkd
