#pragma once
#include <vector>
#include <string>
#include <cstdint>
#include <cstddef>

namespace qrypt::qkd {

struct QKDResult {
    bool accepted = false;
    double qber = 0.0;

    size_t transmitted_bits = 0;
    size_t sifted_bits = 0;

    std::vector<uint8_t> final_key;

    std::string session_id;
};

} // namespace qrypt::qkd
