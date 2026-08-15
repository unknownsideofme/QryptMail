#pragma once
#include "bb84/bit.hpp"
#include <vector>

namespace qrypt::qkd {

double calculate_qber(
    const std::vector<Bit>& alice_key,
    const std::vector<Bit>& bob_key
);

} // namespace qrypt::qkd
