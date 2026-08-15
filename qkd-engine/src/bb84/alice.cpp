#include "bb84/alice.hpp"
#include "common/random.hpp"

namespace qrypt::qkd {

void Alice::generate(size_t num_bits) {
    bits_.clear();
    bases_.clear();
    states_.clear();

    bits_.reserve(num_bits);
    bases_.reserve(num_bits);
    states_.reserve(num_bits);

    SecureRandom rng;
    for (size_t i = 0; i < num_bits; ++i) {
        Bit b = rng.random_bit();
        Basis bas = rng.random_basis();
        bits_.push_back(b);
        bases_.push_back(bas);
        states_.push_back(encode(b, bas));
    }
}

} // namespace qrypt::qkd
