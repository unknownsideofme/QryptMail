#include "bb84/sifting.hpp"
#include <stdexcept>

namespace qrypt::qkd {

SiftedKeys sift(
    const std::vector<Bit>& alice_bits,
    const std::vector<Basis>& alice_bases,
    const std::vector<Bit>& bob_bits,
    const std::vector<Basis>& bob_bases
) {
    if (alice_bits.size() != alice_bases.size() ||
        bob_bits.size() != bob_bases.size() ||
        alice_bits.size() != bob_bits.size()) {
        throw std::invalid_argument("Input size mismatch in sifting step");
    }

    SiftedKeys result;
    size_t n = alice_bits.size();
    
    result.alice_bits.reserve(n / 2);
    result.bob_bits.reserve(n / 2);
    result.indices.reserve(n / 2);

    for (size_t i = 0; i < n; ++i) {
        if (alice_bases[i] == bob_bases[i]) {
            result.alice_bits.push_back(alice_bits[i]);
            result.bob_bits.push_back(bob_bits[i]);
            result.indices.push_back(i);
        }
    }

    return result;
}

} // namespace qrypt::qkd
