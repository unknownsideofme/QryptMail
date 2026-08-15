#include "bb84/channel.hpp"
#include "bb84/eve.hpp"
#include "common/random.hpp"
#include <cmath>
#include <algorithm>

namespace qrypt::qkd {

QuantumChannel::QuantumChannel(bool eve_enabled, double noise_probability)
    : eve_enabled_(eve_enabled)
    , noise_probability_(noise_probability)
{}

static QuantumState apply_noise(const QuantumState& state, double noise_prob) {
    if (noise_prob <= 0.0) return state;

    SecureRandom rng;
    if (rng.uniform_probability() < noise_prob) {
        if (std::abs(state.alpha) > 0.9 || std::abs(state.beta) > 0.9) {
            return QuantumState{state.beta, state.alpha};
        } else {
            return QuantumState{state.alpha, -state.beta};
        }
    }
    return state;
}

std::vector<QuantumState> QuantumChannel::transmit(const std::vector<QuantumState>& states) {
    std::vector<QuantumState> transmitted;
    transmitted.reserve(states.size());

    Eve eve;
    for (const auto& state : states) {
        QuantumState current = state;

        if (eve_enabled_) {
            current = eve.intercept_resend(current);
        }

        current = apply_noise(current, noise_probability_);

        transmitted.push_back(current);
    }

    return transmitted;
}

} // namespace qrypt::qkd
