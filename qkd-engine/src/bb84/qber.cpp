#include "bb84/qber.hpp"
#include <stdexcept>

namespace qrypt::qkd {

double calculate_qber(
    const std::vector<Bit>& alice_key,
    const std::vector<Bit>& bob_key
) {
    if (alice_key.size() != bob_key.size()) {
        throw std::invalid_argument("Keys must be of the same length to calculate QBER");
    }

    if (alice_key.empty()) {
        return 0.0;
    }

    size_t mismatches = 0;
    for (size_t i = 0; i < alice_key.size(); ++i) {
        if (alice_key[i] != bob_key[i]) {
            ++mismatches;
        }
    }

    return static_cast<double>(mismatches) / static_cast<double>(alice_key.size());
}

} // namespace qrypt::qkd
