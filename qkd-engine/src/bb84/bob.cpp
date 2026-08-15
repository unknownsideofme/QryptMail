#include "bb84/bob.hpp"
#include "common/random.hpp"
#include <stdexcept>

namespace qrypt::qkd {

void Bob::generate_bases(size_t num_bits) {
    bases_.clear();
    bases_.reserve(num_bits);
    SecureRandom rng;
    for (size_t i = 0; i < num_bits; ++i) {
        bases_.push_back(rng.random_basis());
    }
}

void Bob::measure(const std::vector<QuantumState>& states) {
    if (states.size() != bases_.size()) {
        throw std::invalid_argument("States count must match Bob's generated bases count");
    }

    measured_bits_.clear();
    measured_bits_.reserve(states.size());

    for (size_t i = 0; i < states.size(); ++i) {
        MeasurementResult res = qrypt::qkd::measure(states[i], bases_[i]);
        measured_bits_.push_back(res.bit);
    }
}

} // namespace qrypt::qkd
