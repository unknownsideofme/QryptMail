#pragma once
#include "bb84/bit.hpp"
#include "bb84/basis.hpp"
#include <vector>

namespace qrypt::qkd {

struct SiftedKeys {
    std::vector<Bit> alice_bits;
    std::vector<Bit> bob_bits;
    std::vector<size_t> indices;
};

SiftedKeys sift(
    const std::vector<Bit>& alice_bits,
    const std::vector<Basis>& alice_bases,
    const std::vector<Bit>& bob_bits,
    const std::vector<Basis>& bob_bases
);

} // namespace qrypt::qkd
