#pragma once
#include "bb84/quantum_state.hpp"
#include <vector>

namespace qrypt::qkd {

class QuantumChannel {
public:
    explicit QuantumChannel(bool eve_enabled = false, double noise_probability = 0.0);
    ~QuantumChannel() = default;

    std::vector<QuantumState> transmit(const std::vector<QuantumState>& states);

    bool eve_enabled() const { return eve_enabled_; }
    double noise_probability() const { return noise_probability_; }

private:
    bool eve_enabled_;
    double noise_probability_;
};

} // namespace qrypt::qkd
